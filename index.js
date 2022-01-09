'use strict';

function getMainArgs() {
  // This function is a placeholder for proposed process.mainArgs.
  // Work out where to slice process.argv for user supplied arguments.

  // Electron is an interested example, with work-arounds implemented in
  // Commander and Yargs. Hopefully Electron would support process.mainArgs
  // itself and render this work-around moot.
  //
  // In a bundled Electron app, the user CLI args directly
  // follow executable. (No special processing required for unbundled.)
  // 1) process.versions.electron is either set by electron, or undefined
  //    see https://github.com/electron/electron/blob/master/docs/api/process.md#processversionselectron-readonly
  // 2) process.defaultApp is undefined in a bundled Electron app, and set
  //    in an unbundled Electron app
  //    see https://github.com/electron/electron/blob/master/docs/api/process.md#processversionselectron-readonly
  // (Not included in tests as hopefully temporary example.)
  /* c8 ignore next 3 */
  if (process.versions && process.versions.electron && !process.defaultApp) {
    return process.argv.slice(1);
  }

  // Check node options for scenarios where user CLI args follow executable.
  const execArgv = process.execArgv;
  if (execArgv.includes('-e') || execArgv.includes('--eval') ||
      execArgv.includes('-p') || execArgv.includes('--print')) {
    return process.argv.slice(1);
  }

  // Normally first two arguments are executable and script, then CLI arguments
  return process.argv.slice(2);
}

function setOptionValue(parseOptions, option, value, result) {
  const multiple = parseOptions.multiples &&
    parseOptions.multiples.includes(option);
  const withValue = parseOptions.withValue &&
    parseOptions.withValue.includes(option);

  // Normal flag: !withValue && value === undefined
  // Normal value, withValue && value !== undefined
  // Special case: withValue && value === undefined
  //    store as normal for withValue with value undefined
  // Special case: !withValue && value !== undefined
  //    store as normal for withValue (and not a flag)

  // Flags
  // Only mark flags for plain flag without a value, expected or otherwise.
  const isFlag = !withValue && value === undefined;
  if (isFlag)
    result.flags[option] = true;

  // Values
  if (multiple) {
    // Always store value in array, including for flags.
    // result.values[option] starts out not present,
    // first value is added as new array [val],
    // subsequent values are pushed to existing array.
    const val = isFlag ? true : value;
    if (result.values[option] !== undefined)
      result.values[option].push(val);
    else
      result.values[option] = [val];
  } else if (!isFlag) {
    result.values[option] = value;
  }
}

const parseArgs = (
  argv = getMainArgs(),
  options = {}
) => {
  if (typeof options !== 'object' || options === null) {
    throw new Error('Whoops!');
  }
  if (options.withValue !== undefined && !Array.isArray(options.withValue)) {
    throw new Error('Whoops! options.withValue should be an array.');
  }

  const result = {
    flags: {},
    values: {},
    positionals: []
  };

  let pos = 0;
  while (pos < argv.length) {
    let arg = argv[pos];

    if (arg.startsWith('-')) {
      // Everything after a bare '--' is considered a positional argument
      // and is returned verbatim
      if (arg === '--') {
        result.positionals.push(...argv.slice(++pos));
        return result;
      } else if (arg.charAt(1) !== '-') { // Look for shortcodes: -fXzy
        throw new Error('What are we doing with shortcodes!?!');
      }

      arg = arg.slice(2); // remove leading --

      if (arg.includes('=')) {
        const index = arg.indexOf('=');
        setOptionValue(options,
                       arg.slice(0, index), arg.slice(index + 1), result);
      } else if (pos + 1 < argv.length && !argv[pos + 1].startsWith('-')) {
        // withValue option should also support setting values when '=
        // isn't used ie. both --foo=b and --foo b should work

        // If withValue option is specified, take next position argument as
        // value and then increment pos so that we don't re-evaluate that
        // arg, else set value as undefined ie. --foo b --bar c, after setting
        // b as the value for foo, evaluate --bar next and skip 'b'
        const val = options.withValue && options.withValue.includes(arg) ?
          argv[++pos] :
          undefined;
        setOptionValue(options, arg, val, result);
      } else {
        // No argument available as a value.
        setOptionValue(options, arg, undefined, result);
      }

    } else {
      // Arguments without a dash prefix are considered "positional"
      result.positionals.push(arg);
    }

    pos++;
  }

  return result;
};

module.exports = {
  parseArgs
};

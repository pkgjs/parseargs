'use strict';

function getMainArgs() {
  // This function is a placeholder for proposed process.mainArgs.
  // Work out where to slice process.argv for user supplied arguments.

  // Electron is an interested example, with work-arounds implemented in
  // Commander and Yargs. Hopefully Electron would support process.mainArgs
  // itself and render th  is work-around moot.
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
    args: {},
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

      // Any number of leading dashes are allowed
      // remove all leading dashes
      arg = arg.replace(/^-+/, '');

      if (arg.includes('=')) {
        // withValue equals(=) case
        const argParts = arg.split('=');

        result.args[argParts[0]] = true;
        // If withValue option is specified, take 2nd part after '=' as value,
        // else set value as undefined
        const val = options.withValue &&
          options.withValue.includes(argParts[0]) ?
          argParts[1] : undefined;
        // Append value to previous arg values array for case of multiples
        // option, else add to empty array
        result.values[argParts[0]] = [].concat(
          options.multiples &&
            options.multiples.includes(argParts[0]) &&
            result.values[argParts[0]] || [],
          val,
        );
      } else if (pos + 1 < argv.length && !argv[pos + 1].startsWith('-')) {
        // withValue option should also support setting values when '=
        // isn't used ie. both --foo=b and --foo b should work

        result.args[arg] = true;
        // If withValue option is specified, take next position arguement as
        // value and then increment pos so that we don't re-evaluate that
        // arg, else set value as undefined ie. --foo b --bar c, after setting
        // b as the value for foo, evaluate --bar next and skip 'b'
        const val = options.withValue && options.withValue.includes(arg) ?
          argv[++pos] :
          undefined;
        // Append value to previous arg values array for case of multiples
        // option, else add to empty array
        result.values[arg] = [].concat(
          options.multiples && options.multiples.includes(arg) &&
            result.values[arg] ?
            result.values[arg] :
            [],
          val);
      } else {
        // Cases when an arg is specified without a value, example
        // '--foo --bar' <- 'foo' and 'bar' args should be set to true and
        // shave value as undefined
        result.args[arg] = true;
        // Append undefined to previous arg values array for case of
        // multiples option, else add to empty array
        result.values[arg] = [].concat(
          options.multiples && options.multiples.includes(arg) &&
            result.values[arg] ?
            result.values[arg] :
            [],
          undefined
        );
      }

    } else {
      // Arguements without a dash prefix are considered "positional"
      result.positionals.push(arg);
    }

    pos++;
  }

  return result;
};

module.exports = {
  parseArgs
};

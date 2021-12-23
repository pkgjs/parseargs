'use strict';

function setOptionValue(parseOptions, option, value, result) {
  const multiple = parseOptions.multiples &&
    parseOptions.multiples.includes(option);
  const withValue = parseOptions.withValue &&
    parseOptions.withValue.includes(option);
  const isFlag = !withValue && value === undefined;

  // Normal flag: !withValue && value === undefined
  // Normal value, withValue && value !== undefined
  // Special case: withValue && value === undefined, store undefined not flag
  // Special case: !withValue && value !== undefined, store value not flag

  // Flags
  // Only mark flags for plain flag without a value, expected or otherwise.
  if (isFlag)
    result.flags[option] = true;

  // Values
  if (multiple) {
    // Always store value in array, including for flags.
    const val = isFlag ? true : value;
    if (result.values[option])
      result.values[option].concat(val);
    else
      result.values[option] = [val];
  } else if (!isFlag) {
    result.values[option] = value;
  }
}

const parseArgs = (
  argv = process.argv.slice(require.main ? 2 : 1),
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
        setOptionValue(options, arg.slice(0, index), arg.slice(index + 1), result);
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

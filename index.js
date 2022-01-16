'use strict';

const {
  ArrayIsArray,
  ArrayPrototypeConcat,
  ArrayPrototypeIncludes,
  ArrayPrototypeSlice,
  ArrayPrototypePush,
  StringPrototypeCharAt,
  StringPrototypeIncludes,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
} = require('./primordials');

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
    return ArrayPrototypeSlice(process.argv, 1);
  }

  // Check node options for scenarios where user CLI args follow executable.
  const execArgv = process.execArgv;
  if (StringPrototypeIncludes(execArgv, '-e') ||
      StringPrototypeIncludes(execArgv, '--eval') ||
      StringPrototypeIncludes(execArgv, '-p') ||
      StringPrototypeIncludes(execArgv, '--print')) {
    return ArrayPrototypeSlice(process.argv, 1);
  }

  // Normally first two arguments are executable and script, then CLI arguments
  return ArrayPrototypeSlice(process.argv, 2);
}

const parseArgs = (
  argv = getMainArgs(),
  options = {}
) => {
  if (typeof options !== 'object' || options === null) {
    throw new Error('Whoops!');
  }
  if (options.withValue !== undefined && !ArrayIsArray(options.withValue)) {
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

    if (StringPrototypeStartsWith(arg, '-')) {
      // Everything after a bare '--' is considered a positional argument
      // and is returned verbatim
      if (arg === '--') {
        result.positionals = ArrayPrototypeConcat(
          result.positionals,
          ArrayPrototypeSlice(argv, ++pos)
        );
        return result;
      } else if (
        StringPrototypeCharAt(arg, 1) !== '-'
      ) { // Look for shortcodes: -fXzy
        throw new Error('What are we doing with shortcodes!?!');
      }

      arg = StringPrototypeSlice(arg, 2); // remove leading --

      if (StringPrototypeIncludes(arg, '=')) {
        // withValue equals(=) case
        const argParts = StringPrototypeSplit(arg, '=');

        result.flags[argParts[0]] = true;
        // If withValue option is specified, take 2nd part after '=' as value,
        // else set value as undefined
        const val = options.withValue &&
          ArrayPrototypeIncludes(options.withValue, argParts[0]) ?
          argParts[1] : undefined;
        // Append value to previous values array for case of multiples
        // option, else add to empty array
        result.values[argParts[0]] = ArrayPrototypeConcat([],
                                                          options.multiples &&
            ArrayPrototypeIncludes(options.multiples, argParts[0]) &&
            result.values[argParts[0]] || [],
                                                          val,
        );
      } else if (pos + 1 < argv.length &&
        !StringPrototypeStartsWith(argv[pos + 1], '-')
      ) {
        // withValue option should also support setting values when '=
        // isn't used ie. both --foo=b and --foo b should work

        result.flags[arg] = true;
        // If withValue option is specified, take next position arguement as
        // value and then increment pos so that we don't re-evaluate that
        // arg, else set value as undefined ie. --foo b --bar c, after setting
        // b as the value for foo, evaluate --bar next and skip 'b'
        const val = options.withValue &&
          ArrayPrototypeIncludes(options.withValue, arg) ? argv[++pos] :
          undefined;
        // Append value to previous values array for case of multiples
        // option, else add to empty array
        result.values[arg] = ArrayPrototypeConcat(
          [],
          options.multiples &&
          ArrayPrototypeIncludes(options.multiples, arg) &&
          result.values[arg] ||
          [],
          val
        );
      } else {
        // Cases when an arg is specified without a value, example
        // '--foo --bar' <- 'foo' and 'bar' flags should be set to true and
        // shave value as undefined
        result.flags[arg] = true;
        // Append undefined to previous values array for case of
        // multiples option, else add to empty array
        result.values[arg] = ArrayPrototypeConcat(
          [],
          options.multiples &&
          ArrayPrototypeIncludes(options.multiples, arg) &&
          result.values[arg] ||
          [],
          undefined
        );
      }

    } else {
      // Arguements without a dash prefix are considered "positional"
      ArrayPrototypePush(result.positionals, arg);
    }

    pos++;
  }

  return result;
};

module.exports = {
  parseArgs
};

'use strict';

const {
  ArrayPrototypeConcat,
  ArrayPrototypeSlice,
  ArrayPrototypeSplice,
  ArrayPrototypePush,
  ObjectHasOwn,
  ObjectEntries,
  StringPrototypeCharAt,
  StringPrototypeIncludes,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
} = require('./primordials');

const {
  validateArray,
  validateObject,
  validateString,
  validateBoolean,
} = require('./validators');

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

function storeOptionValue(options, arg, value, result) {
  const option = options[arg] || {};

  // Flags
  result.flags[arg] = true;

  // Values
  if (option.multiples) {
    // Always store value in array, including for flags.
    // result.values[arg] starts out not present,
    // first value is added as new array [newValue],
    // subsequent values are pushed to existing array.
    const usedAsFlag = value === undefined;
    const newValue = usedAsFlag ? true : value;
    if (result.values[arg] !== undefined)
      ArrayPrototypePush(result.values[arg], newValue);
    else
      result.values[arg] = [newValue];
  } else {
    result.values[arg] = value;
  }
}

const parseArgs = ({
  args = getMainArgs(),
  options = {}
} = {}) => {
  validateArray(args, 'args');
  validateObject(options, 'options');
  for (const [arg, option] of ObjectEntries(options)) {
    validateObject(option, `options.${arg}`);

    if (ObjectHasOwn(option, 'short')) {
      validateString(option.short, `options.${arg}.short`);
    }

    for (const config of ['withValue', 'multiples']) {
      if (ObjectHasOwn(option, config)) {
        validateBoolean(option[config], `options.${arg}.${config}`);
      }
    }
  }

  const result = {
    flags: {},
    values: {},
    positionals: []
  };

  let pos = 0;
  while (pos < args.length) {
    let arg = args[pos];

    if (StringPrototypeStartsWith(arg, '-')) {
      // e.g. `arg` is:
      // '-' | '--' | '-f' | '-fo' | '--foo' | '-f=bar' | '--for=bar'
      if (arg === '-') {
        // e.g. `arg` is: '-'
        // '-' commonly used to represent stdin/stdout, treat as positional
        result.positionals = ArrayPrototypeConcat(result.positionals, '-');
        ++pos;
        continue;
      } else if (arg === '--') {
        // e.g. `arg` is: '--'
        // Everything after a bare '--' is considered a positional argument
        // and is returned verbatim
        result.positionals = ArrayPrototypeConcat(
          result.positionals,
          ArrayPrototypeSlice(args, ++pos)
        );
        return result;
      } else if (StringPrototypeCharAt(arg, 1) !== '-') {
        // e.g. `arg` is: '-f' | '-foo' | '-f=bar'
        // Look for shortcodes: -fXzy and expand them to -f -X -z -y:
        if (arg.length > 2) {
          // `arg` is '-foo'
          for (let i = 2; i < arg.length; i++) {
            const short = StringPrototypeCharAt(arg, i);
            // Add 'i' to 'pos' such that short options are parsed in order
            // of definition:
            ArrayPrototypeSplice(args, pos + (i - 1), 0, `-${short}`);
          }
        }

        arg = StringPrototypeCharAt(arg, 1); // short
        for (const [longName, option] of ObjectEntries(options)) {
          if (option.short === arg) {
            arg = longName;
            break;
          }
        }
        // ToDo: later code tests for `=` in arg and wrong for shorts
      } else {
        arg = StringPrototypeSlice(arg, 2); // remove leading --
      }

      if (StringPrototypeIncludes(arg, '=')) {
        // e.g. `arg` is: 'for=bar' | 'foo=bar=baz'
        // Store option=value same way independent of `withValue` as:
        // - looks like a value, store as a value
        // - match the intention of the user
        // - preserve information for author to process further
        const index = StringPrototypeIndexOf(arg, '=');
        storeOptionValue(
          options,
          StringPrototypeSlice(arg, 0, index),
          StringPrototypeSlice(arg, index + 1),
          result);
      } else if (pos + 1 < args.length &&
        !StringPrototypeStartsWith(args[pos + 1], '-')
      ) {
        // If next arg is NOT a flag, check if the current arg is
        // is configured to use `withValue` and store the next arg.

        // withValue option should also support setting values when '=
        // isn't used ie. both --foo=b and --foo b should work

        // If withValue option is specified, take next position argument as
        // value and then increment pos so that we don't re-evaluate that
        // arg, else set value as undefined ie. --foo b --bar c, after setting
        // b as the value for foo, evaluate --bar next and skip 'b'
        const val = options[arg] && options[arg].withValue ?
          args[++pos] :
          undefined;
        storeOptionValue(options, arg, val, result);
      } else {
        // Cases when an arg is specified without a value, example
        // '--foo --bar' <- 'foo' and 'bar' flags should be set to true and
        // shave value as undefined
        storeOptionValue(options, arg, undefined, result);
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

'use strict';

const {
  ArrayPrototypeConcat,
  ArrayPrototypeForEach,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypePush,
  ObjectPrototypeHasOwnProperty: ObjectHasOwn,
  ObjectEntries,
  StringPrototypeCharAt,
  StringPrototypeIncludes,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
} = require('./primordials');

const {
  validateArray,
  validateObject,
  validateString,
  validateUnion,
  validateBoolean,
} = require('./validators');

const {
  findLongOptionForShort,
  isLoneLongOption,
  isLoneShortOption,
  isLongOptionAndValue,
  isOptionValue,
  isShortOptionAndValue,
  isShortOptionGroup,
  objectGetOwn,
  optionsGetOwn
} = require('./utils');

const {
  codes: {
    ERR_INVALID_ARG_VALUE,
    ERR_PARSE_ARGS_INVALID_OPTION_VALUE,
    ERR_PARSE_ARGS_UNKNOWN_OPTION,
  },
} = require('./errors');

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

function checkOptionUsage(longOption, optionValue, options,
                          shortOrLong, strict) {
  // Strict and options are used from local context.
  if (!strict) return;

  if (!ObjectHasOwn(options, longOption)) {
    throw new ERR_PARSE_ARGS_UNKNOWN_OPTION(shortOrLong);
  }

  const short = optionsGetOwn(options, longOption, 'short');
  const shortAndLong = short ? `-${short}, --${longOption}` : `--${longOption}`;
  const type = optionsGetOwn(options, longOption, 'type');
  if (type === 'string' && typeof optionValue !== 'string') {
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(`Option '${shortAndLong} <value>' argument missing`);
  }
  // (Idiomatic test for undefined||null, expecting undefined.)
  if (type === 'boolean' && optionValue != null) {
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(`Option '${shortAndLong}' does not take an argument`);
  }
}

function storeOption(longOption, optionValue, options, values) {
  if (longOption === '__proto__') {
    return;
  }
  // We store based on the option value rather than option type,
  // preserving the users intent for author to deal with.
  const newValue = optionValue ?? true;
  if (optionsGetOwn(options, longOption, 'multiple')) {
    // Always store value in array, including for boolean.
    // values[longOption] starts out not present,
    // first value is added as new array [newValue],
    // subsequent values are pushed to existing array.
    if (ObjectHasOwn(values, longOption)) {
      ArrayPrototypePush(values[longOption], newValue);
    } else {
      values[longOption] = [newValue];
    }
  } else {
    values[longOption] = newValue;
  }
}

const parseArgs = (config = { __proto__: null }) => {
  const args = objectGetOwn(config, 'args') ?? getMainArgs();
  const strict = objectGetOwn(config, 'strict') ?? true;
  const options = objectGetOwn(config, 'options') ?? { __proto__: null };

  // Validate input configuration.
  validateArray(args, 'args');
  validateBoolean(strict, 'strict');
  validateObject(options, 'options');
  ArrayPrototypeForEach(
    ObjectEntries(options),
    ({ 0: longOption, 1: optionConfig }) => {
      validateObject(optionConfig, `options.${longOption}`);

      // type is required
      validateUnion(objectGetOwn(optionConfig, 'type'), `options.${longOption}.type`, ['string', 'boolean']);

      if (ObjectHasOwn(optionConfig, 'short')) {
        const shortOption = optionConfig.short;
        validateString(shortOption, `options.${longOption}.short`);
        if (shortOption.length !== 1) {
          throw new ERR_INVALID_ARG_VALUE(
            `options.${longOption}.short`,
            shortOption,
            'must be a single character'
          );
        }
      }

      if (ObjectHasOwn(optionConfig, 'multiple')) {
        validateBoolean(optionConfig.multiple, `options.${longOption}.multiple`);
      }
    }
  );

  const result = {
    values: {},
    positionals: []
  };

  let remainingArgs = ArrayPrototypeSlice(args);
  while (remainingArgs.length > 0) {
    const arg = ArrayPrototypeShift(remainingArgs);
    const nextArg = remainingArgs[0];

    // Check if `arg` is an options terminator.
    // Guideline 10 in https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
    if (arg === '--') {
      // Everything after a bare '--' is considered a positional argument.
      result.positionals = ArrayPrototypeConcat(
        result.positionals,
        remainingArgs
      );
      break; // Finished processing args, leave while loop.
    }

    if (isLoneShortOption(arg)) {
      // e.g. '-f'
      const shortOption = StringPrototypeCharAt(arg, 1);
      const longOption = findLongOptionForShort(shortOption, options);
      let optionValue;
      if (optionsGetOwn(options, longOption, 'type') === 'string' &&
          isOptionValue(nextArg)) {
        // e.g. '-f', 'bar'
        optionValue = ArrayPrototypeShift(remainingArgs);
      }
      checkOptionUsage(longOption, optionValue, options, arg, strict);
      storeOption(longOption, optionValue, options, result.values);
      continue;
    }

    if (isShortOptionGroup(arg, options)) {
      // Expand -fXzy to -f -X -z -y
      const expanded = [];
      for (let index = 1; index < arg.length; index++) {
        const shortOption = StringPrototypeCharAt(arg, index);
        const longOption = findLongOptionForShort(shortOption, options);
        if (optionsGetOwn(options, longOption, 'type') !== 'string' ||
          index === arg.length - 1) {
          // Boolean option, or last short in group. Well formed.
          ArrayPrototypePush(expanded, `-${shortOption}`);
        } else {
          // String option in middle. Yuck.
          // Expand -abfFILE to -a -b -fFILE
          ArrayPrototypePush(expanded, `-${StringPrototypeSlice(arg, index)}`);
          break; // finished short group
        }
      }
      remainingArgs = ArrayPrototypeConcat(expanded, remainingArgs);
      continue;
    }

    if (isShortOptionAndValue(arg, options)) {
      // e.g. -fFILE
      const shortOption = StringPrototypeCharAt(arg, 1);
      const longOption = findLongOptionForShort(shortOption, options);
      const optionValue = StringPrototypeSlice(arg, 2);
      checkOptionUsage(longOption, optionValue, options, `-${shortOption}`, strict);
      storeOption(longOption, optionValue, options, result.values);
      continue;
    }

    if (isLoneLongOption(arg)) {
      // e.g. '--foo'
      const longOption = StringPrototypeSlice(arg, 2);
      let optionValue;
      if (optionsGetOwn(options, longOption, 'type') === 'string' &&
          isOptionValue(nextArg)) {
        // e.g. '--foo', 'bar'
        optionValue = ArrayPrototypeShift(remainingArgs);
      }
      checkOptionUsage(longOption, optionValue, options, arg, strict);
      storeOption(longOption, optionValue, options, result.values);
      continue;
    }

    if (isLongOptionAndValue(arg)) {
      // e.g. --foo=bar
      const index = StringPrototypeIndexOf(arg, '=');
      const longOption = StringPrototypeSlice(arg, 2, index);
      const optionValue = StringPrototypeSlice(arg, index + 1);
      checkOptionUsage(longOption, optionValue, options, `--${longOption}`, strict);
      storeOption(longOption, optionValue, options, result.values);
      continue;
    }

    // Anything left is a positional
    ArrayPrototypePush(result.positionals, arg);
  }

  return result;
};

module.exports = {
  parseArgs
};

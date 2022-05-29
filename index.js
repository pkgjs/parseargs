'use strict';

const {
  ArrayPrototypeConcat,
  ArrayPrototypeForEach,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypePush,
  ObjectEntries,
  ObjectPrototypeHasOwnProperty: ObjectHasOwn,
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
  isOptionLikeValue,
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
    ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL,
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

/**
 * In strict mode, throw for possible usage errors like --foo --bar
 *
 * @param {object} config - from config passed to parseArgs
 * @param {object} element- array item from parseElements returned by parseArgs
 */
function checkOptionLikeValue(config, element) {
  if (config.strict && (element.inlineValue === false) &&
    isOptionLikeValue(element.value)) {
    // Only show short example if user used short option.
    const short = optionsGetOwn(config.options, element.optionName, 'short');
    const example = (element.isShort ?? short) ?
      `'--${element.optionName}=-XYZ' or '-${short}-XYZ'` :
      `'--${element.optionName}=-XYZ'`;
    const arg = config.args[element.argIndex];
    const errorMessage = `Option '${arg}' argument is ambiguous.
Did you forget to specify the option argument for '${arg}'?
To specify an option argument starting with a dash use ${example}.`;
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(errorMessage);
  }
}

/**
 * In strict mode, throw for usage errors.
 *
 * @param {object} config - from config passed to parseArgs
 * @param {object} element- array item from parseElements returned by parseArgs
 */
function checkOptionUsage(config, element) {
  if (!config.strict) return;

  if (!ObjectHasOwn(config.options, element.optionName)) {
    const optionUsed = element.isShort ? `-${element.optionName}` : `--${element.optionName}`;
    // eslint-disable-next-line max-len
    throw new ERR_PARSE_ARGS_UNKNOWN_OPTION(optionUsed, config.allowPositionals);
  }

  const short = optionsGetOwn(config.options, element.optionName, 'short');
  const shortAndLong = `${short ? `-${short}, ` : ''}--${element.optionName}`;
  const type = optionsGetOwn(config.options, element.optionName, 'type');
  if (type === 'string' && typeof element.value !== 'string') {
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(`Option '${shortAndLong} <value>' argument missing`);
  }
  // (Idiomatic test for undefined||null, expecting undefined.)
  if (type === 'boolean' && element.value != null) {
    throw new ERR_PARSE_ARGS_INVALID_OPTION_VALUE(`Option '${shortAndLong}' does not take an argument`);
  }
}


/**
 * Store the option value in `values`.
 *
 * @param {string} optionName - long option name e.g. 'foo'
 * @param {string|undefined} optionValue - value from user args
 * @param {object} options - option configs, from parseArgs({ options })
 * @param {object} values - option values returned in `values` by parseArgs
 */
function storeOption(optionName, optionValue, options, values) {
  if (optionName === '__proto__') {
    return; // No. Just no.
  }

  // We store based on the option value rather than option type,
  // preserving the users intent for author to deal with.
  const newValue = optionValue ?? true;
  if (optionsGetOwn(options, optionName, 'multiple')) {
    // Always store value in array, including for boolean.
    // values[optionName] starts out not present,
    // first value is added as new array [newValue],
    // subsequent values are pushed to existing array.
    // (note: values has null prototype, so simpler usage)
    if (values[optionName]) {
      ArrayPrototypePush(values[optionName], newValue);
    } else {
      values[optionName] = [newValue];
    }
  } else {
    values[optionName] = newValue;
  }
}

const parseArgs = (config = { __proto__: null }) => {
  const args = objectGetOwn(config, 'args') ?? getMainArgs();
  const strict = objectGetOwn(config, 'strict') ?? true;
  const allowPositionals = objectGetOwn(config, 'allowPositionals') ?? !strict;
  const options = objectGetOwn(config, 'options') ?? { __proto__: null };
  const parseConfig = { args, strict, options, allowPositionals };

  // Validate input configuration.
  validateArray(args, 'args');
  validateBoolean(strict, 'strict');
  validateBoolean(allowPositionals, 'allowPositionals');
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
    values: { __proto__: null },
    positionals: [],
    // parseElements: [],
  };
  const elements = []; // result.parseElements;
  let argIndex = -1;
  let groupCount = 0;

  let remainingArgs = ArrayPrototypeSlice(args);
  while (remainingArgs.length > 0) {
    const arg = ArrayPrototypeShift(remainingArgs);
    const nextArg = remainingArgs[0];
    if (groupCount > 0)
      groupCount--;
    else
      argIndex++;

    // Check if `arg` is an options terminator.
    // Guideline 10 in https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
    if (arg === '--') {
      // Everything after a bare '--' is considered a positional argument.
      result.positionals = ArrayPrototypeConcat(
        result.positionals,
        remainingArgs
      );
      elements.push({ kind: 'option-terminator', argIndex });
      remainingArgs.forEach((arg) =>
        elements.push({ kind: 'positional',
                        value: arg, argIndex: ++argIndex }));
      break; // Finished processing args, leave while loop.
    }

    if (isLoneShortOption(arg)) {
      // e.g. '-f'
      const shortOption = StringPrototypeCharAt(arg, 1);
      const optionName = findLongOptionForShort(shortOption, options);
      let value;
      let inlineValue;
      if (optionsGetOwn(options, optionName, 'type') === 'string' &&
          isOptionValue(nextArg)) {
        // e.g. '-f', 'bar'
        value = ArrayPrototypeShift(remainingArgs);
        inlineValue = false;
      }
      elements.push({ kind: 'option', optionName,
                      isShort: true, argIndex,
                      value, inlineValue });
      continue;
    }

    if (isShortOptionGroup(arg, options)) {
      // Expand -fXzy to -f -X -z -y
      const expanded = [];
      for (let index = 1; index < arg.length; index++) {
        const shortOption = StringPrototypeCharAt(arg, index);
        const optionName = findLongOptionForShort(shortOption, options);
        if (optionsGetOwn(options, optionName, 'type') !== 'string' ||
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
      groupCount = expanded.length;
      continue;
    }

    if (isShortOptionAndValue(arg, options)) {
      // e.g. -fFILE
      const shortOption = StringPrototypeCharAt(arg, 1);
      const optionName = findLongOptionForShort(shortOption, options);
      const value = StringPrototypeSlice(arg, 2);
      elements.push({ kind: 'option', optionName,
                      isShort: true, argIndex,
                      value, inlineValue: true });
      continue;
    }

    if (isLoneLongOption(arg)) {
      // e.g. '--foo'
      const optionName = StringPrototypeSlice(arg, 2);
      let value;
      let inlineValue;
      if (optionsGetOwn(options, optionName, 'type') === 'string' &&
          isOptionValue(nextArg)) {
        // e.g. '--foo', 'bar'
        value = ArrayPrototypeShift(remainingArgs);
        inlineValue = false;
      }
      elements.push({ kind: 'option', optionName,
                      isShort: false, argIndex,
                      value, inlineValue });
      continue;
    }

    if (isLongOptionAndValue(arg)) {
      // e.g. --foo=bar
      const index = StringPrototypeIndexOf(arg, '=');
      const optionName = StringPrototypeSlice(arg, 2, index);
      const value = StringPrototypeSlice(arg, index + 1);
      elements.push({ kind: 'option', optionName,
                      isShort: false, argIndex,
                      value, inlineValue: true });
      continue;
    }

    ArrayPrototypePush(result.positionals, arg);
    elements.push({ kind: 'positional', value: arg, argIndex });
  }

  elements.forEach((element) => {
    switch (element.kind) {
      case 'option-terminator':
        break;
      case 'positional':
        if (!allowPositionals)
          throw new ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL(element.value);
        break;
      case 'option':
        checkOptionUsage(parseConfig, element);
        checkOptionLikeValue(parseConfig, element);
        storeOption(element.optionName, element.value, options, result.values);
        break;
    }
  });

  return result;
};

module.exports = {
  parseArgs
};

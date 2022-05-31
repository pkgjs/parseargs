'use strict';

const {
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  ArrayPrototypePush,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypeUnshiftApply,
  ObjectEntries,
  ObjectPrototypeHasOwnProperty: ObjectHasOwn,
  StringPrototypeCharAt,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
} = require('./primordials');

const {
  validateArray,
  validateBoolean,
  validateObject,
  validateString,
  validateUnion,
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
  optionsGetOwn,
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
  // Work out where to slice process.argv for user supplied arguments.

  // Check node options for scenarios where user CLI args follow executable.
  const execArgv = process.execArgv;
  if (ArrayPrototypeIncludes(execArgv, '-e') ||
      ArrayPrototypeIncludes(execArgv, '--eval') ||
      ArrayPrototypeIncludes(execArgv, '-p') ||
      ArrayPrototypeIncludes(execArgv, '--print')) {
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
  if (config.strict && (element.kind === 'option') &&
    !element.inlineValue && isOptionLikeValue(element.value)) {
    // Only show short example if user used short option.
    const example = StringPrototypeStartsWith(element.optionUsed, '--') ?
      `'${element.optionUsed}=-XYZ'` :
      `'--${element.optionName}=-XYZ' or '${element.optionUsed}-XYZ'`;
    const errorMessage = `Option '${element.optionUsed}' argument is ambiguous.
Did you forget to specify the option argument for '${element.optionUsed}'?
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
    throw new ERR_PARSE_ARGS_UNKNOWN_OPTION(
      element.optionUsed, config.allowPositionals);
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

/**
 * Process args and turn into identified tokens:
 * - option (along with value, if any)
 * - positional
 * - option-terminator
 *
 * @param {string[]} args, from parseArgs({ args }) or mainArgs
 * @param {object} options - option configs, from parseArgs({ options })
 */
function argsToTokens(args, options) {
  const tokens = [];
  let index = -1;
  let groupCount = 0;

  const remainingArgs = ArrayPrototypeSlice(args);
  while (remainingArgs.length > 0) {
    const arg = ArrayPrototypeShift(remainingArgs);
    const nextArg = remainingArgs[0];
    if (groupCount > 0)
      groupCount--;
    else
      index++;

    // Check if `arg` is an options terminator.
    // Guideline 10 in https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
    if (arg === '--') {
      // Everything after a bare '--' is considered a positional argument.
      ArrayPrototypePush(tokens, { kind: 'option-terminator', index });
      ArrayPrototypeForEach(remainingArgs, (arg) =>
        ArrayPrototypePush(
          tokens,
          { kind: 'positional', index: ++index, value: arg }));
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
      ArrayPrototypePush(
        tokens,
        { kind: 'option', optionName, optionUsed: arg,
          index, value, inlineValue });
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
      ArrayPrototypeUnshiftApply(remainingArgs, expanded);
      groupCount = expanded.length;
      continue;
    }

    if (isShortOptionAndValue(arg, options)) {
      // e.g. -fFILE
      const shortOption = StringPrototypeCharAt(arg, 1);
      const optionName = findLongOptionForShort(shortOption, options);
      const value = StringPrototypeSlice(arg, 2);
      ArrayPrototypePush(
        tokens,
        { kind: 'option', optionName, optionUsed: `-${shortOption}`,
          index, value, inlineValue: true });
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
      ArrayPrototypePush(
        tokens,
        { kind: 'option', optionName, optionUsed: arg,
          index, value, inlineValue });
      continue;
    }

    if (isLongOptionAndValue(arg)) {
      // e.g. --foo=bar
      const equalIndex = StringPrototypeIndexOf(arg, '=');
      const optionName = StringPrototypeSlice(arg, 2, equalIndex);
      const value = StringPrototypeSlice(arg, equalIndex + 1);
      ArrayPrototypePush(
        tokens,
        { kind: 'option', optionName, optionUsed: `--${optionName}`,
          index, value, inlineValue: true });
      continue;
    }

    ArrayPrototypePush(tokens, { kind: 'positional', index, value: arg });
  }
  return tokens;
}

const parseArgs = (config = { __proto__: null }) => {
  const args = objectGetOwn(config, 'args') ?? getMainArgs();
  const strict = objectGetOwn(config, 'strict') ?? true;
  const allowPositionals = objectGetOwn(config, 'allowPositionals') ?? !strict;
  const options = objectGetOwn(config, 'options') ?? { __proto__: null };
  // Bundle these up for passing to strict-mode checks.
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

  // Phase 1: identify tokens
  const tokens = argsToTokens(args, options);

  // Phase 2: process tokens into parsed option values and positionals
  const result = {
    values: { __proto__: null },
    positionals: [],
    tokens,
  };
  ArrayPrototypeForEach(tokens, (token) => {
    switch (token.kind) {
      case 'option-terminator':
        break;
      case 'positional':
        if (!allowPositionals) {
          throw new ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL(token.value);
        }
        ArrayPrototypePush(result.positionals, token.value);
        break;
      case 'option':
        checkOptionUsage(parseConfig, token);
        checkOptionLikeValue(parseConfig, token);
        storeOption(token.optionName, token.value, options, result.values);
        break;
    }
  });

  return result;
};

module.exports = {
  parseArgs,
};

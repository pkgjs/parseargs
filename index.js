'use strict';

const {
  ArrayPrototypeConcat,
  ArrayPrototypeIncludes,
  ArrayPrototypeMap,
  ArrayPrototypeSlice,
  ArrayPrototypeSplice,
  ArrayPrototypePush,
  ObjectHasOwn,
  StringPrototypeCharAt,
  StringPrototypeIncludes,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  StringPrototypeStartsWith,
} = require('./primordials');

const {
  validateArray,
  validateObject
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

function storeOptionValue(option, value, parseOptions, result) {
  const multiple = parseOptions.multiples &&
    ArrayPrototypeIncludes(parseOptions.multiples, option);

  // Flags
  result.flags[option] = true;

  // Values
  if (multiple) {
    // Always store value in array, including for flags.
    // result.values[option] starts out not present,
    // first value is added as new array [newValue],
    // subsequent values are pushed to existing array.
    const usedAsFlag = value === undefined;
    const newValue = usedAsFlag ? true : value;
    if (result.values[option] !== undefined)
      ArrayPrototypePush(result.values[option], newValue);
    else
      result.values[option] = [newValue];
  } else {
    result.values[option] = value;
  }
}

const parseArgs = (
  argv = getMainArgs(),
  options = {}
) => {
  validateArray(argv, 'argv');
  validateObject(options, 'options');
  for (const key of ['withValue', 'multiples']) {
    if (ObjectHasOwn(options, key)) {
      validateArray(options[key], `options.${key}`);
    }
  }

  const result = {
    flags: {},
    values: {},
    positionals: []
  };

  let pos = 0;
  while (pos < argv.length) {
    const arg = argv[pos];
    const nextArg = argv[pos + 1];

    // Check if `arg` is an options terminator.
    // Guideline 10 in https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
    if (arg === '--') {
      // Everything after a bare '--' is considered a positional argument.
      result.positionals = ArrayPrototypeConcat(
        result.positionals,
        ArrayPrototypeSlice(argv, pos + 1)
      );
      break; // Finished processing argv, leave while loop.
    }

    if (isLoneShortOption(arg)) {
      // e.g. '-f'
      const optionKey = getOptionKey(StringPrototypeCharAt(arg, 1), options);
      let optionValue;
      if (isExpectingValue(optionKey, options) && isOptionValue(nextArg)) {
        // e.g. '-f' 'bar'
        optionValue = nextArg;
        pos++;
      }
      storeOptionValue(optionKey, optionValue, options, result);
      pos++;
      continue;
    }

    if (isShortOptionGroup(arg, options)) {
      // Expand -fXzy to -f -X -z -y
      const expanded = ArrayPrototypeMap(StringPrototypeSlice(arg, 1), (char) => `-${char}`);
      // Replace group with expansion.
      ArrayPrototypeSplice(argv, pos, 1, ...expanded);
      continue;
    }

    if (isLongOption(arg)) {
      let optionKey;
      let optionValue;
      if (StringPrototypeIncludes(arg, '=')) {
        // e.g. '--foo=bar'
        const index = StringPrototypeIndexOf(arg, '=');
        optionKey = StringPrototypeSlice(arg, 2, index);
        optionValue = StringPrototypeSlice(arg, index + 1);
      } else {
        // e.g. '--foo'
        optionKey = StringPrototypeSlice(arg, 2);
        if (isExpectingValue(optionKey, options) && isOptionValue(nextArg)) {
          // e.g. '--foo' 'bar'
          optionValue = nextArg;
          pos++;
        }
      }
      storeOptionValue(optionKey, optionValue, options, result);
      pos++;
      continue;
    }

    // Anything that did not get handled above is a positional.
    ArrayPrototypePush(result.positionals, arg);
    pos++;
  }

  return result;
};

/**
  * Determines if `arg` is a just a short option.
  * @example '-f'
  */
function isLoneShortOption(arg) {
  return arg.length === 2 &&
    StringPrototypeCharAt(arg, 0) === '-' &&
    StringPrototypeCharAt(arg, 1) !== '-';
}

/**
  * Determines if `arg` is a short option group.
  *
  * See Guideline 5 of the [Open Group Utility Conventions](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html).
  *   One or more options without option-arguments, followed by at most one
  *   option that takes an option-argument, should be accepted when grouped
  *   behind one '-' delimiter.
  * @example
  * isShortOptionGroup('-a', {}) // returns false
  * isShortOptionGroup('-ab', {}) // returns true
  * isShortOptionGroup('-fb', { withValue: ['f'] }) // returns false
  * isShortOptionGroup('-bf', { withValue: ['f'] }) // returns true
  */
function isShortOptionGroup(arg, options) {
  if (arg.length <= 2) return false;
  if (StringPrototypeCharAt(arg, 0) !== '-') return false;
  if (StringPrototypeCharAt(arg, 1) === '-') return false;

  const onlyFlags = arg.slice(1, -1);
  for (let index = 0; index < onlyFlags.length; index++) {
    const optionKey = getOptionKey(StringPrototypeCharAt(onlyFlags, index));
    if (isExpectingValue(optionKey, options)) {
      return false;
    }
  }
  return true;
}

/**
  * Determines if `arg` is a long option, which may have a trailing value.
  * @example
  * isLongOption('-a) // returns false
  * isLongOption('--foo) // returns true
  * isLongOption('--foo=bar) // returns true
  */
function isLongOption(arg) {
  return arg.length > 2 && StringPrototypeStartsWith(arg, '--');
}

/**
  * Expand known short options into long, otherwise return original.
  * @example
  * getOptionKey('f', { short: { f: 'file'}}) // returns 'file'
  * getOptionKey('b', {}) // returns 'b'
  * getOptionKey('long-option', {}) // returns 'long-option'
  */
function getOptionKey(option, options) {
  if (option.length === 1 && options?.short?.[option]) {
    return options.short[option]; // long option
  }
  return option;
}

/**
 * Determines if the option is expecting a value.
 */
function isExpectingValue(optionKey, options) {
  return options && options.withValue &&
    ArrayPrototypeIncludes(options.withValue, optionKey);
}

/**
  * Determines if the argument can be used as an option value.
  * NB: We are choosing not to accept option-ish arguments.
  * @example
  * isOptionValue('V']) // returns true
  * isOptionValue('-v') // returns false
  * isOptionValue('--foo') // returns false
  * isOptionValue(undefined) // returns false
  */
function isOptionValue(value) {
  if (value === undefined) return false;
  if (value === '-') return true; // e.g. representing stdin/stdout for file

  // Open Group Utility Conventions are that an option-argument may start
  // with a dash, but we are currentlly rejecting these and prioritising the
  // option-like appearance of the argument. Rejection allows error detection
  // if strict:true, but comes at the cost of rejecting intended values starting
  // with a dash, especially negative numbers.
  return !StringPrototypeStartsWith(value, '-');
}

module.exports = {
  parseArgs
};

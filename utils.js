'use strict';

const {
  ArrayPrototypeFind,
  ObjectEntries,
  StringPrototypeCharAt,
  StringPrototypeIncludes,
  StringPrototypeStartsWith,
} = require('./primordials');

// These are internal utilities to make the parsing logic easier to read, and
// add lots of detail for the curious. They are in a separate file to allow
// unit testing, although that is not essential (this could be rolled into
// main file and just tested implicitly via API).
//
// These routines are for internal use, not for export to client.

/**
 * Determines if the argument may be used as an option value.
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

  // Open Group Utility Conventions are that an option-argument
  // is the argument after the option, and may start with a dash.
  // However, we are currently rejecting these and prioritising the
  // option-like appearance of the argument. Rejection allows more error
  // detection for strict:true, but comes at the cost of rejecting intended
  // values starting with a dash, especially negative numbers.
  return !StringPrototypeStartsWith(value, '-');
}

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
 * Determines if `arg` is a lone long option.
 * @example
 * isLoneLongOption('a') // returns false
 * isLoneLongOption('-a') // returns false
 * isLoneLongOption('--foo) // returns true
 * isLoneLongOption('--foo=bar) // returns false
 */
function isLoneLongOption(arg) {
  return arg.length > 2 &&
    StringPrototypeStartsWith(arg, '--') &&
    !StringPrototypeIncludes(arg.slice(3), '=');
}

/**
 * Determines if `arg` is a long option and value in same argument.
 * @example
 * isLongOptionAndValue('--foo) // returns true
 * isLongOptionAndValue('--foo=bar) // returns false
 */
function isLongOptionAndValue(arg) {
  return arg.length > 2 &&
    StringPrototypeStartsWith(arg, '--') &&
    StringPrototypeIncludes(arg.slice(3), '=');
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
 * // -fb is an option and a value, not a short option group
 * isShortOptionGroup('-fb', {
 *   options: { f: { type: 'string' }}
 * }) // returns false
 * isShortOptionGroup('-bf', {
 *   options: { f: { type: 'string' }}
 * }) // returns true
 * // -bfb is an edge case, return true and caller sorts it out
 * isShortOptionGroup('-bfb', {
 *   options: { f: { type: 'string' }}
 * }) // returns true
 */
function isShortOptionGroup(arg, options) {
  if (arg.length <= 2) return false;
  if (StringPrototypeCharAt(arg, 0) !== '-') return false;
  if (StringPrototypeCharAt(arg, 1) === '-') return false;

  const firstShort = StringPrototypeCharAt(arg, 1);
  const longOption = findLongOptionForShort(firstShort, options);
  return (options[longOption]?.type !== 'string');
}

/**
 * Determine is arg is a short string option followed by its value.
 * @example
 * isShortOptionAndValue('-a, {}); // returns false
 * isShortOptionAndValue('-ab, {}); // returns false
 * isShortOptionAndValue('-fFILE', {
 *   options: { foo: { short: 'f', type: 'string' }}
 * }) // returns true
 */
function isShortOptionAndValue(arg, options) {
  if (!options) throw new Error('Internal error, missing options argument');
  if (arg.length <= 2) return false;
  if (StringPrototypeCharAt(arg, 0) !== '-') return false;
  if (StringPrototypeCharAt(arg, 1) === '-') return false;

  const shortOption = StringPrototypeCharAt(arg, 1);
  const longOption = findLongOptionForShort(shortOption, options);
  return (options[longOption]?.type === 'string');
}

/**
 * Find the long option associated with a short option. Looks for a configured
 * `short` and returns the short option itself if long option not found.
 * @example
 * findOptionsKeyForShort('a', {}) // returns 'a'
 * findOptionsKeyForShort('b', {
 *   options: { bar: { short: 'b' }}
 * }) // returns 'bar'
 */
function findLongOptionForShort(shortOption, options) {
  if (!options) throw new Error('Internal error, missing options argument');
  const [longOption] = ArrayPrototypeFind(
    ObjectEntries(options),
    ([, optionConfig]) => optionConfig.short === shortOption
  ) || [];
  return longOption || shortOption;
}

module.exports = {
  findLongOptionForShort,
  isLoneLongOption,
  isLoneShortOption,
  isLongOptionAndValue,
  isOptionValue,
  isShortOptionAndValue,
  isShortOptionGroup
};

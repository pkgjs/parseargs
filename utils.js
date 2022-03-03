'use strict';

const {
  ArrayPrototypeFind,
  ObjectAssign,
  ObjectEntries,
  ObjectValues,
  StringPrototypeCharAt,
  StringPrototypeStartsWith,
} = require('./primordials');

// These are internal utilities to make the parsing logic easier to read. They
// are not for client use. They are in a separate file to allow unit testing,
// although that is not essential (this could be rolled into main file
// and just tested implicitly via API).

/**
 * Determines if the argument may be used as an option value.
 * NB: We are choosing not to accept option-ish arguments.
 * @example
 * isPossibleOptionValue('V']) // returns true
 * isPossibleOptionValue('-v') // returns false
 * isPossibleOptionValue('--foo') // returns false
 * isPossibleOptionValue(undefined) // returns false
 */
function isPossibleOptionValue(value) {
  if (value === undefined) return false;
  if (value === '-') return true; // e.g. representing stdin/stdout for file

  // Open Group Utility Conventions are that an option-argument may start
  // with a dash, but we are currentlly rejecting these and prioritising the
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
 * Determines if `arg` is a long option, which may have a trailing value.
 * @example
 * isLongOption('-a) // returns false
 * isLongOption('--foo) // returns true
 * isLongOption('--foo=bar) // returns true
 */
function isLongOption(arg) {
  return arg.length > 2 && StringPrototypeStartsWith(arg, '--');
}

function getDefaultOptionConfig() {
  return {
    short: undefined,
    type: 'boolean',
    multiple: false
  };
}

/**
 * Lookup option config. Returns undefined if no match.
 */
function findOptionConfigFromShort(shortOption, options) {
  const foundConfig = ArrayPrototypeFind(
    ObjectValues(options),
    (optionConfig) => optionConfig.short === shortOption
  );
  return foundConfig;
}

/**
 * Populate an option config using options and defaults.
 */
function getOptionConfigFromShort(shortOption, options) {
  const optionConfig = findOptionConfigFromShort(shortOption, options) || {};
  return ObjectAssign(getDefaultOptionConfig(), optionConfig);
}

/**
 * Return whether a short option is of boolean type, implicitly or explicitly.
 */
function isShortOfTypeBoolean(shortOption, options) {
  if (!options) throw new Error('Internal error, missing options argument');

  const optionConfig = getOptionConfigFromShort(shortOption, options);
  return optionConfig.type === 'boolean';
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
  return isShortOfTypeBoolean(firstShort, options);
}

/**
 * Find the key to use for a short option. Looks for a configured
 * `short` and returns the short option itself it not found.
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
  isLongOption,
  isLoneShortOption,
  isPossibleOptionValue,
  isShortOptionGroup
};

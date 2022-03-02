'use strict';

const {
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

module.exports = {
  isLoneShortOption,
  isPossibleOptionValue
};

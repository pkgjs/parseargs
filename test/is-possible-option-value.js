'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { isPossibleOptionValue } = require('../util.js');

test('isPossibleOptionValue: when passed plain text then returns true', function(t) {
  t.true(isPossibleOptionValue('abc'));
  t.end();
});

test('isPossibleOptionValue: when passed digits then returns true', function(t) {
  t.true(isPossibleOptionValue(123));
  t.end();
});

test('isPossibleOptionValue: when passed empty string then returns true', function(t) {
  t.true(isPossibleOptionValue(''));
  t.end();
});

// Special case, used as stdin/stdout et al and not reason to reject
test('isPossibleOptionValue: when passed dash then returns true', function(t) {
  t.true(isPossibleOptionValue('-'));
  t.end();
});

// Supporting undefined so can pass element off end of array without checking
test('isPossibleOptionValue: when passed undefined then returns false', function(t) {
  t.false(isPossibleOptionValue(undefined));
  t.end();
});

test('isPossibleOptionValue: when passed short option then returns false', function(t) {
  t.false(isPossibleOptionValue('-a'));
  t.end();
});

test('isPossibleOptionValue: when passed short option group of short option with value then returns false', function(t) {
  t.false(isPossibleOptionValue('-abd'));
  t.end();
});

test('isPossibleOptionValue: when passed long option then returns false', function(t) {
  t.false(isPossibleOptionValue('--foo'));
  t.end();
});

test('isPossibleOptionValue: when passed long option with value then returns false', function(t) {
  t.false(isPossibleOptionValue('--foo=bar'));
  t.end();
});

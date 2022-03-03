'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { isOptionValue } = require('../utils.js');

test('isOptionValue: when passed plain text then returns true', (t) => {
  t.true(isOptionValue('abc'));
  t.end();
});

test('isOptionValue: when passed digits then returns true', (t) => {
  t.true(isOptionValue(123));
  t.end();
});

test('isOptionValue: when passed empty string then returns true', (t) => {
  t.true(isOptionValue(''));
  t.end();
});

// Special case, used as stdin/stdout et al and not reason to reject
test('isOptionValue: when passed dash then returns true', (t) => {
  t.true(isOptionValue('-'));
  t.end();
});

// Supporting undefined so can pass element off end of array without checking
test('isOptionValue: when passed undefined then returns false', (t) => {
  t.false(isOptionValue(undefined));
  t.end();
});

test('isOptionValue: when passed short option then returns false', (t) => {
  t.false(isOptionValue('-a'));
  t.end();
});

test('isOptionValue: when passed short option group of short option with value then returns false', (t) => {
  t.false(isOptionValue('-abd'));
  t.end();
});

test('isOptionValue: when passed long option then returns false', (t) => {
  t.false(isOptionValue('--foo'));
  t.end();
});

test('isOptionValue: when passed long option with value then returns false', (t) => {
  t.false(isOptionValue('--foo=bar'));
  t.end();
});

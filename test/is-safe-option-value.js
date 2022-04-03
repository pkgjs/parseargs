'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { isSafeOptionValue } = require('../utils.js');

// Basically rejecting values starting with a dash, but run through the interesting possibilities.

test('isSafeOptionValue: when passed plain text then returns true', (t) => {
  t.true(isSafeOptionValue('abc'));
  t.end();
});

test('isSafeOptionValue: when passed digits then returns true', (t) => {
  t.true(isSafeOptionValue(123));
  t.end();
});

test('isSafeOptionValue: when passed empty string then returns true', (t) => {
  t.true(isSafeOptionValue(''));
  t.end();
});

// Special case, used as stdin/stdout et al and not reason to reject
test('isSafeOptionValue: when passed dash then returns true', (t) => {
  t.true(isSafeOptionValue('-'));
  t.end();
});

test('isSafeOptionValue: when passed -- then returns false', (t) => {
  t.false(isSafeOptionValue('--'));
  t.end();
});

// Supporting undefined so can pass element off end of array without checking
test('isSafeOptionValue: when passed undefined then returns false', (t) => {
  t.false(isSafeOptionValue(undefined));
  t.end();
});

test('isSafeOptionValue: when passed short option then returns false', (t) => {
  t.false(isSafeOptionValue('-a'));
  t.end();
});

test('isSafeOptionValue: when passed short option digit then returns false', (t) => {
  t.false(isSafeOptionValue('-1'));
  t.end();
});

test('isSafeOptionValue: when passed negative number then returns false', (t) => {
  t.false(isSafeOptionValue('-123'));
  t.end();
});

test('isSafeOptionValue: when passed short option group of short option with value then returns false', (t) => {
  t.false(isSafeOptionValue('-abd'));
  t.end();
});

test('isSafeOptionValue: when passed long option then returns false', (t) => {
  t.false(isSafeOptionValue('--foo'));
  t.end();
});

test('isSafeOptionValue: when passed long option with value then returns false', (t) => {
  t.false(isSafeOptionValue('--foo=bar'));
  t.end();
});

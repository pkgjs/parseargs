'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { isLongOption } = require('../util.js');

test('isLongOption: when passed short option then returns false', function(t) {
  t.false(isLongOption('-s'));
  t.end();
});

test('isLongOption: when passed short option group then returns false', function(t) {
  t.false(isLongOption('-abc'));
  t.end();
});

test('isLongOption: when passed long option then returns true', function(t) {
  t.true(isLongOption('--foo'));
  t.end();
});

test('isLongOption: when passed long option with value then returns true', function(t) {
  t.true(isLongOption('--foo=bar'));
  t.end();
});

test('isLongOption: when passed empty string then returns false', function(t) {
  t.false(isLongOption(''));
  t.end();
});

test('isLongOption: when passed plain text then returns false', function(t) {
  t.false(isLongOption('foo'));
  t.end();
});

test('isLongOption: when passed single dash then returns false', function(t) {
  t.false(isLongOption('-'));
  t.end();
});

test('isLongOption: when passed double dash then returns false', function(t) {
  t.false(isLongOption('--'));
  t.end();
});

// This is a bit bogus, but simple consistent behaviour: long option follows double dash.
test('isLongOption: when passed arg starting with triple dash then returns true', function(t) {
  t.true(isLongOption('---foo'));
  t.end();
});

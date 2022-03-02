'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { isLoneShortOption } = require('../util.js');

test('isLoneShortOption: when passed short option then returns true', function(t) {
  t.true(isLoneShortOption('-s'));
  t.end();
});

test('isLoneShortOption: when passed short option group then returns false', function(t) {
  t.false(isLoneShortOption('-abc'));
  t.end();
});

test('isLoneShortOption: when passed long option then returns false', function(t) {
  t.false(isLoneShortOption('--foo'));
  t.end();
});

test('isLoneShortOption: when passed long option with value then returns false', function(t) {
  t.false(isLoneShortOption('--foo=bar'));
  t.end();
});

test('isLoneShortOption: when passed empty string then returns false', function(t) {
  t.false(isLoneShortOption(''));
  t.end();
});

test('isLoneShortOption: when passed plain text then returns false', function(t) {
  t.false(isLoneShortOption('foo'));
  t.end();
});

test('isLoneShortOption: when passed single dash then returns false', function(t) {
  t.false(isLoneShortOption('-'));
  t.end();
});

test('isLoneShortOption: when passed double dash then returns false', function(t) {
  t.false(isLoneShortOption('--'));
  t.end();
});

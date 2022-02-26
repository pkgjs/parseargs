'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

test('when short option group of zero-config flags then result same as expanded options', function(t) {
  const passedArgs = ['-rf'];
  const passedOptions = { };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: { r: true, f: true }, values: { r: undefined, f: undefined }, positionals: [] };
  t.deepEqual(args, expected);

  t.end();
});

test('short option group of flags does not consume subsequent positional', function(t) {
  const passedArgs = ['-rf', 'foo'];
  const passedOptions = { };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: { r: true, f: true }, values: { r: undefined, f: undefined }, positionals: ['foo'] };
  t.deepEqual(args, expected);

  t.end();
});

// See: Guideline 5 https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
test('when terminal of short-option group expects value then subsequent argument is stored as value', function(t) {
  const passedArgs = ['-rvf', 'foo'];
  const passedOptions = { withValue: ['f'] };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: { r: true, f: true, v: true }, values: { r: undefined, v: undefined, f: 'foo' }, positionals: [] };
  t.deepEqual(args, expected);

  t.end();
});

test('when middle of short-option group expects value and strict:false then arg returned as positional (as not a valid group)', function(t) {
  const passedArgs = ['-afb'];
  const passedOptions = { withValue: ['f'], strict: false };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: {}, values: {}, positionals: ['-afb'] };
  t.deepEqual(args, expected);

  t.end();
});

test('handles short-option groups in conjunction with long-options', function(t) {
  const passedArgs = ['-rf', '--foo', 'foo'];
  const passedOptions = { withValue: ['foo'] };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: { r: true, f: true, foo: true }, values: { r: undefined, f: undefined, foo: 'foo' }, positionals: [] };
  t.deepEqual(args, expected);

  t.end();
});

test('handles short-option groups with "short" alias configured', function(t) {
  const passedArgs = ['-rf'];
  const passedOptions = { short: { r: 'remove' } };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: { remove: true, f: true }, values: { remove: undefined, f: undefined }, positionals: [] };
  t.deepEqual(args, expected);

  t.end();
});

test('when parse explicit args containing short group then callers args not modified', function(t) {
  const passedArgs = ['-rf'];
  const originalArgs = passedArgs.slice();

  parseArgs(passedArgs);
  t.deepEqual(passedArgs, originalArgs);

  t.end();
});

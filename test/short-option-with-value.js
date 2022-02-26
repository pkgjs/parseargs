'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

test('when combine short and value then result has option with value', function(t) {
  const passedArgs = ['-fBAR'];
  const passedOptions = { withValue: ['f'] };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: { f: true }, values: { f: 'BAR' }, positionals: [] };
  t.deepEqual(args, expected);

  t.end();
});

test('when combine short and value followed by positional then result has positional', function(t) {
  const passedArgs = ['-fBAR', 'positional'];
  const passedOptions = { withValue: ['f'] };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: { f: true }, values: { f: 'BAR' }, positionals: ['positional'] };
  t.deepEqual(args, expected);

  t.end();
});

test('when combine short with alias and value then result has long option with value', function(t) {
  const passedArgs = ['-fBAR'];
  const passedOptions = { short: { f: 'foo' }, withValue: ['foo'] };

  const args = parseArgs(passedArgs, passedOptions);
  const expected = { flags: { foo: true }, values: { foo: 'BAR' }, positionals: [] };
  t.deepEqual(args, expected);

  t.end();
});

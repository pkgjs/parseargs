/* global assert */
/* eslint max-len: 0 */
'use strict';

const { test } = require('./utils');
const { parseArgs } = require('../index');

test('disable negative options and args are started with "--no-" prefix', () => {
  const args = ['--no-alpha'];
  const options = { alpha: { type: 'boolean' } };
  assert.throws(() => {
    parseArgs({ args, options });
  }, {
    code: 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
  });
});

test('args are passed `type: "string"` and allow negative options', () => {
  const args = ['--no-alpha', 'value'];
  const options = { alpha: { type: 'string' } };
  assert.throws(() => {
    parseArgs({ args, options, allowNegative: true });
  }, {
    code: 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
  });
});

test('args are passed `type: "boolean"` and allow negative options', () => {
  const args = ['--no-alpha'];
  const options = { alpha: { type: 'boolean' } };
  const expected = { values: { __proto__: null, alpha: false }, positionals: [] };
  assert.deepStrictEqual(parseArgs({ args, options, allowNegative: true }), expected);
});

test('args are passed `default: "true"` and allow negative options', () => {
  const args = ['--no-alpha'];
  const options = { alpha: { type: 'boolean', default: true } };
  const expected = { values: { __proto__: null, alpha: false }, positionals: [] };
  assert.deepStrictEqual(parseArgs({ args, options, allowNegative: true }), expected);
});

test('args are passed `default: "false" and allow negative options', () => {
  const args = ['--no-alpha'];
  const options = { alpha: { type: 'boolean', default: false } };
  const expected = { values: { __proto__: null, alpha: false }, positionals: [] };
  assert.deepStrictEqual(parseArgs({ args, options, allowNegative: true }), expected);
});

test('allow negative options and multiple as true', () => {
  const args = ['--no-alpha', '--alpha', '--no-alpha'];
  const options = { alpha: { type: 'boolean', multiple: true } };
  const expected = { values: { __proto__: null, alpha: [false, true, false] }, positionals: [] };
  assert.deepStrictEqual(parseArgs({ args, options, allowNegative: true }), expected);
});

test('allow negative options and passed multiple arguments', () => {
  const args = ['--no-alpha', '--alpha'];
  const options = { alpha: { type: 'boolean' } };
  const expected = { values: { __proto__: null, alpha: true }, positionals: [] };
  assert.deepStrictEqual(parseArgs({ args, options, allowNegative: true }), expected);
});

test('auto-detect --no-foo as negated when strict:false and allowNegative', () => {
  const holdArgv = process.argv;
  process.argv = [process.argv0, 'script.js', '--no-foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = [];
  const result = parseArgs({ strict: false, allowNegative: true });

  const expected = { values: { __proto__: null, foo: false },
                     positionals: [] };
  assert.deepStrictEqual(result, expected);
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

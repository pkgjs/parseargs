'use strict';

/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

test('defaultValue must be a boolean when option type is boolean', (t) => {
  const args = [];
  const options = { alpha: { type: 'boolean', defaultValue: 'not a boolean' } };
  t.throws(() => {
    parseArgs({ args, options });
  }, /alpha\.defaultValue must be Boolean/
  );
  t.end();
});

test('defaultValue must be a string when option type is string', (t) => {
  const args = [];
  const options = { alpha: { type: 'string', defaultValue: true } };
  t.throws(() => {
    parseArgs({ args, options });
  }, /alpha\.defaultValue must be String/
  );
  t.end();
});

test('when defaultValue is set, the option must be added as result', (t) => {
  const args = [];
  const options = {
    a: { type: 'string', defaultValue: 'HELLO' },
    b: { type: 'boolean', defaultValue: false },
    c: { type: 'boolean', defaultValue: true }
  };
  const expected = { values: { __proto__: null, a: 'HELLO', b: false, c: true }, positionals: [] };

  const result = parseArgs({ args, options });

  t.deepEqual(result, expected);
  t.end();
});

test('when defaultValue is set, the args value takes precedence', (t) => {
  const args = ['--a', 'WORLD', '--b', '-c'];
  const options = {
    a: { type: 'string', defaultValue: 'HELLO' },
    b: { type: 'boolean', defaultValue: false },
    c: { type: 'boolean', defaultValue: true }
  };
  const expected = { values: { __proto__: null, a: 'WORLD', b: true, c: true }, positionals: [] };

  const result = parseArgs({ args, options });

  t.deepEqual(result, expected);
  t.end();
});

test('tokens should not include the defaultValue options', (t) => {
  const args = [];
  const options = {
    a: { type: 'string', defaultValue: 'HELLO' },
    b: { type: 'boolean', defaultValue: false },
    c: { type: 'boolean', defaultValue: true }
  };

  const expectedTokens = [];

  const { tokens } = parseArgs({ args, options, tokens: true });
  t.deepEqual(tokens, expectedTokens);
  t.end();
});

test('tokens:true should not include the defaultValue options after the args input', (t) => {
  const args = ['--z', 'zero', 'positional-item'];
  const options = {
    z: { type: 'string' },
    a: { type: 'string', defaultValue: 'HELLO' },
    b: { type: 'boolean', defaultValue: false },
    c: { type: 'boolean', defaultValue: true }
  };

  const expectedTokens = [
    { kind: 'option', name: 'z', rawName: '--z', index: 0, value: 'zero', inlineValue: false },
    { kind: 'positional', index: 2, value: 'positional-item' },
  ];

  const { tokens } = parseArgs({ args, options, tokens: true, allowPositionals: true });
  t.deepEqual(tokens, expectedTokens);
  t.end();
});

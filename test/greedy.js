/* global assert */
/* eslint max-len: ["error", {"code": 120}], */
'use strict';

const { test } = require('./utils');
const { parseArgs } = require('../index');

const candidateGreedyOptions = [
  '',
  '-',
  '--',
  'abc',
  '123',
  '-s',
  '--foo',
];

candidateGreedyOptions.forEach((value) => {
  test(`greedy: when short option with value '${value}' then eaten`, () => {
    const args = ['-w', value];
    const options = { with: { type: 'string', short: 'w' } };
    const expectedResult = { values: { __proto__: null, with: value }, positionals: [] };

    const result = parseArgs({ args, options, strict: false });
    assert.deepStrictEqual(result, expectedResult);
  });

  test(`greedy: when long option with value '${value}' then eaten`, () => {
    const args = ['--with', value];
    const options = { with: { type: 'string', short: 'w' } };
    const expectedResult = { values: { __proto__: null, with: value }, positionals: [] };

    const result = parseArgs({ args, options, strict: false });
    assert.deepStrictEqual(result, expectedResult);
  });
});

/* global assert */
/* eslint max-len: ["error", {"code": 120}], */
'use strict';

const { test } = require('./utils');
const { parseArgs } = require('../index.js');

test('strict: when candidate option value is plain text then does not throw', () => {
  const args = ['--with', 'abc'];
  const options = { with: { type: 'string' } };
  const expectedResult = { values: { with: 'abc' }, positionals: [] };

  const result = parseArgs({ args, options, strict: true });
  assert.deepStrictEqual(result, expectedResult);
});

test("strict: when candidate option value is '-' then does not throw", () => {
  const args = ['--with', '-'];
  const options = { with: { type: 'string' } };
  const expectedResult = { values: { with: '-' }, positionals: [] };

  const result = parseArgs({ args, options, strict: true });
  assert.deepStrictEqual(result, expectedResult);
});

test("strict: when candidate option value is '--' then throws", () => {
  const args = ['--with', '--'];
  const options = { with: { type: 'string' } };

  assert.throws(() => {
    parseArgs({ args, options });
  }, {
    code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
  });
});

test('strict: when candidate option value is short option then throws', () => {
  const args = ['--with', '-a'];
  const options = { with: { type: 'string' } };

  assert.throws(() => {
    parseArgs({ args, options });
  }, {
    code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
  });
});

test('strict: when candidate option value is short option digit then throws', () => {
  const args = ['--with', '-1'];
  const options = { with: { type: 'string' } };

  assert.throws(() => {
    parseArgs({ args, options });
  }, {
    code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
  });
});

test('strict: when candidate option value is long option then throws', () => {
  const args = ['--with', '--foo'];
  const options = { with: { type: 'string' } };

  assert.throws(() => {
    parseArgs({ args, options });
  }, {
    code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
  });
});

test('strict: when short option and suspect value then throws with short option in error message', () => {
  const args = ['-w', '--foo'];
  const options = { with: { type: 'string', short: 'w' } };

  assert.throws(() => {
    parseArgs({ args, options });
  }, /for '-w'/
  );
});

test('strict: when long option and suspect value then throws with long option in error message', () => {
  const args = ['--with', '--foo'];
  const options = { with: { type: 'string' } };

  assert.throws(() => {
    parseArgs({ args, options });
  }, /for '--with'/
  );
});

test('strict: when short option and suspect value then throws with whole expected message', () => {
  const args = ['-w', '--foo'];
  const options = { with: { type: 'string', short: 'w' } };

  assert.throws(() => {
    parseArgs({ args, options });
  // eslint-disable-next-line max-len
  }, /Error: Option '-w' argument is ambiguous\.\nDid you forget to specify the option argument for '-w'\?\nOr to specify an option argument starting with a dash use '--with=-XYZ' or '-w-XYZ'\./
  );
});

test('strict: when long option and suspect value then throws with whole expected message', () => {
  const args = ['--with', '--foo'];
  const options = { with: { type: 'string', short: 'w' } };

  assert.throws(() => {
    parseArgs({ args, options });
  // eslint-disable-next-line max-len
  }, /Error: Option '--with' argument is ambiguous\.\nDid you forget to specify the option argument for '--with'\?\nOr to specify an option argument starting with a dash use '--with=-XYZ'\./
  );
});

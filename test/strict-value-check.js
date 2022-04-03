'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

test('strict: when candidate option value is plain text then does not throw', (t) => {
  const passedArgs = ['--with', 'abc'];
  const knownOptions = { with: { type: 'string' } };

  t.doesNotThrow(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  });
  t.end();
});

test("strict: when candidate option value is '-' then does not throw", (t) => {
  const passedArgs = ['--with', '-'];
  const knownOptions = { with: { type: 'string' } };

  t.doesNotThrow(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  });
  t.end();
});

test("strict: when candidate option value is '--' then throws", (t) => {
  const passedArgs = ['--with', '--'];
  const knownOptions = { with: { type: 'string' } };

  t.throws(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  });
  t.end();
});

test('strict: when candidate option value is short option then throws', (t) => {
  const passedArgs = ['--with', '-a'];
  const knownOptions = { with: { type: 'string' } };

  t.throws(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  });
  t.end();
});

test('strict: when candidate option value is short option digit then throws', (t) => {
  const passedArgs = ['--with', '-1'];
  const knownOptions = { with: { type: 'string' } };

  t.throws(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  });
  t.end();
});

test('strict: when candidate option value is long option then throws', (t) => {
  const passedArgs = ['--with', '--foo'];
  const knownOptions = { with: { type: 'string' } };

  t.throws(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  });
  t.end();
});

test('strict: when short option and suspect value then throws with short option in error message', (t) => {
  const passedArgs = ['-w', '--foo'];
  const knownOptions = { with: { type: 'string', short: 'w' } };

  t.throws(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  }, /for '-w'/);
  t.end();
});

test('strict: when long option and suspect value then throws with long option in error message', (t) => {
  const passedArgs = ['--with', '--foo'];
  const knownOptions = { with: { type: 'string' } };

  t.throws(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  }, /for '--with'/);
  t.end();
});

test('strict: when long option and suspect value then throws with whole expected message', (t) => {
  const passedArgs = ['--with', '--foo'];
  const knownOptions = { with: { type: 'string' } };

  t.throws(() => {
    parseArgs({ args: passedArgs, options: knownOptions, strict: true });
  }, /Did you forget to specify the option argument for '--with'\?\nTo specify an option argument starting with a dash use '--with=--foo'\./);
  t.end();
});

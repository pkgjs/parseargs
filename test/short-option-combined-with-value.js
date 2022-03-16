'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

test('when combine string short with plain text then parsed as value', (t) => {
  const passedArgs = ['-aHELLO'];
  const passedOptions = { alpha: { short: 'a', type: 'string' } };
  const expected = { parsedOptions: { alpha: true }, values: { alpha: 'HELLO' }, positionals: [] };

  const result = parseArgs({ args: passedArgs, options: passedOptions });

  t.deepEqual(result, expected);
  t.end();
});

test('when combine low-config string short with plain text then parsed as value', (t) => {
  const passedArgs = ['-aHELLO'];
  const passedOptions = { a: { type: 'string' } };
  const expected = { parsedOptions: { a: true }, values: { a: 'HELLO' }, positionals: [] };

  const result = parseArgs({ args: passedArgs, options: passedOptions });

  t.deepEqual(result, expected);
  t.end();
});

test('when combine string short with value like short option then parsed as value', (t) => {
  const passedArgs = ['-a-b'];
  const passedOptions = { alpha: { short: 'a', type: 'string' } };
  const expected = { parsedOptions: { alpha: true }, values: { alpha: '-b' }, positionals: [] };

  const result = parseArgs({ args: passedArgs, options: passedOptions });

  t.deepEqual(result, expected);
  t.end();
});

test('when combine string short with value like long option then parsed as value', (t) => {
  const passedArgs = ['-a--bar'];
  const passedOptions = { alpha: { short: 'a', type: 'string' } };
  const expected = { parsedOptions: { alpha: true }, values: { alpha: '--bar' }, positionals: [] };

  const result = parseArgs({ args: passedArgs, options: passedOptions });

  t.deepEqual(result, expected);
  t.end();
});

test('when combine string short with value like negative number then parsed as value', (t) => {
  const passedArgs = ['-a-5'];
  const passedOptions = { alpha: { short: 'a', type: 'string' } };
  const expected = { parsedOptions: { alpha: true }, values: { alpha: '-5' }, positionals: [] };

  const result = parseArgs({ args: passedArgs, options: passedOptions });

  t.deepEqual(result, expected);
  t.end();
});


test('when combine string short with value which matches configured flag then parsed as value', (t) => {
  const passedArgs = ['-af'];
  const passedOptions = { alpha: { short: 'a', type: 'string' }, file: { short: 'f' } };
  const expected = { parsedOptions: { alpha: true }, values: { alpha: 'f' }, positionals: [] };

  const result = parseArgs({ args: passedArgs, options: passedOptions });

  t.deepEqual(result, expected);
  t.end();
});

test('when combine string short with value including equals then parsed with equals in value', (t) => {
  const passedArgs = ['-a=5'];
  const passedOptions = { alpha: { short: 'a', type: 'string' } };
  const expected = { parsedOptions: { alpha: true }, values: { alpha: '=5' }, positionals: [] };

  const result = parseArgs({ args: passedArgs, options: passedOptions });

  t.deepEqual(result, expected);
  t.end();
});

/* global assert */
/* eslint max-len: ["error", {"code": 120}], */
'use strict';

const { test } = require('./utils');
const { parseArgs } = require('../index');

// Test results are as we expect

test('when short option used as flag then stored as flag', () => {
  const passedArgs = ['-f'];
  const expected = { values: { f: true }, positionals: [] };
  const args = parseArgs({ strict: false, args: passedArgs });
  assert.deepStrictEqual(args, expected);
});

test('when short option used as flag before positional then stored as flag and positional (and not value)', () => {
  const passedArgs = ['-f', 'bar'];
  const expected = { values: { f: true }, positionals: [ 'bar' ] };
  const args = parseArgs({ strict: false, args: passedArgs });
  assert.deepStrictEqual(args, expected);
});

test('when short option `type: "string"` used with value then stored as value', () => {
  const passedArgs = ['-f', 'bar'];
  const passedOptions = { f: { type: 'string' } };
  const expected = { values: { f: 'bar' }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('when short option listed in short used as flag then long option stored as flag', () => {
  const passedArgs = ['-f'];
  const passedOptions = { foo: { short: 'f', type: 'boolean' } };
  const expected = { values: { foo: true }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('when short option listed in short and long listed in `type: "string"` and ' +
     'used with value then long option stored as value', () => {
  const passedArgs = ['-f', 'bar'];
  const passedOptions = { foo: { short: 'f', type: 'string' } };
  const expected = { values: { foo: 'bar' }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('when short option `type: "string"` used without value then stored as flag', () => {
  const passedArgs = ['-f'];
  const passedOptions = { f: { type: 'string' } };
  const expected = { values: { f: true }, positionals: [] };
  const args = parseArgs({ strict: false, args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('short option group behaves like multiple short options', () => {
  const passedArgs = ['-rf'];
  const passedOptions = { };
  const expected = { values: { r: true, f: true }, positionals: [] };
  const args = parseArgs({ strict: false, args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('short option group does not consume subsequent positional', () => {
  const passedArgs = ['-rf', 'foo'];
  const passedOptions = { };
  const expected = { values: { r: true, f: true }, positionals: ['foo'] };
  const args = parseArgs({ strict: false, args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

// See: Guideline 5 https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
test('if terminal of short-option group configured `type: "string"`, subsequent positional is stored', () => {
  const passedArgs = ['-rvf', 'foo'];
  const passedOptions = { f: { type: 'string' } };
  const expected = { values: { r: true, v: true, f: 'foo' }, positionals: [] };
  const args = parseArgs({ strict: false, args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('handles short-option groups in conjunction with long-options', () => {
  const passedArgs = ['-rf', '--foo', 'foo'];
  const passedOptions = { foo: { type: 'string' } };
  const expected = { values: { r: true, f: true, foo: 'foo' }, positionals: [] };
  const args = parseArgs({ strict: false, args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('handles short-option groups with "short" alias configured', () => {
  const passedArgs = ['-rf'];
  const passedOptions = { remove: { short: 'r', type: 'boolean' } };
  const expected = { values: { remove: true, f: true }, positionals: [] };
  const args = parseArgs({ strict: false, args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('Everything after a bare `--` is considered a positional argument', () => {
  const passedArgs = ['--', 'barepositionals', 'mopositionals'];
  const expected = { values: {}, positionals: ['barepositionals', 'mopositionals'] };
  const args = parseArgs({ args: passedArgs });
  assert.deepStrictEqual(args, expected, Error('testing bare positionals'));
});

test('args are true', () => {
  const passedArgs = ['--foo', '--bar'];
  const expected = { values: { foo: true, bar: true }, positionals: [] };
  const args = parseArgs({ strict: false, args: passedArgs });
  assert.deepStrictEqual(args, expected, Error('args are true'));
});

test('arg is true and positional is identified', () => {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const expected = { values: { foo: true }, positionals: ['b'] };
  const args = parseArgs({ strict: false, args: passedArgs });
  assert.deepStrictEqual(args, expected, Error('arg is true and positional is identified'));
});

test('args equals are passed `type: "string"`', () => {
  const passedArgs = ['--so=wat'];
  const passedOptions = { so: { type: 'string' } };
  const expected = { values: { so: 'wat' }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected, Error('arg value is passed'));
});

test('when args include single dash then result stores dash as positional', () => {
  const passedArgs = ['-'];
  const expected = { values: { }, positionals: ['-'] };
  const args = parseArgs({ args: passedArgs });
  assert.deepStrictEqual(args, expected);
});

test('zero config args equals are parsed as if `type: "string"`', () => {
  const passedArgs = ['--so=wat'];
  const passedOptions = { };
  const expected = { values: { so: 'wat' }, positionals: [] };
  const args = parseArgs({ strict: false, args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected, Error('arg value is passed'));
});

test('same arg is passed twice `type: "string"` and last value is recorded', () => {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const passedOptions = { foo: { type: 'string' } };
  const expected = { values: { foo: 'b' }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected, Error('last arg value is passed'));
});

test('args equals pass string including more equals', () => {
  const passedArgs = ['--so=wat=bing'];
  const passedOptions = { so: { type: 'string' } };
  const expected = { values: { so: 'wat=bing' }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected, Error('arg value is passed'));
});

test('first arg passed for `type: "string"` and "multiple" is in array', () => {
  const passedArgs = ['--foo=a'];
  const passedOptions = { foo: { type: 'string', multiple: true } };
  const expected = { values: { foo: ['a'] }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected, Error('first multiple in array'));
});

test('args are passed `type: "string"` and "multiple"', () => {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const passedOptions = {
    foo: {
      type: 'string',
      multiple: true,
    },
  };
  const expected = { values: { foo: ['a', 'b'] }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected, Error('both arg values are passed'));
});

test('when expecting `multiple:true` boolean option and option used multiple times then result includes array of ' +
     'booleans matching usage', () => {
  const passedArgs = ['--foo', '--foo'];
  const passedOptions = {
    foo: {
      type: 'boolean',
      multiple: true,
    },
  };
  const expected = { values: { foo: [true, true] }, positionals: [] };
  const args = parseArgs({ args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(args, expected);
});

test('order of option and positional does not matter (per README)', () => {
  const passedArgs1 = ['--foo=bar', 'baz'];
  const passedArgs2 = ['baz', '--foo=bar'];
  const passedOptions = { foo: { type: 'string' } };
  const expected = { values: { foo: 'bar' }, positionals: ['baz'] };
  assert.deepStrictEqual(
    parseArgs({ args: passedArgs1, options: passedOptions }),
    expected,
    Error('option then positional')
  );
  assert.deepStrictEqual(
    parseArgs({ args: passedArgs2, options: passedOptions }),
    expected,
    Error('positional then option')
  );
});

test('correct default args when use node -p', () => {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['-p', '0'];
  const result = parseArgs({ strict: false });

  const expected = { values: { foo: true },
                     positionals: [] };
  assert.deepStrictEqual(result, expected);
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node --print', () => {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['--print', '0'];
  const result = parseArgs({ strict: false });

  const expected = { values: { foo: true },
                     positionals: [] };
  assert.deepStrictEqual(result, expected);
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node -e', () => {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['-e', '0'];
  const result = parseArgs({ strict: false });

  const expected = { values: { foo: true },
                     positionals: [] };
  assert.deepStrictEqual(result, expected);
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node --eval', () => {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['--eval', '0'];
  const result = parseArgs({ strict: false });
  const expected = { values: { foo: true },
                     positionals: [] };
  assert.deepStrictEqual(result, expected);
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when normal arguments', () => {
  const holdArgv = process.argv;
  process.argv = [process.argv0, 'script.js', '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = [];
  const result = parseArgs({ strict: false });

  const expected = { values: { foo: true },
                     positionals: [] };
  assert.deepStrictEqual(result, expected);
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('excess leading dashes on options are retained', () => {
  // Enforce a design decision for an edge case.
  const passedArgs = ['---triple'];
  const passedOptions = { };
  const expected = {
    values: { '-triple': true },
    positionals: []
  };
  const result = parseArgs({ strict: false, args: passedArgs, options: passedOptions });
  assert.deepStrictEqual(result, expected, Error('excess option dashes are retained'));
});

// Test bad inputs

test('invalid argument passed for options', () => {
  const passedArgs = ['--so=wat'];
  const passedOptions = 'bad value';
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });
});

test('type property missing for option then throw', () => {
  const knownOptions = { foo: { } };
  assert.throws(() => { parseArgs({ options: knownOptions }); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });
});

test('boolean passed to "type" option', () => {
  const passedArgs = ['--so=wat'];
  const passedOptions = { foo: { type: true } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });
});

test('invalid union value passed to "type" option', () => {
  const passedArgs = ['--so=wat'];
  const passedOptions = { foo: { type: 'str' } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });
});

// Test strict mode

test('unknown long option --bar', () => {
  const passedArgs = ['--foo', '--bar'];
  const passedOptions = { foo: { type: 'boolean' } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
  });
});

test('unknown short option -b', () => {
  const passedArgs = ['--foo', '-b'];
  const passedOptions = { foo: { type: 'boolean' } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
  });
});

test('unknown option -r in short option group -bar', () => {
  const passedArgs = ['-bar'];
  const passedOptions = { b: { type: 'boolean' }, a: { type: 'boolean' } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
  });
});

test('unknown option with explicit value', () => {
  const passedArgs = ['--foo', '--bar=baz'];
  const passedOptions = { foo: { type: 'boolean' } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
  });
});

test('string option used as boolean', () => {
  const passedArgs = ['--foo'];
  const passedOptions = { foo: { type: 'string' } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
  });
});

test('boolean option used with value', () => {
  const passedArgs = ['--foo=bar'];
  const passedOptions = { foo: { type: 'boolean' } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
  });
});

test('invalid short option length', () => {
  const passedArgs = [];
  const passedOptions = { foo: { short: 'fo', type: 'boolean' } };
  assert.throws(() => { parseArgs({ args: passedArgs, options: passedOptions }); }, {
    code: 'ERR_INVALID_ARG_VALUE'
  });
});

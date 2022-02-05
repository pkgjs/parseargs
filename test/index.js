'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

// Test results are as we expect

test('when short option used as flag then stored as flag', function(t) {
  const passedArgs = ['-f'];
  const expected = { flags: { f: true }, values: { f: undefined }, positionals: [] };
  const args = parseArgs(passedArgs);

  t.deepEqual(args, expected);

  t.end();
});

test('when short option used as flag before positional then stored as flag and positional (and not value)', function(t) {
  const passedArgs = ['-f', 'bar'];
  const expected = { flags: { f: true }, values: { f: undefined }, positionals: [ 'bar' ] };
  const args = parseArgs(passedArgs);

  t.deepEqual(args, expected);

  t.end();
});

test('when short option withValue used with value then stored as value', function(t) {
  const passedArgs = ['-f', 'bar'];
  const passedOptions = { withValue: ['f'] };
  const expected = { flags: { f: true }, values: { f: 'bar' }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected);

  t.end();
});

test('when short option listed in short used as flag then long option stored as flag', function(t) {
  const passedArgs = ['-f'];
  const passedOptions = { short: { f: 'foo' } };
  const expected = { flags: { foo: true }, values: { foo: undefined }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected);

  t.end();
});

test('when short option listed in short and long listed in withValue and used with value then long option stored as value', function(t) {
  const passedArgs = ['-f', 'bar'];
  const passedOptions = { short: { f: 'foo' }, withValue: ['foo'] };
  const expected = { flags: { foo: true }, values: { foo: 'bar' }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected);

  t.end();
});

test('when short option withValue used without value then stored as flag', function(t) {
  const passedArgs = ['-f'];
  const passedOptions = { withValue: ['f'] };
  const expected = { flags: { f: true }, values: { f: undefined }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected);

  t.end();
});

test('Everything after a bare `--` is considered a positional argument', function(t) {
  const passedArgs = ['--', 'barepositionals', 'mopositionals'];
  const expected = { flags: {}, values: {}, positionals: ['barepositionals', 'mopositionals'] };
  const args = parseArgs(passedArgs);

  t.deepEqual(args, expected, 'testing bare positionals');

  t.end();
});

test('args are true', function(t) {
  const passedArgs = ['--foo', '--bar'];
  const expected = { flags: { foo: true, bar: true }, values: { foo: undefined, bar: undefined }, positionals: [] };
  const args = parseArgs(passedArgs);

  t.deepEqual(args, expected, 'args are true');

  t.end();
});

test('arg is true and positional is identified', function(t) {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const expected = { flags: { foo: true }, values: { foo: undefined }, positionals: ['b'] };
  const args = parseArgs(passedArgs);

  t.deepEqual(args, expected, 'arg is true and positional is identified');

  t.end();
});

test('args equals are passed "withValue"', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = { withValue: ['so'] };
  const expected = { flags: { so: true }, values: { so: 'wat' }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected, 'arg value is passed');

  t.end();
});

test('zero config args equals are parsed as if "withValue"', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = { };
  const expected = { flags: { so: true }, values: { so: 'wat' }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected, 'arg value is passed');

  t.end();
});

test('same arg is passed twice "withValue" and last value is recorded', function(t) {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const passedOptions = { withValue: ['foo'] };
  const expected = { flags: { foo: true }, values: { foo: 'b' }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected, 'last arg value is passed');

  t.end();
});

test('args equals pass string including more equals', function(t) {
  const passedArgs = ['--so=wat=bing'];
  const passedOptions = { withValue: ['so'] };
  const expected = { flags: { so: true }, values: { so: 'wat=bing' }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected, 'arg value is passed');

  t.end();
});

test('first arg passed for "withValue" and "multiples" is in array', function(t) {
  const passedArgs = ['--foo=a'];
  const passedOptions = { withValue: ['foo'], multiples: ['foo'] };
  const expected = { flags: { foo: true }, values: { foo: ['a'] }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected, 'first multiple in array');

  t.end();
});

test('args are passed "withValue" and "multiples"', function(t) {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const passedOptions = { withValue: ['foo'], multiples: ['foo'] };
  const expected = { flags: { foo: true }, values: { foo: ['a', 'b'] }, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected, 'both arg values are passed');

  t.end();
});

test('order of option and positional does not matter (per README)', function(t) {
  const passedArgs1 = ['--foo=bar', 'baz'];
  const passedArgs2 = ['baz', '--foo=bar'];
  const passedOptions = { withValue: ['foo'] };
  const expected = { flags: { foo: true }, values: { foo: 'bar' }, positionals: ['baz'] };

  t.deepEqual(parseArgs(passedArgs1, passedOptions), expected, 'option then positional');
  t.deepEqual(parseArgs(passedArgs2, passedOptions), expected, 'positional then option');

  t.end();
});

test('correct default args when use node -p', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['-p', '0'];
  const result = parseArgs();

  const expected = { flags: { foo: true },
                     values: { foo: undefined },
                     positionals: [] };
  t.deepEqual(result, expected);

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node --print', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['--print', '0'];
  const result = parseArgs();

  const expected = { flags: { foo: true },
                     values: { foo: undefined },
                     positionals: [] };
  t.deepEqual(result, expected);

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node -e', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['-e', '0'];
  const result = parseArgs();

  const expected = { flags: { foo: true },
                     values: { foo: undefined },
                     positionals: [] };
  t.deepEqual(result, expected);

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node --eval', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['--eval', '0'];
  const result = parseArgs();

  const expected = { flags: { foo: true },
                     values: { foo: undefined },
                     positionals: [] };
  t.deepEqual(result, expected);

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when normal arguments', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, 'script.js', '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = [];
  const result = parseArgs();

  const expected = { flags: { foo: true },
                     values: { foo: undefined },
                     positionals: [] };
  t.deepEqual(result, expected);

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('excess leading dashes on options are retained', function(t) {
  // Enforce a design decision for an edge case.
  const passedArgs = ['---triple'];
  const passedOptions = { };
  const expected = {
    flags: { '-triple': true },
    values: { '-triple': undefined },
    positionals: []
  };
  const result = parseArgs(passedArgs, passedOptions);

  t.deepEqual(result, expected, 'excess option dashes are retained');

  t.end();
});

// Test bad inputs

test('invalid argument passed for options', function(t) {
  const passedArgs = ['--so=wat'];

  t.throws(function() { parseArgs(passedArgs, 'bad value'); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });

  t.end();
});

test('boolean passed to "withValue" option', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = { withValue: true };

  t.throws(function() { parseArgs(passedArgs, passedOptions); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });

  t.end();
});

test('string passed to "withValue" option', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = { withValue: 'so' };

  t.throws(function() { parseArgs(passedArgs, passedOptions); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });

  t.end();
});

'use strict';

const test = require('tape')
const {parseArgs} = require('../index.js')

//Test results are as we expect

test('Everything after a bare `--` is considered a positional argument', function (t) {
  const passedArgs = ['--', 'barepositionals', 'mopositionals']
  const expected = { args: {}, values: {}, positionals: ['barepositionals', 'mopositionals'] }
  const args = parseArgs(passedArgs)

  t.deepEqual(args, expected, 'testing bare positionals')

  t.end()
})

test('args are true', function (t) {
  const passedArgs = ['--foo', '--bar']
  const expected = { args: { foo: true, bar: true}, values: {foo: [undefined], bar: [undefined]}, positionals: [] }
  const args = parseArgs(passedArgs)

  t.deepEqual(args, expected, 'args are true')

  t.end()
})

test('arg is true and positional is identified', function (t) {
  const passedArgs = ['--foo=a', '--foo', 'b']
  const expected = { args: { foo: true}, values: { foo: [undefined]}, positionals: ['b'] }
  const args = parseArgs(passedArgs)

  t.deepEqual(args, expected, 'arg is true and positional is identified')

  t.end()
})

test('args equals are passed "withValue"', function (t) {
  const passedArgs = ['--so=wat']
  const passedOptions = { withValue: ['so'] }
  const expected = { args: { so: true}, values: { so: ["wat"]}, positionals: [] }
  const args = parseArgs(passedArgs, passedOptions)

  t.deepEqual(args, expected, 'arg value is passed')

  t.end()
})

test('same arg is passed twice "withValue" and last value is recorded', function (t) {
  const passedArgs = ['--foo=a', '--foo', 'b']
  const passedOptions = { withValue: ['foo'] }
  const expected = { args: { foo: true}, values: { foo: ['b']}, positionals: [] }
  const args = parseArgs(passedArgs, passedOptions)

  t.deepEqual(args, expected, 'last arg value is passed')

  t.end()
})

test('args are passed "withValue" and "multiples"', function (t) {
  const passedArgs = ['--foo=a', '--foo', 'b']
  const passedOptions = { withValue: ['foo'], multiples: ['foo'] }
  const expected = { args: { foo: true}, values: { foo: ['a', 'b']}, positionals: [] }
  const args = parseArgs(passedArgs, passedOptions)

  t.deepEqual(args, expected, 'both arg values are passed')

  t.end()
})

test('correct default args when use node -p', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['-p', '0'];
  const args = parseArgs();

  const expected = { args: { foo: true },
                     values: { foo: [undefined] },
                     positionals: [] };
  t.deepEqual(args, expected, 'args are true');

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node --print', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['--print', '0'];
  const args = parseArgs();

  const expected = { args: { foo: true },
                     values: { foo: [undefined] },
                     positionals: [] };
  t.deepEqual(args, expected, 'args are true');

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node -e', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['-e', '0'];
  const args = parseArgs();

  const expected = { args: { foo: true },
                     values: { foo: [undefined] },
                     positionals: [] };
  t.deepEqual(args, expected, 'args are true');

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

test('correct default args when use node --eval', function(t) {
  const holdArgv = process.argv;
  process.argv = [process.argv0, '--foo'];
  const holdExecArgv = process.execArgv;
  process.execArgv = ['--eval', '0'];
  const args = parseArgs();

  const expected = { args: { foo: true },
                     values: { foo: [undefined] },
                     positionals: [] };
  t.deepEqual(args, expected, 'args are true');

  t.end();
  process.argv = holdArgv;
  process.execArgv = holdExecArgv;
});

//Test bad inputs

test('boolean passed to "withValue" option', function (t) {
  const passedArgs = ['--so=wat']
  const passedOptions = { withValue: true }

  t.throws(function() { parseArgs(passedArgs, passedOptions) });

  t.end()
})

test('string passed to "withValue" option', function (t) {
  const passedArgs = ['--so=wat']
  const passedOptions = { withValue: 'so' }

  t.throws(function() { parseArgs(passedArgs, passedOptions) });

  t.end()
})
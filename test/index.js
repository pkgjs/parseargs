'use strict';

const test = require('tape')
const {parseArgs} = require('../index.js')

//Test results are as we expect

test('Everything after a bare `--` is considered a positional argument', function (t) {
  const passedArgs = ['--', 'barepositionals', 'mopositionals']
  const expected = { flags: {}, values: {}, positionals: ['barepositionals', 'mopositionals'] }
  const args = parseArgs(passedArgs)

  t.deepEqual(args, expected, 'testing bare positionals')

  t.end()
})

test('args are true', function (t) {
  const passedArgs = ['--foo', '--bar']
  const expected = { flags: { foo: true, bar: true}, values: {foo: [undefined], bar: [undefined]}, positionals: [] }
  const args = parseArgs(passedArgs)

  t.deepEqual(args, expected, 'args are true')

  t.end()
})

test('arg is true and positional is identified', function (t) {
  const passedArgs = ['--foo=a', '--foo', 'b']
  const expected = { flags: { foo: true}, values: { foo: [undefined]}, positionals: ['b'] }
  const args = parseArgs(passedArgs)

  t.deepEqual(args, expected, 'arg is true and positional is identified')

  t.end()
})

test('args equals are passed "withValue"', function (t) {
  const passedArgs = ['--so=wat']
  const passedOptions = { withValue: ['so'] }
  const expected = { flags: { so: true}, values: { so: ["wat"]}, positionals: [] }
  const args = parseArgs(passedArgs, passedOptions)

  t.deepEqual(args, expected, 'arg value is passed')

  t.end()
})

test('same arg is passed twice "withValue" and last value is recorded', function (t) {
  const passedArgs = ['--foo=a', '--foo', 'b']
  const passedOptions = { withValue: ['foo'] }
  const expected = { flags: { foo: true}, values: { foo: ['b']}, positionals: [] }
  const args = parseArgs(passedArgs, passedOptions)

  t.deepEqual(args, expected, 'last arg value is passed')

  t.end()
})

test('args are passed "withValue" and "multiples"', function (t) {
  const passedArgs = ['--foo=a', '--foo', 'b']
  const passedOptions = { withValue: ['foo'], multiples: ['foo'] }
  const expected = { flags: { foo: true}, values: { foo: ['a', 'b']}, positionals: [] }
  const args = parseArgs(passedArgs, passedOptions)

  t.deepEqual(args, expected, 'both arg values are passed')

  t.end()
})

test('excess leading dashes on options are retained', function(t) {
  // Enforce a design decision for an edge case.
  const passedArgs = ['---triple'];
  const passedOptions = { };
  const expected = { flags: { '-triple': true}, values: { '-triple': [undefined]}, positionals: [] };
  const args = parseArgs(passedArgs, passedOptions);

  t.deepEqual(args, expected, 'excess option dashes are retained');

  t.end();
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

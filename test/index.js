const test = require('tape')
const {parseArgs} = require('../index.js')

test('Everything after a bare `--` is considered a positional argument', function (t) {
  const passedArgs = ['--', 'barepositionals', 'mopositionals']
  const expected = { args: {}, values: {}, positionals: ['barepositionals', 'mopositionals'] }
  const args = parseArgs(passedArgs)

  t.deepEqual(args, expected, 'testing bare positionals')

  t.end()
})

test('args are true', function (t) {
  const passedArgs = ['--foo', '--bar']
  const expected = { args: { foo: true, bar: true}, values: {}, positionals: [] }
  const args = parseArgs(passedArgs)

  t.deepEqual(args, expected, 'args are true')

  t.end()
})

test('args equals are passed "withValue"', function (t) {
  const passedArgs = ['--so=wat']
  const passedOptions = { withValue: true }
  const expected = { args: { so: true}, values: { so: "wat"}, positionals: [] }
  const args = parseArgs(passedArgs, passedOptions)

  t.deepEqual(args, expected, 'arg value is passed')

  t.end()
})


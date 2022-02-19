'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

// Test results are as we expect

test('when short option used as flag then stored as flag', function(t) {
  const passedArgs = ['-f'];
  const expected = { flags: { f: true }, values: { f: undefined }, positionals: [] };
  const args = parseArgs({ argv: passedArgs });

  t.deepEqual(args, expected);

  t.end();
});

test('when short option used as flag before positional then stored as flag and positional (and not value)', function(t) {
  const passedArgs = ['-f', 'bar'];
  const expected = { flags: { f: true }, values: { f: undefined }, positionals: [ 'bar' ] };
  const args = parseArgs({ argv: passedArgs });

  t.deepEqual(args, expected);

  t.end();
});

test('when short option `type: "string"` used with value then stored as value', function(t) {
  const passedArgs = ['-f', 'bar'];
  const passedOptions = { f: { type: 'string' } };
  const expected = { flags: { f: true }, values: { f: 'bar' }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected);

  t.end();
});

test('when short option listed in short used as flag then long option stored as flag', function(t) {
  const passedArgs = ['-f'];
  const passedOptions = { foo: { short: 'f' } };
  const expected = { flags: { foo: true }, values: { foo: undefined }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected);

  t.end();
});

test('when short option listed in short and long listed in `type: "string"` and used with value then long option stored as value', function(t) {
  const passedArgs = ['-f', 'bar'];
  const passedOptions = { foo: { short: 'f', type: 'string' } };
  const expected = { flags: { foo: true }, values: { foo: 'bar' }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected);

  t.end();
});

test('when short option `type: "string"` used without value then stored as flag', function(t) {
  const passedArgs = ['-f'];
  const passedOptions = { f: { type: 'string' } };
  const expected = { flags: { f: true }, values: { f: undefined }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected);

  t.end();
});

test('short option group behaves like multiple short options', function(t) {
  const passedArgs = ['-rf'];
  const passedOptions = { };
  const expected = { flags: { r: true, f: true }, values: { r: undefined, f: undefined }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected);

  t.end();
});

test('short option group does not consume subsequent positional', function(t) {
  const passedArgs = ['-rf', 'foo'];
  const passedOptions = { };
  const expected = { flags: { r: true, f: true }, values: { r: undefined, f: undefined }, positionals: ['foo'] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });
  t.deepEqual(args, expected);

  t.end();
});

// // See: Guideline 5 https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
test('if terminal of short-option group configured `type: "string"`, subsequent positional is stored', function(t) {
  const passedArgs = ['-rvf', 'foo'];
  const passedOptions = { f: { type: 'string' } };
  const expected = { flags: { r: true, f: true, v: true }, values: { r: undefined, v: undefined, f: 'foo' }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });
  t.deepEqual(args, expected);

  t.end();
});

test('handles short-option groups in conjunction with long-options', function(t) {
  const passedArgs = ['-rf', '--foo', 'foo'];
  const passedOptions = { foo: { type: 'string' } };
  const expected = { flags: { r: true, f: true, foo: true }, values: { r: undefined, f: undefined, foo: 'foo' }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });
  t.deepEqual(args, expected);

  t.end();
});

test('handles short-option groups with "short" alias configured', function(t) {
  const passedArgs = ['-rf'];
  const passedOptions = { remove: { short: 'r' } };
  const expected = { flags: { remove: true, f: true }, values: { remove: undefined, f: undefined }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });
  t.deepEqual(args, expected);

  t.end();
});

test('Everything after a bare `--` is considered a positional argument', function(t) {
  const passedArgs = ['--', 'barepositionals', 'mopositionals'];
  const expected = { flags: {}, values: {}, positionals: ['barepositionals', 'mopositionals'] };
  const args = parseArgs({ argv: passedArgs });

  t.deepEqual(args, expected, 'testing bare positionals');

  t.end();
});

test('args are true', function(t) {
  const passedArgs = ['--foo', '--bar'];
  const expected = { flags: { foo: true, bar: true }, values: { foo: undefined, bar: undefined }, positionals: [] };
  const args = parseArgs({ argv: passedArgs });

  t.deepEqual(args, expected, 'args are true');

  t.end();
});

test('arg is true and positional is identified', function(t) {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const expected = { flags: { foo: true }, values: { foo: undefined }, positionals: ['b'] };
  const args = parseArgs({ argv: passedArgs });

  t.deepEqual(args, expected, 'arg is true and positional is identified');

  t.end();
});

test('args equals are passed `type: "string"`', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = { so: { type: 'string' } };
  const expected = { flags: { so: true }, values: { so: 'wat' }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected, 'arg value is passed');

  t.end();
});

test('when args include single dash then result stores dash as positional', function(t) {
  const passedArgs = ['-'];
  const expected = { flags: { }, values: { }, positionals: ['-'] };
  const args = parseArgs({ argv: passedArgs });

  t.deepEqual(args, expected);

  t.end();
});

test('zero config args equals are parsed as if `type: "string"`', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = { };
  const expected = { flags: { so: true }, values: { so: 'wat' }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected, 'arg value is passed');

  t.end();
});

test('same arg is passed twice `type: "string"` and last value is recorded', function(t) {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const passedOptions = { foo: { type: 'string' } };
  const expected = { flags: { foo: true }, values: { foo: 'b' }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected, 'last arg value is passed');

  t.end();
});

test('args equals pass string including more equals', function(t) {
  const passedArgs = ['--so=wat=bing'];
  const passedOptions = { so: { type: 'string' } };
  const expected = { flags: { so: true }, values: { so: 'wat=bing' }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected, 'arg value is passed');

  t.end();
});

test('first arg passed for `type: "string"` and "multiples" is in array', function(t) {
  const passedArgs = ['--foo=a'];
  const passedOptions = { foo: { type: 'string', multiples: true } };
  const expected = { flags: { foo: true }, values: { foo: ['a'] }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected, 'first multiple in array');

  t.end();
});

test('args are passed `type: "string"` and "multiples"', function(t) {
  const passedArgs = ['--foo=a', '--foo', 'b'];
  const passedOptions = {
    foo: {
      type: 'string',
      multiples: true,
    },
  };
  const expected = { flags: { foo: true }, values: { foo: ['a', 'b'] }, positionals: [] };
  const args = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(args, expected, 'both arg values are passed');

  t.end();
});

test('order of option and positional does not matter (per README)', function(t) {
  const passedArgs1 = ['--foo=bar', 'baz'];
  const passedArgs2 = ['baz', '--foo=bar'];
  const passedOptions = { foo: { type: 'string' } };
  const expected = { flags: { foo: true }, values: { foo: 'bar' }, positionals: ['baz'] };

  t.deepEqual(parseArgs({ argv: passedArgs1, options: passedOptions }), expected, 'option then positional');
  t.deepEqual(parseArgs({ argv: passedArgs2, options: passedOptions }), expected, 'positional then option');

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
  const result = parseArgs({ argv: passedArgs, options: passedOptions });

  t.deepEqual(result, expected, 'excess option dashes are retained');

  t.end();
});

// Test bad inputs

test('invalid argument passed for options', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = 'bad value';

  t.throws(function() { parseArgs({ argv: passedArgs, options: passedOptions }); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });

  t.end();
});

test('boolean passed to "type" option', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = { foo: { type: true } };

  t.throws(function() { parseArgs({ argv: passedArgs, options: passedOptions }); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });

  t.end();
});

test('invalid union value passed to "type" option', function(t) {
  const passedArgs = ['--so=wat'];
  const passedOptions = { foo: { type: 'str' } };

  t.throws(function() { parseArgs({ argv: passedArgs, options: passedOptions }); }, {
    code: 'ERR_INVALID_ARG_TYPE'
  });

  t.end();
});

// Test strict mode

test('unknown long option --bar', function(t) {
  const passedArgs = ['--foo', '--bar'];
  const passedOptions = { foo: { type: 'string' } };
  const strict = true;

  t.throws(function() { parseArgs({ strict, argv: passedArgs, options: passedOptions }); }, {
    code: 'ERR_UNKNOWN_OPTION'
  });

  t.end();
});

test('unknown short option --b', function(t) {
  const passedArgs = ['--foo', '-b'];
  const passedOptions = { foo: { type: 'string' } };
  const strict = true;

  t.throws(function() { parseArgs({ strict, argv: passedArgs, options: passedOptions }); }, {
    code: 'ERR_UNKNOWN_OPTION'
  });

  t.end();
});

test('unknown option -r in short option group -bar', function(t) {
  const passedArgs = ['--foo', '-bar'];
  const passedOptions = { foo: { type: 'string' }, b: { type: 'string' }, a: { type: 'string' } };
  const strict = true;

  t.throws(function() { parseArgs({ strict, argv: passedArgs, options: passedOptions }); }, {
    code: 'ERR_UNKNOWN_OPTION'
  });

  t.end();
});

test('unknown option with explicit value', function(t) {
  const passedArgs = ['--foo', '--bar=baz'];
  const passedOptions = { foo: { type: 'string' } };
  const strict = true;

  t.throws(function() { parseArgs({ strict, argv: passedArgs, options: passedOptions }); }, {
    code: 'ERR_UNKNOWN_OPTION'
  });

  t.end();
});

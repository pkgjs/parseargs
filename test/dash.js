'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

// The use of `-` as a positional is specifically mentioned in the Open Group Utility Conventions.
// The interpretation is up to the utility, and for a file positional (operand) the examples are
// '-' may stand for standard input (or standard output), or for a file named -.
// https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
test("when args include '-' used as positional then result has '-' in positionals", function(t) {
  const passedArgs = ['-'];

  const args = parseArgs(passedArgs);
  const expected = { flags: {}, values: {}, positionals: ['-'] };
  t.deepEqual(args, expected);

  t.end();
});

// If '-' is a valid positional, it is symmetrical to allow it as an option value too.
test("when args include '-' used as space-separated option value then result has '-' in option value", function(t) {
  const passedArgs = ['-v', '-'];
  const options = { withValue: ['v'] };

  const args = parseArgs(passedArgs, options);
  const expected = { flags: { v: true }, values: { v: '-' }, positionals: [] };
  t.deepEqual(args, expected);

  t.end();
});

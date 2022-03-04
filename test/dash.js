'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

// The use of `-` as a positional is specifically mentioned in the Open Group Utility Conventions.
// The interpretation is up to the utility, and for a file positional (operand) the examples are
// '-' may stand for standard input (or standard output), or for a file named -.
// https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html
test("dash: when args include '-' used as positional then result has '-' in positionals", (t) => {
  const passedArgs = ['-'];
  const expected = { flags: {}, values: {}, positionals: ['-'] };

  const result = parseArgs({ args: passedArgs });

  t.deepEqual(result, expected);
  t.end();
});

// If '-' is a valid positional, it is symmetrical to allow it as an option value too.
test("dash: when args include '-' used as space-separated option value then result has '-' in option value", (t) => {
  const passedArgs = ['-v', '-'];
  const options = { v: { type: 'string' } };
  const expected = { flags: { v: true }, values: { v: '-' }, positionals: [] };

  const result = parseArgs({ args: passedArgs, options });

  t.deepEqual(result, expected);
  t.end();
});

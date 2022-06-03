'use strict';

// How might I add my own support for --no-foo?

// 1. const { parseArgs } = require('node:util'); // from node
// 2. const { parseArgs } = require('@pkgjs/parseargs'); // from package
const { parseArgs } = require('..'); // in repo

const { values, tokens } = parseArgs({ strict: false, tokens: true });

// Reprocess the option tokens and overwrite the returned values.
// (NB: not supporting `multiples` in this code.)
tokens
  .filter((token) => token.kind === 'option')
  .forEach((token) => {
    if (token.name.startsWith('no-')) {
      // Store foo:false for --no-foo
      const positiveName = token.name.slice(3);
      values[positiveName] = false;
      delete values[token.name];
    } else {
      // Resave value so last one wins if both --foo and --no-foo.
      values[token.name] = (token.value != null) ? token.value : true;
    }
  });

console.log(values);

// Try the following:
//   node negate.js --foo
//   node negate.js --foo --no-foo
//   node negate.js --foo --no-foo --foo
//   node negate.js --foo=FOO --no-foo
//   node negate.js --no-foo --foo=FOO

'use strict';

// How might I add my own support for --no-foo?
// (Not supporting multiples.)

// 1. const { parseArgs } = require('node:util'); // from node
// 2. const { parseArgs } = require('@pkgjs/parseargs'); // from package
const { parseArgs } = require('..'); // in repo

function myParseArgs(config) {
  // Get the tokens for reprocessing.
  const detailedConfig = Object.assign({}, config, { details: true });
  const result = parseArgs(detailedConfig);

  result.tokens
    .filter((token) => token.kind === 'option')
    .forEach((token) => {
      if (token.name.startsWith('no-')) {
        // Store foo:false for --no-foo
        const positiveName = token.name.slice(3);
        result.values[positiveName] = false;
        delete result.values[token.name];
      } else {
        // Resave value so last one wins if both --foo and --no-foo.
        result.values[token.name] = (token.value != null) ? token.value : true;
      }
    });

  // Remove the tokens if caller did not ask for them.
  if (!config.details) {
    delete result.tokens;
  }
  return result;
}

const { values } = myParseArgs({ strict: false });
console.log(values);

// Try the following:
//   node negate.js --foo
//   node negate.js --foo --no-foo
//   node negate.js --foo --no-foo --foo

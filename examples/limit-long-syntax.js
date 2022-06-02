'use strict';

// How might I require long options with values use '='?
// So allow `--foo=bar`, and not allow `--foo bar`.

// 1. const { parseArgs } = require('node:util'); // from node
// 2. const { parseArgs } = require('@pkgjs/parseargs'); // from package
const { parseArgs } = require('..'); // in repo

const options = {
  file: { short: 'f', type: 'string' },
  log: { type: 'string' },
};

const { values, tokens } = parseArgs({ options, details: true });

const badToken = tokens.find((token) => token.kind === 'option' &&
 options[token.name].type === 'string' &&
 token.optionUsed.startsWith('--') &&
 !token.inlineValue);
if (badToken) {
  throw new Error(`Option value for '${badToken.optionUsed}' must be inline, like '${badToken.optionUsed}=VALUE'`);
}

console.log(values);

// Try the following:
//    node limited-long-syntax.js -f FILE --log=LOG
//    node limited-long-syntax.js --file FILE

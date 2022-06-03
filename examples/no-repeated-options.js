'use strict';

// How might I throw if an option is repeated?

// 1. const { parseArgs } = require('node:util'); // from node
// 2. const { parseArgs } = require('@pkgjs/parseargs'); // from package
const { parseArgs } = require('..'); // in repo

const options = {
  ding: { type: 'boolean', short: 'd' },
  beep: { type: 'boolean', short: 'b' }
};
const { values, tokens } = parseArgs({ options, tokens: true });

// Loop over values and find the options that were repeated.
const repeatedTokens = Object.keys(values)
  // Make arrays of tokens for each used option name.
  .map((name) => tokens.filter((t) => t.kind === 'option' && t.name === name))
  .filter((used) => used.length > 1);
if (repeatedTokens.length > 0) {
  const optionsUsed = repeatedTokens[0].map((token) => token.optionUsed);
  throw new Error(`option used multiple times: ${optionsUsed.join(', ')}`);
}

console.log(values);

// Try the following:
//    node no-repeated-options --ding --beep
//    node no-repeated-options -b --beep
//    node no-repeated-options -ddd

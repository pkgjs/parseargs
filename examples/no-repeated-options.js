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

const seenBefore = new Set();
const repeatedToken = tokens
  .filter((t) => t.kind === 'option')
  .find((t) => {
    if (seenBefore.has(t.name)) return true;
    seenBefore.add(t.name);
    return false;
  });
if (repeatedToken)
  throw new Error(`option '${repeatedToken.name}' used multiple times`);


console.log(values);

// Try the following:
//    node no-repeated-options --ding --beep
//    node no-repeated-options --beep -b
//    node no-repeated-options -ddd

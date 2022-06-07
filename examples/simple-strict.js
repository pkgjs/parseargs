'use strict';

// This example is used in the documentation.

// 1. const { parseArgs } = require('node:util'); // from node
// 2. const { parseArgs } = require('@pkgjs/parseargs'); // from package
const { parseArgs } = require('..'); // in repo

const options = {
  foo: { type: 'boolean', short: 'f' },
  bar: { type: 'string' }
};
try {
  const { values } = parseArgs({ options });
  console.log(values);
} catch (err) {
  console.log(`${err.code}: ${err.message}`);
}

// Try the following:
//    node simple-strict.js -f --bar b
//    node simple-strict.js --oops

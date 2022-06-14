'use strict';

// This example is used in the documentation.

// 1. const { parseArgs } = require('node:util'); // from node
// 2. const { parseArgs } = require('@pkgjs/parseargs'); // from package
const { parseArgs } = require('..'); // in repo

const options = {
  foo: { type: 'boolean', short: 'f' },
  bar: { type: 'string' }
};
const { values } = parseArgs({ options });
console.log(values);

// Try the following:
//    node simple-strict.js -f --bar b

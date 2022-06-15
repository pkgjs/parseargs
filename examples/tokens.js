'use strict';

// This example is used in the documentation.

// 1. const { parseArgs } = require('node:util'); // from node
// 2. const { parseArgs } = require('@pkgjs/parseargs'); // from package
const { parseArgs } = require('..'); // in repo

console.log(parseArgs({ strict: false, tokens: true }));

// Try the following:
//    node tokens.js -xy --foo=BAR -- file.txt
//    node tokens.js one -abc two

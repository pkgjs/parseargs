'use strict';
/* eslint max-len: 0 */
const { parseArgs } = require('../index.js');

// Examples from README for checking got them right!

function show(args, options) {
  console.log('args = %O', args);
  console.log('options = %O', options);
  console.log('---');
  const result = parseArgs({ args, options });
  console.log('parsedOptions = %O', result.parsedOptions);
  console.log('values = %O', result.values);
  console.log('positionals = %O', result.positionals);
  console.log('-------------------------------------------\n');
}

let args;
let options;

args = ['-f', '--foo=a', '--bar', 'b'];
options = {};
show(args, options);

args = ['-f', '--foo=a', '--bar', 'b'];
options = {
  bar: {
    type: 'string',
  },
};
show(args, options);

args = ['-f', '--foo=a', '--foo', 'b'];
options = {
  foo: {
    type: 'string',
    multiple: true,
  },
};
show(args, options);

args = ['-f', 'b'];
options = {
  foo: {
    short: 'f',
  },
};
show(args, options);

// This is an example of adding support for an option with an optional value,
// which can be used like a boolean-type or a string-type.

import { parseArgs } from 'node:util';
import process from 'node:process';

const options = {
  'host': {
    type: 'string', short: 'h', default: 'default.com',
    preset: 'localhost'
  },
  'debug': { type: 'boolean', short: 'd' },
};

const args = process.argv.slice(2);

do {
  const { tokens } = parseArgs({ args, options, strict: false, tokens: true });
  // Insert preset if:
  // - missing value, like: --host
  // - value came from following option argument, like: --host --debug
  // An empty string is a valid value for a string-type option.
  const needsPreset = tokens.find((token) =>
    token.kind === 'option' &&
    options[token.name] &&
    options[token.name].type === 'string' &&
    options[token.name].preset !== undefined &&
    (
      token.value === undefined ||
      (token.value.startsWith('-') && !token.inlineValue)
    ));

  if (!needsPreset) break;

  // Add preset value as an inline value to the original argument.
  const joiner = args[needsPreset.index].startsWith('--') ? '=' : '';
  args[needsPreset.index] = `${args[needsPreset.index]}${joiner}${options[needsPreset.name].preset}`;

} while (true);


const { values } = parseArgs({ args, options });
console.log(values);

// Try the following:
//   node optional-value.mjs
//   node optional-value.mjs -h
//   node optional-value.mjs --host
//   node optional-value.mjs -hHOSTNAME
//   node optional-value.mjs --host=HOSTNAME
//   node optional-value.mjs --host=
//   node optional-value.mjs -h -d
//   node optional-value.mjs -dh
//   node optional-value.mjs --host --debug
//   node optional-value.mjs --host -- POSITIONAL

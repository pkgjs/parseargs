// Now might I enforce that two flags are specified in a specific order?

import { parseArgs } from '../index.js';

function findTokenIndex(tokens, target) {
  return tokens.findIndex((token) => token.kind === 'option' &&
    token.name === target
  );
}

const experimentalName = 'enable-experimental-options';
const unstableName = 'some-unstable-option';

const options = {};
options[experimentalName] = { type: 'boolean' };
options[unstableName] = { type: 'boolean' };

const { values, tokens } = parseArgs({ options, tokens: true });

const experimentalIndex = findTokenIndex(tokens, experimentalName);
const unstableIndex = findTokenIndex(tokens, unstableName);
if (unstableIndex !== -1 &&
  ((experimentalIndex === -1) || (unstableIndex < experimentalIndex))) {
  throw new Error(`'--${experimentalName}' must be specified before '--${unstableName}'`);
}

console.log(values);

/* eslint-disable max-len */
// Try the following:
//    node ordered-options.mjs
//    node ordered-options.mjs --some-unstable-option
//    node ordered-options.mjs --some-unstable-option --enable-experimental-options
//    node ordered-options.mjs --enable-experimental-options --some-unstable-option

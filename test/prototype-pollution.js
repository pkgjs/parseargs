'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

test('should not allow __proto__ key to be set on object', (t) => {
  const args = ['--__proto__=hello'];
  const expected = { values: {}, positionals: [] };

  const result = parseArgs({ strict: false, args });

  t.deepEqual({ ...result.values }, expected.values);
  t.end();
});

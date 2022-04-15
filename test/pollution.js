'use strict';
/* eslint max-len: 0 */

const test = require('tape');
const { parseArgs } = require('../index.js');

// These tests are not synced upstream with node, as hacking global prototypes.

function setObjectPrototype(prop, value) {
  const oldValue = Object.prototype[prop];
  Object.prototype[prop] = value;
  return oldValue;
}

function restoreObjectPrototype(prop, oldValue) {
  if (oldValue == null) {
    delete Object.prototype[prop];
  } else {
    Object.prototype[prop] = oldValue;
  }
}

test('when prototype has multiple then ignored', (t) => {
  const args = ['--foo', '1', '--foo', '2'];
  const options = { foo: { type: 'string' } };
  const expectedResult = { values: { foo: '2' }, positionals: [] };

  const holdValue = setObjectPrototype('multiple', true);
  const result = parseArgs({ args, options });
  restoreObjectPrototype('multiple', holdValue);
  t.deepEqual(result, expectedResult);
  t.end();
});

test('when prototype has type then ignored', (t) => {
  const args = ['--foo', '1'];
  const options = { foo: { } };

  const holdValue = setObjectPrototype('type', 'string');
  t.throws(() => {
    parseArgs({ args, options });
  });
  restoreObjectPrototype('type', holdValue);
  t.end();
});

test('when prototype has short then ignored', (t) => {
  const args = ['-f', '1'];
  const options = { foo: { type: 'string' } };

  const holdValue = setObjectPrototype('short', 'f');
  t.throws(() => {
    parseArgs({ args, options });
  });
  restoreObjectPrototype('short', holdValue);
  t.end();
});

test('when prototype has strict then ignored', (t) => {
  const args = ['-f'];

  const holdValue = setObjectPrototype('strict', false);
  t.throws(() => {
    parseArgs({ args });
  });
  restoreObjectPrototype('strict', holdValue);
  t.end();
});

test('when prototype has args then ignored', (t) => {
  const holdValue = setObjectPrototype('args', ['--foo']);
  const result = parseArgs({ strict: false });
  restoreObjectPrototype('args', holdValue);
  t.false(result.values.foo);
  t.end();
});

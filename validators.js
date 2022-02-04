'use strict';

const {
  ArrayIsArray,
} = require('./primordials');

const {
  codes: {
    ERR_INVALID_ARG_TYPE
  }
} = require('./errors');

function validateArray(value, name) {
  if (!ArrayIsArray(value)) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
  }
}

/**
 * @param {unknown} value
 * @param {string} name
 * @param {{
 *   allowArray?: boolean,
 *   allowFunction?: boolean,
 *   nullable?: boolean
 * }} [options]
 */
function validateObject(value, name, options) {
  const useDefaultOptions = options == null;
  const allowArray = useDefaultOptions ? false : options.allowArray;
  const allowFunction = useDefaultOptions ? false : options.allowFunction;
  const nullable = useDefaultOptions ? false : options.nullable;
  if ((!nullable && value === null) ||
      (!allowArray && ArrayIsArray(value)) ||
      (typeof value !== 'object' && (
        !allowFunction || typeof value !== 'function'
      ))) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
  }
}

module.exports = {
  validateArray,
  validateObject,
};

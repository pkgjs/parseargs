'use strict';

class ERR_INVALID_ARG_TYPE extends TypeError {
  constructor(name, expected, actual) {
    super(`${name} must be ${expected} got ${actual}`);
    this.code = 'ERR_INVALID_ARG_TYPE';
  }
}

class ERR_UNKNOWN_OPTION extends Error {
  constructor(option) {
    super(`Unknown option '${option}' is not permitted in strict mode`);
    this.code = 'ERR_UNKNOWN_OPTION';
  }
}

module.exports = {
  codes: {
    ERR_UNKNOWN_OPTION,
    ERR_INVALID_ARG_TYPE,
  }
};

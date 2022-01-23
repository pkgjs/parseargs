'use strict';

class ERR_INVALID_ARG_TYPE extends TypeError {
  constructor(name, expected, actual) {
    super(`${name} must be ${expected} got ${actual}`);
    this.code = 'ERR_INVALID_ARG_TYPE';
  }
}

class ERR_NOT_IMPLEMENTED extends Error {
  constructor(feature) {
    super(`${feature} not implemented`);
  }
}

module.exports = {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_NOT_IMPLEMENTED
  }
};

'use strict';

class ERR_INVALID_ARG_TYPE extends TypeError {
  constructor(name, expected, actual) {
    super(`${name} must be ${expected} got ${actual}`);
    this.code = 'ERR_INVALID_ARG_TYPE';
  }
}

class ERR_INVALID_SHORT_OPTION extends TypeError {
  constructor(longOption, shortOption) {
    super(`options.${longOption}.short must be a single character, got '${shortOption}'`);
    this.code = 'ERR_INVALID_SHORT_OPTION';
  }
}

module.exports = {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_SHORT_OPTION
  }
};

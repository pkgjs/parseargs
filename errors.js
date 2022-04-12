'use strict';

class ERR_INVALID_ARG_TYPE extends TypeError {
  constructor(name, expected, actual) {
    super(`${name} must be ${expected} got ${actual}`);
    this.code = 'ERR_INVALID_ARG_TYPE';
  }
}

class ERR_INVALID_ARG_VALUE extends TypeError {
  constructor(arg1, arg2, expected) {
    super(`The property ${arg1} ${expected}. Received '${arg2}'`);
    this.code = 'ERR_INVALID_ARG_VALUE';
  }
}

class ERR_PARSE_ARGS_INVALID_OPTION_VALUE extends Error {
  constructor(message) {
    super(message);
    this.code = 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE';
  }
}

class ERR_PARSE_ARGS_UNKNOWN_OPTION extends Error {
  constructor(option) {
    super(`Unknown option '${option}'`);
    this.code = 'ERR_PARSE_ARGS_UNKNOWN_OPTION';
  }
}

module.exports = {
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_PARSE_ARGS_INVALID_OPTION_VALUE,
    ERR_PARSE_ARGS_UNKNOWN_OPTION,
  }
};

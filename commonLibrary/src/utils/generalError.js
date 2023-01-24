const httpStatusCode = require('../constants/httpStatusCode');

class GeneralError extends Error {
  constructor(message, data = '', statusCode = '') {
    super();
    this.message = message || null;
    this.statusCode = statusCode !== '' ? statusCode : null ;
    this.data = data !== '' ? data : null;
  }

  getCode() {
    if (this instanceof BadRequest) {
      return httpStatusCode.HTTP_BAD_REQUEST;
    }
    if (this instanceof UnAuthorized) {
      return httpStatusCode.HTTP_UNAUTHORIZED;
    }
    return httpStatusCode.HTTP_SERVER_ERROR;
  }
}

class BadRequest extends GeneralError {}
class UnAuthorized extends GeneralError {}

module.exports = {
  GeneralError,
  BadRequest,
  UnAuthorized
};

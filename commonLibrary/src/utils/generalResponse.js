const httpStatusCode = require('../constants/httpStatusCode');

class GeneralResponse {
  constructor(message, data = '', statusCode = '') {
    this.message = message;
    this.statusCode = statusCode !== '' ? statusCode : httpStatusCode.HTTP_SUCCESS;
    this.data = data !== '' ? data : null;
  }
}

module.exports = {
  GeneralResponse
};

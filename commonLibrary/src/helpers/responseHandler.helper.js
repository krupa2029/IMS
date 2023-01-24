const httpStatusCode = require("../constants/httpStatusCode");
const { GeneralResponse } = require("../utils/generalResponse");

const handleResponse = (response, req, res, next) => {
    if (response instanceof GeneralResponse) {
      return res.status(httpStatusCode.HTTP_SUCCESS).json({
        httpStatus       : response.statusCode,
        statusMessage    : response.statusCode === httpStatusCode.HTTP_SUCCESS ? httpStatusCode.SUCCESS : httpStatusCode.ERROR,
        message          : response.message || null,
        data             : response.data || null,
        validationErrors : null
      });
    }
    return next(response);
  };
  

module.exports = handleResponse;

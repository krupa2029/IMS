const httpStatusCode = require("../constants/httpStatusCode");
const messages = require("../constants/messages");
const { BadRequest, GeneralError } = require("../utils/generalError");

const handleErrors = (err, req, res, next) => {
  console.log('Error', err);
    if (err instanceof GeneralError) {
      const errorData = err.data || null;
      return res
        .status(err.statusCode || err.getCode())
        .json({
          httpStatus       : err.statusCode || err.getCode(),
          statusMessage    : httpStatusCode.ERROR,
          message          : err.message,
          data             : err.statusCode != httpStatusCode.HTTP_BAD_REQUEST ? errorData : null,
          validationErrors : err.statusCode == httpStatusCode.HTTP_BAD_REQUEST ? errorData : null
        });
    }
  
    return res.status(err.statusCode || httpStatusCode.HTTP_SERVER_ERROR)
    .json({
      httpStatus:
        err.statusCode || httpStatusCode.HTTP_SERVER_ERROR,
      statusMessage    : httpStatusCode.ERROR,
      message          : messages.GLOBAL_ERROR,
      data             : null,
      validationErrors : null
    });
  };
  
  const handleJoiErrors = (err, req, res, next) => {
    // Handle joi error
    if (err && err.error && err.error.isJoi) {
      const customErrorResponse = {};
      if (err.error.details.length !== 0) {
        err.error.details.forEach((item) => {
          customErrorResponse[`${item.context.key}`] = {
            message : item.message,
            context : item.context.label,
            type    : item.type
          };
        });
      }
      next(new BadRequest('Validation Error', customErrorResponse, 400));
    } else {
      // pass on to another error handler
      next(err);
    }
  };
  
  // Catch (Global) Error in Async Method
  const catchAsyncError = (func) => (req, res, next) => {
    func(req, res, next)
      .catch((err) => {
        next(err)
      });
  };

  module.exports = { handleErrors, handleJoiErrors, catchAsyncError };
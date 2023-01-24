const { catchAsyncError } = require("../../../../commonLibrary/src/helpers/errorHandler.helper");
const { GeneralResponse } = require("../../../../commonLibrary/src/utils/generalResponse");

module.exports = {
  addEditInventory: catchAsyncError(async (req, res, next) => {
    console.log('Hello');
    return next(new GeneralResponse('Demo api'));
  })
}
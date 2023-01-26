const httpStatusCode = require("../../../../commonLibrary/src/constants/httpStatusCode");
const {
  catchAsyncError,
} = require("../../../../commonLibrary/src/helpers/errorHandler.helper");
const { convertToObjectId } = require("../../../../commonLibrary/src/utils/commonMethods");
const {
  GeneralResponse,
} = require("../../../../commonLibrary/src/utils/generalResponse");
const messages = require("../constants/messages");

module.exports = {
    
  addEditLocation: catchAsyncError(async (req, res, next) => {
    const { locationId, name, image, isDeleted } = req.body;
    const collection = db.collection("locations");
    const id = convertToObjectId(locationId);
    let responseMessage;
   
    const locationExist = await collection.countDocuments({
      name,
      _id: { $ne: id }
    });

    const locationData = {
        name,
        image,
        isDeleted
    };

    if (locationExist > 0) {
      return next(
        new GeneralResponse(
          messages.LOCATION_ALREADY_EXIST,
          null,
          httpStatusCode.HTTP_BAD_REQUEST
        )
      );
    }

    if (!locationId) {
      await collection.insertOne(locationData);
      responseMessage = messages.ADD_LOCATION_SUCCESS;
    } else if (locationId) {
      const filter = { _id: id };
      const updateDoc = {
        $set: locationData
      };
      await collection.updateOne(filter, updateDoc);
      responseMessage = messages.UPDATE_LOCATION_SUCCESS;
    }
    
    return next(
      new GeneralResponse(
        responseMessage,
        null,
        httpStatusCode.HTTP_SUCCESS
      )
    );
  }),
};

const httpStatusCode = require("../../../../commonLibrary/src/constants/httpStatusCode");
const {
  catchAsyncError,
} = require("../../../../commonLibrary/src/helpers/errorHandler.helper");
const {
  convertToObjectId,
} = require("../../../../commonLibrary/src/utils/commonMethods");
const {
  GeneralResponse,
} = require("../../../../commonLibrary/src/utils/generalResponse");
const messages = require("../constants/messages");

module.exports = {
  addEditLocation: catchAsyncError(async (req, res, next) => {
    const { id, name, image, isDeleted } = req.body;
    const locationCollection = db.collection("locations");
    const locationId = id ? convertToObjectId(id) : null;
    let responseMessage;

    const locationExist = await locationCollection.countDocuments({
      name: { $regex: name, $options: "i" },
      _id: { $ne: locationId }
    });

    const locationData = {
      name,
      image,
      isDeleted,
    };

    if (locationExist > 0) {
      return next(
        new GeneralResponse(
          messages.LOCATION_ALREADY_EXIST,
          httpStatusCode.HTTP_BAD_REQUEST
        )
      );
    }

    if (!locationId) {
      await locationCollection.insertOne(locationData);
      responseMessage = messages.ADD_LOCATION_SUCCESS;
    } else if (locationId) {
      const filter = { _id: locationId };
      const updateDoc = {
        $set: locationData,
      };
      const response = await locationCollection.updateOne(filter, updateDoc);
      if (response.matchedCount === 0) {
        return next(
          new GeneralResponse(
            messages.LOCATION_ID_NOT_EXIST,
            httpStatusCode.HTTP_BAD_REQUEST
          )
        );
      }
      responseMessage = messages.UPDATE_LOCATION_SUCCESS;
    }

    return next(
      new GeneralResponse(responseMessage, httpStatusCode.HTTP_SUCCESS)
    );
  })
};

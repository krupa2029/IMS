const httpStatusCode = require("../../../../commonLibrary/src/constants/httpStatusCode");
const { catchAsyncError } = require("../../../../commonLibrary/src/helpers/errorHandler.helper");
const { convertToObjectId } = require("../../../../commonLibrary/src/utils/commonMethods");
const { GeneralResponse } = require("../../../../commonLibrary/src/utils/generalResponse");
const messages = require("../constants/messages");

module.exports = {
  addEditUser: catchAsyncError(async (req, res, next) => {
    const { id, firstName, lastName, email, phone, address, roleId} = req.body;
    const userCollection = db.collection("users");
    const userId = id ? convertToObjectId(id) : null;
    let responseMessage;

    const userExist = await userCollection.countDocuments({
      email: { $regex: email, $options: "i" },
      _id: { $ne: userId },
    });

    if (userExist > 0) {
      return next(
        new GeneralResponse(
          messages.USER_ALREADY_EXIST,
          httpStatusCode.HTTP_BAD_REQUEST
        )
      );
    }

    const userData = {
      firstName,
      lastName,
      email,
      phone,
      address,
      roleId
    };

    if (!userId) {
      await userCollection.insertOne(userData);
      responseMessage = messages.ADD_USER_SUCCESS;
    } else if (userId) {
      const filter = { _id: userId };
      const updateDoc = {
        $set: userData
      };
      const response = await userCollection.updateOne(filter, updateDoc);
      if (response.matchedCount === 0) {
        return next(
          new GeneralResponse(
            messages.USER_ID_NOT_EXIST,
            httpStatusCode.HTTP_BAD_REQUEST
          )
        );
      }
      responseMessage = messages.UPDATE_USER_SUCCESS;
    }

    return next(
      new GeneralResponse(responseMessage, httpStatusCode.HTTP_SUCCESS)
    );
  })
}
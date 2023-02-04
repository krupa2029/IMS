const httpStatusCode = require("../../../../commonLibrary/src/constants/httpStatusCode");
const {
  generateToken,
} = require("../../../../commonLibrary/src/helpers/auth.helper");
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
  addEditUser: catchAsyncError(async (req, res, next) => {
    const { id, firstName, lastName, email, phone, address, roleId } = req.body;
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
      roleId: convertToObjectId(roleId),
    };

    if (!userId) {
      await userCollection.insertOne(userData);
      responseMessage = messages.ADD_USER_SUCCESS;
    } else if (userId) {
      const filter = { _id: userId };
      const updateDoc = {
        $set: userData,
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
  }),

  userLogin: catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    const userCollection = db.collection("users");
   
    const user = await userCollection
      .aggregate([
        {
          $match: { email: email },
        },
        {
          $limit: 1,
        },
        {
          $lookup: {
            from: "roles",
            localField: "roleId",
            foreignField: "_id",
            as: "roleDetails",
          },
        },
        {
          $lookup: {
            from: "permissions",
            localField: "roleDetails.permissionIds",
            foreignField: "_id",
            as: "permissions",
          },
        },
        {
          $match: {
            "permissions.isDeleted": false,
          },
        },
        {
          $project: {
            roleId: 0,
            "roleDetails.permissionIds": 0,
            "permissions.isDeleted": 0,
            "permissions.name": 0,
            "permissions._id": 0,
          },
        },
      ])
      .toArray();

    if (user.length === 0) {
      return next(
        new GeneralResponse(
          messages.USER_EMAIL_NOT_EXIST,
          httpStatusCode.HTTP_BAD_REQUEST
        )
      );
    }

    let responseData = user[0];
    responseData.roleDetails = responseData?.roleDetails[0];
    const permissionList = responseData?.permissions.map((p) => p.code);
    responseData.roleDetails.permissions = permissionList;
    delete responseData.permissions;

    const token = generateToken({
      userId: responseData._id,
      fullName: `${responseData.firstName} ${responseData.lastName}`,
      email: responseData.email,
    });

    data = {
      accessToken: token,
      userDetails: responseData,
    };

    return next(new GeneralResponse(messages.USER_LOGIN_SUCCESS, httpStatusCode.HTTP_SUCCESS, data));
  }),
};

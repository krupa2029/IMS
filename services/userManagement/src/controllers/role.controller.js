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
  addEditRole: catchAsyncError(async (req, res, next) => {
    const { id, name, permissionIds, isDeleted } = req.body;
    const roleCollection = db.collection("roles");
    const roleId = id ? convertToObjectId(id) : null;
    let responseMessage;

    const roleExist = await roleCollection.countDocuments({
      name: { $regex: name, $options: "i" },
      _id: { $ne: roleId },
    });

    if (roleExist > 0) {
      return next(
        new GeneralResponse(
          messages.ROLE_ALREADY_EXIST,
          httpStatusCode.HTTP_BAD_REQUEST
        )
      );
    }

    const roleData = {
      name,
      isDeleted,
      permissionIds: permissionIds.map(id => convertToObjectId(id))
    };

    if (!roleId) {
      await roleCollection.insertOne(roleData);
      responseMessage = messages.ADD_ROLE_SUCCESS;
    } else if (roleId) {
      const filter = { _id: roleId };
      const updateDoc = {
        $set: roleData
      };
      const response = await roleCollection.updateOne(filter, updateDoc);
      if (response.matchedCount === 0) {
        return next(
          new GeneralResponse(
            messages.ROLE_ID_NOT_EXIST,
            httpStatusCode.HTTP_BAD_REQUEST
          )
        );
      }
      responseMessage = messages.UPDATE_ROLE_SUCCESS;
    }

    return next(
      new GeneralResponse(responseMessage, httpStatusCode.HTTP_SUCCESS)
    );
  }),

  addEditPermission: catchAsyncError(async (req, res, next) => {
    const { id, name, code, isDeleted } = req.body;
    const permissionCollection = db.collection("permissions");
    const permissionId = id ? convertToObjectId(id) : null;
    let responseMessage;

    const permissionExist = await permissionCollection.countDocuments({
      code: { $regex: code, $options: "i" },
      _id: { $ne: permissionId },
    });
    console.log(permissionExist);

    if (permissionExist > 0) {
      return next(
        new GeneralResponse(
          messages.PERMISSION_ALREADY_EXIST,
          httpStatusCode.HTTP_BAD_REQUEST
        )
      );
    }

    const permissionData = {
      code,
      name,
      isDeleted
    };

    if (!permissionId) {
      await permissionCollection.insertOne(permissionData);
      responseMessage = messages.ADD_PERMISSION_SUCCESS;
    } else if (permissionId) {
      const filter = { _id: permissionId };
      const updateDoc = {
        $set: permissionData,
      };
      const response = await permissionCollection.updateOne(filter, updateDoc);
      if (response.matchedCount === 0) {
        return next(
          new GeneralResponse(
            messages.PERMISSION_ID_NOT_EXIST,
            httpStatusCode.HTTP_BAD_REQUEST
          )
        );
      }
      responseMessage = messages.UPDATE_PERMISSION_SUCCESS;
    }

    return next(
      new GeneralResponse(responseMessage, httpStatusCode.HTTP_SUCCESS)
    );
  }),
};

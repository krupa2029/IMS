const {
  catchAsyncError,
} = require("../../../../commonLibrary/src/helpers/errorHandler.helper");
const { convertToObjectId } = require("../../../../commonLibrary/src/utils/commonMethods");
const {
  GeneralResponse,
} = require("../../../../commonLibrary/src/utils/generalResponse");
const { INVENTORY_CATEGORY_CODE } = require("../constants/enums");

module.exports = {
  addEditInventory: catchAsyncError(async (req, res, next) => {
    const {
      id,
      name,
      description,
      image,
      category,
      purchaseDate,
      modelNumber,
      locationId,
      availableQuantity,
      totalQuantity,
      canBeCheckedOut,
      isDeleted
    } = req.body;

    const collectionName = (category === INVENTORY_CATEGORY_CODE.MATERIAL) ? 'materials' : 'equipment' 
    const inventoryCollection = db.collection(collectionName);
    const inventoryId = id ? convertToObjectId(id) : null;
    let responseMessage;

    const inventoryExist = await inventoryCollection.countDocuments({
      modelNumber: { $regex: modelNumber, $options: "i" },
      _id: { $ne: inventoryId },
    });

    if (inventoryExist > 0) {
      return next(
        new GeneralResponse(
          messages.INVENTORY_ALREADY_EXIST,
          httpStatusCode.HTTP_BAD_REQUEST
        )
      );
    }

    const inventoryData = {
      name,
      description,
      image,
      purchaseDate,
      modelNumber,
      locationId : convertToObjectId(locationId),
      availableQuantity,
      totalQuantity,
      canBeCheckedOut,
      isDeleted
    };

    if (!inventoryId) {
      await inventoryCollection.insertOne(inventoryData);
      responseMessage = messages.ADD_INVENTORY_SUCCESS;
    } else if (inventoryId) {
      const filter = { _id: inventoryId };
      const updateDoc = {
        $set: inventoryData
      };
      const response = await inventoryCollection.updateOne(filter, updateDoc);
      if (response.matchedCount === 0) {
        return next(
          new GeneralResponse(
            messages.INVENTORY_ID_NOT_EXIST,
            httpStatusCode.HTTP_BAD_REQUEST
          )
        );
      }
      responseMessage = messages.UPDATE_INVENTORY_SUCCESS;
    }

    return next(
      new GeneralResponse(responseMessage, httpStatusCode.HTTP_SUCCESS)
    );
  }),
};

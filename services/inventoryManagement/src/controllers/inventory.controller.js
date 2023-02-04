const httpStatusCode = require("../../../../commonLibrary/src/constants/httpStatusCode");
const {
  getDateUTC,
} = require("../../../../commonLibrary/src/helpers/dateTime.helper");
const {
  catchAsyncError,
} = require("../../../../commonLibrary/src/helpers/errorHandler.helper");
const {
  convertToObjectId,
} = require("../../../../commonLibrary/src/utils/commonMethods");
const {
  GeneralResponse,
} = require("../../../../commonLibrary/src/utils/generalResponse");
const { INVENTORY_CATEGORY_CODE } = require("../constants/enums");
const messages = require("../constants/messages");

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
      totalQuantity,
      canBeCheckedout,
      isDeleted,
    } = req.body;

    const collectionName =
      category === INVENTORY_CATEGORY_CODE.MATERIAL ? "materials" : "equipment";
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
      locationId: convertToObjectId(locationId),
      totalQuantity,
      canBeCheckedout,
      isDeleted,
    };

    if (!inventoryId) {
      await inventoryCollection.insertOne({
        ...inventoryData,
        availableQuantity: totalQuantity,
      });
      responseMessage = messages.ADD_INVENTORY_SUCCESS;
    } else if (inventoryId) {
      const inventory = await inventoryCollection.findOne({
        _id: inventoryId,
      });
      const quantityDiff = totalQuantity - inventory.totalQuantity;
      const availableQuantity = inventory.availableQuantity + quantityDiff;
      if (availableQuantity < 0) {
        ERR_MSG = messages.QUANTITY_DECREASE_LIMIT.replace(
          /<n1>/,
          -quantityDiff
        );
        ERR_MSG =
          inventory.availableQuantity > 1
            ? messages.QUANTITY_DECREASE_LIMIT.replace(
                /<n2>/,
                inventory.availableQuantity
              )
            : messages.QUANTITY_DECREASE_LIMIT.replace(
                /<n2>/,
                inventory.availableQuantity
              ).replace(/items are/, "item is");

        return next(
          new GeneralResponse(ERR_MSG, httpStatusCode.HTTP_BAD_REQUEST)
        );
      }

      const response = await inventoryCollection.updateOne(
        { _id: inventoryId },
        {
          $set: {
            ...inventoryData,
            availableQuantity: availableQuantity,
          },
        }
      );
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

  checkoutInventory: catchAsyncError(async (req, res, next) => {
    const { toolId, toolType, expectedReturnDate, checkoutQuantity, notes } =
      req.body;
    const userId = "63d448b12fabf68afff8a80e";
    const collectionName =
      toolType === INVENTORY_CATEGORY_CODE.MATERIAL ? "materials" : "equipment";
    const inventoryCollection = db.collection(collectionName);
    const inventoryCheckoutCollection = db.collection("inventory-checkout");
    const checkoutDateUtc = new Date(getDateUTC(null, "DD-MM-YYYY"));
    const expectedReturnDateUtc = new Date(
      getDateUTC(expectedReturnDate, "DD-MM-YYYY")
    );
    const inventoryId = convertToObjectId(toolId);

    const tool = await inventoryCollection.findOne({
      _id: inventoryId,
    });

    if (tool) {
      if (
        !tool.canBeCheckedout ||
        tool.isDeleted ||
        tool.availableQuantity === 0
      ) {
        return next(
          new GeneralResponse(
            messages.INVENTORY_NOT_AVAILABLE,
            httpStatusCode.HTTP_BAD_REQUEST
          )
        );
      } else if (checkoutQuantity > tool.availableQuantity) {
        const ERR_MSG =
          tool.availableQuantity > 1
            ? messages.INSUFFICIENT_INVENTORY.replace(
                /<n>/,
                tool.availableQuantity
              )
            : messages.INSUFFICIENT_INVENTORY.replace(
                /<n>/,
                tool.availableQuantity
              ).replace(/items/, "item");
        return next(
          new GeneralResponse(ERR_MSG, httpStatusCode.HTTP_BAD_REQUEST)
        );
      }

      const checkoutExist = await inventoryCheckoutCollection.findOne({
        toolId: inventoryId,
        toolType,
        userId,
        checkoutDate: checkoutDateUtc,
      });

      if (checkoutExist) {
        await inventoryCheckoutCollection.updateOne(
          { _id: checkoutExist._id },
          {
            $inc: { checkoutQuantity: checkoutQuantity },
            $set: {
              expectedReturnDate: expectedReturnDateUtc,
            },
          }
        );
      } else {
        const checkoutInventoryData = {
          toolId: inventoryId,
          toolType,
          userId,
          notes,
          checkoutDate: checkoutDateUtc,
          checkoutQuantity,
          isReturned: false,
          expectedReturnDate: expectedReturnDateUtc,
        };

        await inventoryCheckoutCollection.insertOne(checkoutInventoryData);
      }

      await inventoryCollection.updateOne(
        { _id: inventoryId },
        {
          $inc: { availableQuantity: -checkoutQuantity },
        }
      );

      return next(
        new GeneralResponse(
          messages.INVENTORY_CHECKOUT_SUCCESS,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(
      new GeneralResponse(
        messages.INVENTORY_ID_NOT_EXIST,
        httpStatusCode.HTTP_BAD_REQUEST
      )
    );
  }),

  returnInventory: catchAsyncError(async (req, res, next) => {
    const { checkoutId, returnQuantity, returnDate } = req.body;
    const userId = "63d448b12fabf68afff8a80e";
    const returnDateUtc = new Date(getDateUTC(returnDate, "DD-MM-YYYY"));
    const inventoryReturnCollection = db.collection("inventory-return");
    const inventoryCheckoutCollection = db.collection("inventory-checkout");

    const checkoutDetails = await inventoryCheckoutCollection.findOne({
      _id: checkoutId,
    });

    if (checkoutDetails) {
      if (returnQuantity > checkoutDetails.checkoutQuantity) {
        const ERR_MSG =
          checkoutDetails.checkoutQuantity > 1
            ? messages.RETURN_LIMIT.replace(
                /<n>/,
                checkoutDetails.checkoutQuantity
              )
            : messages.RETURN_LIMIT.replace(
                /<n>/,
                checkoutDetails.checkoutQuantity
              ).replace(/items/, "item");
        return next(
          new GeneralResponse(ERR_MSG, httpStatusCode.HTTP_BAD_REQUEST)
        );
      }

      await inventoryReturnCollection.insertOne({
        checkoutId,
        userId,
        returnQuantity,
        returnDate: returnDateUtc,
      });

      await inventoryCheckoutCollection.updateOne(
        { _id: checkoutId },
        {
          $inc: { checkoutQuantity: -returnQuantity },
          $set: {
            isReturned:
              returnQuantity === checkoutDetails.checkoutQuantity
                ? true
                : false,
          },
        }
      );
      const collectionName =
        checkoutDetails.toolType === INVENTORY_CATEGORY_CODE.MATERIAL
          ? "materials"
          : "equipment";
      const inventoryCollection = db.collection(collectionName);

      await inventoryCollection.updateOne(
        { _id: checkoutDetails.toolId },
        {
          $inc: { availableQuantity: returnQuantity },
        }
      );
    }

    return next(
      new GeneralResponse(
        messages.CHECKOUT_ID_NOT_EXIST,
        httpStatusCode.HTTP_BAD_REQUEST
      )
    );
  }),

  getInventoryList: catchAsyncError(async (req, res, next) => {
    const { searchText, pageIndex, pageSize, sortField, sortOrder } = req.body;
    let sortBy = sortField;
    if (sortBy === "locationName") {
      sortBy = "locationData.name";
    }

    const responseData = await db
      .collection("materials")
      .aggregate([
        { $unionWith: { coll: "equipment" } },
        {
          $lookup: {
            from: "locations",
            localField: "locationId",
            foreignField: "_id",
            as: "locationData",
          },
        },
        {
          $match: {
            $or: [
              { name: { $regex: searchText, $options: "i" } },
              { description: { $regex: searchText, $options: "i" } },
              { modelNumber: { $regex: searchText, $options: "i" } },
              { totalQuantity: { $regex: searchText, $options: "i" } },
              { availableQuantity: { $regex: searchText, $options: "i" } },
              { "locationData.name": { $regex: searchText, $options: "i" } },
            ],
            $and: [{ isDeleted: false }],
          },
        },
        {
          $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
            description: 1,
            modelNumber: 1,
            totalQuantity: 1,
            availableQuantity: 1,
            purchaseDate: 1,
            canBeCheckedout: 1,
            isDeleted: 1,
            locationData: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$locationData",
                    as: "ld",
                    in: {
                      _id: "$$ld._id",
                      name: "$$ld.name",
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: (pageIndex - 1) * pageSize },
              { $limit: pageSize },
            ],
            totalCount: [
              {
                $count: "count"
              },
            ],
          },
        },
        
      ])
      .toArray();

    const data = {
      inventoryList: responseData[0]?.paginatedResults,
      totalRecords: responseData[0]?.totalCount[0]?.count,
    };

    return next(
      new GeneralResponse(
        messages.INVENTORY_LIST_SUCCESS,
        httpStatusCode.HTTP_SUCCESS,
        data
      )
    );
  }),
  
};

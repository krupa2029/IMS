const httpStatusCode = require("../../../../commonLibrary/src/constants/httpStatusCode");
const {
  getDateUTC,
  addDayInDate,
  isDate,
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

    const inventoryData = {
      name,
      description,
      image : image || null,
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
          Math.abs(quantityDiff)
        );
        ERR_MSG =
          inventory.availableQuantity > 1
            ? ERR_MSG.replace(/<n2>/, inventory.availableQuantity)
            : ERR_MSG.replace(/<n2>/, inventory.availableQuantity).replace(
                /items are/,
                "item is"
              );

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

  deleteInventory: catchAsyncError(async (req, res, next) => {
    const { inventoryData } = req.body;

    for (const item of inventoryData) {
      const collectionName =
        item.category === INVENTORY_CATEGORY_CODE.MATERIAL
          ? "materials"
          : "equipment";
      const inventoryCollection = db.collection(collectionName);

      await inventoryCollection.updateOne(
        { _id: convertToObjectId(item.id) },
        {
          $set: {
            isDeleted: true,
          },
        }
      );
    }

    return next(
      new GeneralResponse(
        messages.DELETE_INVENTORY_SUCCESS,
        httpStatusCode.HTTP_SUCCESS
      )
    );
  }),

  checkoutInventory: catchAsyncError(async (req, res, next) => {
    const { toolId, toolType, expectedReturnDate, checkoutQuantity, notes } =
      req.body;
    const userId = convertToObjectId(req.token.userId);
    const collectionName =
      toolType === INVENTORY_CATEGORY_CODE.MATERIAL ? "materials" : "equipment";
    const inventoryCollection = db.collection(collectionName);
    const inventoryCheckoutCollection = db.collection("inventory-checkout");
    const checkoutDateUtc = getDateUTC();
    const currentDate = getDateUTC(null, "YYYY-MM-DD");
    const expectedReturnDateUtc = getDateUTC(expectedReturnDate);
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
        checkoutDate: { $gte: currentDate, $lt: addDayInDate(currentDate, 1) },
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
    const userId = convertToObjectId(req.token.userId);
    const returnDateUtc = getDateUTC(returnDate);
    const inventoryReturnCollection = db.collection("inventory-return");
    const inventoryCheckoutCollection = db.collection("inventory-checkout");
    const checkoutObjectId = convertToObjectId(checkoutId);

    const checkoutDetails = await inventoryCheckoutCollection.findOne({
      _id: checkoutObjectId,
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
        checkoutId: checkoutObjectId,
        userId,
        returnQuantity,
        returnDate: returnDateUtc,
      });

      await inventoryCheckoutCollection.updateOne(
        { _id: checkoutObjectId },
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

      return next(
        new GeneralResponse(
          messages.INVENTORY_RETURN_SUCCESS,
          httpStatusCode.HTTP_SUCCESS
        )
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
    let searchString = searchText;
    let sortBy = sortField;
    let searchQuantity;
    let startDate;

    if (sortBy === "locationName") {
      sortBy = "locationData.name";
    }

    if (!isNaN(searchString)) {
      searchQuantity = parseInt(searchString);
      searchString = "";
    } else if (isDate(searchString)) {
      startDate = getDateUTC(searchString);
      searchString = "";
    }

    const responseData = await db
      .collection("materials")
      .aggregate([
        {
          $addFields: {
            source: "materials",
          },
        },
        { $unionWith: { coll: "equipment" } },
        {
          $addFields: {
            category: {
              $cond: [
                { $eq: ["$source", "materials"] },
                "Material",
                "Equipment",
              ],
            },
          },
        },
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
            $and: [
              searchText !== ""
                ? {
                    $or: [
                      searchString !== ""
                        ? {
                            $or: [
                              { name: { $regex: searchString, $options: "i" } },
                              {
                                description: {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                              {
                                modelNumber: {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                              {
                                "locationData.name": {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                              {
                                category: {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                            ],
                          }
                        : undefined,
                      searchQuantity !== undefined
                        ? {
                            $or: [
                              { totalQuantity: searchQuantity },
                              { availableQuantity: searchQuantity },
                            ],
                          }
                        : undefined,
                      startDate !== undefined
                        ? {
                            purchaseDate: {
                              $gte: startDate,
                              $lt: addDayInDate(startDate, 1),
                            },
                          }
                        : undefined,
                    ].filter((x) => x !== undefined),
                  }
                : undefined,
              { $and: [{ isDeleted: false }] },
            ].filter((x) => x !== undefined),
          },
        },
        {
          $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            category: 1,
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
                $count: "count",
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
        messages.LIST_SUCCESS,
        httpStatusCode.HTTP_SUCCESS,
        data
      )
    );
  }),

  getCheckoutList: catchAsyncError(async (req, res, next) => {
    const { searchText, pageIndex, pageSize, sortField, sortOrder, userId } =
      req.body;
    let searchString = searchText;
    let sortBy = "returnData.returnDate";
    let searchCategory;
    let searchQuantity;
    let startDate;

    switch (sortField) {
      case "toolName":
        sortBy = "toolData.name";
        break;
      case "modelNumber":
        sortBy = "toolData.modelNumber";
        break;
      case "quantity":
        sortBy = "quantity";
        break;
      case 'checkoutByUserName':
        sortBy = 'checkoutByUserName';
        break;
      case "category":
        sortBy = "toolType";
        break;
      case "checkoutDate":
        sortBy = "checkoutDate";
        break;
      case "returnDate":
        sortBy = "returnData.returnDate";
        break;
      default:
        sortBy = "returnData.returnDate";
    }

    if (searchString?.toLowerCase() === "equipment") {
      searchCategory = "E";
    } else if (searchString?.toLowerCase() === "material") {
      searchCategory = "M";
    } else if (!isNaN(searchString)) {
      searchQuantity = parseInt(searchString);
      searchString = "";
    } else if (isDate(searchString)) {
      startDate = getDateUTC(searchString);
      searchString = "";
    }

    const pipeline1 = [
      {
        $match: { isReturned: false },
      },
    ];

    const pipeline2 = [
      {
        $lookup: {
          from: "inventory-return",
          localField: "_id",
          foreignField: "checkoutId",
          as: "returnData",
        },
      },
      {
        $unwind: {
          path: "$returnData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "returnData.userId",
          foreignField: "_id",
          as: "returnBy",
        },
      },
      {
        $unwind: {
          path: "$returnBy",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const responseData = await db
      .collection("inventory-checkout")
      .aggregate([
        {
          $facet: {
            pipeline1Results: pipeline1,
            pipeline2Results: pipeline2,
          },
        },
        {
          $project: {
            results: {
              $concatArrays: ["$pipeline1Results", "$pipeline2Results"],
            },
          },
        },
        {
          $unwind: {
            path: "$results",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $replaceRoot: {
            newRoot: "$results",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "checkoutBy",
          },
        },
        {
          $unwind: {
            path: "$checkoutBy",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "materials",
            localField: "toolId",
            foreignField: "_id",
            as: "materialToolDetails",
          },
        },
        {
          $lookup: {
            from: "equipment",
            localField: "toolId",
            foreignField: "_id",
            as: "equipmentToolDetails",
          },
        },
        {
          $addFields: {
            toolData: {
              $cond: [
                { $eq: ["$toolType", "M"] },
                "$materialToolDetails",
                "$equipmentToolDetails",
              ],
            },
          },
        },
        {
          $unwind: {
            path: "$toolData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            quantity: {
              $ifNull: ["$returnData.returnQuantity", "$checkoutQuantity"],
            },
          },
        },
        {
          $addFields: {
            checkoutByUserName: {
              $concat: ["$checkoutBy.firstName", " ", "$checkoutBy.lastName"]
            },
          },
        },
        {
          $match: {
            $and: [
              userId
                ? {
                    "checkoutBy._id": convertToObjectId(userId),
                  }
                : {},
              searchText !== ""
                ? {
                    $or: [
                      searchString !== ""
                        ? {
                            $or: [
                              {
                                "checkoutByUserName": {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                              {
                                "returnBy.firstName": {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                              {
                                "returnBy.lastName": {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                              {
                                "toolData.modelNumber": {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                              {
                                "toolData.name": {
                                  $regex: searchString,
                                  $options: "i",
                                },
                              },
                            ],
                          }
                        : undefined,

                      searchQuantity !== undefined
                        ? { quantity: searchQuantity }
                        : undefined,
                      searchCategory !== undefined
                        ? { toolType: searchCategory }
                        : undefined,
                      startDate !== undefined
                        ? {
                            checkoutDate: {
                              $gte: startDate,
                              $lt: addDayInDate(startDate, 1),
                            },
                          }
                        : undefined,
                      startDate !== undefined
                        ? {
                            "returnData.returnDate": {
                              $gte: startDate,
                              $lt: addDayInDate(startDate, 1),
                            },
                          }
                        : undefined,
                    ].filter((x) => x !== undefined),
                  }
                : undefined,
            ].filter((x) => x !== undefined),
          },
        },
        {
          $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
        },
        {
          $project: {
            _id: 0,
            checkoutId: "$_id",
            checkoutDate: "$checkoutDate",
            checkoutQuantity: "$checkoutQuantity",
            isReturned: "$isReturned",
            expectedReturnDate: "$expectedReturnDate",
            userId: "$checkoutBy._id",
            userName: '$checkoutByUserName',
            toolDetails: {
              _id: "$toolData._id",
              name: "$toolData.name",
              image: "$toolData.image",
              type: { $cond: [ { $eq: [ "$toolType", 'M' ] },'Material', 'Equipment' ] },
              modelNumber: "$toolData.modelNumber",
            },
            quantity: "$quantity",
            returnDetails: {
              $ifNull: [
                {
                  $cond: [
                    { $ifNull: ["$returnData._id", false] },
                    {
                      _id: "$returnData._id",
                      returnQuantity: "$returnData.returnQuantity",
                      returnDate: "$returnData.returnDate",
                      userId: "$returnBy._id",
                      userName: {
                        $concat: [
                          "$returnBy.firstName",
                          " ",
                          "$returnBy.lastName",
                        ],
                      },
                    },
                    null,
                  ],
                },
                null,
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
                $count: "count",
              },
            ],
          },
        },
      ])
      .toArray();

    const data = {
      recordList: responseData[0]?.paginatedResults,
      totalRecords: responseData[0]?.totalCount[0]?.count,
    };

    return next(
      new GeneralResponse(
        messages.LIST_SUCCESS,
        httpStatusCode.HTTP_SUCCESS,
        data
      )
    );
  }),
};

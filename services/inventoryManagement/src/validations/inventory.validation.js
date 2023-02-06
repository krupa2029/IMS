const Joi = require("joi").extend(require("@joi/date"));
const ObjectId = require("joi-objectid")(Joi);
const { INVENTORY_CATEGORY_CODE } = require("../constants/enums");

const customJoi = Joi.defaults((schema) =>
  schema.options({
    allowUnknown: true,
  })
);

module.exports = {
  addEditInventory: customJoi.object({
    id: ObjectId().required().allow(null),
    name: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().allow(null),
    category: Joi.string()
      .required()
      .valid(
        INVENTORY_CATEGORY_CODE.MATERIAL,
        INVENTORY_CATEGORY_CODE.EQUIPMENT
      ),
    purchaseDate: Joi.date().format("DD-MM-YYYY").required(),
    modelNumber: Joi.string().required(),
    locationId: ObjectId().required(),
    totalQuantity: Joi.number().integer().min(1).required(),
    canBeCheckedout: Joi.boolean().required(),
    isDeleted: Joi.boolean().required(),
  }),

  checkoutInventory: customJoi.object({
    toolId: ObjectId().required(),
    toolType: Joi.string()
      .required()
      .valid(
        INVENTORY_CATEGORY_CODE.MATERIAL,
        INVENTORY_CATEGORY_CODE.EQUIPMENT
      ),
    expectedReturnDate: Joi.date().format("DD-MM-YYYY").required(),
    checkoutQuantity: Joi.number().integer().min(1).required(),
    notes: Joi.string().required().allow(null),
  }),

  returnInventory: customJoi.object({
    checkoutId: ObjectId().required(),
    returnQuantity: Joi.number().integer().min(1).required(),
    returnDate: Joi.date().format("DD-MM-YYYY").required(),
  }),

  getInventoryList: customJoi.object({
    searchText: Joi.string().required().allow(""),
    pageIndex: Joi.number().integer().required(),
    pageSize: Joi.number().integer().required(),
    sortField: Joi.string()
      .required()
      .valid(
        "name",
        "description",
        "modelNumber",
        "totalQuantity",
        "category",
        "purchaseDate",
        "availableQuantity",
        "locationName"
      ),
    sortOrder: Joi.string().required().valid("asc", "desc"),
  }),

  getCheckoutList: customJoi.object({
    searchText: Joi.string().required().allow(""),
    userId: ObjectId().optional().allow(null),
    pageIndex: Joi.number().integer().required(),
    pageSize: Joi.number().integer().required(),
    sortField: Joi.string()
      .required()
      .valid(
        "toolName",
        "modelNumber",
        "quantity",
        "category",
        "checkoutDate",
        "returnDate",
      ),
    sortOrder: Joi.string().required().valid("asc", "desc"),
  }),
};

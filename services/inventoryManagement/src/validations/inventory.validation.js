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
    totalQuantity: Joi.number().integer().required(),
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
    checkoutQuantity: Joi.number().integer().required(),
    notes: Joi.string().required().allow(null)
  }),

  getInventoryList: customJoi.object({
    searchText: Joi.string().optional().allow(null),
    pageIndex: Joi.number().required(),
    pageSize: Joi.number().required(),
    sortColumn: Joi.string().required(),
    sortOrder: Joi.string().required(),
  }),
};

const Joi = require("joi").extend(require('@joi/date'));;
const ObjectId = require('joi-objectid')(Joi);
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
    availableQuantity: Joi.number().integer().required(),
    totalQuantity: Joi.number().integer().required(),
    canBeCheckedOut: Joi.boolean().required(),
    isDeleted: Joi.boolean().required(),
  }),
};

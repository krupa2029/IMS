const Joi = require("joi");

const customJoi = Joi.defaults((schema) =>
  schema.options({
    allowUnknown: true,
  })
);

module.exports = {
  addEditInventory: customJoi.object({
    id: Joi.string().required().allow(null),
    name: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().allow(null),
    isDeleted: Joi.boolean().required()
  })
};

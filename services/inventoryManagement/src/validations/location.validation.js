const Joi = require("joi");

const customJoi = Joi.defaults((schema) =>
  schema.options({
    allowUnknown: true,
  })
);

module.exports = {
  addEditLocation: customJoi.object({
    locationId: Joi.string().required().allow(null),
    name: Joi.string().required(),
    image: Joi.string().optional().allow(null),
    isDeleted: Joi.boolean().required(),
  }),
};

const Joi = require("joi");

const customJoi = Joi.defaults((schema) =>
  schema.options({
    allowUnknown: true,
  })
);

module.exports = {
  addEditRole: customJoi.object({
    id: Joi.string().required().allow(null),
    name: Joi.string().required(),
    isDeleted: Joi.boolean().required()
  }),

  addEditPermission: customJoi.object({
    id: Joi.string().required().allow(null),
    name: Joi.string().required(),
    isDeleted: Joi.boolean().required()
  }),
};

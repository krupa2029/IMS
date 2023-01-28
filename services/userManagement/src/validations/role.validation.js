const Joi = require("joi");
const ObjectId = require('joi-objectid')(Joi);

const customJoi = Joi.defaults((schema) =>
  schema.options({
    allowUnknown: true,
  })
);

module.exports = {
  addEditRole: customJoi.object({
    id: ObjectId().required().allow(null),
    name: Joi.string().required(),
    isDeleted: Joi.boolean().required(),
    permissionIds: Joi.array().items(ObjectId()).required().allow(null)
  }),

  addEditPermission: customJoi.object({
    id: ObjectId().required().allow(null),
    name: Joi.string().required(),
    code: Joi.string().required(),
    isDeleted: Joi.boolean().required()
  }),
};

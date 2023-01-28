const Joi = require("joi");
const ObjectId = require('joi-objectid')(Joi);

const customJoi = Joi.defaults((schema) =>
  schema.options({
    allowUnknown: true,
  })
);

module.exports = {
  addEditLocation: customJoi.object({
    id: ObjectId().required().allow(null),
    name: Joi.string().required(),
    image: Joi.string().required().allow(null),
    isDeleted: Joi.boolean().required(),
  }),
};

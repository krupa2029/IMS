const Joi = require('joi');
const ObjectId = require('joi-objectid')(Joi);

const customJoi = Joi.defaults(schema => schema.options({
  allowUnknown: true
}));

module.exports = {
  addEditUser: customJoi.object({
    id: ObjectId().required().allow(null),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    address: Joi.string().required(),
    roleId: ObjectId().required()
  }),
}
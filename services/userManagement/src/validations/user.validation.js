const Joi = require('joi');

const customJoi = Joi.defaults(schema => schema.options({
  allowUnknown: true
}));

module.exports = {}
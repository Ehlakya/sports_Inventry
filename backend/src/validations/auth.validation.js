const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'SUPPLIER', 'CUSTOMER').default('CUSTOMER'),
  phone: Joi.string().trim().allow(null, ''),
  address: Joi.string().trim().allow(null, '')
});

const loginSchema = Joi.object({
  email: Joi.string().trim().required(),
  password: Joi.string().required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};

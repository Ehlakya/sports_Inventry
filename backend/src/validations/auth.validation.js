const Joi = require('joi');

const reqMsg = {
  'any.required': 'All fields are required.',
  'string.empty': 'All fields are required.'
};

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages(reqMsg),
  username: Joi.string().trim().min(3).max(50).required().messages(reqMsg),
  email: Joi.string().trim().email().required().messages(reqMsg),
  password: Joi.string().min(6).required().messages(reqMsg),
  confirmPassword: Joi.string().required().messages(reqMsg),
  role: Joi.string().valid('CUSTOMER').default('CUSTOMER'),
  phone: Joi.string().trim().required().messages(reqMsg),
  address: Joi.string().trim().required().messages(reqMsg)
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

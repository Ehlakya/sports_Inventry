const Joi = require('joi');

const orderItemSchema = Joi.object({
  productId: Joi.number().integer().required(),
  size: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required()
});

const placeOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required()
});

const cartSummarySchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required()
});

module.exports = {
  placeOrderSchema,
  cartSummarySchema
};

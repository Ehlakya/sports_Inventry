const Joi = require('joi');

const createProductSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(150).required(),
  categoryId: Joi.number().integer().required(),
  brand: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().allow(null, ''),
  customerPrice: Joi.number().positive().required(),
  supplierPrice: Joi.number().positive().required(),
  imageUrl: Joi.string().uri().allow(null, '', ' '),
  sizes: Joi.array().items(
    Joi.object({
      size: Joi.string().trim().required(),
      stock: Joi.number().integer().min(0).required()
    })
  ).optional()
});

const updateProductSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(150),
  categoryId: Joi.number().integer(),
  brand: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().allow(null, ''),
  customerPrice: Joi.number().positive(),
  supplierPrice: Joi.number().positive(),
  imageUrl: Joi.string().uri().allow(null, '', ' ')
});

const updateSizesSchema = Joi.object({
  sizes: Joi.array().items(
    Joi.object({
      size: Joi.string().trim().required(),
      stock: Joi.number().integer().min(0).required()
    })
  ).min(1).required()
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  updateSizesSchema
};

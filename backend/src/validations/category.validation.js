const Joi = require('joi');

const categorySchema = Joi.object({
  categoryName: Joi.string().trim().min(2).max(50).required()
});

module.exports = {
  categorySchema
};

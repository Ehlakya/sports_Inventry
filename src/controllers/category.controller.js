const { Category } = require('../models');

const createCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.body;

    const existingCategory = await Category.findOne({ where: { categoryName } });
    if (existingCategory) {
      return res.status(400).json({ error: `Category "${categoryName}" already exists.` });
    }

    const category = await Category.create({ categoryName });
    res.status(201).json({
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['categoryName', 'ASC']] });
    res.status(200).json({
      categories
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    // Check conflict
    if (categoryName !== category.categoryName) {
      const existing = await Category.findOne({ where: { categoryName } });
      if (existing) {
        return res.status(400).json({ error: `Category "${categoryName}" already exists.` });
      }
    }

    category.categoryName = categoryName;
    await category.save();

    res.status(200).json({
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    await category.destroy();
    res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};

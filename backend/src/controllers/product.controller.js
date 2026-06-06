const { Op } = require('sequelize');
const { sequelize, Product, ProductSize, Category } = require('../models');

// Helper to sanitize product prices based on user role
const sanitizeProductForRole = (productInstance, role) => {
  const product = productInstance.toJSON ? productInstance.toJSON() : { ...productInstance };
  
  if (role === 'CUSTOMER') {
    delete product.supplierPrice;
  } else if (role === 'SUPPLIER') {
    delete product.customerPrice;
  }
  // ADMIN keeps both prices
  
  return product;
};

const createProduct = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { productName, categoryId, brand, description, customerPrice, supplierPrice, imageUrl, sizes } = req.body;

    // Check category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      await t.rollback();
      return res.status(404).json({ error: `Category with ID ${categoryId} does not exist.` });
    }

    // Create product
    const product = await Product.create({
      productName,
      categoryId,
      brand,
      description,
      customerPrice,
      supplierPrice,
      imageUrl,
      availableQuantity: 0 // initially 0, updated below if sizes are provided
    }, { transaction: t });

    let sizeRecords = [];
    let totalStock = 0;

    // Create initial size stock records if provided
    if (sizes && sizes.length > 0) {
      const sizesToCreate = sizes.map(s => ({
        productId: product.id,
        size: s.size,
        stock: s.stock
      }));
      sizeRecords = await ProductSize.bulkCreate(sizesToCreate, { transaction: t });
      totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);

      // Update available quantity
      product.availableQuantity = totalStock;
      await product.save({ transaction: t });
    }

    await t.commit();

    const createdProductJson = sanitizeProductForRole(product, req.user.role);
    if (sizeRecords.length > 0) {
      createdProductJson.sizes = sizeRecords;
    }

    res.status(201).json({
      message: 'Product created successfully.',
      product: createdProductJson
    });

  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productName, categoryId, brand, description, customerPrice, supplierPrice, imageUrl } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: `Category with ID ${categoryId} does not exist.` });
      }
      product.categoryId = categoryId;
    }

    if (productName) product.productName = productName;
    if (brand) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (customerPrice !== undefined) product.customerPrice = customerPrice;
    if (supplierPrice !== undefined) product.supplierPrice = supplierPrice;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully.',
      product: sanitizeProductForRole(product, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { search, categoryId, brand, size } = req.query;
    const where = {};

    // Filter by Category
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // Filter by Brand
    if (brand) {
      where.brand = brand;
    }

    // Filter by Size — uses Op.in which generates SQL: WHERE size IN ('XL')
    // This is EXACT string equality: 'XL' will NOT match 'XXL', '2XL', etc.
    if (size) {
      const sizeArray = Array.isArray(size) ? size : size.split(',').map(s => s.trim()).filter(Boolean);
      if (sizeArray.length > 0) {
        const productIdsWithSize = await ProductSize.findAll({
          attributes: ['productId'],
          where: {
            size: { [Op.in]: sizeArray }, // Exact match only — no LIKE, no substring
            stock: { [Op.gt]: 0 }
          },
          raw: true
        });
        const ids = productIdsWithSize.map(ps => ps.productId);
        // If no products match the selected sizes, return empty result
        where.id = ids.length > 0 ? { [Op.in]: ids } : { [Op.in]: [-1] };
      }
    }

    // Search query (matches productName, brand, or description)
    if (search) {
      where[Op.or] = [
        { productName: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['categoryName'] },
        { model: ProductSize, as: 'sizes', attributes: ['size', 'stock'] }
      ],
      order: [['id', 'ASC']]
    });

    // Sanitize prices based on role (default to CUSTOMER for unauthenticated users)
    const role = req.user ? req.user.role : 'CUSTOMER';
    const sanitizedProducts = products.map(prod => sanitizeProductForRole(prod, role));

    res.status(200).json({
      products: sanitizedProducts
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['categoryName'] },
        { model: ProductSize, as: 'sizes', attributes: ['size', 'stock'] }
      ]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Default to CUSTOMER role pricing for unauthenticated visitors
    const role = req.user ? req.user.role : 'CUSTOMER';
    res.status(200).json({
      product: sanitizeProductForRole(product, role)
    });
  } catch (error) {
    next(error);
  }
};

const updateProductSizes = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params; // product id
    const { sizes } = req.body; // array of { size, stock }

    const product = await Product.findByPk(id, { transaction: t, lock: true });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ error: 'Product not found.' });
    }

    for (const sizeItem of sizes) {
      const { size, stock } = sizeItem;

      // Upsert size config
      const [prodSize] = await ProductSize.findOrCreate({
        where: { productId: id, size },
        defaults: { stock },
        transaction: t
      });

      // If it existed, update stock
      if (prodSize.stock !== stock) {
        prodSize.stock = stock;
        await prodSize.save({ transaction: t });
      }
    }

    // Recalculate availableQuantity for the parent product
    const allSizes = await ProductSize.findAll({
      where: { productId: id },
      transaction: t
    });
    const totalStock = allSizes.reduce((sum, s) => sum + s.stock, 0);

    product.availableQuantity = totalStock;
    await product.save({ transaction: t });

    await t.commit();

    // Fetch updated sizes
    const updatedSizes = await ProductSize.findAll({
      where: { productId: id }
    });

    res.status(200).json({
      message: 'Product sizes updated successfully.',
      availableQuantity: totalStock,
      sizes: updatedSizes
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const getProductSizes = async (req, res, next) => {
  try {
    const { id } = req.params; // product id

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const sizes = await ProductSize.findAll({
      where: { productId: id },
      order: [['size', 'ASC']]
    });

    res.status(200).json({
      productId: product.id,
      productName: product.productName,
      sizes
    });
  } catch (error) {
    next(error);
  }
};

const getAllUniqueSizes = async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    const include = [
      {
        model: Product,
        as: 'product',
        attributes: [],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: []
          }
        ]
      }
    ];

    const where = {};

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category || category.categoryName.toLowerCase() === 'equipment') {
        return res.status(200).json({ sizes: [] });
      }
      where['$product.categoryId$'] = parseInt(categoryId);
    } else {
      where['$product.category.categoryName$'] = {
        [Op.ne]: 'Equipment'
      };
    }

    where.size = {
      [Op.and]: [
        { [Op.ne]: 'N/A' },
        { [Op.ne]: '' },
        { [Op.not]: null }
      ]
    };

    const sizes = await ProductSize.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('ProductSize.size')), 'size']],
      include,
      where,
      raw: true
    });

    const rawList = sizes.map(s => s.size).filter(Boolean);

    // Sort sizes in a human-logical order (XS → S → M → L → XL → XXL → 2XL… then shoe sizes)
    const apparelOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'];
    const sizeList = rawList.sort((a, b) => {
      const ai = apparelOrder.indexOf(a);
      const bi = apparelOrder.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;   // Both are apparel sizes
      if (ai !== -1) return -1;                      // a is apparel, b is not
      if (bi !== -1) return 1;                       // b is apparel, a is not
      // For shoe sizes like UK-7, UK-8 — sort numerically by extracting trailing number
      const aNum = parseFloat(a.replace(/[^\d.]/g, ''));
      const bNum = parseFloat(b.replace(/[^\d.]/g, ''));
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.localeCompare(b);                     // Fallback: alphabetical
    });

    res.status(200).json({
      sizes: sizeList
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  updateProductSizes,
  getProductSizes,
  getAllUniqueSizes
};


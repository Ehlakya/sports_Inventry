const { sequelize, User, Category, Product, ProductSize, SalesSummary } = require('../models');

const initDb = async () => {
  try {
    console.log('Synchronizing database...');
    // DANGER: force: true drops existing tables. Perfect for initialization / clean testing.
    await sequelize.sync({ force: true });
    console.log('Database synced successfully. Starting seed data injection...');

    // 1. Create Default Users
    // Passwords will be hashed automatically by user model beforeCreate hook.
    console.log('Creating users...');
    const users = await User.bulkCreate([
      {
        name: 'Default Admin User',
        email: 'admin@sports.com',
        password: 'admin123',
        role: 'ADMIN',
        phone: '+919999999999',
        address: '123 Admin Plaza, New Delhi'
      },
      {
        name: 'Prime Sports Supplier Ltd',
        email: 'supplier@sports.com',
        password: 'supplier123',
        role: 'SUPPLIER',
        phone: '+918888888888',
        address: '456 Warehousing Hub, Mumbai'
      },
      {
        name: 'Active Customer John',
        email: 'customer@sports.com',
        password: 'customer123',
        role: 'CUSTOMER',
        phone: '+917777777777',
        address: '789 Residential Way, Bangalore'
      }
    ], { validate: true, individualHooks: true }); // individualHooks: true triggers the bcrypt hashing!

    console.log(`Successfully seeded ${users.length} users.`);

    // 2. Create Categories
    console.log('Creating categories...');
    const footwear = await Category.create({ categoryName: 'Footwear' });
    const apparel = await Category.create({ categoryName: 'Apparel' });
    const equipment = await Category.create({ categoryName: 'Equipment' });
    console.log('Successfully seeded categories.');

    // 3. Create Products and Size stocks
    console.log('Creating products and size stocks...');
    
    // Product 1: Footwear
    const shoes = await Product.create({
      productName: 'Air Zoom Running Shoes',
      categoryId: footwear.id,
      brand: 'Nike',
      description: 'High performance running and training shoes with cushion support.',
      customerPrice: 8500.00,
      supplierPrice: 5500.00,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      availableQuantity: 0 // Will sync
    });
    
    await ProductSize.bulkCreate([
      { productId: shoes.id, size: 'UK-8', stock: 45 },
      { productId: shoes.id, size: 'UK-9', stock: 60 },
      { productId: shoes.id, size: 'UK-10', stock: 5 } // Low stock (< 10)
    ]);

    // Product 2: Equipment
    const bat = await Product.create({
      productName: 'English Willow Cricket Bat',
      categoryId: equipment.id,
      brand: 'Kookaburra',
      description: 'Premium grade-A English Willow bat for professional cricket.',
      customerPrice: 18000.00,
      supplierPrice: 12000.00,
      imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da',
      availableQuantity: 0
    });

    await ProductSize.bulkCreate([
      { productId: bat.id, size: 'Standard SH', stock: 15 },
      { productId: bat.id, size: 'Harrow', stock: 8 } // Low stock (< 10)
    ]);

    // Product 3: Apparel
    const jersey = await Product.create({
      productName: 'Dry-Fit Athletic Jersey',
      categoryId: apparel.id,
      brand: 'Adidas',
      description: 'Breathable dry-fit polyester shirt for running, training, and sports.',
      customerPrice: 2200.00,
      supplierPrice: 1400.00,
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
      availableQuantity: 0
    });

    await ProductSize.bulkCreate([
      { productId: jersey.id, size: 'S', stock: 25 },
      { productId: jersey.id, size: 'M', stock: 40 },
      { productId: jersey.id, size: 'L', stock: 3 } // Low stock (< 10)
    ]);

    // 4. Update products' availableQuantity by summing up their sizes' stock levels
    const products = await Product.findAll();
    for (const p of products) {
      const sizes = await ProductSize.findAll({ where: { productId: p.id } });
      const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);
      p.availableQuantity = totalStock;
      await p.save();
    }
    console.log('Successfully seeded products & sizes.');

    // 5. Initialize SalesSummary record (ID 1)
    console.log('Initializing Sales Summary...');
    await SalesSummary.create({
      id: 1,
      totalRevenue: 0.00,
      totalSupplierSales: 0.00,
      totalCustomerSales: 0.00,
      totalOrders: 0
    });
    console.log('Successfully initialized Sales Summary.');

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database initialization/seeding:', error);
    process.exit(1);
  }
};

// Run the script directly if invoked via node
if (require.main === module) {
  initDb();
}

module.exports = initDb;

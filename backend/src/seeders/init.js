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
        email: 'adminR',
        password: 'admin123',
        role: 'ADMIN',
        phone: '+919999999999',
        address: '123 Admin Plaza, New Delhi',
        createdByAdmin: true
      },
      {
        name: 'Prime Sports Supplier Ltd',
        email: 'supplier@sports.com',
        password: 'supplier123',
        role: 'SUPPLIER',
        phone: '+918888888888',
        address: '456 Warehousing Hub, Mumbai',
        createdByAdmin: true
      },
      {
        name: 'Active Customer John',
        email: 'customer@sports.com',
        password: 'customer123',
        role: 'CUSTOMER',
        phone: '+917777777777',
        address: '789 Residential Way, Bangalore',
        createdByAdmin: false
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
      description: 'High performance running and training shoes with React foam cushioning, breathable mesh upper, and Zoom Air unit for explosive energy return.',
      customerPrice: 8500.00,
      supplierPrice: 5500.00,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: shoes.id, size: 'UK-7', stock: 30 },
      { productId: shoes.id, size: 'UK-8', stock: 45 },
      { productId: shoes.id, size: 'UK-9', stock: 60 },
      { productId: shoes.id, size: 'UK-10', stock: 5 },
      { productId: shoes.id, size: 'UK-11', stock: 20 },
    ]);

    // Product 2: Footwear
    const footballBoots = await Product.create({
      productName: 'Predator Elite Football Boots',
      categoryId: footwear.id,
      brand: 'Adidas',
      description: 'Professional-grade football boots with FG outsole, ribbed rubber zones for ball control, and adaptive fit collar for a locked-in feel.',
      customerPrice: 12500.00,
      supplierPrice: 8200.00,
      imageUrl: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: footballBoots.id, size: 'UK-7', stock: 18 },
      { productId: footballBoots.id, size: 'UK-8', stock: 22 },
      { productId: footballBoots.id, size: 'UK-9', stock: 15 },
      { productId: footballBoots.id, size: 'UK-10', stock: 10 },
    ]);

    // Product 3: Footwear
    const basketballShoes = await Product.create({
      productName: 'Clyde Court Basketball Shoes',
      categoryId: footwear.id,
      brand: 'Puma',
      description: 'Premium mid-top basketball shoes with full-length PROFOAM+ midsole, grip rubber outsole, and breathable synthetic upper for court dominance.',
      customerPrice: 7200.00,
      supplierPrice: 4600.00,
      imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: basketballShoes.id, size: 'UK-8', stock: 25 },
      { productId: basketballShoes.id, size: 'UK-9', stock: 35 },
      { productId: basketballShoes.id, size: 'UK-10', stock: 20 },
      { productId: basketballShoes.id, size: 'UK-11', stock: 8 },
    ]);

    // Product 4: Equipment
    const bat = await Product.create({
      productName: 'English Willow Cricket Bat',
      categoryId: equipment.id,
      brand: 'Kookaburra',
      description: 'Premium grade-A English Willow bat for professional cricket. Thick edges, full profile, and superior balance for aggressive stroke play.',
      customerPrice: 18000.00,
      supplierPrice: 12000.00,
      imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: bat.id, size: 'Standard SH', stock: 15 },
      { productId: bat.id, size: 'Harrow', stock: 8 },
    ]);

    // Product 5: Equipment
    const tennisRacket = await Product.create({
      productName: 'Pro Staff RF97 Tennis Racket',
      categoryId: equipment.id,
      brand: 'Wilson',
      description: 'Professional 97 sq in head tennis racket with braided graphite construction. Delivers precise control and exceptional feel on every shot.',
      customerPrice: 22000.00,
      supplierPrice: 15000.00,
      imageUrl: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: tennisRacket.id, size: 'Standard', stock: 20 },
    ]);

    // Product 6: Equipment
    const football = await Product.create({
      productName: 'Pro League FIFA-Quality Football',
      categoryId: equipment.id,
      brand: 'Adidas',
      description: 'FIFA Quality Pro match ball with THERMABONDED construction for consistent shape and optimal flight in all weather conditions.',
      customerPrice: 4500.00,
      supplierPrice: 2800.00,
      imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: football.id, size: 'Size 5', stock: 50 },
      { productId: football.id, size: 'Size 4', stock: 30 },
    ]);

    // Product 7: Equipment
    const badmintonRacket = await Product.create({
      productName: 'Nanoflare 1000Z Badminton Racket',
      categoryId: equipment.id,
      brand: 'Adidas',
      description: 'Ultra-light badminton racket with Rotational Generator System for explosive smash power. Carbon nanotube frame for superior durability.',
      customerPrice: 16500.00,
      supplierPrice: 10800.00,
      imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: badmintonRacket.id, size: 'Standard', stock: 12 },
    ]);

    // Product 8: Apparel
    const jersey = await Product.create({
      productName: 'Dry-Fit Athletic Jersey',
      categoryId: apparel.id,
      brand: 'Adidas',
      description: 'Breathable dry-fit polyester shirt for running, training, and sports. AEROREADY technology wicks sweat for constant comfort.',
      customerPrice: 2200.00,
      supplierPrice: 1400.00,
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: jersey.id, size: 'S', stock: 25 },
      { productId: jersey.id, size: 'M', stock: 40 },
      { productId: jersey.id, size: 'L', stock: 3 },
      { productId: jersey.id, size: 'XL', stock: 15 },
    ]);

    // Product 9: Apparel
    const trackPants = await Product.create({
      productName: 'DriGlide Pro Track Pants',
      categoryId: apparel.id,
      brand: 'Nike',
      description: 'Performance track pants with Dri-FIT technology, elastic waistband, tapered fit, and zippered pockets. Built for training and casual wear.',
      customerPrice: 3800.00,
      supplierPrice: 2400.00,
      imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: trackPants.id, size: 'S', stock: 20 },
      { productId: trackPants.id, size: 'M', stock: 35 },
      { productId: trackPants.id, size: 'L', stock: 28 },
      { productId: trackPants.id, size: 'XL', stock: 10 },
    ]);

    // Product 10: Apparel
    const compressionTights = await Product.create({
      productName: 'PowerFit Compression Tights',
      categoryId: apparel.id,
      brand: 'Puma',
      description: 'High-waist compression tights with dryCELL technology. Flatlock seams prevent chafing. Perfect for running, yoga, and gym workouts.',
      customerPrice: 2800.00,
      supplierPrice: 1750.00,
      imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: compressionTights.id, size: 'XS', stock: 18 },
      { productId: compressionTights.id, size: 'S', stock: 30 },
      { productId: compressionTights.id, size: 'M', stock: 25 },
      { productId: compressionTights.id, size: 'L', stock: 12 },
    ]);

    // Product 11: Apparel
    const sportsHoodie = await Product.create({
      productName: 'Fleece Training Hoodie',
      categoryId: apparel.id,
      brand: 'Nike',
      description: 'Pullover training hoodie with soft brushed fleece interior, kangaroo pocket, and adjustable drawcord hood. Ideal for warm-ups and post-workout.',
      customerPrice: 5500.00,
      supplierPrice: 3400.00,
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: sportsHoodie.id, size: 'S', stock: 15 },
      { productId: sportsHoodie.id, size: 'M', stock: 20 },
      { productId: sportsHoodie.id, size: 'L', stock: 18 },
      { productId: sportsHoodie.id, size: 'XL', stock: 7 },
      { productId: sportsHoodie.id, size: 'XXL', stock: 5 },
    ]);

    // Product 12: Equipment
    const yogaMat = await Product.create({
      productName: 'UltraGrip Pro Yoga Mat',
      categoryId: equipment.id,
      brand: 'Adidas',
      description: '6mm thick premium yoga mat with superior grip surface, alignment lines, and carry strap. Non-slip, sweat-proof, and eco-friendly TPE material.',
      customerPrice: 2500.00,
      supplierPrice: 1500.00,
      imageUrl: 'https://images.unsplash.com/photo-1601925228689-7e3e6d4c5e9e?w=600&q=80',
      availableQuantity: 0
    });
    await ProductSize.bulkCreate([
      { productId: yogaMat.id, size: 'Standard', stock: 40 },
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

const { sequelize } = require('./src/models');

async function run() {
  try {
    await sequelize.query(`
      UPDATE inventory_transactions it
      SET "orderedBy" = CASE 
        WHEN o."orderType" = 'SUPPLIER_ORDER' THEN 'Supplier'::"enum_inventory_transactions_orderedBy"
        ELSE 'Customer'::"enum_inventory_transactions_orderedBy"
      END
      FROM orders o
      WHERE it."orderId" = o.id
    `);
    console.log('Fixed orderedBy filter!');
  } catch (error) {
    console.error('Error:', error);
  }
}

run();

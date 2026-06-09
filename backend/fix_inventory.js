const { sequelize } = require('./src/models');

async function run() {
  try {
    await sequelize.query('UPDATE inventory_transactions SET "orderId" = oi."orderId" FROM order_items oi WHERE inventory_transactions.id = oi.id');
    await sequelize.query('UPDATE inventory_transactions SET "userId" = o."userId" FROM orders o WHERE inventory_transactions."orderId" = o.id');
    console.log('Database updated successfully.');
  } catch (error) {
    console.error('Error updating DB:', error);
  }
}

run();

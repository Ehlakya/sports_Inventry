const { sequelize } = require('./src/models');
async function run() {
  await sequelize.query('UPDATE inventory_transactions SET "userId" = 4, "orderId" = 1 WHERE id IN (1, 3, 5, 7, 9)');
  await sequelize.query('UPDATE inventory_transactions SET "userId" = 5, "orderId" = 2 WHERE id IN (2, 4, 6, 8, 10)');
  console.log('Database updated successfully.');
}
run().catch(console.error);

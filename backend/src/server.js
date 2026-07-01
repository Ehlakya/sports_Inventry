const app = require('./app');
const sequelize = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Start Express listener first to satisfy port binding requirements
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Sports Inventory Management Server is running      `);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Port:        ${PORT}                               `);
    console.log(`  Base URL:    http://localhost:${PORT}/api/v1       `);
    console.log(`====================================================`);
  });

  try {
    // Authenticate database connection
    console.log('Validating database connection...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('CRITICAL: Unable to connect to the database:', error);
  }
};

startServer();

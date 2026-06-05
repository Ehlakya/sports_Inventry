const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'sports_inventory';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASS || 'postgres';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 5432;

console.log(`Connecting to database ${dbName} on ${dbHost}:${dbPort} as ${dbUser}...`);

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: parseInt(dbPort),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true // enabled globally
  }
});

module.exports = sequelize;

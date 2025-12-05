const { Pool } = require('pg');
require('dotenv').config();

// Veritabanı ayarlarını .env dosyasından veya direkt buradan alır
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345', // Burayı kendi şifrenizle değiştirin
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Gerekirse transaction işlemleri için pool'a direkt erişim
};
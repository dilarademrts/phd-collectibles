require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});

const fixQuery = `
  -- 1. Tabloyu silip temizleyelim (En temiz yöntem)
  DROP TABLE IF EXISTS invoices;

  -- 2. Tabloyu EKSİKSİZ yeniden oluşturalım
  CREATE TABLE invoices (
      id SERIAL PRIMARY KEY,
      order_id INTEGER,
      file_path TEXT,
      file_name TEXT,  -- İşte eksik olan sütun bu!
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const run = async () => {
  try {
    console.log("Tablo düzeltiliyor...");
    await pool.query(fixQuery);
    console.log("✅ VERİTABANI TAMAM: 'invoices' tablosu tüm sütunlarla hazır!");
  } catch (err) {
    console.error("❌ HATA:", err.message);
  } finally {
    pool.end();
  }
};

run();
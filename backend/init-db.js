const db = require('./src/db');

const initDatabase = async () => {
  try {
    console.log('🚧 Veritabanı tabloları oluşturuluyor...');

    // 1. Temizlik (Eski tabloları sil)
    await db.query('DROP TABLE IF EXISTS order_items CASCADE');
    await db.query('DROP TABLE IF EXISTS orders CASCADE');
    await db.query('DROP TABLE IF EXISTS product CASCADE');
    await db.query('DROP TABLE IF EXISTS categories CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');

    // 2. Tabloları Kur
    
    // USERS
    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255),
        bio TEXT,
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // CATEGORIES
    await db.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      );
    `);

    // PRODUCTS
    await db.query(`
      CREATE TABLE product (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        image_url TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ORDERS (YENİ EKLENDİ) ✅
    await db.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100),
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending', -- 'completed', 'simulated', 'cancelled'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ORDER ITEMS (YENİ EKLENDİ - Sepetteki ürünler) ✅
    await db.query(`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES product(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        price_at_purchase NUMERIC(10, 2) NOT NULL
      );
    `);

    console.log('🎉 Tüm tablolar (Siparişler dahil) başarıyla kuruldu!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Tablo oluşturma hatası:', error);
    process.exit(1);
  }
};

initDatabase();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// --- AYARLAR ---
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'phd_collectibles', // DB adını kontrol et!
    password: process.env.DB_PASSWORD || 'sifreniz',
    port: 5432,
});

const seedFull = async () => {
    const client = await pool.connect();

    try {
        console.log("🌱 Seeding Başlıyor...");

        // 1. ÖNCE TABLOLARI TEMİZLE (Hata almamak için)
        // Dikkat: Bu işlem verileri siler!
        console.log("🧹 Eski veriler temizleniyor...");
        await client.query("TRUNCATE TABLE order_item, orders, product, category, users CASCADE");

        // 2. KULLANICILARI OLUŞTUR (Users) 👤
        console.log("👤 Kullanıcılar oluşturuluyor...");
        const usersRes = await client.query(`
            INSERT INTO users (name, email, password_hash, role) VALUES 
            ('Ahmet Yılmaz', 'ahmet@test.com', 'hash123', 'customer'),
            ('Ayşe Demir', 'ayse@test.com', 'hash123', 'customer'),
            ('Mehmet Kaya', 'mehmet@test.com', 'hash123', 'customer'),
            ('Admin User', 'admin@phd.com', 'adminpass', 'admin')
            RETURNING user_id, name
        `);
        const users = usersRes.rows; // Oluşan kullanıcıların ID'lerini aldık

        // 3. KATEGORİ OLUŞTUR (Category) 🏷️
        console.log("🏷️ Kategori oluşturuluyor...");
        const catRes = await client.query("INSERT INTO category (name) VALUES ('Comics') RETURNING category_id");
        const categoryId = catRes.rows[0].category_id;

        // 4. ÜRÜNLERİ OLUŞTUR (Product) 📦
        // JSON dosyasından okumak yerine garanti olsun diye elle ekliyorum
        // Senin products.json dosyan varsa onu okuyan kodu buraya entegre edebilirsin.
        console.log("📦 Ürünler ekleniyor...");
        const productsData = [
            { name: "Amazing Fantasy #15", price: 45000, stock: 1, desc: "First Spider-Man" },
            { name: "X-Men #1", price: 15000, stock: 5, desc: "First X-Men" },
            { name: "Batman #1", price: 35000, stock: 2, desc: "Joker appears" },
            { name: "Iron Man #1", price: 1200, stock: 10, desc: "Solo series" },
            { name: "The Killing Joke", price: 500, stock: 20, desc: "Joker story" }
        ];

        let dbProducts = [];
        for (const p of productsData) {
            const res = await client.query(`
                INSERT INTO product (name, description, price, stock_quantity, category_id, image_url)
                VALUES ($1, $2, $3, $4, $5, 'https://via.placeholder.com/150')
                RETURNING product_id, name, price
            `, [p.name, p.desc, p.price, p.stock, categoryId]);
            dbProducts.push(res.rows[0]);
        }

        // 5. SİPARİŞLERİ OLUŞTUR (Orders) 🛒
        console.log("🛒 Siparişler oluşturuluyor...");
        
        // 10 tane rastgele sipariş oluşturalım
        for (let i = 0; i < 10; i++) {
            // Rastgele bir kullanıcı seç
            const randomUser = users[Math.floor(Math.random() * users.length)];
            
            // Önce siparişi "Pending" ve tutarı 0 olarak oluştur
            const orderRes = await client.query(`
                INSERT INTO orders (user_id, status, total_amount) 
                VALUES ($1, 'completed', 0) 
                RETURNING order_id
            `, [randomUser.user_id]);
            
            const newOrderId = orderRes.rows[0].order_id;
            
            // Sepete rastgele 1 veya 2 ürün at
            const randomProduct = dbProducts[Math.floor(Math.random() * dbProducts.length)];
            
            // Order Item Ekle
            await client.query(`
                INSERT INTO order_item (order_id, product_id, quantity, unit_price)
                VALUES ($1, $2, 1, $3)
            `, [newOrderId, randomProduct.product_id, randomProduct.price]);

            // Sipariş toplam tutarını güncelle
            await client.query(`
                UPDATE orders SET total_amount = $1 WHERE order_id = $2
            `, [randomProduct.price, newOrderId]);
        }

        console.log("✨ SİSTEM HAZIR! Veritabanı başarıyla dolduruldu. ✅");
    
    } catch (err) {
        console.error("❌ Hata:", err);
    } finally {
        await client.release(); // Bağlantıyı havuza geri ver
        await pool.end(); // Havuzu kapat
    }
};

seedFull();
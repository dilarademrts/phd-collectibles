const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// --- AYARLAR ---
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '12345',  // ŞİFRENİ KONTROL ET
    port: 5432,
});

const seedFull = async () => {
    const client = await pool.connect();

    try {
        console.log("🌱 Profesyonel Seeding Başlıyor (Schema.sql tabanlı)...");

        // 1. SCHEMA.SQL DOSYASINI OKU VE ÇALIŞTIR 📄
        // Not: schema.sql dosyanın nerede olduğuna dikkat et. 
        // Eğer backend klasörünün hemen içindeyse: path.join(__dirname, '..', 'schema.sql')
        const schemaPath = path.join(__dirname, '..', 'schema.sql'); 
        
        console.log(`📖 Schema okunuyor: ${schemaPath}`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        
        // SQL dosyasını veritabanında çalıştır (Tablolar burada kurulur)
        await client.query(schemaSql);
        
        console.log("✅ Tablolar schema.sql kullanılarak oluşturuldu.");

        // ---------------------------------------------------------
        // BURADAN SONRASI VERİ DOLDURMA (DATA POPULATION) İŞLEMİDİR
        // ---------------------------------------------------------

        // 2. KATEGORİ VE ÜRÜNLERİ EKLE
        const catRes = await client.query("INSERT INTO categories (name) VALUES ('General') RETURNING id");
        const generalCatId = catRes.rows[0].id;

        const jsonPath = path.join(__dirname, '..', 'data', 'products.json'); 
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const productsData = JSON.parse(rawData);
        
        let dbProducts = [];

        for (const item of productsData) {
            const res = await client.query(
                `INSERT INTO product (name, description, price, stock_quantity, image_url, category_id) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING product_id, name, price`,
                [
                    item.name, 
                    item.description, 
                    item.price, 
                    item.stock || item.stock_quantity || 0, 
                    item.image || item.image_url, 
                    generalCatId
                ]
            );
            dbProducts.push(res.rows[0]);
        }
        console.log(`📦 ${dbProducts.length} ürün yüklendi.`);

        // 3. SİPARİŞ SENARYOSU (AI İÇİN) 🧠
        console.log("🤖 Yapay sipariş geçmişi oluşturuluyor...");
        
        const customers = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Can'];
        const batmanItems = dbProducts.filter(p => p.name.toLowerCase().includes('batman'));
        const jokerItems = dbProducts.filter(p => p.name.toLowerCase().includes('joker'));

        for (let i = 0; i < 50; i++) {
            const orderRes = await client.query(
                "INSERT INTO orders (customer_name, total_amount, status) VALUES ($1, 0, 'completed') RETURNING order_id",
                [customers[Math.floor(Math.random() * customers.length)]]
            );
            const newOrderId = orderRes.rows[0].order_id;
            let cart = [];
            
            if (i % 2 === 0 && batmanItems.length > 0 && jokerItems.length > 0) {
                cart.push(batmanItems[Math.floor(Math.random() * batmanItems.length)]);
                if (Math.random() > 0.3) cart.push(jokerItems[Math.floor(Math.random() * jokerItems.length)]);
            } else {
                cart.push(dbProducts[Math.floor(Math.random() * dbProducts.length)]);
            }

            let total = 0;
            for (const p of cart) {
                if(!p) continue;
                await client.query(
                    "INSERT INTO order_item (order_id, product_id, quantity, unit_price) VALUES ($1, $2, 1, $3)", 
                    [newOrderId, p.product_id, p.price]
                );
                total += Number(p.price);
            }
            await client.query("UPDATE orders SET total_amount = $1 WHERE order_id = $2", [total, newOrderId]);
        }

        console.log("✨ SİSTEM HAZIR! Schema + Data başarıyla işlendi.");
    
    } catch (err) {
        console.error("❌ Hata:", err);
        // Hata dosya bulunamadı ise yolu göster
        if (err.code === 'ENOENT') {
            console.error("💡 İPUCU: schema.sql dosyasının yolunu kontrol et. Kod şu an şuraya bakıyor:", path.join(__dirname, '..', 'schema.sql'));
        }
    } finally {
        await pool.end();
    }
};

seedFull();
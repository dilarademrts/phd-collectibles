const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// --- AYARLAR ---
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || '12345', // Kendi şifreni buraya yazmayı unutma
    port: 5432,
});

// Rastgele İsim ve Tarih Yardımcıları
const firstNames = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Can", "Zeynep", "Emre", "Selin", "Burak", "Elif", "Cem", "Deniz", "Ege", "Buse", "Ozan"];
const lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Koç", "Öztürk", "Arslan", "Doğan", "Kılıç", "Aslan", "Yıldız"];
const getRandomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
const getRandomDate = () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 90)); 
    return pastDate;
};
const getRandomStatus = () => {
    const statuses = ['completed', 'completed', 'completed', 'shipped', 'shipped', 'processing', 'cancelled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
};

const seedFull = async () => {
    const client = await pool.connect();

    try {
        console.log("🌱 Güvenli Seeding Başlıyor...");

        // 1. TEMİZLİK
        console.log("🧹 Tablolar temizleniyor...");
        await client.query("TRUNCATE TABLE order_item, orders, product, category, users CASCADE");

        // 2. KULLANICILAR
        console.log("👤 Kullanıcılar oluşturuluyor...");
        const myAdminEmail = "admin@phdcollectibles.com"; 
        await client.query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Süper Admin', $1, 'adminpass', 'admin')`, [myAdminEmail]);

        let usersIds = [];
        for (let i = 0; i < 25; i++) {
            const userRes = await client.query(`
                INSERT INTO users (name, email, password_hash, role) 
                VALUES ($1, $2, '123456', 'customer')
                RETURNING user_id
            `, [getRandomName(), `musteri${i + 1}@test.com`]);
            usersIds.push(userRes.rows[0].user_id);
        }

        // 3. KATEGORİ
        const catRes = await client.query("INSERT INTO category (name) VALUES ('Comics') RETURNING category_id");
        const categoryId = catRes.rows[0].category_id;

        // 4. ÜRÜNLER
        console.log("📦 Ürünler yükleniyor...");
        let productsToInsert = [];
        const jsonPath = path.join(__dirname, '..', 'data', 'products.json');
        
        if (fs.existsSync(jsonPath)) {
            const rawData = fs.readFileSync(jsonPath, 'utf-8');
            productsToInsert = JSON.parse(rawData);
        } else {
            productsToInsert = [
                { name: "Amazing Fantasy #15", price: 45000, stock: 5 },
                { name: "Batman #1", price: 35000, stock: 3 },
                { name: "X-Men #1", price: 15000, stock: 10 }
            ];
        }

        let dbProducts = [];
        for (const p of productsToInsert) {
            // Fiyat kontrolü: Eğer json'da fiyat yoksa veya 0 ise varsayılan 100 yap (Veritabanına boş girmesin)
            const safePrice = Number(p.price) > 0 ? p.price : 100; 

            const res = await client.query(`
                INSERT INTO product (name, description, price, stock_quantity, category_id, image_url)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING product_id, name, price
            `, [p.name, p.description || "Harika ürün", safePrice, p.stock || 20, categoryId, p.image || 'https://via.placeholder.com/150']);
            dbProducts.push(res.rows[0]);
        }

        // --- KRİTİK FİLTRELEME ---
        // Sadece fiyatı 0'dan büyük olan ürünleri seçip yeni bir listeye atıyoruz.
        // Sipariş botu sadece bu "saleableProducts" listesinden seçim yapacak.
        const saleableProducts = dbProducts.filter(p => Number(p.price) > 0);

        if (saleableProducts.length === 0) {
            throw new Error("❌ HATA: Satılabilir (Fiyatı > 0) hiç ürün bulunamadı! Seeding durduruldu.");
        }

        console.log(`✅ Toplam ${dbProducts.length} ürün yüklendi, ${saleableProducts.length} tanesi satışa uygun (Fiyat > 0).`);


        // 5. SİPARİŞLER
        console.log("🛒 Siparişler oluşturuluyor (0 TL'lik ürünler hariç)...");
        
        for (let i = 0; i < 50; i++) {
            const randomUserId = usersIds[Math.floor(Math.random() * usersIds.length)];
            const status = getRandomStatus();
            const date = getRandomDate();

            const orderRes = await client.query(`
                INSERT INTO orders (user_id, status, total_amount, order_date) 
                VALUES ($1, $2, 0, $3) 
                RETURNING order_id
            `, [randomUserId, status, date]);
            
            const newOrderId = orderRes.rows[0].order_id;
            
            const itemCount = Math.floor(Math.random() * 4) + 1; 
            let currentOrderTotal = 0;

            for (let j = 0; j < itemCount; j++) {
                // ARTIK dbProducts YERİNE saleableProducts KULLANIYORUZ 👇
                const randomProduct = saleableProducts[Math.floor(Math.random() * saleableProducts.length)];
                
                const quantity = Math.floor(Math.random() * 3) + 1; // Min 1 Adet

                await client.query(`
                    INSERT INTO order_item (order_id, product_id, quantity, unit_price)
                    VALUES ($1, $2, $3, $4)
                `, [newOrderId, randomProduct.product_id, quantity, randomProduct.price]);

                currentOrderTotal += (Number(randomProduct.price) * quantity);
            }

            await client.query("UPDATE orders SET total_amount = $1 WHERE order_id = $2", [currentOrderTotal, newOrderId]);
        }

        console.log("✨ SİSTEM HAZIR! Fiyatı 0 olan ürünler siparişlere eklenmedi. ✅");
    
    } catch (err) {
        console.error("❌ Hata:", err);
    } finally {
        await client.release();
        await pool.end();
    }
};

seedFull();
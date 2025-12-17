const fs = require('fs');
const path = require('path');
const db = require('./src/db');

const seedData = async () => {
  try {
    console.log('🌱 Akıllı Seeding işlemi başlıyor...');

    // 1. Temizlik
    await db.query('TRUNCATE TABLE order_items, orders, product, categories RESTART IDENTITY CASCADE');

    // 2. Ürünleri Yükle
    const dataPath = path.join(__dirname, 'data', 'products.json');
    const categoriesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    let productsMap = {}; // Ürün adına göre ID bulmak için
    let allProductIds = [];

    for (const cat of categoriesData) {
      const catRes = await db.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [cat.category]);
      const categoryId = catRes.rows[0].id;

      for (const item of cat.items) {
        const prodRes = await db.query(
          'INSERT INTO product (name, description, price, stock_quantity, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, price, name',
          [item.name, item.description, item.price, item.stock, item.image_url, categoryId]
        );
        const p = prodRes.rows[0];
        // Hem listeye hem haritaya ekle
        allProductIds.push({ id: p.id, price: parseFloat(p.price), name: p.name });
        productsMap[p.name] = { id: p.id, price: parseFloat(p.price) };
      }
    }
    console.log(`📦 Toplam ${allProductIds.length} ürün yüklendi.`);

    // 3. AKILLI SİPARİŞ OLUŞTURMA (Mantıklı Sepetler) 🧠
    const statuses = ['completed', 'completed', 'completed', 'simulated', 'cancelled']; 
    const customers = ['Ahmet Y.', 'Mehmet K.', 'Ayşe B.', 'Fatma Z.', 'Can T.', 'Zeynep S.', 'Burak A.'];

    // 50 Tane Sipariş Oluşturalım
    for (let i = 0; i < 50; i++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Siparişi Başlat
        const orderRes = await db.query(
            'INSERT INTO orders (customer_name, total_amount, status) VALUES ($1, 0, $2) RETURNING id',
            [randomCustomer, randomStatus]
        );
        const orderId = orderRes.rows[0].id;

        // Sepet İçeriğini Belirle
        let cartItems = [];
        
        // SENARYO 1: Batman alan Joker de alır (%70 ihtimal)
        if (i % 3 === 0) { // Her 3 siparişten birinde Batman olsun
            cartItems.push(productsMap["Batman The Dark Knight - 1/6 Scale"]);
            if (Math.random() > 0.3) { // %70 ihtimalle Joker ekle
                cartItems.push(productsMap["Joker - Heath Ledger Edition"]);
            }
        } 
        // SENARYO 2: Captain America alan Iron Man de sever
        else if (i % 5 === 0) {
             cartItems.push(productsMap["Captain America - Endgame"]);
             if (Math.random() > 0.5) cartItems.push(productsMap["Iron Man Mark 85 Diecast"]);
        }
        // SENARYO 3: Rastgele Ürünler (Geri kalanı doldurmak için)
        else {
            const randomProd = allProductIds[Math.floor(Math.random() * allProductIds.length)];
            cartItems.push(randomProd);
            // Belki bir tane daha alır?
            if (Math.random() > 0.6) {
                cartItems.push(allProductIds[Math.floor(Math.random() * allProductIds.length)]);
            }
        }

        // Sepeti Veritabanına Yaz ve Tutarı Hesapla
        let orderTotal = 0;
        for (const item of cartItems) {
            if (!item) continue; // Hata koruması
            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, 1, $3)',
                [orderId, item.id, item.price]
            );
            orderTotal += item.price;
        }

        // Toplam Tutarı Güncelle
        await db.query('UPDATE orders SET total_amount = $1 WHERE id = $2', [orderTotal, orderId]);
    }

    console.log('✅ 50 Adet Sipariş Oluşturuldu.');
    console.log('🧠 AI Analizi İçin "Batman + Joker" desenleri yerleştirildi.');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
};

seedData();
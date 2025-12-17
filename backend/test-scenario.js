const fs = require('fs');
const path = require('path');
const db = require('./src/db');

const runTest = async () => {
    try {
        console.log('🎬 SENARYO TEST EDİLİYOR...\n');

        // 1. Senaryo Dosyasını Oku
        const scenarioPath = path.join(__dirname, 'data', 'livestream-scenario.json');
        if (!fs.existsSync(scenarioPath)) {
            throw new Error("Senaryo dosyası bulunamadı! (data/livestream-scenario.json)");
        }
        const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf-8'));
        console.log(`📄 Senaryo yüklendi. Toplam ${scenario.length} olay var.`);

        // 2. Veritabanındaki Gerçek Ürünleri Çek
        const productsRes = await db.query('SELECT name, stock_quantity FROM product');
        const dbProducts = productsRes.rows;
        
        console.log(`📦 Veritabanında ${dbProducts.length} adet ürün bulundu.\n`);
        console.log('---------------------------------------------------');

        // 3. Senaryoyu Satır Satır Kontrol Et
        let errorCount = 0;

        for (const event of scenario) {
            const time = `[00:${event.time_offset.toString().padStart(2, '0')}]`;
            
            if (event.type === 'CHAT') {
                console.log(`${time} 💬 ${event.user}: ${event.message}`);
            } 
            else if (event.type === 'SYSTEM') {
                console.log(`${time} 📢 SİSTEM: ${event.message}`);
            }
            else if (event.type === 'PURCHASE' || event.type === 'PURCHASE_ATTEMPT') {
                // KRİTİK KONTROL: Bu ürün veritabanında var mı?
                const productExists = dbProducts.find(p => p.name === event.product_name);
                
                if (productExists) {
                    console.log(`${time} 🛒 SATIN ALMA: ${event.product_name} (Mevcut Stok: ${productExists.stock_quantity}) ✅ GEÇERLİ`);
                } else {
                    console.log(`${time} 🛒 SATIN ALMA: ${event.product_name} ❌ HATA: VERİTABANINDA YOK!`);
                    errorCount++;
                }
            }
            else if (event.type === 'AI_TRIGGER') {
                console.log(`${time} 🤖 AI ÖNERİSİ: ${event.message}`);
            }
        }

        console.log('---------------------------------------------------');
        
        if (errorCount === 0) {
            console.log('\n✅ TEST BAŞARILI: Senaryo veritabanı ile %100 uyumlu!');
        } else {
            console.log(`\n❌ TEST BAŞARISIZ: ${errorCount} adet ürün ismi hatası var.`);
            console.log('   İPUCU: products.json ile livestream-scenario.json içindeki isimleri birebir aynı yap.');
        }

        process.exit(0);

    } catch (error) {
        console.error('Büyük Hata:', error);
        process.exit(1);
    }
};

runTest();
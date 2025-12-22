const fs = require('fs');
const path = require('path');
const axios = require('axios'); // İstek atmak için
const db = require('./src/db');

// Python Servis Adresi (Senin ayarladığın port 5002)
const AI_SERVICE_URL = 'http://localhost:5002/recommend';

const runSimulation = async () => {
    try {
        console.log('🚀 CANLI YAYIN SİMÜLASYONU BAŞLIYOR...\n');

        // 1. Senaryoyu Oku
        const scenarioPath = path.join(__dirname, 'data', 'livestream-scenario.json');
        const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf-8'));
        
        console.log(`📄 Toplam ${scenario.length} olay işlenecek.\n`);

        // 2. Olayları Tek Tek İşle
        for (const event of scenario) {
            
            // Gerçekçi olması için biraz bekletelim (Demo'da hızlı aksın diye 500ms)
            await new Promise(r => setTimeout(r, 500));
            
            const time = `[00:${event.time_offset.toString().padStart(2, '0')}]`;

            // --- DURUM 1: SATIN ALMA ---
            if (event.type === 'PURCHASE') {
                console.log(`${time} 🛒 SATIŞ: ${event.user} -> ${event.product_name} satın aldı.`);
                // Burada normalde veritabanında stok düşer (WS1/WS2)
            }
            
            // --- DURUM 2: STOK BİTTİ UYARISI ---
            else if (event.type === 'SYSTEM' && event.message.includes('SOLD OUT')) {
                console.log(`${time} ❌ ${event.message}`);
            }

            // --- DURUM 3: YAPAY ZEKA TETİKLENMESİ (INTEGRATION NOKTASI) ---
            else if (event.type === 'AI_TRIGGER') {
                console.log(`\n${time} 🧠 AI TETİKLENDİ! Python servisine soruluyor...`);
                
                try {
                    // Senaryodaki mesajdan ürün adını çekiyoruz (Basit parse)
                    // Örn mesaj: "AI ÖNERİSİ: Batman sevenler bunu da sevdi..."
                    // Biz direkt Batman'i soralım.
                    const contextProduct = "Batman The Dark Knight - 1/6 Scale"; 

                    // PYTHON'A İSTEK AT 🚀
                    const response = await axios.post(AI_SERVICE_URL, {
                        product_name: contextProduct
                    });

                    const recommendations = response.data.recommendations;
                    
                    console.log(`${time} 🤖 AI CEVABI GELDİ:`);
                    console.log(`\t   🔍 Analiz Edilen: ${contextProduct}`);
                    console.log(`\t   💡 Önerilenler: ${recommendations.join(', ')}`);
                    console.log(`\t   ✅ Ekrana Yansıtıldı.\n`);

                } catch (error) {
                    console.error(`${time} ⚠️ AI Bağlantı Hatası: Python servisi (5002) açık mı?`);
                }
            }
            
            // --- DİĞER DURUMLAR ---
            else {
                console.log(`${time} 💬 ${event.type}: ${event.message || event.user}`);
            }
        }

        console.log('\n🏁 YAYIN SONA ERDİ.');
        process.exit(0);

    } catch (error) {
        console.error('Simülasyon Hatası:', error);
        process.exit(1);
    }
};

runSimulation();
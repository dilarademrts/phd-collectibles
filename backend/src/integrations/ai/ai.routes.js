require('dotenv').config();
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const db = require('../../db/index'); 

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper: String geçerli bir UUID mi kontrol eder
function isUUID(str) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(str);
}

// Endpoint: /ai/ask
router.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ answer: "Hey! Sessiz sinema mı oynuyoruz? Bir şeyler sor dostum! 🎬" });
    }

    try {
        // --- 1. AŞAMA: SORUDA ID ARAMA (GÜVENLİ VERSİYON) ---
        // Hem UUID formatını (uzun tireli kod) hem de basit sayıları yakalamaya çalışalım
        // Örn: "a0eebc99-..." veya "5"
        const potentialMatch = question.match(/([a-f0-9-]{36})|(\d+)/i);
        
        let orderInfoText = "Kullanıcı spesifik bir sipariş numarası belirtmedi.";
        let orderFound = false;

        if (potentialMatch) {
            const capturedId = potentialMatch[0];

            // BURASI KRİTİK: Eğer yakalanan şey UUID formatında değilse DB'ye sorma! Çökersin.
            if (isUUID(capturedId)) {
                const orderQuery = `
                    SELECT 
                        o.order_id, o.status, o.total_amount, o.order_date,
                        u.name as customer_name,
                        p.name as product_name, oi.quantity
                    FROM orders o
                    JOIN users u ON o.user_id = u.user_id
                    JOIN order_item oi ON o.order_id = oi.order_id
                    JOIN product p ON oi.product_id = p.product_id
                    WHERE o.order_id = $1
                `;

                const orderResult = await db.query(orderQuery, [capturedId]);

                if (orderResult.rows.length > 0) {
                    const firstRow = orderResult.rows[0];
                    const productsList = orderResult.rows.map(r => `${r.product_name} (${r.quantity} adet)`).join(", ");
                    
                    orderInfoText = `
                    BULUNAN SİPARİŞ DETAYLARI (#${capturedId}):
                    - Müşteri: ${firstRow.customer_name}
                    - Durum: ${firstRow.status}
                    - Tarih: ${new Date(firstRow.order_date).toLocaleDateString("tr-TR")}
                    - İçerik: ${productsList}
                    - Toplam Tutar: ${firstRow.total_amount} TL
                    `;
                    orderFound = true;
                } else {
                    orderInfoText = `Sistemde #${capturedId} ID'li bir sipariş bulunamadı.`;
                }
            } else {
                // Eğer kullanıcı "5" dediyse ama bizim DB UUID ise burası çalışır:
                orderInfoText = `Kullanıcı '${capturedId}' diye kısa bir numara söyledi ama bizim veritabanımız UUID (uzun kod) kullanıyor. Bu yüzden sipariş detayını çekemedim. Kullanıcıya siparişin tam UUID kodunu veya e-posta adresini sorabilirsin.`;
            }
        }

        // --- 2. AŞAMA: ÜRÜN ARAMASI ---
        const productQuery = `
            SELECT name, price, stock_quantity, description 
            FROM product 
            WHERE name ILIKE $1 OR description ILIKE $1 
            LIMIT 3
        `;
        
        const searchTerm = `%${question}%`;
        const productResult = await db.query(productQuery, [searchTerm]);
        
        let foundProductsText = "";
        if (productResult.rows.length > 0) {
            foundProductsText = productResult.rows.map(p => 
                `- Ürün: ${p.name} | Fiyat: ${p.price} TL | Stok: ${p.stock_quantity} | Açıklama: ${p.description}`
            ).join("\n");
        } else {
            foundProductsText = "Veritabanında ürün eşleşmesi yok.";
        }

        // --- 3. AŞAMA: AI'A GÖNDER ---
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Sen Stan'sin. "PHD Collectibles" çizgi roman dükkanının yapay zeka asistanısın.
                    
                    GÖREVİN: Aşağıdaki bilgilere göre cevap ver.
                    
                    [VERİTABANI BİLGİLERİ]
                    --- SİPARİŞ DURUMU ---
                    ${orderInfoText}

                    --- ÜRÜN BİLGİSİ ---
                    ${foundProductsText}
                    
                    ÖNEMLİ İPUCU:
                    Eğer [SİPARİŞ DURUMU] kısmında "kısa numara söyledi ama UUID lazım" uyarısı varsa, kullanıcıya nazikçe:
                    "Dostum, sipariş numaralarımız biraz karmaşık (UUID formatında). Bana tam kodu söyleyebilir misin? Ya da 'X ürününden var mı?' diye sorabilirsin!" de.
                    `
                },
                {
                    role: "user",
                    content: question
                }
            ],
            max_tokens: 250,
            temperature: 0.7,
        });

        const answer = completion.choices[0].message.content;
        res.json({ answer: answer });

    } catch (error) {
        console.error("AI Hatası:", error);
        res.status(500).json({ answer: "Sistemde bir hata oluştu! 🕷️" });
    }
});

module.exports = router;
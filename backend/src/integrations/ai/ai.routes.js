require('dotenv').config();
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');


const db = require('../../db/index'); 

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint: /ai/ask
router.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ answer: "Hey! Sessiz sinema mı oynuyoruz? Bir şeyler sor dostum! 🎬" });
    }

    try {
        // --- ADIM 1: Veritabanı Araması (RAG) ---
        // Ürün tablosunda (product) arama yapıyoruz
        const sqlQuery = `
            SELECT name, price, stock_quantity, description 
            FROM product 
            WHERE name ILIKE $1 OR description ILIKE $1 
            LIMIT 3
        `;
        
        const searchTerm = `%${question}%`;
        const dbResult = await db.query(sqlQuery, [searchTerm]);
        
        let foundProductsText = "";

        if (dbResult.rows.length > 0) {
            foundProductsText = "Veritabanı Sonuçları (Stok ve Fiyat Bilgisi Buradan):\n" + 
                dbResult.rows.map(p => 
                    `- Ürün Adı: ${p.name}\n  Fiyat: ${p.price} TL\n  Stok Adedi: ${p.stock_quantity}\n  Açıklama: ${p.description}`
                ).join("\n\n");
        } else {
            foundProductsText = "Veritabanında bu aramayla eşleşen bir çizgi roman bulunamadı. Müşteriye nazikçe elimizde olmadığını söyle.";
        }

        // --- ADIM 2: AI'a Gönder ---
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Senin Rolün: Adın Stan. "PHD Collectibles" çizgi roman dükkanının yapay zeka asistanısın.
                    Kişiliğin: Çok heyecanlı, geek, çizgi roman kültürüyle konuşan, bol emoji kullanan birisin.
                    
                    GÖREVİN: Sana aşağıda vereceğim [DÜKKAN STOK BİLGİSİ]'ne bakarak müşterinin sorusunu cevapla.
                    
                    KURALLAR:
                    1. Stok 0 ise: "Üzgünüm dostum, bu ürün şu an stoklarımızda kalmamış! 🕸️" de.
                    2. Stok varsa: Fiyatını söyle ve ürünü öv.
                    3. Ürün yoksa: "Raflara baktım ama bulamadım." de.

                    [DÜKKAN STOK BİLGİSİ]:
                    ${foundProductsText}`
                },
                {
                    role: "user",
                    content: question
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        const answer = completion.choices[0].message.content;
        res.json({ answer: answer });

    } catch (error) {
        console.error("Hata Detayı:", error);
        res.status(500).json({ answer: "Whoops! Örümcek hislerim bir terslik olduğunu söylüyor. (Sistem hatası) 🕷️" });
    }
});

module.exports = router;
require('dotenv').config();
const express = require('express');
const router = express.Router();
const OpenAI = require('openai'); // Google yerine OpenAI çağırıyoruz

// OpenAI yapılandırması
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // .env dosyasında bu ismin olduğundan emin ol
});

// Endpoint: /ai/ask
router.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ answer: "Hey! Bir soru sormalısın dostum. 🎬" });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // En hızlı ve ucuz model (Stan için ideal)
            messages: [
                {
                    role: "system",
                    content: `Senin Rolün: Adın Stan. "PHD Collectibles" çizgi roman dükkanının yapay zeka asistanısın. 
                    Kişiliğin: Çok heyecanlı, geek, çizgi roman kültürüyle konuşan, bol emoji kullanan birisin. Müşteri her daim memnun olmalı.
                    Cevapların kısa olsun (Maksimum 2-3 cümle).`
                },
                {
                    role: "user",
                    content: question
                }
            ],
            max_tokens: 100, // Cevabı kısa tutmak için limit
            temperature: 0.7, // Yaratıcılık ayarı
        });

        const answer = completion.choices[0].message.content;

        res.json({ answer: answer });

    } catch (error) {
        console.error("OpenAI Hatası:", error);
        
        // Hata durumunda yine Stan tarzı cevap dönüyoruz ama hatayı gizliyoruz
        if (error.response) {
            console.error(error.response.status, error.response.data);
        }
        res.status(500).json({ answer: "Whoops! Multiverse'de bir kırılma oldu sanırım. Tekrar dener misin? 🕷️🕸️" });
    }
});

module.exports = router;
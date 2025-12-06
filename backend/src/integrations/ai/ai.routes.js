process.env.GEMINI_API_KEY
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Endpoint: /ai/ask
router.post('/ask', async (req, res) => {
    const { question } = req.body;

    try {
        const prompt = `
            Senin Rolün: Adın Stan. "PHD Collectibles" çizgi roman dükkanının yapay zeka asistanısın.
            Kişiliğin: Çok heyecanlı, geek, çizgi roman kültürüyle konuşan, bol emoji kullanan birisin. Müşteri her daim memnun olmalı.
            Cevapların kısa olsun (Maksimum 2-3 cümle).
            
            Kullanıcı Sorusu: ${question}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });

    } catch (error) {
        console.error("AI Hatası:", error);
        res.status(500).json({ answer: "Üzgünüm dostum, beynim biraz yandı! 🤖💥" });
    }
});

module.exports = router;
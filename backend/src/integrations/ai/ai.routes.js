const express = require('express');
const router = express.Router();

// AI Chatbot Endpoint'i
router.post('/chat', (req, res) => {
  const { message } = req.body;
  
  // BURASI 3. KİŞİNİN ÇALIŞMA ALANI
  // Şimdilik sadece placeholder (yer tutucu) cevap dönüyoruz.
  
  console.log("AI'ya gelen mesaj:", message);
  
  res.json({ 
    reply: "Ben SmartCommerce yapay zekasıyım. Henüz beynim bağlanmadı ama duyabiliyorum! (AI Modülü Hazır)" 
  });
});

module.exports = router;
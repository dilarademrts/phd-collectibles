const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Modül Rotalarını İçe Aktar
const stockRoutes = require('./modules/stock/stock.routes');
const liveSaleRoutes = require('./modules/live-sale/live.routes');
const aiRoutes = require('./integrations/ai/ai.routes.js'); // AI sırasını bekliyor

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Rotaları Tanımla (Modular Monolith Yapısı) ---

// 1. Stok ve Ürün Yönetimi (Excel import buraya gidecek)
app.use('/api/stock', stockRoutes);

// 2. Canlı Yayın Satış İşlemleri (Claim sistemi)
app.use('/api/live', liveSaleRoutes);

// 3. Yapay Zeka Servisi (Şu an taslak, 3. kişi buraya girecek)
app.use('/api/ai', aiRoutes);

// Sağlık Kontrolü
app.get('/', (req, res) => {
  res.send('Smart Commerce API Çalışıyor 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif!`);
});
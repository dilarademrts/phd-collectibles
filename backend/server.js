const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');


// Kendi oluşturduğumuz dosyalar
const db = require('./src/db'); 
const aiRoutes = require('./src/integrations/ai/ai.routes'); 
const ordersRoutes = require("./src/routes/orders.routes");
const liveRoutes = require("./src/modules/live-sale/live.routes");
const analyticsRoutes = require("./src/routes/analytics.routes");
const productsRoutes = require("./src/routes/products.routes");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware'ler
app.use(cors());
app.use(express.json());

// AI Rotaları
app.use('/ai', aiRoutes);
app.use("/orders", ordersRoutes);
app.use("/live", liveRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/products", productsRoutes);

// Uploads klasörü kontrolü
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: 'uploads/' }); 

// --- ROTALAR ---

app.get('/', (req, res) => {
  res.send('Backend Sunucusu Çalışıyor! 🚀');
});

app.get('/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM product');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Dosya yüklenmedi.');
        }
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            await db.query(
                'INSERT INTO product (name, price, description, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5)',
                [item.name, item.price, item.description, item.stock_quantity, item.image_url]
            );
        }
        res.json({ message: 'Excel başarıyla yüklendi ve veritabanına eklendi!', count: data.length });
    } catch (error) {
        console.error(error);
        res.status(500).send('Excel işlenirken hata oluştu.');
    }
});

// Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
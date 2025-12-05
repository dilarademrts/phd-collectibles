const express = require('express');
const cors = require('cors');
const db = require('./src/db'); // Veritabanı bağlantısı burada 'db' olarak tanımlı
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Multer ve XLSX kurulumu
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs'); // Klasör kontrolü için

// Uploads klasörü yoksa oluştur (Hata almamak için)
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: 'uploads/' }); 

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

// Excel Yükleme Endpoint'i
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Dosya yüklenmedi.');
        }

        // 1. Dosyayı Oku
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // 2. Excel verisini JSON'a çevir
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log("Excel'den okunan veri:", data); 

        // 3. Veritabanına Ekle (Döngü ile)
        for (const item of data) {
            // BURASI DÜZELTİLDİ: pool.query yerine db.query yapıldı
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

app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
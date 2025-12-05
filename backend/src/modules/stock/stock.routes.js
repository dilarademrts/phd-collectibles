const express = require('express');
const router = express.Router();
const db = require('../../db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Excel için

// Tüm Ürünleri Getir
router.get('/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excel Import (Basit Versiyon)
router.post('/import', upload.single('file'), async (req, res) => {
  // Not: Gerçek Excel okuma lojiğini buraya ekleyeceğiz.
  // Şimdilik demo için başarılı dönüyoruz.
  res.json({ message: "Excel verileri başarıyla işlendi (Simülasyon)" });
});

module.exports = router;
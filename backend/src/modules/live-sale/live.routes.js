const express = require('express');
const router = express.Router();
const db = require('../../db');

// Claim (Satın Alma) İşlemi
router.post('/claim', async (req, res) => {
  const { user, productId } = req.body;
  
  // Transaction Başlat (Veri bütünlüğü için)
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Stok kontrolü ve kilitleme (FOR UPDATE)
    const productRes = await client.query(
      'SELECT * FROM products WHERE id = $1 FOR UPDATE', 
      [productId]
    );
    const product = productRes.rows[0];

    if (!product || product.stock < 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'STOK TÜKENDİ!' });
    }

    // 2. Stoğu Düş
    await client.query('UPDATE products SET stock = stock - 1 WHERE id = $1', [productId]);

    // 3. Sipariş Oluştur
    await client.query(
      'INSERT INTO orders (customer_name, product_id, amount, source) VALUES ($1, $2, $3, $4)',
      [user, productId, product.price, 'Live Stream']
    );

    // 4. Logla
    await client.query(
      'INSERT INTO live_claims (winner_name, product_id) VALUES ($1, $2)',
      [user, productId]
    );

    await client.query('COMMIT');
    res.json({ success: true, winner: user, product: product.name });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
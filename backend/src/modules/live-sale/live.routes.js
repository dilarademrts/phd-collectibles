const express = require("express");
const router = express.Router();
const db = require("../../db");
const { sendMail } = require("../notifications/mail.service");


// Canlı yayın başlat (admin)
router.post("/start", async (req, res) => {
  try {
    const { stream_platform = "Instagram", stream_id = "demo" } = req.body || {};
    const result = await db.query(
      `INSERT INTO live_sale (stream_platform, stream_id, start_time)
       VALUES ($1, $2, NOW())
       RETURNING live_sale_id, stream_platform, stream_id, start_time`,
      [stream_platform, stream_id]
    );
    res.json({ message: "Live başladı", live: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Canlı yayını bitir (admin)
router.post("/stop", async (req, res) => {
  try {
    const { live_sale_id } = req.body;
    const result = await db.query(
      `UPDATE live_sale SET end_time = NOW()
       WHERE live_sale_id = $1
       RETURNING live_sale_id, end_time`,
      [live_sale_id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Live bulunamadı" });
    res.json({ message: "Live bitti", live: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * CLAIM (Satın alma simülasyonu)
 * Body:
 * {
 *   "live_sale_id": "...",
 *   "user": "Ali",
 *   "product_id": "..."
 * }
 */
router.post("/claim", async (req, res) => {
  const { user, product_id, live_sale_id } = req.body;

  if (!user || !product_id || !live_sale_id) {
    return res.status(400).json({ error: "user, product_id, live_sale_id zorunlu" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Ürünü kilitle + stok kontrol (schema: product / stock_quantity)
    const productRes = await client.query(
      `SELECT product_id, name, price, stock_quantity
       FROM product
       WHERE product_id = $1
       FOR UPDATE`,
      [product_id]
    );

    if (productRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    const product = productRes.rows[0];

    if (product.stock_quantity < 1) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "STOK TÜKENDİ!" });
    }

    // 2) Stoğu düş
    await client.query(
      `UPDATE product SET stock_quantity = stock_quantity - 1 WHERE product_id = $1`,
      [product_id]
    );

    const stockCheck = await client.query(
      "SELECT stock_quantity FROM product WHERE product_id = $1",
      [product_id]
    );

    const remaining = stockCheck.rows[0].stock_quantity;

    // live.routes.js içinde:
if (remaining < 3 && process.env.ADMIN_EMAIL) {
  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `Low Stock Uyarısı: ${product.name}`,
    text: `${product.name} stoğu ${remaining} oldu.`
  });
}
else if (remaining == 3 && process.env.ADMIN_EMAIL) {
  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `No Stock Uyarısı: ${product.name}`,
    text: `${product.name} stoğu tukendi.`
  });
}

    // 3) Order oluştur (admin-only: user_id NULL olabilir)
    const orderRes = await client.query(
      `INSERT INTO orders (status, total_amount)
       VALUES ('pending', $1)
       RETURNING order_id, order_date, total_amount, status`,
      [product.price]
    );
    const order = orderRes.rows[0];

    // 4) Order item ekle
    await client.query(
      `INSERT INTO order_item (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, 1, $3)`,
      [order.order_id, product.product_id, product.price]
    );

    // 5) Live claim logla (admin-only: user_id NULL)
    await client.query(
      `INSERT INTO live_claim (live_sale_id, user_id, message_text, is_winner)
       VALUES ($1, NULL, $2, TRUE)`,
      [live_sale_id, `${user} satın aldım! (${product.name})`]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      winner: user,
      product: { id: product.product_id, name: product.name, price: product.price },
      order
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

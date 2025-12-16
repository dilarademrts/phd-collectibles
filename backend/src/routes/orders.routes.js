const express = require("express");
const router = express.Router();
const db = require("../db");
const { generateInvoice } = require("../modules/invoices/invoice.service");

// GET /orders  → admin sipariş listesi
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT order_id, status, total_amount, order_date FROM orders ORDER BY order_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// PATCH /orders/:id/complete → tamamla + fatura üret
router.patch("/:id/complete", async (req, res) => {
  const { id } = req.params;
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Order'ı completed yap
    const orderRes = await client.query(
      "UPDATE orders SET status='completed' WHERE order_id=$1 RETURNING order_id, order_date, total_amount",
      [id]
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Sipariş bulunamadı" });
    }

    const order = orderRes.rows[0];

    // 2️⃣ Item'ları çek
    const itemsRes = await client.query(
      `SELECT p.name, oi.quantity, oi.unit_price
       FROM order_item oi
       JOIN product p ON p.product_id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    const fullOrder = {
      ...order,
      items: itemsRes.rows
    };

    // 3️⃣ PDF üret
    const pdf = await generateInvoice(fullOrder);

    // 4️⃣ Invoice DB kaydı
    await client.query(
      `INSERT INTO invoices (order_id, file_name, file_path)
       VALUES ($1, $2, $3)`,
      [id, pdf.fileName, pdf.filePath]
    );

    await client.query("COMMIT");

    res.json({
      message: "Sipariş tamamlandı, fatura oluşturuldu",
      invoice: pdf
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

const path = require("path");

router.get("/:id/invoice", async (req, res) => {
  const { id } = req.params;

  try {
    const invRes = await db.query(
      "SELECT file_path, file_name FROM invoices WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1",
      [id]
    );

    if (invRes.rowCount === 0) {
      return res.status(404).json({ error: "Bu sipariş için fatura yok" });
    }

    const { file_path, file_name } = invRes.rows[0];

    // Güvenli kontrol (opsiyonel ama iyi)
    if (!file_path.includes(path.join("backend", "invoices")) && !file_path.includes("\\backend\\invoices")) {
      return res.status(400).json({ error: "Geçersiz fatura yolu" });
    }

    return res.download(file_path, file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});


module.exports = router;

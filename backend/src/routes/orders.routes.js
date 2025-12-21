// src/routes/orders.routes.js
const express = require("express");
const path = require("path");
const router = express.Router();

// DİKKAT: Bu dosya src/routes altında ise db yolu genelde ../db olur.
// Sende server.js -> require("./src/db") kullandığı için burada ../db mantıklı.
const db = require("../db");

// Bunların gerçek yolunu projendeki klasörlere göre ayarla.
// (Senin dosyada "./modules/..." yazıyordu ama routes klasöründen bakınca genelde "../modules/..." olur.)
const { generateInvoice } = require("../modules/invoices/invoice.service");
const { sendMail } = require("../modules/notifications/mail.service");

// GET /orders/summary
router.get("/summary", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT status, COUNT(*)::int AS count
      FROM orders
      GROUP BY status;
    `);

    const map = { pending: 0, processing: 0, shipped: 0, delivered: 0, completed: 0 };
    for (const row of result.rows) map[row.status] = Number(row.count);

    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /orders
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

// PATCH /orders/:id/complete
router.patch("/:id/complete", async (req, res) => {
  const { id } = req.params;
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      "UPDATE orders SET status='completed' WHERE order_id=$1 RETURNING order_id, order_date, total_amount",
      [id]
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Sipariş bulunamadı" });
    }

    const order = orderRes.rows[0];

    const itemsRes = await client.query(
      `SELECT p.name, oi.quantity, oi.unit_price
       FROM order_item oi
       JOIN product p ON p.product_id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    const fullOrder = {
      ...order,
      items: itemsRes.rows,
    };

    const pdf = await generateInvoice(fullOrder);

    await client.query(
      `INSERT INTO invoices (order_id, file_name, file_path)
       VALUES ($1, $2, $3)`,
      [id, pdf.fileName, pdf.filePath]
    );

    // Mail opsiyonel: env yoksa crash olmasın
    if (process.env.ADMIN_EMAIL) {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `Invoice hazır: ${pdf.fileName}`,
        text: `Order ${order.order_id} tamamlandı. Fatura ektedir.`,
        attachments: [
          {
            filename: pdf.fileName,
            path: pdf.filePath,
            contentType: "application/pdf",
          },
        ],
      });
    }

    await client.query("COMMIT");

    res.json({
      message: "Sipariş tamamlandı, fatura oluşturuldu",
      invoice: pdf,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /orders/:id/invoice
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

    // Basit güvenlik kontrolü (istersen kaldır)
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

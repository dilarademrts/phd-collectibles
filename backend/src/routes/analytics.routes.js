const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /analytics/kpis
 * - today_sales_total
 * - completed_orders_today
 * - low_stock_count (stock_quantity < 3)
 */
router.get("/kpis", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN o.status = 'completed' AND o.order_date::date = CURRENT_DATE THEN o.total_amount ELSE 0 END), 0) AS today_sales_total,
        COALESCE(SUM(CASE WHEN o.status = 'completed' AND o.order_date::date = CURRENT_DATE THEN 1 ELSE 0 END), 0) AS completed_orders_today,
        (SELECT COUNT(*) FROM product WHERE stock_quantity < 3) AS low_stock_count
      FROM orders o;
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /analytics/kpis error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /analytics/sales-daily?days=7
 * Günlük completed satış toplamları (line chart)
 */
router.get("/sales-daily", async (req, res) => {
  const days = Number(req.query.days || 7);

  try {
    const result = await db.query(
      `
      SELECT
        o.order_date::date AS day,
        COALESCE(SUM(o.total_amount), 0) AS total
      FROM orders o
      WHERE o.status = 'completed'
        AND o.order_date::date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')
      GROUP BY day
      ORDER BY day ASC;
      `,
      [days]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /analytics/sales-daily error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /analytics/stock-by-category
 * Kategoriye göre stok toplamı (pie chart)
 */
router.get("/stock-by-category", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        c.name AS category,
        COALESCE(SUM(p.stock_quantity), 0) AS stock_total
      FROM category c
      LEFT JOIN product p ON p.category_id = c.category_id
      GROUP BY c.name
      ORDER BY stock_total DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET /analytics/stock-by-category error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /product-analytics/top-products
 * En çok kazandıran ürünler (ALL TIME)
 */
router.get("/top-products", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        p.product_id,
        p.name,
        SUM(oi.quantity) AS total_sold,
        SUM(oi.quantity * oi.unit_price) AS revenue
      FROM order_item oi
      JOIN product p ON p.product_id = oi.product_id
      GROUP BY p.product_id, p.name
      ORDER BY revenue DESC
      LIMIT 5;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("top-products error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

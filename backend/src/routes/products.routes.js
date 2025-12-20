const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const r = await db.query(
        "SELECT product_id, name, price, stock_quantity FROM product ORDER BY name ASC"
    );

    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

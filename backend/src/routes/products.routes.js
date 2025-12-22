const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const r = await db.query(`
      SELECT
        p.product_id,
        p.name,
        p.description,
        p.price,
        COALESCE(p.stock_quantity, 0) AS stock_quantity,
        p.image_url,
        p.category_id,
        c.name AS category
      FROM product p
      LEFT JOIN category c ON c.category_id = p.category_id
      ORDER BY p.name ASC
    `);

    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /products/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock_quantity, category_id, image_url } = req.body;

  try {
    const r = await db.query(
      `
      UPDATE product
      SET
        name = $1,
        description = $2,
        price = $3,
        stock_quantity = $4,
        category_id = $5,
        image_url = $6
      WHERE product_id = $7
      RETURNING *
      `,
      [name, description, price, stock_quantity, category_id, image_url, id]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /products/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const r = await db.query(
      "DELETE FROM product WHERE product_id = $1 RETURNING product_id",
      [id]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /products
router.post("/", async (req, res) => {
  const { name, description, price, stock_quantity, category_id, image_url } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    return res.status(400).json({ error: "price is required and must be a number" });
  }

  try {
    const r = await db.query(
      `
      INSERT INTO product (name, description, price, stock_quantity, category_id, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING product_id, name, description, price, stock_quantity, category_id, image_url
      `,
      [
        String(name).trim(),
        description ?? null,
        Number(price),
        stock_quantity === undefined || stock_quantity === null ? 0 : Number(stock_quantity),
        category_id ?? null,
        image_url ?? null,
      ]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");

function getUserId(req) {
  return req.header("x-user-id");
}

// GET /me
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Missing x-user-id" });

  try {
    const r = await db.query(
      `SELECT user_id, name, email FROM users WHERE user_id = $1`,
      [userId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "User not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /me
router.put("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Missing x-user-id" });

  const { name, email } = req.body;
  if (!name || !String(name).trim()) return res.status(400).json({ error: "name required" });
  if (!email || !String(email).trim()) return res.status(400).json({ error: "email required" });

  try {
    const r = await db.query(
      `UPDATE users SET name = $1, email = $2 WHERE user_id = $3
       RETURNING user_id, name, email`,
      [String(name).trim(), String(email).trim(), userId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "User not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /me/password  (MVP: sadece placeholder)
router.put("/password", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Missing x-user-id" });

  const { newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 6)
    return res.status(400).json({ error: "newPassword min 6 chars" });

  // TODO: bcrypt + users.password_hash alanı varsa onu update et
  // Şimdilik: DB'de password alanın yoksa bu endpoint sadece mock kalır.
  res.json({ success: true });
});

module.exports = router;

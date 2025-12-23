const express = require("express");
const router = express.Router();
const db = require("../db");

function getUserId(req) {
  return req.header("x-user-id");
}

// GET /settings
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Missing x-user-id" });

  try {
    const r = await db.query(
      `SELECT user_id, theme, email_notifications, push_notifications
       FROM user_settings WHERE user_id = $1`,
      [userId]
    );

    // yoksa default oluştur
    if (r.rowCount === 0) {
      const ins = await db.query(
        `INSERT INTO user_settings (user_id)
         VALUES ($1)
         RETURNING user_id, theme, email_notifications, push_notifications`,
        [userId]
      );
      return res.json(ins.rows[0]);
    }

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /settings
router.put("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Missing x-user-id" });

  const { theme, email_notifications, push_notifications } = req.body;

  const safeTheme = ["light", "dark", "system"].includes(theme) ? theme : "system";

  try {
    const r = await db.query(
      `INSERT INTO user_settings (user_id, theme, email_notifications, push_notifications)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         theme = EXCLUDED.theme,
         email_notifications = EXCLUDED.email_notifications,
         push_notifications = EXCLUDED.push_notifications,
         updated_at = now()
       RETURNING user_id, theme, email_notifications, push_notifications`,
      [userId, safeTheme, !!email_notifications, !!push_notifications]
    );

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

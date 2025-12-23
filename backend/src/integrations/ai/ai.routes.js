require('dotenv').config();
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const db = require('../../db/index'); 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// UUID kontrolü
function isUUID(str) {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
}

router.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({
      answer: "Hey! Sessiz sinema mı oynuyoruz? Bir şeyler sor dostum 🎬",
    });
  }

  try {
    /* =====================================================
       1️⃣ SADECE GERÇEK UUID VAR MI DİYE BAK
    ===================================================== */
    const uuidMatch = question.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );

    let orderInfoText = "Kullanıcı sipariş numarası belirtmedi.";

    if (uuidMatch && isUUID(uuidMatch[0])) {
      const orderId = uuidMatch[0];

      const orderQuery = `
        SELECT 
          o.order_id,
          o.status,
          o.total_amount,
          o.order_date,
          u.name AS customer_name,
          p.name AS product_name,
          oi.quantity
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        LEFT JOIN order_item oi ON o.order_id = oi.order_id
        LEFT JOIN product p ON oi.product_id = p.product_id
        WHERE o.order_id = $1
      `;

      const orderResult = await db.query(orderQuery, [orderId]);

      if (orderResult.rows.length > 0) {
        const firstRow = orderResult.rows[0];
        const productsList = orderResult.rows
          .filter(r => r.product_name) // sadece ürün adı olanları al
          .map((r) => `${r.product_name} (${r.quantity} adet)`)
          .join(', ');

        orderInfoText = `
SİPARİŞ DETAYLARI (#${orderId})
- Müşteri: ${firstRow.customer_name || "Bilinmiyor"}
- Durum: ${firstRow.status || "Bilinmiyor"}
- Tarih: ${firstRow.order_date ? new Date(firstRow.order_date).toLocaleDateString('tr-TR') : "Bilinmiyor"}
- İçerik: ${productsList || "Ürün bilgisi yok"}
- Toplam: ${firstRow.total_amount || "Bilinmiyor"} TL
        `;
      } else {
        orderInfoText = `#${orderId} numaralı sipariş bulunamadı.`;
      }
    }

    /* =====================================================
       2️⃣ ÜRÜN ARAMASI
    ===================================================== */
    const productQuery = `
      SELECT name, price, stock_quantity, description
      FROM product
      WHERE name ILIKE $1 OR description ILIKE $1
      LIMIT 3
    `;

    const productResult = await db.query(productQuery, [`%${question}%`]);

    let productInfoText = 'Ürün eşleşmesi bulunamadı.';

    if (productResult.rows.length > 0) {
      productInfoText = productResult.rows
        .map(
          (p) =>
            `- ${p.name} | ${p.price} TL | Stok: ${p.stock_quantity}`
        )
        .join('\n');
    }

    /* =====================================================
       3️⃣ OPENAI
    ===================================================== */
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
Sen Stan'sin. "PHD Collectibles" çizgi roman dükkanının AI asistanısın.

KURALLAR:
- Sipariş bilgisi varsa onu açıkla
- Sipariş yoksa ürün bilgisine odaklan
- UUID ile ilgili kullanıcıyı GEREKSİZ yere uyarmadan cevapla

--- SİPARİŞ ---
${orderInfoText}

--- ÜRÜNLER ---
${productInfoText}
          `,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    res.json({
      answer: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error('AI ERROR:', err);
    res.status(500).json({
      answer: 'Bir hata oluştu, birazdan tekrar dene 🕷️',
    });
  }
});

module.exports = router;

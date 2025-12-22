const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * order = {
 *   order_id,
 *   order_date,
 *   total_amount,
 *   items: [{ name, quantity, unit_price }]
 * }
 */
function generateInvoice(order) {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `invoice-${order.order_id}.pdf`;
      const filePath = path.join(__dirname, "../../../invoices", fileName);

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text("PHD Collectibles", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text("Invoice");
      doc.moveDown();

      // Order info
      doc.fontSize(12).text(`Order ID: ${order.order_id}`);
      doc.text(`Date: ${new Date(order.order_date).toLocaleString()}`);
      doc.moveDown();

      // Items
      doc.fontSize(12).text("Items:");
      doc.moveDown();

      if (items && items.length > 0) {
      items.forEach((item) => {
        let y = doc.y;
      
      // Sayfa sonu kontrolü
        if (y > 700) { doc.addPage(); y = 50; }

        const productName = item.product_name || item.name || "Ürün";
        const unitPrice = Number(item.unit_price || 0).toFixed(2);
        const quantity = item.quantity || 1;

      // Hizalamalı Yazdırma
        doc.text(productName, itemX, y, { width: 280 });
        doc.text(`${unitPrice} TL`, priceX, y);
        doc.text(quantity.toString(), qtyX, y);

        doc.moveDown();
     });
    } else {
        doc.text("Bu siparişte ürün bulunamadı.", 50, doc.y);
    }

      doc.moveDown();
      doc.fontSize(14).text(`Total Amount: ${order.total_amount}`);

      doc.end();

      stream.on("finish", () => resolve({ filePath, fileName }));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInvoice };

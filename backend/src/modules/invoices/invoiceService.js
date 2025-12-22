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
const fontPath = path.join(__dirname, '..','..','..', 'fonts', 'Roboto-Regular.ttf');

function generateInvoice(order) {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `invoice-${order.order_id}.pdf`;
      const filePath = path.join(__dirname, "../../../invoices", fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      if (fs.existsSync(fontPath)) {
          doc.font(fontPath); // Artık Türkçe karakter basabilir!
      } else {
        console.warn("⚠️ UYARI: Font dosyası bulunamadı, Türkçe karakterler bozuk çıkabilir.");
        // Font yoksa varsayılan ile devam eder
      }

      // Header
      doc.fontSize(20).text('PhD Collectibles', { align: 'left', underline: true });
      doc.fontSize(10).text('Otomasyon Sistemi - Fatura', { align: 'left' });
      doc.moveDown();

      // Order info
      doc.fontSize(10).text(`Order ID: ${order.order_id}`, { align: 'right' });
      doc.text(`Date: ${new Date(order.order_date).toLocaleString()}`, { align: 'right' });
      doc.moveDown();
      doc.moveDown();
      
      doc.text(`Sayın Müşteri: ${order.customer_name}`, { align: "left" });
      doc.text(`İletişim: ${order.email}`, { align: "left" });
    
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      const tableTop = doc.y;
      const itemX = 50;
      const priceX = 350;
      const qtyX = 450;
    
      doc.text('Ürün Adı', itemX, tableTop);
      doc.text('Birim Fiyat', priceX, tableTop);
      doc.text('Adet', qtyX, tableTop);
      doc.moveDown();
      doc.moveDown();


      // Items
      

      order.items.forEach(item => {
        doc.text(
          `${item.name} | Qty: ${item.quantity} | Unit: ${item.unit_price} | Total: ${item.quantity * item.unit_price}`
        );
      });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
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
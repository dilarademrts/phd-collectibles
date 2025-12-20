const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'data', 'ornek_fatura.pdf');

// FONT YOLUNU BELİRLE
// (Dosya isminin indirdiğinle aynı olduğundan emin ol!)
const fontPath = path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'); 

function createDemoInvoice() {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // --- KRİTİK AYAR: FONTU YÜKLE ---
    // Eğer font dosyasını bulamazsa hata vermemesi için kontrol edelim
    if (fs.existsSync(fontPath)) {
        doc.font(fontPath); // Artık Türkçe karakter basabilir!
    } else {
        console.warn("⚠️ UYARI: Font dosyası bulunamadı, Türkçe karakterler bozuk çıkabilir.");
        // Font yoksa varsayılan ile devam eder
    }
    // --------------------------------

    // 1. HEADER (Logo ve Başlık)
    doc.fontSize(20).text('PhD Collectibles', { align: 'left', underline: true });
    doc.fontSize(10).text('Otomasyon Sistemi - Demo Çıktısı', { align: 'left' });
    doc.moveDown();

    // 2. FATURA DETAYLARI
    doc.fontSize(10).text('TARİH: 15.12.2025', { align: 'right' });
    doc.text('FATURA NO: #DEMO-001', { align: 'right' });
    doc.moveDown();

    // 3. MÜŞTERİ BİLGİSİ (Türkçe karakterleri test edelim)
    doc.text('Sayın Müşteri: Ahmet Yılmaz', { align: 'left' }); // 'ı' harfi
    doc.text('Adres: Mühendislik Fakültesi, Gümüşsuyu Kampüsü', { align: 'left' }); // 'ü', 'ş' harfleri
    
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // 4. TABLO BAŞLIKLARI (Bold yapmak için normalde Roboto-Bold.ttf gerekir ama şimdilik düz yapalım)
    const tableTop = doc.y;
    const itemX = 50;
    const priceX = 350;
    const qtyX = 450;
    
    doc.text('Ürün Adı', itemX, tableTop);
    doc.text('Birim Fiyat', priceX, tableTop);
    doc.text('Adet', qtyX, tableTop);
    doc.moveDown();

    // 5. DEMO ÜRÜNLER
    const items = [
        { name: "Batman The Dark Knight - 1/6 Scale", price: "4500 TL", qty: "1" },
        { name: "Joker - Heath Ledger Edition", price: "4200 TL", qty: "1" },
        { name: "Gümüş Sörfçü (Silver Surfer)", price: "5000 TL", qty: "1" } // Türkçe test ürünü
    ];

    items.forEach(item => {
        let y = doc.y;
        doc.text(item.name, itemX, y);
        doc.text(item.price, priceX, y);
        doc.text(item.qty, qtyX, y);
        doc.moveDown();
    });

    // Ayırıcı Çizgi
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // 6. TOPLAM
    doc.fontSize(14);
    doc.text('GENEL TOPLAM: 13.700 TL', { align: 'right' });

    doc.end();
    console.log(`✅ Demo fatura (Türkçe destekli) oluşturuldu: ${outputPath}`);
}

createDemoInvoice();
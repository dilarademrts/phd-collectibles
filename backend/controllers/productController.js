// backend/controllers/productController.js
const { getRecommendations } = require('../services/aiService');

// NOT: Veritabanı bağlantın varsa buraya import etmelisin.
// Şimdilik testi yapabilmen için veritabanını TAKLİT EDEN (Mock) basit bir yapı kurdum.
// Sen kendi DB kodlarını buraya entegre edersin.

exports.getProductDetail = async (req, res) => {
    try {
        const productName = req.params.name; // URL'den gelen isim (örn: Batman)
        
        console.log(`🔍 Kullanıcı şu ürünü istedi: ${productName}`);

        // --- 1. ADIM: Ürünü Veritabanında Bul (BURASI SENİN DB KODUN OLACAK) ---
        // Şimdilik sanki veritabanından bulmuşuz gibi sahte veri oluşturuyorum:
        const product = {
            id: 101,
            name: productName,
            description: "Bu harika bir koleksiyon ürünüdür.",
            price: 500
        };

        if (!product) {
            return res.status(404).json({ message: "Ürün bulunamadı" });
        }

        // --- 2. ADIM: AI Servisine Sor ---
        const recommendations = await getRecommendations(product.name);

        // --- 3. ADIM: Hepsini Birleştirip Yolla ---
        res.json({
            product: product,               // Ürünün kendi bilgisi
            ai_suggestions: recommendations // Yapay zekanın önerileri
        });

    } catch (error) {
        console.error("Sunucu Hatası:", error);
        res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
// backend/services/aiService.js

// Docker içinden diğer konteynera ulaşmak için servis ismini kullanıyoruz:
// docker-compose.yml'da servisin adı: 'ai_service'
// Port: 5002
const AI_SERVICE_URL = 'http://ai_service:5002/recommend';

async function getRecommendations(productName) {
  try {
    console.log(`🤖 AI Servisine soruluyor: ${productName}`);

    const response = await fetch(AI_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_name: productName }),
    });

    if (!response.ok) {
      console.error(`AI Servis Hatası: ${response.statusText}`);
      return []; // Hata varsa boş liste dön, site çökmesin
    }

    const data = await response.json();
    return data.recommendations || [];

  } catch (error) {
    // Python servisi kapalıysa veya hata verirse buraya düşer
    console.error('❌ AI Servisine bağlanılamadı:', error.message);
    return []; // Kullanıcıya hata gösterme, sadece öneri gösterme
  }
}

module.exports = { getRecommendations };
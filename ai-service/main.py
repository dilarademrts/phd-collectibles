import json
import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

app = Flask(__name__)
CORS(app)

# --- 1. VERİYİ YÜKLEME ---
# Backend klasöründeki products.json dosyasını bulup okuyoruz
# Not: ai-service klasöründen bir üst klasöre çıkıp backend/data'ya gidiyoruz.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, '..', 'backend', 'data', 'products.json')

print(f"📂 Veri aranıyor: {JSON_PATH}")

try:
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    # JSON yapısı iç içe (Kategoriler -> Items). Bunu düzleştirip tek liste yapalım.
    products_list = []
    for category in raw_data:
        for item in category['items']:
            # AI'ın okuması için zengin bir metin oluşturuyoruz:
            # "Batman Action Figure Gotham Dark Knight" gibi bir cümle kuruyoruz.
            combined_text = f"{item['name']} {item['description']} {category['category']} {item.get('note', '')}"
            
            item['combined_text'] = combined_text
            products_list.append(item)

    df = pd.DataFrame(products_list)
    print(f"✅ {len(df)} adet ürün başarıyla yüklendi ve AI hafızasına alındı.")

except FileNotFoundError:
    print("❌ HATA: products.json bulunamadı! Lütfen önce backend klasöründe 'node seed.js' çalıştırın.")
    df = pd.DataFrame()

# --- 2. YAPAY ZEKA MODELİNİ EĞİTME (TF-IDF) ---
# Burası işin matematiği. Metinleri sayısal vektörlere çeviriyoruz.
if not df.empty:
    print("🧠 AI Modeli eğitiliyor (Matrix Matrix Çarpımı)...")
    tfidf = TfidfVectorizer(stop_words='english')
    
    # Tüm ürünlerin özetini matrise çevir
    tfidf_matrix = tfidf.fit_transform(df['combined_text'])
    
    # Benzerlik puanlarını hesapla (Cosine Similarity)
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
    print("🤖 Model Hazır! Tavsiye vermeye başlayabilirim.")
else:
    cosine_sim = None

# --- 3. ÖNERİ FONKSİYONU ---
def get_recommendations(product_name):
    if df.empty: return []

    # 1. Gelen ürün ismini veritabanında bul
    try:
        idx_list = df.index[df['name'] == product_name].tolist()
        if not idx_list:
            return ["Ürün veritabanında bulunamadı"]
        idx = idx_list[0]

        # 2. Bu ürüne en çok benzeyenlerin puanlarını al
        sim_scores = list(enumerate(cosine_sim[idx]))
        
        # 3. Puana göre sırala (En yüksek puan en üstte)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # 4. En iyi 3 ürünü seç (0. kendisi olduğu için 1'den başla)
        sim_scores = sim_scores[1:4]
        
        # 5. İsimlerini döndür
        product_indices = [i[0] for i in sim_scores]
        return df['name'].iloc[product_indices].tolist()
    
    except Exception as e:
        print(f"Analiz Hatası: {e}")
        return []

# --- 4. API ENDPOINT (Node.js Buraya İstek Atacak) ---
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    product_name = data.get('product_name')

    if not product_name:
        return jsonify({"error": "Ürün adı gelmedi"}), 400

    print(f"🔍 Analiz İsteği Geldi: {product_name}")
    recommendations = get_recommendations(product_name)

    return jsonify({
        "source": product_name,
        "recommendations": recommendations,
        "logic": "Content-Based Filtering (TF-IDF)"
    })

# --- 5. SUNUCUYU BAŞLAT ---
if __name__ == '__main__':
    # Node.js 3000'de çalışıyor, biz karışmasın diye 5001 yapıyoruz.
    app.run(port=5001, debug=True)
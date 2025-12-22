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
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Docker volume ile bağlanan dosya yolu
JSON_PATH = os.path.join(BASE_DIR, '..', 'backend', 'data', 'products.json')

print(f"📂 Veri aranıyor: {JSON_PATH}")

products_list = []

try:
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    # --- DÜZELTİLEN KISIM BAŞLANGIÇ ---
    # Senin JSON dosyan düz bir liste, kategori ayrımı yok.
    # Bu yüzden direkt liste üzerinde dönüyoruz.
    if isinstance(raw_data, list):
        print(f"ℹ️ Düz liste yapısı tespit edildi. Toplam {len(raw_data)} ürün var.")
        for item in raw_data:
            # name ve description alanlarını birleştirip AI'a öğretiyoruz
            name = item.get('name', '')
            desc = item.get('description', '')
            
            # None gelme ihtimaline karşı string kontrolü
            if name is None: name = ""
            if desc is None: desc = ""

            combined_text = f"{name} {desc}"
            item['combined_text'] = combined_text
            products_list.append(item)
    else:
        print("⚠️ Beklenmeyen JSON formatı! Veri bir liste değil.")
    # --- DÜZELTİLEN KISIM BİTİŞ ---

    df = pd.DataFrame(products_list)
    print(f"✅ {len(df)} adet ürün başarıyla yüklendi ve AI hafızasına alındı.")

except FileNotFoundError:
    print("❌ HATA: products.json bulunamadı! Yol veya dosya eksik.")
    df = pd.DataFrame()
except Exception as e:
    print(f"❌ BEKLENMEYEN HATA: {e}")
    df = pd.DataFrame()

# --- 2. YAPAY ZEKA MODELİNİ EĞİTME ---
cosine_sim = None
if not df.empty:
    try:
        print("🧠 AI Modeli eğitiliyor (TF-IDF)...")
        tfidf = TfidfVectorizer(stop_words='english')
        # combined_text boş olanları temizle
        df['combined_text'] = df['combined_text'].fillna('')
        
        tfidf_matrix = tfidf.fit_transform(df['combined_text'])
        cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
        print("🤖 Model Hazır! Tavsiye vermeye başlayabilirim.")
    except Exception as e:
        print(f"Model eğitilirken hata oluştu: {e}")

# --- 3. ÖNERİ FONKSİYONU ---
def get_recommendations(product_name):
    if df.empty or cosine_sim is None: return []

    try:
        # Ürün ismini tam eşleşme veya içerme ile bul
        # (Büyük küçük harf duyarlılığını kaldırdık)
        df['name_lower'] = df['name'].str.lower()
        search_name = product_name.lower()
        
        idx_list = df.index[df['name_lower'] == search_name].tolist()
        
        # Tam eşleşme yoksa, içinde geçenlere bak (örn: "Batman" aratınca "Batman #128" bulsun)
        if not idx_list:
            idx_list = df.index[df['name_lower'].str.contains(search_name, na=False)].tolist()

        if not idx_list:
            return ["Ürün veritabanında bulunamadı"]
        
        idx = idx_list[0] # İlk eşleşeni al

        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:4] # Kendisi hariç en iyi 3
        
        product_indices = [i[0] for i in sim_scores]
        return df['name'].iloc[product_indices].tolist()
    
    except Exception as e:
        print(f"Analiz Hatası: {e}")
        return []

# --- 4. API ENDPOINT ---
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
    # PORT 5002 - Host 0.0.0.0 (Dışarıya açık)
    app.run(host='0.0.0.0', port=5002, debug=True)
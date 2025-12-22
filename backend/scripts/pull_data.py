import requests
import re
import time
import random
import json
import os
from bs4 import BeautifulSoup

# --- AYARLAR ---
hedef_sitemap = "https://www.phdcollectibles.com/xml/sitemap_product_1.xml"
LIMIT = 1000  # Kaç ürün çekilsin? (İsteğine göre artırabilirsin)

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def fiyat_temizle(fiyat_text):
    """ '2.225,30 TL' -> 2225.30 (float) çevirir. """
    if not fiyat_text: return 0.0
    temiz = fiyat_text.replace("TL", "").replace(" ", "").strip()
    try:
        temiz = temiz.replace(".", "").replace(",", ".")
        return float(temiz)
    except:
        return 0.0

print(f"📡 Bağlanılıyor: {hedef_sitemap}")

try:
    # 1. Linkleri Topla
    response = requests.get(hedef_sitemap, headers=headers)
    bulunan_linkler = re.findall(r'<loc>(.*?)</loc>', response.text)
    urun_linkleri = [link for link in bulunan_linkler if "/urun/" in link]
    
    print(f"✅ Toplam {len(urun_linkleri)} ürün bulundu. İlk {LIMIT} tanesi işleniyor...")

    veriler = []
    
    for index, url in enumerate(urun_linkleri[:LIMIT], 1): 
        
        try:
            r_urun = requests.get(url, headers=headers)
            s_urun = BeautifulSoup(r_urun.content, "html.parser")
            
            # --- A) İSİM ---
            h1 = s_urun.find("h1", id="productName") or s_urun.find("div", class_="product-title")
            ad = h1.text.strip().replace("- PhD Collectibles", "") if h1 else "İsimsiz Ürün"
            
            # --- B) FİYAT ---
            fiyat_text = "0"
            el_fiyat = s_urun.select_one(".product-right .product-price") or \
                       s_urun.select_one(".product-detail .current-price") or \
                       s_urun.find("div", class_="showcase-price-new")
            
            if el_fiyat:
                fiyat_text = el_fiyat.text.strip()
            
            price_number = fiyat_temizle(fiyat_text)
            
            # --- C) STOK MANTIĞI ---
            if price_number == 0:
                stok_durumu = 0  # Fiyat yoksa TÜKENDİ
                durum_mesaji = "🔴 TÜKENDİ"
            else:
                stok_durumu = random.randint(5, 50) # Fiyat varsa STOK VAR
                durum_mesaji = f"🟢 {price_number} TL"

            # --- D) GÖRSEL ---
            resim_url = ""
            meta_image = s_urun.find("meta", property="og:image")
            if meta_image:
                resim_url = meta_image["content"]
            else:
                img_tag = s_urun.select_one(".product-image img") or s_urun.find("img", id="imgUrun")
                if img_tag:
                    resim_url = img_tag.get("src") or img_tag.get("data-src") or ""
                if resim_url and not resim_url.startswith("http"):
                    resim_url = "https://www.phdcollectibles.com" + resim_url

            # --- E) VERİ PAKETİ (ANAHTAR İSİMLERİ ÖNEMLİ) ---
            # Eğer eski products.json dosyanızda farklı isimler varsa (örn: 'name' yerine 'title')
            # aşağıdaki kısımları ona göre değiştirmelisin.
            urun_objesi = {
                "id": index,
                "name": ad,                 # Ürün Adı
                "price": price_number,      # Sayısal Fiyat
                "price_formatted": fiyat_text, # "2.000 TL" formatı
                "image": resim_url,         # Görsel Linki
                "url": url,                 # Ürün Linki
                "stock": stok_durumu,       # Stok Sayısı
                "description": f"{ad} koleksiyon ürünü."
            }
            
            print(f"[{index}] {durum_mesaji} | {ad[:40]}...")
            veriler.append(urun_objesi)
            
        except Exception as e:
            print(f"[{index}] ❌ Hata: {url} - {e}")
            
        time.sleep(0.3)

    # --- KAYDETME (BURASI GÜNCELLENDİ) ---
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Hedef: backend/data/products.json
    dosya_yolu = os.path.join(current_dir, "..", "data", "products.json")
    
    # Klasör yoksa oluştur
    os.makedirs(os.path.dirname(dosya_yolu), exist_ok=True)

    with open(dosya_yolu, "w", encoding="utf-8") as f:
        json.dump(veriler, f, ensure_ascii=False, indent=4)
        
    print(f"\n✨ İŞLEM TAMAM! Veriler şuraya yazıldı:")
    print(f"📂 {dosya_yolu}")

except Exception as e:
    print(f"Genel Hata: {e}")
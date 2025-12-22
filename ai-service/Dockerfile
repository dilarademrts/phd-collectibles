# Python 3.9 kullan
FROM python:3.9-slim

# Çalışma dizini /app olsun
WORKDIR /app

# Gereksinimleri kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kodları kopyala
COPY . .

# Konteyner çalışınca bu komutu çalıştır
CMD ["python", "main.py"]
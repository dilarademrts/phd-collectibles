const db = require('./src/db');

const check = async () => {
    try {
        console.log('📡 Veritabanına bağlanılıyor...');

        // 1. TÜM ÜRÜNLERİ ÇEK (LIMIT yok)
        const products = await db.query('SELECT id, name, stock_quantity, price FROM product');
        console.log(`\n📦 TÜM ÜRÜNLER LİSTESİ (${products.rowCount} Adet):`);
        console.table(products.rows); 

        // 2. TÜM SİPARİŞLERİ ÇEK (LIMIT yok)
        const orders = await db.query('SELECT id, customer_name, total_amount, status FROM orders');
        console.log(`\n💰 TÜM SİPARİŞLER LİSTESİ (${orders.rowCount} Adet):`);
        console.table(orders.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",       // DB kullanıcı adınız
  host: "localhost",      // DB host
  database: "phd_collectibles", // projenin DB adı
  password: "şifreniz",   // DB şifresi
  port: 5432,
});

export default pool;

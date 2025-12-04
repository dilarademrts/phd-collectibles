CREATE TABLE "User" (
  user_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Product" (
  product_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  stock_quantity INT NOT NULL,
  category_id UUID REFERENCES "Category"(category_id)
);

-- LiveSale, LiveClaim, Cart, Order, OrderItem vs. için de benzer şekilde


CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- USER

CREATE TABLE users (
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(50) DEFAULT 'customer',
    created_at    TIMESTAMP DEFAULT NOW()
);


-- CATEGORY
CREATE TABLE category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE
);


-- PRODUCT

CREATE TABLE product (
    product_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(200) NOT NULL,
    description    TEXT,
    price          FLOAT NOT NULL,
    stock_quantity INT DEFAULT 0,
    category_id    UUID REFERENCES category(category_id) ON DELETE SET NULL
);


-- CART

CREATE TABLE cart (
    cart_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);


-- CART ITEM

CREATE TABLE cart_item (
    cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id      UUID NOT NULL REFERENCES cart(cart_id) ON DELETE CASCADE,
    product_id   UUID NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    quantity     INT NOT NULL CHECK (quantity > 0)
);

-- to ensure that every item has only one row with changeable quanttiy
CREATE UNIQUE INDEX uniq_cart_product ON cart_item(cart_id, product_id);


-- ORDER

CREATE TABLE orders (
    order_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status       VARCHAR(50) NOT NULL,   -- pending / paid / shipped / cancelled
    total_amount FLOAT NOT NULL,
    order_date   TIMESTAMP DEFAULT NOW()
);


-- ORDER ITEM

CREATE TABLE order_item (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id    UUID NOT NULL REFERENCES product(product_id),
    quantity      INT NOT NULL CHECK (quantity > 0),
    unit_price    FLOAT NOT NULL
);


-- PREORDER 

CREATE TABLE preorder (
    preorder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(user_id),
    product_id  UUID NOT NULL REFERENCES product(product_id),
    quantity    INT NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'pending'
);


-- LIVE SALE

CREATE TABLE live_sale (
    live_sale_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID REFERENCES product(product_id) ON DELETE CASCADE,
    stream_platform  VARCHAR(100),   -- Instagram, YouTube, TikTok
    stream_id        VARCHAR(150),
    start_time       TIMESTAMP,
    end_time         TIMESTAMP
);


-- LIVE CLAIM

CREATE TABLE live_claim (
    live_claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_sale_id  UUID NOT NULL REFERENCES live_sale(live_sale_id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message_text  TEXT NOT NULL,
    message_time  TIMESTAMP DEFAULT NOW(),
    is_winner     BOOLEAN DEFAULT FALSE
);

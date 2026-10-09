CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Table
CREATE TABLE products (
    sku TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    machine_model TEXT NOT NULL,
    category TEXT NOT NULL
);

-- 2. Inventory Table
CREATE TABLE inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sku TEXT NOT NULL,
    location TEXT NOT NULL,
    stock_qty INTEGER NOT NULL
);

-- 3. Sales Table
CREATE TABLE sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    sku TEXT NOT NULL,
    location TEXT NOT NULL,
    qty_sold INTEGER NOT NULL
);

-- 4. Suppliers Table
CREATE TABLE suppliers (
    supplier_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price NUMERIC NOT NULL,
    lead_time_days INTEGER NOT NULL,
    moq INTEGER NOT NULL,
    PRIMARY KEY (supplier_id, sku)
);

-- 5. Purchase Orders Table
CREATE TABLE purchase_orders (
    po_id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    qty INTEGER NOT NULL,
    expected_date DATE NOT NULL,
    status TEXT NOT NULL
);

-- 6. Messages Table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    message_text TEXT NOT NULL
);

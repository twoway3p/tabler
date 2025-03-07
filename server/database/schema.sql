-- Create Users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    avatar_url NVARCHAR(255),
    is_active BIT DEFAULT 1,
    role NVARCHAR(50) DEFAULT 'user',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Create Products table
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    description NTEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    category NVARCHAR(100),
    image_url NVARCHAR(255),
    is_featured BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Create Orders table
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    order_date DATETIME DEFAULT GETDATE(),
    total_amount DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending',
    shipping_address NVARCHAR(255),
    billing_address NVARCHAR(255),
    payment_method NVARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Order Items table
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES 
('admin', 'admin@example.com', 'hashed_password_here', 'Admin', 'User', 'admin'),
('user1', 'user1@example.com', 'hashed_password_here', 'John', 'Doe', 'user'),
('user2', 'user2@example.com', 'hashed_password_here', 'Jane', 'Smith', 'user');

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, category, is_featured)
VALUES 
('Laptop XYZ', 'High-performance laptop with 16GB RAM', 1299.99, 25, 'Electronics', 1),
('Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 49.99, 100, 'Accessories', 0),
('Smart Watch', 'Fitness tracker with heart rate monitor', 199.99, 50, 'Wearables', 1); 
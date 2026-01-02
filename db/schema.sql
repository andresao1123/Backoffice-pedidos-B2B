CREATE DATABASE IF NOT EXISTS orders_db;

use orders_db;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'operator') DEFAULT 'operator',
  created_at DATETIME default NOW()
);

CREATE TABLE IF NOT EXISTS customers(
	id int not null primary key auto_increment,
    `name` varchar(100) not null,
    email varchar(100) unique not null,
    phone varchar(100) not null,
    deleted_at DATETIME null
);

CREATE TABLE IF NOT EXISTS products(
   id int not null primary key auto_increment,
   `name` varchar(100) not null,
   sku  varchar(12) unique not null,
   price_cents int not null,
   stock int not null
);

CREATE TABLE IF NOT EXISTS `orders`(
	id int primary key not null auto_increment,
    customer_id int not null,
    `status` ENUM('CREATED','CONFIRMED','CANCELED') NOT NULL,
    total_cents int not null,
    created_at DATETIME default NOW(),
    constraint fk_order_customers
		foreign key(customer_id)
        references customers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items(
	id int not null primary key auto_increment,
    order_id int not null,
    product_id int not null,
    qty int not null,
    unit_price_cents int not null,
    subtotal_cents int not null,
    constraint fk_order_items_orders foreign key(order_id) references orders(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    constraint fk_order_items_products foreign key(product_id) references products(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS idempotency_keys(
	ID int not null primary key auto_increment,
    `key` varchar(100) not null,
    target_type ENUM('order_create', 'order_confirm') not null,
    target_id int not null,
    `status` ENUM('PROCESSING','SUCCESS','FAILED') not null,
    response_body JSON not null,
    created_at DATETIME not null default NOW(),
    expires_at DATETIME not null,
    UNIQUE KEY uniq_idempotency (`key`, target_type)
);
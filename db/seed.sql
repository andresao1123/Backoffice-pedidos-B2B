use orders_db;

INSERT INTO customers (name, email, phone) VALUES
('ACME Corporation', 'compras@acme.com', '+593-2-2345678'),
('Tech Solutions S.A.', 'pedidos@techsolutions.com.ec', '+593-2-2456789'),
('Distribuidora del Pacífico', 'ventas@dispacifico.ec', '+593-4-2567890'),
('Comercial Andina Ltda.', 'admin@andina.com.ec', '+593-2-2678901'),
('Importadora Quito S.A.', 'importaciones@quito.ec', '+593-2-2789012'),
('Supermercados El Ahorro', 'compras@elahorro.ec', '+593-4-2890123'),
('Ferretería Industrial', 'pedidos@ferrind.com', '+593-7-2901234'),
('Tiendas La Económica', 'ordenes@laeconomica.ec', '+593-2-3012345');



INSERT INTO products (sku, name, price_cents, stock) VALUES
('ELEC-LAP-001', 'Laptop Dell Inspiron 15', 89990, 25),
('ELEC-MON-001', 'Monitor LG 24" Full HD', 25900, 40),
('ELEC-TEC-001', 'Teclado Mecánico Logitech', 12900, 60),
('ELEC-MOU-001', 'Mouse Inalámbrico HP', 3500, 100),
('ELEC-WEB-001', 'Webcam Logitech C920', 8900, 35),
('ELEC-AUD-001', 'Audífonos Bluetooth Sony', 15900, 50),
('ELEC-TAB-001', 'Tablet Samsung Galaxy Tab A8', 32900, 20),
('ELEC-IMP-001', 'Impresora Multifunción Epson', 28900, 15);


INSERT INTO products (sku, name, price_cents, stock) VALUES
('OFIC-SIL-001', 'Silla Ergonómica Oficina', 18900, 30),
('OFIC-ESC-001', 'Escritorio Ejecutivo 150x60cm', 35900, 12),
('OFIC-ARC-001', 'Archivador Metálico 4 Gavetas', 22900, 18),
('OFIC-PIZ-001', 'Pizarra Acrílica 120x80cm', 8900, 25),
('OFIC-LAM-001', 'Lámpara LED Escritorio', 4500, 45),
('OFIC-PAP-001', 'Papel Bond A4 (Resma 500 hojas)', 650, 200);


INSERT INTO products (sku, name, price_cents, stock) VALUES
('SUMI-BOL-001', 'Bolígrafos Azules (Caja 50 unidades)', 1200, 150),
('SUMI-CUA-001', 'Cuaderno Universitario 100 hojas', 350, 300),
('SUMI-CAR-001', 'Carpetas Manila Tamaño Oficio (Pack 25)', 890, 100),
('SUMI-GRA-001', 'Grapadora Industrial', 2500, 40),
('SUMI-TIJ-001', 'Tijeras Oficina Acero Inoxidable', 450, 80),
('SUMI-CIN-001', 'Cinta Adhesiva Transparente (Pack 6)', 680, 120);


INSERT INTO products (sku, name, price_cents, stock) VALUES
('LIMP-DES-001', 'Desinfectante Multiusos 5L', 1890, 60),
('LIMP-JAB-001', 'Jabón Líquido Antibacterial 4L', 1590, 75),
('LIMP-PAP-002', 'Papel Higiénico Institucional (Pack 24)', 2890, 40),
('LIMP-SER-001', 'Servilletas de Papel (Pack 500)', 890, 90),
('LIMP-BOL-002', 'Bolsas de Basura 55 Galones (Pack 50)', 2190, 55);


INSERT INTO products (sku, name, price_cents, stock) VALUES
('ELEC-CAM-001', 'Cámara Seguridad IP WiFi', 12900, 3),
('OFIC-CAL-001', 'Calculadora Científica Casio', 4500, 2),
('SUMI-MEM-001', 'USB Flash Drive 64GB', 1890, 1);


INSERT INTO products (sku, name, price_cents, stock) VALUES
('ELEC-PRO-001', 'Proyector BenQ Full HD', 89900, 0),
('OFIC-SOF-001', 'Sofá Ejecutivo 3 Puestos', 125900, 0);


INSERT INTO orders (customer_id, status, total_cents, created_at) VALUES
(1, 'CREATED', 116890, NOW() - INTERVAL 30 MINUTE);

INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(1, 1, 1, 89990, 89990),   -- Laptop Dell
(1, 3, 2, 12900, 25800),   -- Teclado x2
(1, 5, 1, 8900, 8900);     -- Webcam

INSERT INTO orders (customer_id, status, total_cents, created_at) VALUES
(2, 'CONFIRMED', 58700, NOW() - INTERVAL 5 MINUTE);

INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(2, 2, 2, 25900, 51800),   -- Monitor x2
(2, 4, 2, 3500, 7000);     -- Mouse x2

INSERT INTO orders (customer_id, status, total_cents, created_at) VALUES
(3, 'CONFIRMED', 107700, NOW() - INTERVAL 15 MINUTE);

INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(3, 9, 3, 18900, 56700),   -- Silla Ergonómica x3
(3, 13, 2, 4500, 9000),    -- Lámpara LED x2
(3, 7, 1, 32900, 32900),   -- Tablet
(3, 14, 14, 650, 9100);    -- Papel Bond x14

INSERT INTO orders (customer_id, status, total_cents, created_at) VALUES
(4, 'CANCELED', 35800, NOW() - INTERVAL 1 DAY);

INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(4, 10, 1, 35900, 35900);


INSERT INTO orders (customer_id, status, total_cents, created_at) VALUES
(6, 'CONFIRMED', 289450, NOW() - INTERVAL 2 HOUR);

INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(5, 14, 100, 650, 65000),    -- Papel Bond x100
(5, 15, 50, 1200, 60000),    -- Bolígrafos x50
(5, 16, 100, 350, 35000),    -- Cuadernos x100
(5, 22, 20, 1890, 37800),    -- Desinfectante x20
(5, 24, 50, 890, 44500),     -- Servilletas x50
(5, 25, 20, 2190, 43800),    -- Bolsas basura x20
(5, 12, 1, 8900, 8900);      -- Pizarra

INSERT INTO orders (customer_id, status, total_cents, created_at) VALUES
(5, 'CREATED', 7130, NOW() - INTERVAL 10 MINUTE);

INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(6, 18, 2, 450, 900),        -- Tijeras x2
(6, 17, 2, 2500, 5000),      -- Grapadora x2
(6, 16, 7, 350, 2450);       -- Cuadernos x7


INSERT INTO idempotency_keys (`key`, target_type, target_id, `status`, response_body, created_at, expires_at) VALUES
(
  'idem-key-order-2-confirm-001',
  'order_confirm',
  2,
  'SUCCESS',
  '{"id":2,"customer_id":2,"status":"CONFIRMED","total_cents":58700}',
  NOW() - INTERVAL 5 MINUTE,
  NOW() + INTERVAL 23 HOUR + INTERVAL 55 MINUTE
);

INSERT INTO idempotency_keys (`key`, target_type, target_id, `status`, response_body, created_at, expires_at) VALUES
(
  'idem-key-order-3-confirm-xyz',
  'order_confirm',
  3,
  'SUCCESS',
  '{"id":3,"customer_id":3,"status":"CONFIRMED","total_cents":107700}',
  NOW() - INTERVAL 15 MINUTE,
  NOW() + INTERVAL 23 HOUR + INTERVAL 45 MINUTE
);

INSERT INTO idempotency_keys (`key`, target_type, target_id, `status`, response_body, created_at, expires_at) VALUES
(
  'lambda-test-001',
  'order_confirm',
  5,
  'SUCCESS',
  '{"id":5,"customer_id":6,"status":"CONFIRMED","total_cents":289450}',
  NOW() - INTERVAL 2 HOUR,
  NOW() + INTERVAL 22 HOUR
);

INSERT INTO idempotency_keys (`key`, target_type, target_id, `status`, response_body, created_at, expires_at) VALUES
(
  'failed-key-example-001',
  'order_confirm',
  99,
  'FAILED',
  '{"error":"Orden no encontrada"}',
  NOW() - INTERVAL 1 HOUR,
  NOW() + INTERVAL 23 HOUR
);
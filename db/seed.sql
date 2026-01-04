use orders_db;

INSERT INTO customers (name, email, phone, created_at) VALUES
('ACME Corporation', 'compras@acme.com', '+593-2-2345678', DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('Tech Solutions S.A.', 'pedidos@techsolutions.com.ec', '+593-2-2456789', DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('Distribuidora del Pacífico', 'ventas@dispacifico.ec', '+593-4-2567890', DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('Comercial Andina Ltda.', 'admin@andina.com.ec', '+593-2-2678901', DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('Importadora Quito S.A.', 'importaciones@quito.ec', '+593-2-2789012', DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('Supermercados El Ahorro', 'compras@elahorro.ec', '+593-4-2890123', DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('Ferretería Industrial', 'pedidos@ferrind.com', '+593-7-2901234', DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('Tiendas La Económica', 'ordenes@laeconomica.ec', '+593-2-3012345', DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY));


INSERT INTO products (sku, name, price_cents, stock, created_at) VALUES
('ELEC-LAP-001', 'Laptop Dell Inspiron 15', 89990, 25, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('ELEC-MON-001', 'Monitor LG 24" Full HD', 25900, 40, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('ELEC-TEC-001', 'Teclado Mecánico Logitech', 12900, 60, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('ELEC-MOU-001', 'Mouse Inalámbrico HP', 3500, 100, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('ELEC-WEB-001', 'Webcam Logitech C920', 8900, 35, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('ELEC-AUD-001', 'Audífonos Bluetooth Sony', 15900, 50, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('ELEC-TAB-001', 'Tablet Samsung Galaxy Tab A8', 32900, 20, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('ELEC-IMP-001', 'Impresora Multifunción Epson', 28900, 15, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY));


INSERT INTO products (sku, name, price_cents, stock, created_at) VALUES
('OFIC-SIL-001', 'Silla Ergonómica Oficina', 18900, 30, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('OFIC-ESC-001', 'Escritorio Ejecutivo 150x60cm', 35900, 12, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('OFIC-ARC-001', 'Archivador Metálico 4 Gavetas', 22900, 18, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('OFIC-PIZ-001', 'Pizarra Acrílica 120x80cm', 8900, 25, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('OFIC-LAM-001', 'Lámpara LED Escritorio', 4500, 45, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('OFIC-PAP-001', 'Papel Bond A4 (Resma 500 hojas)', 650, 200, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY));

INSERT INTO products (sku, name, price_cents, stock, created_at) VALUES
('SUMI-BOL-001', 'Bolígrafos Azules (Caja 50 unidades)', 1200, 150, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('SUMI-CUA-001', 'Cuaderno Universitario 100 hojas', 350, 300, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('SUMI-CAR-001', 'Carpetas Manila Tamaño Oficio (Pack 25)', 890, 100, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('SUMI-GRA-001', 'Grapadora Industrial', 2500, 40, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('SUMI-TIJ-001', 'Tijeras Oficina Acero Inoxidable', 450, 80, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('SUMI-CIN-001', 'Cinta Adhesiva Transparente (Pack 6)', 680, 120, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY));

INSERT INTO products (sku, name, price_cents, stock, created_at) VALUES
('LIMP-DES-001', 'Desinfectante Multiusos 5L', 1890, 60, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('LIMP-JAB-001', 'Jabón Líquido Antibacterial 4L', 1590, 75, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('LIMP-PAP-002', 'Papel Higiénico Institucional (Pack 24)', 2890, 40, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('LIMP-SER-001', 'Servilletas de Papel (Pack 500)', 890, 90, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('LIMP-BOL-002', 'Bolsas de Basura 55 Galones (Pack 50)', 2190, 55, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY));

INSERT INTO products (sku, name, price_cents, stock, created_at) VALUES
('ELEC-CAM-001', 'Cámara Seguridad IP WiFi', 12900, 3, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('OFIC-CAL-001', 'Calculadora Científica Casio', 4500, 2, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('SUMI-MEM-001', 'USB Flash Drive 64GB', 1890, 1, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY));


INSERT INTO products (sku, name, price_cents, stock, created_at) VALUES
('ELEC-PRO-001', 'Proyector BenQ Full HD', 89900, 0, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY)),
('OFIC-SOF-001', 'Sofá Ejecutivo 3 Puestos', 125900, 0, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY));


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
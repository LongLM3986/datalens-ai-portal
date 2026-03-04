-- ================================================================
-- Sample Data for DWH - Dữ liệu mẫu thực tế (tiếng Việt)
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- PRODUCTS
-- ────────────────────────────────────────────────────────────────
INSERT INTO products (code, name, category, price, cost, stock_qty, unit, supplier) VALUES
  ('SP001','Laptop Dell Inspiron 15','Máy tính',18500000,14000000,120,'cái','Dell Vietnam'),
  ('SP002','Laptop Asus VivoBook 14','Máy tính',14900000,11000000,85,'cái','Asus Vietnam'),
  ('SP003','Màn hình Samsung 24" FHD','Thiết bị',3800000,2800000,200,'cái','Samsung'),
  ('SP004','Chuột Logitech MX Master','Phụ kiện',1200000,800000,350,'cái','Logitech'),
  ('SP005','Bàn phím cơ Leopold FC750R','Phụ kiện',2500000,1800000,180,'cái','Leopold'),
  ('SP006','Tai nghe Sony WH-1000XM5','Âm thanh',8900000,6500000,95,'cái','Sony Vietnam'),
  ('SP007','Máy in HP LaserJet Pro','Văn phòng',4200000,3100000,60,'cái','HP Vietnam'),
  ('SP008','Điện thoại Samsung S24','Di động',22000000,17000000,200,'cái','Samsung'),
  ('SP009','iPad Air 5 256GB','Tablet',19500000,15000000,75,'cái','Apple Vietnam'),
  ('SP010','Ổ cứng SSD WD 1TB','Lưu trữ',1800000,1200000,420,'cái','Western Digital'),
  ('SP011','Router WiFi 6 Asus','Mạng',1650000,1100000,160,'cái','Asus'),
  ('SP012','Webcam Logitech C920','Phụ kiện',1100000,750000,240,'cái','Logitech'),
  ('SP013','Loa JBL Charge 5','Âm thanh',3500000,2500000,130,'cái','JBL'),
  ('SP014','Bộ sạc đa năng Anker','Phụ kiện',450000,280000,600,'cái','Anker'),
  ('SP015','Máy chiếu Epson EB-X49','Văn phòng',12000000,9000000,30,'cái','Epson')
ON CONFLICT (code) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ────────────────────────────────────────────────────────────────
INSERT INTO customers (name, email, phone, city, segment, created_at, status) VALUES
  ('Công ty TNHH TechViet','contact@techviet.vn','028-3812-4567','Hồ Chí Minh','Enterprise','2023-01-15','active'),
  ('Tập đoàn FPT Software','procurement@fpt.vn','024-7300-7300','Hà Nội','Enterprise','2023-02-01','active'),
  ('Công ty CP Vingroup','supply@vingroup.vn','024-3974-9999','Hà Nội','Enterprise','2023-01-20','active'),
  ('CTCP Masan Consumer','masan@masan.com.vn','028-3838-7777','Hồ Chí Minh','Enterprise','2023-03-10','active'),
  ('Trường ĐH Bách Khoa HN','cntt@hust.edu.vn','024-3868-0101','Hà Nội','SME','2023-02-15','active'),
  ('Bệnh viện Chợ Rẫy','it@choray.vn','028-3855-4137','Hồ Chí Minh','SME','2023-04-01','active'),
  ('Siêu thị Big C Việt Nam','it@bigc.vn','028-3812-0111','Hồ Chí Minh','Enterprise','2023-01-05','active'),
  ('CTCP Hòa Phát Group','cntt@hoaphat.com.vn','024-3974-1234','Hà Nội','Enterprise','2023-05-20','active'),
  ('Công ty TNHH Samsung Vina','procurement@samsung.vn','0222-3789-000','Bắc Ninh','Enterprise','2023-06-01','active'),
  ('Ngân hàng ACB','it@acb.com.vn','028-3929-0999','Hồ Chí Minh','Enterprise','2023-02-20','active'),
  ('Trung tâm Anh ngữ RMIT','admin@rmit.edu.vn','028-3776-1234','Hồ Chí Minh','SME','2023-07-15','active'),
  ('Công ty ABC Media','contact@abcmedia.vn','024-3556-7890','Hà Nội','SME','2023-08-01','active'),
  ('CTCP Dược Hậu Giang','dhg@dhgpharma.vn','0292-3891-433','Cần Thơ','SME','2023-09-10','active'),
  ('Công ty In Đệ Nhất','admin@denhatprint.vn','028-3756-1234','Hồ Chí Minh','Retail','2023-10-05','active'),
  ('Ông Nguyễn Minh Tuấn','nmt@gmail.com','0912-345-678','Đà Nẵng','Retail','2023-11-12','active'),
  ('Bà Trần Thị Lan','ttl@yahoo.com','0908-456-789','Hồ Chí Minh','Retail','2023-12-01','active'),
  ('CTCP FPT Retail','fptshop@fptretail.vn','1800-6601',  'Hà Nội','Enterprise','2024-01-10','active'),
  ('Công ty Thế Giới Di Động','tgdd@mwg.vn','1800-1789','Hồ Chí Minh','Enterprise','2024-01-20','active'),
  ('Công ty TNHH Grab Vietnam','tech@grab.vn','028-6288-5000','Hồ Chí Minh','Enterprise','2024-02-05','active'),
  ('CTCP Phát Đạt','info@phatdat.vn','0292-3812-345','Cần Thơ','SME','2024-02-28','active')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- ORDERS (100 đơn hàng)
-- ────────────────────────────────────────────────────────────────
INSERT INTO orders (order_code, customer_id, order_date, total_amount, discount, tax, status, payment_method, shipping_city)
SELECT
  'ORD-2024-' || LPAD(gs::text,4,'0'),
  (gs % 20) + 1,
  CURRENT_DATE - (gs * 3)::integer,
  (RANDOM() * 50000000 + 5000000)::NUMERIC(15,2),
  (RANDOM() * 1000000)::NUMERIC(15,2),
  (RANDOM() * 500000 + 200000)::NUMERIC(15,2),
  CASE (gs % 5)
    WHEN 0 THEN 'delivered'
    WHEN 1 THEN 'shipped'
    WHEN 2 THEN 'confirmed'
    WHEN 3 THEN 'pending'
    ELSE 'delivered'
  END,
  CASE (gs % 3) WHEN 0 THEN 'bank_transfer' WHEN 1 THEN 'cash' ELSE 'card' END,
  CASE (gs % 5)
    WHEN 0 THEN 'Hồ Chí Minh'
    WHEN 1 THEN 'Hà Nội'
    WHEN 2 THEN 'Đà Nẵng'
    WHEN 3 THEN 'Cần Thơ'
    ELSE 'Bình Dương'
  END
FROM generate_series(1, 100) gs
ON CONFLICT (order_code) DO NOTHING;

-- ORDER ITEMS
INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount_pct)
SELECT
  o.id,
  (RANDOM() * 14 + 1)::integer,
  (RANDOM() * 5 + 1)::integer,
  p.price,
  CASE WHEN RANDOM() > 0.7 THEN (RANDOM() * 10)::NUMERIC(5,2) ELSE 0 END
FROM orders o
JOIN products p ON p.id = (RANDOM() * 14 + 1)::integer
WHERE o.id <= 100;

-- ────────────────────────────────────────────────────────────────
-- LEADS & OPPORTUNITIES
-- ────────────────────────────────────────────────────────────────
INSERT INTO leads (name, email, company, source, stage, score, created_at) VALUES
  ('Lê Văn Hùng','lvh@techcorp.vn','TechCorp VN','website','qualified',82,'2024-01-10'),
  ('Phạm Thị Hoa','pth@startup.io','StartupIO','referral','contacted',65,'2024-01-15'),
  ('Nguyễn Văn Đức','nvd@bigco.vn','BigCo Vietnam','ads','new',40,'2024-02-01'),
  ('Trần Minh Phúc','tmp@school.edu.vn','Trường ABC','cold_call','lost',25,'2024-02-10'),
  ('Hoàng Thị Mai','htm@hospital.vn','BV Đa Khoa','event','qualified',78,'2024-02-20'),
  ('Đặng Quốc Việt','dqv@factory.vn','Nhà máy XYZ','website','contacted',55,'2024-03-01'),
  ('Bùi Thị Trang','btt@retail.vn','Retail Chain','ads','new',35,'2024-03-10'),
  ('Vũ Minh Khoa','vmk@fintech.vn','FinTech Co','referral','qualified',90,'2024-03-15')
ON CONFLICT DO NOTHING;

INSERT INTO opportunities (title, customer_id, amount, stage, probability, close_date, owner) VALUES
  ('Nâng cấp hạ tầng IT Q1/2024',1,450000000,'proposal',60,'2024-04-30','Nguyễn Văn A'),
  ('Cung cấp laptop cho phòng R&D',2,280000000,'negotiation',80,'2024-03-31','Trần Thị B'),
  ('Triển khai hệ thống in văn phòng',3,95000000,'prospecting',20,'2024-06-30','Lê Văn C'),
  ('Mua thiết bị phòng hội nghị',4,180000000,'proposal',50,'2024-05-15','Phạm Minh D'),
  ('Cung cấp máy tính bảng cho SV',5,340000000,'closed_won',100,'2024-02-28','Hoàng Thị E'),
  ('Thiết bị y tế IT',6,520000000,'negotiation',75,'2024-04-15','Đặng Quốc F'),
  ('Hệ thống POS siêu thị',7,760000000,'proposal',45,'2024-07-31','Bùi Văn G'),
  ('Máy chủ & lưu trữ',8,1200000000,'prospecting',15,'2024-09-30','Vũ Thị H')
ON CONFLICT DO NOTHING;

-- CAMPAIGNS
INSERT INTO campaigns (name, channel, budget, actual_spend, leads_generated, conversions, start_date, end_date, status) VALUES
  ('Q1 2024 Digital Marketing','social',50000000,42000000,320,28,'2024-01-01','2024-03-31','completed'),
  ('Tết Giáp Thìn Campaign','social',80000000,75000000,580,62,'2024-01-15','2024-02-29','completed'),
  ('Email Nurturing Q2','email',15000000,12000000,180,22,'2024-04-01','2024-06-30','active'),
  ('Google Ads Laptop','ads',30000000,28000000,240,35,'2024-03-01','2024-05-31','active'),
  ('Hội thảo IT Summit 2024','event',120000000,95000000,450,48,'2024-04-20','2024-04-21','completed')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- FINANCE
-- ────────────────────────────────────────────────────────────────
INSERT INTO gl_accounts (code, name, type, normal_balance) VALUES
  ('111','Tiền mặt','asset','debit'),
  ('112','Tiền gửi ngân hàng','asset','debit'),
  ('131','Phải thu khách hàng','asset','debit'),
  ('156','Hàng hóa','asset','debit'),
  ('211','TSCĐ hữu hình','asset','debit'),
  ('331','Phải trả nhà cung cấp','liability','credit'),
  ('333','Thuế TNDN phải nộp','liability','credit'),
  ('411','Vốn đầu tư của chủ sở hữu','equity','credit'),
  ('421','Lợi nhuận sau thuế','equity','credit'),
  ('511','Doanh thu bán hàng','revenue','credit'),
  ('515','Doanh thu tài chính','revenue','credit'),
  ('632','Giá vốn hàng bán','expense','debit'),
  ('641','Chi phí bán hàng','expense','debit'),
  ('642','Chi phí QLDN','expense','debit'),
  ('811','Chi phí khác','expense','debit')
ON CONFLICT (code) DO NOTHING;

-- GL Transactions (50 giao dịch mẫu)
INSERT INTO gl_transactions (account_id, trans_date, debit, credit, description, reference, journal_type)
SELECT
  (CASE (gs % 15)
    WHEN 0 THEN 1 WHEN 1 THEN 2 WHEN 2 THEN 3 WHEN 3 THEN 10
    WHEN 4 THEN 12 WHEN 5 THEN 13 WHEN 6 THEN 14 WHEN 7 THEN 6
    WHEN 8 THEN 9 WHEN 9 THEN 4 WHEN 10 THEN 5 WHEN 11 THEN 7
    WHEN 12 THEN 8 WHEN 13 THEN 11 ELSE 15
  END),
  CURRENT_DATE - (gs * 7)::integer,
  CASE WHEN gs % 2 = 0 THEN (RANDOM() * 100000000 + 5000000)::NUMERIC(15,2) ELSE 0 END,
  CASE WHEN gs % 2 = 1 THEN (RANDOM() * 100000000 + 5000000)::NUMERIC(15,2) ELSE 0 END,
  'Giao dịch mẫu #' || gs,
  'REF-2024-' || LPAD(gs::text,4,'0'),
  CASE (gs % 3) WHEN 0 THEN 'JE' WHEN 1 THEN 'AR' ELSE 'AP' END
FROM generate_series(1, 50) gs;

-- COST CENTERS
INSERT INTO cost_centers (code, name, manager, department) VALUES
  ('CC001','Phòng Kinh Doanh','Nguyễn Văn An','Sales'),
  ('CC002','Phòng Marketing','Trần Thị Bình','Marketing'),
  ('CC003','Phòng Kế Toán','Lê Văn Cường','Finance'),
  ('CC004','Phòng IT','Phạm Minh Đức','IT'),
  ('CC005','Phòng Nhân Sự','Hoàng Thị Em','HR')
ON CONFLICT (code) DO NOTHING;

-- BUDGETS
INSERT INTO budgets (account_id, fiscal_year, q1, q2, q3, q4)
SELECT
  a.id,
  2024,
  (RANDOM() * 500000000 + 100000000)::NUMERIC(15,2),
  (RANDOM() * 500000000 + 100000000)::NUMERIC(15,2),
  (RANDOM() * 500000000 + 100000000)::NUMERIC(15,2),
  (RANDOM() * 500000000 + 100000000)::NUMERIC(15,2)
FROM gl_accounts a
WHERE a.type IN ('revenue','expense')
ON CONFLICT DO NOTHING;

-- INVOICES (50 hóa đơn)
INSERT INTO invoices (invoice_code, customer_id, invoice_date, due_date, subtotal, tax_amount, total_amount, status, paid_amount)
SELECT
  'INV-2024-' || LPAD(gs::text,4,'0'),
  (gs % 20) + 1,
  CURRENT_DATE - (gs * 5)::integer,
  CURRENT_DATE - (gs * 5)::integer + 30,
  (RANDOM() * 80000000 + 5000000)::NUMERIC(15,2),
  (RANDOM() * 8000000 + 500000)::NUMERIC(15,2),
  (RANDOM() * 88000000 + 5500000)::NUMERIC(15,2),
  CASE (gs % 4) WHEN 0 THEN 'paid' WHEN 1 THEN 'overdue' WHEN 2 THEN 'sent' ELSE 'draft' END,
  CASE WHEN gs % 4 = 0 THEN (RANDOM() * 88000000 + 5500000)::NUMERIC(15,2) ELSE 0 END
FROM generate_series(1, 50) gs
ON CONFLICT (invoice_code) DO NOTHING;

-- PAYMENTS
INSERT INTO payments (invoice_id, payment_date, amount, method, reference)
SELECT
  i.id,
  i.invoice_date + 5,
  i.total_amount,
  CASE (i.id % 3) WHEN 0 THEN 'bank_transfer' WHEN 1 THEN 'cash' ELSE 'card' END,
  'PAY-' || i.invoice_code
FROM invoices i
WHERE i.status = 'paid'
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- HR
-- ────────────────────────────────────────────────────────────────
INSERT INTO departments (code, name, manager_name, cost_center) VALUES
  ('DEPT01','Ban Giám Đốc','Nguyễn Thành Long','CC001'),
  ('DEPT02','Phòng Kinh Doanh','Trần Văn Mạnh','CC001'),
  ('DEPT03','Phòng Marketing','Lê Thị Ngọc','CC002'),
  ('DEPT04','Phòng Kế Toán','Phạm Quốc Oai','CC003'),
  ('DEPT05','Phòng IT','Hoàng Văn Phúc','CC004'),
  ('DEPT06','Phòng Nhân Sự','Đặng Thị Quyên','CC005'),
  ('DEPT07','Phòng Kho Vận','Bùi Minh Rồng','CC001'),
  ('DEPT08','Phòng Sản Xuất','Vũ Thị Sương','CC001')
ON CONFLICT (code) DO NOTHING;

INSERT INTO positions (code, name, grade, min_salary, max_salary) VALUES
  ('POS01','Giám đốc điều hành','L6',80000000,150000000),
  ('POS02','Trưởng phòng','L5',25000000,45000000),
  ('POS03','Phó trưởng phòng','L4',20000000,35000000),
  ('POS04','Chuyên viên cao cấp','L3',15000000,25000000),
  ('POS05','Chuyên viên','L2',10000000,18000000),
  ('POS06','Nhân viên','L1',7000000,12000000),
  ('POS07','Thực tập sinh','L0',3000000,5000000)
ON CONFLICT (code) DO NOTHING;

INSERT INTO employees (emp_code, full_name, gender, date_of_birth, phone, email, department_id, position_id, hire_date, salary_base, status) VALUES
  ('EMP001','Nguyễn Thành Long','Nam','1975-05-15','0901-111-001','ntl@company.vn',1,1,'2015-01-01',120000000,'active'),
  ('EMP002','Trần Văn Mạnh','Nam','1982-08-20','0901-111-002','tvm@company.vn',2,2,'2016-03-01',32000000,'active'),
  ('EMP003','Lê Thị Ngọc','Nữ','1985-11-10','0901-111-003','ltn@company.vn',3,2,'2017-06-01',30000000,'active'),
  ('EMP004','Phạm Quốc Oai','Nam','1980-03-25','0901-111-004','pqo@company.vn',4,2,'2016-09-01',28000000,'active'),
  ('EMP005','Hoàng Văn Phúc','Nam','1988-07-14','0901-111-005','hvp@company.vn',5,2,'2018-01-01',35000000,'active'),
  ('EMP006','Đặng Thị Quyên','Nữ','1987-04-30','0901-111-006','dtq@company.vn',6,2,'2017-12-01',28000000,'active'),
  ('EMP007','Bùi Minh Rồng','Nam','1990-09-18','0901-111-007','bmr@company.vn',7,3,'2019-04-01',22000000,'active'),
  ('EMP008','Vũ Thị Sương','Nữ','1992-01-22','0901-111-008','vts@company.vn',8,3,'2020-07-01',20000000,'active'),
  ('EMP009','Nguyễn Văn Tâm','Nam','1991-06-05','0901-111-009','nvt@company.vn',2,4,'2019-08-01',17000000,'active'),
  ('EMP010','Trần Thị Uyên','Nữ','1993-12-15','0901-111-010','ttu@company.vn',3,4,'2020-02-01',16000000,'active'),
  ('EMP011','Lê Minh Việt','Nam','1994-03-28','0901-111-011','lmv@company.vn',5,5,'2021-01-01',14000000,'active'),
  ('EMP012','Phạm Thị Xuân','Nữ','1995-07-17','0901-111-012','ptx@company.vn',4,5,'2021-06-01',13000000,'active'),
  ('EMP013','Hoàng Quốc Yên','Nam','1996-11-08','0901-111-013','hqy@company.vn',2,6,'2022-03-01',9500000,'active'),
  ('EMP014','Đặng Thị Ánh','Nữ','1997-02-14','0901-111-014','dta@company.vn',6,6,'2022-07-01',9000000,'active'),
  ('EMP015','Bùi Văn Bình','Nam','1998-05-20','0901-111-015','bvb@company.vn',5,6,'2023-01-01',8500000,'active')
ON CONFLICT (emp_code) DO NOTHING;

-- SALARIES (last 3 months)
INSERT INTO salaries (employee_id, month, year, base, allowance, bonus, deduction)
SELECT
  e.id,
  m.month,
  2024,
  e.salary_base,
  e.salary_base * 0.1,
  CASE WHEN RANDOM() > 0.6 THEN e.salary_base * 0.2 ELSE 0 END,
  e.salary_base * 0.105   -- BHXH ~10.5%
FROM employees e
CROSS JOIN (VALUES (1),(2),(3)) AS m(month)
ON CONFLICT (employee_id, month, year) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- MANUFACTURING
-- ────────────────────────────────────────────────────────────────
INSERT INTO workcenters (code, name, capacity, unit, department) VALUES
  ('WC001','Dây chuyền lắp ráp A',480,'giờ/tháng','Sản Xuất'),
  ('WC002','Dây chuyền lắp ráp B',480,'giờ/tháng','Sản Xuất'),
  ('WC003','Khu vực kiểm tra chất lượng',240,'giờ/tháng','QA/QC'),
  ('WC004','Kho thành phẩm',720,'giờ/tháng','Kho Vận'),
  ('WC005','Xưởng đóng gói',360,'giờ/tháng','Sản Xuất')
ON CONFLICT (code) DO NOTHING;

INSERT INTO raw_materials (code, name, unit, stock_qty, min_stock, cost_per_unit, supplier) VALUES
  ('RM001','Vỏ nhựa laptop','cái',500,100,80000,'Nhựa Đông Nam Á'),
  ('RM002','Bo mạch chủ laptop','cái',200,50,2500000,'FOXCONN'),
  ('RM003','Pin laptop 6000mAh','cái',350,80,450000,'Samsung SDI'),
  ('RM004','Màn hình IPS 15.6"','cái',250,60,1800000,'BOE Display'),
  ('RM005','Bàn phím laptop 15"','cái',400,100,120000,'Chicony'),
  ('RM006','Thùng carton laptop','cái',1000,200,15000,'Bao Bì Việt'),
  ('RM007','Xốp bảo vệ','bộ',1500,300,8000,'Xốp Sài Gòn'),
  ('RM008','Cáp HDMI 2m','cái',600,150,35000,'Unitek VN')
ON CONFLICT (code) DO NOTHING;

-- BOM (Bill of Materials for laptop products)
INSERT INTO bom (product_id, material_id, qty_per_unit, unit)
SELECT p.id, rm.id,
  CASE rm.code
    WHEN 'RM001' THEN 1 WHEN 'RM002' THEN 1 WHEN 'RM003' THEN 1
    WHEN 'RM004' THEN 1 WHEN 'RM005' THEN 1 WHEN 'RM006' THEN 1
    WHEN 'RM007' THEN 1 ELSE 0
  END,
  'cái'
FROM products p
CROSS JOIN raw_materials rm
WHERE p.code IN ('SP001','SP002')
  AND rm.code IN ('RM001','RM002','RM003','RM004','RM005','RM006','RM007')
ON CONFLICT (product_id, material_id) DO NOTHING;

-- PRODUCTION ORDERS
INSERT INTO production_orders (po_code, product_id, qty_planned, qty_produced, start_date, end_date, actual_end_date, status, workcenter_id)
SELECT
  'PO-2024-' || LPAD(gs::text,3,'0'),
  CASE (gs % 2) WHEN 0 THEN 1 ELSE 2 END,
  (RANDOM() * 80 + 20)::NUMERIC(15,2),
  CASE WHEN gs % 3 != 2 THEN (RANDOM() * 80 + 15)::NUMERIC(15,2) ELSE 0 END,
  CURRENT_DATE - (gs * 15)::integer,
  CURRENT_DATE - (gs * 15)::integer + 14,
  CASE WHEN gs % 3 = 0 THEN CURRENT_DATE - (gs * 15)::integer + 13 ELSE NULL END,
  CASE (gs % 3) WHEN 0 THEN 'completed' WHEN 1 THEN 'in_progress' ELSE 'planned' END,
  (gs % 3) + 1
FROM generate_series(1, 20) gs
ON CONFLICT (po_code) DO NOTHING;

-- QUALITY CHECKS
INSERT INTO quality_checks (production_order_id, check_date, qty_checked, qty_pass, qty_fail, defect_type, result, inspector)
SELECT
  po.id,
  po.start_date + 10,
  po.qty_produced,
  (po.qty_produced * 0.95)::NUMERIC(15,2),
  (po.qty_produced * 0.05)::NUMERIC(15,2),
  CASE (po.id % 3) WHEN 0 THEN 'Nứt vỏ' WHEN 1 THEN 'Lỗi màn hình' ELSE 'Pin yếu' END,
  'conditional',
  'KTV-0' || (po.id % 3 + 1)::text
FROM production_orders po
WHERE po.status = 'completed'
ON CONFLICT DO NOTHING;

-- ================================================================
-- DWH Tables - DataLens Enterprise Portal
-- Domains: CRM, Finance, HR, Manufacturing
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- DOMAIN: CRM - Kinh doanh & Marketing
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  email        VARCHAR(150),
  phone        VARCHAR(20),
  city         VARCHAR(100),
  segment      VARCHAR(50)  DEFAULT 'SME',     -- Enterprise, SME, Retail
  created_at   DATE         NOT NULL DEFAULT CURRENT_DATE,
  status       VARCHAR(20)  DEFAULT 'active'   -- active, inactive, churned
);

CREATE TABLE IF NOT EXISTS leads (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  email        VARCHAR(150),
  company      VARCHAR(200),
  source       VARCHAR(50),    -- website, referral, ads, cold_call
  stage        VARCHAR(50)  DEFAULT 'new',   -- new, contacted, qualified, lost
  score        INTEGER      DEFAULT 50,
  created_at   DATE         NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS opportunities (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  customer_id  INTEGER      REFERENCES customers(id),
  amount       NUMERIC(15,2),
  stage        VARCHAR(50)  DEFAULT 'prospecting',
  probability  INTEGER      DEFAULT 20,
  close_date   DATE,
  owner        VARCHAR(100),
  created_at   DATE         NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(50)  UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(100),
  price        NUMERIC(15,2) NOT NULL,
  cost         NUMERIC(15,2),
  stock_qty    INTEGER       DEFAULT 0,
  unit         VARCHAR(20)   DEFAULT 'cái',
  supplier     VARCHAR(200),
  is_active    BOOLEAN       DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  order_code     VARCHAR(50) UNIQUE,
  customer_id    INTEGER     REFERENCES customers(id),
  order_date     DATE        NOT NULL DEFAULT CURRENT_DATE,
  total_amount   NUMERIC(15,2),
  discount       NUMERIC(15,2) DEFAULT 0,
  tax            NUMERIC(15,2) DEFAULT 0,
  status         VARCHAR(30) DEFAULT 'pending',   -- pending, confirmed, shipped, delivered, cancelled
  payment_method VARCHAR(50),
  shipping_city  VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER      REFERENCES products(id),
  quantity     INTEGER      NOT NULL DEFAULT 1,
  unit_price   NUMERIC(15,2) NOT NULL,
  discount_pct NUMERIC(5,2)  DEFAULT 0
);

CREATE TABLE IF NOT EXISTS campaigns (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  channel        VARCHAR(50),   -- email, social, ads, event
  budget         NUMERIC(15,2),
  actual_spend   NUMERIC(15,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversions    INTEGER DEFAULT 0,
  start_date     DATE,
  end_date       DATE,
  status         VARCHAR(30) DEFAULT 'active'
);

-- Views cho CRM
CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT
  o.order_date,
  COUNT(o.id)          AS order_count,
  SUM(o.total_amount)  AS revenue,
  SUM(o.discount)      AS total_discount
FROM orders o
WHERE o.status NOT IN ('cancelled')
GROUP BY o.order_date
ORDER BY o.order_date DESC;

CREATE OR REPLACE VIEW v_pipeline_summary AS
SELECT
  opp.stage,
  COUNT(opp.id)         AS deal_count,
  SUM(opp.amount)       AS total_value,
  AVG(opp.probability)  AS avg_probability,
  SUM(opp.amount * opp.probability / 100) AS weighted_value
FROM opportunities opp
GROUP BY opp.stage;

-- ────────────────────────────────────────────────────────────────
-- DOMAIN: Finance - Kế toán & Tài chính
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gl_accounts (
  id             SERIAL PRIMARY KEY,
  code           VARCHAR(20)  UNIQUE NOT NULL,
  name           VARCHAR(255) NOT NULL,
  type           VARCHAR(50)  NOT NULL,  -- asset, liability, equity, revenue, expense
  normal_balance VARCHAR(10)  DEFAULT 'debit',
  parent_code    VARCHAR(20),
  is_active      BOOLEAN      DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS gl_transactions (
  id             SERIAL PRIMARY KEY,
  account_id     INTEGER      NOT NULL REFERENCES gl_accounts(id),
  trans_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
  debit          NUMERIC(15,2) DEFAULT 0,
  credit         NUMERIC(15,2) DEFAULT 0,
  description    VARCHAR(500),
  reference      VARCHAR(100),
  journal_type   VARCHAR(50)   DEFAULT 'JE'
);

CREATE TABLE IF NOT EXISTS invoices (
  id             SERIAL PRIMARY KEY,
  invoice_code   VARCHAR(50)   UNIQUE,
  customer_id    INTEGER       REFERENCES customers(id),
  invoice_date   DATE          NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE,
  subtotal       NUMERIC(15,2) DEFAULT 0,
  tax_amount     NUMERIC(15,2) DEFAULT 0,
  total_amount   NUMERIC(15,2) DEFAULT 0,
  status         VARCHAR(30)   DEFAULT 'draft',   -- draft, sent, paid, overdue, cancelled
  paid_amount    NUMERIC(15,2) DEFAULT 0,
  currency       VARCHAR(5)    DEFAULT 'VND'
);

CREATE TABLE IF NOT EXISTS payments (
  id             SERIAL PRIMARY KEY,
  invoice_id     INTEGER       REFERENCES invoices(id),
  payment_date   DATE          NOT NULL DEFAULT CURRENT_DATE,
  amount         NUMERIC(15,2) NOT NULL,
  method         VARCHAR(50),   -- bank_transfer, cash, card
  reference      VARCHAR(100),
  notes          TEXT
);

CREATE TABLE IF NOT EXISTS budgets (
  id             SERIAL PRIMARY KEY,
  account_id     INTEGER       REFERENCES gl_accounts(id),
  fiscal_year    INTEGER       NOT NULL,
  q1             NUMERIC(15,2) DEFAULT 0,
  q2             NUMERIC(15,2) DEFAULT 0,
  q3             NUMERIC(15,2) DEFAULT 0,
  q4             NUMERIC(15,2) DEFAULT 0,
  total          NUMERIC(15,2) GENERATED ALWAYS AS (q1+q2+q3+q4) STORED
);

CREATE TABLE IF NOT EXISTS cost_centers (
  id             SERIAL PRIMARY KEY,
  code           VARCHAR(20)   UNIQUE NOT NULL,
  name           VARCHAR(255)  NOT NULL,
  manager        VARCHAR(150),
  department     VARCHAR(100),
  is_active      BOOLEAN       DEFAULT TRUE
);

-- Views cho Finance
CREATE OR REPLACE VIEW v_trial_balance AS
SELECT
  a.code,
  a.name,
  a.type,
  COALESCE(SUM(t.debit),  0) AS total_debit,
  COALESCE(SUM(t.credit), 0) AS total_credit,
  COALESCE(SUM(t.debit),  0) - COALESCE(SUM(t.credit), 0) AS balance
FROM gl_accounts a
LEFT JOIN gl_transactions t ON t.account_id = a.id
GROUP BY a.id, a.code, a.name, a.type
ORDER BY a.code;

CREATE OR REPLACE VIEW v_cash_flow AS
SELECT
  DATE_TRUNC('month', t.trans_date)::DATE AS month,
  a.type,
  SUM(t.debit)  AS total_debit,
  SUM(t.credit) AS total_credit
FROM gl_transactions t
JOIN gl_accounts a ON a.id = t.account_id
GROUP BY DATE_TRUNC('month', t.trans_date), a.type
ORDER BY month DESC;

CREATE OR REPLACE VIEW v_budget_vs_actual AS
SELECT
  a.code,
  a.name,
  b.fiscal_year,
  b.total            AS budget_total,
  COALESCE(SUM(t.debit) - SUM(t.credit), 0) AS actual,
  b.total - COALESCE(SUM(t.debit) - SUM(t.credit), 0) AS variance
FROM budgets b
JOIN gl_accounts a ON a.id = b.account_id
LEFT JOIN gl_transactions t ON t.account_id = b.account_id
  AND EXTRACT(YEAR FROM t.trans_date) = b.fiscal_year
GROUP BY a.code, a.name, b.fiscal_year, b.total;

-- ────────────────────────────────────────────────────────────────
-- DOMAIN: HR - Nhân sự & HCM
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(20)  UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  parent_id    INTEGER      REFERENCES departments(id),
  manager_name VARCHAR(150),
  cost_center  VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS positions (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(20)  UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  grade        VARCHAR(10),
  min_salary   NUMERIC(15,2),
  max_salary   NUMERIC(15,2)
);

CREATE TABLE IF NOT EXISTS employees (
  id            SERIAL PRIMARY KEY,
  emp_code      VARCHAR(20)   UNIQUE NOT NULL,
  full_name     VARCHAR(200)  NOT NULL,
  gender        VARCHAR(10),
  date_of_birth DATE,
  id_card       VARCHAR(20),
  phone         VARCHAR(20),
  email         VARCHAR(150),
  department_id INTEGER       REFERENCES departments(id),
  position_id   INTEGER       REFERENCES positions(id),
  hire_date     DATE,
  salary_base   NUMERIC(15,2),
  status        VARCHAR(20)   DEFAULT 'active'   -- active, inactive, resigned
);

CREATE TABLE IF NOT EXISTS salaries (
  id           SERIAL PRIMARY KEY,
  employee_id  INTEGER       NOT NULL REFERENCES employees(id),
  month        INTEGER       NOT NULL CHECK (month BETWEEN 1 AND 12),
  year         INTEGER       NOT NULL,
  base         NUMERIC(15,2) DEFAULT 0,
  allowance    NUMERIC(15,2) DEFAULT 0,
  bonus        NUMERIC(15,2) DEFAULT 0,
  deduction    NUMERIC(15,2) DEFAULT 0,
  net          NUMERIC(15,2) GENERATED ALWAYS AS (base + allowance + bonus - deduction) STORED,
  UNIQUE(employee_id, month, year)
);

CREATE TABLE IF NOT EXISTS attendance (
  id           SERIAL PRIMARY KEY,
  employee_id  INTEGER      NOT NULL REFERENCES employees(id),
  work_date    DATE         NOT NULL,
  check_in     TIME,
  check_out    TIME,
  status       VARCHAR(20)  DEFAULT 'present',  -- present, absent, late, half_day
  UNIQUE(employee_id, work_date)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id           SERIAL PRIMARY KEY,
  employee_id  INTEGER      NOT NULL REFERENCES employees(id),
  leave_type   VARCHAR(30)  DEFAULT 'annual',   -- annual, sick, maternity, unpaid
  start_date   DATE         NOT NULL,
  end_date     DATE         NOT NULL,
  days         NUMERIC(4,1),
  reason       TEXT,
  status       VARCHAR(20)  DEFAULT 'pending',  -- pending, approved, rejected
  approved_by  VARCHAR(150)
);

-- Views cho HR
CREATE OR REPLACE VIEW v_headcount_summary AS
SELECT
  d.name AS department,
  COUNT(e.id) AS total_employees,
  SUM(CASE WHEN e.gender = 'Nam' THEN 1 ELSE 0 END) AS male,
  SUM(CASE WHEN e.gender = 'Nữ'  THEN 1 ELSE 0 END) AS female,
  AVG(e.salary_base) AS avg_salary
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
GROUP BY d.id, d.name;

CREATE OR REPLACE VIEW v_payroll_summary AS
SELECT
  s.year,
  s.month,
  COUNT(s.id)   AS employee_count,
  SUM(s.base)   AS total_base,
  SUM(s.bonus)  AS total_bonus,
  SUM(s.net)    AS total_net
FROM salaries s
GROUP BY s.year, s.month
ORDER BY s.year DESC, s.month DESC;

-- ────────────────────────────────────────────────────────────────
-- DOMAIN: Manufacturing - Sản xuất
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workcenters (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(20)  UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  capacity     NUMERIC(10,2),
  unit         VARCHAR(30)  DEFAULT 'giờ/ngày',
  department   VARCHAR(100),
  is_active    BOOLEAN      DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS raw_materials (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(50)  UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  unit         VARCHAR(20)  DEFAULT 'kg',
  stock_qty    NUMERIC(15,3) DEFAULT 0,
  min_stock    NUMERIC(15,3) DEFAULT 0,
  cost_per_unit NUMERIC(15,2),
  supplier     VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS bom (
  id              SERIAL PRIMARY KEY,
  product_id      INTEGER      NOT NULL REFERENCES products(id),
  material_id     INTEGER      REFERENCES raw_materials(id),
  qty_per_unit    NUMERIC(10,4) NOT NULL,
  unit            VARCHAR(20),
  UNIQUE(product_id, material_id)
);

CREATE TABLE IF NOT EXISTS production_orders (
  id              SERIAL PRIMARY KEY,
  po_code         VARCHAR(50)  UNIQUE,
  product_id      INTEGER      REFERENCES products(id),
  qty_planned     NUMERIC(15,2) NOT NULL,
  qty_produced    NUMERIC(15,2) DEFAULT 0,
  start_date      DATE,
  end_date        DATE,
  actual_end_date DATE,
  status          VARCHAR(30)  DEFAULT 'planned',   -- planned, in_progress, completed, cancelled
  workcenter_id   INTEGER      REFERENCES workcenters(id),
  created_at      DATE         DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS quality_checks (
  id                  SERIAL PRIMARY KEY,
  production_order_id INTEGER      REFERENCES production_orders(id),
  check_date          DATE         NOT NULL DEFAULT CURRENT_DATE,
  qty_checked         NUMERIC(15,2),
  qty_pass            NUMERIC(15,2) DEFAULT 0,
  qty_fail            NUMERIC(15,2) DEFAULT 0,
  defect_type         VARCHAR(100),
  result              VARCHAR(20)  DEFAULT 'pass',   -- pass, fail, conditional
  inspector           VARCHAR(150)
);

-- Views cho Manufacturing
CREATE OR REPLACE VIEW v_production_kpi AS
SELECT
  po.po_code,
  p.name          AS product_name,
  po.qty_planned,
  po.qty_produced,
  ROUND(po.qty_produced / NULLIF(po.qty_planned,0) * 100, 1) AS completion_pct,
  po.start_date,
  po.end_date,
  po.status,
  w.name          AS workcenter
FROM production_orders po
JOIN products p ON p.id = po.product_id
LEFT JOIN workcenters w ON w.id = po.workcenter_id;

CREATE OR REPLACE VIEW v_quality_report AS
SELECT
  qc.check_date,
  p.name              AS product,
  SUM(qc.qty_checked) AS total_checked,
  SUM(qc.qty_pass)    AS total_pass,
  SUM(qc.qty_fail)    AS total_fail,
  ROUND(SUM(qc.qty_pass)/NULLIF(SUM(qc.qty_checked),0)*100,1) AS pass_rate
FROM quality_checks qc
JOIN production_orders po ON po.id = qc.production_order_id
JOIN products p ON p.id = po.product_id
GROUP BY qc.check_date, p.name
ORDER BY qc.check_date DESC;

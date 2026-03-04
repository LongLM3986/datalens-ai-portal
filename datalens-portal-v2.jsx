import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ─── DOMAIN CONFIG ──────────────────────────────────────────────
const DOMAINS = [
  {
    id: "crm",
    name: "CRM",
    fullName: "Kinh doanh & Marketing",
    icon: "💼",
    color: "#3B82F6",
    colorLight: "rgba(59,130,246,0.08)",
    colorBorder: "rgba(59,130,246,0.2)",
    tables: [
      { name: "customers", cols: 8, rows: "12.4K", type: "table" },
      { name: "leads", cols: 6, rows: "5.8K", type: "table" },
      { name: "opportunities", cols: 10, rows: "3.2K", type: "table" },
      { name: "orders", cols: 12, rows: "89.2K", type: "table" },
      { name: "order_items", cols: 6, rows: "245K", type: "table" },
      { name: "products", cols: 10, rows: "3.2K", type: "table" },
      { name: "campaigns", cols: 8, rows: "156", type: "table" },
      { name: "v_daily_revenue", cols: 4, rows: "—", type: "view" },
      { name: "v_pipeline_summary", cols: 6, rows: "—", type: "view" },
    ],
    suggestions: [
      { text: "Doanh thu tháng trước?", icon: "💰" },
      { text: "Top 10 sản phẩm bán chạy?", icon: "🏆" },
      { text: "Pipeline hiện tại trị giá bao nhiêu?", icon: "📊" },
      { text: "So sánh doanh thu Q1 vs Q2?", icon: "📈" },
      { text: "Conversion rate tháng này?", icon: "🎯" },
      { text: "Khách hàng mới 30 ngày qua?", icon: "👤" },
    ],
  },
  {
    id: "finance",
    name: "Tài chính",
    fullName: "Kế toán & Tài chính",
    icon: "💰",
    color: "#10B981",
    colorLight: "rgba(16,185,129,0.08)",
    colorBorder: "rgba(16,185,129,0.2)",
    tables: [
      { name: "gl_accounts", cols: 6, rows: "342", type: "table" },
      { name: "gl_transactions", cols: 10, rows: "1.2M", type: "table" },
      { name: "invoices", cols: 12, rows: "45K", type: "table" },
      { name: "payments", cols: 8, rows: "38K", type: "table" },
      { name: "budgets", cols: 7, rows: "96", type: "table" },
      { name: "cost_centers", cols: 5, rows: "28", type: "table" },
      { name: "v_trial_balance", cols: 5, rows: "—", type: "view" },
      { name: "v_cash_flow", cols: 6, rows: "—", type: "view" },
      { name: "v_aging_receivables", cols: 5, rows: "—", type: "view" },
    ],
    suggestions: [
      { text: "Công nợ phải thu hiện tại?", icon: "📋" },
      { text: "Dòng tiền tháng này?", icon: "💸" },
      { text: "So sánh ngân sách vs thực tế?", icon: "📊" },
      { text: "Top 10 khoản chi lớn nhất?", icon: "💳" },
      { text: "Tổng hợp P&L quý này?", icon: "📉" },
      { text: "Hóa đơn quá hạn chưa thanh toán?", icon: "⚠️" },
    ],
  },
  {
    id: "hr",
    name: "HCNS",
    fullName: "Hành chính Nhân sự",
    icon: "👥",
    color: "#F59E0B",
    colorLight: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.2)",
    tables: [
      { name: "employees", cols: 15, rows: "847", type: "table" },
      { name: "departments", cols: 5, rows: "24", type: "table" },
      { name: "attendance", cols: 7, rows: "156K", type: "table" },
      { name: "leave_requests", cols: 8, rows: "4.2K", type: "table" },
      { name: "recruitment", cols: 10, rows: "389", type: "table" },
      { name: "training_records", cols: 8, rows: "1.8K", type: "table" },
      { name: "v_headcount_by_dept", cols: 4, rows: "—", type: "view" },
      { name: "v_turnover_rate", cols: 5, rows: "—", type: "view" },
    ],
    suggestions: [
      { text: "Headcount hiện tại theo phòng ban?", icon: "👤" },
      { text: "Tỷ lệ turnover năm nay?", icon: "📉" },
      { text: "Bao nhiêu nhân viên đang nghỉ phép?", icon: "🏖️" },
      { text: "Tiến độ tuyển dụng tháng này?", icon: "📋" },
      { text: "Tỷ lệ đi muộn tuần này?", icon: "⏰" },
      { text: "Top phòng ban có OT nhiều nhất?", icon: "🔥" },
    ],
  },
  {
    id: "manufacturing",
    name: "Sản xuất",
    fullName: "Sản xuất & Chuỗi cung ứng",
    icon: "🏭",
    color: "#EF4444",
    colorLight: "rgba(239,68,68,0.08)",
    colorBorder: "rgba(239,68,68,0.2)",
    tables: [
      { name: "work_orders", cols: 12, rows: "23K", type: "table" },
      { name: "bom", cols: 6, rows: "890", type: "table" },
      { name: "inventory", cols: 9, rows: "15K", type: "table" },
      { name: "quality_checks", cols: 8, rows: "67K", type: "table" },
      { name: "machines", cols: 7, rows: "48", type: "table" },
      { name: "suppliers", cols: 8, rows: "234", type: "table" },
      { name: "purchase_orders", cols: 10, rows: "12K", type: "table" },
      { name: "v_production_output", cols: 5, rows: "—", type: "view" },
      { name: "v_defect_rate", cols: 4, rows: "—", type: "view" },
    ],
    suggestions: [
      { text: "Sản lượng hôm nay bao nhiêu?", icon: "📦" },
      { text: "Tỷ lệ lỗi (defect rate) tuần này?", icon: "⚠️" },
      { text: "Tồn kho nguyên vật liệu thấp?", icon: "📉" },
      { text: "OEE trung bình tháng này?", icon: "⚙️" },
      { text: "Máy nào downtime nhiều nhất?", icon: "🔧" },
      { text: "Tiến độ PO chưa giao?", icon: "🚚" },
    ],
  },
];

// ─── SAVED QUERIES PER DOMAIN ───────────────────────────────────
const SAVED_QUERIES = {
  crm: [
    { id: 1, question: "Doanh thu tháng trước so với cùng kỳ năm trước?", tags: ["doanh thu", "YoY"], pinned: true, savedAt: "28/02/2026", usedCount: 24, lastUsed: "Hôm nay" },
    { id: 2, question: "Top 10 sản phẩm bán chạy nhất tháng này?", tags: ["sản phẩm", "ranking"], pinned: true, savedAt: "25/02/2026", usedCount: 18, lastUsed: "Hôm nay" },
    { id: 3, question: "Pipeline theo stage và giá trị trung bình?", tags: ["pipeline", "opportunity"], pinned: false, savedAt: "22/02/2026", usedCount: 12, lastUsed: "Hôm qua" },
    { id: 4, question: "Conversion rate từ lead → opportunity → won theo tháng?", tags: ["conversion", "funnel"], pinned: false, savedAt: "20/02/2026", usedCount: 9, lastUsed: "27/02" },
    { id: 5, question: "Khách hàng có giá trị đơn hàng trung bình > 5 triệu?", tags: ["khách hàng", "VIP"], pinned: false, savedAt: "18/02/2026", usedCount: 7, lastUsed: "26/02" },
    { id: 6, question: "So sánh doanh thu theo kênh bán hàng (online/offline)?", tags: ["kênh", "so sánh"], pinned: false, savedAt: "15/02/2026", usedCount: 5, lastUsed: "24/02" },
    { id: 7, question: "Chiến dịch marketing nào có ROI cao nhất quý này?", tags: ["marketing", "ROI"], pinned: false, savedAt: "10/02/2026", usedCount: 3, lastUsed: "20/02" },
  ],
  finance: [
    { id: 1, question: "Tổng hợp P&L tháng này vs ngân sách?", tags: ["P&L", "budget"], pinned: true, savedAt: "01/03/2026", usedCount: 31, lastUsed: "Hôm nay" },
    { id: 2, question: "Công nợ phải thu quá hạn > 60 ngày?", tags: ["AR", "aging"], pinned: true, savedAt: "27/02/2026", usedCount: 22, lastUsed: "Hôm nay" },
    { id: 3, question: "Cash flow forecast tuần tới?", tags: ["cash flow", "forecast"], pinned: true, savedAt: "25/02/2026", usedCount: 19, lastUsed: "Hôm qua" },
    { id: 4, question: "Chi phí vận hành theo cost center tháng này?", tags: ["OPEX", "cost center"], pinned: false, savedAt: "22/02/2026", usedCount: 14, lastUsed: "28/02" },
    { id: 5, question: "Top 20 hóa đơn giá trị lớn nhất chưa thanh toán?", tags: ["invoice", "outstanding"], pinned: false, savedAt: "20/02/2026", usedCount: 11, lastUsed: "27/02" },
    { id: 6, question: "So sánh doanh thu - chi phí - lợi nhuận theo quý?", tags: ["quarterly", "summary"], pinned: false, savedAt: "15/02/2026", usedCount: 8, lastUsed: "25/02" },
  ],
  hr: [
    { id: 1, question: "Headcount theo phòng ban và loại hợp đồng?", tags: ["headcount", "phòng ban"], pinned: true, savedAt: "01/03/2026", usedCount: 20, lastUsed: "Hôm nay" },
    { id: 2, question: "Tỷ lệ turnover 12 tháng gần nhất?", tags: ["turnover", "trend"], pinned: true, savedAt: "28/02/2026", usedCount: 15, lastUsed: "Hôm nay" },
    { id: 3, question: "Danh sách nhân viên sắp hết hạn hợp đồng 30 ngày tới?", tags: ["hợp đồng", "alert"], pinned: true, savedAt: "25/02/2026", usedCount: 13, lastUsed: "Hôm qua" },
    { id: 4, question: "Tỷ lệ đi muộn và nghỉ không phép theo phòng ban?", tags: ["attendance", "vi phạm"], pinned: false, savedAt: "22/02/2026", usedCount: 10, lastUsed: "28/02" },
    { id: 5, question: "Tiến độ tuyển dụng theo vị trí đang mở?", tags: ["recruitment", "pipeline"], pinned: false, savedAt: "20/02/2026", usedCount: 8, lastUsed: "26/02" },
    { id: 6, question: "Số giờ overtime trung bình theo phòng ban tháng này?", tags: ["OT", "overtime"], pinned: false, savedAt: "18/02/2026", usedCount: 6, lastUsed: "25/02" },
    { id: 7, question: "Nhân viên nào hoàn thành training bắt buộc?", tags: ["training", "compliance"], pinned: false, savedAt: "14/02/2026", usedCount: 4, lastUsed: "22/02" },
  ],
  manufacturing: [
    { id: 1, question: "OEE trung bình theo dây chuyền sản xuất?", tags: ["OEE", "performance"], pinned: true, savedAt: "01/03/2026", usedCount: 28, lastUsed: "Hôm nay" },
    { id: 2, question: "Tỷ lệ defect theo loại sản phẩm tuần này?", tags: ["QC", "defect"], pinned: true, savedAt: "28/02/2026", usedCount: 21, lastUsed: "Hôm nay" },
    { id: 3, question: "Tồn kho nguyên vật liệu dưới mức an toàn?", tags: ["inventory", "alert"], pinned: true, savedAt: "26/02/2026", usedCount: 17, lastUsed: "Hôm nay" },
    { id: 4, question: "Sản lượng thực tế vs kế hoạch theo ngày?", tags: ["output", "plan vs actual"], pinned: false, savedAt: "24/02/2026", usedCount: 15, lastUsed: "Hôm qua" },
    { id: 5, question: "Top 5 máy có thời gian downtime nhiều nhất?", tags: ["machine", "downtime"], pinned: false, savedAt: "22/02/2026", usedCount: 12, lastUsed: "28/02" },
    { id: 6, question: "Tiến độ PO đang chờ nhận hàng?", tags: ["PO", "procurement"], pinned: false, savedAt: "20/02/2026", usedCount: 9, lastUsed: "27/02" },
    { id: 7, question: "Lead time trung bình theo nhà cung cấp?", tags: ["supplier", "lead time"], pinned: false, savedAt: "15/02/2026", usedCount: 6, lastUsed: "24/02" },
    { id: 8, question: "Chi phí bảo trì theo máy quý này?", tags: ["maintenance", "cost"], pinned: false, savedAt: "10/02/2026", usedCount: 4, lastUsed: "20/02" },
  ],
};

// ─── HISTORY PER DOMAIN ─────────────────────────────────────────
const HISTORY_DATA = {
  crm: [
    { date: "Hôm nay", items: [
      { q: "Doanh thu tháng 2/2026 là bao nhiêu?", ts: "14:32", hasChart: true, hasTable: false },
      { q: "Top 5 sản phẩm bán chạy nhất tháng này?", ts: "14:35", hasChart: true, hasTable: true },
      { q: "So sánh doanh thu online vs offline tháng 2?", ts: "11:20", hasChart: true, hasTable: false },
      { q: "Có bao nhiêu khách hàng mới tuần này?", ts: "10:05", hasChart: false, hasTable: true },
    ]},
    { date: "Hôm qua", items: [
      { q: "Pipeline giá trị theo từng stage?", ts: "16:48", hasChart: true, hasTable: true },
      { q: "Tỷ lệ hủy đơn theo tháng năm nay?", ts: "15:12", hasChart: true, hasTable: false },
      { q: "Khách hàng nào chưa mua lại sau 90 ngày?", ts: "11:30", hasChart: false, hasTable: true },
      { q: "Doanh thu theo vùng miền?", ts: "09:45", hasChart: true, hasTable: false },
    ]},
    { date: "27/02/2026", items: [
      { q: "Top 10 khách hàng mua nhiều nhất Q1?", ts: "14:20", hasChart: false, hasTable: true },
      { q: "Hiệu quả chiến dịch email marketing tháng 2?", ts: "11:00", hasChart: true, hasTable: false },
      { q: "Giá trị đơn hàng trung bình theo danh mục?", ts: "09:15", hasChart: true, hasTable: true },
    ]},
    { date: "26/02/2026", items: [
      { q: "Tỷ lệ chuyển đổi lead theo nguồn?", ts: "16:30", hasChart: true, hasTable: true },
      { q: "Số lượng quotation gửi vs won tháng này?", ts: "10:22", hasChart: true, hasTable: false },
    ]},
  ],
  finance: [
    { date: "Hôm nay", items: [
      { q: "Công nợ phải thu hiện tại bao nhiêu?", ts: "09:15", hasChart: true, hasTable: true },
      { q: "Dòng tiền ròng tháng 2?", ts: "09:40", hasChart: true, hasTable: false },
      { q: "So sánh OPEX thực tế vs budget theo department?", ts: "11:05", hasChart: true, hasTable: true },
    ]},
    { date: "Hôm qua", items: [
      { q: "Top 15 hóa đơn quá hạn lớn nhất?", ts: "15:30", hasChart: false, hasTable: true },
      { q: "Revenue recognition tháng 2 theo hợp đồng?", ts: "14:10", hasChart: false, hasTable: true },
      { q: "Tổng hợp công nợ phải trả theo kỳ hạn?", ts: "10:20", hasChart: true, hasTable: true },
    ]},
    { date: "28/02/2026", items: [
      { q: "Gross margin theo product line?", ts: "16:00", hasChart: true, hasTable: true },
      { q: "Chi phí nhân sự so với tổng chi phí?", ts: "11:45", hasChart: true, hasTable: false },
      { q: "Biến động tỷ giá ảnh hưởng P&L?", ts: "09:30", hasChart: true, hasTable: false },
    ]},
    { date: "27/02/2026", items: [
      { q: "Closing balance các tài khoản ngân hàng?", ts: "17:00", hasChart: false, hasTable: true },
      { q: "Interest expense YTD?", ts: "14:15", hasChart: false, hasTable: false },
    ]},
  ],
  hr: [
    { date: "Hôm nay", items: [
      { q: "Headcount hiện tại theo phòng ban?", ts: "10:00", hasChart: false, hasTable: true },
      { q: "Bao nhiêu nhân viên đang nghỉ phép hôm nay?", ts: "08:30", hasChart: false, hasTable: true },
      { q: "Tỷ lệ đi muộn sáng nay?", ts: "09:15", hasChart: false, hasTable: false },
    ]},
    { date: "Hôm qua", items: [
      { q: "Turnover rate Q1 theo phòng ban?", ts: "15:20", hasChart: true, hasTable: true },
      { q: "Danh sách hợp đồng sắp hết hạn tháng 3?", ts: "14:00", hasChart: false, hasTable: true },
      { q: "Số lượng ứng viên đang trong pipeline tuyển dụng?", ts: "11:10", hasChart: true, hasTable: true },
      { q: "Phòng ban nào có tỷ lệ vắng mặt cao nhất?", ts: "09:45", hasChart: true, hasTable: false },
    ]},
    { date: "28/02/2026", items: [
      { q: "Overtime trung bình theo phòng ban tháng 2?", ts: "16:30", hasChart: true, hasTable: true },
      { q: "Bao nhiêu nhân viên hoàn thành training compliance?", ts: "13:00", hasChart: false, hasTable: true },
      { q: "Chi phí tuyển dụng per hire quý này?", ts: "10:15", hasChart: true, hasTable: false },
    ]},
  ],
  manufacturing: [
    { date: "Hôm nay", items: [
      { q: "Tỷ lệ lỗi tuần này?", ts: "07:30", hasChart: true, hasTable: false },
      { q: "Sản lượng ca sáng hôm nay?", ts: "12:00", hasChart: false, hasTable: true },
      { q: "Máy CNC-03 đang chạy hay dừng?", ts: "10:45", hasChart: false, hasTable: false },
    ]},
    { date: "Hôm qua", items: [
      { q: "OEE tổng hợp theo dây chuyền tuần này?", ts: "17:00", hasChart: true, hasTable: true },
      { q: "Nguyên vật liệu nào dưới safety stock?", ts: "14:30", hasChart: false, hasTable: true },
      { q: "So sánh output thực tế vs kế hoạch tuần này?", ts: "11:20", hasChart: true, hasTable: true },
      { q: "Top 3 nguyên nhân dừng máy tháng 2?", ts: "09:00", hasChart: true, hasTable: false },
    ]},
    { date: "28/02/2026", items: [
      { q: "Tồn kho thành phẩm theo SKU?", ts: "16:15", hasChart: false, hasTable: true },
      { q: "PO nào đang trễ giao hàng?", ts: "13:40", hasChart: false, hasTable: true },
      { q: "Yield rate theo sản phẩm tháng 2?", ts: "10:30", hasChart: true, hasTable: true },
      { q: "Chi phí bảo trì tháng 2 so với tháng 1?", ts: "08:45", hasChart: true, hasTable: false },
    ]},
    { date: "27/02/2026", items: [
      { q: "Nhà cung cấp nào có lead time > 14 ngày?", ts: "15:00", hasChart: false, hasTable: true },
      { q: "Waste rate theo dây chuyền?", ts: "11:30", hasChart: true, hasTable: false },
    ]},
  ],
};

// ─── MOCK CONVERSATIONS PER DOMAIN ─────────────────────────────
const MOCK_MESSAGES = {
  crm: [
    { role: "user", content: "Doanh thu tháng 2/2026 là bao nhiêu?", ts: "14:32" },
    { role: "assistant", content: "Doanh thu tháng 2/2026 là **4.28 tỷ VND**, tăng **12.3%** so với tháng trước.\n\nChi tiết:\n• Tổng đơn hàng: **2,847** đơn\n• Giá trị trung bình: **1.503.000 VND**/đơn\n• Đơn hủy: 89 đơn (**3.1%**)", ts: "14:32", domain: "crm",
      sql: "SELECT SUM(net_amount) as doanh_thu,\n       COUNT(*) as so_don\nFROM crm.orders\nWHERE status NOT IN ('cancelled','returned')\n  AND created_at >= '2026-02-01'\n  AND created_at < '2026-03-01';",
      chart: { type: "bar", data: [{ n: "T9", v: 3.21 }, { n: "T10", v: 3.54 }, { n: "T11", v: 3.67 }, { n: "T12", v: 3.89 }, { n: "T1", v: 3.81 }, { n: "T2", v: 4.28 }] } },
  ],
  finance: [
    { role: "user", content: "Công nợ phải thu hiện tại bao nhiêu?", ts: "09:15" },
    { role: "assistant", content: "Tổng công nợ phải thu hiện tại là **12.7 tỷ VND**.\n\nPhân theo thời hạn:\n• Chưa đến hạn: **7.2 tỷ** (56.7%)\n• Quá hạn 1-30 ngày: **3.1 tỷ** (24.4%)\n• Quá hạn 31-60 ngày: **1.5 tỷ** (11.8%)\n• Quá hạn >60 ngày: **0.9 tỷ** (7.1%)", ts: "09:15", domain: "finance",
      sql: "SELECT aging_bucket, SUM(outstanding) as total\nFROM finance.v_aging_receivables\nGROUP BY aging_bucket\nORDER BY aging_bucket;",
      chart: { type: "bar", data: [{ n: "Chưa hạn", v: 7.2 }, { n: "1-30d", v: 3.1 }, { n: "31-60d", v: 1.5 }, { n: ">60d", v: 0.9 }] } },
  ],
  hr: [
    { role: "user", content: "Headcount hiện tại theo phòng ban?", ts: "10:00" },
    { role: "assistant", content: "Tổng headcount active: **847 nhân viên** (**24** phòng ban).", ts: "10:00", domain: "hr",
      sql: "SELECT d.name, COUNT(*) as headcount\nFROM hr.employees e\nJOIN hr.departments d ON d.id = e.department_id\nWHERE e.status = 'active'\nGROUP BY d.name\nORDER BY headcount DESC;",
      table: { h: ["Phòng ban", "Headcount", "% Tổng"], r: [["Sản xuất", "312", "36.8%"], ["Kinh doanh", "128", "15.1%"], ["Kỹ thuật", "97", "11.5%"], ["Kho vận", "84", "9.9%"], ["Hành chính", "62", "7.3%"], ["R&D", "54", "6.4%"], ["Khác (18 PB)", "110", "13.0%"]] } },
  ],
  manufacturing: [
    { role: "user", content: "Tỷ lệ lỗi tuần này?", ts: "07:30" },
    { role: "assistant", content: "Tỷ lệ lỗi (defect rate) tuần này: **2.3%**, giảm **0.4%** so với tuần trước.\n\nTop 3 loại lỗi:\n• Lỗi kích thước: **42%** tổng lỗi\n• Lỗi bề mặt: **31%**\n• Lỗi lắp ráp: **18%**", ts: "07:30", domain: "manufacturing",
      sql: "SELECT defect_type, COUNT(*) as cnt,\n  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER() * 100, 1) as pct\nFROM manufacturing.quality_checks\nWHERE result = 'fail'\n  AND checked_at >= DATE_TRUNC('week', CURRENT_DATE)\nGROUP BY defect_type\nORDER BY cnt DESC;",
      chart: { type: "bar", data: [{ n: "W1", v: 3.1 }, { n: "W2", v: 2.8 }, { n: "W3", v: 2.7 }, { n: "W4", v: 2.3 }] } },
  ],
};

// ─── MINI COMPONENTS ─────────────────────────────────────────────
function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110, padding: "8px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 5 }}>
          <span style={{ fontSize: 10, color: "#8896AB", fontVariantNumeric: "tabular-nums", fontFamily: "var(--mono)" }}>{d.v}</span>
          <div style={{ width: "100%", maxWidth: 44, height: `${Math.max((d.v / max) * 72, 4)}px`, background: `linear-gradient(to top, ${color}18, ${color}cc)`, borderRadius: "3px 3px 1px 1px", transition: "height 0.5s cubic-bezier(0.34,1.56,0.64,1)" }} />
          <span style={{ fontSize: 10, color: "#556479" }}>{d.n}</span>
        </div>
      ))}
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "10px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead><tr>{headers.map((h, i) => (<th key={i} style={{ textAlign: "left", padding: "7px 12px", borderBottom: "1px solid #1C2A3F", color: "#6B7D93", fontWeight: 500, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>))}</tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 ? "rgba(255,255,255,0.015)" : "transparent" }}>
            {row.map((cell, j) => (<td key={j} style={{ padding: "7px 12px", borderBottom: "1px solid rgba(28,42,63,0.5)", color: "#C5D0DC", fontVariantNumeric: "tabular-nums" }}>{cell}</td>))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function SQLBlock({ sql, color }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen(!open)} style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 5, padding: "4px 9px", color: `${color}cc`, fontSize: 10.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--mono)", transition: "all 0.2s" }}>
        <span style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "inline-block", fontSize: 8 }}>▶</span>SQL
      </button>
      {open && (
        <div style={{ position: "relative", marginTop: 5 }}>
          <pre style={{ background: "#080E1C", border: "1px solid #162033", borderRadius: 7, padding: 12, fontSize: 11.5, color: "#A0B4CC", overflowX: "auto", fontFamily: "var(--mono)", lineHeight: 1.55, margin: 0 }}>{sql}</pre>
          <button onClick={copy} style={{ position: "absolute", top: 6, right: 6, background: copied ? `${color}25` : "rgba(255,255,255,0.04)", border: `1px solid ${copied ? color + "40" : "#1C2A3F"}`, borderRadius: 3, padding: "2px 7px", color: copied ? color : "#556479", fontSize: 10, cursor: "pointer", transition: "all 0.2s" }}>{copied ? "✓" : "Copy"}</button>
        </div>
      )}
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6EE7B7", animation: `bonce 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
      <span style={{ fontSize: 11.5, color: "#556479", marginLeft: 8, fontStyle: "italic" }}>Đang phân tích & truy vấn...</span>
    </div>
  );
}

function fmt(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} style={{ color: "#EFF4F8", fontWeight: 600 }}>{p.slice(2, -2)}</strong>;
    return p.split("\n").map((line, j) => <span key={`${i}-${j}`}>{line}{j < p.split("\n").length - 1 && <br />}</span>);
  });
}

// ─── MAIN APP ────────────────────────────────────────────────────
export default function DataLensPortal() {
  const [activeDomain, setActiveDomain] = useState("crm");
  const [messages, setMessages] = useState(MOCK_MESSAGES.crm);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sideTab, setSideTab] = useState("schema");
  const [tableSearch, setTableSearch] = useState("");
  const [savedSearch, setSavedSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const domain = useMemo(() => DOMAINS.find(d => d.id === activeDomain), [activeDomain]);
  const filteredTables = useMemo(() => domain.tables.filter(t => t.name.includes(tableSearch.toLowerCase())), [domain, tableSearch]);
  const currentSaved = useMemo(() => {
    const items = SAVED_QUERIES[activeDomain] || [];
    if (!savedSearch) return items;
    const q = savedSearch.toLowerCase();
    return items.filter(s => s.question.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)));
  }, [activeDomain, savedSearch]);
  const currentHistory = useMemo(() => {
    const groups = HISTORY_DATA[activeDomain] || [];
    if (!historySearch) return groups;
    const q = historySearch.toLowerCase();
    return groups.map(g => ({ ...g, items: g.items.filter(it => it.q.toLowerCase().includes(q)) })).filter(g => g.items.length > 0);
  }, [activeDomain, historySearch]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const switchDomain = (id) => { setActiveDomain(id); setMessages(MOCK_MESSAGES[id] || []); setShowDomainPicker(false); setTableSearch(""); setSavedSearch(""); setHistorySearch(""); };

  const send = useCallback(() => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages(p => [...p, { role: "user", content: q, ts: new Date().toLocaleTimeString("vi", { hour: "2-digit", minute: "2-digit" }) }]);
    setLoading(true);
    setTimeout(() => {
      setMessages(p => [...p, { role: "assistant", content: `Đã phân tích câu hỏi trong domain **${domain.name}**: "${q}"\n\nĐây là giao diện demo — kết nối backend FastAPI + Claude API (tool_use) để nhận kết quả thực.`, ts: new Date().toLocaleTimeString("vi", { hour: "2-digit", minute: "2-digit" }), domain: activeDomain }]);
      setLoading(false);
    }, 2200);
  }, [input, loading, domain, activeDomain]);

  const useQuestion = (q) => { setInput(q); inputRef.current?.focus(); };
  const C = domain.color;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#060B18", color: "#D0D9E4", fontFamily: "'DM Sans', system-ui", overflow: "hidden", position: "relative", "--mono": "'IBM Plex Mono', 'Fira Code', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes bonce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideR{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.3)}50%{box-shadow:0 0 0 4px rgba(34,197,94,0)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1C2A3F;border-radius:8px}
        input::placeholder{color:#3E4F64}input:focus{outline:none}button:focus-visible{outline:2px solid ${C};outline-offset:2px}
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: -250, right: -250, width: 600, height: 600, background: `radial-gradient(circle, ${C}08 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0, transition: "background 0.6s" }} />
      <div style={{ position: "fixed", bottom: -200, left: -150, width: 500, height: 500, background: `radial-gradient(circle, ${C}04 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0, transition: "background 0.6s" }} />

      {/* ═══ SIDEBAR ═══ */}
      <div style={{ width: sidebarOpen ? 296 : 0, minWidth: sidebarOpen ? 296 : 0, background: "#0A1022", borderRight: "1px solid #111C30", display: "flex", flexDirection: "column", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #111C30" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C}, ${C}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700, transition: "background 0.4s", flexShrink: 0 }}>⚡</div>
            <div><div style={{ fontWeight: 700, fontSize: 15, color: "#EFF4F8", letterSpacing: "-0.02em" }}>DataLens</div><div style={{ fontSize: 10.5, color: "#3E4F64" }}>Enterprise Data Q&A</div></div>
          </div>
        </div>

        {/* Domain selector */}
        <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid #111C30" }}>
          <div style={{ fontSize: 9.5, color: "#3E4F64", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>Domain</div>
          <button onClick={() => setShowDomainPicker(!showDomainPicker)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: domain.colorLight, border: `1px solid ${domain.colorBorder}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            <span style={{ fontSize: 18 }}>{domain.icon}</span>
            <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 600, color: C }}>{domain.name}</div><div style={{ fontSize: 10.5, color: "#556479" }}>{domain.fullName}</div></div>
            <span style={{ fontSize: 10, color: "#3E4F64", transform: showDomainPicker ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
          </button>
          {showDomainPicker && (
            <div style={{ marginTop: 4, background: "#0D1529", border: "1px solid #162033", borderRadius: 8, overflow: "hidden" }}>
              {DOMAINS.filter(d => d.id !== activeDomain).map(d => (
                <button key={d.id} onClick={() => switchDomain(d.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", borderBottom: "1px solid #111C30" }}
                  onMouseEnter={e => e.currentTarget.style.background = d.colorLight} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 16 }}>{d.icon}</span><div style={{ textAlign: "left" }}><div style={{ fontSize: 12.5, fontWeight: 500, color: "#C5D0DC" }}>{d.name}</div><div style={{ fontSize: 10, color: "#3E4F64" }}>{d.tables.length} bảng</div></div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Side tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #111C30" }}>
          {[{ id: "schema", label: "Schema", ic: "◈" }, { id: "saved", label: "Đã lưu", ic: "★", count: (SAVED_QUERIES[activeDomain] || []).length }, { id: "history", label: "Lịch sử", ic: "◷" }].map(tab => (
            <button key={tab.id} onClick={() => setSideTab(tab.id)} style={{ flex: 1, padding: "10px 0", background: sideTab === tab.id ? `${C}08` : "transparent", border: "none", borderBottom: sideTab === tab.id ? `2px solid ${C}` : "2px solid transparent", color: sideTab === tab.id ? C : "#3E4F64", fontSize: 10.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, position: "relative" }}>
              <span style={{ fontSize: 12 }}>{tab.ic}</span>{tab.label}
              {tab.count && <span style={{ background: `${C}20`, color: C, fontSize: 9, padding: "1px 5px", borderRadius: 10, marginLeft: 2 }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Sidebar body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>

          {/* ──── SCHEMA TAB ──── */}
          {sideTab === "schema" && (<>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input value={tableSearch} onChange={e => setTableSearch(e.target.value)} placeholder="Tìm bảng..." style={{ width: "100%", padding: "7px 10px 7px 28px", background: "#0D1529", border: "1px solid #162033", borderRadius: 7, color: "#C5D0DC", fontSize: 12.5, fontFamily: "inherit" }} />
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#3E4F64" }}>⌕</span>
            </div>
            <div style={{ fontSize: 9.5, color: "#3E4F64", textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 6px 4px" }}>{filteredTables.filter(t => t.type === "table").length} Tables · {filteredTables.filter(t => t.type === "view").length} Views</div>
            {filteredTables.map((t, i) => (
              <div key={t.name} style={{ padding: "8px 10px", borderRadius: 6, marginBottom: 1, cursor: "pointer", transition: "all 0.15s", animation: `slideR 0.25s ease ${i * 0.02}s backwards`, display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize: 9, color: t.type === "view" ? C : "#3E4F64", background: t.type === "view" ? `${C}15` : "#111C30", padding: "2px 5px", borderRadius: 3, fontFamily: "var(--mono)", fontWeight: 500 }}>{t.type === "view" ? "VW" : "TB"}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 500, fontFamily: "var(--mono)", color: "#9AABBE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div><div style={{ fontSize: 10, color: "#3E4F64" }}>{t.cols} cols · {t.rows}</div></div>
              </div>
            ))}
          </>)}

          {/* ──── SAVED TAB ──── */}
          {sideTab === "saved" && (<>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input value={savedSearch} onChange={e => setSavedSearch(e.target.value)} placeholder="Tìm câu hỏi đã lưu..." style={{ width: "100%", padding: "7px 10px 7px 28px", background: "#0D1529", border: "1px solid #162033", borderRadius: 7, color: "#C5D0DC", fontSize: 12.5, fontFamily: "inherit" }} />
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#3E4F64" }}>⌕</span>
            </div>

            {/* Pinned section */}
            {currentSaved.some(s => s.pinned) && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9.5, color: "#3E4F64", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 6px", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: C, fontSize: 10 }}>📌</span> Ghim
                </div>
                {currentSaved.filter(s => s.pinned).map((s, i) => (
                  <button key={s.id} onClick={() => useQuestion(s.question)} style={{ width: "100%", textAlign: "left", padding: "9px 10px", background: `${C}05`, border: `1px solid ${C}12`, borderRadius: 7, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", marginBottom: 3, animation: `slideR 0.25s ease ${i * 0.04}s backwards` }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${C}10`; e.currentTarget.style.borderColor = `${C}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${C}05`; e.currentTarget.style.borderColor = `${C}12`; }}>
                    <div style={{ fontSize: 12.5, color: "#C5D0DC", lineHeight: 1.4, marginBottom: 5 }}>{s.question}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                      {s.tags.map(t => <span key={t} style={{ fontSize: 9.5, background: `${C}15`, color: `${C}bb`, padding: "1px 6px", borderRadius: 3 }}>{t}</span>)}
                      <span style={{ fontSize: 9.5, color: "#3E4F64", marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>×{s.usedCount} · {s.lastUsed}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* All saved */}
            <div style={{ fontSize: 9.5, color: "#3E4F64", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 6px", marginTop: 4 }}>Tất cả ({currentSaved.filter(s => !s.pinned).length})</div>
            {currentSaved.filter(s => !s.pinned).map((s, i) => (
              <button key={s.id} onClick={() => useQuestion(s.question)} style={{ width: "100%", textAlign: "left", padding: "9px 10px", background: "transparent", border: "1px solid transparent", borderRadius: 7, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", marginBottom: 2, animation: `slideR 0.3s ease ${i * 0.04}s backwards` }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "#162033"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
                <div style={{ fontSize: 12.5, color: "#9AABBE", lineHeight: 1.4, marginBottom: 5 }}>{s.question}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                  {s.tags.map(t => <span key={t} style={{ fontSize: 9.5, background: "#111C30", color: "#556479", padding: "1px 6px", borderRadius: 3 }}>{t}</span>)}
                  <span style={{ fontSize: 9.5, color: "#2A3A4F", marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>×{s.usedCount} · {s.savedAt}</span>
                </div>
              </button>
            ))}

            {currentSaved.length === 0 && (
              <div style={{ padding: 20, textAlign: "center", color: "#2A3A4F", fontSize: 12 }}>Không tìm thấy kết quả cho "{savedSearch}"</div>
            )}
          </>)}

          {/* ──── HISTORY TAB ──── */}
          {sideTab === "history" && (<>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Tìm trong lịch sử..." style={{ width: "100%", padding: "7px 10px 7px 28px", background: "#0D1529", border: "1px solid #162033", borderRadius: 7, color: "#C5D0DC", fontSize: 12.5, fontFamily: "inherit" }} />
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#3E4F64" }}>⌕</span>
            </div>

            {currentHistory.map((group, gi) => (
              <div key={group.date} style={{ marginBottom: 12, animation: `fadeUp 0.3s ease ${gi * 0.05}s backwards` }}>
                <div style={{ fontSize: 10, color: "#3E4F64", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 6px 4px", display: "flex", alignItems: "center", gap: 6, position: "sticky", top: 0, background: "#0A1022", zIndex: 1 }}>
                  <div style={{ width: 16, height: 1, background: "#1C2A3F" }} />
                  {group.date}
                  <div style={{ flex: 1, height: 1, background: "#1C2A3F" }} />
                  <span style={{ fontSize: 9, color: "#2A3A4F", fontWeight: 400 }}>{group.items.length}</span>
                </div>

                {group.items.map((item, i) => (
                  <button key={i} onClick={() => useQuestion(item.q)} style={{ width: "100%", textAlign: "left", padding: "8px 10px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", marginBottom: 1, display: "flex", gap: 8, alignItems: "flex-start" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    {/* Timestamp column */}
                    <span style={{ fontSize: 10, color: "#2A3A4F", fontFamily: "var(--mono)", fontVariantNumeric: "tabular-nums", flexShrink: 0, paddingTop: 2, width: 36 }}>{item.ts}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: "#9AABBE", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.q}</div>
                      {/* Result type badges */}
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {item.hasChart && <span style={{ fontSize: 9, background: `${C}10`, color: `${C}99`, padding: "1px 5px", borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>📊 chart</span>}
                        {item.hasTable && <span style={{ fontSize: 9, background: "rgba(255,255,255,0.04)", color: "#556479", padding: "1px 5px", borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>⊞ table</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}

            {currentHistory.length === 0 && (
              <div style={{ padding: 20, textAlign: "center", color: "#2A3A4F", fontSize: 12 }}>
                {historySearch ? `Không tìm thấy "${historySearch}"` : "Chưa có lịch sử"}
              </div>
            )}

            {/* History stats footer */}
            {!historySearch && (
              <div style={{ padding: "10px 6px", borderTop: "1px solid #111C30", marginTop: 4, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#2A3A4F" }}>
                <span>Tổng: {(HISTORY_DATA[activeDomain] || []).reduce((a, g) => a + g.items.length, 0)} câu hỏi</span>
                <span>{(HISTORY_DATA[activeDomain] || []).length} ngày</span>
              </div>
            )}
          </>)}
        </div>

        {/* Connection */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid #111C30", fontSize: 10.5, color: "#2A3A4F", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulseRing 2s infinite" }} />
          <span>PostgreSQL · schema: {domain.id}</span>
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 1 }}>
        {/* Top bar */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #111C30", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,16,34,0.85)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #162033", borderRadius: 7, padding: "6px 9px", color: "#7B8DA0", cursor: "pointer", fontSize: 13, lineHeight: 1, transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>{sidebarOpen ? "◁" : "▷"}</button>
            <div style={{ display: "flex", gap: 2, background: "#0A1022", borderRadius: 8, padding: 2, border: "1px solid #111C30" }}>
              {DOMAINS.map(d => (
                <button key={d.id} onClick={() => switchDomain(d.id)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: d.id === activeDomain ? d.colorLight : "transparent", color: d.id === activeDomain ? d.color : "#3E4F64", fontSize: 12, fontWeight: d.id === activeDomain ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
                  onMouseEnter={e => { if (d.id !== activeDomain) e.currentTarget.style.color = "#7B8DA0"; }}
                  onMouseLeave={e => { if (d.id !== activeDomain) e.currentTarget.style.color = "#3E4F64"; }}>
                  <span style={{ fontSize: 13 }}>{d.icon}</span><span>{d.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => setMessages([])} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #162033", borderRadius: 7, padding: "6px 12px", color: "#556479", cursor: "pointer", fontSize: 11.5, fontFamily: "inherit", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>+ Mới</button>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C}40, ${C}15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer", border: `1px solid ${C}30` }}>👤</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", animation: "fadeUp 0.4s ease" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${C}20, ${C}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 16, border: `1px solid ${C}15`, transition: "all 0.4s" }}>{domain.icon}</div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#EFF4F8", marginBottom: 4, letterSpacing: "-0.02em" }}>{domain.name} — {domain.fullName}</h2>
              <p style={{ color: "#556479", fontSize: 13, marginBottom: 28, maxWidth: 420, textAlign: "center", lineHeight: 1.55 }}>Đặt câu hỏi về dữ liệu {domain.fullName.toLowerCase()}. AI sẽ tự phân tích schema, viết SQL và trả kết quả.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxWidth: 660, width: "100%" }}>
                {domain.suggestions.map((q, i) => (
                  <button key={i} onClick={() => useQuestion(q.text)} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.015)", border: "1px solid #151E30", borderRadius: 10, color: "#7B8DA0", fontSize: 12.5, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.2s", lineHeight: 1.4, animation: `fadeUp 0.35s ease ${i * 0.05}s backwards` }}
                    onMouseEnter={e => { e.currentTarget.style.background = domain.colorLight; e.currentTarget.style.borderColor = domain.colorBorder; e.currentTarget.style.color = "#C5D0DC"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.borderColor = "#151E30"; e.currentTarget.style.color = "#7B8DA0"; e.currentTarget.style.transform = "none"; }}>
                    <span style={{ fontSize: 16, display: "block", marginBottom: 5 }}>{q.icon}</span>{q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 16, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.3s ease" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C}, ${C}60)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 10, marginTop: 2, color: "#fff", fontWeight: 700, transition: "background 0.4s" }}>⚡</div>
              )}
              <div style={{ maxWidth: msg.role === "user" ? "60%" : "72%", padding: msg.role === "user" ? "9px 16px" : "14px 18px", borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", background: msg.role === "user" ? `linear-gradient(135deg, ${C}dd, ${C}99)` : "rgba(255,255,255,0.025)", border: msg.role === "user" ? "none" : "1px solid #151E30", color: msg.role === "user" ? "#fff" : "#B8C6D4", fontSize: 13.5, lineHeight: 1.6 }}>
                {msg.role === "assistant" && msg.domain && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${C}10`, border: `1px solid ${C}20`, borderRadius: 4, padding: "2px 7px", marginBottom: 6, fontSize: 10, color: C, fontWeight: 500 }}>{domain.icon} {domain.name}</div>
                )}
                <div>{fmt(msg.content)}</div>
                {msg.table && <DataTable headers={msg.table.h} rows={msg.table.r} />}
                {msg.chart && (<div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px 14px", marginTop: 10, border: "1px solid rgba(255,255,255,0.03)" }}><BarChart data={msg.chart.data} color={C} /></div>)}
                {msg.sql && <SQLBlock sql={msg.sql} color={C} />}
                <div style={{ fontSize: 9.5, color: msg.role === "user" ? "rgba(255,255,255,0.45)" : "#2A3A4F", marginTop: 6, textAlign: "right" }}>{msg.ts}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, animation: "fadeUp 0.25s ease" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C}, ${C}60)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, color: "#fff", fontWeight: 700 }}>⚡</div>
              <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.025)", border: "1px solid #151E30", borderRadius: "14px 14px 14px 3px" }}><Typing /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "14px 20px 18px", borderTop: "1px solid #111C30", background: "rgba(10,16,34,0.9)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", gap: 8, maxWidth: 780, margin: "0 auto", position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 4, background: domain.colorLight, border: `1px solid ${domain.colorBorder}`, borderRadius: 5, padding: "3px 8px", fontSize: 10.5, color: C, fontWeight: 500, pointerEvents: "none", transition: "all 0.3s", zIndex: 2 }}>{domain.icon} {domain.name}</div>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Hỏi về ${domain.fullName.toLowerCase()}...`} disabled={loading}
              style={{ flex: 1, padding: "12px 48px 12px 110px", background: "#0D1529", border: "1px solid #162033", borderRadius: 12, color: "#D0D9E4", fontSize: 13.5, fontFamily: "inherit", transition: "all 0.2s" }}
              onFocus={e => { e.target.style.borderColor = `${C}40`; e.target.style.boxShadow = `0 0 0 3px ${C}08`; }}
              onBlur={e => { e.target.style.borderColor = "#162033"; e.target.style.boxShadow = "none"; }} />
            <button onClick={send} disabled={loading || !input.trim()} style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 9, background: input.trim() && !loading ? `linear-gradient(135deg, ${C}, ${C}aa)` : "rgba(255,255,255,0.03)", border: "none", color: input.trim() && !loading ? "#fff" : "#3E4F64", cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", fontWeight: 700 }}>↑</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 10.5, color: "#1C2A3F" }}>Claude Sonnet · Read-only · Domain: {domain.id} · Kết quả tham khảo</div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#060B18", sidebar: "#0A1022", card: "#0D1529",
  border: "#111C30", border2: "#162033",
  text: "#D0D9E4", textSub: "#6B7E94", textMut: "#2A3A4F",
  green: "#22C55E", greenDim: "#6EE7B7",
};

// ─── DOMAIN CONFIG (y hệt datalens-portal-v2.jsx) ─────────────────────────────
const DOMAINS = [
  {
    id: "crm", name: "CRM", fullName: "Kinh doanh & Marketing", icon: "💼",
    color: "#3B82F6", colorLight: "rgba(59,130,246,0.08)", colorBorder: "rgba(59,130,246,0.2)",
    tables: [
      { name:"customers",    cols:8,  rows:"20",   type:"table" },
      { name:"leads",        cols:6,  rows:"8",    type:"table" },
      { name:"opportunities",cols:10, rows:"8",    type:"table" },
      { name:"orders",       cols:12, rows:"100",  type:"table" },
      { name:"order_items",  cols:6,  rows:"200",  type:"table" },
      { name:"products",     cols:10, rows:"15",   type:"table" },
      { name:"campaigns",    cols:8,  rows:"5",    type:"table" },
      { name:"v_daily_revenue",cols:4,rows:"—",   type:"view"  },
      { name:"v_pipeline_summary",cols:6,rows:"—",type:"view"  },
    ],
    suggestions: [
      { text:"Doanh thu tháng trước?", icon:"💰" },
      { text:"Top 10 sản phẩm bán chạy?", icon:"🏆" },
      { text:"Pipeline hiện tại trị giá bao nhiêu?", icon:"📊" },
      { text:"So sánh doanh thu Q1 vs Q2?", icon:"📈" },
      { text:"Tỷ lệ chuyển đổi tháng này?", icon:"🎯" },
      { text:"Khách hàng mới 30 ngày qua?", icon:"👤" },
    ],
    placeholder: "Hỏi về kinh doanh & marketing...",
  },
  {
    id: "finance", name: "Tài chính", fullName: "Kế toán & Tài chính", icon: "💰",
    color: "#10B981", colorLight: "rgba(16,185,129,0.08)", colorBorder: "rgba(16,185,129,0.2)",
    tables: [
      { name:"gl_accounts",    cols:6,  rows:"15",  type:"table" },
      { name:"gl_transactions",cols:10, rows:"50",  type:"table" },
      { name:"invoices",       cols:12, rows:"50",  type:"table" },
      { name:"payments",       cols:8,  rows:"12",  type:"table" },
      { name:"budgets",        cols:7,  rows:"9",   type:"table" },
      { name:"cost_centers",   cols:5,  rows:"5",   type:"table" },
      { name:"v_trial_balance",cols:5,  rows:"—",   type:"view"  },
      { name:"v_cash_flow",    cols:6,  rows:"—",   type:"view"  },
      { name:"v_budget_vs_actual",cols:8,rows:"—",  type:"view"  },
    ],
    suggestions: [
      { text:"Công nợ phải thu hiện tại?", icon:"📋" },
      { text:"Doanh thu theo tháng năm nay?", icon:"📈" },
      { text:"Chi phí lớn nhất tháng này?", icon:"💸" },
      { text:"Số dư tài khoản ngân hàng?", icon:"🏦" },
      { text:"So sánh ngân sách vs thực chi?", icon:"⚖️" },
      { text:"Hóa đơn quá hạn thanh toán?", icon:"⚠️" },
    ],
    placeholder: "Hỏi về kế toán & tài chính...",
  },
  {
    id: "hr", name: "HCNS", fullName: "Nhân sự & HCM", icon: "👥",
    color: "#F59E0B", colorLight: "rgba(245,158,11,0.08)", colorBorder: "rgba(245,158,11,0.2)",
    tables: [
      { name:"employees",         cols:12, rows:"15",  type:"table" },
      { name:"departments",       cols:6,  rows:"8",   type:"table" },
      { name:"positions",         cols:5,  rows:"7",   type:"table" },
      { name:"salaries",          cols:8,  rows:"45",  type:"table" },
      { name:"attendance",        cols:6,  rows:"0",   type:"table" },
      { name:"leave_requests",    cols:7,  rows:"0",   type:"table" },
      { name:"v_headcount_summary",cols:5, rows:"—",   type:"view"  },
      { name:"v_payroll_summary", cols:7,  rows:"—",   type:"view"  },
    ],
    suggestions: [
      { text:"Tổng số nhân viên hiện tại?", icon:"👤" },
      { text:"Headcount theo phòng ban?", icon:"🏢" },
      { text:"Tổng quỹ lương tháng này?", icon:"💵" },
      { text:"Nhân viên mới tuyển 3 tháng?", icon:"🆕" },
      { text:"Tỷ lệ nghỉ phép trung bình?", icon:"📅" },
      { text:"Lương trung bình theo vị trí?", icon:"📊" },
    ],
    placeholder: "Hỏi về nhân sự & HCM...",
  },
  {
    id: "mfg", name: "Sản xuất", fullName: "Quản lý Sản xuất", icon: "🏭",
    color: "#EF4444", colorLight: "rgba(239,68,68,0.08)", colorBorder: "rgba(239,68,68,0.2)",
    tables: [
      { name:"production_orders",cols:10, rows:"20",  type:"table" },
      { name:"bom",              cols:6,  rows:"14",  type:"table" },
      { name:"workcenters",      cols:5,  rows:"5",   type:"table" },
      { name:"quality_checks",   cols:8,  rows:"6",   type:"table" },
      { name:"raw_materials",    cols:7,  rows:"8",   type:"table" },
      { name:"v_production_kpi", cols:8,  rows:"—",   type:"view"  },
      { name:"v_quality_report", cols:6,  rows:"—",   type:"view"  },
    ],
    suggestions: [
      { text:"Trạng thái lệnh sản xuất?", icon:"🔧" },
      { text:"KPI sản xuất tháng này?", icon:"📊" },
      { text:"Tỷ lệ lỗi sản phẩm?", icon:"⚠️" },
      { text:"Nguyên vật liệu sắp hết?", icon:"📦" },
      { text:"Hiệu suất xưởng sản xuất?", icon:"⚡" },
      { text:"Kế hoạch sản xuất tuần tới?", icon:"📅" },
    ],
    placeholder: "Hỏi về sản xuất...",
  },
];

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
@keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.msg-anim{animation:fadeUp .3s ease}
.hover-row:hover{background:rgba(255,255,255,.03)!important}
.tab-btn:hover{color:#D0D9E4!important}
.domain-btn:hover{opacity:.85}
.suggestion-btn:hover{border-color:rgba(255,255,255,.15)!important;color:#D0D9E4!important}
.tbl-row:hover{background:rgba(255,255,255,.04)!important;cursor:pointer}
.sidebar-sess:hover .sess-del{opacity:1!important}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((p, i) =>
    i % 2 ? <strong key={i} style={{ color: C.text, fontWeight: 600 }}>{p}</strong> : p
  );
}

function parseContent(text) {
  if (!text) return [];
  const parts = [], re = /```(chart|datatable|sql)\n([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", content: text.slice(last, m.index) });
    const body = m[2].trim();
    if (m[1] === "chart") { try { parts.push({ type: "chart", data: JSON.parse(body) }); } catch { parts.push({ type: "text", content: m[0] }); } }
    else if (m[1] === "datatable") { try { parts.push({ type: "datatable", data: JSON.parse(body) }); } catch { parts.push({ type: "text", content: m[0] }); } }
    else if (m[1] === "sql") parts.push({ type: "sql", query: body });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
}

// ─── CHART ────────────────────────────────────────────────────────────────────
function BarChart({ data, domainColor }) {
  const { title, labels = [], data: vals = [], color } = data;
  const col = color || domainColor || "#3B82F6";
  if (!vals.length) return null;
  const max = Math.max(...vals, 1), w = 46, gap = 8, h = 110;
  const tw = labels.length * (w + gap) - gap + 50;
  return (
    <div style={{ margin: "10px 0", background: "#080E1C", borderRadius: 10, padding: "14px 10px 8px", border: `1px solid ${C.border}` }}>
      {title && <div style={{ fontSize: 11.5, color: C.textSub, marginBottom: 10, fontWeight: 600 }}>{title}</div>}
      <div style={{ overflowX: "auto" }}>
        <svg width={tw} height={h + 44} style={{ display: "block" }}>
          {vals.map((v, i) => {
            const bh = Math.round((v / max) * h), x = 28 + i * (w + gap), y = h - bh + 8;
            return (
              <g key={i}>
                <defs><linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity=".9"/><stop offset="100%" stopColor={col} stopOpacity=".25"/></linearGradient></defs>
                <rect x={x} y={y} width={w} height={bh} rx={4} fill={`url(#g${i})`}/>
                <text x={x+w/2} y={y-4} textAnchor="middle" fill={C.textSub} fontSize={9.5} fontFamily="IBM Plex Mono,monospace">
                  {v >= 1e9 ? (v/1e9).toFixed(1)+"T" : v >= 1e6 ? (v/1e6).toFixed(1)+"M" : v >= 1000 ? (v/1000).toFixed(1)+"k" : v}
                </text>
                {labels[i] && <text x={x+w/2} y={h+24} textAnchor="middle" fill={C.textSub} fontSize={9.5}>{String(labels[i]).slice(0,8)}</text>}
              </g>
            );
          })}
          <text x={22} y={12} textAnchor="middle" fill={C.textSub} fontSize={8.5}>{max >= 1e9 ? (max/1e9).toFixed(1)+"T" : max >= 1e6 ? (max/1e6).toFixed(0)+"M" : max}</text>
          <line x1={28} y1={8} x2={28} y2={h+8} stroke={C.border} strokeWidth={1}/>
        </svg>
      </div>
    </div>
  );
}

function DataTable({ data }) {
  const { headers = [], rows = [] } = data;
  if (!headers.length) return null;
  return (
    <div style={{ margin: "10px 0", overflowX: "auto", borderRadius: 8, border: `1px solid ${C.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
        <thead><tr style={{ background: "#080E1C" }}>
          {headers.map((h, i) => <th key={i} style={{ padding: "7px 11px", textAlign: "left", color: C.textSub, fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, fontFamily: "IBM Plex Mono,monospace", whiteSpace: "nowrap" }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? "#080E1C" : "transparent" }} className="hover-row">
              {(Array.isArray(row) ? row : Object.values(row)).map((cell, ci) => (
                <td key={ci} style={{ padding: "6px 11px", color: C.text, fontSize: 11.5, borderBottom: ri < rows.length-1 ? `1px solid ${C.border}` : "none", whiteSpace: "nowrap" }}>
                  {cell === null || cell === undefined ? <span style={{ color: C.textMut }}>NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: "4px 11px", fontSize: 10, color: C.textMut, borderTop: `1px solid ${C.border}`, background: "#080E1C" }}>{rows.length} dòng</div>
    </div>
  );
}

function SQLBlock({ query: sql }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ margin: "8px 0", borderRadius: 7, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", background: "#080E1C", cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 10.5, color: C.textSub, fontFamily: "IBM Plex Mono,monospace" }}>▶ SQL</span>
        <button onClick={e => { e.stopPropagation(); copy(); }} style={{ fontSize: 10, color: copied ? C.greenDim : C.textSub, background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>{copied ? "✓ Đã chép" : "Sao chép"}</button>
      </div>
      {open && <pre style={{ margin: 0, padding: "10px 12px", background: "#05090F", color: "#A5D8FF", fontSize: 11, lineHeight: 1.65, fontFamily: "IBM Plex Mono,monospace", overflowX: "auto", whiteSpace: "pre-wrap" }}>{sql}</pre>}
    </div>
  );
}

function TypingDots({ label = "Đang phân tích & truy vấn..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, .2, .4].map((d, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.greenDim, animation: `bounce 1.2s ${d}s infinite` }} />)}
      </div>
      <span style={{ fontSize: 12, color: C.textSub, fontStyle: "italic" }}>{label}</span>
    </div>
  );
}

function ToolCard({ step }) {
  const icons = { execute_query: "🔍", list_tables: "🗃️", describe_table: "📋", get_database_overview: "📊" };
  const labels = { execute_query: "Truy vấn SQL", list_tables: "Liệt kê bảng", describe_table: "Mô tả bảng", get_database_overview: "Phân tích DB" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", background: "#080E1C", borderRadius: 7, border: `1px solid ${C.border}`, marginBottom: 4, fontSize: 11 }}>
      <span>{icons[step.name] || "⚙️"}</span>
      <span style={{ color: C.textSub }}>{labels[step.name] || step.name}</span>
      {step.input?.sql && <span style={{ color: C.textMut, fontFamily: "IBM Plex Mono,monospace", fontSize: 10 }}>{step.input.sql.slice(0, 45)}{step.input.sql.length > 45 ? "…" : ""}</span>}
      {step.input?.table_name && <span style={{ color: C.textMut, fontFamily: "IBM Plex Mono,monospace", fontSize: 10 }}>{step.input.table_name}</span>}
      <span style={{ marginLeft: "auto" }}>
        {!step.done ? <div style={{ width: 11, height: 11, borderRadius: "50%", border: `2px solid ${C.textMut}`, borderTopColor: "#3B82F6", animation: "spin .8s linear infinite" }} /> :
          step.success ? <span style={{ color: C.green, fontSize: 10.5 }}>✓ {step.rowCount !== undefined ? `${step.rowCount} dòng` : "OK"}</span> :
          <span style={{ color: "#F87171", fontSize: 10.5 }}>✗ Lỗi</span>}
      </span>
    </div>
  );
}

function MsgContent({ text }) {
  const parts = parseContent(text);
  return (
    <div>
      {parts.map((p, i) => {
        if (p.type === "text") return (
          <div key={i} style={{ lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {p.content.split("\n").map((ln, li) => <div key={li} style={{ minHeight: ln ? "auto" : ".5em" }}>{fmt(ln)}</div>)}
          </div>
        );
        if (p.type === "chart") return <BarChart key={i} data={p.data} />;
        if (p.type === "datatable") return <DataTable key={i} data={p.data} />;
        if (p.type === "sql") return <SQLBlock key={i} query={p.query} />;
        return null;
      })}
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Đăng nhập thất bại"); return; }
      localStorage.setItem("dl_token", d.token);
      localStorage.setItem("dl_user",  JSON.stringify(d.user));
      onLogin(d.user, d.token);
    } catch { setError("Không thể kết nối server."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,.05) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.04) 0%,transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#1A3A6B,#061230)", border: "1px solid rgba(59,130,246,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px" }}>⚡</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>DataLens</div>
          <div style={{ fontSize: 12.5, color: C.textSub }}>Enterprise Data Q&A Portal</div>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ background: C.sidebar, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11.5, color: C.textSub, display: "block", marginBottom: 6, letterSpacing: ".04em" }}>TÀI KHOẢN</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin hoặc user1"
              style={{ width: "100%", padding: "10px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "rgba(59,130,246,.5)"}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 11.5, color: C.textSub, display: "block", marginBottom: 6, letterSpacing: ".04em" }}>MẬT KHẨU</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password"
              style={{ width: "100%", padding: "10px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "rgba(59,130,246,.5)"}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
          {error && <div style={{ padding: "8px 12px", background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: 7, color: "#F87171", fontSize: 12.5, marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading || !username || !password}
            style={{ width: "100%", padding: "11px 0", background: loading || !username || !password ? "rgba(59,130,246,.3)" : "rgba(59,130,246,.9)", border: "1px solid rgba(59,130,246,.5)", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !username || !password ? "default" : "pointer" }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginTop: 16 }}>
          <div style={{ fontSize: 11, color: C.textSub, marginBottom: 8, letterSpacing: ".05em" }}>TÀI KHOẢN DEMO</div>
          {[{ user: "admin", pass: "password", role: "Admin", color: "#3B82F6" }, { user: "user1", pass: "password", role: "User", color: "#10B981" }].map(a => (
            <div key={a.user} onClick={() => { setUsername(a.user); setPassword(a.pass); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6, cursor: "pointer", marginBottom: 4, background: username === a.user ? `${a.color}15` : "transparent", transition: "all .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${a.color}10`}
              onMouseLeave={e => e.currentTarget.style.background = username === a.user ? `${a.color}15` : "transparent"}
            >
              <span style={{ fontSize: 14 }}>{a.role === "Admin" ? "🔑" : "👤"}</span>
              <span style={{ flex: 1, fontSize: 12, color: C.text }}>{a.user}</span>
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: `${a.color}20`, color: a.color }}>{a.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ token, onClose }) {
  const [users,       setUsers]       = useState([]);
  const [allTables,   setAllTables]   = useState([]);
  const [selUser,     setSelUser]     = useState(null);
  const [userPerms,   setUserPerms]   = useState([]);
  const [newUser,     setNewUser]     = useState({ username:"", email:"", password:"", role:"user", full_name:"" });
  const [tab,         setTab]         = useState("users");
  const [saving,      setSaving]      = useState(false);

  const hdr = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const loadUsers = async () => {
    const r = await fetch("/api/admin/users",       { headers: hdr }); setUsers(await r.json());
    const t = await fetch("/api/admin/all-tables",  { headers: hdr }); setAllTables(await t.json());
  };

  const loadPerms = async (uid) => {
    const r = await fetch(`/api/admin/permissions/${uid}`, { headers: hdr });
    setUserPerms(await r.json());
  };

  useEffect(() => { loadUsers(); }, []);

  const selectUser = (u) => { setSelUser(u); loadPerms(u.id); };

  const toggleTable = async (tbl) => {
    if (!selUser) return;
    const exists = userPerms.find(p => p.table_name === tbl.name);
    if (exists) {
      await fetch(`/api/admin/permissions/${exists.id}`, { method: "DELETE", headers: hdr });
      setUserPerms(p => p.filter(x => x.table_name !== tbl.name));
    } else {
      const r = await fetch("/api/admin/permissions", { method: "POST", headers: hdr, body: JSON.stringify({ user_id: selUser.id, table_name: tbl.name, domain: tbl.schema }) });
      const d = await r.json();
      setUserPerms(p => [...p, d]);
    }
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.password) return;
    setSaving(true);
    const r = await fetch("/api/admin/users", { method: "POST", headers: hdr, body: JSON.stringify(newUser) });
    if (r.ok) { await loadUsers(); setNewUser({ username:"", email:"", password:"", role:"user", full_name:"" }); }
    setSaving(false);
  };

  const toggleActive = async (u) => {
    await fetch(`/api/admin/users/${u.id}`, { method: "PATCH", headers: hdr, body: JSON.stringify({ is_active: !u.is_active }) });
    await loadUsers();
  };

  const inp = { padding: "8px 10px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontSize: 12.5, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ width: "90%", maxWidth: 900, maxHeight: "90vh", background: C.sidebar, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚙️</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Admin Panel</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setTab("users")} style={{ padding: "5px 14px", borderRadius: 6, background: tab === "users" ? "rgba(59,130,246,.15)" : "transparent", border: `1px solid ${tab === "users" ? "rgba(59,130,246,.3)" : C.border}`, color: tab === "users" ? "#60A5FA" : C.textSub, fontSize: 12, cursor: "pointer" }}>👥 Người dùng</button>
          <button onClick={() => setTab("perms")} style={{ padding: "5px 14px", borderRadius: 6, background: tab === "perms" ? "rgba(59,130,246,.15)" : "transparent", border: `1px solid ${tab === "perms" ? "rgba(59,130,246,.3)" : C.border}`, color: tab === "perms" ? "#60A5FA" : C.textSub, fontSize: 12, cursor: "pointer" }}>🔐 Phân quyền</button>
          <button onClick={onClose} style={{ padding: "5px 10px", borderRadius: 6, background: "none", border: `1px solid ${C.border}`, color: C.textSub, fontSize: 13, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {tab === "users" && (
            <div>
              {/* Tạo user mới */}
              <div style={{ background: C.card, borderRadius: 10, padding: 16, marginBottom: 20, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 12, letterSpacing: ".05em" }}>TẠO NGƯỜI DÙNG MỚI</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
                  <div><div style={{ fontSize: 10.5, color: C.textSub, marginBottom: 4 }}>Username</div><input style={inp} value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} placeholder="username" /></div>
                  <div><div style={{ fontSize: 10.5, color: C.textSub, marginBottom: 4 }}>Email</div><input style={inp} value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="email@company.vn" /></div>
                  <div><div style={{ fontSize: 10.5, color: C.textSub, marginBottom: 4 }}>Password</div><input style={inp} type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="mật khẩu" /></div>
                  <div><div style={{ fontSize: 10.5, color: C.textSub, marginBottom: 4 }}>Role</div>
                    <select style={{ ...inp }} value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                      <option value="user">user</option><option value="admin">admin</option>
                    </select>
                  </div>
                  <button onClick={createUser} disabled={saving} style={{ padding: "9px 16px", background: "rgba(59,130,246,.85)", border: "1px solid rgba(59,130,246,.4)", borderRadius: 7, color: "#fff", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>+ Tạo</button>
                </div>
              </div>

              {/* Danh sách users */}
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead><tr style={{ background: "#080E1C" }}>
                    {["Username","Email","Họ tên","Role","Trạng thái","Quyền bảng","Thao tác"].map(h => <th key={h} style={{ padding: "9px 12px", textAlign: "left", color: C.textSub, fontSize: 10.5, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="hover-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "9px 12px", color: C.text, fontWeight: 600 }}>{u.username}</td>
                        <td style={{ padding: "9px 12px", color: C.textSub }}>{u.email}</td>
                        <td style={{ padding: "9px 12px", color: C.text }}>{u.full_name}</td>
                        <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10.5, background: u.role === "admin" ? "rgba(59,130,246,.15)" : "rgba(16,185,129,.1)", color: u.role === "admin" ? "#60A5FA" : "#34D399" }}>{u.role}</span></td>
                        <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10.5, background: u.is_active ? "rgba(34,197,94,.1)" : "rgba(248,113,113,.1)", color: u.is_active ? C.green : "#F87171" }}>{u.is_active ? "Hoạt động" : "Khóa"}</span></td>
                        <td style={{ padding: "9px 12px", color: C.textSub }}>{u.role === "admin" ? "Tất cả" : u.permission_count + " bảng"}</td>
                        <td style={{ padding: "9px 12px" }}>
                          <button onClick={() => toggleActive(u)} style={{ padding: "3px 8px", borderRadius: 5, background: "none", border: `1px solid ${C.border}`, color: C.textSub, fontSize: 11, cursor: "pointer", marginRight: 4 }}>{u.is_active ? "Khóa" : "Mở"}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "perms" && (
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
              {/* Chọn user */}
              <div style={{ background: C.card, borderRadius: 10, padding: 12, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.textSub, marginBottom: 10, letterSpacing: ".05em" }}>CHỌN USER</div>
                {users.filter(u => u.role === "user").map(u => (
                  <div key={u.id} onClick={() => selectUser(u)} style={{ padding: "8px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 4, background: selUser?.id === u.id ? "rgba(59,130,246,.12)" : "transparent", border: `1px solid ${selUser?.id === u.id ? "rgba(59,130,246,.3)" : "transparent"}` }}>
                    <div style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{u.username}</div>
                    <div style={{ fontSize: 10.5, color: C.textSub }}>{u.permission_count} bảng được phép</div>
                  </div>
                ))}
              </div>

              {/* Phân quyền bảng */}
              <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
                {!selUser ? (
                  <div style={{ color: C.textMut, fontSize: 13, textAlign: "center", paddingTop: 40 }}>← Chọn user để phân quyền</div>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: C.textSub, marginBottom: 12 }}>
                      Phân quyền chatbot cho <strong style={{ color: C.text }}>{selUser.username}</strong> — tick vào bảng được phép query:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                      {allTables.map(t => {
                        const checked = userPerms.some(p => p.table_name === t.name);
                        return (
                          <div key={t.name} onClick={() => toggleTable(t)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, cursor: "pointer", background: checked ? "rgba(16,185,129,.08)" : "rgba(0,0,0,.2)", border: `1px solid ${checked ? "rgba(16,185,129,.3)" : C.border}`, transition: "all .12s" }}>
                            <div style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${checked ? "#10B981" : C.textMut}`, background: checked ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {checked && <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>✓</span>}
                            </div>
                            <div>
                              <div style={{ fontSize: 11.5, color: checked ? C.text : C.textSub }}>{t.name}</div>
                              <div style={{ fontSize: 9.5, color: C.textMut }}>{t.type === "VIEW" ? "View" : `${t.column_count} cột`}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN CHAT APP ────────────────────────────────────────────────────────────
function ChatApp({ user, token, onLogout }) {
  const [sessions,       setSessions]       = useState([]);
  const [activeSessId,   setActiveSessId]   = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [toolSteps,      setToolSteps]      = useState({});
  const [input,          setInput]          = useState("");
  const [isStreaming,    setIsStreaming]     = useState(false);
  const [activeDomainId, setActiveDomainId] = useState("crm");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [sidebarTab,     setSidebarTab]     = useState("schema");  // schema | saved | history
  const [domainDropOpen, setDomainDropOpen] = useState(false);
  const [schemaSearch,   setSchemaSearch]   = useState("");
  const [dbStatus,       setDbStatus]       = useState("checking");
  const [aiProvider,     setAiProvider]     = useState("groq");  // claude | groq
  const [showAdmin,      setShowAdmin]      = useState(false);
  const [streamMsgId,    setStreamMsgId]    = useState(null);

  const messagesEnd = useRef(null);
  const inputRef    = useRef(null);
  const abortRef    = useRef(null);
  const hdr = useCallback(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);

  const domain = DOMAINS.find(d => d.id === activeDomainId) || DOMAINS[0];

  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(d => setDbStatus(d.status === "ok" ? "ok" : "error")).catch(() => setDbStatus("error"));
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const r = await fetch("/api/sessions", { headers: hdr() });
    if (r.ok) setSessions(await r.json());
  };

  const newSession = async () => {
    const r = await fetch("/api/sessions", { method: "POST", headers: hdr() });
    if (r.ok) {
      const s = await r.json();
      setSessions(prev => [s, ...prev]);
      setActiveSessId(s.id); setMessages([]); setToolSteps({});
    }
  };

  const switchSession = async (id) => {
    if (id === activeSessId) return;
    setActiveSessId(id); setMessages([]); setToolSteps({});
    const r = await fetch(`/api/sessions/${id}/messages`, { headers: hdr() });
    if (r.ok) setMessages(await r.json());
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    await fetch(`/api/sessions/${id}`, { method: "DELETE", headers: hdr() });
    setSessions(p => p.filter(s => s.id !== id));
    if (activeSessId === id) { setActiveSessId(null); setMessages([]); setToolSteps({}); }
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;
    setInput("");

    let sessionId = activeSessId;
    if (!sessionId) { const r = await fetch("/api/sessions", { method: "POST", headers: hdr() }); if (r.ok) { const s = await r.json(); setSessions(p => [s, ...p]); sessionId = s.id; setActiveSessId(s.id); } else return; }

    const userMsg = { id: `u-${Date.now()}`, role: "user", content: msg, created_at: new Date().toISOString() };
    const aId = `a-${Date.now()}`;
    setMessages(p => [...p, userMsg, { id: aId, role: "assistant", content: "", isLoading: true, loadingLabel: "Đang phân tích...", created_at: new Date().toISOString() }]);
    setStreamMsgId(aId); setIsStreaming(true);

    const steps = []; const stepsMap = {};
    try {
      const ctrl = new AbortController(); abortRef.current = ctrl;
      const resp = await fetch("/api/chat", { method: "POST", headers: hdr(), body: JSON.stringify({ sessionId, message: msg, aiProvider }), signal: ctrl.signal });
      const reader = resp.body.getReader(); const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let ev; try { ev = JSON.parse(line.slice(6)); } catch { continue; }
          if (ev.type === "thinking") setMessages(p => p.map(m => m.id === aId ? { ...m, isLoading: true, loadingLabel: ev.message } : m));
          if (ev.type === "tool_use") { const st = { id: ev.id, name: ev.name, input: ev.input, done: false }; stepsMap[ev.id] = steps.length; steps.push(st); setToolSteps(p => ({ ...p, [aId]: [...steps] })); }
          if (ev.type === "tool_result") { const idx = stepsMap[ev.id]; if (idx !== undefined) { steps[idx] = { ...steps[idx], done: true, success: ev.success, rowCount: ev.rowCount }; setToolSteps(p => ({ ...p, [aId]: [...steps] })); } }
          if (ev.type === "text") setMessages(p => p.map(m => m.id === aId ? { ...m, content: (m.content || "") + ev.text, isLoading: false } : m));
          if (ev.type === "title_updated") setSessions(p => p.map(s => s.id === sessionId ? { ...s, title: ev.title } : s));
          if (ev.type === "done") setMessages(p => p.map(m => m.id === aId ? { ...m, isLoading: false } : m));
          if (ev.type === "error") setMessages(p => p.map(m => m.id === aId ? { ...m, content: `⚠️ ${ev.error}`, isLoading: false } : m));
        }
      }
    } catch(e) {
      if (e.name !== "AbortError") setMessages(p => p.map(m => m.id === aId ? { ...m, content: "⚠️ Không thể kết nối server.", isLoading: false } : m));
    } finally { setIsStreaming(false); setStreamMsgId(null); abortRef.current = null; loadSessions(); }
  };

  const filteredTables = domain.tables.filter(t => t.name.includes(schemaSearch.toLowerCase()));
  const tbCount   = filteredTables.filter(t => t.type === "table").length;
  const viewCount = filteredTables.filter(t => t.type === "view").length;

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${domain.colorLight} 0%,transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.03) 0%,transparent 70%)" }} />
      </div>

      {/* ── SIDEBAR ────────────────────────────────────────────── */}
      <aside style={{ width: sidebarOpen ? 296 : 0, flexShrink: 0, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden", transition: "width .25s ease", zIndex: 10 }}>
        <div style={{ width: 296, height: "100%", display: "flex", flexDirection: "column" }}>

          {/* Logo */}
          <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#1A3A6B,#061230)", border: `1px solid ${domain.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>DataLens</div>
              <div style={{ fontSize: 9.5, color: C.textSub }}>Enterprise Data Q&A</div>
            </div>
          </div>

          {/* Domain selector */}
          <div style={{ padding: "10px 12px 6px", position: "relative" }}>
            <div style={{ fontSize: 9.5, color: C.textMut, letterSpacing: ".08em", marginBottom: 6 }}>DOMAIN</div>
            <button onClick={() => setDomainDropOpen(o => !o)} style={{ width: "100%", padding: "9px 12px", background: domain.colorLight, border: `1px solid ${domain.colorBorder}`, borderRadius: 9, display: "flex", alignItems: "center", gap: 9, cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>{domain.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: domain.color }}>{domain.name}</div>
                <div style={{ fontSize: 10, color: C.textSub }}>{domain.fullName}</div>
              </div>
              <span style={{ fontSize: 10, color: C.textSub, transform: domainDropOpen ? "rotate(180deg)" : "none", transition: ".15s" }}>▼</span>
            </button>
            {domainDropOpen && (
              <div style={{ position: "absolute", top: "100%", left: 12, right: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, zIndex: 20, overflow: "hidden" }}>
                {DOMAINS.filter(d => d.id !== activeDomainId).map(d => (
                  <div key={d.id} onClick={() => { setActiveDomainId(d.id); setDomainDropOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", cursor: "pointer", borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = d.colorLight}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 15 }}>{d.icon}</span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: d.color }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: C.textSub }}>{d.fullName}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs: Schema / Saved / History */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 12px" }}>
            {[{ id: "schema", label: "Schema", icon: "◆" }, { id: "history", label: "Lịch sử", icon: "○" }].map(t => (
              <button key={t.id} onClick={() => setSidebarTab(t.id)} className="tab-btn" style={{ flex: 1, padding: "8px 4px", background: "none", border: "none", borderBottom: `2px solid ${sidebarTab === t.id ? domain.color : "transparent"}`, color: sidebarTab === t.id ? domain.color : C.textSub, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontWeight: 600 }}>
                <span style={{ fontSize: 10 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* Schema tab */}
          {sidebarTab === "schema" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
              <input value={schemaSearch} onChange={e => setSchemaSearch(e.target.value)} placeholder="🔍 Tìm bảng..." style={{ width: "100%", padding: "6px 10px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
              <div style={{ fontSize: 10, color: C.textMut, marginBottom: 8, letterSpacing: ".06em" }}>{tbCount} TABLES · {viewCount} VIEWS</div>
              {filteredTables.map(t => (
                <div key={t.name} className="tbl-row" onClick={() => sendMessage(`Mô tả cấu trúc bảng ${t.name}`)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: t.type === "view" ? `${domain.colorLight}` : "rgba(255,255,255,.06)", color: t.type === "view" ? domain.color : C.textSub, fontFamily: "IBM Plex Mono,monospace", fontWeight: 700, letterSpacing: ".04em", flexShrink: 0 }}>{t.type === "view" ? "VW" : "TB"}</span>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: C.textMut }}>{t.cols} cols · {t.rows}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History tab */}
          {sidebarTab === "history" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
              <button onClick={newSession} style={{ width: "100%", padding: "7px 10px", background: `${domain.colorLight}`, border: `1px solid ${domain.colorBorder}`, borderRadius: 7, color: domain.color, fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>+ Chat mới</button>
              {sessions.map(s => (
                <div key={s.id} onClick={() => switchSession(s.id)} className="sidebar-sess" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 8px", borderRadius: 7, marginBottom: 2, cursor: "pointer", background: activeSessId === s.id ? `${domain.colorLight}` : "transparent", border: `1px solid ${activeSessId === s.id ? domain.colorBorder : "transparent"}` }}>
                  <span style={{ fontSize: 11, color: C.textMut, flexShrink: 0 }}>💬</span>
                  <span style={{ flex: 1, fontSize: 11.5, color: activeSessId === s.id ? C.text : C.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                  <button onClick={e => deleteSession(s.id, e)} className="sess-del" style={{ width: 16, height: 16, borderRadius: 4, background: "none", border: "none", cursor: "pointer", color: C.textMut, fontSize: 11, opacity: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* DB Footer */}
          <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: dbStatus === "ok" ? C.green : "#F87171", animation: dbStatus === "checking" ? "pulse 1.5s infinite" : "none" }} />
            <span style={{ fontSize: 10.5, color: C.textSub }}>PostgreSQL · schema: {domain.id === "hr" ? "hr" : domain.id}</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 1 }}>

        {/* Topbar */}
        <header style={{ height: 48, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 14px", borderBottom: `1px solid ${C.border}`, background: "rgba(6,11,24,.85)", backdropFilter: "blur(10px)", gap: 8 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ width: 28, height: 28, borderRadius: 6, background: "none", border: `1px solid ${C.border}`, color: C.textSub, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>◄</button>

          {/* Domain tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {DOMAINS.map(d => (
              <button key={d.id} onClick={() => setActiveDomainId(d.id)} className="domain-btn" style={{ padding: "4px 12px", borderRadius: 6, background: activeDomainId === d.id ? d.colorLight : "transparent", border: `1px solid ${activeDomainId === d.id ? d.colorBorder : "transparent"}`, color: activeDomainId === d.id ? d.color : C.textSub, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: activeDomainId === d.id ? 600 : 400 }}>
                <span style={{ fontSize: 13 }}>{d.icon}</span>{d.name}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* AI toggle */}
          <div style={{ display: "flex", gap: 3, background: C.card, padding: 3, borderRadius: 7, border: `1px solid ${C.border}` }}>
            {[{ id: "groq", label: "Groq", color: "#F59E0B" }, { id: "claude", label: "Claude", color: "#8B5CF6" }].map(a => (
              <button key={a.id} onClick={() => setAiProvider(a.id)} style={{ padding: "3px 10px", borderRadius: 5, background: aiProvider === a.id ? `${a.color}20` : "transparent", border: `1px solid ${aiProvider === a.id ? `${a.color}40` : "transparent"}`, color: aiProvider === a.id ? a.color : C.textSub, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{a.label}</button>
            ))}
          </div>

          {/* New chat */}
          <button onClick={newSession} style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: `1px solid ${C.border}`, color: C.textSub, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>+ Mới</button>

          {/* Admin button */}
          {user.role === "admin" && (
            <button onClick={() => setShowAdmin(true)} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.2)", color: "#60A5FA", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⚙️</button>
          )}

          {/* User avatar */}
          <div onClick={onLogout} title="Đăng xuất" style={{ width: 28, height: 28, borderRadius: "50%", background: `${domain.colorLight}`, border: `1px solid ${domain.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: domain.color, cursor: "pointer", fontWeight: 700 }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }} onClick={() => setDomainDropOpen(false)}>
          {messages.length === 0 ? (
            /* Empty state */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "8vh" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg,${domain.color}30,${domain.color}05)`, border: `1px solid ${domain.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 18, boxShadow: `0 0 30px ${domain.color}20` }}>{domain.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6 }}>{domain.name}</div>
              <div style={{ fontSize: 13.5, color: C.textSub, marginBottom: 28, textAlign: "center", maxWidth: 400 }}>{domain.fullName} — Hỏi tôi về dữ liệu của bạn</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, maxWidth: 560, width: "100%" }}>
                {domain.suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.text)} className="suggestion-btn" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 11px", borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.textSub, cursor: "pointer", textAlign: "left", fontSize: 12, lineHeight: 1.4 }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span><span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {messages.map(msg => (
                <div key={msg.id} className="msg-anim">
                  {msg.role === "user" ? (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                      <div style={{ maxWidth: "72%", padding: "10px 14px", background: `linear-gradient(135deg,${domain.color}30,${domain.color}10)`, borderRadius: "14px 14px 3px 14px", border: `1px solid ${domain.colorBorder}`, fontSize: 13.5, lineHeight: 1.65, color: C.text, whiteSpace: "pre-wrap" }}>{msg.content}</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 10, marginBottom: 18, maxWidth: "92%" }}>
                      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: `${domain.colorLight}`, border: `1px solid ${domain.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginTop: 2 }}>{domain.icon}</div>
                      <div style={{ flex: 1 }}>
                        {/* Domain badge */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 20, background: `${domain.colorLight}`, border: `1px solid ${domain.colorBorder}`, fontSize: 10.5, color: domain.color, marginBottom: 6 }}>
                          {domain.icon} {domain.name}
                        </div>
                        {/* Tool steps */}
                        {toolSteps[msg.id]?.length > 0 && (
                          <div style={{ marginBottom: 8 }}>{toolSteps[msg.id].map((st, i) => <ToolCard key={i} step={st} />)}</div>
                        )}
                        {/* Content */}
                        <div style={{ padding: "11px 14px", background: C.card, borderRadius: "3px 12px 12px 12px", border: `1px solid ${C.border}`, fontSize: 13, color: C.text }}>
                          {msg.isLoading ? <TypingDots label={msg.loadingLabel} /> : <MsgContent text={msg.content} />}
                        </div>
                        {/* Timestamp + AI badge */}
                        {!msg.isLoading && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginLeft: 4 }}>
                            {msg.created_at && <span style={{ fontSize: 10, color: C.textMut }}>{new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>}
                            <span style={{ fontSize: 9.5, color: C.textMut, padding: "1px 6px", borderRadius: 10, border: `1px solid ${C.border}` }}>{aiProvider === "groq" ? "Groq · llama-3.3-70b" : "Claude · claude-opus-4-6"}</span>
                            <span style={{ fontSize: 9.5, color: C.textMut }}>Read-only · Domain: {activeDomainId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEnd} style={{ height: 16 }} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{ flexShrink: 0, padding: "10px 20px 14px", borderTop: `1px solid ${C.border}`, background: "rgba(6,11,24,.9)", backdropFilter: "blur(10px)" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "9px 11px", transition: "border-color .2s" }}
              onFocusCapture={e => e.currentTarget.style.borderColor = domain.colorBorder}
              onBlurCapture={e => e.currentTarget.style.borderColor = C.border}
            >
              {/* Domain pill */}
              <div style={{ flexShrink: 0, padding: "3px 8px", borderRadius: 6, background: domain.colorLight, border: `1px solid ${domain.colorBorder}`, fontSize: 10.5, color: domain.color, display: "flex", alignItems: "center", gap: 4, alignSelf: "flex-end", marginBottom: 1 }}>
                {domain.icon} {domain.name}
              </div>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={domain.placeholder} disabled={isStreaming} rows={1}
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.text, fontSize: 13.5, resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", fontFamily: "DM Sans,system-ui,sans-serif", caretColor: domain.color }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              />
              {isStreaming
                ? <button onClick={() => abortRef.current?.abort()} style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 7, background: "rgba(248,113,113,.15)", border: "1px solid rgba(248,113,113,.3)", cursor: "pointer", color: "#F87171", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>■</button>
                : <button onClick={() => sendMessage()} disabled={!input.trim()} style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 7, background: input.trim() ? domain.color : "transparent", border: `1px solid ${input.trim() ? domain.colorBorder : C.border}`, cursor: input.trim() ? "pointer" : "default", color: input.trim() ? "#fff" : C.textMut, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>↑</button>
              }
            </div>
            <div style={{ fontSize: 10.5, color: C.textMut, textAlign: "center", marginTop: 5 }}>
              {aiProvider === "groq" ? "Groq · Llama 3.3 70B" : "Claude Sonnet"} · Read-only · Domain: {activeDomainId} · Kết quả tham khảo
            </div>
          </div>
        </div>
      </main>

      {/* Admin panel modal */}
      {showAdmin && <AdminPanel token={token} onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem("dl_user")); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem("dl_token") || null);

  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", { method: "POST", headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => setUser(d.user))
        .catch(() => { setUser(null); setToken(null); localStorage.removeItem("dl_token"); localStorage.removeItem("dl_user"); });
    }
  }, []);

  const login = (u, t) => { setUser(u); setToken(t); };
  const logout = () => { setUser(null); setToken(null); localStorage.removeItem("dl_token"); localStorage.removeItem("dl_user"); };

  if (!user || !token) return <LoginPage onLogin={login} />;
  return <ChatApp user={user} token={token} onLogout={logout} />;
}

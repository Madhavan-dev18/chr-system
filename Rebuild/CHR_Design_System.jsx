import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg: "#E8ECF4",
  surface: "#EEF0F8",
  card: "#F2F4FA",
  shadowD: "rgba(163,177,198,0.6)",
  shadowL: "rgba(255,255,255,0.9)",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.12)",
  red: "#E84545",
  blue: "#4A90D9",
  blueSoft: "rgba(74,144,217,0.12)",
  green: "#27AE60",
  greenSoft: "rgba(39,174,96,0.12)",
  yellow: "#F39C12",
  purple: "#8E44AD",
  textDark: "#1E2035",
  textMid: "#5A5A7A",
  textLight: "#9898B8",
  white: "#FFFFFF",
};

const neu = (depth = 6) =>
  `${depth}px ${depth}px ${depth * 2}px ${T.shadowD}, -${depth}px -${depth}px ${depth * 2}px ${T.shadowL}`;
const neuInset = (depth = 4) =>
  `inset ${depth}px ${depth}px ${depth * 2}px ${T.shadowD}, inset -${depth}px -${depth}px ${depth * 2}px ${T.shadowL}`;
const neuPressed = () =>
  `inset 3px 3px 7px ${T.shadowD}, inset -3px -3px 7px ${T.shadowL}`;

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.bg}; font-family: 'DM Sans', sans-serif; color: ${T.textDark}; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${T.bg}; }
    ::-webkit-scrollbar-thumb { background: ${T.shadowD}; border-radius: 3px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.05); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-12px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
    .fade-up { animation: fadeUp 0.4s ease both; }
    .slide-in { animation: slideIn 0.3s ease both; }
    .neu-card {
      background: ${T.card};
      border-radius: 16px;
      box-shadow: ${neu(6)};
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .neu-card:hover { box-shadow: ${neu(8)}; transform: translateY(-1px); }
    .neu-btn {
      background: ${T.card};
      border: none; cursor: pointer;
      box-shadow: ${neu(4)};
      transition: all 0.15s ease;
      font-family: 'DM Sans', sans-serif;
    }
    .neu-btn:hover { box-shadow: ${neu(6)}; }
    .neu-btn:active { box-shadow: ${neuPressed()}; transform: scale(0.98); }
    .neu-inset {
      background: ${T.bg};
      box-shadow: ${neuInset(4)};
      border-radius: 12px;
    }
    .tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 999px;
      font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
    }
  `}</style>
);

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

const NeuCard = ({ children, style = {}, className = "", onClick }) => (
  <div className={`neu-card ${className}`} style={style} onClick={onClick}>
    {children}
  </div>
);

const NeuBtn = ({ children, style = {}, onClick, accent = false, small = false }) => (
  <button
    className="neu-btn"
    onClick={onClick}
    style={{
      padding: small ? "6px 14px" : "10px 20px",
      borderRadius: "10px",
      fontSize: small ? 11 : 13,
      fontWeight: 600,
      color: accent ? T.white : T.textDark,
      background: accent ? T.accent : T.card,
      boxShadow: accent ? `0 4px 14px rgba(255,107,53,0.35)` : neu(4),
      letterSpacing: "0.2px",
      ...style,
    }}
  >
    {children}
  </button>
);

const Tag = ({ label, color, bg }) => (
  <span className="tag" style={{ background: bg || T.accentSoft, color: color || T.accent }}>
    {label}
  </span>
);

const Avatar = ({ name = "A", size = 36, color = T.accent }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, display: "flex", alignItems: "center",
      justifyContent: "center", color: T.white,
      fontSize: size * 0.36, fontWeight: 700,
      boxShadow: `0 2px 8px rgba(0,0,0,0.15)`, flexShrink: 0,
    }}>{initials}</div>
  );
};

const Icon = ({ d, size = 16, color = T.textMid, fill = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={fill ? color : "none"} stroke={fill ? "none" : color}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// Icon paths
const ICONS = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  calendar: "M8 2v4 M16 2v4 M3 10h18 M21 8H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V10a2 2 0 00-2-2z",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  plus: "M12 5v14 M5 12h14",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  chart: "M18 20V10 M12 20V4 M6 20v-6",
  pill: "M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h6.5 M13.5 4H20a2 2 0 012 2v12a2 2 0 01-2 2h-6.5 M8 12h8",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 110-6 3 3 0 010 6",  
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  brain: "M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7H4a2 2 0 00-2 2v2c0 1.1.9 2 2 2h.5A2.5 2.5 0 017 15.5v0A2.5 2.5 0 019.5 18h5a2.5 2.5 0 002.5-2.5v0a2.5 2.5 0 012.5-2.5H20a2 2 0 002-2V9a2 2 0 00-2-2h-.5A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0114.5 2z",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18 M6 6l12 12",
  chevronR: "M9 18l6-6-6-6",
  chevronD: "M6 9l6 6 6-6",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8",
  droplet: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
  thermo: "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
  wind: "M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2",
  flask: "M9 3h6m-6 0a1 1 0 000 2h6a1 1 0 000-2M9 3v2m6-2v2m-9 2h12l2 14H4L6 7z",
  stethoscope: "M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 100 .3 M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4",
  alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z",
};

// ─── MINI CHART COMPONENTS ────────────────────────────────────────────────────

const SparkLine = ({ data, color = T.accent, height = 40, width = 120 }) => {
  const min = Math.min(...data), max = Math.max(...data);
  const norm = v => height - ((v - min) / (max - min + 1)) * (height - 8) - 4;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${norm(v)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill={`url(#sg${color.replace("#","")})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={norm(data[data.length - 1])}
        r="3" fill={color} />
    </svg>
  );
};

const DonutChart = ({ segments, size = 100 }) => {
  const r = size * 0.36;
  const cx = size / 2, cy = size / 2;
  const total = segments.reduce((a, b) => a + b.value, 0);
  let angle = -90;
  const paths = segments.map(seg => {
    const sweep = (seg.value / total) * 360;
    const start = angle, end = angle + sweep;
    angle += sweep;
    const s = { x: cx + r * Math.cos((start * Math.PI) / 180), y: cy + r * Math.sin((start * Math.PI) / 180) };
    const e = { x: cx + r * Math.cos((end * Math.PI) / 180), y: cy + r * Math.sin((end * Math.PI) / 180) };
    const large = sweep > 180 ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`, color: seg.color, label: seg.label, pct: Math.round(seg.value / total * 100) };
  });
  return (
    <svg width={size} height={size} style={{ filter: `drop-shadow(3px 3px 6px ${T.shadowD}) drop-shadow(-2px -2px 4px ${T.shadowL})` }}>
      <defs>
        <radialGradient id="donut-inner">
          <stop offset="0%" stopColor={T.card} />
          <stop offset="100%" stopColor={T.bg} />
        </radialGradient>
      </defs>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} opacity={0.9} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.6} fill="url(#donut-inner)" />
    </svg>
  );
};

const VitalGauge = ({ value, max, color, label, unit }) => {
  const pct = Math.min(value / max, 1);
  const r = 28, cx = 36, cy = 36;
  const circumference = 2 * Math.PI * r;
  const strokeDash = circumference * pct;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={72} height={72}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.shadowD} strokeWidth={6} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="12" fontWeight="700" fill={T.textDark}>{value}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fill={T.textLight}>{unit}</text>
      </svg>
      <span style={{ fontSize: 10, color: T.textLight, fontWeight: 500 }}>{label}</span>
    </div>
  );
};

const ProgressBar = ({ value, max, color = T.accent, height = 6 }) => (
  <div style={{ background: T.bg, borderRadius: 999, height, boxShadow: neuInset(2), overflow: "hidden" }}>
    <div style={{
      width: `${(value / max) * 100}%`, height: "100%",
      background: `linear-gradient(90deg, ${color}, ${color}CC)`,
      borderRadius: 999, transition: "width 0.8s ease",
    }} />
  </div>
);

// ─── SIDEBAR NAV ──────────────────────────────────────────────────────────────

const Sidebar = ({ active, setActive, role }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.home },
    { id: "patients", label: "Patients", icon: ICONS.users },
    { id: "appointments", label: "Appointments", icon: ICONS.calendar },
    { id: "records", label: "Records", icon: ICONS.file },
    { id: "vitals", label: "Vitals", icon: ICONS.activity },
    { id: "ai", label: "AI Assistant", icon: ICONS.brain },
    { id: "audit", label: "Audit Log", icon: ICONS.shield },
    { id: "settings", label: "Settings", icon: ICONS.settings },
  ];

  const roleColors = { ADMIN: T.red, DOCTOR: T.blue, NURSE: T.green, PATIENT: T.purple };

  return (
    <div style={{
      width: 220, height: "100%", background: T.card,
      boxShadow: `6px 0 20px ${T.shadowD}`,
      display: "flex", flexDirection: "column", padding: "24px 16px",
      gap: 4, flexShrink: 0, position: "relative", zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, paddingLeft: 4 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: T.accent, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 12px rgba(255,107,53,0.4)`,
        }}>
          <Icon d={ICONS.heart} size={18} color={T.white} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.textDark, letterSpacing: -0.3 }}>CHR</div>
          <div style={{ fontSize: 9, color: T.textLight, fontWeight: 500, letterSpacing: 0.8 }}>HEALTH SYSTEM</div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{
        background: T.bg, borderRadius: 10, padding: "8px 12px",
        boxShadow: neuInset(3), marginBottom: 16,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: roleColors[role] || T.accent }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: T.textMid }}>{role} ACCESS</span>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 12, border: "none",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                background: isActive ? T.accent : "transparent",
                color: isActive ? T.white : T.textMid,
                boxShadow: isActive ? `0 4px 12px rgba(255,107,53,0.35)` : "none",
                transition: "all 0.15s ease",
              }}>
              <Icon d={item.icon} size={16} color={isActive ? T.white : T.textLight} />
              {item.label}
              {item.id === "ai" && (
                <span style={{ marginLeft: "auto", background: T.green, borderRadius: 999,
                  padding: "1px 6px", fontSize: 9, color: T.white, fontWeight: 700 }}>NEW</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User profile */}
      <div style={{
        background: T.bg, borderRadius: 12, padding: "10px 12px",
        boxShadow: neuInset(3), display: "flex", alignItems: "center", gap: 10,
      }}>
        <Avatar name="Madhavan S" size={32} color={T.blue} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Madhavan S.</div>
          <div style={{ fontSize: 10, color: T.textLight }}>Dr. Cardiologist</div>
        </div>
        <Icon d={ICONS.logout} size={14} color={T.textLight} />
      </div>
    </div>
  );
};

// ─── TOP BAR ─────────────────────────────────────────────────────────────────

const TopBar = ({ title, subtitle, onSearch }) => {
  const [search, setSearch] = useState("");
  return (
    <div style={{
      height: 72, background: T.card, display: "flex",
      alignItems: "center", padding: "0 28px", gap: 16,
      boxShadow: `0 4px 16px ${T.shadowD}`, zIndex: 9, flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.textDark, letterSpacing: -0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.textLight }}>{subtitle}</div>}
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: T.bg, borderRadius: 12, padding: "8px 14px",
        boxShadow: neuInset(3), width: 220,
      }}>
        <Icon d={ICONS.search} size={14} color={T.textLight} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search patients, records..."
          style={{ border: "none", background: "transparent", outline: "none",
            fontSize: 12, color: T.textDark, flex: 1, fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* Notif */}
      <div style={{ position: "relative" }}>
        <div className="neu-btn" style={{ width: 40, height: 40, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon d={ICONS.bell} size={16} color={T.textMid} />
        </div>
        <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8,
          borderRadius: "50%", background: T.red, border: `2px solid ${T.card}` }} />
      </div>

      <Avatar name="Madhavan S" size={38} color={T.blue} />
    </div>
  );
};

// ─── SCREEN 1: DASHBOARD ──────────────────────────────────────────────────────

const DashboardScreen = () => {
  const [toggle, setToggle] = useState(true);
  const vitalsData = [72, 75, 71, 78, 74, 76, 73, 77, 75, 72, 74, 76];
  const bpData = [120, 118, 122, 115, 119, 121, 117, 120, 116, 118, 120, 119];

  const stats = [
    { label: "Total Patients", value: "1,284", change: "+12", color: T.blue, icon: ICONS.users },
    { label: "Today's Appts", value: "24", change: "+3", color: T.green, icon: ICONS.calendar },
    { label: "Pending Records", value: "7", change: "-2", color: T.yellow, icon: ICONS.file },
    { label: "Critical Alerts", value: "2", change: "+1", color: T.red, icon: ICONS.alert },
  ];

  const recentPatients = [
    { name: "Priya Nair", age: 34, condition: "Hypertension", status: "Stable", color: T.green },
    { name: "Karthik R.", age: 52, condition: "Diabetes T2", status: "Review", color: T.yellow },
    { name: "Ananya M.", age: 28, condition: "Asthma", status: "Critical", color: T.red },
    { name: "Rajan S.", age: 67, condition: "Cardiac", status: "Stable", color: T.green },
  ];

  const donutSegments = [
    { label: "Cardiology", value: 35, color: T.accent },
    { label: "Neurology", value: 25, color: T.blue },
    { label: "General", value: 25, color: T.green },
    { label: "Other", value: 15, color: T.shadowD },
  ];

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flex: 1 }} className="fade-up">

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {stats.map((s, i) => (
          <NeuCard key={i} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.textLight, fontWeight: 500, marginBottom: 6, letterSpacing: 0.5 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.textDark, letterSpacing: -1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: s.change.startsWith("+") ? T.green : T.red, fontWeight: 600, marginTop: 4 }}>
                  {s.change} this week
                </div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10,
                background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={s.icon} size={18} color={s.color} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <ProgressBar value={parseInt(s.value.replace(",",""))} max={1500} color={s.color} />
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Middle row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16 }}>

        {/* Heart Rate Chart */}
        <NeuCard style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark }}>Heart Rate Trend</div>
              <div style={{ fontSize: 11, color: T.textLight }}>Last 12 readings</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent,
                animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>74 BPM</span>
            </div>
          </div>
          <SparkLine data={vitalsData} color={T.accent} height={80} width={280} />
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[["Min", "71"], ["Avg", "74"], ["Max", "78"]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: T.textLight }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.textDark }}>{v}</div>
              </div>
            ))}
          </div>
        </NeuCard>

        {/* BP Chart */}
        <NeuCard style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark }}>Blood Pressure</div>
              <div style={{ fontSize: 11, color: T.textLight }}>Systolic readings</div>
            </div>
            <Tag label="Normal" color={T.green} bg={T.greenSoft} />
          </div>
          <SparkLine data={bpData} color={T.blue} height={80} width={280} />
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[["Sys", "120"], ["Dia", "80"], ["MAP", "93"]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: T.textLight }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.textDark }}>{v} <span style={{ fontSize: 10 }}>mmHg</span></div>
              </div>
            ))}
          </div>
        </NeuCard>

        {/* Dept donut */}
        <NeuCard style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 16, alignSelf: "flex-start" }}>By Department</div>
          <DonutChart segments={donutSegments} size={110} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14, width: "100%" }}>
            {donutSegments.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  <span style={{ fontSize: 11, color: T.textMid }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.textDark }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </NeuCard>
      </div>

      {/* Recent Patients + Notification Toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <NeuCard style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark }}>Recent Patients</div>
            <NeuBtn small>View All</NeuBtn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentPatients.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", background: T.bg, borderRadius: 10,
                boxShadow: neuInset(2),
              }}>
                <Avatar name={p.name} size={36} color={p.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textDark }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.textLight }}>{p.condition} · {p.age}y</div>
                </div>
                <Tag label={p.status} color={p.color} bg={`${p.color}18`} />
                <Icon d={ICONS.chevronR} size={14} color={T.textLight} />
              </div>
            ))}
          </div>
        </NeuCard>

        {/* Notification card */}
        <NeuCard style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark }}>Notifications</div>

          {/* Toggle like reference image */}
          <div style={{
            background: T.bg, borderRadius: 12, padding: "12px 14px",
            boxShadow: neuInset(3), display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textDark }}>New Appointments</div>
              <div style={{ fontSize: 10, color: T.textLight }}>Notify about bookings</div>
            </div>
            <div onClick={() => setToggle(!toggle)} style={{
              width: 48, height: 26, borderRadius: 999, cursor: "pointer",
              background: toggle ? T.accent : T.bg,
              boxShadow: toggle ? `0 2px 8px rgba(255,107,53,0.4)` : neuInset(2),
              position: "relative", transition: "all 0.25s ease",
            }}>
              <div style={{
                position: "absolute", top: 3, left: toggle ? 25 : 3,
                width: 20, height: 20, borderRadius: "50%",
                background: T.white, boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                transition: "left 0.25s ease",
              }} />
            </div>
          </div>

          {/* Alert items */}
          {[
            { text: "Ananya M. vitals critical", time: "2m ago", color: T.red },
            { text: "Lab results ready for Rajan", time: "15m ago", color: T.yellow },
            { text: "Appointment confirmed: 3PM", time: "1h ago", color: T.green },
            { text: "Dr. Kumar's schedule updated", time: "2h ago", color: T.blue },
          ].map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: T.textDark, fontWeight: 500 }}>{n.text}</div>
                <div style={{ fontSize: 10, color: T.textLight }}>{n.time}</div>
              </div>
            </div>
          ))}
        </NeuCard>
      </div>
    </div>
  );
};

// ─── SCREEN 2: PATIENT LIST ────────────────────────────────────────────────────

const PatientsScreen = () => {
  const [filter, setFilter] = useState("All");
  const patients = [
    { id: "MRN-001", name: "Priya Nair", age: 34, blood: "A+", condition: "Hypertension", doctor: "Dr. Madhavan", status: "Stable", lastVisit: "Today", avatar: T.blue },
    { id: "MRN-002", name: "Karthik Rajan", age: 52, blood: "B+", condition: "Type 2 Diabetes", doctor: "Dr. Priya K.", status: "Review", lastVisit: "Yesterday", avatar: T.yellow },
    { id: "MRN-003", name: "Ananya Menon", age: 28, blood: "O-", condition: "Asthma", doctor: "Dr. Madhavan", status: "Critical", lastVisit: "2h ago", avatar: T.red },
    { id: "MRN-004", name: "Rajan Sundaram", age: 67, blood: "AB+", condition: "Cardiac Arrhythmia", doctor: "Dr. Arjun V.", status: "Stable", lastVisit: "Jun 25", avatar: T.green },
    { id: "MRN-005", name: "Meera Krishnan", age: 45, blood: "A-", condition: "Hypothyroidism", doctor: "Dr. Priya K.", status: "Stable", lastVisit: "Jun 24", avatar: T.purple },
    { id: "MRN-006", name: "Vikram Iyer", age: 39, blood: "O+", condition: "GERD", doctor: "Dr. Madhavan", status: "Discharged", lastVisit: "Jun 20", avatar: T.textLight },
  ];
  const statusColors = { Stable: T.green, Review: T.yellow, Critical: T.red, Discharged: T.blue };
  const filters = ["All", "Critical", "Review", "Stable", "Discharged"];
  const filtered = filter === "All" ? patients : patients.filter(p => p.status === filter);

  return (
    <div style={{ padding: 28, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }} className="fade-up">

      {/* Header actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                background: filter === f ? T.accent : T.card,
                color: filter === f ? T.white : T.textMid,
                boxShadow: filter === f ? `0 4px 12px rgba(255,107,53,0.35)` : neu(3),
                transition: "all 0.15s ease",
              }}>{f}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <NeuBtn accent>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={ICONS.plus} size={14} color={T.white} /> Register Patient
          </span>
        </NeuBtn>
      </div>

      {/* Patient cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {filtered.map((p, i) => (
          <NeuCard key={i} style={{ padding: 18, cursor: "pointer", animationDelay: `${i * 0.05}s` }} className="fade-up">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <Avatar name={p.name} size={44} color={p.avatar} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.textDark, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: T.textLight, fontFamily: "'DM Mono', monospace" }}>{p.id}</div>
                <div style={{ fontSize: 11, color: T.textLight }}>Age {p.age} · Blood {p.blood}</div>
              </div>
              <Tag label={p.status} color={statusColors[p.status]} bg={`${statusColors[p.status]}18`} />
            </div>

            <div style={{ background: T.bg, borderRadius: 8, padding: "8px 10px", boxShadow: neuInset(2), marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: T.textLight, marginBottom: 2 }}>PRIMARY CONDITION</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textDark }}>{p.condition}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: T.textLight }}>Attending</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMid }}>{p.doctor}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: T.textLight }}>Last Visit</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMid }}>{p.lastVisit}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <NeuBtn small style={{ flex: 1 }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <Icon d={ICONS.file} size={12} color={T.textMid} /> Records
                </span>
              </NeuBtn>
              <NeuBtn small accent style={{ flex: 1 }}>View Profile</NeuBtn>
            </div>
          </NeuCard>
        ))}
      </div>
    </div>
  );
};

// ─── SCREEN 3: PATIENT PROFILE ────────────────────────────────────────────────

const PatientProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = ["overview", "records", "vitals", "prescriptions", "labs"];

  const medications = [
    { name: "Amlodipine", dose: "5mg", freq: "Once daily", since: "Jan 2024", color: T.blue },
    { name: "Metformin", dose: "500mg", freq: "Twice daily", since: "Mar 2023", color: T.green },
    { name: "Aspirin", dose: "75mg", freq: "Once daily", since: "Jun 2022", color: T.accent },
  ];

  const timeline = [
    { date: "Jun 25", type: "Consultation", doc: "Dr. Madhavan", note: "BP review — controlled, continue medication", color: T.blue },
    { date: "Jun 10", type: "Lab Results", doc: "Lab Dept.", note: "HbA1c 6.8% — marginally elevated, monitor", color: T.yellow },
    { date: "May 28", type: "Prescription", doc: "Dr. Madhavan", note: "Amlodipine dosage adjustment to 5mg", color: T.green },
    { date: "May 10", type: "Emergency", doc: "Dr. Arjun V.", note: "Hypertensive crisis — stabilized, admitted 2 days", color: T.red },
  ];

  return (
    <div style={{ padding: 28, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }} className="fade-up">

      {/* Profile hero */}
      <NeuCard style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <Avatar name="Priya Nair" size={70} color={T.blue} />
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 16, height: 16,
              borderRadius: "50%", background: T.green, border: `2px solid ${T.card}` }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.textDark, letterSpacing: -0.5 }}>Priya Nair</div>
            <div style={{ fontSize: 12, color: T.textLight, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>MRN-001 · Female · 34 years</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Tag label="A+ Blood" color={T.red} bg={`${T.red}18`} />
              <Tag label="Hypertension" color={T.blue} bg={T.blueSoft} />
              <Tag label="Diabetic" color={T.yellow} bg={`${T.yellow}18`} />
              <Tag label="Active Patient" color={T.green} bg={T.greenSoft} />
            </div>
          </div>

          {/* Quick vitals */}
          <div style={{ display: "flex", gap: 12 }}>
            <VitalGauge value={120} max={200} color={T.blue} label="SYS" unit="mmHg" />
            <VitalGauge value={74} max={120} color={T.accent} label="HR" unit="BPM" />
            <VitalGauge value={98} max={100} color={T.green} label="SpO2" unit="%" />
            <VitalGauge value={98} max={110} color={T.yellow} label="TEMP" unit="°F" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <NeuBtn accent>+ New Record</NeuBtn>
            <NeuBtn small>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d={ICONS.download} size={12} color={T.textMid} /> PDF Report
              </span>
            </NeuBtn>
          </div>
        </div>
      </NeuCard>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: T.bg, borderRadius: 12, padding: 4, boxShadow: neuInset(3), width: "fit-content" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              background: activeTab === tab ? T.card : "transparent",
              color: activeTab === tab ? T.textDark : T.textLight,
              boxShadow: activeTab === tab ? neu(3) : "none",
              textTransform: "capitalize", transition: "all 0.15s ease",
            }}>{tab}</button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Info card */}
          <NeuCard style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 14 }}>Patient Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Date of Birth", "March 15, 1990"], ["Contact", "+91 98765 43210"],
                ["Email", "priya.nair@email.com"], ["Address", "Chennai, TN"],
                ["Insurance", "Star Health #SH4521"], ["Emergency Contact", "Ramesh Nair (Husband)"],
              ].map(([l, v]) => (
                <div key={l} style={{ background: T.bg, borderRadius: 8, padding: "8px 10px", boxShadow: neuInset(2) }}>
                  <div style={{ fontSize: 10, color: T.textLight, marginBottom: 2 }}>{l.toUpperCase()}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textDark }}>{v}</div>
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Medications */}
          <NeuCard style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 14 }}>Current Medications</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {medications.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  background: T.bg, borderRadius: 10, boxShadow: neuInset(2) }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${m.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={ICONS.pill} size={16} color={m.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.textDark }}>{m.name} <span style={{ color: m.color }}>{m.dose}</span></div>
                    <div style={{ fontSize: 10, color: T.textLight }}>{m.freq} · Since {m.since}</div>
                  </div>
                  <Icon d={ICONS.check} size={14} color={T.green} />
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Timeline */}
          <NeuCard style={{ padding: 20, gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 14 }}>Clinical Timeline</div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 23, top: 0, bottom: 0, width: 2, background: T.shadowD }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {timeline.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: `${t.color}18`,
                      border: `2px solid ${t.color}`, display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
                      <Icon d={ICONS.file} size={16} color={t.color} />
                    </div>
                    <div style={{ flex: 1, background: T.bg, borderRadius: 10, padding: "10px 14px", boxShadow: neuInset(2) }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.type}</span>
                        <span style={{ fontSize: 11, color: T.textLight, fontFamily: "'DM Mono', monospace" }}>{t.date}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.textDark }}>{t.note}</div>
                      <div style={{ fontSize: 10, color: T.textLight, marginTop: 4 }}>{t.doc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeuCard>
        </div>
      )}

      {activeTab !== "overview" && (
        <NeuCard style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Icon d={ICONS.file} size={40} color={T.textLight} />
          <div style={{ fontSize: 16, fontWeight: 600, color: T.textMid }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module
          </div>
          <div style={{ fontSize: 13, color: T.textLight }}>Switch to Overview to see the full wireframe</div>
        </NeuCard>
      )}
    </div>
  );
};

// ─── SCREEN 4: APPOINTMENTS ───────────────────────────────────────────────────

const AppointmentsScreen = () => {
  const [selectedDay, setSelectedDay] = useState(27);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 5, 23 + i);
    return { date: 23 + i, day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()], hasAppts: [24,25,27,28].includes(23+i) };
  });

  const appointments = [
    { time: "09:00 AM", patient: "Priya Nair", type: "Follow-up", duration: "30 min", room: "Room 3", status: "Confirmed", color: T.green },
    { time: "10:30 AM", patient: "Karthik Rajan", type: "Consultation", duration: "45 min", room: "Room 1", status: "Confirmed", color: T.green },
    { time: "11:30 AM", patient: "New Patient", type: "First Visit", duration: "60 min", room: "Room 2", status: "Pending", color: T.yellow },
    { time: "02:00 PM", patient: "Ananya Menon", type: "Emergency", duration: "30 min", room: "Room 4", status: "Urgent", color: T.red },
    { time: "03:30 PM", patient: "Meera Krishnan", type: "Lab Review", duration: "20 min", room: "Room 3", status: "Confirmed", color: T.green },
    { time: "04:30 PM", patient: "Available Slot", type: "—", duration: "30 min", room: "—", status: "Open", color: T.blue },
  ];

  return (
    <div style={{ padding: 28, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }} className="fade-up">

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

        {/* Main schedule */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Week strip */}
          <NeuCard style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textDark }}>June 2026</div>
              <div style={{ display: "flex", gap: 4 }}>
                {["Week", "Day", "Month"].map(v => (
                  <NeuBtn key={v} small>{v}</NeuBtn>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {days.map(d => (
                <div key={d.date} onClick={() => setSelectedDay(d.date)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 4px", borderRadius: 12, cursor: "pointer",
                    background: selectedDay === d.date ? T.accent : T.bg,
                    boxShadow: selectedDay === d.date ? `0 4px 14px rgba(255,107,53,0.4)` : neuInset(2),
                    transition: "all 0.2s ease",
                  }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: selectedDay === d.date ? "rgba(255,255,255,0.8)" : T.textLight }}>{d.day}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: selectedDay === d.date ? T.white : T.textDark, margin: "4px 0" }}>{d.date}</div>
                  {d.hasAppts && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: selectedDay === d.date ? T.white : T.accent }} />
                  )}
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Appointment slots */}
          <NeuCard style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 14 }}>
              Schedule — June {selectedDay}, 2026
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {appointments.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                  borderRadius: 12, background: T.bg, boxShadow: neuInset(2),
                  borderLeft: `3px solid ${a.color}`,
                }}>
                  <div style={{ width: 70, flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, fontFamily: "'DM Mono', monospace" }}>{a.time}</div>
                    <div style={{ fontSize: 10, color: T.textLight }}>{a.duration}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: a.status === "Open" ? T.textLight : T.textDark }}>
                      {a.patient}
                    </div>
                    <div style={{ fontSize: 11, color: T.textLight }}>{a.type} · {a.room}</div>
                  </div>
                  <Tag label={a.status} color={a.color} bg={`${a.color}18`} />
                  {a.status === "Open" && (
                    <NeuBtn small accent>Book</NeuBtn>
                  )}
                </div>
              ))}
            </div>
          </NeuCard>
        </div>

        {/* Sidebar stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Today's Total", value: "24", icon: ICONS.calendar, color: T.blue },
            { label: "Completed", value: "18", icon: ICONS.check, color: T.green },
            { label: "Pending", value: "4", icon: ICONS.bell, color: T.yellow },
            { label: "Cancelled", value: "2", icon: ICONS.x, color: T.red },
          ].map((s, i) => (
            <NeuCard key={i} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={s.icon} size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.textLight }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.textDark }}>{s.value}</div>
              </div>
            </NeuCard>
          ))}

          {/* Quick book */}
          <NeuCard style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 12 }}>Quick Book</div>
            {["Patient name", "Time", "Doctor"].map((ph, i) => (
              <div key={i} style={{ background: T.bg, borderRadius: 8, padding: "8px 12px",
                boxShadow: neuInset(2), marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: T.textLight }}>{ph}</div>
              </div>
            ))}
            <NeuBtn accent style={{ width: "100%", marginTop: 4 }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icon d={ICONS.plus} size={14} color={T.white} /> Schedule Appointment
              </span>
            </NeuBtn>
          </NeuCard>
        </div>
      </div>
    </div>
  );
};

// ─── SCREEN 5: VITALS DASHBOARD (ref image right screen) ──────────────────────

const VitalsScreen = () => {
  const [period, setPeriod] = useState("Last 30 days");
  const periods = ["Last 7 days", "Last 30 days", "Last 3 months", "Last year"];

  const heartData = [72, 78, 74, 80, 76, 82, 74, 77, 71, 75, 78, 74, 76, 80, 72];
  const bpData    = [118, 122, 120, 125, 119, 121, 116, 120, 118, 122, 120, 117, 119, 121, 120];
  const spo2Data  = [98, 97, 98, 99, 97, 98, 98, 96, 97, 98, 99, 98, 97, 98, 98];

  const categoryBreakdown = [
    { label: "Cardiology", value: 35, color: T.accent },
    { label: "General", value: 28, color: T.blue },
    { label: "Respiratory", value: 22, color: T.green },
    { label: "Endocrine", value: 15, color: T.yellow },
  ];

  return (
    <div style={{ padding: 28, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }} className="fade-up">

      {/* Period selector — like reference right screen */}
      <NeuCard style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 14, width: "fit-content" }}>
        <span style={{ fontSize: 12, color: T.textLight, fontWeight: 600 }}>Period:</span>
        <div style={{ display: "flex", gap: 4 }}>
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: period === p ? 700 : 400, fontFamily: "'DM Sans', sans-serif",
                background: period === p ? T.accent : "transparent",
                color: period === p ? T.white : T.textMid,
                boxShadow: period === p ? `0 3px 10px rgba(255,107,53,0.35)` : "none",
                transition: "all 0.15s ease",
              }}>{p}</button>
          ))}
        </div>
      </NeuCard>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 3 vital charts */}
          {[
            { title: "Heart Rate", data: heartData, color: T.accent, value: "74 BPM", status: "Normal", icon: ICONS.heart },
            { title: "Blood Pressure (Systolic)", data: bpData, color: T.blue, value: "120 mmHg", status: "Borderline", icon: ICONS.activity },
            { title: "SpO2 — Oxygen Saturation", data: spo2Data, color: T.green, value: "98%", status: "Excellent", icon: ICONS.wind },
          ].map((v, i) => (
            <NeuCard key={i} style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${v.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={v.icon} size={16} color={v.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark }}>{v.title}</div>
                    <div style={{ fontSize: 11, color: T.textLight }}>{period}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: v.color }}>{v.value}</div>
                  <Tag label={v.status} color={v.color} bg={`${v.color}18`} />
                </div>
              </div>
              <SparkLine data={v.data} color={v.color} height={60} width={500} />
            </NeuCard>
          ))}
        </div>

        {/* Right: Donut + breakdown (matches reference) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <NeuCard style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 14, alignSelf: "flex-start" }}>
              Statistic
            </div>
            <DonutChart segments={categoryBreakdown} size={160} />
            <div style={{ marginTop: 16, width: "100%" }}>
              {categoryBreakdown.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", background: T.bg, borderRadius: 8, boxShadow: neuInset(2), marginBottom: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                    <span style={{ fontSize: 12, color: T.textMid }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Gauges */}
          <NeuCard style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 14 }}>Current Readings</div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <VitalGauge value={120} max={200} color={T.blue} label="Systolic" unit="mmHg" />
              <VitalGauge value={80} max={120} color={T.accent} label="Diastolic" unit="mmHg" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12 }}>
              <VitalGauge value={74} max={120} color={T.green} label="Heart Rate" unit="BPM" />
              <VitalGauge value={98} max={100} color={T.purple} label="SpO2" unit="%" />
            </div>
          </NeuCard>
        </div>
      </div>
    </div>
  );
};

// ─── SCREEN 6: AI ASSISTANT ───────────────────────────────────────────────────

const AIScreen = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello Dr. Madhavan. I'm your AI clinical assistant. I can help analyze symptoms, suggest differential diagnoses, check drug interactions, and summarize patient histories. How can I help today?", time: "09:00" },
    { role: "user", text: "Patient: Priya Nair, 34F. Presenting with persistent headache, blurred vision, BP 160/100. On Amlodipine 5mg. What should I consider?", time: "09:02" },
    { role: "ai", text: "Based on the presentation — BP 160/100 despite Amlodipine, with headache and blurred vision — this raises concern for:\n\n1. HYPERTENSIVE URGENCY (most likely) — BP inadequately controlled, CNS symptoms present. Recommend: Check fundoscopy for papilledema, ECG, BMP panel.\n\n2. HYPERTENSIVE EMERGENCY — if visual changes are new and acute. Requires immediate IV labetalol or nicardipine.\n\n3. MEDICATION NON-COMPLIANCE — verify adherence before escalating dose.\n\nRecommendation: Escalate Amlodipine to 10mg OR add an ARB (losartan). Urgent ophthalmology consult if fundoscopy abnormal.", time: "09:02", hasConfidence: true },
  ]);

  const confidence = [
    { label: "Hypertensive Urgency", value: 78, color: T.accent },
    { label: "Hypertensive Emergency", value: 45, color: T.red },
    { label: "Medication Non-compliance", value: 32, color: T.yellow },
  ];

  return (
    <div style={{ padding: 28, flex: 1, display: "flex", flexDirection: "column", gap: 16 }} className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, flex: 1, minHeight: 0 }}>

        {/* Chat */}
        <NeuCard style={{ padding: 20, display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: `1px solid ${T.shadowD}`, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px rgba(255,107,53,0.3)` }}>
              <Icon d={ICONS.brain} size={20} color={T.white} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textDark }}>CHR AI Clinical Assistant</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Online · Ollama llama3.2 · Local</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Tag label="AI SUGGESTION — NOT CLINICAL ADVICE" color={T.yellow} bg={`${T.yellow}18`} />
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "ai" && (
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${T.accent}18`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <Icon d={ICONS.brain} size={14} color={T.accent} />
                  </div>
                )}
                <div style={{
                  maxWidth: "75%", padding: "12px 14px", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  background: m.role === "user" ? T.accent : T.bg,
                  boxShadow: m.role === "user" ? `0 4px 12px rgba(255,107,53,0.3)` : neuInset(2),
                  color: m.role === "user" ? T.white : T.textDark,
                }}>
                  <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-line" }}>{m.text}</div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6, textAlign: "right" }}>{m.time}</div>
                </div>
                {m.role === "user" && <Avatar name="Madhavan S" size={30} color={T.blue} />}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1, background: T.bg, borderRadius: 12, padding: "10px 14px",
              boxShadow: neuInset(3), display: "flex", alignItems: "center", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="Describe symptoms, ask for drug interactions, summarize patient..."
                style={{ flex: 1, border: "none", background: "transparent", outline: "none",
                  fontSize: 12, color: T.textDark, fontFamily: "'DM Sans', sans-serif" }} />
            </div>
            <NeuBtn accent style={{ height: 44, width: 44, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
              <Icon d={ICONS.chevronR} size={18} color={T.white} />
            </NeuBtn>
          </div>
        </NeuCard>

        {/* Confidence panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <NeuCard style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 14 }}>Differential Diagnosis</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {confidence.map((c, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.textDark }}>{c.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: c.color }}>{c.value}%</span>
                  </div>
                  <ProgressBar value={c.value} max={100} color={c.color} height={7} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, background: `${T.yellow}18`, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: T.yellow, fontWeight: 700 }}>⚠ DISCLAIMER</div>
              <div style={{ fontSize: 10, color: T.textMid, marginTop: 2 }}>AI suggestions are decision support only. Clinical judgment prevails.</div>
            </div>
          </NeuCard>

          <NeuCard style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 12 }}>Quick Actions</div>
            {[
              { label: "Summarize Patient History", icon: ICONS.file, color: T.blue },
              { label: "Check Drug Interactions", icon: ICONS.pill, color: T.green },
              { label: "Generate Discharge Note", icon: ICONS.download, color: T.accent },
              { label: "Suggest ICD-10 Codes", icon: ICONS.grid, color: T.purple },
            ].map((a, i) => (
              <div key={i} className="neu-btn" style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 6,
                background: T.card, boxShadow: neu(3) }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${a.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={a.icon} size={14} color={a.color} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.textDark }}>{a.label}</span>
                <Icon d={ICONS.chevronR} size={12} color={T.textLight} style={{ marginLeft: "auto" }} />
              </div>
            ))}
          </NeuCard>

          <NeuCard style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textDark, marginBottom: 10 }}>Model Info</div>
            {[["Model", "llama3.2:3b"], ["Provider", "Ollama (local)"], ["Status", "Online"], ["Latency", "~2.3s"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0",
                borderBottom: `1px solid ${T.shadowD}` }}>
                <span style={{ fontSize: 11, color: T.textLight }}>{l}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.textDark }}>{v}</span>
              </div>
            ))}
          </NeuCard>
        </div>
      </div>
    </div>
  );
};

// ─── SCREEN 7: AUDIT LOG ──────────────────────────────────────────────────────

const AuditScreen = () => {
  const logs = [
    { user: "Dr. Madhavan", action: "VIEW", resource: "Patient Record", id: "MRN-001", ip: "192.168.1.45", time: "09:42:13", risk: "Low" },
    { user: "Nurse Priya", action: "CREATE", resource: "Vitals Entry", id: "MRN-003", ip: "192.168.1.62", time: "09:38:01", risk: "Low" },
    { user: "Admin Kumar", action: "EXPORT", resource: "Patient List", id: "ALL", ip: "192.168.1.10", time: "09:30:45", risk: "Medium" },
    { user: "Dr. Arjun", action: "UPDATE", resource: "Prescription", id: "MRN-002", ip: "192.168.1.51", time: "09:22:30", risk: "Low" },
    { user: "SYSTEM", action: "LOGIN_FAIL", resource: "Auth", id: "unknown@x.com", ip: "45.92.18.221", time: "09:15:02", risk: "High" },
    { user: "SYSTEM", action: "LOGIN_FAIL", resource: "Auth", id: "unknown@x.com", ip: "45.92.18.221", time: "09:15:01", risk: "High" },
    { user: "Dr. Madhavan", action: "DELETE", resource: "Draft Note", id: "NOTE-094", ip: "192.168.1.45", time: "08:55:17", risk: "Medium" },
    { user: "Receptionist R.", action: "CREATE", resource: "Appointment", id: "APT-552", ip: "192.168.1.33", time: "08:44:00", risk: "Low" },
  ];
  const riskColors = { Low: T.green, Medium: T.yellow, High: T.red };
  const actionColors = { VIEW: T.blue, CREATE: T.green, UPDATE: T.yellow, DELETE: T.red, EXPORT: T.purple, LOGIN_FAIL: T.red };

  return (
    <div style={{ padding: 28, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }} className="fade-up">

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[["Today's Events", "847", T.blue], ["High Risk", "2", T.red], ["Failed Logins", "2", T.yellow], ["PHI Accessed", "134", T.purple]].map(([l, v, c]) => (
          <NeuCard key={l} style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: T.textLight, marginBottom: 4 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c }}>{v}</div>
          </NeuCard>
        ))}
      </div>

      {/* Alert banner */}
      <div style={{ background: `${T.red}14`, borderRadius: 12, padding: "12px 16px",
        border: `1px solid ${T.red}40`, display: "flex", alignItems: "center", gap: 12 }}>
        <Icon d={ICONS.alert} size={20} color={T.red} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.red }}>Security Alert: 2 failed login attempts from external IP 45.92.18.221</div>
          <div style={{ fontSize: 11, color: T.textMid }}>09:15 AM · IP has been rate-limited (15 min block)</div>
        </div>
        <NeuBtn small style={{ color: T.red, fontWeight: 700 }}>Investigate</NeuBtn>
      </div>

      {/* Log table */}
      <NeuCard style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark }}>Audit Trail — Live</div>
          <div style={{ display: "flex", gap: 8 }}>
            <NeuBtn small>Filter</NeuBtn>
            <NeuBtn small>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d={ICONS.download} size={12} color={T.textMid} /> Export CSV
              </span>
            </NeuBtn>
          </div>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1.2fr 0.8fr 1fr 0.7fr 0.5fr",
          padding: "8px 12px", background: T.textDark, borderRadius: 8, marginBottom: 6 }}>
          {["User", "Action", "Resource", "Record ID", "IP Address", "Time", "Risk"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T.textLight, letterSpacing: 0.5 }}>{h.toUpperCase()}</span>
          ))}
        </div>

        {logs.map((log, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1.2fr 0.8fr 1fr 0.7fr 0.5fr",
            padding: "10px 12px", borderRadius: 8, alignItems: "center",
            background: i % 2 === 0 ? T.bg : T.card,
            boxShadow: i % 2 === 0 ? neuInset(2) : "none",
            marginBottom: 2,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textDark }}>{log.user}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: actionColors[log.action] || T.textMid,
              background: `${actionColors[log.action] || T.textMid}18`, padding: "2px 7px",
              borderRadius: 999, display: "inline-block", width: "fit-content" }}>{log.action}</span>
            <div style={{ fontSize: 11, color: T.textMid }}>{log.resource}</div>
            <div style={{ fontSize: 11, color: T.textLight, fontFamily: "'DM Mono', monospace" }}>{log.id}</div>
            <div style={{ fontSize: 11, color: T.textLight, fontFamily: "'DM Mono', monospace" }}>{log.ip}</div>
            <div style={{ fontSize: 11, color: T.textLight, fontFamily: "'DM Mono', monospace" }}>{log.time}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: riskColors[log.risk],
              background: `${riskColors[log.risk]}18`, padding: "2px 7px",
              borderRadius: 999, display: "inline-block" }}>{log.risk}</span>
          </div>
        ))}
      </NeuCard>
    </div>
  );
};

// ─── SCREEN PLACEHOLDER ───────────────────────────────────────────────────────

const PlaceholderScreen = ({ name }) => (
  <div style={{ padding: 28, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <NeuCard style={{ padding: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: T.accentSoft,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={ICONS.grid} size={36} color={T.accent} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.textDark }}>{name}</div>
      <div style={{ fontSize: 13, color: T.textLight, maxWidth: 300 }}>
        This screen is part of the CHR-System design. Navigate using the sidebar to explore all wireframes.
      </div>
      <Tag label="Wireframe Preview" color={T.accent} bg={T.accentSoft} />
    </NeuCard>
  </div>
);

// ─── LEGEND BAR ───────────────────────────────────────────────────────────────

const Legend = ({ active }) => {
  const screenInfo = {
    dashboard: { title: "Dashboard", desc: "Overview with stats, charts, patient list, notifications toggle" },
    patients: { title: "Patient List", desc: "Filterable patient grid with status badges and quick actions" },
    records: { title: "Patient Profile", desc: "Full profile with tabs, vitals gauges, medications, clinical timeline" },
    appointments: { title: "Appointments", desc: "Week view calendar, daily schedule, quick booking form" },
    vitals: { title: "Vitals / Statistics", desc: "Matches reference right screen: donut chart, spark lines, period selector" },
    ai: { title: "AI Clinical Assistant", desc: "Chat interface, differential diagnosis confidence bars, quick action panel" },
    audit: { title: "Audit Log", desc: "HIPAA audit trail, risk badges, security alerts, CSV export" },
    settings: { title: "Settings", desc: "System configuration, user management, role settings" },
  };
  const info = screenInfo[active] || { title: active, desc: "" };
  return (
    <div style={{
      height: 44, background: T.textDark, display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: T.white }}>{info.title}</span>
      </div>
      <span style={{ fontSize: 11, color: T.textLight }}>—</span>
      <span style={{ fontSize: 11, color: T.textLight }}>{info.desc}</span>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {[T.red, T.yellow, T.green].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [role, setRole] = useState("DOCTOR");
  const roles = ["DOCTOR", "NURSE", "ADMIN", "PATIENT"];

  const screens = {
    dashboard:    { component: <DashboardScreen />, title: "Dashboard", subtitle: "Good morning, Dr. Madhavan. You have 6 appointments today." },
    patients:     { component: <PatientsScreen />, title: "Patients", subtitle: "1,284 registered patients · 24 active today" },
    records:      { component: <PatientProfileScreen />, title: "Patient Profile", subtitle: "Priya Nair · MRN-001 · Hypertension" },
    appointments: { component: <AppointmentsScreen />, title: "Appointments", subtitle: "Schedule management · June 27, 2026" },
    vitals:       { component: <VitalsScreen />, title: "Vitals & Statistics", subtitle: "Health monitoring · Priya Nair · Last 30 days" },
    ai:           { component: <AIScreen />, title: "AI Clinical Assistant", subtitle: "Powered by Ollama + llama3.2 · Running locally · Zero cost" },
    audit:        { component: <AuditScreen />, title: "Audit Log", subtitle: "HIPAA compliance · 847 events today · 2 alerts" },
    settings:     { component: <PlaceholderScreen name="Settings" />, title: "Settings", subtitle: "System configuration" },
  };

  const current = screens[active] || screens.dashboard;

  return (
    <div style={{ width: "100vw", height: "100vh", background: T.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <GlobalStyle />

      {/* Design system label + role switcher */}
      <div style={{
        height: 36, background: TEXT_DARK, display: "flex", alignItems: "center",
        padding: "0 20px", gap: 12, flexShrink: 0,
        borderBottom: `2px solid ${T.accent}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: 1 }}>CHR-SYSTEM</span>
        <span style={{ fontSize: 10, color: T.textLight, letterSpacing: 0.5 }}>UI/UX DESIGN WIREFRAMES & MOCKUPS · NEUMORPHIC DESIGN SYSTEM</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: T.textLight }}>Role Preview:</span>
          {roles.map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              background: role === r ? T.accent : "rgba(255,255,255,0.08)",
              color: role === r ? T.white : T.textLight, transition: "all 0.15s ease",
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Sidebar active={active} setActive={setActive} role={role} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar title={current.title} subtitle={current.subtitle} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            {current.component}
          </div>
          <Legend active={active} />
        </div>
      </div>
    </div>
  );
}

const TEXT_DARK = "#1E2035";

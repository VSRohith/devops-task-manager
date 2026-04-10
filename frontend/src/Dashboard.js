import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TASK_API = "http://localhost:5001";
const USER_API = "http://localhost:5002";

const C = {
  bg: "#080808",
  surface: "#111",
  surface2: "#181818",
  surface3: "#1e1e1e",
  border: "#222",
  borderHover: "#333",
  accent: "#f97316",
  accentAlt: "#ea580c",
  accentGlow: "#f9731612",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#eab308",
  info: "#38bdf8",
  purple: "#a78bfa",
  pink: "#f472b6",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  subtle: "#444",
};

const PRIORITIES = ["low", "medium", "high", "critical"];
const PRIORITY_COLORS = {
  low: C.success,
  medium: C.warning,
  high: C.accent,
  critical: C.danger,
};
const PRIORITY_ICONS = { low: "▽", medium: "◇", high: "△", critical: "⬆" };
const CATEGORIES = [
  "General",
  "Design",
  "Development",
  "DevOps",
  "Testing",
  "Deployment",
];
const CAT_COLORS = {
  General: C.muted,
  Design: C.pink,
  Development: C.info,
  DevOps: C.accent,
  Testing: C.purple,
  Deployment: C.success,
};
const AVATAR_COLORS = [
  "#f97316",
  "#ea580c",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
  "#a78bfa",
  "#38bdf8",
  "#f472b6",
];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_NAMES_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ── Mini SVG Bar Chart ────────────────────────────────────────────────────────
function BarChart({ data, color = C.accent, height = 60 }) {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${data.length * 28} ${height}`}
      preserveAspectRatio="none"
    >
      {data.map((d, i) => {
        const bh = Math.max((d.v / max) * (height - 20), 2);
        const y = height - 20 - bh;
        return (
          <g key={i}>
            <rect
              x={i * 28 + 4}
              y={y}
              width={20}
              height={bh}
              rx="3"
              fill={color}
              opacity={i === data.length - 1 ? 1 : 0.45}
            />
            <text
              x={i * 28 + 14}
              y={height - 4}
              textAnchor="middle"
              fontSize="8"
              fill={C.subtle}
            >
              {d.l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ done, total }) {
  const r = 40,
    cx = 50,
    cy = 50;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={C.border}
        strokeWidth="10"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={C.accent}
        strokeWidth="10"
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill={C.text}
      >
        {Math.round(pct * 100)}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill={C.muted}>
        done
      </text>
    </svg>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1),
    min = Math.min(...data);
  const w = 80,
    h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min + 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ navigate, path, logout, activeView, setActiveView }) {
  const items = [
    { id: "overview", label: "Overview", icon: "⬡" },
    { id: "tasks", label: "Tasks", icon: "≡" },
    { id: "analytics", label: "Analytics", icon: "◈" },
    { id: "calendar", label: "Calendar", icon: "⊞" },
  ];
  return (
    <div
      style={{
        width: "210px",
        minHeight: "100vh",
        background: "#060606",
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div
        style={{ padding: "20px 16px", borderBottom: `1px solid ${C.border}` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              background: `linear-gradient(135deg,${C.accent},${C.accentAlt})`,
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            🏗
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: "13px" }}>
              VSR Builders
            </div>
            <div style={{ color: C.subtle, fontSize: "10px" }}>
              Task Platform
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}` }}
      >
        <div
          style={{
            fontSize: "10px",
            color: C.subtle,
            fontWeight: 600,
            letterSpacing: "1px",
            padding: "6px 8px",
            marginBottom: "4px",
            textTransform: "uppercase",
          }}
        >
          Navigation
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              padding: "9px 10px",
              borderRadius: "7px",
              cursor: "pointer",
              marginBottom: "2px",
              background: activeView === item.id ? C.accentGlow : "transparent",
              color: activeView === item.id ? C.accent : C.muted,
              fontWeight: activeView === item.id ? 600 : 400,
              fontSize: "13px",
            }}
            onMouseEnter={(e) =>
              activeView !== item.id &&
              (e.currentTarget.style.background = C.surface2)
            }
            onMouseLeave={(e) =>
              activeView !== item.id &&
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span
              style={{ fontSize: "14px", width: "16px", textAlign: "center" }}
            >
              {item.icon}
            </span>
            {item.label}
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 8px", flex: 1 }}>
        <div
          style={{
            fontSize: "10px",
            color: C.subtle,
            fontWeight: 600,
            letterSpacing: "1px",
            padding: "6px 8px",
            marginBottom: "4px",
            textTransform: "uppercase",
          }}
        >
          Pages
        </div>
        <div
          onClick={() => navigate("/team")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "9px 10px",
            borderRadius: "7px",
            cursor: "pointer",
            color: C.muted,
            fontSize: "13px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.surface2)}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span
            style={{ fontSize: "14px", width: "16px", textAlign: "center" }}
          >
            ◎
          </span>{" "}
          Team
        </div>
      </div>

      <div style={{ padding: "12px 8px", borderTop: `1px solid ${C.border}` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "8px 10px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: `${C.accent}25`,
              border: `1px solid ${C.accent}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.accent,
              fontWeight: 700,
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            {(localStorage.getItem("user") || "U")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                color: C.text,
                fontSize: "12px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {localStorage.getItem("user")}
            </div>
            <div style={{ color: C.success, fontSize: "10px" }}>● Online</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "7px",
            borderRadius: "7px",
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: C.muted,
            cursor: "pointer",
            fontSize: "12px",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = C.accent;
            e.target.style.color = C.accent;
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = C.border;
            e.target.style.color = C.muted;
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Clock Widget ──────────────────────────────────────────────────────────────
function ClockWidget({ now }) {
  const h = (now.getHours() % 12 || 12).toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "18px",
        borderTop: `2px solid ${C.accent}`,
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: C.subtle,
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {DAY_NAMES_FULL[now.getDay()]}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
        <span
          style={{
            fontSize: "38px",
            fontWeight: 700,
            color: C.text,
            letterSpacing: "1px",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {h}:{m}
        </span>
        <span
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: C.accent,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {s}
        </span>
        <span style={{ fontSize: "14px", color: C.muted, marginLeft: "3px" }}>
          {ampm}
        </span>
      </div>
      <div style={{ fontSize: "12px", color: C.muted, marginTop: "6px" }}>
        {MONTH_NAMES[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
      </div>
      <div
        style={{
          marginTop: "10px",
          height: "3px",
          background: C.border,
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: `linear-gradient(90deg,${C.accent},${C.accentAlt})`,
            width: `${(now.getSeconds() / 60) * 100}%`,
            transition: "width 0.9s linear",
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}

// ── Mini Calendar Widget ──────────────────────────────────────────────────────
function CalendarWidget({ now }) {
  const [calDate, setCalDate] = useState(new Date());
  const today = new Date();

  const getCalDays = (d) => {
    const y = d.getFullYear(),
      mo = d.getMonth();
    const first = new Date(y, mo, 1).getDay();
    const total = new Date(y, mo + 1, 0).getDate();
    const prev = new Date(y, mo, 0).getDate();
    const cells = [];
    for (let i = first - 1; i >= 0; i--) cells.push({ d: prev - i, t: "o" });
    for (let i = 1; i <= total; i++) cells.push({ d: i, t: "c" });
    while (cells.length < 35)
      cells.push({ d: cells.length - total - first + 1, t: "o" });
    return cells;
  };

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() =>
            setCalDate(
              new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1),
            )
          }
          style={{
            background: "transparent",
            border: "none",
            color: C.muted,
            cursor: "pointer",
            fontSize: "16px",
            padding: "0 4px",
          }}
        >
          ‹
        </button>
        <span style={{ color: C.text, fontWeight: 600, fontSize: "12px" }}>
          {MONTH_NAMES[calDate.getMonth()]} {calDate.getFullYear()}
        </span>
        <button
          onClick={() =>
            setCalDate(
              new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1),
            )
          }
          style={{
            background: "transparent",
            border: "none",
            color: C.muted,
            cursor: "pointer",
            fontSize: "16px",
            padding: "0 4px",
          }}
        >
          ›
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          marginBottom: "4px",
        }}
      >
        {DAY_NAMES_SHORT.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: "9px",
              color: C.subtle,
              padding: "2px 0",
              fontWeight: 600,
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "1px",
        }}
      >
        {getCalDays(calDate).map((cell, i) => {
          const isT =
            cell.t === "c" &&
            cell.d === today.getDate() &&
            calDate.getMonth() === today.getMonth() &&
            calDate.getFullYear() === today.getFullYear();
          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "4px 1px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: isT ? 700 : 400,
                color: isT ? "#fff" : cell.t === "o" ? C.subtle : C.muted,
                background: isT ? C.accent : "transparent",
              }}
            >
              {cell.d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Overview View ─────────────────────────────────────────────────────────────
function OverviewView({ tasks, users, now, onAddTask, onToggle, onDelete }) {
  const done = tasks.filter((t) => t.status === "done").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const critical = tasks.filter(
    (t) => t.priority === "critical" && t.status !== "done",
  ).length;
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  // Last 7 days task completion data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = DAY_NAMES_SHORT[d.getDay()];
    const count = tasks.filter((t) => {
      if (!t.completedAt) return false;
      const td = new Date(t.completedAt);
      return td.toDateString() === d.toDateString();
    }).length;
    return { l: label, v: count };
  });

  // Category breakdown
  const catData = CATEGORIES.map((cat) => ({
    cat,
    count: tasks.filter((t) => t.category === cat).length,
  })).filter((c) => c.count > 0);

  const recentTasks = [...tasks]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: "12px",
        }}
      >
        {[
          {
            label: "Total Tasks",
            value: tasks.length,
            icon: "≡",
            color: C.accent,
            spark: [2, 3, 5, 4, tasks.length],
          },
          {
            label: "Completed",
            value: done,
            icon: "✓",
            color: C.success,
            spark: [1, 2, 3, done - 1, done],
          },
          {
            label: "Pending",
            value: pending,
            icon: "◷",
            color: C.warning,
            spark: [pending + 2, pending + 1, pending],
          },
          {
            label: "Critical",
            value: critical,
            icon: "⬆",
            color: C.danger,
            spark: [critical, critical, critical],
          },
          {
            label: "Overdue",
            value: overdue,
            icon: "!",
            color: C.pink,
            spark: [0, 1, overdue],
          },
          {
            label: "Team",
            value: users.length,
            icon: "◎",
            color: C.purple,
            spark: [users.length],
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "11px",
              padding: "14px 16px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = s.color + "60")
            }
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "7px",
                  background: `${s.color}18`,
                  border: `1px solid ${s.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  color: s.color,
                }}
              >
                {s.icon}
              </div>
              <Sparkline data={s.spark} color={s.color} />
            </div>
            <div
              style={{
                marginTop: "10px",
                fontSize: "24px",
                fontWeight: 700,
                color: C.text,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                marginTop: "3px",
                fontSize: "10px",
                color: C.subtle,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Middle row: donut + bar chart + clock + calendar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "12px",
        }}
      >
        {/* Donut */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "11px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: C.muted,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Completion
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <DonutChart done={done} total={tasks.length} />
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: C.muted,
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: C.success, marginRight: "6px" }}>●</span>
                {done} Done
              </div>
              <div style={{ fontSize: "12px", color: C.muted }}>
                <span style={{ color: C.warning, marginRight: "6px" }}>●</span>
                {pending} Pending
              </div>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "11px",
            padding: "16px",
            gridColumn: "span 2",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: C.muted,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Tasks Completed — Last 7 Days
          </div>
          <BarChart data={weekData} color={C.accent} height={70} />
        </div>

        {/* Clock */}
        <ClockWidget now={now} />
      </div>

      {/* Bottom row: category breakdown + calendar + recent tasks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr",
          gap: "12px",
        }}
      >
        {/* Category breakdown */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "11px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: C.muted,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            By Category
          </div>
          {catData.length === 0 ? (
            <div
              style={{ color: C.subtle, fontSize: "12px", paddingTop: "8px" }}
            >
              No tasks yet
            </div>
          ) : (
            catData.map(({ cat, count }) => (
              <div key={cat} style={{ marginBottom: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "3px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: C.muted }}>
                    {cat}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: CAT_COLORS[cat],
                      fontWeight: 600,
                    }}
                  >
                    {count}
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    background: C.border,
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "2px",
                      background: CAT_COLORS[cat],
                      width: `${(count / tasks.length) * 100}%`,
                      transition: "width 0.4s",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calendar */}
        <CalendarWidget now={now} />

        {/* Recent tasks */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "11px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: C.muted,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Recent Tasks
          </div>
          {recentTasks.length === 0 ? (
            <div
              style={{ color: C.subtle, fontSize: "12px", paddingTop: "8px" }}
            >
              No tasks yet
            </div>
          ) : (
            recentTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div
                  onClick={() => onToggle(t.id)}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: `2px solid ${t.status === "done" ? C.success : C.border}`,
                    background: t.status === "done" ? C.success : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    color: "#fff",
                  }}
                >
                  {t.status === "done" && "✓"}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: t.status === "done" ? C.subtle : C.text,
                      textDecoration:
                        t.status === "done" ? "line-through" : "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: C.subtle,
                      marginTop: "1px",
                    }}
                  >
                    {t.category || "General"} · {t.priority || "medium"}
                  </div>
                </div>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: PRIORITY_COLORS[t.priority || "medium"],
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tasks View ────────────────────────────────────────────────────────────────
function TasksView({ tasks, users, onAdd, onToggle, onDelete, onEdit }) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const inputStyle = {
    padding: "9px 12px",
    borderRadius: "7px",
    border: `1px solid ${C.border}`,
    background: C.surface2,
    color: C.text,
    fontSize: "12px",
    outline: "none",
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      assignedTo,
      priority,
      category,
      dueDate: dueDate || null,
      notes,
    });
    setTitle("");
    setAssignedTo("");
    setPriority("medium");
    setCategory("General");
    setDueDate("");
    setNotes("");
    setShowForm(false);
  };

  let filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "done") return t.status === "done";
    if (filter === "critical") return t.priority === "critical";
    if (filter === "overdue")
      return (
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
      );
    return true;
  });

  if (search)
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.assignedTo || "").toLowerCase().includes(search.toLowerCase()),
    );

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
    if (sortBy === "priority")
      return (
        PRIORITIES.indexOf(b.priority || "medium") -
        PRIORITIES.indexOf(a.priority || "medium")
      );
    if (sortBy === "due")
      return (a.dueDate || "z") < (b.dueDate || "z") ? -1 : 1;
    return 0;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          style={{ ...inputStyle, flex: 1, minWidth: "160px" }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: "120px" }}
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
          <option value="critical">Critical</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ ...inputStyle, minWidth: "120px" }}
        >
          <option value="newest">Newest First</option>
          <option value="priority">By Priority</option>
          <option value="due">By Due Date</option>
        </select>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "9px 18px",
            borderRadius: "7px",
            border: "none",
            background: `linear-gradient(135deg,${C.accent},${C.accentAlt})`,
            color: "#fff",
            fontWeight: 700,
            fontSize: "12px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {showForm ? "✕ Cancel" : "+ New Task"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.accent}40`,
            borderRadius: "11px",
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: C.accent,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            New Task
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title *"
              style={{ ...inputStyle, gridColumn: "span 3" }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              onFocus={(e) => (e.target.style.borderColor = C.accent)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={inputStyle}
            >
              <option value="">Assign to...</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={inputStyle}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              style={{ ...inputStyle, gridColumn: "span 2" }}
            />
          </div>
          <button
            onClick={handleSubmit}
            style={{
              padding: "9px 24px",
              borderRadius: "7px",
              border: "none",
              background: `linear-gradient(135deg,${C.accent},${C.accentAlt})`,
              color: "#fff",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Add Task
          </button>
        </div>
      )}

      {/* Task list */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "11px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
            Tasks{" "}
            <span style={{ color: C.subtle, fontWeight: 400 }}>
              ({filtered.length})
            </span>
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "pending", "done"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "5px",
                  border: `1px solid ${filter === f ? C.accent : C.border}`,
                  background: filter === f ? `${C.accent}18` : "transparent",
                  color: filter === f ? C.accent : C.muted,
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: filter === f ? 600 : 400,
                  textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: C.subtle,
              fontSize: "13px",
            }}
          >
            No tasks found.
          </div>
        ) : (
          filtered.map((t) => {
            const isOverdue =
              t.dueDate &&
              new Date(t.dueDate) < new Date() &&
              t.status !== "done";
            return (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderBottom: `1px solid ${C.border}`,
                  background: "transparent",
                  flexWrap: "wrap",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = C.surface2)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  onClick={() => onToggle(t.id)}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: `2px solid ${t.status === "done" ? C.success : PRIORITY_COLORS[t.priority || "medium"]}`,
                    background: t.status === "done" ? C.success : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {t.status === "done" && "✓"}
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: t.status === "done" ? C.subtle : C.text,
                      textDecoration:
                        t.status === "done" ? "line-through" : "none",
                      fontWeight: 500,
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "3px",
                      flexWrap: "wrap",
                    }}
                  >
                    {t.assignedTo && (
                      <span style={{ fontSize: "10px", color: C.muted }}>
                        👤 {t.assignedTo}
                      </span>
                    )}
                    {t.category && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: CAT_COLORS[t.category],
                          background: `${CAT_COLORS[t.category]}15`,
                          padding: "1px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        {t.category}
                      </span>
                    )}
                    {t.dueDate && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: isOverdue ? C.danger : C.muted,
                        }}
                      >
                        {isOverdue ? "⚠ " : ""}Due{" "}
                        {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {t.notes && (
                      <span style={{ fontSize: "10px", color: C.subtle }}>
                        📝 {t.notes.slice(0, 30)}
                        {t.notes.length > 30 ? "…" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: "20px",
                      fontSize: "10px",
                      fontWeight: 600,
                      background: `${PRIORITY_COLORS[t.priority || "medium"]}15`,
                      color: PRIORITY_COLORS[t.priority || "medium"],
                      border: `1px solid ${PRIORITY_COLORS[t.priority || "medium"]}30`,
                    }}
                  >
                    {PRIORITY_ICONS[t.priority || "medium"]}{" "}
                    {t.priority || "medium"}
                  </span>
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: "20px",
                      fontSize: "10px",
                      fontWeight: 600,
                      background:
                        t.status === "done"
                          ? `${C.success}15`
                          : `${C.warning}15`,
                      color: t.status === "done" ? C.success : C.warning,
                    }}
                  >
                    {t.status === "done" ? "Done" : "Pending"}
                  </span>
                  <button
                    onClick={() => onDelete(t.id)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "5px",
                      border: `1px solid ${C.border}`,
                      background: "transparent",
                      color: C.danger,
                      cursor: "pointer",
                      fontSize: "11px",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#ef444415")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "transparent")
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Analytics View ────────────────────────────────────────────────────────────
function AnalyticsView({ tasks, users }) {
  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Tasks per user
  const perUser = users
    .map((u) => ({
      name: u.name,
      total: tasks.filter((t) => t.assignedTo === u.name).length,
      done: tasks.filter((t) => t.assignedTo === u.name && t.status === "done")
        .length,
    }))
    .filter((u) => u.total > 0);

  // Priority distribution
  const perPriority = PRIORITIES.map((p) => ({
    l: p.slice(0, 3).toUpperCase(),
    v: tasks.filter((t) => (t.priority || "medium") === p).length,
  }));

  // Category distribution
  const perCat = CATEGORIES.map((cat) => ({
    l: cat.slice(0, 4),
    v: tasks.filter((t) => t.category === cat).length,
  })).filter((c) => c.v > 0);

  // Monthly data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    return {
      l: MONTH_NAMES[d.getMonth()],
      v: tasks.filter((t) => {
        if (!t.createdAt) return false;
        const td = new Date(t.createdAt);
        return (
          td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
        );
      }).length,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "12px",
        }}
      >
        {[
          { label: "Completion Rate", value: `${pct}%`, color: C.accent },
          {
            label: "Avg Tasks/Member",
            value: users.length ? (total / users.length).toFixed(1) : "0",
            color: C.info,
          },
          {
            label: "High Priority",
            value: tasks.filter(
              (t) => t.priority === "high" || t.priority === "critical",
            ).length,
            color: C.danger,
          },
          {
            label: "Overdue",
            value: tasks.filter(
              (t) =>
                t.dueDate &&
                new Date(t.dueDate) < new Date() &&
                t.status !== "done",
            ).length,
            color: C.warning,
          },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "11px",
              padding: "16px 18px",
              borderLeft: `3px solid ${k.color}`,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: C.subtle,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              {k.label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: k.color }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
        }}
      >
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "11px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: C.muted,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Priority Distribution
          </div>
          <BarChart data={perPriority} color={C.accent} height={80} />
        </div>
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "11px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: C.muted,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            By Category
          </div>
          <BarChart
            data={perCat.length ? perCat : [{ l: "—", v: 0 }]}
            color={C.info}
            height={80}
          />
        </div>
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "11px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: C.muted,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Tasks Created (6 Months)
          </div>
          <BarChart data={monthlyData} color={C.purple} height={80} />
        </div>
      </div>

      {/* Team performance */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "11px",
          padding: "16px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: C.muted,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "14px",
          }}
        >
          Team Performance
        </div>
        {perUser.length === 0 ? (
          <div style={{ color: C.subtle, fontSize: "13px" }}>
            No assigned tasks yet.
          </div>
        ) : (
          perUser.map((u, i) => {
            const pct2 = u.total > 0 ? Math.round((u.done / u.total) * 100) : 0;
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div
                key={u.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: `${color}25`,
                    border: `1px solid ${color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color,
                    fontWeight: 700,
                    fontSize: "12px",
                    flexShrink: 0,
                  }}
                >
                  {u.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: C.text,
                        fontWeight: 500,
                      }}
                    >
                      {u.name}
                    </span>
                    <span style={{ fontSize: "11px", color: C.muted }}>
                      {u.done}/{u.total} · {pct2}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "5px",
                      background: C.border,
                      borderRadius: "3px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "3px",
                        background: color,
                        width: `${pct2}%`,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task status breakdown table */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "11px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
            fontSize: "11px",
            color: C.muted,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Priority Breakdown
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface2 }}>
              {["Priority", "Total", "Done", "Pending", "Rate"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "9px 16px",
                    textAlign: "left",
                    fontSize: "11px",
                    color: C.subtle,
                    fontWeight: 600,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRIORITIES.map((p) => {
              const all = tasks.filter((t) => (t.priority || "medium") === p);
              const d2 = all.filter((t) => t.status === "done").length;
              const r =
                all.length > 0 ? Math.round((d2 / all.length) * 100) : 0;
              return (
                <tr
                  key={p}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.surface2)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "10px 16px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        color: PRIORITY_COLORS[p],
                        fontWeight: 600,
                      }}
                    >
                      {PRIORITY_ICONS[p]}{" "}
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontSize: "12px",
                      color: C.text,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {all.length}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontSize: "12px",
                      color: C.success,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {d2}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontSize: "12px",
                      color: C.warning,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {all.length - d2}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "4px",
                          background: C.border,
                          borderRadius: "2px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: "2px",
                            background: PRIORITY_COLORS[p],
                            width: `${r}%`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: C.muted,
                          minWidth: "28px",
                        }}
                      >
                        {r}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Calendar Full View ────────────────────────────────────────────────────────
function CalendarFullView({ tasks, now }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();

  const getCalDays = (d) => {
    const y = d.getFullYear(),
      mo = d.getMonth();
    const first = new Date(y, mo, 1).getDay();
    const total = new Date(y, mo + 1, 0).getDate();
    const prev = new Date(y, mo, 0).getDate();
    const cells = [];
    for (let i = first - 1; i >= 0; i--)
      cells.push({ d: prev - i, t: "o", date: new Date(y, mo - 1, prev - i) });
    for (let i = 1; i <= total; i++)
      cells.push({ d: i, t: "c", date: new Date(y, mo, i) });
    while (cells.length < 42) {
      const n = cells.length - total - first + 1;
      cells.push({ d: n, t: "o", date: new Date(y, mo + 1, n) });
    }
    return cells;
  };

  const calDays = getCalDays(viewDate);

  const getTasksForDate = (date) =>
    tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.toDateString() === date.toDateString();
    });

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
              )
            }
            style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              color: C.muted,
              borderRadius: "6px",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ‹
          </button>
          <span style={{ color: C.text, fontWeight: 700, fontSize: "16px" }}>
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button
            onClick={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
              )
            }
            style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              color: C.muted,
              borderRadius: "6px",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ›
          </button>
        </div>
        <button
          onClick={() => setViewDate(new Date())}
          style={{
            padding: "5px 14px",
            borderRadius: "6px",
            border: `1px solid ${C.accent}`,
            background: C.accentGlow,
            color: C.accent,
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Today
        </button>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          background: C.surface2,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((d) => (
          <div
            key={d}
            style={{
              padding: "8px",
              textAlign: "center",
              fontSize: "11px",
              color: C.subtle,
              fontWeight: 600,
            }}
          >
            {d.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
        {calDays.map((cell, i) => {
          const isT =
            cell.t === "c" &&
            cell.d === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear();
          const dayTasks = getTasksForDate(cell.date);
          return (
            <div
              key={i}
              style={{
                minHeight: "80px",
                padding: "6px",
                borderRight: `1px solid ${C.border}`,
                borderBottom: `1px solid ${C.border}`,
                background: isT ? `${C.accent}08` : "transparent",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: isT ? 700 : 400,
                  color: isT ? C.accent : cell.t === "o" ? C.subtle : C.muted,
                  marginBottom: "4px",
                  display: "inline-flex",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isT ? C.accent : "transparent",
                  ...(isT ? { color: "#fff" } : {}),
                }}
              >
                {cell.d}
              </div>
              {dayTasks.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  style={{
                    fontSize: "10px",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    marginBottom: "2px",
                    background: `${PRIORITY_COLORS[t.priority || "medium"]}20`,
                    color: PRIORITY_COLORS[t.priority || "medium"],
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.title}
                </div>
              ))}
              {dayTasks.length > 2 && (
                <div style={{ fontSize: "10px", color: C.subtle }}>
                  +{dayTasks.length - 2} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeView, setActiveView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([fetchTasks(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${TASK_API}/tasks`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks(
        data.map((t) => ({
          ...t,
          status: t.status || "pending",
          date: t.date || new Date().toLocaleDateString(),
        })),
      );
    } catch {
      setError("Cannot reach Task API (localhost:5001) — local mode.");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${USER_API}/users`);
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {}
  };

  const handleAddTask = async (taskData) => {
    const newTask = {
      ...taskData,
      status: "pending",
      date: new Date().toLocaleDateString(),
      createdAt: Date.now(),
    };
    try {
      const res = await fetch(`${TASK_API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error();
      fetchTasks();
    } catch {
      setTasks((prev) => [...prev, { ...newTask, id: Date.now() }]);
    }
  };

  const handleToggle = async (id) => {
    const task = tasks.find((t) => t.id === id);
    const newStatus = task.status === "done" ? "pending" : "done";
    const completedAt = newStatus === "done" ? Date.now() : null;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus, completedAt } : t,
      ),
    );
    try {
      await fetch(`${TASK_API}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  const handleDelete = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`${TASK_API}/tasks/${id}`, { method: "DELETE" });
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const VIEW_LABELS = {
    overview: "Overview",
    tasks: "Tasks",
    analytics: "Analytics",
    calendar: "Calendar",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Segoe UI',sans-serif",
        color: C.text,
      }}
    >
      <Sidebar
        navigate={navigate}
        path={location.pathname}
        logout={logout}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#060606",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
              {VIEW_LABELS[activeView]}
            </div>
            <div
              style={{ fontSize: "11px", color: C.subtle, marginTop: "1px" }}
            >
              Good day,{" "}
              <span style={{ color: C.accent }}>
                {localStorage.getItem("user")}
              </span>
              {" · "}
              {now.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              {" · "}
              {now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {error && (
              <span
                style={{
                  fontSize: "11px",
                  color: C.warning,
                  background: `${C.warning}15`,
                  padding: "4px 10px",
                  borderRadius: "5px",
                  border: `1px solid ${C.warning}30`,
                }}
              >
                ⚠ Local mode
              </span>
            )}
            <div
              style={{
                padding: "5px 12px",
                borderRadius: "6px",
                background: C.accentGlow,
                border: `1px solid ${C.accent}30`,
                fontSize: "11px",
                color: C.accent,
                fontWeight: 600,
              }}
            >
              {tasks.filter((t) => t.status === "done").length}/{tasks.length}{" "}
              done
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                color: C.subtle,
                fontSize: "14px",
              }}
            >
              Loading...
            </div>
          ) : activeView === "overview" ? (
            <OverviewView
              tasks={tasks}
              users={users}
              now={now}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onAddTask={handleAddTask}
            />
          ) : activeView === "tasks" ? (
            <TasksView
              tasks={tasks}
              users={users}
              onAdd={handleAddTask}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ) : activeView === "analytics" ? (
            <AnalyticsView tasks={tasks} users={users} />
          ) : (
            <CalendarFullView tasks={tasks} now={now} />
          )}
        </div>
      </main>
    </div>
  );
}

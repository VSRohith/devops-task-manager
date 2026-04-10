import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const USER_API = "http://localhost:5002";
const TASK_API = "http://localhost:5001";

const C = {
  bg: "#080808",
  surface: "#111",
  surface2: "#181818",
  border: "#222",
  borderHover: "#333",
  accent: "#f97316",
  accentAlt: "#ea580c",
  accentGlow: "#f9731612",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#eab308",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  subtle: "#444",
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
const ROLES = [
  "Developer",
  "Designer",
  "DevOps",
  "QA Engineer",
  "Team Lead",
  "Product Manager",
];

export default function Team() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("Developer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchTasks()]).finally(() => setLoading(false));
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${USER_API}/users`);
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setError("Cannot reach User API (localhost:5002) — local mode.");
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${TASK_API}/tasks`);
      if (!res.ok) throw new Error();
      setTasks(await res.json());
    } catch {}
  };

  const addUser = async () => {
    if (!userName.trim()) return;
    const newUser = { name: userName.trim(), role };
    try {
      const res = await fetch(`${USER_API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error();
      fetchUsers();
    } catch {
      setUsers((prev) => [...prev, { id: Date.now(), ...newUser }]);
    }
    setUserName("");
    setShowForm(false);
  };

  const deleteUser = async (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`${USER_API}/users/${id}`, { method: "DELETE" });
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(search.toLowerCase()),
  );

  const getUserStats = (name) => {
    const assigned = tasks.filter((t) => t.assignedTo === name);
    return {
      total: assigned.length,
      done: assigned.filter((t) => t.status === "done").length,
    };
  };

  const inputStyle = {
    padding: "9px 12px",
    borderRadius: "7px",
    border: `1px solid ${C.border}`,
    background: C.surface2,
    color: C.text,
    fontSize: "13px",
    outline: "none",
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
      {/* Sidebar */}
      <div
        style={{
          width: "210px",
          background: "#060606",
          borderRight: `1px solid ${C.border}`,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 16px",
            borderBottom: `1px solid ${C.border}`,
          }}
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
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {[
            { label: "Overview", icon: "⬡", path: "/", id: "overview" },
            { label: "Tasks", icon: "≡", path: "/", id: "tasks" },
            { label: "Analytics", icon: "◈", path: "/", id: "analytics" },
            { label: "Calendar", icon: "⊞", path: "/", id: "calendar" },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "9px 10px",
                borderRadius: "7px",
                cursor: "pointer",
                marginBottom: "2px",
                color: C.muted,
                fontSize: "13px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.surface2)
              }
              onMouseLeave={(e) =>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              padding: "9px 10px",
              borderRadius: "7px",
              marginBottom: "2px",
              background: C.accentGlow,
              color: C.accent,
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            <span
              style={{ fontSize: "14px", width: "16px", textAlign: "center" }}
            >
              ◎
            </span>{" "}
            Team
          </div>
        </nav>
        <div
          style={{ padding: "12px 8px", borderTop: `1px solid ${C.border}` }}
        >
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

      {/* Main */}
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
              Team Members
            </div>
            <div
              style={{ fontSize: "11px", color: C.subtle, marginTop: "1px" }}
            >
              {users.length} member{users.length !== 1 ? "s" : ""} · Manage your
              team
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "8px 18px",
              borderRadius: "7px",
              border: "none",
              background: `linear-gradient(135deg,${C.accent},${C.accentAlt})`,
              color: "#fff",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {showForm ? "✕ Cancel" : "+ Add Member"}
          </button>
        </div>

        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
          {error && (
            <div
              style={{
                background: "#ef444415",
                border: "1px solid #ef444430",
                borderLeft: `3px solid ${C.danger}`,
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                color: "#fca5a5",
                fontSize: "12px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Add form */}
          {showForm && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.accent}40`,
                borderRadius: "11px",
                padding: "18px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: C.accent,
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                New Team Member
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Full name *"
                  style={{ ...inputStyle, flex: 1, minWidth: "160px" }}
                  onKeyDown={(e) => e.key === "Enter" && addUser()}
                  onFocus={(e) => (e.target.style.borderColor = C.accent)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ ...inputStyle, minWidth: "160px" }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addUser}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "7px",
                    border: "none",
                    background: `linear-gradient(135deg,${C.accent},${C.accentAlt})`,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Add Member
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div style={{ marginBottom: "16px" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              style={{ ...inputStyle, width: "280px" }}
              onFocus={(e) => (e.target.style.borderColor = C.accent)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>

          {/* Stats summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            {[
              { label: "Total Members", value: users.length, color: C.accent },
              {
                label: "Total Assigned Tasks",
                value: tasks.filter((t) => t.assignedTo).length,
                color: C.info,
              },
              {
                label: "Avg Completion",
                value:
                  users.length > 0
                    ? Math.round(
                        (users.reduce((acc, u) => {
                          const s = getUserStats(u.name);
                          return acc + (s.total > 0 ? s.done / s.total : 0);
                        }, 0) /
                          users.length) *
                          100,
                      ) + "%"
                    : "0%",
                color: C.success,
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  padding: "14px 16px",
                  borderLeft: `3px solid ${s.color}`,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: C.subtle,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "6px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{ fontSize: "24px", fontWeight: 700, color: s.color }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Member cards */}
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: C.subtle }}
            >
              Loading team...
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px",
                color: C.subtle,
                background: C.surface,
                borderRadius: "12px",
                border: `1px solid ${C.border}`,
              }}
            >
              No members found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                gap: "14px",
              }}
            >
              {filtered.map((u, i) => {
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const stats = getUserStats(u.name);
                const pct =
                  stats.total > 0
                    ? Math.round((stats.done / stats.total) * 100)
                    : 0;
                return (
                  <div
                    key={u.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: "12px",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = color + "50")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = C.border)
                    }
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
                          width: "46px",
                          height: "46px",
                          borderRadius: "50%",
                          background: `${color}18`,
                          border: `2px solid ${color}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: color,
                          fontWeight: 700,
                          fontSize: "18px",
                        }}
                      >
                        {u.name[0].toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: `${color}18`,
                          color: color,
                          fontWeight: 600,
                        }}
                      >
                        {u.role || "Team Member"}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: C.text,
                        }}
                      >
                        {u.name}
                      </div>
                      <div
                        style={{
                          color: C.success,
                          fontSize: "10px",
                          marginTop: "3px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: C.success,
                            display: "inline-block",
                          }}
                        />
                        Active
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontSize: "10px", color: C.subtle }}>
                          Tasks
                        </span>
                        <span style={{ fontSize: "10px", color: C.muted }}>
                          {stats.done}/{stats.total} · {pct}%
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
                            background: color,
                            width: `${pct}%`,
                            transition: "width 0.4s",
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => deleteUser(u.id)}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: `1px solid ${C.border}`,
                        background: "transparent",
                        color: C.danger,
                        cursor: "pointer",
                        fontSize: "11px",
                        width: "100%",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#ef444415")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      Remove Member
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

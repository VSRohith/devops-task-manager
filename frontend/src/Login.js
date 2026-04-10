import React, { useState, useEffect } from "react";

const C = {
  bg: "#080808",
  surface: "#111",
  surface2: "#181818",
  border: "#222",
  accent: "#f97316",
  accentAlt: "#ea580c",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  subtle: "#444",
  success: "#22c55e",
  error: "#ef4444",
};

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [now, setNow] = useState(new Date());

  // Login fields
  const [loginName, setLoginName] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const h = (now.getHours() % 12 || 12).toString().padStart(2, "0");
  const mn = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  const dayName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][now.getDay()];

  const handleLogin = () => {
    if (!loginName.trim()) return alert("Please enter your name");
    localStorage.setItem("user", loginName.trim());
    window.location.reload();
  };

  const handleRegister = () => {
    setRegError("");
    setRegSuccess("");
    if (!regName.trim()) return setRegError("Full name is required.");
    if (!regRole.trim()) return setRegError("Role / position is required.");
    if (!regEmail.trim() || !regEmail.includes("@"))
      return setRegError("A valid email is required.");

    // Save new user to localStorage user registry
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const exists = users.find(
      (u) => u.name.toLowerCase() === regName.trim().toLowerCase(),
    );
    if (exists) return setRegError("A user with this name already exists.");

    users.push({
      name: regName.trim(),
      role: regRole.trim(),
      email: regEmail.trim(),
    });
    localStorage.setItem("users", JSON.stringify(users));
    setRegSuccess(
      `Account created for "${regName.trim()}". You can now sign in.`,
    );
    setRegName("");
    setRegRole("");
    setRegEmail("");
    setTimeout(() => {
      setRegSuccess("");
      setMode("login");
    }, 2000);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 13px",
    borderRadius: "8px",
    border: `1px solid ${C.border}`,
    background: C.surface2,
    color: C.text,
    fontSize: "13px",
    marginBottom: "12px",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle = {
    fontSize: "11px",
    color: C.muted,
    fontWeight: 600,
    textAlign: "left",
    display: "block",
    marginBottom: "5px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.bg,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "780px",
          width: "100%",
          alignItems: "stretch",
        }}
      >
        {/* ── Left: Branding + Clock panel ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            minWidth: "260px",
            maxWidth: "320px",
          }}
        >
          {/* Brand card */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "16px",
              padding: "28px 24px",
              borderTop: `3px solid ${C.accent}`,
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: `linear-gradient(135deg,${C.accent},${C.accentAlt})`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                marginBottom: "16px",
              }}
            >
              🏗
            </div>
            <h1
              style={{
                color: C.text,
                margin: "0 0 6px",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.3px",
              }}
            >
              VSR Builders
            </h1>
            <p
              style={{
                color: C.muted,
                fontSize: "12px",
                margin: "0 0 18px",
                lineHeight: 1.6,
              }}
            >
              Task Management Platform — manage projects, teams, and
              deliverables in one place.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {[
                "Project Tracking",
                "Team Collaboration",
                "Progress Reports",
              ].map((f) => (
                <div
                  key={f}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: C.accent,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "12px", color: C.muted }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clock card */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "16px",
              padding: "20px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: C.muted,
                letterSpacing: "3px",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              {dayName}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: "3px",
              }}
            >
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: "1px",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}
              >
                {h}:{mn}
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
              <span
                style={{ fontSize: "14px", color: C.muted, marginLeft: "3px" }}
              >
                {ampm}
              </span>
            </div>
            <div
              style={{ marginTop: "8px", fontSize: "12px", color: C.subtle }}
            >
              {monthNames[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
            </div>
            <div
              style={{
                marginTop: "12px",
                height: "2px",
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
        </div>

        {/* ── Right: Auth card ── */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "16px",
            padding: "36px 30px",
            width: "300px",
            borderTop: `3px solid ${C.accent}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              background: C.surface2,
              borderRadius: "10px",
              padding: "4px",
              marginBottom: "28px",
              border: `1px solid ${C.border}`,
            }}
          >
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setMode(tab);
                  setRegError("");
                  setRegSuccess("");
                }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: "7px",
                  border: "none",
                  background:
                    mode === tab
                      ? `linear-gradient(135deg,${C.accent},${C.accentAlt})`
                      : "transparent",
                  color: mode === tab ? "#fff" : C.muted,
                  fontWeight: mode === tab ? 700 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  letterSpacing: "0.3px",
                  transition: "all 0.2s",
                  textTransform: "uppercase",
                }}
              >
                {tab === "login" ? "Sign In" : "New User"}
              </button>
            ))}
          </div>

          {/* ── SIGN IN ── */}
          {mode === "login" && (
            <>
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    color: C.text,
                    margin: "0 0 4px",
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  Welcome back
                </h2>
                <p style={{ color: C.subtle, fontSize: "12px", margin: 0 }}>
                  Sign in to access your workspace
                </p>
              </div>

              <label style={labelStyle}>Your Name</label>
              <input
                style={inputStyle}
                placeholder="Enter your name..."
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                onFocus={(e) => (e.target.style.borderColor = C.accent)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />

              <button
                onClick={handleLogin}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "8px",
                  border: "none",
                  background: `linear-gradient(135deg,${C.accent},${C.accentAlt})`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  letterSpacing: "0.3px",
                  marginTop: "4px",
                }}
              >
                Sign In →
              </button>

              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  background: C.surface2,
                  borderRadius: "8px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: C.subtle,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  New to VSR Builders?{" "}
                  <span
                    onClick={() => setMode("register")}
                    style={{
                      color: C.accent,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Create an account
                  </span>
                </p>
              </div>
            </>
          )}

          {/* ── REGISTER ── */}
          {mode === "register" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    color: C.text,
                    margin: "0 0 4px",
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  Create Account
                </h2>
                <p style={{ color: C.subtle, fontSize: "12px", margin: 0 }}>
                  Register to join the platform
                </p>
              </div>

              <label style={labelStyle}>Full Name</label>
              <input
                style={inputStyle}
                placeholder="Your full name..."
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = C.accent)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />

              <label style={labelStyle}>Role / Position</label>
              <input
                style={inputStyle}
                placeholder="e.g. Site Engineer, Manager..."
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = C.accent)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />

              <label style={labelStyle}>Email Address</label>
              <input
                style={{ ...inputStyle, marginBottom: "16px" }}
                placeholder="you@vsrbuilders.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                onFocus={(e) => (e.target.style.borderColor = C.accent)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />

              {regError && (
                <div
                  style={{
                    padding: "9px 12px",
                    borderRadius: "7px",
                    background: "#1f0a0a",
                    border: `1px solid ${C.error}`,
                    marginBottom: "12px",
                  }}
                >
                  <p style={{ fontSize: "12px", color: C.error, margin: 0 }}>
                    ⚠ {regError}
                  </p>
                </div>
              )}
              {regSuccess && (
                <div
                  style={{
                    padding: "9px 12px",
                    borderRadius: "7px",
                    background: "#0a1f0f",
                    border: `1px solid ${C.success}`,
                    marginBottom: "12px",
                  }}
                >
                  <p style={{ fontSize: "12px", color: C.success, margin: 0 }}>
                    ✓ {regSuccess}
                  </p>
                </div>
              )}

              <button
                onClick={handleRegister}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "8px",
                  border: "none",
                  background: `linear-gradient(135deg,${C.accent},${C.accentAlt})`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  letterSpacing: "0.3px",
                }}
              >
                Create Account →
              </button>

              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: C.subtle, margin: 0 }}>
                  Already have an account?{" "}
                  <span
                    onClick={() => setMode("login")}
                    style={{
                      color: C.accent,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Sign in
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// frontend/src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function Login({ onAuthed }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(localStorage.getItem("accessToken") || "");
  const [msg, setMsg] = useState("");

  // ===== Rate limit state =====
  const [limit, setLimit] = useState(null);        // tổng số lần trong cửa sổ (vd 5)
  const [remaining, setRemaining] = useState(null); // còn lại (vd 3)
  const [cooldown, setCooldown] = useState(0);      // số giây còn bị chặn
  const isCooling = useMemo(() => cooldown > 0, [cooldown]);

  // tick đếm ngược
  useEffect(() => {
    if (!isCooling) return;
    const iv = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [isCooling]);

  // tiện ích đọc headers rate limit
  const readRateHeaders = (resOrErr) => {
    const h = resOrErr?.headers || resOrErr?.response?.headers || {};
    // Header tên thường là lowercase trong axios
    const lim = Number(h["ratelimit-limit"]);
    const rem = Number(h["ratelimit-remaining"]);
    const resetHeader = h["ratelimit-reset"]; // theo express-rate-limit: giây còn lại
    const retryAfterHeader = h["retry-after"]; // giây
    // ưu tiên Retry-After, fallback RateLimit-Reset
    const cd =
      Number(retryAfterHeader) ||
      Number(resetHeader) ||
      0;
    if (!Number.isNaN(lim)) setLimit(lim);
    if (!Number.isNaN(rem)) setRemaining(rem);
    if (!Number.isNaN(cd) && cd > 0) setCooldown(cd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCooling) return; // đang bị chặn
    setMsg(""); setToken("");

    try {
      const { data, headers } = await api.post("/login", { email, password });
      // cập nhật header rate limit (nếu backend gửi cho cả request thành công)
      readRateHeaders({ headers });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.accessToken);
      setMsg("Đăng nhập thành công! (JWT token hiển thị bên dưới)");
      onAuthed?.();
    } catch (err) {
      // đọc headers rate limit để biết còn lại & cooldown
      readRateHeaders(err);

      if (err?.response?.status === 429) {
        setMsg("Bạn đã thử quá nhiều lần. Tạm khoá đăng nhập trong " +
               (cooldown || Number(err?.response?.headers?.["retry-after"]) || Number(err?.response?.headers?.["ratelimit-reset"]) || 0) +
               " giây.");
      } else if (err?.response?.status === 401) {
        setMsg(err.response?.data?.msg || "Sai email/mật khẩu");
      } else if (err?.response?.status === 400) {
        setMsg(err.response?.data?.msg || "Thiếu thông tin");
      } else {
        setMsg(err.response?.data?.message || "Đăng nhập thất bại");
      }
    }
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(token); setMsg("Đã copy token vào clipboard!"); }
    catch { setMsg("Không copy được token."); }
  };

  return (
    <form className="form-box" onSubmit={handleSubmit}>
      <h2>Đăng nhập</h2>

      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isCooling}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isCooling}
      />

      <button type="submit" disabled={isCooling}>
        {isCooling ? `Bị chặn (${cooldown}s)` : "Đăng nhập"}
      </button>

      {/* thanh trạng thái rate limit (nếu backend có gửi header) */}
      {(limit !== null || remaining !== null || isCooling) && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          {limit !== null && <>Giới hạn: {limit} lần/khung&nbsp;•&nbsp;</>}
          {remaining !== null && <>Còn lại: {Math.max(0, remaining)}&nbsp;•&nbsp;</>}
          {isCooling && <>Đang khoá: {cooldown}s</>}
        </p>
      )}

      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}

      {token && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, color: "#555" }}>JWT token:</label>
          <textarea readOnly value={token} rows={3} style={{ width: "100%", fontSize: 12 }} />
          <button type="button" onClick={handleCopy} style={{ marginTop: 6 }}>
            Copy token
          </button>
        </div>
      )}
    </form>
  );
}

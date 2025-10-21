import React, { useState } from "react";
import api from "../api";

export default function Login({ onAuthed }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setToken("");
    try {
      const { data } = await api.post("/login", { email, password }); // { token }
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setMsg("Đăng nhập thành công! (JWT token hiển thị bên dưới)");
      onAuthed?.();
    } catch (err) {
      setMsg(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(token); setMsg("Đã copy token vào clipboard!"); }
    catch { setMsg("Không copy được token."); }
  };

  return (
    <form className="form-box" onSubmit={handleSubmit}>
      <h2>Đăng nhập</h2>
      <input type="email" placeholder="Email" required value={email}
             onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" required value={password}
             onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Đăng nhập</button>

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

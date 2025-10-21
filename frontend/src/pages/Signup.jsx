import React, { useState } from "react";
import api from "../api";

export default function Signup({ onSignedUp }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/signup", { name, email, password });
      setMsg("Tạo tài khoản thành công! Hãy chuyển sang tab Đăng nhập để lấy JWT token.");
      onSignedUp?.();
    } catch (err) {
      setMsg(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <form className="form-box" onSubmit={handleSubmit}>
      <h2>Đăng ký</h2>
      <input type="text" placeholder="Tên hiển thị" required
             value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" required
             value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" required
             value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Tạo tài khoản</button>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
    </form>
  );
}

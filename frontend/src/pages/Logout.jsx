import React, { useState } from "react";
import api from "../api";

export default function Logout({ onLoggedOut }) {
  const [msg, setMsg] = useState("");

  const handleLogout = async () => {
    try { await api.post("/logout"); } catch {}
    localStorage.removeItem("token");
    setMsg("Bạn đã đăng xuất (token đã bị xóa khỏi client).");
    onLoggedOut?.();
  };

  return (
    <div className="form-box">
      <h2>Đăng xuất</h2>
      <p>Bạn có chắc chắn muốn đăng xuất không?</p>
      <button onClick={handleLogout}>Xác nhận đăng xuất</button>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
}

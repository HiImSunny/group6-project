import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));

  // cập nhật trạng thái khi token thay đổi (khi reload trang)
  useEffect(() => {
    setAuthed(!!localStorage.getItem("token"));
  }, []);

  return (
    <div className="container">
      <header>
        <h1>🌍 Group 6 — MERN Auth</h1>
        <nav>
          <button className={page === "login" ? "active" : ""} onClick={() => setPage("login")}>
            Đăng nhập
          </button>
          <button className={page === "signup" ? "active" : ""} onClick={() => setPage("signup")}>
            Đăng ký
          </button>
          <button
            className={page === "logout" ? "active" : ""}
            onClick={() => setPage("logout")}
            disabled={!authed}
            title={!authed ? "Chưa đăng nhập" : ""}
          >
            Đăng xuất
          </button>
        </nav>
      </header>

      <main>
        {page === "login"   && <Login  onAuthed={() => setAuthed(true)} />}
        {page === "signup"  && <Signup onSignedUp={() => { /* ở lại trang này, chỉ báo thành công */ }} />}
        {page === "logout"  && <Logout onLoggedOut={() => setAuthed(false)} />}
      </main>

      <footer>
        <p>© 2025 Group 6 — MERN Stack Project. Built with React.</p>
      </footer>
    </div>
  );
}

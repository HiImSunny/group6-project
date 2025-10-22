import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UploadAvatar from './pages/UploadAvatar';
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
          <button className={page === "profile" ? "active" : ""} onClick={() => setPage("profile")} disabled={!authed} title={!authed ? "Chưa đăng nhập" : ""}>
            Hồ sơ
          </button>
          <button
            className={page === "/admin/users" ? "active" : ""}
            onClick={() => setPage("/admin/users")}>
            Quản lý người dùng
          </button>
          <button
            className={page === "forgot-password" ? "active" : ""}
            onClick={() => setPage("forgot-password")}>
            Quên mật khẩu
          </button>
          <button
            className={page === "reset-password" ? "active" : ""}
            onClick={() => setPage("reset-password")}>
            Đặt lại mật khẩu
          </button>
          <button
            className={page === "upload-avatar" ? "active" : ""}
            onClick={() => setPage("upload-avatar")}
          >
            Tải lên ảnh đại diện
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
        {page === "profile" && <Profile />}
        {page === "/admin/users" && <AdminUsers />}
        {page === "forgot-password" && <ForgotPassword />}
        {page === "reset-password"  && <ResetPassword />}
        {page === "upload-avatar"   && <UploadAvatar />}
        {page === "logout"  && <Logout onLoggedOut={() => setAuthed(false)} />}
      </main>

      <footer>
        <p>© 2025 Group 6 — MERN Stack Project. Built with React.</p>
      </footer>
    </div>
  );
}

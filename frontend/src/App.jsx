// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UploadAvatar from "./pages/UploadAvatar";
import "./App.css";

function Private({ children }) {
  const authed = !!localStorage.getItem("accessToken");
  return authed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const authed = !!localStorage.getItem("accessToken");

  return (
    <BrowserRouter>
      <div className="container">
        <header>
          <h1>🌍 Group 6 — MERN Auth</h1>
          <nav>
            <a href="/login">Đăng nhập</a>
            <a href="/signup">Đăng ký</a>
            <a href="/profile" {...(!authed ? { "aria-disabled": true } : {})}>Hồ sơ</a>
            <a href="/admin/users">Quản lý người dùng</a>
            <a href="/forgot-password">Quên mật khẩu</a>
            <a href="/reset-password">Đặt lại mật khẩu</a>
            <a href="/upload-avatar">Tải lên ảnh đại diện</a>
            <a href="/logout" {...(!authed ? { "aria-disabled": true } : {})}>Đăng xuất</a>
          </nav>
        </header>

        <main>
          <Routes>
            {/* PUBLIC */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* PRIVATE */}
            <Route path="/profile" element={<Private><Profile /></Private>} />
            <Route path="/admin/users" element={<Private><AdminUsers /></Private>} />
            <Route path="/upload-avatar" element={<Private><UploadAvatar /></Private>} />
            <Route path="/logout" element={<Private><Logout /></Private>} />

            {/* default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>

        <footer>
          <p>© 2025 Group 6 — MERN Stack Project. Built with React.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

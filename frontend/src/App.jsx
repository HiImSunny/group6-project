// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useSelector } from "react-redux"; // ⬅️ lấy state auth từ Redux
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import AdminLogs from "./pages/AdminLogs";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UploadAvatar from "./pages/UploadAvatar";
import IfRole from "./components/IfRole";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";

// ❌ Bỏ Private cũ (đọc localStorage, không re-render)
// function Private({ children }) { ... }

export default function App() {
  // ✅ Lấy authed từ Redux để UI tự cập nhật
  const authed = useSelector((s) => !!s.auth.accessToken);

  return (
    <BrowserRouter>
      <div className="container">
        <header>
          <h1>🌍 Group 6 — MERN Auth</h1>
          <nav>
            {/* PUBLIC */}
            {!authed && (
              <>
                <Link to="/login">Đăng nhập</Link>
                <Link to="/signup">Đăng ký</Link>
                <Link to="/forgot-password">Quên mật khẩu</Link>
                <Link to="/reset-password">Đặt lại mật khẩu</Link>
              </>
            )}

            {/* PRIVATE */}
            {authed && (
              <>
                <Link to="/profile">Hồ sơ</Link>
                <Link to="/upload-avatar">Tải lên ảnh đại diện</Link>

                {/* Chỉ admin hoặc moderator mới thấy */}
                <IfRole role={["admin", "moderator"]}>
                  <Link to="/admin/users">Quản lý người dùng</Link>
                  <Link to="/admin/logs">Xem nhật ký</Link>
                </IfRole>

                <Link to="/logout">Đăng xuất</Link>
              </>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            {/* PUBLIC */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* PRIVATE (bọc bằng ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload-avatar" element={<UploadAvatar />} />

              {/* Chỉ admin/moderator mới truy cập */}
              <Route
                path="/admin/users"
                element={
                  <IfRole role={["admin", "moderator"]}>
                    <AdminUsers />
                  </IfRole>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <IfRole role={["admin", "moderator"]}>
                    <AdminLogs />
                  </IfRole>
                }
              />

              <Route path="/logout" element={<Logout />} />
            </Route>

            {/* default */}
            <Route path="/" element={<Navigate to={authed ? "/profile" : "/login"} replace />} />
            <Route path="*" element={<Navigate to={authed ? "/profile" : "/login"} replace />} />
          </Routes>
        </main>

        <footer>
          <p>© 2025 Group 6 — MERN Stack Project. Built with React.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

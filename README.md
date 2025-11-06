# 🧠 Group6 Project – Quản lý người dùng MongoDB + React + Node.js  

## 🌟 Giới thiệu  
Dự án mẫu thực hành **fullstack MERN** – giúp sinh viên hiểu cách kết nối **Frontend (React)**, **Backend (Node/Express)** và **Database (MongoDB Atlas)**, đồng thời áp dụng các kỹ thuật xác thực và quản lý quyền nâng cao (JWT, RBAC, Redux, Upload Avatar).  

---

## ⚙️ Công nghệ sử dụng  
| Tầng | Công nghệ | Ghi chú |
|------|------------|---------|
| **Frontend** | React 18 + Vite / CRA + Axios + Redux Toolkit | Redux store lưu user & token, Protected Routes |
| **Backend** | Node.js + Express + Mongoose + JWT + Multer + Sharp | API xác thực, phân quyền, upload avatar |
| **Database** | MongoDB Atlas / local MongoDB | Lưu user, logs, token |
| **Bảo mật** | Helmet + CORS + express-rate-limit + bcrypt | Ngăn tấn công và giới hạn login |
| **Khác** | Cloudinary (ảnh), Nodemailer (email), Git Flow | Triển khai upload & reset password |

---

## 🚀 Cách chạy dự án  

### 1️⃣ Cài đặt dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2️⃣ Khởi động server backend

```bash
cd backend
node server.js
```

> Server chạy tại **[http://localhost:3000](http://localhost:3000)**

### 3️⃣ Chạy frontend React

```bash
cd frontend
npm start
```

> Ứng dụng React chạy tại **[http://localhost:4000](http://localhost:4000)**

## 👥 Phân công nhóm

| Thành viên          | Vai trò                | Công việc chính                                                      |
| ------------------- | ---------------------- | -------------------------------------------------------------------- |
| **Lương Duy Khang** | Frontend & Backend     | Xây dựng giao diện React, Redux store, API Axios, logic Auth Node.js |
| **Phan Minh Khôi**  | Database & Integration | Thiết kế schema MongoDB, seed dữ liệu, tích hợp Atlas & Cloudinary, Kiểm thử Postman   |

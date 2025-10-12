import React, { useState } from "react";
import axios from "axios";

function AddUser({ fetchUsers }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Kiểm tra trống tên
    if (!name.trim()) {
      alert("Name không được để trống");
      return;
    }

    // ✅ Kiểm tra định dạng email
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Email không hợp lệ");
      return;
    }

    try {
      await axios.post("http://localhost:3000/users", { name, email });
      alert("Thêm người dùng thành công!");
      setName("");
      setEmail("");
      fetchUsers(); // gọi lại danh sách user từ parent component
    } catch (err) {
      console.error("Lỗi thêm user:", err);
      alert("Không thể thêm người dùng. Vui lòng thử lại!");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <h3>Thêm người dùng mới</h3>

      <input
        type="text"
        placeholder="Tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <button type="submit" style={{ width: "100%", padding: "8px" }}>
        Thêm người dùng
      </button>
    </form>
  );
}

export default AddUser;

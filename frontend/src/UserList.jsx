import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Lấy danh sách user từ backend
  useEffect(() => {
    axios.get("http://localhost:3000/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Lỗi tải dữ liệu:", err));
  }, []);

  // Xử lý XÓA user
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      setUsers(users.filter(user => user._id !== id)); // cập nhật lại danh sách
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  // Khi nhấn "Sửa" → hiện form với dữ liệu user
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  // Gửi PUT request để cập nhật
  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      await axios.put(`http://localhost:3000/users/${editingUser._id}`, {
        name: editName,
        email: editEmail,
      });

      // cập nhật danh sách trên UI
      setUsers(users.map(u => u._id === editingUser._id ? { ...u, name: editName, email: editEmail } : u));

      // reset form
      setEditingUser(null);
      setEditName("");
      setEditEmail("");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
    }
  };

  return (
    <div style={{ width: "400px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Danh sách người dùng</h2>

      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} - {user.email}
            <button onClick={() => handleEdit(user)}>Sửa</button>
            <button onClick={() => handleDelete(user._id)}>Xóa</button>
          </li>
        ))}
      </ul>

      {editingUser && (
        <div style={{ marginTop: "20px" }}>
          <h3>Sửa thông tin</h3>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Tên"
          />
          <input
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="Email"
          />
          <button onClick={handleUpdate}>Lưu</button>
          <button onClick={() => setEditingUser(null)}>Hủy</button>
        </div>
      )}
    </div>
  );
}

export default UserList;

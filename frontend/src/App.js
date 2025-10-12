import React, { useState, useEffect } from "react";
import axios from "axios";
import AddUser from "./AddUser";

function App() {
  const [users, setUsers] = useState([]);

  // Hàm lấy dữ liệu user từ backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  // Gọi fetchUsers khi component load
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ width: "400px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Danh sách người dùng</h2>

      <AddUser fetchUsers={fetchUsers} />

      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
// code frontend: thêm giao diện hiển thị + API kết nối


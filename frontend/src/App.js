import React, { useState, useEffect } from "react";
import axios from "axios";
import AddUser from "./AddUser";
import UserList from "./UserList";

function App() {
  const [users, setUsers] = useState([]);

  // Lấy danh sách user
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users"); // ⚠️ Đảm bảo đúng port backend
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Khi thêm user mới
  const handleUserAdded = (newUser) => {
    setUsers([...users, newUser]);
  };

  return (
    <div style={{ width: "400px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Danh sách người dùng (MongoDB)</h2>
      <AddUser onUserAdded={handleUserAdded} />
      <UserList users={users} />
    </div>
  );
}

export default App;

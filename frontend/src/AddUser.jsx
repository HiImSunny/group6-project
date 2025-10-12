import React, { useState } from 'react';
import axios from 'axios';

function AddUser({ onUserAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) return alert("Vui lòng nhập đầy đủ!");

    try {
      const res = await axios.post('http://localhost:3000/users', { name, email });
      onUserAdded(res.data);
      setName('');
      setEmail('');
    } catch (err) {
      console.error("Lỗi thêm user:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Tên" value={name} onChange={e => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <button type="submit">Thêm người dùng</button>
    </form>
  );
}

export default AddUser;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setToken(p.get('token') || '');
    setEmail(p.get('email') || '');
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await axios.post('http://localhost:3000/reset-password', { email, token, newPassword });
      setMsg('Đổi mật khẩu thành công. Hãy đăng nhập lại.');
    } catch (e) {
      console.error(e);
      setMsg('Token không hợp lệ hoặc đã hết hạn.');
    }
  };

  return (
    <div>
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={onSubmit}>
        <div>Email: <strong>{email || '(chưa có)'}</strong></div>
        <label>Mật khẩu mới</label>
        <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
        <button type="submit">Đổi mật khẩu</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

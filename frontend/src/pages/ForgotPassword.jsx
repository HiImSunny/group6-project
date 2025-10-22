import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await axios.post('http://localhost:3000/forgot-password', { email });
      setMsg('Nếu email tồn tại, token reset đã được gửi.');
    } catch (e) {
      console.error(e);
      setMsg('Có lỗi xảy ra.');
    }
  };

  return (
    <div>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <button type="submit">Gửi token reset</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

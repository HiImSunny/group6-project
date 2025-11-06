import React, { useState } from 'react';
import api from '../api/http';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMsg('Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.');
    } catch (e) {
      setMsg('Không gửi được yêu cầu. Thử lại sau.');
    }
  };

  return (
    <div>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={submit}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
        <button type="submit">Gửi</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

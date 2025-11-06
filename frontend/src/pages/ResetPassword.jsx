import React, { useState, useMemo } from 'react';
import api from '../api/http';

export default function ResetPassword() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const email = params.get('email') || '';
  const token = params.get('token') || '';

  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.post('/auth/reset-password', { email, token, newPassword: pw });
      setMsg(res?.data?.msg || 'Đổi mật khẩu thành công, hãy đăng nhập lại.');
    } catch (e) {
      const m = e?.response?.data?.msg || 'Đổi mật khẩu thất bại.';
      setMsg(m);
    }
  };

  return (
    <div>
      <h2>Đặt lại mật khẩu</h2>
      <p>Email: {email || '(không có)'} </p>
      <form onSubmit={submit}>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Mật khẩu mới" required />
        <button type="submit">Đổi mật khẩu</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

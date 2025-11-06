// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import api from "../api/http";

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', avatarUrl: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await api.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const u = res?.data?.user || res?.data || {}; // bóc đúng field user
        setProfile({
          name:  u.name  ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          avatarUrl: u.avatarUrl ?? ''
        });
      } catch (e) {
        console.error('Fetch profile error:', e);
        setMessage('Không tải được hồ sơ. Hãy đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) =>
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');

      // tuỳ backend cho phép đổi gì, thường KHÔNG cho đổi email
      const body = { name: profile.name, phone: profile.phone };

      const res = await api.put('/profile', body, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const u = res?.data?.user || res?.data || {};
      const next = {
        name:  u.name  ?? profile.name ?? '',
        email: u.email ?? profile.email ?? '',
        phone: u.phone ?? profile.phone ?? '',
        avatarUrl: u.avatarUrl ?? profile.avatarUrl ?? ''
      };
      setProfile(next);
      setMessage('Cập nhật thành công!');

      // đồng bộ cache "me" để nơi khác (ví dụ header/avatar) dùng
      const meOld = JSON.parse(localStorage.getItem('me') || '{}');
      localStorage.setItem('me', JSON.stringify({ ...meOld, ...next }));
    } catch (e) {
      console.error('Update profile error:', e);
      setMessage('Cập nhật thất bại.');
    }
  };

  const me = JSON.parse(localStorage.getItem('me') || '{}');
  const avatar = profile.avatarUrl || me.avatarUrl || 'https://via.placeholder.com/140';

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="profile">
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={handleSubmit}>
        <img src={avatar} alt="avatar" width={140} height={140} />

        <label>Tên</label>
        <input
          name="name"
          value={profile.name ?? ''}
          onChange={handleChange}
          placeholder="Nhập tên"
        />

        <label>Email</label>
        <input
          name="email"
          type="email"
          value={profile.email ?? ''}
          onChange={handleChange}
          readOnly // thường không cho đổi email; bỏ nếu backend cho phép
        />

        <label>Điện thoại</label>
        <input
          name="phone"
          type="tel"
          value={profile.phone ?? ''}
          onChange={handleChange}
          placeholder="09xxxxxxxx"
        />

        <pre style={{ background: '#f6f6f6', padding: 8 }}>
{JSON.stringify(profile, null, 2)}
        </pre>

        <button type="submit">Lưu thay đổi</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

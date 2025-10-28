import React, { useState, useEffect } from 'react';
import api from "../api/http";

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get('/profile');
      setProfile(res.data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await api.put('/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Cập nhật thành công!');
      setProfile(res.data);
    } catch {
      setMessage('Cập nhật thất bại.');
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="profile">
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={handleSubmit}>
        <label>Tên</label>
        <input name="name" value={profile.name} onChange={handleChange} />

        <label>Email</label>
        <input name="email" value={profile.email} onChange={handleChange} />

        <pre>{JSON.stringify(profile, null, 2)}</pre>

        <button type="submit">Lưu thay đổi</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

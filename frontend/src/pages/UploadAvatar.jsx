// frontend/src/pages/UploadAvatar.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL; // theo README backend cổng 3000

export default function UploadAvatar() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [url, setUrl] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!file) return setMsg('Chọn ảnh trước.');

    const form = new FormData();
    form.append('file', file);

    try {
      const token = localStorage.getItem('accessToken'); // đồng bộ key
      const res = await axios.post(`${API}/upload-avatar`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setMsg('Upload thành công!');
      setUrl(res.data.url);

      // Cập nhật user cache nếu bạn có lưu trong localStorage
      if (res.data?.user) {
        localStorage.setItem('me', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error(e);
      const detail = e?.response?.data?.detail || e.message;
      setMsg(`Upload thất bại: ${detail}`);
    }
  };

  return (
    <div>
      <h2>Upload Avatar</h2>
      <form onSubmit={onSubmit}>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0])} />
        <button type="submit">Tải lên</button>
      </form>
      {msg && <p>{msg}</p>}
      {url && <img src={url} alt="avatar" width={140} height={140} />}
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';

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
      const token = localStorage.getItem('token'); // JWT từ login
      const res = await axios.post('http://localhost:3000/upload-avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setMsg('Upload thành công!');
      setUrl(res.data.url);
    } catch (e) {
      console.error(e);
      setMsg('Upload thất bại (kiểm tra token/định dạng ảnh).');
    }
  };

  return (
    <div>
      <h2>Upload Avatar</h2>
      <form onSubmit={onSubmit}>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
        <button type="submit">Tải lên</button>
      </form>
      {msg && <p>{msg}</p>}
      {url && <img src={url} alt="avatar" width={140} height={140} />}
    </div>
  );
}

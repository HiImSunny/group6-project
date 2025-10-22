import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminUsers() {
  const [data, setData] = useState({ items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [msg, setMsg] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (q) params.q = q;
      if (role) params.role = role;
      const res = await api.get('/users', { params });
      setData(res.data);
    } catch (e) {
  if (e?.response?.status === 403) {
    setMsg('Bạn không có quyền Admin. Vui lòng đăng nhập bằng tài khoản Admin.');
  } else if (e?.response?.status === 401) {
    setMsg('Thiếu hoặc sai token. Hãy đăng nhập lại.');
  } else {
    setMsg('Không tải được danh sách.');
  }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1); /* on mount */ }, []);

  const onSearch = (e) => { e.preventDefault(); fetchUsers(1); };

  const onDelete = async (id) => {
    if (!window.confirm('Xóa tài khoản này?')) return;
    try {
      await api.delete(`/users/${id}`);
      setMsg('Đã xóa.');
      // reload current page
      fetchUsers(data.pagination.page);
    } catch (e) {
      setMsg('Xóa thất bại (cần Admin hoặc là chính bạn).');
      console.error(e);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>Admin • Danh sách người dùng</h2>

      <form onSubmit={onSearch} style={{ marginBottom: 12 }}>
        <input placeholder="Tìm theo tên/email" value={q} onChange={e => setQ(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit">Tìm</button>
      </form>

      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Email</th><th>Tên</th><th>Role</th><th>Thời gian</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(u => (
            <tr key={u._id}>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => onDelete(u._id)}>Xóa</button>
              </td>
            </tr>
          ))}
          {data.items.length === 0 && (
            <tr><td colSpan="6">Không có người dùng.</td></tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: 8 }}>
        Trang {data.pagination.page}/{data.pagination.pages} • Tổng {data.pagination.total}
        <div style={{ display: 'inline-block', marginLeft: 8 }}>
          <button disabled={data.pagination.page <= 1} onClick={() => fetchUsers(data.pagination.page - 1)}>« Trước</button>
          <button disabled={data.pagination.page >= data.pagination.pages} onClick={() => fetchUsers(data.pagination.page + 1)}>Sau »</button>
        </div>
      </div>

      {msg && <p style={{ color: 'green' }}>{msg}</p>}
    </div>
  );
}

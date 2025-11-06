import React, { useEffect, useState } from 'react';
import api from '../api/http';

const DEFAULT_PAGE = { page: 1, limit: 20, total: 0, pages: 0 };
const emptyState = { items: [], pagination: DEFAULT_PAGE };

function normalizeUsersResponse(resData) {
  // Các khả năng backend hay trả:
  // 1) { items: [...], pagination: {...} }
  // 2) { data: { items: [...], pagination: {...} } }
  // 3) [ ... ]  (mảng thuần)
  // 4) { users: [...], total, page, pages }  (tự do)
  if (!resData) return emptyState;

  // bao resData.data
  const d = resData.data ?? resData;

  // Trường hợp là mảng thuần
  if (Array.isArray(d)) {
    return { items: d, pagination: DEFAULT_PAGE };
  }

  // Trường hợp có items/pagination chuẩn
  if (Array.isArray(d.items)) {
    return {
      items: d.items,
      pagination: d.pagination || {
        page: d.page ?? 1,
        limit: d.limit ?? 20,
        total: d.total ?? d.items.length,
        pages: d.pages ?? 1,
      }
    };
  }

  // Trường hợp field tên khác (users)
  if (Array.isArray(d.users)) {
    return {
      items: d.users,
      pagination: {
        page: d.page ?? 1,
        limit: d.limit ?? 20,
        total: d.total ?? d.users.length,
        pages: d.pages ?? 1,
      }
    };
  }

  // fallback
  return emptyState;
}

export default function AdminUsers() {
  const [data, setData] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [msg, setMsg] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setMsg('');
    try {
      const params = { page, limit: 20 };
      if (q) params.q = q;
      if (role) params.role = role;

      const res = await api.get('/admin/users', { params });
      const normalized = normalizeUsersResponse(res.data);
      setData(normalized);
    } catch (e) {
      // Giữ state an toàn để render không vỡ
      setData(emptyState);

      if (e?.response?.status === 403) {
        setMsg('Bạn không có quyền Admin. Vui lòng đăng nhập bằng tài khoản Admin.');
      } else if (e?.response?.status === 401) {
        setMsg('Thiếu hoặc sai token. Hãy đăng nhập lại.');
      } else {
        setMsg('Không tải được danh sách.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1); }, []); // on mount

  const onSearch = (e) => { e.preventDefault(); fetchUsers(1); };

  const onDelete = async (id) => {
    if (!window.confirm('Xóa tài khoản này?')) return;
    try {
      await api.delete(`/users/${id}`);
      setMsg('Đã xóa.');
      fetchUsers(data.pagination.page || 1);
    } catch (e) {
      setMsg('Xóa thất bại (cần Admin hoặc là chính bạn).');
      console.error(e);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  const items = data?.items ?? [];
  const pg = data?.pagination ?? DEFAULT_PAGE;

  return (
    <div>
      <h2>Admin • Danh sách người dùng</h2>

      <form onSubmit={onSearch} style={{ marginBottom: 12 }}>
        <input placeholder="Tìm theo tên/email" value={q} onChange={e => setQ(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
          {/* Nếu backend có moderator thì thêm */}
          <option value="moderator">moderator</option>
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
          {items.map(u => (
            <tr key={u._id || u.id || u.email}>
              <td>{u.email}</td>
              <td>{u.name || u.fullName || '-'}</td>
              <td>{u.role || u.roles?.[0] || 'User'}</td>
              <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
              <td>
                <button onClick={() => onDelete(u._id || u.id)}>Xóa</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan="6">Không có người dùng.</td></tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: 8 }}>
        Trang {pg.page}/{pg.pages} • Tổng {pg.total}
        <div style={{ display: 'inline-block', marginLeft: 8 }}>
          <button disabled={(pg.page || 1) <= 1} onClick={() => fetchUsers((pg.page || 1) - 1)}>« Trước</button>
          <button disabled={(pg.page || 1) >= (pg.pages || 1)} onClick={() => fetchUsers((pg.page || 1) + 1)}>Sau »</button>
        </div>
      </div>

      {msg && <p style={{ color: msg.includes('không') || msg.includes('Thiếu') ? 'crimson' : 'green' }}>{msg}</p>}
    </div>
  );
}

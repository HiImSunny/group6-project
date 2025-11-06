import React, { useEffect, useState } from 'react';
import api from '../api/http';

export default function AdminLogs() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState({ action: '', userId: '', page: 1, limit: 20 });

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const params = new URLSearchParams(q).toString();
        const res = await api.get(`/admin/logs?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(res?.data?.items || []);
      } catch (e) { console.error(e); }
    })();
  }, [q]);

  return (
    <div>
      <h2>Activity Logs</h2>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="action" value={q.action}
               onChange={e=>setQ(s=>({...s, action: e.target.value, page: 1}))}/>
        <input placeholder="userId" value={q.userId}
               onChange={e=>setQ(s=>({...s, userId: e.target.value, page: 1}))}/>
        <button onClick={()=>setQ(s=>({...s, page: Math.max(1, s.page-1)}))}>Prev</button>
        <button onClick={()=>setQ(s=>({...s, page: s.page+1}))}>Next</button>
      </div>
      <table border="1" cellPadding="6" style={{marginTop:12, width:'100%'}}>
        <thead>
          <tr>
            <th>Time</th><th>User</th><th>Action</th><th>Path</th>
            <th>IP</th><th>Status</th><th>Meta</th>
          </tr>
        </thead>
        <tbody>
          {items.map(x=>(
            <tr key={x._id}>
              <td>{new Date(x.createdAt).toLocaleString()}</td>
              <td>{x.userId || '-'}</td>
              <td>{x.action}</td>
              <td>{x.method} {x.path}</td>
              <td>{x.ip}</td>
              <td>{x.status}</td>
              <td><pre style={{margin:0}}>{JSON.stringify(x.meta||{}, null, 2)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../api.js';
import SortableTh from '../components/SortableTh.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [uFilters, setUFilters] = useState({ name:'', email:'', address:'', role:'' });
  const [uSort, setUSort] = useState({ sortBy:'created_at', sortOrder:'desc' });
  const [sFilters, setSFilters] = useState({ name:'', email:'', address:'' });
  const [sSort, setSSort] = useState({ sortBy:'created_at', sortOrder:'desc' });

  const loadStats = async () => {
    const { data } = await api.get('/admin/dashboard');
    setStats(data);
  };

  const loadUsers = async () => {
    const { data } = await api.get('/admin/users', { params: { ...uFilters, ...uSort } });
    setUsers(data);
  };

  const loadStores = async () => {
    const { data } = await api.get('/admin/stores', { params: { ...sFilters, ...sSort } });
    setStores(data);
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadUsers(); }, [uFilters, uSort]);
  useEffect(() => { loadStores(); }, [sFilters, sSort]);

  const onUSort = (field, order) => setUSort({ sortBy: field, sortOrder: order });
  const onSSort = (field, order) => setSSort({ sortBy: field, sortOrder: order });

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div style={{ display:'flex', gap:16, marginBottom:16 }}>
        <div>Users: {stats.totalUsers}</div>
        <div>Stores: {stats.totalStores}</div>
        <div>Ratings: {stats.totalRatings}</div>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h3>Users</h3>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <input placeholder="Name" value={uFilters.name} onChange={e=>setUFilters({...uFilters,name:e.target.value})} />
          <input placeholder="Email" value={uFilters.email} onChange={e=>setUFilters({...uFilters,email:e.target.value})} />
          <input placeholder="Address" value={uFilters.address} onChange={e=>setUFilters({...uFilters,address:e.target.value})} />
          <select value={uFilters.role} onChange={e=>setUFilters({...uFilters,role:e.target.value})}>
            <option value="">Any Role</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
            <option value="owner">owner</option>
          </select>
        </div>
        <table border="1" cellPadding="6" cellSpacing="0">
          <thead>
            <tr>
              <SortableTh field="name" label="Name" sortBy={uSort.sortBy} sortOrder={uSort.sortOrder} onSort={onUSort}/>
              <SortableTh field="email" label="Email" sortBy={uSort.sortBy} sortOrder={uSort.sortOrder} onSort={onUSort}/>
              <SortableTh field="address" label="Address" sortBy={uSort.sortBy} sortOrder={uSort.sortOrder} onSort={onUSort}/>
              <SortableTh field="role" label="Role" sortBy={uSort.sortBy} sortOrder={uSort.sortOrder} onSort={onUSort}/>
              <SortableTh field="created_at" label="Created" sortBy={uSort.sortBy} sortOrder={uSort.sortOrder} onSort={onUSort}/>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Stores</h3>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <input placeholder="Name" value={sFilters.name} onChange={e=>setSFilters({...sFilters,name:e.target.value})} />
          <input placeholder="Email" value={sFilters.email} onChange={e=>setSFilters({...sFilters,email:e.target.value})} />
          <input placeholder="Address" value={sFilters.address} onChange={e=>setSFilters({...sFilters,address:e.target.value})} />
        </div>
        <table border="1" cellPadding="6" cellSpacing="0">
          <thead>
            <tr>
              <SortableTh field="name" label="Name" sortBy={sSort.sortBy} sortOrder={sSort.sortOrder} onSort={onSSort}/>
              <SortableTh field="email" label="Email" sortBy={sSort.sortBy} sortOrder={sSort.sortOrder} onSort={onSSort}/>
              <SortableTh field="address" label="Address" sortBy={sSort.sortBy} sortOrder={sSort.sortOrder} onSort={onSSort}/>
              <SortableTh field="rating" label="Rating" sortBy={sSort.sortBy} sortOrder={sSort.sortOrder} onSort={onSSort}/>
              <SortableTh field="created_at" label="Created" sortBy={sSort.sortBy} sortOrder={sSort.sortOrder} onSort={onSSort}/>
            </tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email || '-'}</td>
                <td>{s.address}</td>
                <td>{s.rating}</td>
                <td>{s.rating_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../api.js';
import SortableTh from '../components/SortableTh.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Stores() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    const { data } = await api.get('/stores', { params: { q, sortBy, sortOrder } });
    setRows(data);
  };

  useEffect(() => { fetchData(); }, [q, sortBy, sortOrder]);

  const onSort = (field, order) => { setSortBy(field); setSortOrder(order); };

  const rate = async (storeId, val) => {
    try {
      await api.post(`/stores/${storeId}/rate`, { rating: val });
      setMessage('Rating saved');
      fetchData();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Failed to rate');
    } finally {
      setTimeout(()=>setMessage(''), 1200);
    }
  };

  return (
    <div>
      <h2>Stores</h2>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="Search name or address" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      {message && <div>{message}</div>}
      <table border="1" cellPadding="6" cellSpacing="0">
        <thead>
          <tr>
            <SortableTh field="name" label="Store Name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <SortableTh field="address" label="Address" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <SortableTh field="rating" label="Overall Rating" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <th>Your Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.address}</td>
              <td>{r.overall_rating ?? 0}</td>
              <td>{r.user_rating ?? '-'}</td>
              <td>
                {user?.role === 'user' ? (
                  <select value={r.user_rating ?? ''} onChange={e => rate(r.id, Number(e.target.value))}>
                    <option value="" disabled>Rate</option>
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

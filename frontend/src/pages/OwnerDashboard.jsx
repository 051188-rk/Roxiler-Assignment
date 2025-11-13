import { useEffect, useState } from 'react';
import api from '../api.js';

export default function OwnerDashboard() {
  const [data, setData] = useState({ stores: [] });

  const load = async () => {
    const { data } = await api.get('/owner/dashboard');
    setData(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Owner Dashboard</h2>
      {data.stores.map(st => (
        <div key={st.storeId} style={{ marginBottom: 24 }}>
          <h3>{st.storeName}</h3>
          <div>Average Rating: {st.avgRating} ({st.ratingCount} ratings)</div>
          <table border="1" cellPadding="6" cellSpacing="0">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {st.raters.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.rating}</td>
                  <td>{new Date(r.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

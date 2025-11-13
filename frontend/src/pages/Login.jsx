import { useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/stores';

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth:420 }}>
      <h2>Login</h2>
      {err && <div style={{ color:'red' }}>{err}</div>}
      <div>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
      </div>
      <div>
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

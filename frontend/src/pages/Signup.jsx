import { useState } from 'react';
import api from '../api.js';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    if (name.length < 20 || name.length > 60) { setErr('Name must be 20-60 chars'); return; }
    if (address.length > 400) { setErr('Address max 400 chars'); return; }
    const pwOk = password.length>=8 && password.length<=16 && /[A-Z]/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    if (!pwOk) { setErr('Password must be 8-16 with uppercase and special char'); return; }
    try {
      await api.post('/auth/signup', { name, email, address, password });
      setOk('Signup successful, please login');
      setTimeout(()=>navigate('/login'), 800);
    } catch (e) {
      setErr(e.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth:520 }}>
      <h2>Signup</h2>
      {err && <div style={{ color:'red' }}>{err}</div>}
      {ok && <div style={{ color:'green' }}>{ok}</div>}
      <div>
        <label>Name (20-60)</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
      </div>
      <div>
        <label>Address (<=400)</label>
        <textarea value={address} onChange={e=>setAddress(e.target.value)} maxLength={400} required />
      </div>
      <div>
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
      </div>
      <button type="submit">Create Account</button>
    </form>
  );
}

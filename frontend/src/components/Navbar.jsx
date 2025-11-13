import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display:'flex', gap:12, padding:12, borderBottom:'1px solid #ddd' }}>
      <Link to="/stores">Stores</Link>
      {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      {user?.role === 'owner' && <Link to="/owner">Owner</Link>}
      <div style={{ marginLeft: 'auto' }}>
        {!user && <>
          <Link to="/login">Login</Link>
          <span> | </span>
          <Link to="/signup">Signup</Link>
        </>}
        {user && <>
          <span>{user.name}</span>
          <span> | </span>
          <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </>}
      </div>
    </div>
  );
}

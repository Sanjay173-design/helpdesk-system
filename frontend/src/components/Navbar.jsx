import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-brand-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-semibold text-lg tracking-tight">
          Helpdesk
        </Link>
        <Link to="/" className="text-sm text-brand-50 hover:text-white">
          Tickets
        </Link>
        {user.role === 'customer' && (
          <Link to="/tickets/new" className="text-sm text-brand-50 hover:text-white">
            New Ticket
          </Link>
        )}
        {user.role === 'admin' && (
          <Link to="/users" className="text-sm text-brand-50 hover:text-white">
            Users
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-brand-50">
          {user.name} <span className="opacity-70">({user.role})</span>
        </span>
        <button
          onClick={handleLogout}
          className="bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-md transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

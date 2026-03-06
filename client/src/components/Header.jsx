import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-blue-600">RoomFinder</Link>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600">Home</Link>
          {user && <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600">Dashboard</Link>}
          {!user ? (
            <>
              <Link to="/login" className="rounded-lg border border-blue-300 px-3 py-1.5 text-sm text-blue-600">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Signup</Link>
            </>
          ) : (
            <button type="button" className="btn-primary text-sm" onClick={logout}>Logout</button>
          )}
        </div>
      </nav>
    </header>
  );
}

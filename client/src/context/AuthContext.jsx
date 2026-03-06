import { createContext, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('rf_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('rf_token', data.token);
    localStorage.setItem('rf_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Welcome back to RoomFinder!');
  };

  const register = async (payload) => {
    await api.post('/auth/register', payload);
    toast.success('Account created. Please login.');
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('rf_token');
    localStorage.removeItem('rf_user');
    setUser(null);
    toast('Logged out', { icon: '👋' });
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

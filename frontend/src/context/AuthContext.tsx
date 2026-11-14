import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../api/client';

interface User { id: number; email: string; displayName: string; role: string; }
interface AuthCtx { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; register: (d: any) => Promise<void>; logout: () => void; }

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nex_token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('nex_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('nex_token', data.token);
    localStorage.setItem('nex_user', JSON.stringify({ id: data.userId, email: data.email, displayName: data.displayName, role: data.role }));
    setToken(data.token);
    setUser({ id: data.userId, email: data.email, displayName: data.displayName, role: data.role });
  };

  const register = async (d: any) => {
    const { data } = await api.post('/auth/register', d);
    localStorage.setItem('nex_token', data.token);
    localStorage.setItem('nex_user', JSON.stringify({ id: data.userId, email: data.email, displayName: data.displayName, role: data.role }));
    setToken(data.token);
    setUser({ id: data.userId, email: data.email, displayName: data.displayName, role: data.role });
  };

  const logout = () => {
    localStorage.removeItem('nex_token');
    localStorage.removeItem('nex_user');
    setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, token, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('no auth');
  return c;
};
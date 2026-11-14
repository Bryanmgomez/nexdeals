import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Panel de administración</h1>
      {stats && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4"><p className="text-gray-400">Usuarios</p><p className="text-2xl font-bold">{stats.users}</p></div>
          <div className="card p-4"><p className="text-gray-400">Juegos</p><p className="text-2xl font-bold">{stats.games}</p></div>
          <div className="card p-4"><p className="text-gray-400">Ofertas</p><p className="text-2xl font-bold">{stats.offers}</p></div>
        </div>
      )}
      <h2 className="text-xl font-bold mb-3">Usuarios</h2>
      <div className="card p-4">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
            <span>{u.email} — {u.displayName}</span>
            <span className="text-xs text-gray-500">{u.roles?.map((r: any) => r.name).join(', ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
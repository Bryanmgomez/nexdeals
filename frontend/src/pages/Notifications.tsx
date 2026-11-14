import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/notifications').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const shown = filter === 'all' ? items : filter === 'unread' ? items.filter(i => !i.read) : items.filter(i => i.type === filter);

  const mark = async (id: number) => { await api.post(`/notifications/${id}/read`); load(); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <button onClick={async () => { await api.post('/notifications/read-all'); load(); }} className="text-sm text-violet-400 hover:underline">Marcar todas como leídas</button>
      </div>
      <div className="flex gap-2 mb-4">
        {['all','unread','PRICE_ALERT'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm ${filter === f ? 'bg-violet-600' : 'bg-gray-800'}`}>
            {f === 'all' ? 'Todas' : f === 'unread' ? 'No leídas' : 'Alertas'}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {shown.map(n => (
          <div key={n.id} className={`card p-4 ${n.read ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-400">{n.title}</span>
              {!n.read && <button onClick={() => mark(n.id)} className="text-xs text-violet-400">Marcar leída</button>}
            </div>
            <p className="text-gray-300 text-sm mt-1">{n.message}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-500">Sin notificaciones.</p>}
      </div>
    </div>
  );
}
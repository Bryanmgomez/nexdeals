import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/users/me').then(r => {
      setData(r.data); setName(r.data.displayName); setCountry(r.data.country); setCurrency(r.data.currency);
    }).catch(() => {});
  }, [user]);

  const save = async () => {
    try {
      await api.put('/users/me', { displayName: name, country, currency });
      toast.show('Perfil actualizado', 'success');
    } catch { toast.show('Error', 'error'); }
  };

  if (!user) return <div className="p-8">Inicia sesión.</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mi perfil</h1>
      <div className="card p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-400">Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border border-violet-500/30 rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-gray-400">País</label>
          <input value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-gray-900 border border-violet-500/30 rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-gray-400">Moneda</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-gray-900 border border-violet-500/30 rounded px-3 py-2">
            {['COP','USD','EUR','MXN','BRL','GBP','JPY'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={save} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded">Guardar</button>
        {data && <p className="text-xs text-gray-500">Email: {data.email}</p>}
      </div>
    </div>
  );
}
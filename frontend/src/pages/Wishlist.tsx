import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [sort, setSort] = useState('name');
  const [recommended, setRecommended] = useState<any[]>([]);

  const load = () => {
    if (!user) return;
    api.get('/wishlists').then(r => {
      Promise.all(r.data.map(async (w: any) => {
        const items = await api.get(`/wishlists/${w.id}/items`);
        return { ...w, items: items.data };
      })).then(setWishlists);
    }).catch(() => {});
    api.get('/games?size=6').then(r => setRecommended(r.data.content || [])).catch(() => {});
  };

  useEffect(load, [user]);

  const create = async () => {
    if (!name) return;
    await api.post('/wishlists', { name });
    setName('');
    load();
  };

  const remove = async (wlId: number, gameId: number) => {
    await api.delete(`/wishlists/${wlId}/items/${gameId}`);
    load();
  };

  const updateTarget = async (itemId: number, val: string) => {
    await api.put(`/wishlists/items/${itemId}`, { targetPrice: val || null });
    load();
  };

  const exportCsv = (wl: any) => {
    const rows = ['Juego,Objetivo,DescuentoMin'];
    (wl.items || []).forEach((it: any) => rows.push(`"${it.game?.title}",${it.targetPrice ?? ''},${it.minDiscountPercent ?? ''}`));
    const blob = new Blob([rows.join('\\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${wl.name}.csv`; a.click();
  };

  if (!user) return <div className="p-8">Inicia sesión para usar favoritos.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis listas de deseos</h1>
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nueva lista"
          className="flex-1 bg-gray-900 border border-violet-500/30 rounded px-3 py-2" />
        <button onClick={create} className="bg-cyan-600 px-4 py-2 rounded">Crear</button>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Ordenar:</span>
        <select value={sort} onChange={e => setSort(e.target.value)} className="bg-gray-900 border border-violet-500/30 rounded px-2 py-1 text-sm">
          <option value="name">Nombre</option>
          <option value="target">Precio objetivo</option>
        </select>
      </div>

      {wishlists.map(wl => {
        const items = [...(wl.items || [])].sort((a: any, b: any) => {
          if (sort === 'target') return (a.targetPrice || 0) - (b.targetPrice || 0);
          return (a.game?.title || '').localeCompare(b.game?.title || '');
        });
        return (
        <div key={wl.id} className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">{wl.name}</h2>
            <button onClick={() => exportCsv(wl)} className="text-xs text-cyan-400 hover:underline">Exportar CSV</button>
          </div>
          {(!wl.items || wl.items.length === 0) && <p className="text-gray-500 text-sm">Sin juegos.</p>}
          {items.map((it: any) => (
            <div key={it.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex-1">
                <p className="font-medium">{it.game?.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <input defaultValue={it.targetPrice ?? ''} onBlur={e => updateTarget(it.id, e.target.value)}
                    placeholder="Precio objetivo" className="bg-gray-900 border border-violet-500/30 rounded px-2 py-0.5 text-xs w-28" />
                  <span className="text-xs text-gray-400">Desc mín: {it.minDiscountPercent ?? '—'}%</span>
                </div>
              </div>
              <button onClick={() => remove(wl.id, it.game.id)} className="text-red-400 text-sm">Eliminar</button>
            </div>
          ))}
        </div>
        )}
      )}

      {recommended.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">Juegos recomendados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommended.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </div>
      )}
    </div>
  );
}
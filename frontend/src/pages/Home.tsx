import { useEffect, useState } from 'react';
import api from '../api/client';
import GameCard from '../components/GameCard';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import type { Game, Offer } from '../types';

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [discounts, setDiscounts] = useState<Offer[]>([]);
  const [free, setFree] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState('recent');
  const [storeFilter, setStoreFilter] = useState('all');

  const load = async (p = 0, reset = false) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/games?size=24&page=${p}`);
      const newGames = data.content || [];
      setGames(prev => reset ? newGames : [...prev, ...newGames]);
      setHasMore(!data.last);
      setPage(p);
    } catch {}
    try {
      const { data } = await api.get('/offers/top-discounts');
      setDiscounts(data || []);
    } catch {}
    try {
      const { data } = await api.get('/offers/free');
      setFree(data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(0, true); }, []);

  const filtered = games
    .filter(g => storeFilter === 'all' || g.bestPriceStore === storeFilter)
    .sort((a, b) => {
      if (sort === 'price-asc') return (a.bestPrice || 0) - (b.bestPrice || 0);
      if (sort === 'price-desc') return (b.bestPrice || 0) - (a.bestPrice || 0);
      if (sort === 'discount') return (b.bestDiscount || 0) - (a.bestDiscount || 0);
      return 0;
    });

  const sync = () => api.post('/games/sync').then(() => load(0, true));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-3xl font-bold">Mejores ofertas del día</h1>
          <div className="flex gap-2">
            <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)}
              className="bg-gray-900 border border-violet-500/30 rounded px-3 py-1 text-sm">
              <option value="all">Todas las tiendas</option>
              <option value="steam">Steam</option>
              <option value="epic">Epic</option>
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-gray-900 border border-violet-500/30 rounded px-3 py-1 text-sm">
              <option value="recent">Recientes</option>
              <option value="price-asc">Precio ↑</option>
              <option value="price-desc">Precio ↓</option>
              <option value="discount">Mayor descuento</option>
            </select>
            <button onClick={sync} className="text-sm bg-violet-600/30 hover:bg-violet-600/50 px-3 py-1 rounded border border-violet-500/40">
              Sincronizar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">{games.length}</p>
            <p className="text-xs text-gray-400">Juegos</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-violet-400">{discounts.length}</p>
            <p className="text-xs text-gray-400">Ofertas top</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{free.length}</p>
            <p className="text-xs text-gray-400">Gratis</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-3">{filtered.length} juegos mostrados</p>
        {loading && games.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
          </div>
        ) : filtered.length === 0 ? <EmptyState title="Sin juegos" desc="Sincroniza ofertas para ver juegos." /> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map(g => <GameCard key={g.id} game={g} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-6">
                <button onClick={() => load(page + 1)} disabled={loading}
                  className="bg-violet-600/30 hover:bg-violet-600/50 px-6 py-2 rounded border border-violet-500/40">
                  {loading ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Descuentos más grandes</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {discounts.slice(0, 8).map(o => (
            <a key={o.id} href={o.url} target="_blank" rel="noreferrer"
               className="card p-4 flex items-center justify-between hover:border-cyan-400/50 transition">
              <div>
                <p className="font-semibold">{o.gameTitle}</p>
                <p className="text-xs text-gray-400">{o.storeName}</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 font-bold">${o.currentPrice} {o.currency}</p>
                {o.discountPercent ? <p className="text-violet-300 text-sm">-{o.discountPercent}%</p> : null}
              </div>
            </a>
          ))}
        </div>
      </section>

      {free.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Juegos gratuitos</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {free.map(o => (
              <a key={o.id} href={o.url} target="_blank" rel="noreferrer"
                 className="card p-4 flex items-center justify-between hover:border-green-400/50 transition">
                <div>
                  <p className="font-semibold">{o.gameTitle}</p>
                  <p className="text-xs text-gray-400">{o.storeName}</p>
                </div>
                <span className="text-green-400 font-bold">GRATIS</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
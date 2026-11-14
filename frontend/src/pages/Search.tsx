import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import GameCard from '../components/GameCard';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import type { Game } from '../types';

export default function Search() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [q, setQ] = useState(params.get('q') || '');
  const [genre, setGenre] = useState('');
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort, setSort] = useState('relevance');
  const [suggestions, setSuggestions] = useState<Game[]>([]);
  const [results, setResults] = useState<Game[]>([]);
  const [remote, setRemote] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/games?q=${encodeURIComponent(q)}&size=5`);
        setSuggestions(data.content || []);
      } catch { setSuggestions([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const searchLocal = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/games?q=${encodeURIComponent(q)}&genre=${encodeURIComponent(genre)}&size=40`);
      let list: Game[] = data.content || [];
      if (minDiscount > 0) list = list.filter(g => (g.bestDiscount || 0) >= minDiscount);
      if (sort === 'price-asc') list = [...list].sort((a, b) => (a.bestPrice || 0) - (b.bestPrice || 0));
      if (sort === 'price-desc') list = [...list].sort((a, b) => (b.bestPrice || 0) - (a.bestPrice || 0));
      if (sort === 'discount') list = [...list].sort((a, b) => (b.bestDiscount || 0) - (a.bestDiscount || 0));
      setResults(list);
    } catch { setResults([]); }
    setLoading(false);
  };

  const searchRemote = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/games/search-remote?q=${encodeURIComponent(q)}`);
      setRemote(data || []);
    } catch { setRemote([]); }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-6">
        <div className="flex gap-2">
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchLocal()}
            placeholder="Buscar juegos, géneros, desarrolladores..."
            className="flex-1 bg-gray-900 border border-violet-500/30 rounded px-4 py-2 focus:outline-none focus:border-cyan-400" />
          <button onClick={searchLocal} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded">Buscar</button>
          <button onClick={searchRemote} className="bg-violet-600/40 hover:bg-violet-600/60 px-4 py-2 rounded border border-violet-500/40">Buscar en tiendas</button>
        </div>
        {suggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-gray-900 border border-violet-500/30 rounded shadow-lg">
            {suggestions.map(s => (
              <button key={s.id} onClick={() => { setQ(s.title); setSuggestions([]); nav(`/game/${s.id}`); }}
                className="w-full text-left px-4 py-2 hover:bg-violet-600/20 text-sm">
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>
      {loading && <p className="text-gray-400">Cargando...</p>}
      <div className="flex flex-wrap gap-2 mb-6">
        <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="Género"
          className="bg-gray-900 border border-violet-500/30 rounded px-3 py-1 text-sm" />
        <select value={minDiscount} onChange={e => setMinDiscount(Number(e.target.value))}
          className="bg-gray-900 border border-violet-500/30 rounded px-3 py-1 text-sm">
          <option value={0}>Cualquier descuento</option>
          <option value={10}>≥10%</option>
          <option value={30}>≥30%</option>
          <option value={50}>≥50%</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-gray-900 border border-violet-500/30 rounded px-3 py-1 text-sm">
          <option value="relevance">Relevancia</option>
          <option value="price-asc">Precio ↑</option>
          <option value="price-desc">Precio ↓</option>
          <option value="discount">Mayor descuento</option>
        </select>
        <button onClick={searchLocal} className="bg-violet-600/40 px-3 py-1 rounded text-sm border border-violet-500/40">Aplicar</button>
      </div>
      <h2 className="text-xl font-bold mb-3">Resultados locales</h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
        </div>
      ) : results.length === 0 ? <EmptyState title="Sin resultados" desc="Prueba otra búsqueda o sincroniza." /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {results.map(g => <GameCard key={g.id} game={g} />)}
        </div>
      )}
      {remote.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-3">Resultados remotos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {remote.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getSelectedCurrency, convert } from '../utils/currency';
import type { Game, Offer, PricePoint } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function GameDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [currency, setCurrency] = useState(getSelectedCurrency());
  const [game, setGame] = useState<Game | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [days, setDays] = useState(30);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    const h = () => setCurrency(getSelectedCurrency());
    window.addEventListener('currency-change', h);
    return () => window.removeEventListener('currency-change', h);
  }, []);

  useEffect(() => {
    api.get(`/games/${id}`).then(r => setGame(r.data)).catch(() => {});
    api.get(`/games/${id}/offers`).then(r => setOffers(r.data || [])).catch(() => {});
  }, [id]);

  useEffect(() => {
    api.get(`/games/${id}/history?days=${days}`).then(r => setHistory(r.data || [])).catch(() => {});
  }, [id, days]);

  if (!game) return <div className="p-8 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-xs text-gray-500 mb-4">
        <Link to="/" className="hover:text-cyan-400">Inicio</Link> / <Link to="/search" className="hover:text-cyan-400">Buscar</Link> / <span className="text-gray-300">{game.title}</span>
      </nav>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {game.coverUrl && (
          <img src={game.coverUrl} alt={game.title} className="w-full md:w-64 rounded-xl cursor-zoom-in" onClick={() => setZoom(true)} />
        )}
        {zoom && game.coverUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setZoom(false)}>
            <img src={game.coverUrl} alt={game.title} className="max-w-[90vw] max-h-[90vh] rounded-xl" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2">{game.title}</h1>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Enlace copiado'); }}
            className="mt-2 mr-2 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm">
            Compartir
          </button>
          {user && (
            <button onClick={async () => {
              const target = prompt('Precio objetivo (opcional):');
              try {
                const { data: wls } = await api.get('/wishlists');
                let wl = wls[0];
                if (!wl) { const { data } = await api.post('/wishlists', { name: 'My Wishlist' }); wl = data; }
                await api.post(`/wishlists/${wl.id}/items`, { gameId: game.id, targetPrice: target || null });
                alert('Agregado a favoritos');
              } catch { alert('Error'); }
            }} className="mt-2 bg-violet-600/40 hover:bg-violet-600/60 px-3 py-1 rounded border border-violet-500/40 text-sm">
              Agregar a favoritos
            </button>
          )}
          <p className="text-gray-400 mb-2">{game.developer} {game.publisher && `• ${game.publisher}`}</p>
          <p className="text-gray-300 mb-4">{game.description}</p>
          <p className="text-sm text-gray-500">{game.genres}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3 text-cyan-400">Comparación de precios</h2>
      <div className="grid md:grid-cols-2 gap-3 mb-8">
        {offers.map(o => {
          const prices = offers.filter(x => x.currentPrice != null).map(x => x.currentPrice as number);
          const min = prices.length ? Math.min(...prices) : null;
          const isBest = o.currentPrice != null && min != null && o.currentPrice === min;
          return (
          <div key={o.id || o.storeCode} className={`card p-4 ${isBest ? 'border-cyan-400 ring-1 ring-cyan-400/40' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{o.storeName}</span>
              {o.available && o.currentPrice != null ? (
                <span className="text-cyan-400 font-bold">{Math.round(convert(o.currentPrice, o.currency || 'USD', currency)).toLocaleString()} {currency}</span>
              ) : (
                <span className="text-gray-500">No disponible</span>
              )}
            </div>
            {o.originalPrice != null && o.discountPercent ? (
              <p className="text-xs text-gray-400 mt-1">Original: {Math.round(convert(o.originalPrice, o.currency || 'USD', currency)).toLocaleString()} {currency} • -{o.discountPercent}%</p>
            ) : null}
            {o.url && (
              <a href={o.url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:underline mt-2 inline-block">
                Ir a la tienda →
              </a>
            )}
            {isBest && <span className="inline-block mt-2 text-xs bg-cyan-600 text-white px-2 py-0.5 rounded">Mejor precio</span>}
          </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold mb-3 text-violet-400">Historial de precios</h2>
      <div className="flex gap-2 mb-3">
        {[30, 90, 365].map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`px-3 py-1 rounded text-sm ${days === d ? 'bg-violet-600' : 'bg-gray-800'}`}>
            {d} días
          </button>
        ))}
      </div>
      <div className="card p-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="recordedAt" tick={{ fontSize: 10 }} tickFormatter={v => String(v).slice(5, 10)} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#00d4ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {history.length > 0 && (
        <div className="card p-4 mt-4">
          <h3 className="font-bold mb-2">Resumen histórico</h3>
          <p className="text-sm text-gray-300">
            Mínimo: {Math.round(convert(Math.min(...history.map(h => h.price)), history[0].currency, currency)).toLocaleString()} {currency} •
            Máximo: {Math.round(convert(Math.max(...history.map(h => h.price)), history[0].currency, currency)).toLocaleString()} {currency}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {offers.some(o => o.currentPrice != null && o.discountPercent && o.discountPercent >= 30)
              ? 'Consejo: hay un buen descuento actual; considera comprar ahora.'
              : 'Consejo: espera a un mejor descuento si no es urgente.'}
          </p>
        </div>
      )}
    </div>
  );
}
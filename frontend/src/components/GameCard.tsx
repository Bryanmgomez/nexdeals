import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Game } from '../types';
import { getSelectedCurrency, convert } from '../utils/currency';
import { Heart, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function GameCard({ game }: { game: Game }) {
  const { user } = useAuth();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [currency, setCurrency] = useState(getSelectedCurrency());

  useEffect(() => {
    const h = () => setCurrency(getSelectedCurrency());
    window.addEventListener('currency-change', h);
    return () => window.removeEventListener('currency-change', h);
  }, []);

  const addFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { data: wls } = await api.get('/wishlists');
      let wl = wls[0];
      if (!wl) { const { data } = await api.post('/wishlists', { name: 'Favoritos' }); wl = data; }
      await api.post(`/wishlists/${wl.id}/items`, { gameId: game.id });
      setLiked(true);
      toast.show('Agregado a favoritos', 'success');
    } catch { toast.show('Error al agregar', 'error'); }
  };

  const current = game.bestPrice != null ? convert(game.bestPrice, 'USD', currency) : null;
  const original = game.bestOriginalPrice != null ? convert(game.bestOriginalPrice, 'USD', currency) : null;
  const savings = current != null && original != null ? original - current : null;

  return (
    <Link to={`/game/${game.id}`} className="card overflow-hidden hover:scale-[1.02] transition-transform glow relative group">
      {user && (
        <button onClick={addFav} className="absolute top-2 right-2 z-10 bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
          <Heart size={16} className={liked ? 'text-red-500 fill-red-500' : 'text-white'} />
        </button>
      )}
      <div className="aspect-[3/4] bg-gray-900 overflow-hidden relative">
        {game.coverUrl ? (
          <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">No image</div>
        )}
        {game.bestDiscount ? (
          <span className="absolute top-2 left-2 text-xs bg-violet-600/90 text-white px-2 py-0.5 rounded font-bold">
            -{game.bestDiscount}%
          </span>
        ) : null}
        {game.bestDiscount && game.bestDiscount >= 50 && (
          <span className="absolute top-2 left-2 mt-6 text-xs bg-red-600/90 text-white px-2 py-0.5 rounded font-bold">
            HOT
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{game.title}</h3>
        {game.genres && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{game.genres}</p>}
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-cyan-400 font-bold">
              {current != null ? `${Math.round(current).toLocaleString()} ${currency}` : 'N/A'}
            </span>
            {original != null && original !== current && (
              <span className="text-xs text-gray-500 line-through ml-2">
                {Math.round(original).toLocaleString()}
              </span>
            )}
          </div>
          {savings != null && savings > 0 && (
            <span className="text-[10px] text-green-400 flex items-center gap-0.5">
              <Tag size={10} /> ahorra {Math.round(savings).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          {game.bestPriceStore && (
            <span className="text-[10px] uppercase tracking-wide text-violet-300">{game.bestPriceStore}</span>
          )}
          {game.developer && <span className="text-[10px] text-gray-500 truncate max-w-[8rem]">{game.developer}</span>}
        </div>
      </div>
    </Link>
  );
}
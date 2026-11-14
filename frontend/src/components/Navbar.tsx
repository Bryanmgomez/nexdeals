import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, LogOut, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';

const CURRENCIES = ['COP', 'USD', 'EUR', 'MXN', 'BRL', 'GBP', 'JPY'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [currency, setCurrency] = useState(localStorage.getItem('nex_currency') || 'COP');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    localStorage.setItem('nex_currency', currency);
    window.dispatchEvent(new Event('currency-change'));
  }, [currency]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); nav('/search');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [nav]);

  useEffect(() => {
    if (!user) return;
    const load = () => import('../api/client').then(m => m.default.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {}));
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-black/60 border-b border-violet-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
          NEXDEALS
        </Link>
        <div className="flex-1" />
        <Link to="/" className="flex items-center gap-1 text-gray-300 hover:text-cyan-400">Inicio</Link>
        <Link to="/search" className="flex items-center gap-1 text-gray-300 hover:text-cyan-400"><Search size={18}/>Buscar</Link>
        <Link to="/wishlist" className="text-gray-300 hover:text-cyan-400">Favoritos</Link>
        <Link to="/affiliates" className="text-gray-300 hover:text-cyan-400">Afiliados</Link>

        <select value={currency} onChange={e => setCurrency(e.target.value)}
          className="bg-gray-900 border border-violet-500/30 rounded px-2 py-1 text-sm">
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <Link to="/personalization" className="text-gray-300 hover:text-cyan-400 flex items-center gap-1">
          <Palette size={18}/>Personalización
        </Link>

        {user && (
          <>
            <Link to="/profile" className="text-gray-300 hover:text-cyan-400">Perfil</Link>
            <Link to="/notifications" className="relative text-gray-300 hover:text-cyan-400">
              <Bell size={18}/>
              {unread > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">{unread}</span>}
            </Link>
            <button onClick={() => { logout(); nav('/'); }} className="flex items-center gap-1 text-gray-300 hover:text-red-400"><LogOut size={16}/></button>
          </>
        )}
      </div>
    </header>
  );
}
import { useState } from 'react';
import api from '../api/client';

export default function NexAi() {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/recommend', { query, budget: budget ? Number(budget) : null, currency: 'COP' });
      setResult(data);
    } catch { setResult(null); }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">NEX AI</h1>
      <p className="text-gray-400 mb-6">Tu asistente de ofertas. Ej: "Tengo $100000 COP, recomiéndame juegos de mundo abierto."</p>
      <div className="card p-4 mb-6">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tu consulta..."
          className="w-full bg-gray-900 border border-violet-500/30 rounded px-3 py-2 mb-3" />
        <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="Presupuesto (opcional)"
          className="w-full bg-gray-900 border border-violet-500/30 rounded px-3 py-2 mb-3" />
        <button onClick={ask} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded">
          {loading ? 'Pensando...' : 'Preguntar'}
        </button>
      </div>
      {result && (
        <div className="card p-4">
          <pre className="whitespace-pre-wrap text-gray-200 text-sm">{result.answer}</pre>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');

  const load = () => api.get('/community/posts').then(r => setPosts(r.data.content || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!content) return;
    await api.post('/community/posts', { content });
    setContent('');
    load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Comunidad Gamer</h1>
      {user && (
        <div className="card p-4 mb-6">
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Comparte una oferta o recomendación..."
            className="w-full bg-gray-900 border border-violet-500/30 rounded p-3 mb-2" rows={3} />
          <button onClick={submit} className="bg-cyan-600 px-4 py-2 rounded">Publicar</button>
        </div>
      )}
      <div className="space-y-4">
        {posts.map(p => (
          <div key={p.id} className="card p-4">
            <p className="text-sm text-gray-400 mb-1">{p.user?.displayName || 'Usuario'} • {new Date(p.createdAt).toLocaleString()}</p>
            <p className="text-gray-200">{p.content}</p>
            {p.reportedPrice && <p className="text-cyan-400 text-sm mt-2">Precio reportado: ${p.reportedPrice} {p.reportedCurrency}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
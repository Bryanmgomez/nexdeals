import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(email, password);
      else await register({ email, password, displayName: name });
      nav('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre"
              className="w-full bg-gray-900 border border-violet-500/30 rounded px-3 py-2" />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
            className="w-full bg-gray-900 border border-violet-500/30 rounded px-3 py-2" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password"
            className="w-full bg-gray-900 border border-violet-500/30 rounded px-3 py-2" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="w-full bg-cyan-600 hover:bg-cyan-500 py-2 rounded font-semibold">
            {mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="mt-3 text-sm text-violet-400 hover:underline">
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}
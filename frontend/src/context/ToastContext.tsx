import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Toast { id: number; msg: string; type: 'info' | 'success' | 'error'; }
interface Ctx { show: (msg: string, type?: Toast['type']) => void; }
const C = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = (msg: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return (
    <C.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded shadow-lg text-white ${
            t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-violet-600'
          }`}>{t.msg}</div>
        ))}
      </div>
    </C.Provider>
  );
}

export const useToast = () => {
  const c = useContext(C);
  if (!c) throw new Error('no toast');
  return c;
};
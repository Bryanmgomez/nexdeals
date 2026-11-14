import { useAppearance } from '../context/AppearanceContext';
import { useToast } from '../context/ToastContext';
import type { ChangeEvent } from 'react';

export default function Personalization() {
  const { appearance, setAppearance, reset } = useAppearance();
  const toast = useToast();

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      toast.show('Formato no soportado (JPG, PNG, WEBP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAppearance({ bgType: 'image', imageData: String(reader.result) });
      toast.show('Fondo aplicado', 'success');
    };
    reader.readAsDataURL(f);
  };

  const anims: { id: any; name: string }[] = [
    { id: 'space', name: 'Espacio' },
    { id: 'aurora', name: 'Aurora boreal' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'ocean', name: 'Océano' },
    { id: 'galaxy', name: 'Galaxia' },
  ];

  const auroraColors = [
    { v: '#00d4ff', n: 'Azul' },
    { v: '#8b5cf6', n: 'Morada' },
    { v: '#22c55e', n: 'Verde' },
    { v: '#ef4444', n: 'Roja' },
    { v: '#ec4899', n: 'Rosa' },
    { v: '#f97316', n: 'Naranja' },
    { v: 'multicolor', n: 'Multicolor' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Personalización</h1>

      <div className="card p-6 mb-6">
        <h2 className="font-bold mb-3">Modo de color</h2>
        <div className="flex gap-2">
          <button onClick={() => setAppearance({ theme: 'dark' })}
            className={`px-4 py-2 rounded ${appearance.theme === 'dark' ? 'bg-violet-600' : 'bg-gray-800'}`}>Oscuro</button>
          <button onClick={() => setAppearance({ theme: 'light' })}
            className={`px-4 py-2 rounded ${appearance.theme === 'light' ? 'bg-violet-600' : 'bg-gray-800'}`}>Claro</button>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-bold mb-3">Fondo personalizado (imagen)</h2>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="mb-3" />
        <div className="flex flex-wrap gap-2 mb-3">
          <label className="text-sm">Ajuste:
            <select value={appearance.fit} onChange={e => setAppearance({ fit: e.target.value as any })} className="ml-2 bg-gray-900 border border-violet-500/30 rounded px-2 py-1">
              <option value="cover">Cubrir</option>
              <option value="contain">Ajustar</option>
              <option value="center">Centrar</option>
            </select>
          </label>
          <label className="text-sm">Desenfoque: {appearance.blur}px
            <input type="range" min={0} max={20} value={appearance.blur} onChange={e => setAppearance({ blur: Number(e.target.value) })} className="ml-2" />
          </label>
          <label className="text-sm">Opacidad: {Math.round(appearance.opacity * 100)}%
            <input type="range" min={0} max={1} step={0.05} value={appearance.opacity} onChange={e => setAppearance({ opacity: Number(e.target.value) })} className="ml-2" />
          </label>
        </div>
        <button onClick={() => setAppearance({ bgType: 'default', imageData: null })} className="bg-red-600/40 px-3 py-1 rounded text-sm">Quitar fondo personalizado</button>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-bold mb-3">Fondos animados</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          {anims.map(a => (
            <button key={a.id} onClick={() => setAppearance({ bgType: 'animated', animatedId: a.id })}
              className={`card p-3 text-center ${appearance.bgType === 'animated' && appearance.animatedId === a.id ? 'ring-2 ring-cyan-400' : ''}`}>
              <p className="text-sm font-semibold">{a.name}</p>
              <p className="text-[10px] text-gray-500">Vista previa al aplicar</p>
            </button>
          ))}
        </div>
        <button onClick={() => setAppearance({ bgType: 'default' })} className="bg-gray-800 px-3 py-1 rounded text-sm">Usar fondo predeterminado</button>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-bold mb-3">Efecto Aurora en botones y tarjetas</h2>
        <div className="flex items-center gap-3 mb-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={appearance.aurora} onChange={e => setAppearance({ aurora: e.target.checked })} />
            Activar aurora
          </label>
          <label className="text-sm">Intensidad: {appearance.auroraIntensity}%
            <input type="range" min={0} max={100} value={appearance.auroraIntensity} onChange={e => setAppearance({ auroraIntensity: Number(e.target.value) })} className="ml-2" />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {auroraColors.map(c => (
            <button key={c.v} onClick={() => setAppearance({ auroraColor: c.v })}
              className={`px-3 py-1 rounded text-sm border ${appearance.auroraColor === c.v ? 'border-cyan-400' : 'border-gray-700'}`}
              style={c.v !== 'multicolor' ? { background: c.v, color: '#fff' } : { background: 'linear-gradient(90deg,#00d4ff,#8b5cf6,#22c55e)', color: '#fff' }}>
              {c.n}
            </button>
          ))}
        </div>
      </div>

      <button onClick={reset} className="bg-red-600/40 px-4 py-2 rounded text-sm">Restablecer todo</button>
    </div>
  );
}
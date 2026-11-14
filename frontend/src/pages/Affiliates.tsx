export default function Affiliates() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Programa de afiliados</h1>
      <p className="text-gray-300 mb-6">
        NEXDEALS participa en programas de afiliados autorizados. Al comprar a través de nuestros enlaces,
        apoyas la plataforma sin costo adicional para ti.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {['Steam', 'Epic Games Store'].map(s => (
          <div key={s} className="card p-4">
            <h3 className="font-bold text-cyan-400">{s}</h3>
            <p className="text-sm text-gray-400 mt-1">Enlaces oficiales y autorizados. Precios reales de la tienda.</p>
          </div>
        ))}
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-bold text-cyan-400 mb-2">BaseLauncher</h3>
        <p className="text-sm text-gray-400 mb-3">
          Launcher base recomendado. Visita el sitio oficial para descargar.
        </p>
        <a href="https://baselauncher.site.je/" target="_blank" rel="noopener noreferrer"
           className="inline-block bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded text-sm">
          Ir a BaseLauncher
        </a>
      </div>
      <p className="text-xs text-gray-500 mt-6">
        Solo mostramos enlaces oficiales. Nunca inventamos precios ni descuentos.
      </p>
    </div>
  );
}
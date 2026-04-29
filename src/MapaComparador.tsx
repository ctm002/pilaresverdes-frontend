import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Aviso } from './dto/AvisoDto.js';
import AppNav from './components/ui/AppNav.js';
import MultiMarkerMap from './components/ui/MultiMarkerMap.js';

export default function MapaComparador() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const [selected] = useState<Aviso[]>(() => {
    try {
      const stored = localStorage.getItem('comparador_selected');
      return stored ? (JSON.parse(stored) as Aviso[]) : [];
    } catch {
      return [];
    }
  });

  const markers = selected
    .filter(a => a.latitud != null && a.longitud != null)
    .map(a => ({ lat: a.latitud!, lng: a.longitud!, label: a.titulo }));

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <AppNav
        title="Mapa comparador"
        backTo="/comparador"
        isAuthenticated={isAuthenticated}
        onSignOut={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
      />

      <main className="flex-grow pt-14 px-4 py-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-forest-950">Mapa de avisos</h1>
            <p className="text-stone-400 text-sm mt-0.5">
              {markers.length === 0
                ? 'Ningún aviso tiene coordenadas'
                : `${markers.length} aviso${markers.length > 1 ? 's' : ''} en el mapa`}
            </p>
          </div>
          <button
            onClick={() => navigate('/comparador')}
            className="inline-flex items-center gap-1.5 bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al comparador
          </button>
        </div>

        {markers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-forest-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-display text-xl text-forest-900 mb-1">Sin coordenadas disponibles</p>
              <p className="text-stone-400 text-sm">Los avisos seleccionados no tienen ubicación registrada</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex flex-wrap gap-3">
              {selected.filter(a => a.latitud != null && a.longitud != null).map((a, i) => (
                <span key={a.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-800 bg-forest-50 border border-forest-100 px-2.5 py-1 rounded-full">
                  <span className="w-4 h-4 bg-forest-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                  {a.titulo}
                </span>
              ))}
            </div>
            <MultiMarkerMap markers={markers} fullHeight />
          </div>
        )}
      </main>
    </div>
  );
}

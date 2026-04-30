import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import AppNav from './components/ui/AppNav.js';
import WhatsAppButton from './components/aviso/WhatsAppButton.js';
import { resolveImageUrl } from './utils/imageUrl.js';

const MAX = 3;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-stone-100 last:border-0">
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-sm text-forest-950">{children}</div>
    </div>
  );
}

export default function CompararAvisos() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const [allAvisos, setAllAvisos] = useState<Aviso[]>([]);
  const [selected, setSelected] = useState<Aviso[]>(() => {
    try {
      const stored = localStorage.getItem('comparador_selected');
      return stored ? (JSON.parse(stored) as Aviso[]) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [ufValue, setUfValue] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('comparador_selected', JSON.stringify(selected));
  }, [selected]);

  useEffect(() => {
    api.get('/api/v1/avisos')
      .then((res: AxiosResponse<Aviso[]>) => setAllAvisos(res.data))
      .catch((err: unknown) => console.error('Error al cargar avisos:', err));
    fetch('https://mindicador.cl/api/uf')
      .then(r => r.json())
      .then((data: { serie: { valor: number }[] }) => setUfValue(data.serie[0]?.valor ?? null))
      .catch(() => null);
  }, []);

  const addAviso = (aviso: Aviso) => {
    if (selected.find(a => a.id === aviso.id)) return;
    if (selected.length >= MAX) return;
    setSelected(prev => [...prev, aviso]);
    setSearch('');
    setShowPicker(false);
  };

  const removeAviso = (id: number) => setSelected(prev => prev.filter(a => a.id !== id));

  const suggestions = allAvisos.filter(a =>
    !selected.find(s => s.id === a.id) &&
    (a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      a.descripcion.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <AppNav
        title="Comparador de avisos"
        backTo="/"
        isAuthenticated={isAuthenticated}
        onSignOut={() => { localStorage.removeItem('token'); navigate('/'); }}
      />

      <main className="flex-grow pt-14 px-4 py-6 max-w-6xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-forest-950">Comparador de avisos</h1>
            <p className="text-stone-400 text-sm mt-0.5">Agrega hasta {MAX} avisos para compararlos</p>
          </div>
          <div className="flex items-center gap-2">
            {selected.some(a => a.latitud != null && a.longitud != null) && (
              <button
                onClick={() => navigate('/comparador/mapa')}
                className="inline-flex items-center gap-1.5 bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Ver mapa
              </button>
            )}
            {selected.length < MAX && (
              <button
                onClick={() => setShowPicker(v => !v)}
                className="inline-flex items-center gap-1.5 bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <span className="text-base leading-none">+</span>
                Agregar aviso
              </button>
            )}
          </div>
        </div>

        {/* Picker */}
        {showPicker && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 mb-6">
            <input
              type="text"
              placeholder="Buscar aviso por título o descripción…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-700/40 focus:border-forest-700 mb-3"
              autoFocus
            />
            {search && (
              suggestions.length > 0 ? (
                <ul className="space-y-1">
                  {suggestions.map(a => (
                    <li key={a.id}>
                      <button
                        onClick={() => addAviso(a)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-forest-50 text-left transition-colors"
                      >
                        <img
                          src={resolveImageUrl(a.image_url)}
                          alt={a.titulo}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-forest-950 truncate">{a.titulo}</p>
                          <p className="text-xs text-stone-400 truncate">{a.descripcion}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-400 text-sm text-center py-4">Sin resultados para "{search}"</p>
              )
            )}
          </div>
        )}

        {/* Empty state */}
        {selected.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-forest-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-display text-xl text-forest-900 mb-1">Sin avisos para comparar</p>
              <p className="text-stone-400 text-sm">Usa el botón "Agregar aviso" para comenzar</p>
            </div>
          </div>
        )}

        {/* Comparison grid */}
        {selected.length > 0 && (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0, 1fr))` }}
          >
            {selected.map(aviso => (
              <div key={aviso.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">

                {/* Image */}
                <div className="relative h-48 flex-shrink-0">
                  <img src={resolveImageUrl(aviso.image_url)} alt={aviso.titulo} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeAviso(aviso.id)}
                    className="absolute top-2 right-2 bg-black/40 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
                    title="Quitar de comparación"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Fields */}
                <div className="p-4 flex flex-col flex-grow">
                  <Field label="Título">
                    <span className="font-display font-semibold leading-snug">{aviso.titulo}</span>
                  </Field>
                  <Field label="Descripción">
                    <span className="text-stone-500 line-clamp-3 leading-relaxed">{aviso.descripcion}</span>
                  </Field>
                  <Field label="Publicado por">
                    <span className="text-forest-700 font-medium">{aviso.username}</span>
                  </Field>
                  {aviso.fecha_creacion && (
                    <Field label="Fecha">{aviso.fecha_creacion}</Field>
                  )}
                  {aviso.metros_cuadrados != null && (
                    <Field label="Metros cuadrados">
                      <span className="font-semibold">{aviso.metros_cuadrados} m²</span>
                    </Field>
                  )}
                  {aviso.precio != null && (
                    <Field label="Precio">
                      <span className="font-bold text-forest-900">${aviso.precio.toLocaleString('es-CL')}</span>
                    </Field>
                  )}
                  {aviso.precio_uf != null && (
                    <Field label="Precio UF">
                      <span className="font-semibold">{aviso.precio_uf.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UF</span>
                    </Field>
                  )}
                  {aviso.precio_uf != null && ufValue != null && (
                    <Field label="Valor actual">
                      <span className="font-bold text-forest-900">
                        ${Math.round(aviso.precio_uf * ufValue).toLocaleString('es-CL')}
                      </span>
                      <span className="text-[10px] text-stone-400 ml-1">(UF {ufValue.toLocaleString('es-CL')})</span>
                    </Field>
                  )}

                  {/* Acciones */}
                  <div className="mt-auto pt-4 flex flex-col gap-2">
                    <WhatsAppButton
                      phone={aviso.celular}
                      title={aviso.titulo}
                      label="Contactar por WhatsApp"
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold"
                    />
                    <button
                      onClick={() => navigate(`/avisos/${aviso.slug}`)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-medium border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-700 transition-colors"
                    >
                      Más detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Slot vacío */}
            {selected.length < MAX && (

              <button
                onClick={() => setShowPicker(true)}
                className="border-2 border-dashed border-stone-200 hover:border-forest-400 hover:bg-forest-50 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-forest-700 transition-colors min-h-[400px]"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Agregar aviso</span>
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

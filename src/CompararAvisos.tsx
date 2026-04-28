import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import AppNav from './components/ui/AppNav.js';

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
  const [selected, setSelected] = useState<Aviso[]>([]);
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    api.get('/api/v1/avisos')
      .then((res: AxiosResponse<Aviso[]>) => setAllAvisos(res.data))
      .catch((err: unknown) => console.error('Error al cargar avisos:', err));
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
          {selected.length < MAX && (
            <button
              onClick={() => setShowPicker(v => !v)}
              className="inline-flex items-center gap-1.5 bg-forest-900 hover:bg-forest-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Agregar aviso
            </button>
          )}
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
                          src={a.image_url}
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
                  <img src={aviso.image_url} alt={aviso.titulo} className="w-full h-full object-cover" />
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
                  <Field label="Contacto">
                    <a
                      href={`https://wa.me/${aviso.celular}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-700 hover:text-forest-900 font-medium"
                    >
                      {aviso.celular}
                    </a>
                  </Field>
                  <Field label="Publicado por">
                    <span className="text-forest-700 font-medium">{aviso.username}</span>
                  </Field>
                  {aviso.fecha_creacion && (
                    <Field label="Fecha">{aviso.fecha_creacion}</Field>
                  )}
                  <Field label="Visitas">
                    <span className="font-semibold">{aviso.visitas ?? 0}</span>
                  </Field>
                  <Field label="Likes">
                    <span className="font-semibold">{aviso.likes}</span>
                  </Field>

                  {/* Ver detalle */}
                  <button
                    onClick={() => navigate(`/avisos/${aviso.slug}`)}
                    className="mt-auto pt-4 text-xs text-forest-700 hover:text-forest-900 font-medium transition-colors text-center"
                  >
                    Ver detalle →
                  </button>
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

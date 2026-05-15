import api from "./api/axios.js";
import { useEffect, useRef, useState } from "react";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { AvisoListItem } from "./dto/AvisoListDto.js";
import { useFavorites } from "./hooks/useFavorites.js";
import { useCurrentUser } from "./hooks/useCurrentUser.js";
import AvisoCard from "./components/aviso/AvisoCard.js";
import AvisoCardSkeleton from "./components/aviso/AvisoCardSkeleton.js";
import AppNav from "./components/ui/AppNav.js";

export default function Avisos() {
  const navigate = useNavigate();
  const [data, setData] = useState<AvisoListItem[] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnlyFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedComuna, setSelectedComuna] = useState<string | null>(null);
  const [pendingComuna, setPendingComuna] = useState<string | null>(null);
  const [comunaQuery, setComunaQuery] = useState('');
  const [comunaOpen, setComunaOpen] = useState(false);
  const comunaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comunaRef.current && !comunaRef.current.contains(e.target as Node)) {
        setComunaOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const [lastAccess, setLastAccess] = useState<string>('');
  const { favorites } = useFavorites();
  const currentUsername = useCurrentUser();

  const loadData = (minDelay = 0) => {
    const delay = new Promise<void>(resolve => setTimeout(resolve, minDelay));
    Promise.all([api.get("/api/v1/avisos"), delay])
      .then(([res]) => setData((res as AxiosResponse<AvisoListItem[]>).data))
      .catch((err: unknown) => console.error("Error al cargar avisos:", err));
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    const savedLastAccess = localStorage.getItem('lastAccess');
    if (savedLastAccess) setLastAccess(savedLastAccess);
    localStorage.setItem('lastAccess', new Date().toLocaleString('es-ES'));
    loadData(1500);
  }, []);

  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === 'visible') loadData(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const handleLikeCount = async (id: number) => {
    try {
      await api.patch(`/api/v1/avisos/${id}/like`);
      loadData();
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const isLoading = data === null;

  const comunas = Array.from(
    new Set((data ?? []).map(a => a.comuna).filter(Boolean) as string[])
  ).sort();

  const filteredData = (data ?? [])
    .filter(item => {
      const matchesSearch =
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFav = !showOnlyFavorites || !!favorites[item.id];
      const matchesComuna = !selectedComuna || item.comuna === selectedComuna;
      return matchesSearch && matchesFav && matchesComuna;
    })
    .sort((a, b) => {
      const aFav = favorites[a.id] || false;
      const bFav = favorites[b.id] || false;
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-cream">

      <AppNav
        isAuthenticated={isAuthenticated}
        onSignOut={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
      />

      {/* ── Barra de búsqueda ──────────────────────────── */}
      <div className="pt-14 px-4">
        <div className="max-w-2xl mx-auto py-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Input texto */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar avisos…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearchTerm(searchInput); setSelectedComuna(pendingComuna); } }}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-forest-950 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-forest-700/40 focus:border-forest-700 transition-all"
              />
            </div>

            {/* Selector comuna */}
            <div ref={comunaRef} className="relative sm:w-52">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={pendingComuna ?? 'Comuna…'}
                  value={comunaOpen ? comunaQuery : (pendingComuna ?? '')}
                  onFocus={() => { setComunaOpen(true); setComunaQuery(''); }}
                  onChange={e => { setComunaQuery(e.target.value); setComunaOpen(true); }}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-700/40 focus:border-forest-700 transition-all"
                  autoComplete="off"
                />
                {pendingComuna && !comunaOpen && (
                  <button
                    type="button"
                    onClick={() => { setPendingComuna(null); setComunaQuery(''); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {comunaOpen && (
                <ul className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-stone-200 overflow-y-auto" style={{ maxHeight: '11rem' }}>
                  {(comunaQuery
                    ? comunas.filter(c => c.toLowerCase().includes(comunaQuery.toLowerCase()))
                    : comunas
                  ).slice(0, 20).map(c => (
                    <li key={c}>
                      <button
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { setPendingComuna(c); setComunaOpen(false); setComunaQuery(''); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          pendingComuna === c
                            ? 'bg-forest-50 text-forest-900 font-semibold'
                            : 'hover:bg-stone-50 text-forest-950'
                        }`}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                  {comunaQuery && comunas.filter(c => c.toLowerCase().includes(comunaQuery.toLowerCase())).length === 0 && (
                    <li className="px-4 py-3 text-sm text-stone-400">Sin resultados</li>
                  )}
                </ul>
              )}
            </div>

            {/* Botón buscar */}
            <button
              onClick={() => { setSearchTerm(searchInput); setSelectedComuna(pendingComuna); }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────── */}
      <main className="flex-grow px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <AvisoCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredData.length === 0 && searchTerm ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-forest-900 mb-2">Sin resultados</p>
            <p className="text-stone-400 text-sm">No encontramos avisos para "{searchTerm}"</p>
          </div>
        ) : filteredData.length === 0 && showOnlyFavorites ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-forest-900 mb-2">Sin favoritos</p>
            <p className="text-stone-400 text-sm">Marca avisos con ★ para verlos aquí</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 text-sm">No hay avisos para mostrar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredData.map((item) => (
              <AvisoCard
                key={item.id}
                item={item}
                currentUsername={currentUsername}
                delay={Math.floor(Math.random() * 1200) + 200}
                onNavigate={(s) => navigate(`/avisos/${s}`)}
                onLikeCount={handleLikeCount}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="bg-forest-950 text-white/60 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs space-y-1">
          <p className="text-white/80 font-medium">
            © 2024 Pilares Verdes — Todos los derechos reservados
          </p>
          <p>v1.0.0 · {import.meta.env.VITE_BUILD_HASH || 'dev'}</p>
          {lastAccess && <p>Último acceso: {lastAccess}</p>}
        </div>
      </footer>

    </div>
  );
}

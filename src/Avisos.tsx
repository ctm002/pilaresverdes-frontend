import api from "./api/axios.js";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { Aviso } from "./dto/AvisoDto.js";
import { useFavorites } from "./hooks/useFavorites.js";
import AvisoCard from "./components/aviso/AvisoCard.js";
import AvisoCardSkeleton from "./components/aviso/AvisoCardSkeleton.js";

const LeafIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 5.5-8 5.5L12 6l-3.5 3.5C11 9 15 9.5 17 8z"/>
  </svg>
);

export default function Avisos() {
  const navigate = useNavigate();
  const [data, setData] = useState<Aviso[] | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastAccess, setLastAccess] = useState<string>('');
  const { favorites, toggleFavorite } = useFavorites();

  const loadData = (minDelay = 0) => {
    const delay = new Promise<void>(resolve => setTimeout(resolve, minDelay));
    Promise.all([api.get("/api/v1/avisos"), delay])
      .then(([res]) => setData((res as AxiosResponse<Aviso[]>).data))
      .catch((err: unknown) => console.error("Error al cargar avisos:", err));
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    const savedLastAccess = localStorage.getItem('lastAccess');
    if (savedLastAccess) setLastAccess(savedLastAccess);
    localStorage.setItem('lastAccess', new Date().toLocaleString('es-ES'));
    loadData(800);
  }, []);

  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este aviso?')) {
      try {
        await api.delete(`/api/v1/avisos/${id}`);
        loadData();
      } catch (error) {
        console.error('Error al eliminar aviso:', error);
      }
    }
  };

  const handleLikeCount = async (id: number) => {
    try {
      await api.patch(`/api/v1/avisos/${id}/like`);
      loadData();
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const isLoading = data === null;

  const filteredData = (data ?? [])
    .filter(item =>
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aFav = favorites[a.id] || false;
      const bFav = favorites[b.id] || false;
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-cream">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 bg-forest-900 text-white shadow-lg z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">

          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <LeafIcon />
            </div>
            <span className={`font-display font-semibold text-lg tracking-tight ${showSearch ? 'hidden md:block' : ''}`}>
              Pilares Verdes
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {(showSearch || searchTerm) && (
              <input
                type="text"
                placeholder="Buscar avisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setShowSearch(false); }}
                className="px-3 py-1.5 rounded-lg text-forest-950 bg-white text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-300 w-48"
                autoFocus
              />
            )}
            <button
              onClick={() => {
                if (showSearch || searchTerm) { setShowSearch(false); setSearchTerm(''); }
                else setShowSearch(true);
              }}
              className={`p-2 rounded-lg transition-colors ${
                showSearch || searchTerm ? 'bg-white/20 hover:bg-white/30' : 'hover:bg-white/10'
              }`}
              aria-label="Buscar"
            >
              {showSearch || searchTerm ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/crear')}
                  className="bg-white text-forest-900 hover:bg-forest-100 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span className="text-base leading-none">+</span>
                  Publicar
                </button>
                <button
                  onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
                  className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                onClick={() => window.location.href = '/signin'}
                className="bg-white text-forest-900 hover:bg-forest-100 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          {!showSearch && (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Mobile dropdown */}
        {showMobileMenu && (
          <div className="md:hidden bg-forest-800 border-t border-white/10 px-4 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { navigate('/crear'); setShowMobileMenu(false); }}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <span>+</span> Publicar aviso
                </button>
                <button
                  onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); setShowMobileMenu(false); }}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white/10 transition-colors text-sm text-white/70"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => { window.location.href = '/signin'; setShowMobileMenu(false); }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── Main content ───────────────────────────────── */}
      <main className={`flex-grow pt-16 px-4 py-6 transition-all duration-300 ${showSearch ? 'blur-sm' : ''}`}>
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
                isAuthenticated={isAuthenticated}
                isFavorite={favorites[item.id] || false}
                onNavigate={(s) => navigate(`/avisos/${s}`)}
                onEdit={(i) => navigate(`/avisos/${i.slug}/editar`)}
                onDelete={handleDelete}
                onLikeCount={handleLikeCount}
                onFavorite={toggleFavorite}
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

      {/* ── Floating search (mobile) ────────────────────── */}
      <button
        onClick={() => {
          if (showSearch || searchTerm) { setShowSearch(false); setSearchTerm(''); }
          else { setShowSearch(true); setShowMobileMenu(false); }
        }}
        className={`fixed text-white p-4 rounded-full shadow-xl transition-all duration-300 z-50 md:hidden ${
          showSearch || searchTerm
            ? 'top-1/2 right-5 -translate-y-1/2 bg-forest-800 hover:bg-forest-700'
            : 'bottom-6 right-5 bg-forest-900 hover:bg-forest-800'
        }`}
        aria-label="Buscar"
      >
        {showSearch || searchTerm ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </button>

      {showSearch && (
        <div className="fixed top-20 left-4 right-4 z-50 md:hidden">
          <input
            type="text"
            placeholder="Buscar avisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setShowSearch(false); }}
            className="w-full px-4 py-3 rounded-xl text-forest-950 bg-white shadow-xl text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-700/40"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

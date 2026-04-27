import api from "./api/axios.js";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { Aviso } from "./dto/AvisoDto.js";
import { useFavorites } from "./hooks/useFavorites.js";
import { useCurrentUser } from "./hooks/useCurrentUser.js";
import AvisoCard from "./components/aviso/AvisoCard.js";
import AvisoCardSkeleton from "./components/aviso/AvisoCardSkeleton.js";
import AppNav from "./components/ui/AppNav.js";

export default function Avisos() {
  const navigate = useNavigate();
  const [data, setData] = useState<Aviso[] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites] = useState(false);
  const [lastAccess, setLastAccess] = useState<string>('');
  const { favorites } = useFavorites();
  const currentUsername = useCurrentUser();

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
    loadData(1500);
  }, []);

  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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

  const filteredData = (data ?? [])
    .filter(item => {
      const matchesSearch =
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFav = !showOnlyFavorites || !!favorites[item.id];
      return matchesSearch && matchesFav;
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

      {/* ── Main content ───────────────────────────────── */}
      <main className={`flex-grow pt-14 px-4 py-6 transition-all duration-300 ${showSearch ? 'blur-sm' : ''}`}>
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

      {/* ── Floating search (mobile) ────────────────────── */}
      <button
        onClick={() => {
          if (showSearch || searchTerm) { setShowSearch(false); setSearchTerm(''); }
          else { setShowSearch(true); }
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

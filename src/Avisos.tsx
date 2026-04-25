import api from "./api/axios.js";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { Aviso } from "./dto/AvisoDto.js";
import { useFavorites } from "./hooks/useFavorites.js";
import AvisoCard from "./components/aviso/AvisoCard.js";

export default function Avisos() {
  const navigate = useNavigate();
  const [data, setData] = useState<Aviso[] | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastAccess, setLastAccess] = useState<string>('');
  const { favorites, toggleFavorite } = useFavorites();

  const loadData = () => {
    api.get("/api/v1/avisos")
      .then((res: AxiosResponse<Aviso[]>) => setData(res.data))
      .catch((err: unknown) => console.error("Error al cargar avisos:", err));
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    const savedLastAccess = localStorage.getItem('lastAccess');
    if (savedLastAccess) setLastAccess(savedLastAccess);
    localStorage.setItem('lastAccess', new Date().toLocaleString('es-ES'));
    loadData();
  }, []);

  useEffect(() => {
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
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

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">No hay elementos para mostrar.</div>
    );
  }

  const filteredData = data
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
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-green-600 text-white py-4 shadow-md z-40">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <h1 className={`text-xl md:text-2xl ${showSearch ? 'hidden md:block' : ''}`}>Avisos</h1>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {(showSearch || searchTerm) && (
              <input
                type="text"
                placeholder="Buscar avisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setShowSearch(false); }}
                className="px-3 py-2 rounded text-green-800 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
                autoFocus
              />
            )}
            <button
              onClick={() => {
                if (showSearch || searchTerm) { setShowSearch(false); setSearchTerm(''); }
                else setShowSearch(true);
              }}
              className={`p-2 rounded transition-colors ${
                showSearch || searchTerm ? 'bg-green-800 hover:bg-green-900' : 'hover:bg-green-700'
              }`}
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
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/crear')}
                  className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors flex items-center gap-2"
                >
                  <span>+</span> Publicar Aviso
                </button>
                <button
                  onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
                  className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => window.location.href = '/signin'}
                className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
          </div>

          {!showSearch && (
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        {showMobileMenu && (
          <div className="md:hidden bg-green-700 px-4 py-2 space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { navigate('/crear'); setShowMobileMenu(false); }}
                  className="w-full text-left py-2 px-3 rounded hover:bg-green-800 transition-colors flex items-center gap-2"
                >
                  <span>+</span> Publicar Aviso
                </button>
                <button
                  onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); setShowMobileMenu(false); }}
                  className="w-full text-left py-2 px-3 rounded hover:bg-green-800 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => { window.location.href = '/signin'; setShowMobileMenu(false); }}
                className="w-full text-left py-2 px-3 rounded hover:bg-green-800 transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        )}
      </header>

      <div className={`p-4 bg-green-50 flex-grow pt-20 transition-all duration-300 ${showSearch ? 'blur-sm' : ''}`}>
        {filteredData.length === 0 && searchTerm ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">No se encontraron resultados para "{searchTerm}"</p>
            <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
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
      </div>

      <footer className="bg-green-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Pilares Verdes. Todos los derechos reservados.</p>
          <p className="text-green-200 text-sm mt-1">v1.0.0 - {import.meta.env.VITE_BUILD_HASH || 'dev'}</p>
          {lastAccess && (
            <p className="text-green-200 text-xs mt-1">Último acceso: {lastAccess}</p>
          )}
        </div>
      </footer>

      <button
        onClick={() => {
          if (showSearch || searchTerm) { setShowSearch(false); setSearchTerm(''); }
          else { setShowSearch(true); setShowMobileMenu(false); }
        }}
        className={`fixed text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 md:hidden ${
          showSearch || searchTerm
            ? 'top-1/2 right-6 transform -translate-y-1/2 bg-green-800 hover:bg-green-900'
            : 'bottom-6 right-6 bg-green-600 hover:bg-green-700'
        }`}
      >
        {showSearch || searchTerm ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="w-full px-4 py-3 rounded-xl text-green-800 bg-white placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

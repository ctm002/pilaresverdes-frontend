import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import { useFavorites } from './hooks/useFavorites.js';
import { useCurrentUser } from './hooks/useCurrentUser.js';
import AppNav from './components/ui/AppNav.js';
import AvisoCard from './components/aviso/AvisoCard.js';
import AvisoCardSkeleton from './components/aviso/AvisoCardSkeleton.js';

export default function MisFavoritos() {
  const navigate = useNavigate();
  const currentUsername = useCurrentUser();
  const { favorites } = useFavorites();
  const [data, setData] = useState<Aviso[] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/signin'); return; }
    setIsAuthenticated(true);
    api.get('/api/v1/avisos')
      .then((res: AxiosResponse<Aviso[]>) => setData(res.data))
      .catch((err: unknown) => console.error('Error al cargar avisos:', err));
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const handleLikeCount = async (id: number) => {
    try {
      await api.patch(`/api/v1/avisos/${id}/like`);
      const res: AxiosResponse<Aviso[]> = await api.get('/api/v1/avisos');
      setData(res.data);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const favAvisos = (data ?? []).filter(item => !!favorites[item.id]);
  const isLoading = data === null;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <AppNav
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
      />

      <main className="flex-grow pt-14 px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <AvisoCardSkeleton key={i} />)}
          </div>
        ) : favAvisos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-display text-xl text-forest-900 mb-1">Sin favoritos guardados</p>
              <p className="text-stone-400 text-sm">Marca avisos con ★ para verlos aquí</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-forest-900 hover:bg-forest-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Explorar avisos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favAvisos.map(item => (
              <AvisoCard
                key={item.id}
                item={item}
                currentUsername={currentUsername}
                onNavigate={() => navigate(`/mis-favoritos/${favorites[item.id]?.guid}`)}
                onLikeCount={handleLikeCount}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-forest-950 text-white/60 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs">
          <p className="text-white/80 font-medium">© 2024 Pilares Verdes</p>
        </div>
      </footer>
    </div>
  );
}

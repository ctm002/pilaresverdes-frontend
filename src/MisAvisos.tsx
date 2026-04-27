import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import { useCurrentUser } from './hooks/useCurrentUser.js';
import AppNav from './components/ui/AppNav.js';
import AvisoCard from './components/aviso/AvisoCard.js';
import AvisoCardSkeleton from './components/aviso/AvisoCardSkeleton.js';

export default function MisAvisos() {
  const navigate = useNavigate();
  const currentUsername = useCurrentUser();
  const [data, setData] = useState<Aviso[] | null>(null);

  const loadData = () => {
    api.get('/api/v1/mis-avisos')
      .then((res: AxiosResponse<Aviso[]>) => setData(res.data))
      .catch((err: unknown) => console.error('Error al cargar mis avisos:', err));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/signin');
      return;
    }
    loadData();
  }, [navigate]);

  const isLoading = data === null;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <AppNav title="Mis avisos" backTo="/" />
      <main className="flex-grow pt-14 px-4 py-6">

        {/* Volver al inicio — desktop */}
 
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <AvisoCardSkeleton key={i} />)}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-forest-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-display text-xl text-forest-900 mb-1">Sin avisos publicados</p>
              <p className="text-stone-400 text-sm">Crea tu primer aviso y aparecerá aquí</p>
            </div>
            <button
              onClick={() => navigate('/crear')}
              className="bg-forest-900 hover:bg-forest-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              + Publicar aviso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.map((item) => (
              <AvisoCard
                key={item.id}
                item={item}
                currentUsername={currentUsername}
                onNavigate={(s) => navigate(`/avisos/${s}/gestionar`)}
                onLikeCount={() => {}}
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

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import { useFavorites } from './hooks/useFavorites.js';
import AppNav from './components/ui/AppNav.js';
import ImageGallery from './components/ui/ImageGallery.js';
import MapView from './components/ui/MapView.js';
import LikeButton from './components/aviso/LikeButton.js';
import WhatsAppButton from './components/aviso/WhatsAppButton.js';

export default function DetalleFavorito() {
  const navigate = useNavigate();
  const { guid } = useParams();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const { favorites } = useFavorites();

  useEffect(() => {
    if (!guid) return;
    api.get(`/api/v1/favoritos/${guid}`)
      .then(res => setAviso(res.data))
      .catch(err => console.error('Error al cargar aviso:', err));
  }, [guid]);

  const handleLikeCount = async (avisoId: number) => {
    try {
      await api.patch(`/api/v1/avisos/${avisoId}/like`);
      const res = await api.get(`/api/v1/avisos/${aviso?.slug}`);
      setAviso(res.data);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  if (!aviso) {
    return (
      <div className="min-h-screen bg-cream md:pt-8 pt-16">
        <AppNav title="Mi favorito" backTo="/mis-favoritos" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="w-full h-80 bg-stone-200 rounded-xl animate-pulse" />
              <div className="space-y-2 pt-1">
                <div className="h-7 w-3/4 bg-stone-200 rounded animate-pulse" />
                <div className="h-7 w-1/2 bg-stone-200 rounded animate-pulse" />
              </div>
              <div className="flex gap-4 pt-1">
                <div className="h-3 w-28 bg-stone-100 rounded animate-pulse" />
                <div className="h-3 w-36 bg-stone-100 rounded animate-pulse" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-stone-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allImages = [
    { url: aviso.image_url, id: 0, imageBase64: '', avisoId: aviso.id },
    ...(aviso.imagesAvisoList || [])
  ];

  const favEntry = favorites[aviso.id];

  return (
    <div className="min-h-screen bg-cream md:pt-8 pt-16">
      <AppNav title="Mi favorito" backTo="/mis-favoritos" />

      <div className="max-w-2xl mx-auto mt-8 hidden md:block px-4">
        <button
          onClick={() => navigate('/mis-favoritos')}
          className="text-forest-700 hover:text-forest-900 text-sm font-medium transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a mis favoritos
        </button>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-5">
            <ImageGallery images={allImages} title={aviso.titulo} />

            <h1 className="font-display text-2xl font-bold text-forest-950 mb-2 leading-snug">
              {aviso.titulo}
            </h1>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5">
              <p className="text-stone-400 text-xs">Por <span className="text-forest-700 font-medium">{aviso.username}</span></p>
              {aviso.fecha_creacion && (
                <p className="text-stone-400 text-xs">Publicado el {aviso.fecha_creacion}</p>
              )}
            </div>

            <p className="text-stone-600 text-[15px] leading-relaxed mb-6">{aviso.descripcion}</p>

            {favEntry?.notas && (
              <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-[11px] font-semibold text-amber-600 mb-1">Mis notas</p>
                <p className="text-stone-600 text-sm leading-relaxed">{favEntry.notas}</p>
              </div>
            )}

            <MapView
              latitud={aviso.latitud}
              longitud={aviso.longitud}
              ubicacion={aviso.ubicacion}
            />

            <div className="flex justify-between items-center pt-4 border-t border-stone-100">
              <LikeButton count={aviso.likes || 0} onClick={() => handleLikeCount(aviso.id)} />
              <WhatsAppButton phone={aviso.celular} title={aviso.titulo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

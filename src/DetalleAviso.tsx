import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import { useFavorites } from './hooks/useFavorites.js';
import AppNav from './components/ui/AppNav.js';
import ImageGallery from './components/ui/ImageGallery.js';
import MapView from './components/ui/MapView.js';
import LikeButton from './components/aviso/LikeButton.js';
import FavoriteButton from './components/aviso/FavoriteButton.js';
import WhatsAppButton from './components/aviso/WhatsAppButton.js';

export default function DetalleAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [allAvisos, setAllAvisos] = useState<Aviso[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const hasFetched = useRef<string | null>(null);

  useEffect(() => {
    if (!slug || hasFetched.current === slug) return;
    hasFetched.current = slug;
    setIsNavigating(false);

    Promise.all([
      api.get('/api/v1/avisos'),
      api.get(`/api/v1/avisos/slug/${slug}`)
    ])
      .then(([avisosRes, avisoRes]) => {
        setAllAvisos(avisosRes.data);
        setAviso(avisoRes.data);
        const index = avisosRes.data.findIndex((a: Aviso) => a.slug === slug);
        setCurrentIndex(index >= 0 ? index : 0);
      })
      .catch(err => console.error('Error al cargar datos:', err));
  }, [slug]);

  const handleLikeCount = async (avisoId: number) => {
    try {
      await api.patch(`/api/v1/avisos/${avisoId}/like`);
      const res = await api.get(`/api/v1/avisos/slug/${aviso?.slug}`);
      setAviso(res.data);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  if (!aviso) {
    return (
      <div className="min-h-screen bg-cream md:pt-8 pt-16">
        <AppNav title="Detalle del aviso" backTo="/" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-5 space-y-4">
              {/* Image skeleton */}
              <div className="w-full h-80 bg-stone-200 rounded-xl animate-pulse" />
              {/* Title skeleton */}
              <div className="space-y-2 pt-1">
                <div className="h-7 w-3/4 bg-stone-200 rounded animate-pulse" />
                <div className="h-7 w-1/2 bg-stone-200 rounded animate-pulse" />
              </div>
              {/* Meta skeleton */}
              <div className="flex gap-4 pt-1">
                <div className="h-3 w-28 bg-stone-100 rounded animate-pulse" />
                <div className="h-3 w-36 bg-stone-100 rounded animate-pulse" />
              </div>
              {/* Description skeleton */}
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-stone-100 rounded animate-pulse" />
              </div>
              {/* Actions skeleton */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                <div className="h-8 w-16 bg-stone-100 rounded-lg animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-stone-100 rounded-lg animate-pulse" />
                  <div className="h-8 w-8 bg-stone-100 rounded-lg animate-pulse" />
                </div>
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

  return (
    <div className="min-h-screen bg-cream md:pt-8 pt-16">
      <AppNav title="Detalle del aviso" backTo="/" />
        {/* Desktop back button */}
        <div className="max-w-2xl mx-auto mt-4 hidden md:block">
          <button
            onClick={() => navigate('/')}
            className="text-forest-700 hover:text-forest-900 text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a avisos
          </button>
        </div>

      <div className="container mx-auto px-4 py-8">
        {/* Desktop back button */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden relative">
          {isNavigating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="w-10 h-10 border-4 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
            </div>
          )}

          <div className="p-5">
            {/* Favorito — encima de la galería */}
            <div className="flex justify-end mb-2">
              <FavoriteButton
                isFavorite={favorites[aviso.id] || false}
                onClick={() => toggleFavorite(aviso.id)}
              />
            </div>

            <ImageGallery images={allImages} title={aviso.titulo} />

            {/* Title */}
            <h1 className="font-display text-2xl font-bold text-forest-950 mb-2 leading-snug">
              {aviso.titulo}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5">
              <p className="text-stone-400 text-xs">Por <span className="text-forest-700 font-medium">{aviso.username}</span></p>
              {aviso.fecha_creacion && (
                <p className="text-stone-400 text-xs">Publicado el {aviso.fecha_creacion}</p>
              )}
            </div>

            {/* Description */}
            <p className="text-stone-600 text-[15px] leading-relaxed mb-6">{aviso.descripcion}</p>

            {/* Map */}
            <MapView
              latitud={aviso.latitud}
              longitud={aviso.longitud}
              ubicacion={aviso.ubicacion}
            />

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-100">
              <LikeButton count={aviso.likes || 0} onClick={() => handleLikeCount(aviso.id)} />
              <WhatsAppButton phone={aviso.celular} title={aviso.titulo} />
            </div>
          </div>
        </div>


      </div>

      {/* Mobile navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-8 md:hidden bg-white/90 backdrop-blur-md rounded-full px-3 py-2 shadow-xl border border-stone-100">
        <button
          onClick={() => {
            setIsNavigating(true);
            setTimeout(() => {
              const prevIndex = currentIndex === 0 ? allAvisos.length - 1 : currentIndex - 1;
              const prev = allAvisos[prevIndex];
              if (prev) navigate(`/avisos/${prev.slug}`);
            }, 400);
          }}
          className="bg-stone-100 hover:bg-stone-200 text-stone-600 p-3.5 rounded-full transition-colors"
          aria-label="Anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => {
            setIsNavigating(true);
            setTimeout(() => {
              const nextIndex = (currentIndex + 1) % allAvisos.length;
              const next = allAvisos[nextIndex];
              if (next) navigate(`/avisos/${next.slug}`);
            }, 400);
          }}
          className="bg-forest-900 hover:bg-forest-800 text-white p-3.5 rounded-full transition-colors"
          aria-label="Siguiente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

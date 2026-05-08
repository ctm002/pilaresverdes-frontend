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
import { resolveImageUrl } from './utils/imageUrl.js';
import FavoritoModal from './components/aviso/FavoritoModal.js';
import WhatsAppButton from './components/aviso/WhatsAppButton.js';

export default function DetalleAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [showFavModal, setShowFavModal] = useState(false);
  const [allAvisos, setAllAvisos] = useState<Aviso[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [recommended, setRecommended] = useState<Aviso[]>([]);
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
        const loadedAviso: Aviso = avisoRes.data;
        setAviso(loadedAviso);
        const index = avisosRes.data.findIndex((a: Aviso) => a.slug === slug);
        setCurrentIndex(index >= 0 ? index : 0);

        if (loadedAviso.latitud != null && loadedAviso.longitud != null) {
          api.get('/api/v1/avisos/cercanos', {
            params: { lat: loadedAviso.latitud, lng: loadedAviso.longitud }
          })
            .then(res => setRecommended((res.data as Aviso[]).filter(a => a.slug !== slug)))
            .catch(() => {});
        }
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
    { url: resolveImageUrl(aviso.image_url), id: 0, imageBase64: '', avisoId: aviso.id },
    ...(aviso.imagesAvisoList || []).map(img => ({ ...img, url: resolveImageUrl(img.url) }))
  ];

  return (
    <div className="min-h-screen bg-cream md:pt-8 pt-16">
      <AppNav title="Detalle del aviso" backTo="/" />
        {/* Desktop back button */}
        <div className="max-w-2xl mx-auto mt-8 hidden md:block">
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

      <div className="container mx-auto px-4 py-4">
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
                isFavorite={!!favorites[aviso.id]}
                onClick={() => {
                  if (favorites[aviso.id]) {
                    removeFavorite(aviso.id);
                  } else {
                    setShowFavModal(true);
                  }
                }}
              />
            </div>

            {showFavModal && (
              <FavoritoModal
                onConfirm={async (notas) => {
                  setShowFavModal(false);
                  await addFavorite(aviso.id, notas);
                }}
                onClose={() => setShowFavModal(false)}
              />
            )}
            <ImageGallery images={allImages} title={aviso.titulo} />

            {/* Title + actions */}
            <div className="flex items-start justify-between gap-3 mt-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-forest-950 leading-snug">
                {aviso.titulo}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                <LikeButton count={aviso.likes || 0} onClick={() => handleLikeCount(aviso.id)} />
                <WhatsAppButton phone={aviso.celular} title={aviso.titulo} />
              </div>
            </div>

            {/* Location */}
            {(aviso.comuna?.name || aviso.comuna?.provincia?.region?.name) && (
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-sm font-bold text-forest-700">
                  {[aviso.comuna?.name, aviso.comuna?.provincia?.region?.name].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5">
              <p className="text-stone-400 text-xs">Por <span className="text-forest-700 font-medium">{aviso.username}</span></p>
              {aviso.fecha_creacion && (() => {
                const [day, month, year] = aviso.fecha_creacion!.split('-').map(Number);
                const dias = Math.floor((Date.now() - new Date(year, month - 1, day).getTime()) / 86_400_000);
                const label = dias === 0 ? 'hoy' : dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
                return <p className="text-stone-400 text-xs">Publicado {label}</p>;
              })()}
            </div>

            {/* Precio */}
            {(aviso.precio != null || aviso.precio_uf != null) && (
              <div className="flex flex-col gap-0.5 mb-5">
                {aviso.precio != null && (
                  <span className="text-3xl font-extrabold text-forest-900 tracking-tight">
                    ${aviso.precio.toLocaleString('es-CL')}
                  </span>
                )}
                {aviso.precio_uf != null && (
                  <span className="text-sm font-semibold text-stone-400">
                    {aviso.precio_uf.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UF
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-stone-600 text-[15px] leading-relaxed mb-6">{aviso.descripcion}</p>

            {/* Map */}
            <MapView
              latitud={aviso.latitud}
              longitud={aviso.longitud}
              ubicacion={aviso.comuna?.name}
            />

          </div>
        </div>


        {/* Recomendados */}
        {recommended.length > 0 && (
          <div className="max-w-2xl mx-auto mt-6 pb-24 md:pb-6">
            <h2 className="text-sm font-semibold text-forest-800 tracking-widest uppercase mb-3 px-1">
              Te puede interesar
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible snap-x snap-mandatory">
              {recommended.map(a => (
                <div
                  key={a.id}
                  onClick={() => navigate(`/avisos/${a.slug}`)}
                  className="flex-shrink-0 w-44 md:w-auto bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow snap-start"
                >
                  <div className="h-28 overflow-hidden">
                    <img
                      src={resolveImageUrl(a.image_url)}
                      alt={a.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[13px] font-semibold text-forest-950 line-clamp-2 leading-snug mb-1">{a.titulo}</p>
                    {a.comuna?.name && (
                      <p className="text-[11px] text-stone-400 truncate">{a.comuna.name}</p>
                    )}
                    <p className="text-[12px] font-bold text-forest-900 mt-1">
                      {a.precio != null ? `$${a.precio.toLocaleString('es-CL')}` : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

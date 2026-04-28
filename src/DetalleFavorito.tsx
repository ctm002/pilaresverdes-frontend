import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';
import { FavoritoDetalle } from './dto/FavoritoDto.js';
import AppNav from './components/ui/AppNav.js';
import ImageGallery from './components/ui/ImageGallery.js';
import MapView from './components/ui/MapView.js';
import WhatsAppButton from './components/aviso/WhatsAppButton.js';

export default function DetalleFavorito() {
  const navigate = useNavigate();
  const { guid } = useParams();
  const [favorito, setFavorito] = useState<FavoritoDetalle | null>(null);

  useEffect(() => {
    if (!guid) return;
    api.get(`/api/v1/favoritos/${guid}`)
      .then(res => setFavorito(res.data))
      .catch(err => console.error('Error al cargar favorito:', err));
  }, [guid]);

  if (!favorito) {
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
    { url: favorito.urlFotoBackup, id: 0, imageBase64: '', avisoId: favorito.id },
    ...(favorito.imagesAvisoList || [])
  ];

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
            <ImageGallery images={allImages} title={favorito.titulo} />

            <h1 className="font-display text-2xl font-bold text-forest-950 mb-2 leading-snug">
              {favorito.titulo}
            </h1>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5">
              <p className="text-stone-400 text-xs">Por <span className="text-forest-700 font-medium">{favorito.username}</span></p>
              {favorito.fecha_creacion && (
                <p className="text-stone-400 text-xs">Publicado el {favorito.fecha_creacion}</p>
              )}
            </div>

            <p className="text-stone-600 text-[15px] leading-relaxed mb-6">{favorito.descripcion}</p>

            {favorito.notasPersonales && (
              <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-[11px] font-semibold text-amber-600 mb-1">Mis notas</p>
                <p className="text-stone-600 text-sm leading-relaxed">{favorito.notasPersonales}</p>
              </div>
            )}

            <MapView
              latitud={favorito.latitud}
              longitud={favorito.longitud}
              ubicacion={favorito.ubicacion}
            />

            <div className="pt-4 border-t border-stone-100">
              <WhatsAppButton
                phone={favorito.celular}
                title={favorito.titulo}
                label="Contactar por WhatsApp"
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

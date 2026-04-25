import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import { useFavorites } from './hooks/useFavorites.js';
import SimpleHeader from './components/ui/SimpleHeader.js';
import LikeButton from './components/aviso/LikeButton.js';
import FavoriteButton from './components/aviso/FavoriteButton.js';
import WhatsAppButton from './components/aviso/WhatsAppButton.js';

export default function DetalleAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedImage, setSelectedImage] = useState(0);
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
      <div className="min-h-screen bg-green-50 pt-20 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  const allImages = [
    { url: aviso.image_url, id: 0, imageBase64: '', avisoId: aviso.id },
    ...(aviso.imagesAvisoList || [])
  ];

  return (
    <div className="min-h-screen bg-green-50 md:pt-8 pt-20">
      <SimpleHeader title="Detalle Aviso" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden relative">
          {isNavigating && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="w-12 h-12 border-4 border-green-300 border-t-green-600 rounded-full animate-spin" />
            </div>
          )}
          <div className="p-4">
            <img
              src={allImages[selectedImage]?.url || allImages[selectedImage]?.imageBase64 || aviso.image_url}
              alt={aviso.titulo}
              className="w-full h-80 object-cover rounded-lg mb-4"
            />

            {allImages.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pt-2 pb-2 pl-2">
                {allImages.map((image, index) => (
                  <img
                    key={image.id || index}
                    src={image.url || image.imageBase64}
                    alt={`${aviso.titulo} - vista ${index + 1}`}
                    className={`w-16 h-16 object-cover rounded cursor-pointer transition-all ${
                      selectedImage === index ? 'ring-2 ring-green-500 opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}

            <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">{aviso.titulo}</h1>
            <div className="flex flex-col gap-1 mb-4">
              <p className="text-gray-500 text-sm">Por: {aviso.username}</p>
              {aviso.fecha_creacion && (
                <p className="text-gray-500 text-sm">Creado el: {aviso.fecha_creacion}</p>
              )}
            </div>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">{aviso.descripcion}</p>

            <div className="flex justify-between items-center">
              <LikeButton count={aviso.likes || 0} onClick={() => handleLikeCount(aviso.id)} />
              <div className="flex gap-2">
                <FavoriteButton
                  isFavorite={favorites[aviso.id] || false}
                  onClick={() => toggleFavorite(aviso.id)}
                />
                <WhatsAppButton phone={aviso.celular} title={aviso.titulo} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-4 hidden md:block">
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-10 md:hidden bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 shadow-xl">
        <button
          onClick={() => {
            setIsNavigating(true);
            setTimeout(() => {
              const prevIndex = currentIndex === 0 ? allAvisos.length - 1 : currentIndex - 1;
              const prev = allAvisos[prevIndex];
              if (prev) navigate(`/avisos/${prev.slug}`);
            }, 500);
          }}
          className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full shadow-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            }, 500);
          }}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

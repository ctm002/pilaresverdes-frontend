import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import SimpleHeader from './components/ui/SimpleHeader.js';
import ImageGallery from './components/ui/ImageGallery.js';

export default function GestionarAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.get(`/api/v1/avisos/slug/${slug}`)
      .then(res => setAviso(res.data))
      .catch(err => console.error('Error al cargar aviso:', err));
  }, [slug]);

  const handleDelete = async () => {
    if (!aviso) return;
    if (!confirm('¿Estás seguro de que quieres eliminar este aviso? Esta acción no se puede deshacer.')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/avisos/${aviso.id}`);
      navigate('/mis-avisos');
    } catch (error) {
      console.error('Error al eliminar aviso:', error);
      setIsDeleting(false);
    }
  };

  /* ── Skeleton ─────────────────────────────────────────── */
  if (!aviso) {
    return (
      <div className="min-h-screen bg-cream pt-16">
        <SimpleHeader title="Gestionar aviso" backTo="/mis-avisos" />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-4">
            <div className="w-full h-64 bg-stone-200 rounded-xl animate-pulse" />
            <div className="h-7 w-3/4 bg-stone-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-stone-100 rounded animate-pulse" />
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
    <div className="min-h-screen bg-cream pt-16">
      <SimpleHeader title="Gestionar aviso" backTo="/mis-avisos" />

      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Aviso preview card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-6">
          <div className="p-5">
            <ImageGallery images={allImages} title={aviso.titulo} />

            <h1 className="font-display text-2xl font-bold text-forest-950 mb-1 leading-snug">
              {aviso.titulo}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
              <p className="text-stone-400 text-xs">
                Por <span className="text-forest-700 font-medium">{aviso.username}</span>
              </p>
              {aviso.fecha_creacion && (
                <p className="text-stone-400 text-xs">Publicado el {aviso.fecha_creacion}</p>
              )}
            </div>
            <p className="text-stone-600 text-sm leading-relaxed line-clamp-4">
              {aviso.descripcion}
            </p>
          </div>
        </div>

        {/* Volver */}
        <button
          onClick={() => navigate('/mis-avisos')}
          className="inline-flex items-center gap-1.5 text-forest-700 hover:text-forest-900 text-sm font-medium transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a mis avisos
        </button>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/avisos/${aviso.slug}/editar`)}
            className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-forest-900 text-forest-900 hover:text-white border border-stone-200 hover:border-forest-900 rounded-2xl py-6 font-semibold transition-all duration-200 group"
          >
            <svg className="w-7 h-7 text-forest-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm">Editar aviso</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-red-600 text-red-500 hover:text-white border border-red-100 hover:border-red-600 rounded-2xl py-6 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <svg className="w-7 h-7 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm">{isDeleting ? 'Eliminando…' : 'Eliminar aviso'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

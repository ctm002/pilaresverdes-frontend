import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';
import { Aviso } from './dto/AvisoDto.js';
import AppNav from './components/ui/AppNav.js';

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight; }
      }
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function GestionarAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slug) return;
    api.get(`/api/v1/avisos/slug/${slug}`)
      .then(res => setAviso(res.data))
      .catch(err => console.error('Error al cargar aviso:', err));
  }, [slug]);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !aviso) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es muy grande. Máximo 10MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const base64 = await compressImage(file);
      setPreviewUrl(base64);

      await api.put(`/api/v1/avisos/${aviso.slug}`, {
        titulo: aviso.titulo,
        descripcion: aviso.descripcion,
        celular: aviso.celular,
        imageBase64: base64,
        image_url: '',
        imagesAvisoList: aviso.imagesAvisoList ?? [],
        likes: aviso.likes,
      });

      setAviso(prev => prev ? { ...prev, image_url: base64 } : prev);
    } catch (error) {
      console.error('Error al actualizar imagen:', error);
      setPreviewUrl(null);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      <div className="min-h-screen bg-cream pt-14">
        <AppNav title="Gestionar aviso" backTo="/mis-avisos" />
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

  const imageSrc = previewUrl ?? aviso.image_url;

  return (
    <div className="min-h-screen bg-cream pt-14">
      <AppNav title="Gestionar aviso" backTo="/mis-avisos" />

      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Aviso preview card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-4">

          {/* Imagen principal editable */}
          <div
            className="relative h-64 cursor-pointer group"
            onClick={handleImageClick}
          >
            <img
              src={imageSrc}
              alt={aviso.titulo}
              className="w-full h-full object-cover"
            />
            {/* Overlay con instrucción */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2 text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Cambiar imagen</span>
              </div>
            </div>

            {/* Spinner mientras sube */}
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}

            {/* Badge */}
            <span className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none">
              Imagen principal · click para cambiar
            </span>
          </div>

          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {/* Info */}
          <div className="p-5">
            <h1 className="font-display text-2xl font-bold text-forest-950 mb-1 leading-snug">
              {aviso.titulo}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              <p className="text-stone-400 text-xs">
                Por <span className="text-forest-700 font-medium">{aviso.username}</span>
              </p>
              {aviso.fecha_creacion && (
                <p className="text-stone-400 text-xs">Publicado el {aviso.fecha_creacion}</p>
              )}
            </div>
            <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">
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
            className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-red-600 text-red-500 hover:text-white border border-red-100 hover:border-red-600 rounded-2xl py-6 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm">{isDeleting ? 'Eliminando…' : 'Eliminar aviso'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

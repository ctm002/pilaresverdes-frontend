import { useState, useEffect } from 'react';
import { Aviso } from '../../dto/AvisoDto.js';
import LikeButton from './LikeButton.js';
import WhatsAppButton from './WhatsAppButton.js';

interface AvisoCardProps {
  item: Aviso;
  currentUsername: string | null;
  managing?: boolean;
  delay?: number;
  onNavigate: (slug: string) => void;
  onEdit: (item: Aviso) => void;
  onDelete: (id: number) => void;
  onLikeCount: (id: number) => void;
}

export default function AvisoCard({
  item,
  currentUsername,
  managing = false,
  delay = 0,
  onNavigate,
  onEdit,
  onDelete,
  onLikeCount,
}: AvisoCardProps) {
  const isOwner = !!currentUsername && item.username === currentUsername;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [delayDone, setDelayDone] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setDelayDone(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const showContent = imageLoaded && delayDone;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden border border-stone-100 group">

      {/* Image */}
      <div
        className="relative h-52 flex-shrink-0 overflow-hidden cursor-pointer"
        onClick={() => onNavigate(item.slug)}
      >
        {!showContent && (
          <div className="absolute inset-0 z-10 bg-stone-200 animate-pulse" />
        )}
        <img
          src={item.image_url}
          alt={item.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
        {showContent && item.imagesAvisoList && item.imagesAvisoList.length > 0 && (
          <span className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            +{item.imagesAvisoList.length} fotos
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow gap-3">

        {!showContent ? (
          <>
            <div className="h-3 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="flex-grow space-y-2 pt-0.5">
              <div className="h-4 w-4/5 bg-stone-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-stone-200 rounded animate-pulse" />
              <div className="h-3 w-3/5 bg-stone-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
              <div className="h-3 w-14 bg-stone-200 rounded animate-pulse" />
              <div className="flex gap-1.5">
                <div className="h-7 w-14 bg-stone-200 rounded-lg animate-pulse" />
                <div className="h-7 w-7 bg-stone-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Author row */}
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-forest-700 font-medium">Por {item.username}</span>
              {isOwner && !managing && (
                <span className="text-[10px] font-semibold text-forest-700 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full">
                  Tu aviso
                </span>
              )}
            </div>

            {/* Title & description */}
            <div className="flex-grow">
              <h3
                className="font-display text-[15px] font-semibold text-forest-950 truncate leading-snug mb-1 cursor-pointer hover:text-forest-800 transition-colors"
                onClick={() => onNavigate(item.slug)}
              >
                {item.titulo}
              </h3>
              <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                {item.descripcion}
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
              {managing ? (
                /* Modo gestión: botones editar / eliminar */
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest-900 hover:bg-forest-800 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </>
              ) : (
                /* Modo normal: like + WhatsApp */
                <>
                  <span className="text-[11px] text-stone-400">
                    <span className="font-medium text-stone-500">{item.visitas ?? 0}</span> visitas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <LikeButton
                      count={item.likes || 0}
                      onClick={(e) => { e.stopPropagation(); onLikeCount(item.id); }}
                    />
                    <WhatsAppButton
                      phone={item.celular}
                      title={item.titulo}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Aviso } from '../../dto/AvisoDto.js';
import LikeButton from './LikeButton.js';
import FavoriteButton from './FavoriteButton.js';
import WhatsAppButton from './WhatsAppButton.js';

interface AvisoCardProps {
  item: Aviso;
  isAuthenticated: boolean;
  isFavorite: boolean;
  onNavigate: (slug: string) => void;
  onEdit: (item: Aviso) => void;
  onDelete: (id: number) => void;
  onLikeCount: (id: number) => void;
  onFavorite: (id: number) => void;
}

export default function AvisoCard({
  item,
  isAuthenticated,
  isFavorite,
  onNavigate,
  onEdit,
  onDelete,
  onLikeCount,
  onFavorite,
}: AvisoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden border border-stone-100 group">

      {/* ── Image area ──────────────────────────────────── */}
      <div
        className="relative h-52 flex-shrink-0 overflow-hidden cursor-pointer"
        onClick={() => onNavigate(item.slug)}
      >
        {/* Skeleton overlay — desaparece cuando la imagen cargó */}
        {!imageLoaded && (
          <div className="absolute inset-0 z-10 bg-stone-200 animate-pulse" />
        )}

        {/* Imagen — siempre en el DOM para que el browser la descargue */}
        <img
          src={item.image_url}
          alt={item.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

        {imageLoaded && item.imagesAvisoList && item.imagesAvisoList.length > 0 && (
          <span className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            +{item.imagesAvisoList.length} fotos
          </span>
        )}
      </div>

      {/* ── Content area ────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-grow gap-3">

        {!imageLoaded ? (
          /* Skeleton del texto mientras carga la imagen */
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
                <div className="h-7 w-7 bg-stone-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </>
        ) : (
          /* Contenido real */
          <>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-forest-700 font-medium">Por {item.username}</span>
              {/* Admin buttons — ocultos hasta activar */}
              <div className="hidden gap-1.5">
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 bg-stone-100 hover:bg-sky-100 hover:text-sky-700 text-stone-400 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 bg-stone-100 hover:bg-red-100 hover:text-red-600 text-stone-400 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

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

            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-400">
                <span className="font-medium text-stone-500">{item.visitas ?? 0}</span> visitas
              </span>
              <div className="flex items-center gap-1.5">
                <LikeButton
                  count={item.likes || 0}
                  onClick={(e) => { e.stopPropagation(); onLikeCount(item.id); }}
                />
                <FavoriteButton
                  isFavorite={isFavorite}
                  onClick={(e) => { e.stopPropagation(); onFavorite(item.id); }}
                />
                <WhatsAppButton
                  phone={item.celular}
                  title={item.titulo}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

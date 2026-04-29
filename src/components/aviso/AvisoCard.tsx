import { useState, useEffect } from 'react';
import { Aviso } from '../../dto/AvisoDto.js';
import LikeButton from './LikeButton.js';
import WhatsAppButton from './WhatsAppButton.js';

interface AvisoCardProps {
  item: Aviso;
  currentUsername: string | null;
  delay?: number;
  onNavigate: (slug: string) => void;
  onLikeCount: (id: number) => void;
}

export default function AvisoCard({
  item,
  currentUsername,
  delay = 0,
  onNavigate,
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
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-forest-700 font-medium">Por {item.username}</span>
              {isOwner && (
                <span className="text-[10px] font-semibold text-forest-700 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full">
                  Tu aviso
                </span>
              )}
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

            <div className="flex flex-col gap-0.5">
              {item.precio != null && (
                <span className="text-forest-900 font-bold text-base">
                  ${item.precio.toLocaleString('es-CL')}
                </span>
              )}
              {item.precio_uf != null && (
                <span className="text-stone-400 text-[11px]">
                  {item.precio_uf.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UF
                </span>
              )}
              {item.metros_cuadrados != null && (
                <span className="text-stone-500 text-[11px] font-medium">
                  {item.metros_cuadrados} m²
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-stone-400">
                  <span className="font-medium text-stone-500">{item.visitas ?? 0}</span> visitas
                </span>
                <LikeButton
                  count={item.likes || 0}
                  onClick={(e) => { e.stopPropagation(); onLikeCount(item.id); }}
                />
              </div>
              <WhatsAppButton
                phone={item.celular}
                title={item.titulo}
                label="Contactar por WhatsApp"
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

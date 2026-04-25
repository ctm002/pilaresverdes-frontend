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
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 px-4 py-4 relative flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-xs">Por: {item.username}</p>
        <div className="hidden flex gap-2">
          {isAuthenticated && (
            <>
              <button
                onClick={() => onEdit(item)}
                className="bg-gray-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="bg-gray-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative w-full cursor-pointer" onClick={() => onNavigate(item.slug)}>
        <div className="bg-gray-200 animate-pulse rounded h-48 w-full flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
        </div>
        <img
          src={item.image_url}
          alt={item.titulo}
          loading="lazy"
          className="object-cover h-48 w-full rounded absolute inset-0 opacity-0 transition-opacity duration-300"
          onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
        />
        {item.imagesAvisoList && item.imagesAvisoList.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            +{item.imagesAvisoList.length} más
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <div className="py-2 flex-grow">
          <h3 className="text-lg font-semibold truncate">{item.titulo}</h3>
          <p
            className="text-gray-600 text-sm overflow-hidden"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {item.descripcion}
          </p>
        </div>
        <p className="text-gray-500 text-xs">
          Visitas <span className="font-bold">{item.visitas ?? 0}</span>
        </p>
      </div>

      <div className="flex justify-between items-center">
        <LikeButton
          count={item.likes || 0}
          onClick={(e) => { e.stopPropagation(); onLikeCount(item.id); }}
        />
        <div className="inline-flex gap-2">
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
    </div>
  );
}

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export default function FavoriteButton({ isFavorite, onClick }: FavoriteButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all border ${
        isFavorite
          ? 'bg-amber-50 text-gold hover:bg-amber-100 border-amber-200'
          : 'bg-stone-50 text-stone-400 hover:bg-stone-100 border-stone-100 hover:text-gold'
      }`}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </button>
  );
}

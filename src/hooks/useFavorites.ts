import { useState } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  return { favorites, toggleFavorite };
}

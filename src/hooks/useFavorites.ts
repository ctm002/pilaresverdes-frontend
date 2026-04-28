import { useState, useEffect } from 'react';
import { AxiosResponse } from 'axios';
import api from '../api/axios.js';
import { Favorito } from '../dto/FavoritoDto.js';

type FavEntry = { favoritoId: number; notas: string };
type FavMap = Record<number, FavEntry>;

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavMap>({});

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/api/v1/favoritos')
      .then((res: AxiosResponse<Favorito[]>) => {
        const map: FavMap = {};
        res.data.forEach(f => { map[f.propiedadId] = { favoritoId: f.id, notas: f.notas }; });
        setFavorites(map);
      })
      .catch((err: unknown) => console.error('Error al cargar favoritos:', err));
  }, []);

  const addFavorite = async (propiedadId: number, notas: string) => {
    const res: AxiosResponse<Favorito> = await api.post('/api/v1/favoritos', { propiedadId, notas });
    setFavorites(prev => ({ ...prev, [propiedadId]: { favoritoId: res.data.id, notas: res.data.notas } }));
  };

  const removeFavorite = async (idaviso: number) => {
    const entry = favorites[idaviso];
    if (!entry) return;
    await api.delete(`/api/v1/favoritos/${entry.favoritoId}`);
    setFavorites(prev => {
      const next = { ...prev };
      delete next[idaviso];
      return next;
    });
  };

  return { favorites, addFavorite, removeFavorite };
}

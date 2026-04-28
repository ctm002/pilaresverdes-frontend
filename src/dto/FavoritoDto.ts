export interface CreateFavoritoDto {
  idaviso: number;
  notas: string;
}

export interface Favorito {
  id: number;
  guid: string;
  propiedadId: number;
  notas: string;
}

import { Aviso } from './AvisoDto.js';

export interface FavoritoDetalle {
  id: number;
  guid: string;
  propiedadId: number;
  notas: string;
  aviso: Aviso;
}

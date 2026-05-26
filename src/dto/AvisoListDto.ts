export interface RegionDto {
  id: number;
  name: string;
}

export interface AvisoListItem {
  id: number;
  titulo: string;
  descripcion: string;
  celular: string;
  likes: number;
  slug: string;
  username: string;
  visitas: number;
  comuna: string;
  region: string;
  precio: number;
  precio_uf: number;
  image_url: string;
  fecha_creacion: string;
  metros_cuadrados: number;
  tipo_operacion: 'VENTA' | 'ARRIENDO';
}

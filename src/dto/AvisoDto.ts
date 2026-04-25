export interface ImagesAvisoDto {
  imageBase64: string;
  url: string;
  id: number;
  avisoId: number;
}

export interface Aviso {
  id: number;
  titulo: string;
  descripcion: string;
  image_url: string;
  celular: string;
  likes: number;
  slug: string;
  imagesAvisoList?: ImagesAvisoDto[];
  username: string;
  visitas?: number;
  fecha_creacion?: string;
}

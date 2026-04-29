import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';
import { ImagesAvisoDto } from './dto/AvisoDto.js';
import AppNav from './components/ui/AppNav.js';
import FormField from './components/ui/FormField.js';

function imageSrc(img: ImagesAvisoDto): string {
  if (img.url) return img.url;
  if (!img.imageBase64) return '';
  return img.imageBase64.startsWith('data:')
    ? img.imageBase64
    : `data:image/jpeg;base64,${img.imageBase64}`;
}

const Placeholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-stone-100">
    <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

export default function EditarAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    celular: '',
    slug: '',
    id: 0,
    mainImageUrl: '',
    precio: '',
    metros_cuadrados: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImagesAvisoDto[]>([]);
  const [, setMainImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated] = useState(!!localStorage.getItem('token'));
  const [ufValue, setUfValue] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('https://mindicador.cl/api/uf')
      .then(r => r.json())
      .then((data: { serie: { valor: number }[] }) => setUfValue(data.serie[0]?.valor ?? null))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (slug) {
      setIsEditing(true);
      api.get(`/api/v1/avisos/slug/${slug}`)
        .then(res => {
          const aviso = res.data;
          setFormData({
            titulo: aviso.titulo,
            descripcion: aviso.descripcion,
            celular: aviso.celular,
            slug: aviso.slug || '',
            id: aviso.id || 0,
            mainImageUrl: aviso.image_url || '',
            precio: aviso.precio != null ? String(aviso.precio) : '',
            metros_cuadrados: aviso.metros_cuadrados != null ? String(aviso.metros_cuadrados) : ''
          });
          setExistingImages(aviso.imagesAvisoList || []);
          setMainImageUrl(aviso.image_url || '');
        })
        .catch(err => console.error('Error al cargar aviso:', err));
    }
  }, [slug]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight; }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imagesBase64: string[] = [];
      if (selectedFiles.length > 0) {
        imagesBase64 = await Promise.all(selectedFiles.map(file => compressImage(file)));
      }

      const dto = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        image_url: formData.mainImageUrl,
        imageBase64: !formData.mainImageUrl && imagesBase64.length > 0 ? imagesBase64[0] : '',
        imagesAvisoList: !formData.mainImageUrl && imagesBase64.length > 1
          ? imagesBase64.slice(1).map((base64) => ({ imageBase64: base64, url: '', id: 0, avisoId: formData.id }))
          : !formData.mainImageUrl && imagesBase64.length === 1
            ? []
            : imagesBase64.map((base64) => ({ imageBase64: base64, url: '', id: 0, avisoId: formData.id })),
        celular: formData.celular,
        likes: 0,
        precio: formData.precio !== '' ? Number(formData.precio) : null,
        precio_uf: formData.precio !== '' && ufValue
          ? parseFloat((Number(formData.precio) / ufValue).toFixed(2))
          : null,
        metros_cuadrados: formData.metros_cuadrados !== '' ? Number(formData.metros_cuadrados) : null
      };

      if (isEditing && slug) {
        await api.put(`/api/v1/avisos/${slug}`, dto);
        navigate('/mis-avisos');
      } else {
        await api.post('/api/v1/avisos', dto);
        navigate('/');
      }
    } catch (error) {
      console.error('Error al guardar aviso:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const maxSize = 10 * 1024 * 1024;
      const validFiles = Array.from(e.target.files).filter(file => {
        if (file.size > maxSize) {
          alert(`El archivo ${file.name} es muy grande. Máximo 10MB.`);
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: number) => {
    try {
      await api.delete(`/api/v1/avisos/images/${imageId}`);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-14">
      <AppNav
        title={isEditing ? 'Editar aviso' : 'Publicar aviso'}
        backTo={isEditing && slug ? `/avisos/${slug}/gestionar` : '/'}
        isAuthenticated={isAuthenticated}
        onSignOut={() => { localStorage.removeItem('token'); navigate('/signin'); }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Título"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              required
            />

            <FormField
              as="textarea"
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
              required
            />

            <FormField
              label="Celular"
              type="tel"
              name="celular"
              value={formData.celular}
              onChange={handleInputChange}
              placeholder="57912345678"
              maxLength={12}
              required
            />

            <FormField
              label="Precio"
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              placeholder="Ej: 150000"
              min={0}
            />

            <FormField
              label="Precio en UF"
              type="number"
              name="precio_uf"
              value={
                formData.precio !== '' && ufValue
                  ? (Number(formData.precio) / ufValue).toFixed(2)
                  : ''
              }
              onChange={() => {}}
              placeholder="Se calcula automáticamente"
              disabled
            />

            <FormField
              label="Metros cuadrados"
              type="number"
              name="metros_cuadrados"
              value={formData.metros_cuadrados}
              onChange={handleInputChange}
              placeholder="Ej: 120"
              min={0}
            />

            {/* ── Galería de imágenes ──────────────────────── */}
            <div>
              <label className="block text-[11px] font-semibold text-forest-800 mb-2 tracking-widest uppercase">
                Imágenes secundarias
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="grid grid-cols-3 gap-2">

                {/* Imágenes existentes */}
                {existingImages.map((image, index) => (
                  <div key={`existing-${image.id}-${index}`} className="relative h-24 rounded-xl overflow-hidden group border border-stone-200 bg-stone-100">
                    {imageSrc(image) ? (
                      <img
                        src={imageSrc(image)}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = 'none';
                          el.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={imageSrc(image) ? 'hidden w-full h-full' : 'w-full h-full'}>
                      <Placeholder />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.id)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Eliminar imagen"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Nuevas imágenes (pendientes de guardar) */}
                {selectedFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative h-24 rounded-xl overflow-hidden group border-2 border-dashed border-forest-400 bg-forest-50">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Nueva ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                    <span className="absolute bottom-1 left-1 bg-forest-800/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full pointer-events-none">
                      Nueva
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Quitar imagen"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Tile agregar */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-24 rounded-xl border-2 border-dashed border-stone-200 hover:border-forest-500 hover:bg-forest-50 flex flex-col items-center justify-center gap-1.5 text-stone-400 hover:text-forest-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-medium">Agregar</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate(isEditing && slug ? `/avisos/${slug}/gestionar` : '/')}
                className="px-5 py-2.5 text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-sm font-medium"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-white rounded-xl transition-colors text-sm font-semibold ${
                  isSubmitting ? 'bg-stone-400 cursor-not-allowed' : 'bg-forest-900 hover:bg-forest-800'
                }`}
              >
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

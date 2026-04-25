import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';
import { ImagesAvisoDto } from './dto/AvisoDto.js';
import SimpleHeader from './components/ui/SimpleHeader.js';
import FormField from './components/ui/FormField.js';

export default function EditarAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    celular: '',
    slug: '',
    id: 0,
    mainImageUrl: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImagesAvisoDto[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
            mainImageUrl: aviso.image_url || ''
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
        likes: 0
      };

      if (isEditing && slug) {
        await api.put(`/api/v1/avisos/${slug}`, dto);
      } else {
        await api.post('/api/v1/avisos', dto);
      }

      navigate('/');
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
      const maxSize = 5 * 1024 * 1024;
      const validFiles = Array.from(e.target.files).filter(file => {
        if (file.size > maxSize) {
          alert(`El archivo ${file.name} es muy grande. Máximo 5MB.`);
          return false;
        }
        return true;
      });
      setSelectedFiles(validFiles);
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

  const removeMainImage = () => {
    setMainImageUrl('');
    setFormData({ ...formData, mainImageUrl: '' });
  };

  return (
    <div className="min-h-screen bg-green-50 pt-20">
      <SimpleHeader title={isEditing ? 'Editar Aviso' : 'Crear Nuevo Aviso'} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
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

            <div>
              <label className="block text-gray-600 mb-1">Subir imágenes</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {(existingImages.length > 0 || selectedFiles.length > 0 || (isEditing && mainImageUrl)) && (
                <>
                  <div className="mt-2 flex gap-2 overflow-x-auto py-4 pl-3">
                    {isEditing && mainImageUrl && (
                      <div className="relative flex-shrink-0">
                        <img src={mainImageUrl} alt="Main image" className="w-16 h-16 object-cover rounded border" />
                        <div className="absolute -top-1 -left-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">★</div>
                        <button type="button" onClick={removeMainImage} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                      </div>
                    )}
                    {existingImages.map((image, index) => (
                      <div key={`existing-${image.id}`} className="relative flex-shrink-0">
                        <img src={image.url || image.imageBase64} alt={`Existing ${index + 1}`} className="w-16 h-16 object-cover rounded border" />
                        <button type="button" onClick={() => removeExistingImage(image.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                      </div>
                    ))}
                    {selectedFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative flex-shrink-0">
                        <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover rounded border" />
                        <button type="button" onClick={() => removeFile(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">{file.name}</p>
                          <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded-xl transition-colors ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
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

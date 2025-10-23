import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';


export default function EditarAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imageBase64: '',
    celular: '',
    slug: '',
    id: 0
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (slug) {
      setIsEditing(true);
      // Cargar datos del aviso para editar
      api.get(`/api/v1/avisos/slug/${slug}`)
        .then(res => {
          const aviso = res.data;
          setFormData({
            titulo: aviso.titulo,
            descripcion: aviso.descripcion,
            imageBase64: '',
            celular: aviso.celular,
            slug: aviso.slug || '',
            id: aviso.id || 0
          });
        })
        .catch(err => console.error('Error al cargar aviso:', err));
    }
  }, [slug]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imagesBase64: string[] = [];
      if (selectedFiles.length > 0) {
        imagesBase64 = await Promise.all(selectedFiles.map(file => convertToBase64(file)));
      }
      
      const dto = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        imageBase64: imagesBase64.length > 0 ? imagesBase64[0] : '',
        imagesAvisoList: imagesBase64.map((base64) => ({
          imageBase64: base64,
          url: '',
          id: 0,
          avisoId: formData.id || 0
        })),
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
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-green-50 pt-20">
      <header className="fixed top-0 left-0 right-0 bg-green-600 text-white py-4 shadow-md z-40">
        <div className="container mx-auto px-4 flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="hover:bg-green-700 p-2 rounded transition-colors md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl md:mx-auto">{isEditing ? 'Editar Aviso' : 'Crear Nuevo Aviso'}</h1>

        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Título</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                required
              />
            </div>
            

            <div>
              <label className="block text-gray-700 mb-1">Celular</label>
              <input
                type="tel"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                placeholder="57912345678"
                maxLength={12}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Subir imágenes</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
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
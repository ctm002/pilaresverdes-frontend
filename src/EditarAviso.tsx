import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';


export default function EditarAviso() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imageBase64: '',
    celular: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      // Cargar datos del aviso para editar
      api.get(`/api/v1/avisos/${id}`)
        .then(res => {
          const aviso = res.data;
          setFormData({
            titulo: aviso.titulo,
            descripcion: aviso.descripcion,
            imageBase64: '',
            celular: aviso.celular
          });
        })
        .catch(err => console.error('Error al cargar aviso:', err));
    }
  }, [id]);

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
      let imageBase64 = '';
      if (selectedFile) {
        imageBase64 = await convertToBase64(selectedFile);
      }
      
      const dto = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        imageBase64: imageBase64,
        celular: formData.celular,
        likes: 0
      };
      
      if (isEditing && id) {
        await api.put(`/api/v1/avisos/${id}`, dto);
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
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 pt-20">
      <header className="fixed top-0 left-0 right-0 bg-green-600 text-white py-4 shadow-md z-40">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">Pilares Verdes</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors"
          >
            Volver
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Aviso' : 'Crear Nuevo Aviso'}</h2>
          
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
              <label className="block text-gray-700 mb-1">Subir imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {selectedFile && (
                <div className="flex items-center justify-between mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Archivo seleccionado: {selectedFile.name}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                  >
                    ✕ Eliminar
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
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
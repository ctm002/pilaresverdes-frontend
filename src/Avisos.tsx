import api from "./api/axios.js";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
//import defaultImage from "./assets/no_image_available.svg";

interface Aviso {
  id: number;
  titulo: string;
  descripcion: string;
  image_url: string;
  celular: string;
}

export default function Avisos() {
  const [data, setData] = useState<Aviso[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imageBase64: '',
    celular: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuth();
    api.get("/api/v1/avisos") // Esto va a incluir automáticamente el JWT
      .then((res: AxiosResponse<Aviso[]>) => setData(res.data))
      .catch((err: unknown) => {
        console.error("Error al llamar servicio protegido:", err);
        // Podés redirigir a login si querés acá
      });
  }, []);

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
        celular: formData.celular
      };
      
      if (editingId) {
        await api.put(`/api/v1/avisos/${editingId}`, dto, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        await api.post('/api/v1/avisos', dto, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      setShowForm(false);
      setFormData({ titulo: '', descripcion: '', imageBase64: '', celular: '' });
      setSelectedFile(null);
      setEditingId(null);
      // Recargar datos
      const res = await api.get('/api/v1/avisos');
      setData(res.data);
    } catch (error) {
      console.error('Error al crear/actualizar aviso:', error);
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

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este aviso?')) {
      try {
        await api.delete(`/api/v1/avisos/${id}`);
        const res = await api.get('/api/v1/avisos');
        setData(res.data);
      } catch (error) {
        console.error('Error al eliminar aviso:', error);
      }
    }
  };

  const handleEdit = (item: Aviso) => {
    setFormData({
      titulo: item.titulo,
      descripcion: item.descripcion,
      imageBase64: '',
      celular: item.celular
    });
    setEditingId(item.id);
    setShowForm(true);
  };

    if (!data || data.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No hay elementos para mostrar.
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 bg-green-600 text-white py-4 shadow-md z-40">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className={`text-xl md:text-2xl font-bold ${showSearch ? 'hidden md:block' : ''}`}>Pilares Verdes</h1>
            </div>
            

            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {(showSearch || searchTerm) && (
                <input
                  type="text"
                  placeholder="Buscar avisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setShowSearch(false);
                    }
                  }}
                  className="px-3 py-2 rounded text-green-800 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
                  autoFocus
                />
              )}
              <button
                onClick={() => {
                  if (showSearch || searchTerm) {
                    setShowSearch(false);
                    setSearchTerm('');
                  } else {
                    setShowSearch(true);
                  }
                }}
                className={`p-2 rounded transition-colors ${
                  showSearch || searchTerm 
                    ? 'bg-green-800 hover:bg-green-900' 
                    : 'hover:bg-green-700'
                }`}
              >
                {showSearch || searchTerm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => setShowForm(true)}
                    className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors flex items-center gap-2"
                  >
                    <span>+</span>
                    Publicar Aviso
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      setIsAuthenticated(false);
                    }}
                    className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => window.location.href = '/signin'}
                  className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            {!showSearch && (
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden bg-green-700 px-4 py-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => {
                      setShowForm(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-green-800 transition-colors flex items-center gap-2"
                  >
                    <span>+</span>
                    Publicar Aviso
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      setIsAuthenticated(false);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-green-800 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    window.location.href = '/signin';
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded hover:bg-green-800 transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          )}
        </header>
        <div className={`p-4 bg-green-50 flex-grow pt-20 transition-all duration-300 ${showSearch ? 'blur-sm' : ''}`}>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Avisos</h2>
          </div>

          {(() => {
            const filteredData = data.filter(item => 
              item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filteredData.length === 0 && searchTerm) {
              return (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg">No se encontraron resultados para "{searchTerm}"</p>
                  <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
                </div>
              );
            }
            
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-0">
                {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow px-6 py-4 relative">
              {isAuthenticated && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex justify-center items-center pt-8">
                <img
                  src={item.image_url}
                  alt={item.titulo}
                  className="object-cover max-h-48 min-h-48 w-full rounded"
                />
              </div>
              <div className="py-4">
                <h3 className="text-lg font-semibold">{item.titulo}</h3>
                <p className="text-gray-600">{item.descripcion}</p>
                <a
                  href={`https://wa.me/${item.celular}?text=Hola, me interesa tu aviso: ${item.titulo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
                ))}
              </div>
            );
          })()}
        </div>
        
        {/* Modal para agregar aviso */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Aviso' : 'Agregar Nuevo Aviso'}</h3>
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
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ titulo: '', descripcion: '', imageBase64: '', celular: '' });
                    }}
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
                    {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <footer className="bg-green-800 text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Pilares Verdes. Todos los derechos reservados.</p>
            <p className="text-green-200 text-sm mt-1">v1.0.0 - {import.meta.env.VITE_BUILD_HASH || 'dev'}</p>
          </div>
        </footer>
        


        {/* Floating Search Button - Mobile only */}
        <button
          onClick={() => {
            if (showSearch || searchTerm) {
              setShowSearch(false);
              setSearchTerm('');
            } else {
              setShowSearch(true);
              setShowMobileMenu(false);
            }
          }}
          className={`fixed text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 md:hidden ${
            showSearch || searchTerm
              ? 'top-1/2 right-6 transform -translate-y-1/2 bg-green-800 hover:bg-green-900' 
              : 'bottom-6 right-6 bg-green-600 hover:bg-green-700'
          }`}
        >
          {showSearch || searchTerm ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
        
        {/* Floating Search Input - Mobile only */}
        {showSearch && (
          <div className="fixed top-20 left-4 right-4 z-50 md:hidden">
            <input
              type="text"
              placeholder="Buscar avisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSearch(false);
                }
              }}
              className="w-full px-4 py-3 rounded-lg text-green-800 bg-white placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
          </div>
        )}
      </div>
    );
}
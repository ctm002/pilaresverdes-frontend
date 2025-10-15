import api from "./api/axios.js";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
//import defaultImage from "./assets/no_image_available.svg";

interface Aviso {
  id: number;
  titulo: string;
  descripcion: string;
  image_url: string;
}

export default function Home() {
  const [data, setData] = useState<Aviso[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    api.get("/api/v1/avisos") // Esto va a incluir automáticamente el JWT
      .then((res: AxiosResponse<Aviso[]>) => setData(res.data))
      .catch((err: unknown) => {
        console.error("Error al llamar servicio protegido:", err);
        // Podés redirigir a login si querés acá
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      
      await api.post('/api/v1/avisos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowForm(false);
      setFormData({ titulo: '', descripcion: '', image_url: '' });
      setSelectedFile(null);
      // Recargar datos
      const res = await api.get('/api/v1/avisos');
      setData(res.data);
    } catch (error) {
      console.error('Error al crear aviso:', error);
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

    if (!data || data.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No hay elementos para mostrar.
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-green-600 text-white py-4 shadow-md">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Pilares Verdes</h1>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/signin';
              }}
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>
        <div className="p-6 bg-green-50 flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Avisos</h2>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Agregar Aviso
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex justify-center items-center pt-12">
                <img
                  src={item.image_url}
                  alt={item.titulo}
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.titulo}</h3>
                <p className="text-gray-600">{item.descripcion}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
        
        {/* Modal para agregar aviso */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Agregar Nuevo Aviso</h3>
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
                  <label className="block text-gray-700 mb-1">Imagen</label>
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
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Guardar
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
      </div>
    );
}
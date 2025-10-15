import api from "./api/axios.js";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import defaultImage from "./assets/no_image_available.svg";

interface Aviso {
  id: number;
  titulo: string;
  descripcion: string;
  image_url: string;
}

export default function Home() {
  const [data, setData] = useState<Aviso[] | null>(null);

  useEffect(() => {
    api.get("/api/v1/avisos") // Esto va a incluir automáticamente el JWT
      .then((res: AxiosResponse<Aviso[]>) => setData(res.data))
      .catch((err: unknown) => {
        console.error("Error al llamar servicio protegido:", err);
        // Podés redirigir a login si querés acá
      });
  }, []);

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
              onClick={() => alert('Funcionalidad para agregar aviso')}
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
        <footer className="bg-green-800 text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Pilares Verdes. Todos los derechos reservados.</p>
            <p className="text-green-200 text-sm mt-1">v1.0.0 - {import.meta.env.VITE_BUILD_HASH || 'dev'}</p>
          </div>
        </footer>
      </div>
    );
}
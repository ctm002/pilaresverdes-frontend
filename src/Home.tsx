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
      <div className="p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Avisos</h2>

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
    );
}
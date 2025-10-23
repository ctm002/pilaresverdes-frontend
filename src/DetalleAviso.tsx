import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api/axios.js';

interface Aviso {
  id: number;
  titulo: string;
  descripcion: string;
  image_url: string;
  celular: string;
  likes: number;
  slug: string;
  imagesAvisoList?: ImagesAvisoDto[];
}

interface ImagesAvisoDto {
  imageBase64: string;
  url: string;
  id: number;
  avisoId: number;
}

export default function DetalleAviso() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [likes, setLikes] = useState<{[key: number]: boolean}>({});
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (slug) {
      api.get(`/api/v1/avisos/slug/${slug}`)
        .then(res => setAviso(res.data))
        .catch(err => console.error('Error al cargar aviso:', err));
    }

    // Cargar likes desde localStorage
    const savedLikes = localStorage.getItem('avisoLikes');
    if (savedLikes) {
      setLikes(JSON.parse(savedLikes));
    }
  }, [slug]);

  const handleLike = (avisoId: number) => {
    const newLikes = { ...likes, [avisoId]: !likes[avisoId] };
    setLikes(newLikes);
    localStorage.setItem('avisoLikes', JSON.stringify(newLikes));
  };

  const handleLikeCount = async (avisoId: number) => {
    try {
      await api.patch(`/api/v1/avisos/${avisoId}/like`);
      // Recargar datos para obtener el contador actualizado
      const res = await api.get(`/api/v1/avisos/slug/${aviso?.slug}`);
      setAviso(res.data);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  if (!aviso) {
    return (
      <div className="min-h-screen bg-green-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 md:pt-8 pt-20">
      <header className="fixed top-0 left-0 right-0 bg-green-600 text-white py-4 shadow-md z-40">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="hover:bg-green-700 p-2 rounded transition-colors md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl md:mx-auto">Detalle Aviso</h1>

        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4">
            {(() => {
              const images = aviso.imagesAvisoList && aviso.imagesAvisoList.length > 0 
                ? aviso.imagesAvisoList 
                : [{ url: aviso.image_url, id: 0, imageBase64: '', avisoId: aviso.id }];
              
              return (
                <>
                  <img
                    src={images[selectedImage]?.url || aviso.image_url}
                    alt={aviso.titulo}
                    className="w-full h-80 object-cover rounded-lg mb-4"
                  />
                  
                  {images.length > 1 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pt-2 pb-2 pl-2">
                      {images.map((image, index) => (
                        <img
                          key={image.id || index}
                          src={image.url}
                          alt={`${aviso.titulo} - vista ${index + 1}`}
                          className={`w-16 h-16 object-cover rounded cursor-pointer transition-all ${
                            selectedImage === index ? 'ring-2 ring-green-500 opacity-100' : 'opacity-70 hover:opacity-100'
                          }`}
                          onClick={() => setSelectedImage(index)}
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
            
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">{aviso.titulo}</h1>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">{aviso.descripcion}</p>
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleLikeCount(aviso.id)}
                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"/>
                </svg>
                <span className="text-sm">{aviso.likes || 0}</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLike(aviso.id)}
                  className={`inline-flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                    likes[aviso.id] 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                </button>
                <a
                  href={`https://wa.me/${aviso.celular}?text=Hola, me interesa tu aviso: ${aviso.titulo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto mt-4 hidden md:block">
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
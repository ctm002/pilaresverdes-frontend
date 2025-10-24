import api from "./api/axios.js";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
//import defaultImage from "./assets/no_image_available.svg";

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

export default function Avisos() {
  const navigate = useNavigate();
  const [data, setData] = useState<Aviso[] | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastAccess, setLastAccess] = useState<string>('');
  const [likes, setLikes] = useState<{[key: number]: boolean}>({});

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  const loadData = () => {
    api.get("/api/v1/avisos")
      .then((res: AxiosResponse<Aviso[]>) => setData(res.data))
      .catch((err: unknown) => {
        console.error("Error al llamar servicio protegido:", err);
      });
  };

  useEffect(() => {
    checkAuth();
    
    // Recuperar último acceso
    const savedLastAccess = localStorage.getItem('lastAccess');
    if (savedLastAccess) {
      setLastAccess(savedLastAccess);
    }
    
    // Guardar acceso actual
    const currentAccess = new Date().toLocaleString('es-ES');
    localStorage.setItem('lastAccess', currentAccess);
    
    // Cargar likes desde localStorage
    const savedLikes = localStorage.getItem('avisoLikes');
    if (savedLikes) {
      setLikes(JSON.parse(savedLikes));
    }
    
    loadData();
  }, []);

  // Recargar datos cuando se regrese a la página
  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);



  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este aviso?')) {
      try {
        await api.delete(`/api/v1/avisos/${id}`);
        loadData();
      } catch (error) {
        console.error('Error al eliminar aviso:', error);
      }
    }
  };

  const handleEdit = (item: Aviso) => {
    navigate(`/aviso/${item.slug}/editar`);
  };

  const handleLike = (id: number) => {
    const newLikes = { ...likes, [id]: !likes[id] };
    setLikes(newLikes);
    localStorage.setItem('avisoLikes', JSON.stringify(newLikes));
  };

  const handleLikeCount = async (id: number) => {
    try {
      await api.patch(`/api/v1/avisos/${id}/like`);
      loadData();
    } catch (error) {
      console.error('Error al dar like:', error);
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
        <header className="fixed top-0 left-0 right-0 bg-green-600 text-white py-4 shadow-md z-40">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <h1 className={`text-xl md:text-2xl ${showSearch ? 'hidden md:block' : ''}`}>Avisos</h1>
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
                    onClick={() => navigate('/crear')}
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
                      navigate('/crear');
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

          {(() => {
            const filteredData = data.filter(item => 
              item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            ).sort((a, b) => {
              const aIsFavorite = likes[a.id] || false;
              const bIsFavorite = likes[b.id] || false;
              if (aIsFavorite && !bIsFavorite) return -1;
              if (!aIsFavorite && bIsFavorite) return 1;
              return 0;
            });
            
            if (filteredData.length === 0 && searchTerm) {
              return (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg">No se encontraron resultados para "{searchTerm}"</p>
                  <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
                </div>
              );
            }
            
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 px-0">
                {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 py-4 relative h-96 flex flex-col">
              <div id="1" className={`absolute top-2 right-2 flex gap-1 z-10 ${!isAuthenticated ? 'hidden' : ''}`}>
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-gray-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-gray-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              <div id="2" className={`flex justify-center items-center relative ${isAuthenticated ? 'pt-8' : 'pt-2'}`}>
                {item.imagesAvisoList && item.imagesAvisoList.length > 0 ? (
                  <div className="relative w-full cursor-pointer" onClick={() => navigate(`/aviso/${item.slug}/ver`)}>
                    <img
                      src={item.imagesAvisoList[0].url || item.image_url}
                      alt={item.titulo}
                      className="object-cover h-48 w-full rounded"
                    />
                    {item.imagesAvisoList.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        +{item.imagesAvisoList.length - 1} más
                      </div>
                    )}
                  </div>
                ) : (
                  <img
                    src={item.image_url}
                    alt={item.titulo}
                    className="object-cover h-48 w-full rounded cursor-pointer"
                    onClick={() => navigate(`/aviso/${item.slug}/ver`)}
                  />
                )}
              </div>
              
              <div id="3" className="py-4 flex flex-col flex-grow h-24">
                <div className="py-2 flex-grow">
                  <h3 className="text-lg font-semibold truncate">{item.titulo}</h3>
                  <p className="text-gray-600 text-sm overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{item.descripcion}</p>
                </div>

              </div>

              <div id="4" className="flex justify-between mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeCount(item.id);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"/>
                    </svg>
                    <span className="text-sm">{item.likes || 0}</span>
                  </button>
                  <div className="inline-flex gap-2">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(item.id);
                    }}
                    className={`inline-flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                      likes[item.id] 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                  </button>
                  <a
                    href={`https://wa.me/${item.celular}?text=Hola, me interesa tu aviso: ${item.titulo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </a>
                  </div>
              </div>

            </div>
                ))}
              </div>
            );
          })()}
        </div>
        

        
        <footer className="bg-green-800 text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Pilares Verdes. Todos los derechos reservados.</p>
            <p className="text-green-200 text-sm mt-1">v1.0.0 - {import.meta.env.VITE_BUILD_HASH || 'dev'}</p>
            {lastAccess && (
              <p className="text-green-200 text-xs mt-1">Último acceso: {lastAccess}</p>
            )}
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
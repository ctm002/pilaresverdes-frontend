import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser.js';

interface AppNavProps {
  /** Título de la página — aparece en mobile centrado */
  title?: string;
  /** Ruta del botón volver (mobile) */
  backTo?: string;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

const LeafIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 5.5-8 5.5L12 6l-3.5 3.5C11 9 15 9.5 17 8z"/>
  </svg>
);

const NAV_LINKS = [
  { label: 'Inicio',        href: '/' },
  { label: 'Mis avisos',    href: '/mis-avisos' },
  { label: 'Mis favoritos', href: '/mis-favoritos' },
  { label: 'Comparador',      href: '/comparador' },
];

export default function AppNav({ title, backTo, isAuthenticated, onSignOut }: AppNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const username = useCurrentUser();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname === '/avisos' : pathname.startsWith(href);

  const handleBack = () => navigate(backTo ?? '/');

  return (
    <header className="fixed top-0 left-0 right-0 bg-forest-900 text-white shadow-lg z-40">
      <div className="container mx-auto px-4 h-14 flex items-center gap-3">

        {/* Botón volver — mobile, solo si backTo está definido */}
        {backTo && (
          <button
            onClick={handleBack}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="Volver"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
            <LeafIcon />
          </div>
          <span className={`font-display font-semibold text-base tracking-tight ${title ? 'hidden md:block' : ''}`}>
            Pilares Verdes
          </span>
        </button>

        {/* Título de página — mobile */}
        {title && (
          <span className="md:hidden font-display font-semibold text-base truncate flex-1 text-center">
            {title}
          </span>
        )}

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_LINKS.map(link => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Acciones — desktop */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/crear')}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-white/50 hover:border-white"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Publicar aviso
              </button>
              {username && (
                <span className="flex items-center gap-1.5 text-white/80 text-sm px-1">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold uppercase">
                    {username[0]}
                  </span>
                  {username}
                </span>
              )}
              <button
                onClick={onSignOut}
                className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-white/50 hover:border-white"
            >
              Iniciar sesión
            </button>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden ml-auto p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Dropdown mobile */}
      {menuOpen && (
        <div className="md:hidden bg-forest-800 border-t border-white/10 px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => (
            <button
              key={link.href}
              onClick={() => { navigate(link.href); setMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="border-t border-white/10 pt-2 mt-2">
            {isAuthenticated ? (
              <>
                {username && (
                  <div className="flex items-center gap-2 px-3 py-2 mb-1">
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                      {username[0]}
                    </span>
                    <span className="text-sm text-white/90 font-medium truncate">{username}</span>
                  </div>
                )}
                <button
                  onClick={() => { navigate('/crear'); setMenuOpen(false); }}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <span>+</span> Publicar aviso
                </button>
                <button
                  onClick={() => { onSignOut?.(); setMenuOpen(false); }}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => { navigate('/signin'); setMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

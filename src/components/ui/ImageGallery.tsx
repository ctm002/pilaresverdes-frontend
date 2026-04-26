import { useState, useEffect, useCallback } from 'react';

interface GalleryImage {
  url: string;
  id: number;
  imageBase64: string;
  avisoId: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [lightbox, setLightbox] = useState(false);
  const total = images.length;

  const goTo = useCallback((index: number) => {
    setFade(false);
    setTimeout(() => {
      setCurrent(((index % total) + total) % total);
      setFade(true);
    }, 130);
  }, [total]);

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  /* Keyboard nav in lightbox */
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'Escape')     setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, current, goTo]);

  /* Lock body scroll when lightbox is open */
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  const src = (img: GalleryImage) => img.url || img.imageBase64;
  const currentSrc = src(images[current]);

  return (
    <>
      {/* ── Main viewer ─────────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden mb-3 group select-none">
        <img
          src={currentSrc}
          alt={`${title} — foto ${current + 1}`}
          className={`w-full h-80 object-cover cursor-zoom-in transition-opacity duration-150 ${fade ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setLightbox(true)}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Counter badge */}
        {total > 1 && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full pointer-events-none">
            {current + 1} / {total}
          </span>
        )}

        {/* Expand hint */}
        <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white p-2 rounded-full opacity-60 group-hover:opacity-100 transition-all"
              aria-label="Foto anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white p-2 rounded-full opacity-60 group-hover:opacity-100 transition-all"
              aria-label="Foto siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ──────────────────────────────── */}
      {total > 1 && (
        <div className="flex gap-3 my-4 overflow-x-auto px-1 py-2" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => goTo(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg transition-all ${
                current === i
                  ? 'ring-2 ring-forest-700 ring-offset-4 opacity-100'
                  : 'opacity-50 hover:opacity-90'
              }`}
              aria-label={`Ver foto ${i + 1}`}
            >
              <img src={src(img)} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 pointer-events-none">
            <span className="font-display text-white/50 text-sm truncate max-w-xs">{title}</span>
            <div className="flex items-center gap-3 pointer-events-auto">
              {total > 1 && (
                <span className="text-white/50 text-sm">{current + 1} / {total}</span>
              )}
              <button
                onClick={() => setLightbox(false)}
                className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main image */}
          <img
            src={currentSrc}
            alt={`${title} — foto ${current + 1}`}
            className={`max-w-[90vw] max-h-[78vh] object-contain rounded-lg transition-opacity duration-130 ${fade ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                aria-label="Foto anterior"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                aria-label="Foto siguiente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {total > 1 && (
            <div
              className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw]"
              style={{ scrollbarWidth: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.id || i}
                  onClick={() => goTo(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all ${
                    current === i
                      ? 'ring-2 ring-white opacity-100 scale-110'
                      : 'opacity-35 hover:opacity-65'
                  }`}
                  aria-label={`Ver foto ${i + 1}`}
                >
                  <img src={src(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

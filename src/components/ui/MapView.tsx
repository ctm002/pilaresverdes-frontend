interface MapViewProps {
  latitud?: number;
  longitud?: number;
  ubicacion?: string;
}

export default function MapView({ latitud, longitud, ubicacion }: MapViewProps) {
  const hasCoords = latitud != null && longitud != null;
  const hasLocation = hasCoords || !!ubicacion;

  if (!hasLocation) return null;

  const osmSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitud - 0.009},${latitud - 0.007},${longitud + 0.009},${latitud + 0.007}&layer=mapnik&marker=${latitud},${longitud}`
    : null;

  const mapsHref = hasCoords
    ? `https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=16/${latitud}/${longitud}`
    : `https://www.google.com/maps/search/${encodeURIComponent(ubicacion ?? '')}`;

  return (
    <div className="mt-6 pt-6 border-t border-stone-100">
      <h2 className="font-display text-lg font-semibold text-forest-950 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-forest-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        Ubicación
      </h2>

      {hasCoords ? (
        /* ── OSM iframe embed ───────────────────────────── */
        <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm">
          <iframe
            src={osmSrc!}
            className="w-full h-64 border-0 block"
            loading="lazy"
            title="Ubicación del aviso"
          />
        </div>
      ) : (
        /* ── No coords — styled placeholder ──────────────── */
        <div className="rounded-xl border border-stone-200 bg-stone-50 h-48 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-forest-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <p className="text-stone-500 text-sm text-center px-6">{ubicacion}</p>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-2.5">
        {/* {ubicacion && (
          <p className="text-stone-500 text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {ubicacion}
          </p>
        )} */}
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-forest-700 hover:text-forest-900 text-xs font-medium flex items-center gap-1 transition-colors ml-auto"
        >
          Abrir en mapa
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

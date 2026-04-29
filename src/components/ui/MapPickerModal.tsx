import { useEffect, useRef } from 'react';

interface MapPickerModalProps {
  latitud?: number;
  longitud?: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapPickerModal({ latitud, longitud, onConfirm, onClose }: MapPickerModalProps) {
  const confirmed = useRef(false);

  const initialLat = latitud ?? -33.4489;
  const initialLng = longitud ?? -70.6693;
  const hasMarker = latitud != null && longitud != null;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html,body,#map { margin:0; padding:0; height:100%; width:100%; }
    .info-bar { position:absolute; top:10px; left:50%; transform:translateX(-50%); z-index:1000;
      background:white; padding:6px 14px; border-radius:20px; font-size:12px;
      font-family:sans-serif; box-shadow:0 2px 8px rgba(0,0,0,.15); white-space:nowrap; pointer-events:none; }
  </style>
</head>
<body>
  <div class="info-bar">Haz clic en el mapa para seleccionar la ubicación</div>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${initialLat}, ${initialLng}], ${hasMarker ? 15 : 12});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var marker = ${hasMarker
      ? `L.marker([${initialLat}, ${initialLng}]).addTo(map);`
      : 'null;'
    }

    map.on('click', function(e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      if (marker) { map.removeLayer(marker); }
      marker = L.marker([lat, lng]).addTo(map);
      window.parent.postMessage({ type: 'map-pick', lat: lat, lng: lng }, '*');
    });
  </script>
</body>
</html>`;

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'map-pick') {
        confirmed.current = true;
        onConfirm(e.data.lat, e.data.lng);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
          <h3 className="font-display font-semibold text-forest-950">Seleccionar ubicación</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <iframe
          srcDoc={html}
          className="w-full border-0"
          style={{ height: '420px' }}
          title="Seleccionar ubicación"
        />
        <div className="px-5 py-3 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-forest-900 hover:bg-forest-800 text-white rounded-xl transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

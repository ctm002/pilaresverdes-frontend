interface Marker {
  lat: number;
  lng: number;
  label: string;
}

interface MultiMarkerMapProps {
  markers: Marker[];
  fullHeight?: boolean;
}

export default function MultiMarkerMap({ markers, fullHeight = false }: MultiMarkerMapProps) {
  const valid = markers.filter(m => m.lat != null && m.lng != null);
  if (valid.length === 0) return null;

  const markersJson = JSON.stringify(valid);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    const markers = ${markersJson};
    const map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    const group = L.featureGroup();
    markers.forEach(function(m, i) {
      const marker = L.marker([m.lat, m.lng])
        .bindPopup('<b>' + (i + 1) + '.</b> ' + m.label);
      marker.addTo(group);
    });
    group.addTo(map);
    map.fitBounds(group.getBounds().pad(0.3));
  </script>
</body>
</html>`;

  return (
    <div className="mt-6 pt-6 border-t border-stone-100">
      <h2 className="font-display text-lg font-semibold text-forest-950 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-forest-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        Ubicaciones
      </h2>
      <div className={fullHeight ? '' : 'rounded-xl overflow-hidden border border-stone-200 shadow-sm'}>
        <iframe
          srcDoc={html}
          className={`w-full border-0 block ${fullHeight ? 'h-[calc(100vh-260px)] min-h-[400px]' : 'h-72'}`}
          title="Mapa comparador"
        />
      </div>
    </div>
  );
}

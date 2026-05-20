import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { API_BASE, getToken } from '../services/api';

// Webpack-friendly icon shim — default leaflet markers reference asset URLs
// that webpack doesn't resolve. Inline-encode CDN PNGs.
const HIVE_ICON = new L.Icon({
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

export default function ApiaryMap() {
  const [apiaries, setApiaries] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/apiary-locations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setApiaries(Array.isArray(data?.apiaries) ? data.apiaries : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#94a3b8' }}>Loading apiary locations…</div>;
  if (error)   return <div style={{ padding: 16, color: '#f87171' }}>Error: {error}</div>;
  if (apiaries.length === 0) return <div style={{ padding: 16, color: '#94a3b8' }}>No georeferenced apiaries.</div>;

  // center on USA agricultural midpoint
  const center = [39.5, -98.35];

  return (
    <div
      style={{
        height: 460,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #1e293b',
      }}
    >
      <MapContainer
        center={center}
        zoom={4}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {apiaries.map((a) => (
          <Marker key={a.apiary_id} position={[a.lat, a.lng]} icon={HIVE_ICON}>
            <Tooltip direction="top" offset={[0, -28]} opacity={1}>
              <div style={{ fontSize: 12 }}>
                <strong>{a.apiary_id}</strong> — {a.name}
                <br />
                Hives: <strong>{a.active_hive_count || a.declared_hive_count}</strong>
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontSize: 13, minWidth: 180 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {a.name} <span style={{ color: '#64748b' }}>({a.apiary_id})</span>
                </div>
                <div style={{ color: '#475569' }}>{a.location}</div>
                <div style={{ marginTop: 6 }}>Owner: {a.owner || '—'}</div>
                <div>Status: {a.status}</div>
                <div style={{ marginTop: 4 }}>
                  Hives on record:{' '}
                  <strong>{a.active_hive_count || a.declared_hive_count}</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { API_BASE, getToken } from '../services/api';

// SVG-encoded marker icons. Inlining as data URIs keeps the component
// self-contained without adding a CDN dependency.

const BEE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
  <path d="M16 0 C7 0 0 7 0 16 c0 12 16 24 16 24 s16 -12 16 -24 C32 7 25 0 16 0 z"
        fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
  <circle cx="16" cy="14" r="7" fill="#fef3c7"/>
  <rect x="10"  y="11" width="12" height="2" fill="#000"/>
  <rect x="10"  y="15" width="12" height="2" fill="#000"/>
  <circle cx="13" cy="14" r="1.4" fill="#000"/>
  <circle cx="19" cy="14" r="1.4" fill="#000"/>
</svg>`;

const CROP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
  <path d="M16 0 C7 0 0 7 0 16 c0 12 16 24 16 24 s16 -12 16 -24 C32 7 25 0 16 0 z"
        fill="#16a34a" stroke="#14532d" stroke-width="2"/>
  <path d="M16 6 L16 22" stroke="#fef3c7" stroke-width="2"/>
  <path d="M16 11 C12 9 10 12 11 15" stroke="#bbf7d0" stroke-width="2" fill="none"/>
  <path d="M16 15 C20 13 22 16 21 19" stroke="#bbf7d0" stroke-width="2" fill="none"/>
  <circle cx="16" cy="23" r="2.4" fill="#facc15"/>
</svg>`;

function svgToDataUrl(svg) {
  // encodeURIComponent handles the # / < > and other URL-unsafe chars
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

const BEE_ICON = new L.Icon({
  iconUrl:    svgToDataUrl(BEE_SVG),
  iconSize:   [32, 40],
  iconAnchor: [16, 40],
  popupAnchor:[0, -34],
  className:  'pollination-bee-icon',
});

const CROP_ICON = new L.Icon({
  iconUrl:    svgToDataUrl(CROP_SVG),
  iconSize:   [32, 40],
  iconAnchor: [16, 40],
  popupAnchor:[0, -34],
  className:  'pollination-crop-icon',
});

// distinct polyline colour per status
function statusColor(status) {
  const k = (status || '').toLowerCase();
  if (k === 'completed') return '#64748b';
  if (k === 'pending')   return '#f59e0b';
  return '#fbbf24';
}

export default function PollinationRouteMap() {
  const [apiaries, setApiaries]   = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/pollination-routes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setApiaries(Array.isArray(d?.apiaries) ? d.apiaries : []);
        setContracts(Array.isArray(d?.contracts) ? d.contracts : []);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#94a3b8' }}>Loading pollination routes…</div>;
  if (error)   return <div style={{ padding: 16, color: '#f87171' }}>Error: {error}</div>;

  const apiaryMap = new Map(apiaries.map((a) => [a.apiary_id, a]));
  const center = [39.5, -98.35];

  const totalHives = contracts.reduce((s, c) => s + (c.hives_committed || 0), 0);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 14,
      }}
    >
      <div
        style={{
          height: 520,
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
            <Marker key={`A-${a.apiary_id}`} position={[a.lat, a.lng]} icon={BEE_ICON}>
              <Tooltip direction="top" offset={[0, -32]}>
                <div style={{ fontSize: 12 }}>
                  <strong>{a.apiary_id}</strong> — {a.name}
                  <br />Hives on site: <strong>{a.hive_count}</strong>
                </div>
              </Tooltip>
              <Popup>
                <div style={{ fontSize: 13, minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>
                    {a.name} <span style={{ color: '#64748b' }}>({a.apiary_id})</span>
                  </div>
                  <div>Active hives: <strong>{a.hive_count}</strong></div>
                </div>
              </Popup>
            </Marker>
          ))}

          {contracts.map((c) => (
            <Marker
              key={`C-${c.contract_id}`}
              position={[c.customer_lat, c.customer_lng]}
              icon={CROP_ICON}
              eventHandlers={{ click: () => setSelected(c.contract_id) }}
            >
              <Tooltip direction="top" offset={[0, -32]}>
                <div style={{ fontSize: 12 }}>
                  <strong>{c.crop}</strong> — {c.customer_name}
                  <br />Contract <strong>{c.contract_id}</strong>
                  <br />Committed hives: <strong>{c.hives_committed}</strong>
                </div>
              </Tooltip>
              <Popup>
                <div style={{ fontSize: 13, minWidth: 200 }}>
                  <div style={{ fontWeight: 700 }}>{c.crop} field</div>
                  <div>{c.customer_name}</div>
                  <div style={{ color: '#475569', marginTop: 4 }}>{c.customer_region}</div>
                  <div style={{ marginTop: 6 }}>
                    Source apiary: <strong>{c.apiary_id}</strong>
                  </div>
                  <div>Hives committed: <strong>{c.hives_committed}</strong></div>
                  <div>Status: {c.status}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {contracts.map((c) => {
            const home = apiaryMap.get(c.apiary_id);
            if (!home) return null;
            const isSelected = selected === c.contract_id;
            return (
              <Polyline
                key={`L-${c.contract_id}`}
                positions={[
                  [home.lat, home.lng],
                  [c.customer_lat, c.customer_lng],
                ]}
                pathOptions={{
                  color:    statusColor(c.status),
                  weight:   isSelected ? 4 : 2,
                  opacity:  isSelected ? 0.95 : 0.7,
                  dashArray: c.status === 'pending' ? '6 4' : null,
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      <aside
        style={{
          background: '#0b1220',
          border: '1px solid #1e293b',
          borderRadius: 12,
          padding: 12,
          maxHeight: 520,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 8 }}>
          <strong style={{ color: '#f1f5f9' }}>Contracts</strong>
          <span style={{ color: '#94a3b8' }}>
            {' '}— {contracts.length} routes · {totalHives} hives committed
          </span>
        </div>
        {contracts.map((c) => {
          const isSelected = selected === c.contract_id;
          return (
            <button
              key={c.contract_id}
              onClick={() => setSelected(c.contract_id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                marginBottom: 6,
                background: isSelected ? '#1e293b' : '#0f172a',
                border: `1px solid ${isSelected ? '#fbbf24' : '#1e293b'}`,
                borderRadius: 8,
                cursor: 'pointer',
                color: '#e2e8f0',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {c.contract_id} · {c.crop}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {c.customer_name}
              </div>
              <div style={{ fontSize: 11, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fbbf24' }}>Hives: {c.hives_committed}</span>
                <span style={{ color: '#94a3b8' }}>{c.apiary_id} → field</span>
              </div>
            </button>
          );
        })}
      </aside>
    </div>
  );
}

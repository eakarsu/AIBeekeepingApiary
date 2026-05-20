import React, { useEffect, useRef, useState } from 'react';
import { API_BASE, getToken } from '../services/api';

// Simulated hive-sound spectrogram. The backend returns a 200x64
// intensity matrix (0..1). We paint it onto an HTML5 canvas with a
// dark-blue → cyan → yellow → red colour ramp. A small selector lets
// the user pick which hive_sounds row to inspect.

function intensityToColor(v) {
  // v is 0..1; piecewise linear ramp through 4 anchors.
  if (v <= 0) return [10, 12, 40];
  const stops = [
    { p: 0.00, c: [10, 12, 60] },     // dark blue
    { p: 0.40, c: [10, 200, 230] },   // cyan
    { p: 0.70, c: [255, 220, 70] },   // yellow
    { p: 1.00, c: [220, 30, 40] },    // red
  ];
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (v >= stops[i].p && v <= stops[i + 1].p) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const t = (v - a.p) / (b.p - a.p || 1);
  return [
    Math.round(a.c[0] + (b.c[0] - a.c[0]) * t),
    Math.round(a.c[1] + (b.c[1] - a.c[1]) * t),
    Math.round(a.c[2] + (b.c[2] - a.c[2]) * t),
  ];
}

function classificationStyle(klass) {
  const map = {
    queen_present: { bg: '#064e3b', fg: '#bbf7d0', label: 'Queen Present' },
    queenless:     { bg: '#7f1d1d', fg: '#fecaca', label: 'Queenless' },
    piping_queen:  { bg: '#713f12', fg: '#fde68a', label: 'Piping Queen' },
    swarm_prep:    { bg: '#5b21b6', fg: '#ddd6fe', label: 'Swarm Prep' },
  };
  return map[klass] || { bg: '#334155', fg: '#e2e8f0', label: klass || 'unknown' };
}

export default function HiveSpectrogramPlayer() {
  const canvasRef = useRef(null);
  const [sounds, setSounds]       = useState([]);
  const [selectedId, setSelected] = useState('');
  const [spec, setSpec]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // load the index of available hive_sounds rows
  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/hive-spectrogram-index`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d?.sounds) ? d.sounds : [];
        setSounds(list);
        if (list.length > 0) setSelected(String(list[0].id));
      })
      .catch((e) => setError(e.message));
  }, []);

  // load spectrogram for the selected sound
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    const token = getToken();
    fetch(`${API_BASE}/custom-views/hive-spectrogram?sound_id=${encodeURIComponent(selectedId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setSpec(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [selectedId]);

  // paint canvas whenever spec changes
  useEffect(() => {
    if (!spec || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const data = spec.data || [];
    if (data.length === 0) { ctx.clearRect(0, 0, W, H); return; }
    const T = data.length;
    const F = data[0].length;
    const cellW = W / T;
    const cellH = H / F;
    // background
    ctx.fillStyle = '#0a0e2a';
    ctx.fillRect(0, 0, W, H);
    // draw each time/freq cell. freq axis is inverted (low Hz at bottom).
    for (let t = 0; t < T; t++) {
      for (let f = 0; f < F; f++) {
        const v = data[t][f] || 0;
        if (v < 0.02) continue;
        const [r, g, b] = intensityToColor(v);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        const x = t * cellW;
        const y = H - (f + 1) * cellH;
        ctx.fillRect(x, y, Math.ceil(cellW), Math.ceil(cellH));
      }
    }
    // axis labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('Frequency (Hz)', 8, 14);
    const freqs = spec.freqs || [];
    if (freqs.length > 0) {
      const ticks = [0, Math.floor(F / 2), F - 1];
      for (const tk of ticks) {
        const hz = freqs[tk];
        const y = H - (tk + 1) * cellH;
        ctx.fillText(`${hz}Hz`, W - 56, Math.max(12, y + 4));
      }
    }
    const times = spec.times || [];
    if (times.length > 0) {
      ctx.fillText(`0.0s`, 8, H - 4);
      ctx.fillText(`${times[Math.floor(T / 2)].toFixed(1)}s`, W / 2 - 12, H - 4);
      ctx.fillText(`${times[T - 1].toFixed(1)}s`, W - 36, H - 4);
    }
  }, [spec]);

  const style = classificationStyle(spec?.classification);

  return (
    <div
      style={{
        background: '#0b1220',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <label style={{ color: '#cbd5e1', fontSize: 13 }}>Hive sound:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 13,
          }}
        >
          {sounds.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sound_id} — {s.hive_id} ({s.classification})
            </option>
          ))}
        </select>
        {spec && (
          <>
            <span
              style={{
                background: style.bg,
                color: style.fg,
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.3,
              }}
            >
              Classification: {style.label}
            </span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>
              Hive {spec.hive_id} · {spec.captured_at ? new Date(spec.captured_at).toLocaleString() : ''}
            </span>
          </>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={300}
          style={{
            width: '100%',
            height: 300,
            display: 'block',
            borderRadius: 8,
            border: '1px solid #1e293b',
            background: '#0a0e2a',
          }}
        />
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: 12,
              background: 'rgba(10,14,42,0.6)',
              borderRadius: 8,
            }}
          >
            Loading spectrogram…
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 8, color: '#f87171', fontSize: 12 }}>Error: {error}</div>
      )}

      {/* color legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <span style={{ color: '#94a3b8', fontSize: 11 }}>low</span>
        <div
          style={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            background:
              'linear-gradient(to right, rgb(10,12,60), rgb(10,200,230), rgb(255,220,70), rgb(220,30,40))',
          }}
        />
        <span style={{ color: '#94a3b8', fontSize: 11 }}>high</span>
      </div>
    </div>
  );
}

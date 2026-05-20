import React, { useEffect, useState } from 'react';
import { API_BASE, getToken } from '../services/api';

function heatColor(val, max) {
  if (!val || !max) return '#0f172a';
  const ratio = Math.min(1, val / max);
  // amber/honey gradient
  const r = Math.round(245 - (245 - 180) * (1 - ratio));
  const g = Math.round(158 - (158 -  83) * (1 - ratio));
  const b = Math.round( 11 - ( 11 -   9) * (1 - ratio));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function HoneyYieldCalendar() {
  const [months, setMonths]     = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [loading, setLoad]      = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/custom-views/honey-yield-calendar`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setMonths(Array.isArray(d?.months) ? d.months : []);
        setApiaries(Array.isArray(d?.apiaries) ? d.apiaries : []);
        setLoad(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoad(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#94a3b8' }}>Loading honey calendar…</div>;
  if (error)   return <div style={{ padding: 16, color: '#f87171' }}>Error: {error}</div>;
  if (!apiaries.length) return <div style={{ padding: 16, color: '#94a3b8' }}>No harvests.</div>;

  const maxVal = Math.max(
    1,
    ...apiaries.flatMap((a) => a.months || [])
  );

  // 1 label column + 12 month columns + 1 total column
  const gridTemplate = `180px repeat(12, minmax(48px, 1fr)) 80px`;

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: 12,
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: 4, minWidth: 720 }}>
        {/* header row */}
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Apiary</div>
        {months.map((m) => (
          <div
            key={m}
            style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textAlign: 'center' }}
          >
            {m}
          </div>
        ))}
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textAlign: 'right' }}>
          Total kg
        </div>

        {/* data rows */}
        {apiaries.map((a) => (
          <React.Fragment key={a.apiary_id}>
            <div
              style={{
                fontSize: 12,
                color: '#cbd5e1',
                padding: '6px 4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={`${a.apiary_id} — ${a.apiary_name}`}
            >
              <strong style={{ color: '#f1f5f9' }}>{a.apiary_id}</strong>{' '}
              <span style={{ color: '#64748b' }}>{a.apiary_name}</span>
            </div>
            {a.months.map((v, i) => (
              <div
                key={i}
                title={`${months[i]}: ${v} kg`}
                style={{
                  background: heatColor(v, maxVal),
                  color: v > maxVal * 0.5 ? '#0f172a' : '#cbd5e1',
                  borderRadius: 4,
                  fontSize: 11,
                  textAlign: 'center',
                  padding: '8px 2px',
                  fontWeight: v > 0 ? 700 : 400,
                  opacity: v > 0 ? 1 : 0.4,
                }}
              >
                {v > 0 ? v : '·'}
              </div>
            ))}
            <div
              style={{
                fontSize: 12,
                color: '#fbbf24',
                textAlign: 'right',
                padding: '6px 4px',
                fontWeight: 700,
              }}
            >
              {a.total}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

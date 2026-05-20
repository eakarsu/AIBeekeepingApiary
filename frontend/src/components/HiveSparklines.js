import React, { useEffect, useState } from 'react';
import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE, getToken } from '../services/api';

function statusColor(status) {
  const s = (status || '').toLowerCase();
  if (s === 'strong')   return '#22c55e';
  if (s === 'moderate') return '#f59e0b';
  if (s === 'weak')     return '#ef4444';
  return '#38bdf8';
}

export default function HiveSparklines() {
  const [hives, setHives]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/custom-views/hive-sparklines`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setHives(Array.isArray(d?.hives) ? d.hives : []);
        setLoad(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoad(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#94a3b8' }}>Loading hive sparklines…</div>;
  if (error)   return <div style={{ padding: 16, color: '#f87171' }}>Error: {error}</div>;
  if (!hives.length) return <div style={{ padding: 16, color: '#94a3b8' }}>No hives.</div>;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12,
      }}
    >
      {hives.map((h) => {
        const color = statusColor(h.status);
        const data = h.series || [];
        const last = data[data.length - 1];
        return (
          <div
            key={h.hive_id}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 6,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{h.hive_id}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{h.apiary_id}</div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
              status: <span style={{ color }}>{h.status || '—'}</span>
              {last && (
                <span style={{ float: 'right' }}>
                  brood {last.score}/10
                </span>
              )}
            </div>
            <div style={{ height: 60 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: 11 }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(v) => [`${v}/10`, 'brood']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 2, fill: color }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

// A 12-color rotation for up to ~15 hives.
const PALETTE = [
  '#38bdf8', '#a78bfa', '#22c55e', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#facc15', '#8b5cf6', '#06b6d4',
  '#84cc16', '#fb7185',
];

export default function VarroaTrend() {
  const [hiveIds, setHiveIds] = useState([]);
  const [rows, setRows]       = useState([]);
  const [loading, setLoad]    = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/custom-views/varroa-trend`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setHiveIds(Array.isArray(d?.hive_ids) ? d.hive_ids : []);
        setRows(Array.isArray(d?.rows) ? d.rows : []);
        setLoad(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoad(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#94a3b8' }}>Loading varroa trend…</div>;
  if (error)   return <div style={{ padding: 16, color: '#f87171' }}>Error: {error}</div>;
  if (!rows.length) return <div style={{ padding: 16, color: '#94a3b8' }}>No varroa data.</div>;

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: 16,
        height: 460,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            label={{
              value: 'mites / 100 bees',
              angle: -90,
              position: 'insideLeft',
              fill: '#94a3b8',
              fontSize: 11,
            }}
            domain={[0, 'dataMax + 1']}
          />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              fontSize: 12,
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconSize={10}
          />
          {/* Common decision thresholds */}
          <ReferenceLine
            y={3}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: 'threshold (3)', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
          />
          <ReferenceLine
            y={5}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: 'critical (5)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
          />
          {hiveIds.map((id, i) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 2 }}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

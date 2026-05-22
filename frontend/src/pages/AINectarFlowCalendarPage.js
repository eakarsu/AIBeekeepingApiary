import React, { useState } from 'react';
import { aiNectarFlowCalendar } from '../services/api';

export default function AINectarFlowCalendarPage() {
  const [payload, setPayload] = useState('{"apiary_id":"AP-001","region":"Sonoma County, CA","bloom_sources":["clover","blackberry","wildflower"],"rainfall_mm_14d":34,"forecast_high_c":24}');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setError('');
    try { setResult(await aiNectarFlowCalendar(JSON.parse(payload || '{}'))); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>AI Nectar Flow Calendar</h2>
        <button className="btn primary" onClick={run}>Build Calendar</button>
      </div>
      <div className="card">
        <textarea rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} />
      </div>
      {error && <div className="alert danger">{error}</div>}
      {result && (
        <div className="card">
          <h3>{result.apiary_id} flow outlook: {result.flow_band}</h3>
          <p>{result.summary}</p>
          <ul>{result.calendar.map((w) => <li key={w.week}>{w.week}: {w.expected_flow} - {w.action}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

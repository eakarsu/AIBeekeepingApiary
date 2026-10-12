import React, { useRef, useState } from 'react';
import AIFieldPresets from '../components/AIFieldPresets';
import { aiNectarFlowCalendar } from '../services/api';

export const nectarExamples = [
  { label: 'Demo AI · Mixed-bloom planning', values: { apiary_id: null, region: 'Fictional northern demonstration region', bloom_sources: ['clover', 'wildflower'], rainfall_mm_14d: 20, forecast_high_c: 24 } },
  { label: 'Demo AI · Dry-weather planning', values: { apiary_id: null, region: 'Fictional central demonstration region', bloom_sources: ['blackberry'], rainfall_mm_14d: 0, forecast_high_c: 32 } },
  { label: 'Demo AI · Empty-bloom planning', values: { apiary_id: null, region: 'Fictional southern demonstration region', bloom_sources: [], rainfall_mm_14d: 0, forecast_high_c: 22 } },
];
export default function AINectarFlowCalendarPage() {
  const [payload, setPayload] = useState('');
  const manualSource = useRef(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fill = (sample) => {
    if (manualSource.current && payload.trim()) return;
    setPayload(JSON.stringify(sample.values, null, 2));
  };
  const run = async () => {
    if (!payload.trim() || loading) return;
    setLoading(true); setError('');
    try { setResult(await aiNectarFlowCalendar(JSON.parse(payload))); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  };
  return <div className="page">
    <div className="page-header"><h2>Nectar Flow · Local Planning Calendar</h2></div>
    <div className="card">
      <p>This fixed-formula planning calculator does not call OpenRouter or retrieve live weather. Examples are fictional, not verified apiary observations.</p>
      <AIFieldPresets fields={[{ key: 'payload', label: 'Planning snapshot', type: 'json' }]} samples={nectarExamples} onFill={fill} disabled={loading} context="Local calendar" />
      <p>Every example fills region, bloom sources, recent rain and temperature, including zero and empty-array cases. An optional actual apiary reference remains manual; no ownership is inferred from the legacy shared list. Entered source observations are preserved.</p>
      <label>Planning snapshot</label>
      <textarea data-ai-field="payload" rows={10} value={payload} onChange={(event) => { manualSource.current = true; setPayload(event.target.value); }} />
      <button className="btn primary" onClick={run} disabled={loading || !payload.trim()}>{loading ? 'Calculating…' : 'Calculate Local Calendar'}</button>
    </div>
    {error && <div className="alert danger" role="alert">{error}</div>}
    {result && <div className="card"><h3>Local planning estimate · {result.flow_band}</h3><p>{result.summary}</p><ul>{(result.calendar || []).map((week) => <li key={week.week}>{week.week}: {week.expected_flow} · {week.action}</li>)}</ul><p>Verify source observations and farm procedures before acting.</p></div>}
  </div>;
}

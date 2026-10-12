import useApiaryAIReferences from './ApiaryAIReferences';
import { apiaryAIExamples, apiaryObservationKeys } from './ApiaryAIExamples';
import { protectPresetRequest } from './SampleIntegrity';
import AIFieldPresets, { completeExample } from './AIFieldPresets';
import useCancelableAI from './useCancelableAI';
import React, { useEffect, useRef, useState } from 'react';
import AIResultDisplay from './AIResultView';
import { getAIHistory, getAISamples } from '../services/api';

/**
 * Generic AI feature page.
 * Props:
 *   - title, subtitle
 *   - feature: string  (matches backend `feature` column in ai_results, e.g. "plan-mission")
 *   - inputs: [{ key, label, type?, placeholder?, options?, defaultValue? }]
 *   - run: async (values) => result
 *   - buttonLabel?
 */
export default function AIPage({ title, subtitle, feature, inputs, run, buttonLabel = 'Generate with OpenRouter' }) {
  const initial = Object.fromEntries(
    (inputs || []).map((i) => [i.key, i.defaultValue ?? (i.key === 'mites_per_100_bees' ? '' : i.type === 'number' ? 0 : '')])
  );
  const [values, setValues] = useState(initial);
  const manualFields = useRef(new Set());
  const references = useApiaryAIReferences(inputs || [], feature);
  const [presetNote, setPresetNote] = useState('');
  const aiRequest = useCancelableAI();
  const { loading, result, error, setResult, setError } = aiRequest;



  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const [samples, setSamples] = useState([]);

  useEffect(() => {
    let alive = true;
    if (!feature) return undefined;
    getAISamples(feature)
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data?.samples) ? data.samples : [];
        setSamples(list);
      })
      .catch(() => { if (alive) setSamples([]); });
    return () => { alive = false; };
  }, [feature]);

  const setField = (k, v) => { manualFields.current.add(k); setValues((s) => ({ ...s, [k]: v })); };

  const presetInputs = references.fields.map(field => /JSON/i.test(field.label || '') ? { ...field, type: 'json' } : field);

  const applySample = (sample, index = 0) => {
    const filled = protectPresetRequest(completeExample(presetInputs, sample || {}, index, title, values), values);
    for (const key of apiaryObservationKeys) {
      if (manualFields.current.has(key) && String(values[key] ?? '').trim()) filled[key] = values[key];
    }
    if (['queen-status-from-sound', 'hive-acoustic-anomaly'].includes(feature) && (!manualFields.current.has('captured_at') || !String(values.captured_at ?? '').trim())) {
      const source = (references.records.hive_sounds || []).filter(row => String(row.hive_id) === String(filled.hive_id)).sort((a,b) => new Date(b.captured_at) - new Date(a.captured_at))[0];
      filled.captured_at = source?.captured_at ? String(source.captured_at) : '';
    }
    if (feature === 'varroa-treatment-recommend' && (!manualFields.current.has('mites_per_100_bees') || !String(values.mites_per_100_bees ?? '').trim())) {
      const source = (references.records.varroa_counts || []).filter(row => String(row.hive_id) === String(filled.hive_id)).sort((a,b) => new Date(b.sampled_at) - new Date(a.sampled_at))[0];
      filled.mites_per_100_bees = source?.mites_per_100_bees !== null && source?.mites_per_100_bees !== undefined && Number.isFinite(Number(source.mites_per_100_bees)) ? Number(source.mites_per_100_bees) : '';
    }
    filled.demonstration_context = 'Example planning request. Hypothetical text and brood metrics are not verified observations; actual selected records remain native sources. Require qualified beekeeper and applicable label/regulatory review before action.';
    setValues(filled); setPresetNote('Every editable non-source field is filled. Actual references and entered observations are retained; any missing genuine recording or count must be supplied before generating.');
    setResult(null); setError(null);
  };

  const missingSource = references.fields.find(field => field.recordReference && ((!/optional/i.test(field.label || '') || String(values[field.key] ?? '').trim()) && !field.options.some(option => String(option.value) === String(values[field.key]))));
  const missingRecording = ['queen-status-from-sound', 'hive-acoustic-anomaly'].includes(feature) && !String(values.captured_at ?? '').trim();
  const missingCount = feature === 'varroa-treatment-recommend' && String(values.mites_per_100_bees ?? '').trim() === '';
  const handleRun = async () => {
    if (references.loading || references.error || missingSource || missingRecording || missingCount) { setError('Select the genuine accessible source and supply missing actual recording/count data before generating.'); return; }
    return aiRequest.run((options) => run(values, options));
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryRows([]);
    try {
      const rows = await getAIHistory(feature, 50);
      if (!Array.isArray(rows)) throw new Error('Shared native AI history returned an unexpected response');
      setHistoryRows(rows);
    } catch (e) {
      setHistoryError(e.message);
    } finally {
      setHistoryLoading(false);
    }
  };
  const closeHistory = () => setHistoryOpen(false);

  return (
    <div className="sr-ai-workspace">
      <div className="page-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="page-header-actions">
          {feature && (
            <button className="btn secondary" onClick={openHistory}>History</button>
          )}
          <button className="btn ai" onClick={handleRun} disabled={loading || references.loading || Boolean(references.error) || Boolean(missingSource) || missingRecording || missingCount}>
            {loading ? <><span className="spinner" />Running...</> : buttonLabel}
          </button>
          {loading && <button type="button" className="btn secondary btn-secondary" onClick={aiRequest.cancel}>Cancel</button>}
        </div>
      </div>

      <AIFieldPresets fields={presetInputs} samples={(apiaryAIExamples[feature] || samples).map((value, index) => value.values ? value : { label: ['Demo AI · Quick review', 'Demo AI · Team planning', 'Demo AI · Detailed review'][index], values: value })} context={title} disabled={loading} onFill={applySample} />
      <p>Examples are explicitly hypothetical planning inputs. The native source lists are shared with authorized app users; selecting a readable record does not imply personal ownership, consent or treatment approval.</p>
      {references.loading && <p role="status">Loading accessible native source records…</p>}
      {references.error && <p role="alert">{references.error} <button type="button" onClick={() => void references.reload()}>Retry source records</button></p>}
      {missingSource && !references.loading && !references.error && <p role="status">No selected accessible {missingSource.label}. Add or select an authorized existing source record; examples will never invent this identifier.</p>}
      {missingRecording && <p role="status">Select an actual recording for this hive or enter its genuine captured timestamp. No recording metadata is fabricated.</p>}
      {missingCount && <p role="status">Supply an actual varroa count or select a hive with a saved count. Zero is preserved when it is actually present.</p>}
      {presetNote && <p role="status">{presetNote}</p>}
      {aiRequest.notice && <div className="sr-notice" role="status">{aiRequest.notice}</div>}

      {(inputs && inputs.length > 0) && (
        <div className="card">
          <div className="form-grid">
            {references.fields.map((i) => (
              <div key={i.key} className={`form-group ${i.type === 'textarea' ? 'full-width' : ''}`}>
                <label htmlFor={'apiary-input-' + i.key}>{i.label}</label>
                {i.type === 'select' ? (
                  <select id={'apiary-input-' + i.key} name={i.key} data-ai-field={i.key} onInput={() => manualFields.current.add(i.key)} value={values[i.key] ?? ''} onChange={(e) => setField(i.key, e.target.value)}>
                    <option value="">—</option>
                    {(i.options || []).map((o) => { const value = typeof o === 'object' ? o.value : o; return <option key={value} value={value}>{typeof o === 'object' ? o.label : o}</option>; })}
                  </select>
                ) : i.type === 'textarea' ? (
                  <textarea
                    id={'apiary-input-' + i.key} name={i.key} data-ai-field={i.key} onInput={() => manualFields.current.add(i.key)}
                    placeholder={i.placeholder || ''}
                    value={values[i.key] ?? ''}
                    onChange={(e) => setField(i.key, e.target.value)}
                  />
                ) : (
                  <input
                    id={'apiary-input-' + i.key} name={i.key} data-ai-field={i.key} onInput={() => manualFields.current.add(i.key)}
                    type={i.type || 'text'}
                    min={i.min ?? (i.type === 'number' ? 0 : undefined)}
                    max={i.max}
                    step={i.step ?? (i.key === 'mites_per_100_bees' ? 0.1 : i.type === 'number' ? 1 : undefined)}
                    placeholder={i.placeholder || ''}
                    value={values[i.key] ?? ''}
                    onChange={(e) =>
                      setField(i.key, i.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <AIResultDisplay
        result={result}
        loading={loading}
        error={error}
        feature={feature}
        title={title}
      />

      {historyOpen && (
        <div className="modal-overlay" onClick={closeHistory}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-label={title + ' · Shared native history'} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <h3>{title} · History</h3>
              <button className="modal-close" onClick={closeHistory}>×</button>
            </div>
            <div className="modal-body">
              <p>This is the existing shared native AI history. Saved results are retained; loading inputs prepares a separate request and grants no treatment or operation approval.</p>
              {historyLoading && <div className="empty-state">Loading history...</div>}
              {historyError && <div className="ai-error">{historyError}</div>}
              {!historyLoading && !historyError && historyRows.length === 0 && (
                <div className="empty-state">No past results for this feature yet.</div>
              )}
              {historyRows.map((row) => (
                <div key={row.id} className="history-entry">
                  <div className="history-entry-meta">
                    <span className="history-entry-id">#{row.id}</span>
                    <span className="history-entry-time">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="sr-actions"><button type="button" className="btn secondary" disabled={loading} onClick={() => { setValues(Object.fromEntries(inputs.map(field => [field.key, row.input?.[field.key] ?? '']))); manualFields.current = new Set(inputs.map(field => field.key)); setHistoryOpen(false); setResult(null); setError(null); setPresetNote('Saved inputs loaded for review. Check any missing native source data; the original result is retained.'); }}>Edit inputs</button><button type="button" className="btn danger" disabled title="The native workflow has no result-delete endpoint">Delete · retained result</button></div>
                  {row.input && Object.keys(row.input).length > 0 && (
                    <details>
                      <summary>Input parameters</summary>
                      <div style={{ marginTop: 8 }}>
                        <AIResultDisplay result={row.input} feature={`${feature}-input`} title="Input" />
                      </div>
                    </details>
                  )}
                  <div style={{ marginTop: 10 }}>
                    <AIResultDisplay result={row.output} feature={feature} title={title} />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={closeHistory}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

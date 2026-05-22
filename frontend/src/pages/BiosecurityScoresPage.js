import React, { useState } from 'react';
import CrudPage from '../components/CrudPage';
import { biosecurityScoresApi, computeBiosecurityScore } from '../services/api';

export default function BiosecurityScoresPage() {
  const [apiaryId, setApiaryId] = useState('');
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);

  const compute = async () => {
    setErr(null); setOut(null);
    try { setOut(await computeBiosecurityScore(apiaryId)); }
    catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <strong>Compute score:</strong>{' '}
        <input
          placeholder="Apiary ID e.g. AP-001"
          value={apiaryId}
          onChange={(e) => setApiaryId(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button className="btn ai" onClick={compute} disabled={!apiaryId}>Compute</button>
        {err && <div className="ai-error" style={{ marginTop: 8 }}>{err}</div>}
        {out && <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{JSON.stringify(out, null, 2)}</pre>}
      </div>
      <CrudPage
        title="Biosecurity Scores"
        subtitle="Composite score (outbreaks + neighbor density + treatments)."
        api={biosecurityScoresApi}
        statusKey="tier"
        fields={[
          { key: 'score_id',    label: 'Score ID' },
          { key: 'apiary_id',   label: 'Apiary ID' },
          { key: 'score',       label: 'Score (0–100)', type: 'number' },
          { key: 'tier',        label: 'Tier', type: 'select',
            options: ['low','medium','high','critical'] },
          { key: 'drivers',     label: 'Drivers', type: 'textarea' },
          { key: 'assessed_at', label: 'Assessed At', type: 'date' },
          { key: 'notes',       label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}

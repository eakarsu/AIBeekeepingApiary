import React, { useState } from 'react';
import CrudPage from '../components/CrudPage';
import { geneticResilienceApi, scoreGeneticResilience } from '../services/api';

export default function GeneticResiliencePage() {
  const [qid, setQid] = useState('');
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);

  const score = async () => {
    setErr(null); setOut(null);
    try { setOut(await scoreGeneticResilience(qid)); }
    catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <strong>Score queen:</strong>{' '}
        <input
          placeholder="Queen ID e.g. Q-2026-001"
          value={qid}
          onChange={(e) => setQid(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button className="btn ai" onClick={score} disabled={!qid}>Score</button>
        {err && <div className="ai-error" style={{ marginTop: 8 }}>{err}</div>}
        {out && <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{JSON.stringify(out, null, 2)}</pre>}
      </div>
      <CrudPage
        title="Genetic Resilience Tracker"
        subtitle="VSH / hygienic trait scores + post-treatment varroa load by queen line."
        api={geneticResilienceApi}
        statusKey="resistance_rating"
        fields={[
          { key: 'record_id',         label: 'Record ID' },
          { key: 'queen_id',          label: 'Queen ID' },
          { key: 'line_name',         label: 'Line Name' },
          { key: 'vsh_score',         label: 'VSH Score',         type: 'number' },
          { key: 'hygienic_score',    label: 'Hygienic Score',    type: 'number' },
          { key: 'varroa_load_post',  label: 'Varroa Load (post)', type: 'number' },
          { key: 'resistance_rating', label: 'Resistance Rating', type: 'select',
            options: ['vulnerable','susceptible','tolerant','resistant','unknown'] },
          { key: 'assessed_at',       label: 'Assessed At',       type: 'date' },
          { key: 'notes',             label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}

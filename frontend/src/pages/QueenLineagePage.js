import React, { useState } from 'react';
import { getQueenLineage } from '../services/api';

export default function QueenLineagePage() {
  const [qid, setQid] = useState('');
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLineage = async () => {
    setErr(null); setOut(null); setLoading(true);
    try { setOut(await getQueenLineage(qid)); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Queen Lineage</h2>
          <p>Mother → daughters traversal; inbreeding + hygienic-trait flags.</p>
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            placeholder="Queen surrogate ID or queen_id (e.g. Q-2026-001)"
            value={qid}
            onChange={(e) => setQid(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn ai" onClick={fetchLineage} disabled={!qid || loading}>
            {loading ? 'Loading...' : 'Trace'}
          </button>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
          Tip: record parentage by adding <code>mother=&lt;queen_id&gt;</code> to the queen's notes.
        </p>
      </div>
      {err && <div className="ai-error" style={{ marginTop: 12 }}>{err}</div>}
      {out && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Root</h3>
          <pre>{JSON.stringify(out.root, null, 2)}</pre>
          <h3>Ancestors ({out.ancestors?.length || 0})</h3>
          <pre>{JSON.stringify(out.ancestors, null, 2)}</pre>
          <h3>Daughters ({out.daughters?.length || 0})</h3>
          <pre>{JSON.stringify(out.daughters, null, 2)}</pre>
          <div>
            <strong>Inbreeding flag:</strong> {String(out.inbreeding_flag)} ·{' '}
            <strong>Hygienic-trait lineage:</strong> {String(out.hygienic_trait_lineage)} ·{' '}
            <strong>Generations traced:</strong> {out.generations_traced}
          </div>
        </div>
      )}
    </div>
  );
}

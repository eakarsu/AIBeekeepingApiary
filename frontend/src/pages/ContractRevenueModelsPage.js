import React, { useState } from 'react';
import CrudPage from '../components/CrudPage';
import { contractRevenueModelsApi, optimizeContractRevenue } from '../services/api';

export default function ContractRevenueModelsPage() {
  const [cid, setCid] = useState('');
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);

  const optimize = async () => {
    setErr(null); setOut(null);
    try { setOut(await optimizeContractRevenue(cid)); }
    catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <strong>Optimize contract:</strong>{' '}
        <input
          placeholder="Contract ID e.g. POL-2026-001"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button className="btn ai" onClick={optimize} disabled={!cid}>Optimize</button>
        {err && <div className="ai-error" style={{ marginTop: 8 }}>{err}</div>}
        {out && <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{JSON.stringify(out, null, 2)}</pre>}
      </div>
      <CrudPage
        title="Contract Revenue Models"
        subtitle="Pollination contract revenue optimizer (gross − travel, hive fit)."
        api={contractRevenueModelsApi}
        statusKey="status"
        fields={[
          { key: 'model_id',        label: 'Model ID' },
          { key: 'contract_id',     label: 'Contract ID' },
          { key: 'gross_usd',       label: 'Gross (USD)',  type: 'number' },
          { key: 'travel_cost_usd', label: 'Travel Cost (USD)', type: 'number' },
          { key: 'hive_fit_score',  label: 'Hive Fit Score', type: 'number' },
          { key: 'margin_usd',      label: 'Margin (USD)', type: 'number' },
          { key: 'status',          label: 'Status', type: 'select',
            options: ['draft','accepted','rejected'] },
          { key: 'notes',           label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import CrudPage from '../components/CrudPage';
import { pesticideSetbacksApi, getSetbackBaseline } from '../services/api';

export default function PesticideSetbacksPage() {
  const [baseline, setBaseline] = useState(null);
  useEffect(() => {
    getSetbackBaseline().then(setBaseline).catch(() => setBaseline(null));
  }, []);
  return (
    <div>
      {baseline && (
        <div className="card" style={{ marginBottom: 12 }}>
          <strong>EPA baseline setbacks (m):</strong>{' '}
          {Object.entries(baseline.baseline_setbacks_m || {}).map(([k, v]) => (
            <span key={k} style={{ marginRight: 12 }}>{k}: <b>{v}</b></span>
          ))}
        </div>
      )}
      <CrudPage
        title="Pesticide Setback Compliance"
        subtitle="Geofenced setback distances vs. apiary locations (EPA Bee Where? baseline)."
        api={pesticideSetbacksApi}
        statusKey="status"
        fields={[
          { key: 'setback_id',         label: 'Setback ID' },
          { key: 'apiary_id',          label: 'Apiary ID' },
          { key: 'pesticide',          label: 'Pesticide' },
          { key: 'toxicity_class',     label: 'Toxicity Class', type: 'select',
            options: ['low','moderate','high','highly_toxic'] },
          { key: 'required_setback_m', label: 'Required Setback (m)', type: 'number' },
          { key: 'actual_setback_m',   label: 'Actual Setback (m)',   type: 'number' },
          { key: 'status',             label: 'Status', type: 'select',
            options: ['compliant','violation','review'] },
          { key: 'source_authority',   label: 'Source Authority' },
          { key: 'notes',              label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}

import React from 'react';
import AIPage from '../components/AIPage';
import { aiVarroaRiskScore } from '../services/api';

export default function AIVarroaRiskScorePage() {
  return (
    <AIPage
      title="AI · Varroa Risk Score (pre-count)"
      feature="varroa-risk-score"
      subtitle="Score varroa risk from inspection narrative + brood metrics before a count is taken."
      inputs={[
        { key: 'hive_id',     label: 'Hive ID' },
        { key: 'narrative',   label: 'Inspection narrative', type: 'textarea' },
        { key: 'drone_count', label: 'Drone count', type: 'number' },
        { key: 'brood_gap',   label: 'Brood gap?', type: 'select', options: ['true','false'] },
      ]}
      run={(v) => aiVarroaRiskScore({ ...v, brood_gap: v.brood_gap === 'true' })}
    />
  );
}

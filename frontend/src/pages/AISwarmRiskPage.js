import React from 'react';
import AIPage from '../components/AIPage';
import { aiSwarmRiskPredict } from '../services/api';

export default function AISwarmRiskPage() {
  return (
    <AIPage
      title="AI · Swarm Risk Predict"
      feature="swarm-risk-predict"
      subtitle="Predict per-hive swarm risk windows across an apiary."
      inputs={[
        { key: 'apiary_id', label: 'Apiary ID' },
        { key: 'notes',     label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiSwarmRiskPredict(v)}
    />
  );
}

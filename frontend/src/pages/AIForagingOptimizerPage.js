import React from 'react';
import AIPage from '../components/AIPage';
import { aiForagingOptimizer } from '../services/api';

export default function AIForagingOptimizerPage() {
  return (
    <AIPage
      title="AI · Foraging Optimizer"
      feature="foraging-optimizer"
      subtitle="Joint optimizer over forecast weather + plant phenology + apiary placement."
      inputs={[
        { key: 'apiary_id', label: 'Apiary ID' },
        { key: 'notes',     label: 'Constraints / notes', type: 'textarea' },
      ]}
      run={(v) => aiForagingOptimizer(v)}
    />
  );
}

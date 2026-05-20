import React from 'react';
import AIPage from '../components/AIPage';
import { aiSupplyResupplyPlan } from '../services/api';

export default function AISupplyResupplyPage() {
  return (
    <AIPage
      title="AI · Supply Resupply Plan"
      feature="supply-resupply-plan"
      subtitle="Compute reorder recommendations from current supplies and reorder points."
      inputs={[
        { key: 'focus', label: 'Focus (optional)' },
      ]}
      run={(v) => aiSupplyResupplyPlan(v)}
    />
  );
}

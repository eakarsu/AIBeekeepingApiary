import React from 'react';
import AIPage from '../components/AIPage';
import { aiTreatmentEfficacyAnalyze } from '../services/api';

export default function AITreatmentEfficacyPage() {
  return (
    <AIPage
      title="AI · Treatment Efficacy Analyze"
      feature="treatment-efficacy-analyze"
      subtitle="Compare treatment efficacy across products from recent records."
      inputs={[
        { key: 'product', label: 'Product (optional filter)' },
      ]}
      run={(v) => aiTreatmentEfficacyAnalyze(v)}
    />
  );
}

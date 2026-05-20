import React from 'react';
import AIPage from '../components/AIPage';
import { aiDiseaseOutbreakSummary } from '../services/api';

export default function AIDiseaseOutbreakPage() {
  return (
    <AIPage
      title="AI · Disease Outbreak Summary"
      feature="disease-outbreak-summary"
      subtitle="Summarize outbreak, recommend containment and reporting."
      inputs={[
        { key: 'outbreak_id', label: 'Outbreak ID (optional)' },
      ]}
      run={(v) => aiDiseaseOutbreakSummary(v)}
    />
  );
}

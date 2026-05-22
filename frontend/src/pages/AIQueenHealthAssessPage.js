import React from 'react';
import AIPage from '../components/AIPage';
import { aiQueenHealthAssess } from '../services/api';

export default function AIQueenHealthAssessPage() {
  return (
    <AIPage
      title="AI · Queen Health Assess"
      feature="queen-health-assess"
      subtitle="Multi-signal queen vitality score (laying pattern, brood gap, supersedure cells, age)."
      inputs={[
        { key: 'queen_id', label: 'Queen ID' },
        { key: 'notes',    label: 'Additional notes', type: 'textarea' },
      ]}
      run={(v) => aiQueenHealthAssess(v)}
    />
  );
}

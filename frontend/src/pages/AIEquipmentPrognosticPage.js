import React from 'react';
import AIPage from '../components/AIPage';
import { aiEquipmentPrognostic } from '../services/api';

export default function AIEquipmentPrognosticPage() {
  return (
    <AIPage
      title="AI · Equipment Prognostic"
      feature="equipment-prognostic"
      subtitle="Predict equipment service needs from last-service records."
      inputs={[
        { key: 'focus', label: 'Focus (optional)' },
      ]}
      run={(v) => aiEquipmentPrognostic(v)}
    />
  );
}

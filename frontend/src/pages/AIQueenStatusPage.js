import React from 'react';
import AIPage from '../components/AIPage';
import { aiQueenStatusFromSound } from '../services/api';

export default function AIQueenStatusPage() {
  return (
    <AIPage
      title="AI · Queen Status From Sound"
      feature="queen-status-from-sound"
      subtitle="Classify queen status from acoustic recording metadata."
      inputs={[
        { key: 'hive_id',     label: 'Hive ID' },
        { key: 'captured_at', label: 'Captured At' },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
      run={(v) => aiQueenStatusFromSound(v)}
    />
  );
}

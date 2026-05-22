import React from 'react';
import AIPage from '../components/AIPage';
import { aiHiveAcousticAnomaly } from '../services/api';

export default function AIHiveAcousticAnomalyPage() {
  return (
    <AIPage
      title="AI · Hive Acoustic Anomaly"
      feature="hive-acoustic-anomaly"
      subtitle="Generic anomaly classifier (varroa stress, robbing, swarm prep, queenlessness drift)."
      inputs={[
        { key: 'hive_id',     label: 'Hive ID' },
        { key: 'captured_at', label: 'Captured At' },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
      run={(v) => aiHiveAcousticAnomaly(v)}
    />
  );
}

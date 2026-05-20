import React from 'react';
import AIPage from '../components/AIPage';
import { aiHiveStrengthTrend } from '../services/api';

export default function AIHiveStrengthPage() {
  return (
    <AIPage
      title="AI · Hive Strength Trend"
      feature="hive-strength-trend"
      subtitle="Analyze trend across recent inspections for a single hive."
      inputs={[
        { key: 'hive_id', label: 'Hive ID' },
      ]}
      run={(v) => aiHiveStrengthTrend(v)}
    />
  );
}

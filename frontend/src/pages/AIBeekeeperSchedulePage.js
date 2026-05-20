import React from 'react';
import AIPage from '../components/AIPage';
import { aiBeekeeperSchedule } from '../services/api';

export default function AIBeekeeperSchedulePage() {
  return (
    <AIPage
      title="AI · Beekeeper Schedule"
      feature="beekeeper-schedule"
      subtitle="Build a 1-week beekeeper work schedule across active yards."
      inputs={[
        { key: 'week_start', label: 'Week Start (YYYY-MM-DD)' },
        { key: 'focus',      label: 'Focus (optional)' },
      ]}
      run={(v) => aiBeekeeperSchedule(v)}
    />
  );
}

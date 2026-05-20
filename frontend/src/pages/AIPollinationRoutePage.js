import React from 'react';
import AIPage from '../components/AIPage';
import { aiPollinationRoutePlan } from '../services/api';

export default function AIPollinationRoutePage() {
  return (
    <AIPage
      title="AI · Pollination Route Plan"
      feature="pollination-route-plan"
      subtitle="Plan a multi-stop pollination delivery route."
      inputs={[
        { key: 'stops',       label: 'Stops (comma-separated)', type: 'textarea' },
        { key: 'total_hives', label: 'Total Hives', type: 'number' },
      ]}
      run={(v) => aiPollinationRoutePlan({
        stops: typeof v.stops === 'string' ? v.stops.split(',').map((s) => s.trim()).filter(Boolean) : v.stops,
        total_hives: v.total_hives,
      })}
    />
  );
}

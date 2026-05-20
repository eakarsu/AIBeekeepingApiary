import React from 'react';
import AIPage from '../components/AIPage';
import { aiWeatherImpactBrief } from '../services/api';

export default function AIWeatherImpactPage() {
  return (
    <AIPage
      title="AI · Weather Impact Brief"
      feature="weather-impact-brief"
      subtitle="Translate forecast into foraging, swarm risk and treatment windows."
      inputs={[
        { key: 'location', label: 'Location' },
      ]}
      run={(v) => aiWeatherImpactBrief(v)}
    />
  );
}

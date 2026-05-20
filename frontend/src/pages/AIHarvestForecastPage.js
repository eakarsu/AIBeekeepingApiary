import React from 'react';
import AIPage from '../components/AIPage';
import { aiHarvestForecast } from '../services/api';

export default function AIHarvestForecastPage() {
  return (
    <AIPage
      title="AI · Harvest Forecast"
      feature="harvest-forecast"
      subtitle="Forecast honey yield across hives over a configurable horizon."
      inputs={[
        { key: 'horizon_weeks', label: 'Horizon (weeks)', type: 'number' },
        { key: 'type',          label: 'Honey Type (optional)' },
      ]}
      run={(v) => aiHarvestForecast(v)}
    />
  );
}

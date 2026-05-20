import React from 'react';
import AIPage from '../components/AIPage';
import { aiPlantSourceMap } from '../services/api';

export default function AIPlantSourceMapPage() {
  return (
    <AIPage
      title="AI · Plant Source Map"
      feature="plant-source-map"
      subtitle="Map nearby nectar/pollen flora for an apiary's foraging strategy."
      inputs={[
        { key: 'apiary_id', label: 'Apiary ID' },
      ]}
      run={(v) => aiPlantSourceMap(v)}
    />
  );
}

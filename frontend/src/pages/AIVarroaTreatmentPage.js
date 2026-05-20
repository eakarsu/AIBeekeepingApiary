import React from 'react';
import AIPage from '../components/AIPage';
import { aiVarroaTreatmentRecommend } from '../services/api';

export default function AIVarroaTreatmentPage() {
  return (
    <AIPage
      title="AI · Varroa Treatment Recommend"
      feature="varroa-treatment-recommend"
      subtitle="Recommend treatment plan based on mite load and season."
      inputs={[
        { key: 'hive_id',             label: 'Hive ID' },
        { key: 'mites_per_100_bees',  label: 'Mites / 100 bees', type: 'number' },
        { key: 'season',              label: 'Season' },
      ]}
      run={(v) => aiVarroaTreatmentRecommend(v)}
    />
  );
}

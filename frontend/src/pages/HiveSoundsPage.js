import React from 'react';
import CrudPage from '../components/CrudPage';
import { hiveSoundsApi } from '../services/api';

export default function HiveSoundsPage() {
  return (
    <CrudPage
      title="Hive Sounds"
      subtitle="Acoustic recordings of hives and ML classification output."
      api={hiveSoundsApi}
      statusKey="classification"
      fields={[
        { key: 'sound_id',       label: 'Sound ID' },
        { key: 'hive_id',        label: 'Hive ID' },
        { key: 'recording_url',  label: 'Recording URL' },
        { key: 'captured_at',    label: 'Captured At', type: 'datetime-local' },
        { key: 'classification', label: 'Classification', type: 'select', options: ['queenright','queenless','queenless_warble','swarm_preparing','weak','unknown'] },
        { key: 'confidence',     label: 'Confidence', type: 'number' },
        { key: 'notes',          label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

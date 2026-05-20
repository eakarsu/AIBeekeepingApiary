import React from 'react';
import CrudPage from '../components/CrudPage';
import { plantSourcesApi } from '../services/api';

export default function PlantSourcesPage() {
  return (
    <CrudPage
      title="Plant Sources"
      subtitle="Nectar / pollen flora within forage range of apiaries."
      api={plantSourcesApi}
      statusKey="status"
      fields={[
        { key: 'source_id',    label: 'Source ID' },
        { key: 'common_name',  label: 'Common Name' },
        { key: 'distance_km',  label: 'Distance (km)', type: 'number' },
        { key: 'blooms_at',    label: 'Blooms At' },
        { key: 'nectar_yield', label: 'Nectar Yield', type: 'select', options: ['low','medium','high','very_high'] },
        { key: 'status',       label: 'Status', type: 'select', options: ['available','seasonal','depleted'] },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

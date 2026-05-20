import React from 'react';
import CrudPage from '../components/CrudPage';
import { hivesApi } from '../services/api';

export default function HivesPage() {
  return (
    <CrudPage
      title="Hives"
      subtitle="Individual colonies — apiary, queen, frame count, inspection."
      api={hivesApi}
      statusKey="status"
      fields={[
        { key: 'hive_id',         label: 'Hive ID' },
        { key: 'apiary_id',       label: 'Apiary ID' },
        { key: 'queen_id',        label: 'Queen ID' },
        { key: 'frame_count',     label: 'Frame Count', type: 'number' },
        { key: 'last_inspection', label: 'Last Inspection', type: 'date' },
        { key: 'status',          label: 'Status', type: 'select', options: ['strong','moderate','weak','queenless','dead'] },
        { key: 'notes',           label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

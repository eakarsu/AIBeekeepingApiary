import React from 'react';
import CrudPage from '../components/CrudPage';
import { swarmsApi } from '../services/api';

export default function SwarmsPage() {
  return (
    <CrudPage
      title="Swarms"
      subtitle="Captured swarms — source hive, location, captor."
      api={swarmsApi}
      statusKey="status"
      fields={[
        { key: 'swarm_id',    label: 'Swarm ID' },
        { key: 'source_hive', label: 'Source Hive' },
        { key: 'location',    label: 'Location' },
        { key: 'caught_at',   label: 'Caught At', type: 'datetime-local' },
        { key: 'status',      label: 'Status', type: 'select', options: ['captured','released','absconded','dead'] },
        { key: 'captured_by', label: 'Captured By' },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

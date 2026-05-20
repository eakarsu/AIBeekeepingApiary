import React from 'react';
import CrudPage from '../components/CrudPage';
import { inspectionsApi } from '../services/api';

export default function InspectionsPage() {
  return (
    <CrudPage
      title="Inspections"
      subtitle="Hive inspection records with brood pattern and health."
      api={inspectionsApi}
      statusKey="health"
      fields={[
        { key: 'inspection_id', label: 'Inspection ID' },
        { key: 'hive_id',       label: 'Hive ID' },
        { key: 'inspector',     label: 'Inspector' },
        { key: 'date',          label: 'Date', type: 'date' },
        { key: 'brood_pattern', label: 'Brood Pattern', type: 'select', options: ['solid','spotty','poor','none'] },
        { key: 'health',        label: 'Health', type: 'select', options: ['healthy','moderate','varroa_present','queenless','weak_colony','dead'] },
        { key: 'notes',         label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

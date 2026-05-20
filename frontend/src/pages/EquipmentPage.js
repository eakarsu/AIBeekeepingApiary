import React from 'react';
import CrudPage from '../components/CrudPage';
import { equipmentApi } from '../services/api';

export default function EquipmentPage() {
  return (
    <CrudPage
      title="Equipment"
      subtitle="Extractors, scales, vehicles, lab gear and other apiary equipment."
      api={equipmentApi}
      statusKey="status"
      fields={[
        { key: 'eq_id',       label: 'Equipment ID' },
        { key: 'type',        label: 'Type' },
        { key: 'sn',          label: 'Serial No.' },
        { key: 'location',    label: 'Location' },
        { key: 'last_service',label: 'Last Service', type: 'date' },
        { key: 'status',      label: 'Status', type: 'select', options: ['operational','needs_service','out_of_service'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

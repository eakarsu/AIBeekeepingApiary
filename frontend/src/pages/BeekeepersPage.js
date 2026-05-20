import React from 'react';
import CrudPage from '../components/CrudPage';
import { beekeepersApi } from '../services/api';

export default function BeekeepersPage() {
  return (
    <CrudPage
      title="Beekeepers"
      subtitle="Staff roster — certifications and assigned base."
      api={beekeepersApi}
      statusKey="status"
      fields={[
        { key: 'beekeeper_id',  label: 'Beekeeper ID' },
        { key: 'name',          label: 'Name' },
        { key: 'certifications',label: 'Certifications' },
        { key: 'base',          label: 'Base' },
        { key: 'hives_managed', label: 'Hives Managed', type: 'number' },
        { key: 'status',        label: 'Status', type: 'select', options: ['active','on_leave','inactive'] },
        { key: 'notes',         label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

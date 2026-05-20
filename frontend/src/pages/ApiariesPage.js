import React from 'react';
import CrudPage from '../components/CrudPage';
import { apiariesApi } from '../services/api';

export default function ApiariesPage() {
  return (
    <CrudPage
      title="Apiaries"
      subtitle="Bee yards: location, hive count, owner and status."
      api={apiariesApi}
      statusKey="status"
      fields={[
        { key: 'apiary_id',  label: 'Apiary ID' },
        { key: 'name',       label: 'Name' },
        { key: 'location',   label: 'Location' },
        { key: 'hive_count', label: 'Hive Count', type: 'number' },
        { key: 'owner',      label: 'Owner' },
        { key: 'status',     label: 'Status', type: 'select', options: ['active','inactive','quarantine'] },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

import React from 'react';
import CrudPage from '../components/CrudPage';
import { treatmentsApi } from '../services/api';

export default function TreatmentsPage() {
  return (
    <CrudPage
      title="Treatments"
      subtitle="Varroa and disease treatments applied to hives."
      api={treatmentsApi}
      statusKey="status"
      fields={[
        { key: 'treatment_id', label: 'Treatment ID' },
        { key: 'hive_id',      label: 'Hive ID' },
        { key: 'product',      label: 'Product' },
        { key: 'dosage',       label: 'Dosage' },
        { key: 'applied_at',   label: 'Applied At', type: 'date' },
        { key: 'status',       label: 'Status', type: 'select', options: ['scheduled','applied','complete','aborted'] },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

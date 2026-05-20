import React from 'react';
import CrudPage from '../components/CrudPage';
import { diseaseOutbreaksApi } from '../services/api';

export default function DiseaseOutbreaksPage() {
  return (
    <CrudPage
      title="Disease Outbreaks"
      subtitle="Active and resolved disease events across apiaries."
      api={diseaseOutbreaksApi}
      statusKey="severity"
      fields={[
        { key: 'outbreak_id', label: 'Outbreak ID' },
        { key: 'apiary_id',   label: 'Apiary ID' },
        { key: 'disease',     label: 'Disease' },
        { key: 'severity',    label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'opened_at',   label: 'Opened At', type: 'date' },
        { key: 'status',      label: 'Status', type: 'select', options: ['open','contained','resolved'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

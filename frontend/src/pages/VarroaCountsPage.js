import React from 'react';
import CrudPage from '../components/CrudPage';
import { varroaCountsApi } from '../services/api';

export default function VarroaCountsPage() {
  return (
    <CrudPage
      title="Varroa Counts"
      subtitle="Mite-per-100-bees samples and action taken."
      api={varroaCountsApi}
      statusKey="status"
      fields={[
        { key: 'count_id',           label: 'Count ID' },
        { key: 'hive_id',            label: 'Hive ID' },
        { key: 'mites_per_100_bees', label: 'Mites / 100 Bees', type: 'number' },
        { key: 'sampled_at',         label: 'Sampled At', type: 'date' },
        { key: 'status',             label: 'Status', type: 'select', options: ['monitoring','threshold','critical'] },
        { key: 'action',             label: 'Action' },
        { key: 'notes',              label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

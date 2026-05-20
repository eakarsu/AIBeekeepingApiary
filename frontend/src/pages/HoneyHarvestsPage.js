import React from 'react';
import CrudPage from '../components/CrudPage';
import { honeyHarvestsApi } from '../services/api';

export default function HoneyHarvestsPage() {
  return (
    <CrudPage
      title="Honey Harvests"
      subtitle="Honey extracted per hive, by type and storage status."
      api={honeyHarvestsApi}
      statusKey="status"
      fields={[
        { key: 'harvest_id',  label: 'Harvest ID' },
        { key: 'hive_id',     label: 'Hive ID' },
        { key: 'kg',          label: 'Kg', type: 'number' },
        { key: 'type',        label: 'Type' },
        { key: 'harvested_at',label: 'Harvested At', type: 'date' },
        { key: 'status',      label: 'Status', type: 'select', options: ['in_storage','bottled','sold','discarded'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

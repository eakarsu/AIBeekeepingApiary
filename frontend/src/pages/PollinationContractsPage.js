import React from 'react';
import CrudPage from '../components/CrudPage';
import { pollinationContractsApi } from '../services/api';

export default function PollinationContractsPage() {
  return (
    <CrudPage
      title="Pollination Contracts"
      subtitle="Hives committed per crop and customer."
      api={pollinationContractsApi}
      statusKey="status"
      fields={[
        { key: 'contract_id',     label: 'Contract ID' },
        { key: 'customer_id',     label: 'Customer ID' },
        { key: 'crop',            label: 'Crop' },
        { key: 'hives_committed', label: 'Hives Committed', type: 'number' },
        { key: 'fee_usd',         label: 'Fee (USD)', type: 'number' },
        { key: 'status',          label: 'Status', type: 'select', options: ['pending','active','completed','cancelled'] },
        { key: 'notes',           label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

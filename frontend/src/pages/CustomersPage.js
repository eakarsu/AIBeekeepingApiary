import React from 'react';
import CrudPage from '../components/CrudPage';
import { customersApi } from '../services/api';

export default function CustomersPage() {
  return (
    <CrudPage
      title="Customers"
      subtitle="Orchard and farm customers for pollination services."
      api={customersApi}
      statusKey="status"
      fields={[
        { key: 'customer_id',   label: 'Customer ID' },
        { key: 'name',          label: 'Name' },
        { key: 'type',          label: 'Type', type: 'select', options: ['orchard','farm','distributor','retail'] },
        { key: 'region',        label: 'Region' },
        { key: 'last_contract', label: 'Last Contract', type: 'date' },
        { key: 'status',        label: 'Status', type: 'select', options: ['active','inactive','prospect'] },
        { key: 'notes',         label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

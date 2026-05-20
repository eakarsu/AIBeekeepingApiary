import React from 'react';
import CrudPage from '../components/CrudPage';
import { suppliesApi } from '../services/api';

export default function SuppliesPage() {
  return (
    <CrudPage
      title="Supplies"
      subtitle="Frames, foundation, treatments, bottling consumables."
      api={suppliesApi}
      statusKey="status"
      fields={[
        { key: 'supply_id',    label: 'Supply ID' },
        { key: 'item',         label: 'Item' },
        { key: 'qty',          label: 'Qty', type: 'number' },
        { key: 'location',     label: 'Location' },
        { key: 'reorder_point',label: 'Reorder Point', type: 'number' },
        { key: 'status',       label: 'Status', type: 'select', options: ['in_stock','reorder','out_of_stock'] },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

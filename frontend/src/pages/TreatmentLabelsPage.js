import React from 'react';
import CrudPage from '../components/CrudPage';
import { treatmentLabelsApi } from '../services/api';

export default function TreatmentLabelsPage() {
  return (
    <CrudPage
      title="Treatment Labels"
      subtitle="Drug/strip metadata: active ingredient, EPA reg #, withdrawal & re-entry intervals."
      api={treatmentLabelsApi}
      fields={[
        { key: 'label_id',                label: 'Label ID' },
        { key: 'product',                 label: 'Product' },
        { key: 'active_ingredient',       label: 'Active Ingredient' },
        { key: 'manufacturer',            label: 'Manufacturer' },
        { key: 'epa_reg_no',              label: 'EPA Reg #' },
        { key: 'withdrawal_days_honey',   label: 'Honey Withdrawal (days)', type: 'number' },
        { key: 'reentry_interval_hours',  label: 'Re-Entry Interval (hrs)', type: 'number' },
        { key: 'approved_temp_range_c',   label: 'Approved Temp Range (C)' },
        { key: 'resistance_class',        label: 'Resistance Class' },
        { key: 'notes',                   label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

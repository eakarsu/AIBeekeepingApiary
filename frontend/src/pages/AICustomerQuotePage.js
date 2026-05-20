import React from 'react';
import AIPage from '../components/AIPage';
import { aiCustomerQuote } from '../services/api';

export default function AICustomerQuotePage() {
  return (
    <AIPage
      title="AI · Customer Quote"
      feature="customer-quote"
      subtitle="Draft a pollination services quote for a customer."
      inputs={[
        { key: 'customer', label: 'Customer' },
        { key: 'crop',     label: 'Crop' },
        { key: 'hives',    label: 'Hives Recommended', type: 'number' },
        { key: 'weeks',    label: 'Service Weeks',     type: 'number' },
      ]}
      run={(v) => aiCustomerQuote(v)}
    />
  );
}

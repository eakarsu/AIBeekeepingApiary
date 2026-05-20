import React from 'react';
import AIPage from '../components/AIPage';
import { aiVendorQuoteCompare } from '../services/api';

export default function AIVendorQuoteComparePage() {
  return (
    <AIPage
      title="AI · Vendor Quote Compare"
      feature="vendor-quote-compare"
      subtitle="Compare vendor quotes for an apiary supply item."
      inputs={[
        { key: 'item', label: 'Item' },
      ]}
      run={(v) => aiVendorQuoteCompare(v)}
    />
  );
}

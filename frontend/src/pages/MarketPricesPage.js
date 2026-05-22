import React, { useState } from 'react';
import CrudPage from '../components/CrudPage';
import { marketPricesApi, ingestMarketPrices } from '../services/api';

export default function MarketPricesPage() {
  const [ingestResult, setIngestResult] = useState(null);

  const handleIngest = async () => {
    try {
      const r = await ingestMarketPrices();
      setIngestResult(JSON.stringify(r, null, 2));
    } catch (e) {
      // 503 stub returns a structured body; surface it.
      setIngestResult(`Ingestion not available: ${e.message}`);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <strong>Live price ingestion:</strong> credential-gated (USDA NASS / ABF).
        <button className="btn secondary" style={{ marginLeft: 12 }} onClick={handleIngest}>
          Try Ingest
        </button>
        {ingestResult && (
          <pre style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{ingestResult}</pre>
        )}
      </div>
      <CrudPage
        title="Market Prices"
        subtitle="Honey, wax, queens, pollen, propolis — spot prices and history."
        api={marketPricesApi}
        fields={[
          { key: 'price_id',    label: 'Price ID' },
          { key: 'commodity',   label: 'Commodity', type: 'select',
            options: ['honey','wax','queens','pollen','propolis'] },
          { key: 'region',      label: 'Region' },
          { key: 'unit',        label: 'Unit' },
          { key: 'price_usd',   label: 'Price (USD)', type: 'number' },
          { key: 'reported_at', label: 'Reported At', type: 'date' },
          { key: 'source',      label: 'Source' },
          { key: 'notes',       label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}

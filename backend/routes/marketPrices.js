// Market price feed history.
// CRUD over `market_prices` is fully supported (operators can hand-enter
// the USDA NASS honey report into the table). Live feed ingestion is
// NEEDS-CREDS — we expose a 503 stub at /ingest that documents the
// upstream provider choice.

const express = require('express');
const buildCrud = require('./_crudFactory');

const innerCrud = buildCrud({
  table: 'market_prices',
  fields: [
    'price_id',
    'commodity',
    'region',
    'unit',
    'price_usd',
    'reported_at',
    'source',
    'notes',
  ],
});

const outer = express.Router();

outer.post('/ingest', (req, res) => {
  res.status(503).json({
    error: 'Live market price ingestion not configured',
    needs_creds: ['USDA_NASS_API_KEY', 'ABF_API_KEY'],
    candidate_providers: [
      'USDA NASS honey report API',
      'American Beekeeping Federation (ABF) wholesale price index',
      'Bee Culture / third-party honey spot feeds',
    ],
    note: 'Hand-enter rows via POST /api/market-prices in the meantime.',
  });
});

outer.use(innerCrud);

module.exports = outer;

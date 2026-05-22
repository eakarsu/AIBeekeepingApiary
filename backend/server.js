const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');
const { fireWebhook } = require('./services/webhooks');

async function onDiseaseOutbreakCreated(row) {
  const sev = String(row.severity || '').toLowerCase();
  if (['critical', 'high'].includes(sev)) {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, severity, source)
         VALUES (NULL, $1, $2, $3, $4)`,
        [`Disease outbreak: ${row.disease}`,
         `${row.apiary_id} — opened ${row.opened_at || ''}`.slice(0, 1000),
         sev,
         'disease_outbreaks']
      );
    } catch (e) { console.warn('[notify] outbreak insert failed:', e.message); }
    fireWebhook(`disease_outbreaks.${sev}`, { row }).catch(() => {});
  }
}

async function onVarroaCountCreated(row) {
  const mites = Number(row.mites_per_100_bees || 0);
  let sev = 'info';
  if (mites >= 5) sev = 'critical';
  else if (mites >= 3) sev = 'high';
  if (sev !== 'info') {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, severity, source)
         VALUES (NULL, $1, $2, $3, $4)`,
        [`Varroa count ${mites}/100 bees — ${row.hive_id}`,
         `Action: ${row.action || 'review'}`.slice(0, 1000),
         sev,
         'varroa_counts']
      );
    } catch (e) { console.warn('[notify] varroa insert failed:', e.message); }
    fireWebhook(`varroa_counts.${sev}`, { row }).catch(() => {});
  }
}

const app = express();
const PORT = process.env.BACKEND_PORT || 3093;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3092,http://localhost:3093,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything below this line requires a Bearer token.
app.use('/api', authenticateToken);

// CRUD routes — 18 domain entities (all built via _crudFactory, which embeds
// RBAC + bulk-import + attachments).
app.use('/api/apiaries',              require('./routes/apiaries'));
app.use('/api/hives',                 require('./routes/hives'));
app.use('/api/queens',                require('./routes/queens'));
app.use('/api/inspections',           require('./routes/inspections'));
app.use('/api/treatments',            require('./routes/treatments'));
app.use('/api/honey-harvests',        require('./routes/honeyHarvests'));
app.use('/api/supplies',              require('./routes/supplies'));
app.use('/api/equipment',             require('./routes/equipment'));
app.use('/api/beekeepers',            require('./routes/beekeepers'));
app.use('/api/pollination-contracts', require('./routes/pollinationContracts'));
app.use('/api/customers',             require('./routes/customers'));
app.use('/api/plant-sources',         require('./routes/plantSources'));
app.use('/api/weather-briefs',        require('./routes/weatherBriefs'));

// Disease outbreaks + varroa counts wire side-effect notifications via a
// lightweight POST-result interceptor (avoids touching _crudFactory).
function withCreatedHook(router, hook) {
  router.stack.unshift({
    route: null,
    name: '_createdHook',
    handle: (req, res, next) => {
      if (req.method !== 'POST' || req.path !== '/') return next();
      const origJson = res.json.bind(res);
      res.json = (body) => {
        try {
          if (res.statusCode === 201 && body && body.id) {
            Promise.resolve(hook(body, req)).catch((e) =>
              console.warn(`[createdHook] failed:`, e.message)
            );
          }
        } catch (_) {}
        return origJson(body);
      };
      next();
    },
  });
  return router;
}

app.use('/api/disease-outbreaks',     withCreatedHook(require('./routes/diseaseOutbreaks'), onDiseaseOutbreakCreated));
app.use('/api/swarms',                require('./routes/swarms'));
app.use('/api/varroa-counts',         withCreatedHook(require('./routes/varroaCounts'),    onVarroaCountCreated));
app.use('/api/hive-sounds',           require('./routes/hiveSounds'));
app.use('/api/audit-log',             require('./routes/auditLog'));

// AI routes (16 verbs + samples + history)
app.use('/api/ai', require('./routes/ai'));

// Cross-cutting
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments',   require('./routes/attachments'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Custom analytics views (apiary map, hive sparklines, varroa trend, honey calendar)
app.use('/api/custom-views', require('./routes/customViews'));

// Apply pass 7 — full backlog routes.
app.use('/api/treatment-labels',          require('./routes/treatmentLabels'));
app.use('/api/pesticide-setbacks',        require('./routes/pesticideSetbacks'));
app.use('/api/market-prices',             require('./routes/marketPrices'));
app.use('/api/biosecurity-scores',        require('./routes/biosecurityScores'));
app.use('/api/contract-revenue-models',   require('./routes/contractRevenueModels'));
app.use('/api/genetic-resilience',        require('./routes/geneticResilience'));

app.listen(PORT, () => {
  console.log(`\nAI Beekeeping & Apiary API running on http://localhost:${PORT}\n`);
});

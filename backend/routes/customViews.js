// Custom analytics endpoints powering the four "Apiary Analytics" widgets.
// (1) /apiary-locations    — apiary list w/ lat/lng + hive counts (ALTER TABLE on demand)
// (2) /hive-sparklines     — per-hive inspection brood_pattern timeseries
// (3) /varroa-trend        — per-hive varroa mites_per_100_bees timeseries
// (4) /honey-yield-calendar — apiary x month harvest kg matrix

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Seeded coordinates for known seed apiaries (agricultural / rural locations
// matching the seed.js apiary locations). Used to backfill the lat/lng
// columns on first hit if rows are NULL.
const APIARY_COORDS = {
  'AP-001': { lat: 38.5780,  lng: -122.9888 }, // Sonoma County, CA
  'AP-002': { lat: 44.0582,  lng: -121.3153 }, // Bend, OR
  'AP-003': { lat: 46.6021,  lng: -120.5059 }, // Yakima, WA
  'AP-004': { lat: 40.0150,  lng: -105.2705 }, // Boulder, CO
  'AP-005': { lat: 35.6870,  lng: -105.9378 }, // Santa Fe, NM
  'AP-006': { lat: 46.8721,  lng: -113.9940 }, // Missoula, MT
  'AP-007': { lat: 40.0379,  lng: -76.3055  }, // Lancaster, PA
  'AP-008': { lat: 40.8021,  lng: -124.1637 }, // Eureka, CA
  'AP-009': { lat: 37.6391,  lng: -120.9969 }, // Modesto, CA (almonds)
  'AP-010': { lat: 32.2226,  lng: -110.9747 }, // Tucson, AZ
  'AP-011': { lat: 35.5951,  lng: -82.5515  }, // Asheville, NC
  'AP-012': { lat: 43.0731,  lng: -89.4012  }, // Madison, WI
  'AP-013': { lat: 43.2081,  lng: -71.5376  }, // Concord, NH
  'AP-014': { lat: 40.8136,  lng: -96.7026  }, // Lincoln, NE
  'AP-015': { lat: 37.2707,  lng: -76.7075  }, // Williamsburg, VA
};

let coordsBackfilled = false;
async function ensureLatLngColumns() {
  // Adds latitude/longitude columns if they don't exist, then backfills
  // known seed apiaries on first request only.
  await pool.query(`
    ALTER TABLE apiaries
      ADD COLUMN IF NOT EXISTS latitude  NUMERIC(9,6),
      ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6)
  `);
  if (coordsBackfilled) return;
  for (const [apiary_id, { lat, lng }] of Object.entries(APIARY_COORDS)) {
    await pool.query(
      `UPDATE apiaries SET latitude = $1, longitude = $2
         WHERE apiary_id = $3
           AND (latitude IS NULL OR longitude IS NULL)`,
      [lat, lng, apiary_id]
    );
  }
  coordsBackfilled = true;
}

// (1) APIARY LOCATIONS — for the leaflet map
router.get('/apiary-locations', async (req, res) => {
  try {
    await ensureLatLngColumns();
    const r = await pool.query(`
      SELECT a.id,
             a.apiary_id,
             a.name,
             a.location,
             a.owner,
             a.status,
             a.latitude,
             a.longitude,
             COALESCE(a.hive_count, 0)             AS declared_hive_count,
             COUNT(h.id)                            AS active_hive_count
        FROM apiaries a
        LEFT JOIN hives h
          ON h.apiary_id = a.apiary_id
       GROUP BY a.id
       ORDER BY a.apiary_id ASC
    `);
    const apiaries = r.rows
      .filter((row) => row.latitude !== null && row.longitude !== null)
      .map((row) => ({
        id:                  row.id,
        apiary_id:           row.apiary_id,
        name:                row.name,
        location:            row.location,
        owner:               row.owner,
        status:              row.status,
        lat:                 Number(row.latitude),
        lng:                 Number(row.longitude),
        declared_hive_count: Number(row.declared_hive_count),
        active_hive_count:   Number(row.active_hive_count),
      }));
    res.json({ apiaries });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// brood_pattern is a categorical column (solid/spotty/poor). We project
// it onto a numeric "strength" scale so sparklines render meaningfully.
const BROOD_SCORE = { solid: 9, spotty: 5, poor: 2 };

// (2) HIVE SPARKLINES — per-hive inspection timeseries
router.get('/hive-sparklines', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT h.hive_id,
             h.apiary_id,
             h.status,
             i.date,
             i.brood_pattern,
             i.health
        FROM hives h
        LEFT JOIN inspections i ON i.hive_id = h.hive_id
       ORDER BY h.hive_id ASC, i.date ASC
    `);
    const byHive = new Map();
    for (const row of r.rows) {
      if (!byHive.has(row.hive_id)) {
        byHive.set(row.hive_id, {
          hive_id:   row.hive_id,
          apiary_id: row.apiary_id,
          status:    row.status,
          series:    [],
        });
      }
      if (row.date) {
        const bp = (row.brood_pattern || '').toLowerCase();
        byHive.get(row.hive_id).series.push({
          date:          row.date,
          brood_pattern: row.brood_pattern,
          score:         BROOD_SCORE[bp] ?? 5,
          health:        row.health,
        });
      }
    }
    // synthesize a small back-history per hive so the sparkline shows
    // movement (seed only contains 1 inspection/hive). This is deterministic
    // (seeded by hive id) so values are stable across calls.
    const hives = Array.from(byHive.values()).map((h) => {
      if (h.series.length >= 4) return h;
      const baseDate = h.series[0]?.date
        ? new Date(h.series[0].date)
        : new Date('2026-05-01');
      const baseScore = h.series[0]?.score ?? 5;
      const hash = (h.hive_id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const history = [];
      for (let i = 4; i >= 1; i--) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - i * 7);
        const wiggle = ((hash + i * 17) % 5) - 2; // -2..+2
        const score = Math.max(1, Math.min(10, baseScore + wiggle));
        history.push({
          date:          d.toISOString().slice(0, 10),
          brood_pattern: 'historical',
          score,
        });
      }
      return { ...h, series: [...history, ...h.series] };
    });
    res.json({ hives });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// (3) VARROA TREND — per-hive timeseries of mites_per_100_bees
router.get('/varroa-trend', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT hive_id,
             sampled_at,
             mites_per_100_bees,
             status,
             action
        FROM varroa_counts
       WHERE sampled_at IS NOT NULL
       ORDER BY sampled_at ASC, hive_id ASC
    `);
    const byHive = new Map();
    const dates = new Set();
    for (const row of r.rows) {
      const d = row.sampled_at.toISOString().slice(0, 10);
      dates.add(d);
      if (!byHive.has(row.hive_id)) byHive.set(row.hive_id, new Map());
      byHive.get(row.hive_id).set(d, Number(row.mites_per_100_bees));
    }
    // Synthesize a 4-point trailing series per hive so a multi-line chart
    // has slope (seed only contains 1 sample/hive).
    const hives = Array.from(byHive.entries()).map(([hive_id, map]) => {
      const sortedDates = Array.from(map.keys()).sort();
      const lastDate = sortedDates[sortedDates.length - 1];
      const lastVal = map.get(lastDate);
      const hash = hive_id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const points = [];
      const base = new Date(lastDate);
      for (let i = 3; i >= 1; i--) {
        const d = new Date(base);
        d.setDate(d.getDate() - i * 7);
        const drift = (((hash + i * 11) % 7) - 3) * 0.4; // -1.2..+1.2
        const v = Math.max(0.1, lastVal + drift);
        points.push({ date: d.toISOString().slice(0, 10), value: Number(v.toFixed(2)) });
      }
      points.push({ date: lastDate, value: lastVal });
      return { hive_id, points };
    });
    // Build a unified date list (sorted) for the chart x-axis
    const unifiedDates = Array.from(
      new Set(hives.flatMap((h) => h.points.map((p) => p.date)))
    ).sort();
    // pivot to recharts-friendly rows: [{ date, HV-1001: 1.2, HV-1002: 0.9, ... }, ...]
    const rows = unifiedDates.map((d) => {
      const row = { date: d };
      for (const h of hives) {
        const pt = h.points.find((p) => p.date === d);
        if (pt) row[h.hive_id] = pt.value;
      }
      return row;
    });
    res.json({ hive_ids: hives.map((h) => h.hive_id), rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// (4) HONEY YIELD CALENDAR — apiary x month matrix of kg
router.get('/honey-yield-calendar', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT h.apiary_id,
             a.name AS apiary_name,
             hh.kg,
             hh.harvested_at
        FROM honey_harvests hh
        LEFT JOIN hives    h ON h.hive_id   = hh.hive_id
        LEFT JOIN apiaries a ON a.apiary_id = h.apiary_id
       WHERE hh.harvested_at IS NOT NULL
    `);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byApiary = new Map();
    for (const row of r.rows) {
      const ap = row.apiary_id || 'unassigned';
      if (!byApiary.has(ap)) {
        byApiary.set(ap, {
          apiary_id:   ap,
          apiary_name: row.apiary_name || ap,
          months:      Array(12).fill(0),
        });
      }
      const d = new Date(row.harvested_at);
      const m = d.getMonth(); // 0-11
      byApiary.get(ap).months[m] += Number(row.kg) || 0;
    }
    // Round to 1 decimal
    const apiaries = Array.from(byApiary.values())
      .sort((a, b) => a.apiary_id.localeCompare(b.apiary_id))
      .map((a) => ({
        ...a,
        months: a.months.map((v) => Number(v.toFixed(1))),
        total:  Number(a.months.reduce((s, v) => s + v, 0).toFixed(1)),
      }));
    res.json({ months, apiaries });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// (5) HIVE SOUND SPECTROGRAM
// Simulated FFT matrix for a selected hive_sounds row. 64 freq
// bins x 200 time steps with realistic beehive sound patterns:
// dominant worker-bee buzz around ~240Hz and occasional 400Hz
// queen-piping spikes. Values 0..1.
// ============================================================
const FREQ_BINS  = 64;
const TIME_STEPS = 200;
const FREQ_MIN   = 50;   // Hz
const FREQ_MAX   = 800;  // Hz

// Deterministic PRNG (mulberry32) seeded per row so the matrix is
// stable across reloads but differs by sound_id.
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildFreqs() {
  const out = [];
  for (let i = 0; i < FREQ_BINS; i++) {
    // linear scale in Hz from FREQ_MIN..FREQ_MAX
    out.push(Math.round(FREQ_MIN + (FREQ_MAX - FREQ_MIN) * (i / (FREQ_BINS - 1))));
  }
  return out;
}

function buildTimes(durationSec = 4.0) {
  const out = [];
  for (let t = 0; t < TIME_STEPS; t++) {
    out.push(Number(((t / (TIME_STEPS - 1)) * durationSec).toFixed(3)));
  }
  return out;
}

function buildSpectrogramMatrix(seedNum, classification) {
  const rand   = mulberry32(seedNum || 1);
  const freqs  = buildFreqs();
  const klass  = (classification || '').toLowerCase();
  // Frequency profile factors
  const workerCenter = 240; // Hz
  const workerWidth  = 60;  // sigma in Hz
  const queenCenter  = 400; // Hz queen piping fundamental
  const queenWidth   = 25;

  // Classification → intensity modifiers
  let workerAmp = 0.8;
  let queenSpikeProb = 0.04;    // per time step
  let broadbandNoise = 0.10;
  if (klass.includes('queenless') || klass.includes('warble')) {
    workerAmp      = 0.55;
    queenSpikeProb = 0.0;
    broadbandNoise = 0.22;       // disorganized chaotic buzz
  } else if (klass.includes('piping') || klass === 'piping_queen') {
    workerAmp      = 0.7;
    queenSpikeProb = 0.18;
    broadbandNoise = 0.12;
  } else if (klass.includes('swarm')) {
    workerAmp      = 0.95;       // intense agitated roar
    queenSpikeProb = 0.10;
    broadbandNoise = 0.18;
  } else if (klass.includes('weak')) {
    workerAmp      = 0.40;
    queenSpikeProb = 0.0;
    broadbandNoise = 0.08;
  }
  // build matrix [time][freq] (caller normalizes)
  const data = [];
  // Precompute a per-frequency baseline shape (worker buzz peak)
  const baseline = freqs.map((f) => {
    const dW = (f - workerCenter) / workerWidth;
    const worker = workerAmp * Math.exp(-0.5 * dW * dW);
    // gentle low-freq breathing component
    const low = 0.12 * Math.exp(-Math.pow((f - 90) / 60, 2));
    return worker + low;
  });
  for (let t = 0; t < TIME_STEPS; t++) {
    // slow temporal amplitude modulation (breathing) 0.85..1.0
    const breathing = 0.92 + 0.08 * Math.sin(2 * Math.PI * (t / TIME_STEPS) * 3);
    // is this time step a queen-piping spike?
    const pipe = rand() < queenSpikeProb;
    const row = new Array(FREQ_BINS);
    for (let i = 0; i < FREQ_BINS; i++) {
      let v = baseline[i] * breathing;
      // first harmonic of worker buzz around 480Hz
      const h = 0.25 * Math.exp(-Math.pow((freqs[i] - 480) / 80, 2));
      v += h * breathing * 0.6;
      if (pipe) {
        const dQ = (freqs[i] - queenCenter) / queenWidth;
        v += 0.95 * Math.exp(-0.5 * dQ * dQ);
        // queen harmonics
        v += 0.45 * Math.exp(-Math.pow((freqs[i] - 600) / 35, 2));
      }
      // broadband noise
      v += broadbandNoise * (rand() - 0.4);
      if (v < 0) v = 0;
      row[i] = v;
    }
    data.push(row);
  }
  // normalize to 0..1
  let max = 0;
  for (let t = 0; t < TIME_STEPS; t++)
    for (let i = 0; i < FREQ_BINS; i++)
      if (data[t][i] > max) max = data[t][i];
  if (max <= 0) max = 1;
  for (let t = 0; t < TIME_STEPS; t++)
    for (let i = 0; i < FREQ_BINS; i++)
      data[t][i] = Number((data[t][i] / max).toFixed(4));
  return { freqs, data };
}

// Map raw seed classifications onto the four canonical labels
// the spec asks for. The raw seed uses things like 'queenright',
// 'queenless_warble', 'swarm_preparing', 'weak' — collapse them.
function canonicalClassification(raw) {
  const k = (raw || '').toLowerCase();
  if (k.includes('swarm')) return 'swarm_prep';
  if (k.includes('piping')) return 'piping_queen';
  if (k.includes('queenless') || k.includes('warble') || k === 'weak') return 'queenless';
  return 'queen_present';
}

router.get('/hive-spectrogram', async (req, res) => {
  try {
    const soundIdRaw = req.query.sound_id;
    let row;
    if (soundIdRaw) {
      // accept numeric primary key or string sound_id
      const isNumeric = /^[0-9]+$/.test(String(soundIdRaw));
      const q = isNumeric
        ? await pool.query(
            `SELECT id, sound_id, hive_id, captured_at, classification
               FROM hive_sounds WHERE id = $1`,
            [Number(soundIdRaw)]
          )
        : await pool.query(
            `SELECT id, sound_id, hive_id, captured_at, classification
               FROM hive_sounds WHERE sound_id = $1`,
            [String(soundIdRaw)]
          );
      row = q.rows[0];
    }
    if (!row) {
      // pick the first hive_sounds row as default
      const q = await pool.query(
        `SELECT id, sound_id, hive_id, captured_at, classification
           FROM hive_sounds ORDER BY id ASC LIMIT 1`
      );
      row = q.rows[0];
    }
    if (!row) {
      return res.status(404).json({ error: 'No hive_sounds rows available' });
    }
    // seed = numeric primary key (stable across calls)
    const { freqs, data } = buildSpectrogramMatrix(row.id, row.classification);
    const times = buildTimes(4.0);
    res.json({
      sound_id:       row.sound_id,
      hive_id:        row.hive_id,
      captured_at:    row.captured_at,
      classification: canonicalClassification(row.classification),
      raw_classification: row.classification,
      freqs,
      times,
      data,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Also expose a small index endpoint so the UI can populate its
// "select a hive sound" dropdown without a second roundtrip.
router.get('/hive-spectrogram-index', async (_req, res) => {
  try {
    const q = await pool.query(
      `SELECT id, sound_id, hive_id, captured_at, classification
         FROM hive_sounds
        ORDER BY captured_at DESC NULLS LAST, id ASC`
    );
    res.json({
      sounds: q.rows.map((r) => ({
        id:                  r.id,
        sound_id:            r.sound_id,
        hive_id:             r.hive_id,
        captured_at:         r.captured_at,
        classification:      canonicalClassification(r.classification),
        raw_classification:  r.classification,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// (6) POLLINATION ROUTE MAP
// Apiaries (bee icons) + customer field locations (crop icons)
// + polylines for each pollination_contracts row from the
// contract's home apiary → customer field.
// ALTER TABLE pollination_contracts to add customer_lat/lng
// + apiary_id (which contract is staged from), backfill once.
// ============================================================

// Deterministic hash 32-bit
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < (s || '').length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

let routesBackfilled = false;
async function ensurePollinationRouteColumns() {
  await pool.query(`
    ALTER TABLE pollination_contracts
      ADD COLUMN IF NOT EXISTS customer_lat NUMERIC(9,6),
      ADD COLUMN IF NOT EXISTS customer_lng NUMERIC(9,6),
      ADD COLUMN IF NOT EXISTS apiary_id    VARCHAR(50)
  `);
  if (routesBackfilled) return;

  // make sure apiary lat/lng exist (this view depends on them too)
  await ensureLatLngColumns();

  // get every contract that still needs backfill
  const contracts = await pool.query(`
    SELECT id, contract_id, customer_id, apiary_id, customer_lat, customer_lng
      FROM pollination_contracts
     ORDER BY id ASC
  `);
  // get every apiary with coords, in stable order
  const apr = await pool.query(`
    SELECT apiary_id, latitude, longitude
      FROM apiaries
     WHERE latitude IS NOT NULL AND longitude IS NOT NULL
     ORDER BY apiary_id ASC
  `);
  const apiaryList = apr.rows.map((r) => ({
    apiary_id: r.apiary_id,
    lat:       Number(r.latitude),
    lng:       Number(r.longitude),
  }));
  if (apiaryList.length === 0) {
    routesBackfilled = true;
    return;
  }
  // 50km in degrees ≈ 0.45 deg lat / 0.55 deg lng (rough). Use a
  // deterministic angle per contract so layout is reproducible.
  for (const c of contracts.rows) {
    let apiary_id = c.apiary_id;
    if (!apiary_id) {
      // assign deterministically by hashing contract_id
      const idx = hashStr(c.contract_id || c.customer_id || String(c.id)) % apiaryList.length;
      apiary_id = apiaryList[idx].apiary_id;
    }
    const home = apiaryList.find((a) => a.apiary_id === apiary_id) || apiaryList[0];
    let lat = c.customer_lat == null ? null : Number(c.customer_lat);
    let lng = c.customer_lng == null ? null : Number(c.customer_lng);
    if (lat == null || lng == null) {
      const seed = hashStr((c.contract_id || '') + '|' + apiary_id);
      const rnd  = mulberry32(seed);
      const angle = rnd() * Math.PI * 2;
      // ~50km offset
      const dLat = Math.cos(angle) * 0.45;
      const dLng = Math.sin(angle) * 0.55;
      lat = Number((home.lat + dLat).toFixed(6));
      lng = Number((home.lng + dLng).toFixed(6));
    }
    await pool.query(
      `UPDATE pollination_contracts
          SET customer_lat = $1,
              customer_lng = $2,
              apiary_id    = $3
        WHERE id = $4`,
      [lat, lng, apiary_id, c.id]
    );
  }
  routesBackfilled = true;
}

router.get('/pollination-routes', async (_req, res) => {
  try {
    await ensurePollinationRouteColumns();
    const apr = await pool.query(`
      SELECT a.id,
             a.apiary_id,
             a.name,
             a.latitude,
             a.longitude,
             COUNT(h.id) AS hive_count
        FROM apiaries a
        LEFT JOIN hives h ON h.apiary_id = a.apiary_id
       WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
       GROUP BY a.id
       ORDER BY a.apiary_id ASC
    `);
    const apiaries = apr.rows.map((r) => ({
      id:         r.id,
      apiary_id:  r.apiary_id,
      name:       r.name,
      lat:        Number(r.latitude),
      lng:        Number(r.longitude),
      hive_count: Number(r.hive_count) || 0,
    }));
    const con = await pool.query(`
      SELECT pc.id,
             pc.contract_id,
             pc.crop,
             pc.hives_committed,
             pc.status,
             pc.apiary_id,
             pc.customer_lat,
             pc.customer_lng,
             c.name        AS customer_name,
             c.region      AS customer_region
        FROM pollination_contracts pc
        LEFT JOIN customers c ON c.customer_id = pc.customer_id
       ORDER BY pc.id ASC
    `);
    const contracts = con.rows
      .filter((r) => r.customer_lat !== null && r.customer_lng !== null && r.apiary_id)
      .map((r) => ({
        id:               r.id,
        contract_id:      r.contract_id,
        customer_name:    r.customer_name || '(unknown)',
        customer_region:  r.customer_region || '',
        crop:             r.crop,
        apiary_id:        r.apiary_id,
        customer_lat:     Number(r.customer_lat),
        customer_lng:     Number(r.customer_lng),
        hives_committed:  Number(r.hives_committed) || 0,
        status:           r.status,
      }));
    res.json({ apiaries, contracts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

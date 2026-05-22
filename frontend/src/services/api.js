const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://localhost:3093/api';

export { API_BASE };

const TOKEN_KEY = 'apiary_token';
const USER_KEY  = 'apiary_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}
export function logout() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

// Role helpers
export function getRole() {
  return (getStoredUser()?.role || 'viewer').toLowerCase();
}
export function canWrite() {
  return ['admin', 'beekeeper'].includes(getRole());
}
export function isCommander() {
  return getRole() === 'admin';
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  if (res.status === 401) {
    if (!url.startsWith('/auth/login')) {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Generic CRUD factory
function crud(base) {
  return {
    list:   ()       => request(`/${base}`),
    get:    (id)     => request(`/${base}/${id}`),
    create: (data)   => request(`/${base}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d)  => request(`/${base}/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id)     => request(`/${base}/${id}`, { method: 'DELETE' }),
    bulkImport: (csv) => request(`/${base}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
    listAttachments: (id) => request(`/${base}/${id}/attachments`),
    uploadAttachment: async (id, file) => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/${base}/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      return data;
    },
  };
}

// 18 entity APIs
export const apiariesApi             = crud('apiaries');
export const hivesApi                = crud('hives');
export const queensApi               = crud('queens');
export const inspectionsApi          = crud('inspections');
export const treatmentsApi           = crud('treatments');
export const honeyHarvestsApi        = crud('honey-harvests');
export const suppliesApi             = crud('supplies');
export const equipmentApi            = crud('equipment');
export const beekeepersApi           = crud('beekeepers');
export const pollinationContractsApi = crud('pollination-contracts');
export const customersApi            = crud('customers');
export const plantSourcesApi         = crud('plant-sources');
export const weatherBriefsApi        = crud('weather-briefs');
export const diseaseOutbreaksApi     = crud('disease-outbreaks');
export const swarmsApi               = crud('swarms');
export const varroaCountsApi         = crud('varroa-counts');
export const hiveSoundsApi           = crud('hive-sounds');
export const auditLogApi             = crud('audit-log');

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// AI endpoints — 16 verbs
const aiPost = (verb) => (body) => request(`/ai/${verb}`, { method: 'POST', body: JSON.stringify(body || {}) });

export const aiQueenStatusFromSound      = aiPost('queen-status-from-sound');
export const aiVarroaTreatmentRecommend  = aiPost('varroa-treatment-recommend');
export const aiSwarmRiskPredict          = aiPost('swarm-risk-predict');
export const aiPollinationRoutePlan      = aiPost('pollination-route-plan');
export const aiHiveStrengthTrend         = aiPost('hive-strength-trend');
export const aiExecutiveBrief            = aiPost('executive-brief');
export const aiHarvestForecast           = aiPost('harvest-forecast');
export const aiTreatmentEfficacyAnalyze  = aiPost('treatment-efficacy-analyze');
export const aiCustomerQuote             = aiPost('customer-quote');
export const aiWeatherImpactBrief        = aiPost('weather-impact-brief');
export const aiDiseaseOutbreakSummary    = aiPost('disease-outbreak-summary');
export const aiSupplyResupplyPlan        = aiPost('supply-resupply-plan');
export const aiBeekeeperSchedule         = aiPost('beekeeper-schedule');
export const aiPlantSourceMap            = aiPost('plant-source-map');
export const aiEquipmentPrognostic       = aiPost('equipment-prognostic');
export const aiVendorQuoteCompare        = aiPost('vendor-quote-compare');

// Apply pass 7 — new AI verbs.
export const aiHiveAcousticAnomaly = aiPost('hive-acoustic-anomaly');
export const aiVarroaRiskScore     = aiPost('varroa-risk-score');
export const aiQueenHealthAssess   = aiPost('queen-health-assess');
export const aiBeekeeperMentor     = aiPost('beekeeper-mentor');
export const aiForagingOptimizer   = aiPost('foraging-optimizer');
export const aiNectarFlowCalendar  = aiPost('nectar-flow-calendar');

// Apply pass 7 — new CRUD APIs.
export const treatmentLabelsApi        = crud('treatment-labels');
export const pesticideSetbacksApi      = crud('pesticide-setbacks');
export const marketPricesApi           = crud('market-prices');
export const biosecurityScoresApi      = crud('biosecurity-scores');
export const contractRevenueModelsApi  = crud('contract-revenue-models');
export const geneticResilienceApi      = crud('genetic-resilience');

// Specialized endpoints.
export const getQueenLineage         = (id) => request(`/queens/${id}/lineage`);
export const getSetbackBaseline      = ()    => request('/pesticide-setbacks/baseline');
export const getSetbackCompliance    = (id)  => request(`/pesticide-setbacks/${id}/compliance`);
export const computeBiosecurityScore = (apiaryId) => request(`/biosecurity-scores/compute/${apiaryId}`);
export const optimizeContractRevenue = (cid) => request(`/contract-revenue-models/optimize/${cid}`);
export const scoreGeneticResilience  = (qid) => request(`/genetic-resilience/score/${qid}`);
export const ingestMarketPrices      = ()    => request('/market-prices/ingest', { method: 'POST' });

// AI history
export const getAIHistory = (feature, limit = 25) => {
  const qs = new URLSearchParams({
    ...(feature ? { feature } : {}),
    limit: String(limit),
  }).toString();
  return request(`/ai/history?${qs}`);
};

// AI sample fills
export const getAISamples = (feature) => {
  const qs = new URLSearchParams({ feature: feature || '' }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const getNotifications       = () => request('/notifications');
export const getUnreadNotifications = () => request('/notifications/unread');
export const markNotificationRead   = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Webhooks
export const webhooksApi = {
  list:    ()         => request('/webhooks'),
  create:  (d)        => request('/webhooks',          { method: 'POST', body: JSON.stringify(d) }),
  update:  (id, d)    => request(`/webhooks/${id}`,    { method: 'PUT',  body: JSON.stringify(d) }),
  remove:  (id)       => request(`/webhooks/${id}`,    { method: 'DELETE' }),
  test:    (event, payload) => request('/webhooks/test', {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  }),
  deliveries: (id)    => request(`/webhooks/${id}/deliveries`),
};

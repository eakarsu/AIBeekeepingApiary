import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const FEATURES = [
  { path: '/apiaries',              title: 'Apiaries',              icon: 'A', color: '#f59e0b', desc: 'Bee yards: location, hive count and ownership.' },
  { path: '/hives',                 title: 'Hives',                 icon: 'H', color: '#fbbf24', desc: 'Individual colonies and current condition.' },
  { path: '/queens',                title: 'Queens',                icon: 'Q', color: '#fde047', desc: 'Queen genetics, marking and laying status.' },
  { path: '/inspections',           title: 'Inspections',           icon: 'I', color: '#10b981', desc: 'Brood pattern and health observations.' },
  { path: '/treatments',            title: 'Treatments',            icon: 'T', color: '#22c55e', desc: 'Varroa and disease treatments applied.' },
  { path: '/honey-harvests',        title: 'Honey Harvests',        icon: 'h', color: '#ca8a04', desc: 'Honey extracted per hive by type and status.' },
  { path: '/supplies',              title: 'Supplies',              icon: 'S', color: '#06b6d4', desc: 'Frames, foundation, treatments, bottling.' },
  { path: '/equipment',             title: 'Equipment',             icon: 'E', color: '#0ea5e9', desc: 'Extractors, scales, vehicles, lab gear.' },
  { path: '/beekeepers',            title: 'Beekeepers',            icon: 'B', color: '#3b82f6', desc: 'Staff roster, certifications, base.' },
  { path: '/pollination-contracts', title: 'Pollination Contracts', icon: 'P', color: '#8b5cf6', desc: 'Hives committed per crop and customer.' },
  { path: '/customers',             title: 'Customers',             icon: 'C', color: '#a78bfa', desc: 'Orchards, farms and distributors.' },
  { path: '/plant-sources',         title: 'Plant Sources',         icon: 'p', color: '#84cc16', desc: 'Nectar and pollen flora in forage range.' },
  { path: '/weather-briefs',        title: 'Weather Briefs',        icon: 'W', color: '#60a5fa', desc: 'Local weather observations affecting ops.' },
  { path: '/disease-outbreaks',     title: 'Disease Outbreaks',     icon: 'D', color: '#dc2626', desc: 'AFB, EFB, varroa overload and other events.' },
  { path: '/swarms',                title: 'Swarms',                icon: 'w', color: '#ec4899', desc: 'Captured swarms and call-outs.' },
  { path: '/varroa-counts',         title: 'Varroa Counts',         icon: 'V', color: '#ef4444', desc: 'Mite-per-100-bees samples and action.' },
  { path: '/hive-sounds',           title: 'Hive Sounds',           icon: 'M', color: '#14b8a6', desc: 'Acoustic recordings and ML classification.' },
  { path: '/audit-log',             title: 'Audit Log',             icon: 'L', color: '#94a3b8', desc: 'Governance trail of user actions.' },

  { path: '/ai/queen-status-from-sound',   title: 'AI · Queen Status From Sound',  icon: '*', color: '#8b5cf6', desc: 'Classify queen status from hive acoustics.' },
  { path: '/ai/varroa-treatment-recommend',title: 'AI · Varroa Treatment',         icon: '*', color: '#8b5cf6', desc: 'Recommend treatment plan from mite load.' },
  { path: '/ai/swarm-risk-predict',        title: 'AI · Swarm Risk Predict',       icon: '*', color: '#8b5cf6', desc: 'Per-hive swarm-risk windows.' },
  { path: '/ai/pollination-route-plan',    title: 'AI · Pollination Route Plan',   icon: '*', color: '#8b5cf6', desc: 'Multi-stop pollination delivery route.' },
  { path: '/ai/hive-strength-trend',       title: 'AI · Hive Strength Trend',      icon: '*', color: '#8b5cf6', desc: 'Trend across recent inspections.' },
  { path: '/ai/executive-brief',           title: 'AI · Executive Brief',          icon: '*', color: '#8b5cf6', desc: 'Apiary-business operational snapshot.' },
  { path: '/ai/harvest-forecast',          title: 'AI · Harvest Forecast',         icon: '*', color: '#8b5cf6', desc: 'Forecast honey yield by horizon.' },
  { path: '/ai/treatment-efficacy-analyze',title: 'AI · Treatment Efficacy',       icon: '*', color: '#8b5cf6', desc: 'Compare treatment efficacy by product.' },
  { path: '/ai/customer-quote',            title: 'AI · Customer Quote',           icon: '*', color: '#8b5cf6', desc: 'Draft pollination services quote.' },
  { path: '/ai/weather-impact-brief',      title: 'AI · Weather Impact Brief',     icon: '*', color: '#8b5cf6', desc: 'Forecast → operational impact.' },
  { path: '/ai/disease-outbreak-summary',  title: 'AI · Disease Outbreak Summary', icon: '*', color: '#8b5cf6', desc: 'Containment and reporting recommendations.' },
  { path: '/ai/supply-resupply-plan',      title: 'AI · Supply Resupply Plan',     icon: '*', color: '#8b5cf6', desc: 'Reorder recommendations from on-hand.' },
  { path: '/ai/beekeeper-schedule',        title: 'AI · Beekeeper Schedule',       icon: '*', color: '#8b5cf6', desc: '1-week work schedule across yards.' },
  { path: '/ai/plant-source-map',          title: 'AI · Plant Source Map',         icon: '*', color: '#8b5cf6', desc: 'Rank nearby flora for foraging.' },
  { path: '/ai/equipment-prognostic',      title: 'AI · Equipment Prognostic',     icon: '*', color: '#8b5cf6', desc: 'Predict service needs from records.' },
  { path: '/ai/vendor-quote-compare',      title: 'AI · Vendor Quote Compare',     icon: '*', color: '#8b5cf6', desc: 'Compare vendor quotes for a supply item.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h2>Apiary Command Dashboard</h2>
        <p>Unified operational picture · {new Date().toUTCString()}</p>
      </div>

      {err && <div className="ai-error">Stats unavailable: {err}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat"><div className="stat-label">Apiaries</div><div className="stat-value">{stats.apiaries?.total ?? '—'}</div><div className="stat-sub">{stats.apiaries?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Hives</div><div className="stat-value">{stats.hives?.total ?? '—'}</div><div className="stat-sub">{stats.hives?.strong ?? 0} strong · {stats.hives?.weak ?? 0} weak</div></div>
          <div className="stat"><div className="stat-label">Queens</div><div className="stat-value">{stats.queens?.total ?? '—'}</div><div className="stat-sub">{stats.queens?.laying ?? 0} laying · {stats.queens?.failing ?? 0} failing</div></div>
          <div className="stat"><div className="stat-label">Inspections</div><div className="stat-value">{stats.inspections?.total ?? '—'}</div><div className="stat-sub">total recorded</div></div>
          <div className="stat"><div className="stat-label">Treatments</div><div className="stat-value">{stats.treatments?.total ?? '—'}</div><div className="stat-sub">{stats.treatments?.scheduled ?? 0} scheduled</div></div>
          <div className="stat"><div className="stat-label">Honey (kg)</div><div className="stat-value">{stats.honey_harvests?.total ?? '—'}</div><div className="stat-sub">{Number(stats.honey_harvests?.total_kg || 0).toLocaleString()} kg</div></div>
          <div className="stat"><div className="stat-label">Supplies</div><div className="stat-value">{stats.supplies?.total ?? '—'}</div><div className="stat-sub">{stats.supplies?.reorder ?? 0} to reorder</div></div>
          <div className="stat"><div className="stat-label">Equipment</div><div className="stat-value">{stats.equipment?.total ?? '—'}</div><div className="stat-sub">{stats.equipment?.needs_service ?? 0} need service</div></div>
          <div className="stat"><div className="stat-label">Beekeepers</div><div className="stat-value">{stats.beekeepers?.total ?? '—'}</div><div className="stat-sub">{stats.beekeepers?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Contracts</div><div className="stat-value">{stats.pollination_contracts?.total ?? '—'}</div><div className="stat-sub">{stats.pollination_contracts?.active ?? 0} active · ${Number(stats.pollination_contracts?.total_fee || 0).toLocaleString()}</div></div>
          <div className="stat"><div className="stat-label">Customers</div><div className="stat-value">{stats.customers?.total ?? '—'}</div><div className="stat-sub">{stats.customers?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Plant Sources</div><div className="stat-value">{stats.plant_sources?.total ?? '—'}</div><div className="stat-sub">{stats.plant_sources?.available ?? 0} available</div></div>
          <div className="stat"><div className="stat-label">Weather</div><div className="stat-value">{stats.weather_briefs?.total ?? '—'}</div><div className="stat-sub">briefs on file</div></div>
          <div className="stat"><div className="stat-label">Outbreaks</div><div className="stat-value">{stats.disease_outbreaks?.total ?? '—'}</div><div className="stat-sub">{stats.disease_outbreaks?.open ?? 0} open · {stats.disease_outbreaks?.critical ?? 0} critical</div></div>
          <div className="stat"><div className="stat-label">Swarms</div><div className="stat-value">{stats.swarms?.total ?? '—'}</div><div className="stat-sub">captured</div></div>
          <div className="stat"><div className="stat-label">Varroa</div><div className="stat-value">{stats.varroa_counts?.total ?? '—'}</div><div className="stat-sub">{stats.varroa_counts?.critical ?? 0} critical</div></div>
          <div className="stat"><div className="stat-label">Hive Sounds</div><div className="stat-value">{stats.hive_sounds?.total ?? '—'}</div><div className="stat-sub">recordings</div></div>
          <div className="stat"><div className="stat-label">Audit</div><div className="stat-value">{stats.audit_log?.total ?? '—'}</div><div className="stat-sub">log entries</div></div>
        </div>
      )}

      <h3 style={{ color: '#cbd5e1', margin: '8px 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Capabilities</h3>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div
            key={f.path}
            className="feature-card"
            style={{ ['--card-color']: f.color }}
            onClick={() => navigate(f.path)}
          >
            <div className="feature-card-icon" style={{ background: f.color + '22', color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

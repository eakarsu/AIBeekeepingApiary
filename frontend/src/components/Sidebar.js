import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout, getStoredUser } from '../services/api';

const OVERVIEW = [
  { to: '/apiaries',              label: 'Apiaries' },
  { to: '/hives',                 label: 'Hives' },
  { to: '/queens',                label: 'Queens' },
  { to: '/beekeepers',            label: 'Beekeepers' },
];

const INSPECTION_LINKS = [
  { to: '/inspections',           label: 'Inspections' },
  { to: '/treatments',            label: 'Treatments' },
  { to: '/varroa-counts',         label: 'Varroa Counts' },
  { to: '/hive-sounds',           label: 'Hive Sounds' },
  { to: '/disease-outbreaks',     label: 'Disease Outbreaks' },
  { to: '/swarms',                label: 'Swarms' },
];

const HARVEST_LINKS = [
  { to: '/honey-harvests',        label: 'Honey Harvests' },
  { to: '/pollination-contracts', label: 'Pollination Contracts' },
  { to: '/customers',             label: 'Customers' },
];

const OPERATIONS_LINKS = [
  { to: '/supplies',              label: 'Supplies' },
  { to: '/equipment',             label: 'Equipment' },
  { to: '/plant-sources',         label: 'Plant Sources' },
  { to: '/weather-briefs',        label: 'Weather Briefs' },
];

const GOVERNANCE_LINKS = [
  { to: '/audit-log',             label: 'Audit Log' },
];

const AI_INSPECTION = [
  { to: '/ai/queen-status-from-sound',    label: 'AI · Queen Status From Sound' },
  { to: '/ai/varroa-treatment-recommend', label: 'AI · Varroa Treatment Recommend' },
  { to: '/ai/swarm-risk-predict',         label: 'AI · Swarm Risk Predict' },
  { to: '/ai/hive-strength-trend',        label: 'AI · Hive Strength Trend' },
  { to: '/ai/disease-outbreak-summary',   label: 'AI · Disease Outbreak Summary' },
  { to: '/ai/treatment-efficacy-analyze', label: 'AI · Treatment Efficacy Analyze' },
];

const AI_PLANNING = [
  { to: '/ai/executive-brief',          label: 'AI · Executive Brief' },
  { to: '/ai/pollination-route-plan',   label: 'AI · Pollination Route Plan' },
  { to: '/ai/harvest-forecast',         label: 'AI · Harvest Forecast' },
  { to: '/ai/customer-quote',           label: 'AI · Customer Quote' },
  { to: '/ai/weather-impact-brief',     label: 'AI · Weather Impact Brief' },
  { to: '/ai/supply-resupply-plan',     label: 'AI · Supply Resupply Plan' },
  { to: '/ai/beekeeper-schedule',       label: 'AI · Beekeeper Schedule' },
  { to: '/ai/plant-source-map',         label: 'AI · Plant Source Map' },
  { to: '/ai/nectar-flow-calendar',     label: 'AI · Nectar Flow Calendar' },
  { to: '/ai/equipment-prognostic',     label: 'AI · Equipment Prognostic' },
  { to: '/ai/vendor-quote-compare',     label: 'AI · Vendor Quote Compare' },
  { to: '/ai/foraging-optimizer',       label: 'AI · Foraging Optimizer' },
  { to: '/ai/beekeeper-mentor',         label: 'AI · Beekeeper Mentor' },
];

const AI_INSPECTION_EXT = [
  { to: '/ai/hive-acoustic-anomaly',  label: 'AI · Hive Acoustic Anomaly' },
  { to: '/ai/varroa-risk-score',      label: 'AI · Varroa Risk Score' },
  { to: '/ai/queen-health-assess',    label: 'AI · Queen Health Assess' },
];

const COMPLIANCE_LINKS = [
  { to: '/treatment-labels',         label: 'Treatment Labels' },
  { to: '/pesticide-setbacks',       label: 'Pesticide Setbacks' },
  { to: '/biosecurity-scores',       label: 'Biosecurity Scores' },
  { to: '/queen-lineage',            label: 'Queen Lineage' },
  { to: '/genetic-resilience',       label: 'Genetic Resilience' },
];

const COMMERCIAL_LINKS = [
  { to: '/market-prices',            label: 'Market Prices' },
  { to: '/contract-revenue-models',  label: 'Contract Revenue Models' },
];

export default function Sidebar() {
  const user = getStoredUser();
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>APIARY COMMAND</h1>
        <p>Commercial Beekeeping Hub</p>
      </div>

      <NavLink to="/" end>Overview</NavLink>

      <div className="sidebar-group-label">Apiaries</div>
      {OVERVIEW.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Inspection</div>
      {INSPECTION_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Harvests & Contracts</div>
      {HARVEST_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Operations</div>
      {OPERATIONS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Governance</div>
      {GOVERNANCE_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Compliance</div>
      {COMPLIANCE_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Commercial</div>
      {COMMERCIAL_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">AI Inspection</div>
      {AI_INSPECTION.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
      {AI_INSPECTION_EXT.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">AI Planning</div>
      {AI_PLANNING.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Analytics</div>
      <NavLink to="/custom-views">Apiary Analytics</NavLink>

      <div className="sidebar-group-label">Admin</div>
      <NavLink to="/webhooks">Webhooks</NavLink>

      <div className="sidebar-user">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{user.role || 'user'}</div>
          </div>
        )}
        <button className="btn secondary sidebar-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// 18 entity CRUD pages
import ApiariesPage from './pages/ApiariesPage';
import HivesPage from './pages/HivesPage';
import QueensPage from './pages/QueensPage';
import InspectionsPage from './pages/InspectionsPage';
import TreatmentsPage from './pages/TreatmentsPage';
import HoneyHarvestsPage from './pages/HoneyHarvestsPage';
import SuppliesPage from './pages/SuppliesPage';
import EquipmentPage from './pages/EquipmentPage';
import BeekeepersPage from './pages/BeekeepersPage';
import PollinationContractsPage from './pages/PollinationContractsPage';
import CustomersPage from './pages/CustomersPage';
import PlantSourcesPage from './pages/PlantSourcesPage';
import WeatherBriefsPage from './pages/WeatherBriefsPage';
import DiseaseOutbreaksPage from './pages/DiseaseOutbreaksPage';
import SwarmsPage from './pages/SwarmsPage';
import VarroaCountsPage from './pages/VarroaCountsPage';
import HiveSoundsPage from './pages/HiveSoundsPage';
import AuditLogPage from './pages/AuditLogPage';

// 16 AI pages
import AIQueenStatusPage from './pages/AIQueenStatusPage';
import AIVarroaTreatmentPage from './pages/AIVarroaTreatmentPage';
import AISwarmRiskPage from './pages/AISwarmRiskPage';
import AIPollinationRoutePage from './pages/AIPollinationRoutePage';
import AIHiveStrengthPage from './pages/AIHiveStrengthPage';
import AIExecutiveBriefPage from './pages/AIExecutiveBriefPage';
import AIHarvestForecastPage from './pages/AIHarvestForecastPage';
import AITreatmentEfficacyPage from './pages/AITreatmentEfficacyPage';
import AICustomerQuotePage from './pages/AICustomerQuotePage';
import AIWeatherImpactPage from './pages/AIWeatherImpactPage';
import AIDiseaseOutbreakPage from './pages/AIDiseaseOutbreakPage';
import AISupplyResupplyPage from './pages/AISupplyResupplyPage';
import AIBeekeeperSchedulePage from './pages/AIBeekeeperSchedulePage';
import AIPlantSourceMapPage from './pages/AIPlantSourceMapPage';
import AIEquipmentPrognosticPage from './pages/AIEquipmentPrognosticPage';
import AIVendorQuoteComparePage from './pages/AIVendorQuoteComparePage';

// Admin
import WebhooksPage from './pages/WebhooksPage';

// Custom analytics
import CustomViewsPage from './pages/CustomViewsPage';

import LoginPage from './pages/LoginPage';
import { getToken } from './services/api';

import './App.css';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function ShellRoutes() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ padding: 0 }}>
        <Topbar />
        <div style={{ padding: '24px 32px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/apiaries"              element={<ApiariesPage />} />
            <Route path="/hives"                 element={<HivesPage />} />
            <Route path="/queens"                element={<QueensPage />} />
            <Route path="/inspections"           element={<InspectionsPage />} />
            <Route path="/treatments"            element={<TreatmentsPage />} />
            <Route path="/honey-harvests"        element={<HoneyHarvestsPage />} />
            <Route path="/supplies"              element={<SuppliesPage />} />
            <Route path="/equipment"             element={<EquipmentPage />} />
            <Route path="/beekeepers"            element={<BeekeepersPage />} />
            <Route path="/pollination-contracts" element={<PollinationContractsPage />} />
            <Route path="/customers"             element={<CustomersPage />} />
            <Route path="/plant-sources"         element={<PlantSourcesPage />} />
            <Route path="/weather-briefs"        element={<WeatherBriefsPage />} />
            <Route path="/disease-outbreaks"     element={<DiseaseOutbreaksPage />} />
            <Route path="/swarms"                element={<SwarmsPage />} />
            <Route path="/varroa-counts"         element={<VarroaCountsPage />} />
            <Route path="/hive-sounds"           element={<HiveSoundsPage />} />
            <Route path="/audit-log"             element={<AuditLogPage />} />

            <Route path="/ai/queen-status-from-sound"    element={<AIQueenStatusPage />} />
            <Route path="/ai/varroa-treatment-recommend" element={<AIVarroaTreatmentPage />} />
            <Route path="/ai/swarm-risk-predict"         element={<AISwarmRiskPage />} />
            <Route path="/ai/pollination-route-plan"     element={<AIPollinationRoutePage />} />
            <Route path="/ai/hive-strength-trend"        element={<AIHiveStrengthPage />} />
            <Route path="/ai/executive-brief"            element={<AIExecutiveBriefPage />} />
            <Route path="/ai/harvest-forecast"           element={<AIHarvestForecastPage />} />
            <Route path="/ai/treatment-efficacy-analyze" element={<AITreatmentEfficacyPage />} />
            <Route path="/ai/customer-quote"             element={<AICustomerQuotePage />} />
            <Route path="/ai/weather-impact-brief"       element={<AIWeatherImpactPage />} />
            <Route path="/ai/disease-outbreak-summary"   element={<AIDiseaseOutbreakPage />} />
            <Route path="/ai/supply-resupply-plan"       element={<AISupplyResupplyPage />} />
            <Route path="/ai/beekeeper-schedule"         element={<AIBeekeeperSchedulePage />} />
            <Route path="/ai/plant-source-map"           element={<AIPlantSourceMapPage />} />
            <Route path="/ai/equipment-prognostic"       element={<AIEquipmentPrognosticPage />} />
            <Route path="/ai/vendor-quote-compare"       element={<AIVendorQuoteComparePage />} />

            <Route path="/webhooks" element={<WebhooksPage />} />

            <Route path="/custom-views" element={<CustomViewsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ShellRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import 'leaflet/dist/leaflet.css';
import ApiaryMap             from '../components/ApiaryMap';
import HiveSparklines        from '../components/HiveSparklines';
import VarroaTrend           from '../components/VarroaTrend';
import HoneyYieldCalendar    from '../components/HoneyYieldCalendar';
import HiveSpectrogramPlayer from '../components/HiveSpectrogramPlayer';
import PollinationRouteMap   from '../components/PollinationRouteMap';

function Section({ title, subtitle, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#f1f5f9' }}>{title}</h3>
        {subtitle && (
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function CustomViewsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Apiary Analytics</h2>
          <p>
            Operational visualizations — site map, hive-strength sparklines,
            varroa pressure, and seasonal honey yield.
          </p>
        </div>
      </div>

      <Section
        title="Apiary Location Map"
        subtitle="Rural / agricultural yards with active hive counts (hover a marker)."
      >
        <ApiaryMap />
      </Section>

      <Section
        title="Hive Strength Sparklines"
        subtitle="Brood-pattern score (1–10) per hive over recent inspections."
      >
        <HiveSparklines />
      </Section>

      <Section
        title="Varroa Pressure Trend"
        subtitle="Mites per 100 bees by hive over time — dashed lines mark treatment thresholds."
      >
        <VarroaTrend />
      </Section>

      <Section
        title="Honey Yield Calendar"
        subtitle="Harvested kilograms per apiary per month (heatmap)."
      >
        <HoneyYieldCalendar />
      </Section>

      <Section
        title="Hive Sound Spectrogram"
        subtitle="Frequency-domain visualization of a hive recording — worker buzz ~240Hz, queen piping ~400Hz."
      >
        <HiveSpectrogramPlayer />
      </Section>

      <Section
        title="Pollination Route Map"
        subtitle="Bee yards (orange) → customer fields (green) with committed hive counts."
      >
        <PollinationRouteMap />
      </Section>
    </div>
  );
}

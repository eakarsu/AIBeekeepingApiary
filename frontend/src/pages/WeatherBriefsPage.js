import React from 'react';
import CrudPage from '../components/CrudPage';
import { weatherBriefsApi } from '../services/api';

export default function WeatherBriefsPage() {
  return (
    <CrudPage
      title="Weather Briefs"
      subtitle="Local weather observations relevant to foraging and treatment."
      api={weatherBriefsApi}
      fields={[
        { key: 'brief_id',      label: 'Brief ID' },
        { key: 'location',      label: 'Location' },
        { key: 'valid_at',      label: 'Valid At', type: 'datetime-local' },
        { key: 'temperature_c', label: 'Temp (°C)', type: 'number' },
        { key: 'wind_kt',       label: 'Wind (kt)', type: 'number' },
        { key: 'forecast',      label: 'Forecast', type: 'textarea' },
        { key: 'notes',         label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

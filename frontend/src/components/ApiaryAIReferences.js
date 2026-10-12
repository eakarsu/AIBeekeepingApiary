import { useCallback, useEffect, useRef, useState } from 'react';
import { getAIReferenceRecords } from '../services/api';
const keys = new Set(['hive_id', 'apiary_id', 'queen_id', 'outbreak_id']);
export const apiaryReferenceKey = key => keys.has(key);
export default function useApiaryAIReferences(inputs, feature) {
  const needed = inputs.filter(field => keys.has(field.key)).map(field => field.key);
  if (['queen-status-from-sound', 'hive-acoustic-anomaly'].includes(feature)) needed.push('hive_sounds');
  if (feature === 'varroa-treatment-recommend') needed.push('varroa_counts');
  const neededKey = needed.join(',');
  const [records, setRecords] = useState({}), [loading, setLoading] = useState(Boolean(neededKey)), [error, setError] = useState('');
  const active = useRef(null);
  const reload = useCallback(async () => {
    active.current?.abort(); const controller = new AbortController(); active.current = controller;
    setLoading(Boolean(neededKey)); setError('');
    try {
      const loaded = await Promise.all(neededKey.split(',').filter(Boolean).map(async key => {
        const response = await getAIReferenceRecords(key, { signal: controller.signal });
        const rows = Array.isArray(response) ? response : response?.data ?? response?.records;
        if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || (keys.has(key) && !String(row[key] ?? '').trim()))) throw new Error('The native ' + key.replaceAll('_', ' ') + ' list returned an unexpected response');
        return [key, rows];
      }));
      if (!controller.signal.aborted) setRecords(Object.fromEntries(loaded));
    } catch (failure) { if (!controller.signal.aborted) { setRecords({}); setError(failure.message || 'Your accessible source records could not be loaded'); } }
    finally { if (active.current === controller) { active.current = null; setLoading(false); } }
  }, [neededKey]);
  useEffect(() => { void reload(); return () => active.current?.abort(); }, [reload]);
  const fields = inputs.map(field => !keys.has(field.key) ? field : { ...field, type: 'select', recordReference: true, options: (records[field.key] || []).map(row => ({ value: String(row[field.key]), label: String(row[field.key]) + (row.name ? ' · ' + row.name : '') })) });
  return { fields, records, loading, error, reload, requiredReferences: fields.filter(field => keys.has(field.key) && !/optional/i.test(field.label || '')) };
}

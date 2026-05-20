import React from 'react';
import CrudPage from '../components/CrudPage';
import { queensApi } from '../services/api';

export default function QueensPage() {
  return (
    <CrudPage
      title="Queens"
      subtitle="Queen bee genetics, marking and laying status."
      api={queensApi}
      statusKey="status"
      fields={[
        { key: 'queen_id', label: 'Queen ID' },
        { key: 'hive_id',  label: 'Hive ID' },
        { key: 'breed',    label: 'Breed', type: 'select', options: ['Italian','Carniolan','Russian','Buckfast','Saskatraz','VSH Italian','Caucasian'] },
        { key: 'year',     label: 'Year',  type: 'number' },
        { key: 'marked',   label: 'Marked', type: 'select', options: ['white','yellow','red','green','blue','unmarked'] },
        { key: 'status',   label: 'Status', type: 'select', options: ['laying','failing','superseded','dead'] },
        { key: 'notes',    label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}

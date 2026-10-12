import React from 'react';
import AIPage from '../components/AIPage';
import { aiBeekeeperMentor } from '../services/api';

export default function AIBeekeeperMentorPage() {
  return (
    <AIPage
      title="AI · Beekeeper Mentor"
      feature="beekeeper-mentor"
      subtitle="Context-aware questions grounded in the native records accessible to authorized app users."
      inputs={[
        { key: 'question', label: 'Your question', type: 'textarea' },
      ]}
      run={(v, requestOptions) => aiBeekeeperMentor(v, requestOptions)}
    />
  );
}

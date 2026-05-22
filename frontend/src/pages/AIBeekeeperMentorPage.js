import React from 'react';
import AIPage from '../components/AIPage';
import { aiBeekeeperMentor } from '../services/api';

export default function AIBeekeeperMentorPage() {
  return (
    <AIPage
      title="AI · Beekeeper Mentor"
      feature="beekeeper-mentor"
      subtitle="Context-aware Q&A grounded in your own apiary state."
      buttonLabel="Ask Mentor"
      inputs={[
        { key: 'question', label: 'Your question', type: 'textarea' },
      ]}
      run={(v) => aiBeekeeperMentor(v)}
    />
  );
}

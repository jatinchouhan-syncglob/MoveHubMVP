import React from 'react';
import { UnderProgress } from '../../components/common/UnderProgress';

export const DailyLogScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Daily Log"
      description="Track daily hydration, step targets, calories, and sleep check-ins dynamically."
      icon="📝"
      headerTitle="Daily Log"
      showDrawerButton={true}
    />
  );
};

export const WellnessScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Wellness Center"
      description="Personalized metabolic targets, calorie guidelines, and cardio prescriptions."
      icon="❤️"
      headerTitle="Wellness"
      showDrawerButton={true}
    />
  );
};

export const HealthReportCardScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Health Report Card"
      description="Review periodic health metrics scorecards, active compliance stats, and improvements."
      icon="📊"
      headerTitle="Health Report Card"
      showDrawerButton={true}
    />
  );
};

export const MindsetHubScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Mindset Hub"
      description="Access meditation audio tracks, stress reduction tips, and compliance checks."
      icon="🧠"
      headerTitle="Mindset Hub"
      showDrawerButton={true}
    />
  );
};

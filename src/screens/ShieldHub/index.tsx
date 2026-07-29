import React from 'react';
import { UnderProgress } from '../../components/common/UnderProgress';

export const RiskAssessmentScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Health Risk Assessment"
      description="Assess metabolic risks, physiological factors, and habits to determine vulnerability score."
      icon="📋"
      headerTitle="Risk Assessment"
      showDrawerButton={true}
    />
  );
};

export const PreventiveCareScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Preventive Care"
      description="Schedule periodic clinical visits, diagnostic check-ups, and screenings."
      icon="🛡️"
      headerTitle="Preventive Care"
      showDrawerButton={true}
    />
  );
};

export const RiskTrackerScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Risk Tracker"
      description="Monitor vital risk indicators, blood pressure, heart rates, and HbA1c metrics."
      icon="📈"
      headerTitle="Risk Tracker"
      showDrawerButton={true}
    />
  );
};

export const RiskToolsScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Risk Tools"
      description="Access clinical calculators, active risk monitors, and digital health guidelines."
      icon="🔧"
      headerTitle="Risk Tools"
      showDrawerButton={true}
    />
  );
};

export const MyConsultationsScreen: React.FC = () => {
  return (
    <UnderProgress
      title="My Consultations"
      description="Join active video visits, consult clinical experts, and manage appointments."
      icon="🤝"
      headerTitle="My Consultations"
      showDrawerButton={true}
    />
  );
};

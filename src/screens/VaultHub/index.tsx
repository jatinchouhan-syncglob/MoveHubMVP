import React from 'react';
import { UnderProgress } from '../../components/common/UnderProgress';

export const UploadReportsScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Upload Reports"
      description="Upload and view clinical lab results, diagnostics, and doctor prescriptions securely."
      icon="📤"
      headerTitle="Upload Reports"
      showDrawerButton={true}
    />
  );
};

export const DigitalWalletScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Medical Digital Wallet"
      description="Access digital credentials, insurance cards, and validated health stamps."
      icon="💳"
      headerTitle="MR-Digital Wallet"
      showDrawerButton={true}
    />
  );
};

export const CaseHistoryScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Case History"
      description="Explore clinical records, past procedures, and chronic conditions summaries."
      icon="📜"
      headerTitle="Case History"
      showDrawerButton={true}
    />
  );
};

export const HealthPassportScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Health Passport"
      description="Generate and share your unified medical QR profile for instant triage scan."
      icon="✈️"
      headerTitle="Health Passport"
      showDrawerButton={true}
    />
  );
};

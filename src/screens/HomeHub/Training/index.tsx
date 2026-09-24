import React from 'react';
import { UnderProgress } from '../../../components/common/UnderProgress';

export const TrainingScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Training Programs"
      description="Access customized video tutorials, pacing drills, and health risk-sensitive training guidelines."
      icon="🎓"
      headerTitle="Training Hub"
      showDrawerButton={true}
    />
  );
};

export default TrainingScreen;

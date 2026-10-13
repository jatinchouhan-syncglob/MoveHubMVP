import React from 'react';
import { UnderProgress } from '../../../components/common/UnderProgress';

export const CommunityFeedScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Community Feed"
      description="Connect with fellow users, share your fitness progress, and encourage each other in your wellness journey."
      icon="💬"
      headerTitle="Community Feed"
      showDrawerButton={true}
    />
  );
};

export default CommunityFeedScreen;

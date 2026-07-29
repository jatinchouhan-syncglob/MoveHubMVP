import React from 'react';
import { UnderProgress } from '../../../components/common/UnderProgress';

export const DailyQuestScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Daily Quests"
      description="Daily quests are currently under development. Stay active and check back soon!"
      icon="📅"
      headerTitle="Daily Quests"
      showDrawerButton={true}
    />
  );
};

export default DailyQuestScreen;

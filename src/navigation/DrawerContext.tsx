import React, { createContext, useContext, useState } from 'react';

export type DrawerScreenType = 'FitnessPrescription' | 'Dashboard' | 'Awards' | 'FitnessChallenges' | 'ActivityTracking' | 'Leaderboard' | 'FitnessTraining' | 'Insights' | 'Profile' | 'MealLog' | 'MealAnalysis' | 'MealPlanner' | 'DailyCompliance' | 'WeeklyCompliance' | 'DailyQuest' | 'OngoingQuest' | 'CommunityFeed' | 'Training' | 'UploadReports' | 'DigitalWallet' | 'CaseHistory' | 'HealthPassport' | 'DailyLog' | 'Wellness' | 'HealthReportCard' | 'MindsetHub' | 'RiskAssessment' | 'PreventiveCare' | 'RiskTracker' | 'RiskTools' | 'MyConsultations' | 'OccupationalSafety';

interface DrawerContextProps {
  isOpen: boolean;
  activeScreen: DrawerScreenType;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setActiveScreen: (screen: DrawerScreenType) => void;
  targetCardTime: string | null;
  setTargetCardTime: (time: string | null) => void;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<DrawerScreenType>('FitnessPrescription');
  const [targetCardTime, setTargetCardTime] = useState<string | null>(null);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen((prev) => !prev);

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        activeScreen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        setActiveScreen,
        targetCardTime,
        setTargetCardTime,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
export default DrawerContext;

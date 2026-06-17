import React, { createContext, useContext, useState } from 'react';

export type DrawerScreenType = 'Dashboard' | 'ActivityTracking' | 'Leaderboard' | 'Insights' | 'Profile';

interface DrawerContextProps {
  isOpen: boolean;
  activeScreen: DrawerScreenType;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setActiveScreen: (screen: DrawerScreenType) => void;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<DrawerScreenType>('Dashboard');

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

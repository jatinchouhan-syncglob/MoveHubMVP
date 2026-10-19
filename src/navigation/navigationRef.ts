import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function getCurrentRouteName(): string | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}

// Global Dashboard Tab Controller
export type DashboardTab = 'activities' | 'steps';
let currentDashboardTab: DashboardTab = 'activities';
const dashboardTabListeners = new Set<(tab: DashboardTab) => void>();

export function setGlobalDashboardTab(tab: DashboardTab) {
  currentDashboardTab = tab;
  dashboardTabListeners.forEach(listener => {
    try {
      listener(tab);
    } catch (err) {
      console.warn('Dashboard tab listener error:', err);
    }
  });
}

export function getGlobalDashboardTab(): DashboardTab {
  return currentDashboardTab;
}

export function subscribeDashboardTab(listener: (tab: DashboardTab) => void) {
  dashboardTabListeners.add(listener);
  return () => {
    dashboardTabListeners.delete(listener);
  };
}

export function navigateToDashboardSteps() {
  setGlobalDashboardTab('steps');
  if (navigationRef.isReady()) {
    navigationRef.navigate('DrawerNavigator', { screen: 'Dashboard' });
  }
}

import axios from 'axios';
import { MOCK_PROFILE } from '../data/profile';
import { MOCK_ACTIVITIES } from '../data/activities';
import { MOCK_LEADERBOARD } from '../data/leaderboard';
import { MOCK_CALORIE_TRENDS, MOCK_STEP_TRENDS } from '../data/trends';
import { MOCK_INSIGHTS } from '../data/insights';
import { UserProfile, Activity, LeaderboardEntry, TrendData, Insight } from '../types';

// Future API Base URL (change in environment variables later)
const BASE_URL = 'https://api.movehub.example.com/v1';

// Create Axios Instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (e.g. to attach auth token later)
axiosInstance.interceptors.request.use(
  async (config) => {
    // const token = await storageHelper.getItem(STORAGE_KEYS.TOKEN);
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Centralized error handling
    console.error('API Error Response:', error.response || error.message);
    return Promise.reject(error);
  }
);

import { storageHelper } from '../storage/storageHelper';
import { STORAGE_KEYS } from '../storage/storageKeys';

// Helper function to simulate network delay for MVP demo purposes
const simulateNetworkCall = <T>(mockData: T, delayMs = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, delayMs);
  });
};

/**
 * Clean API Services Wrapper.
 * Currently returns local dummy data wrapped in Promises to simulate server responses.
 * Ready to be swapped with Axios requests (commented lines show example configurations).
 */
export const apiService = {
  // --- Profile ---
  async getProfile(): Promise<UserProfile> {
    // Future API: return axiosInstance.get('/profile');
    const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    return simulateNetworkCall(cachedProfile || MOCK_PROFILE);
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    // Future API: return axiosInstance.put('/profile', profile);
    const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    const updated = { ...(cachedProfile || MOCK_PROFILE), ...profile };
    await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, updated);
    return simulateNetworkCall(updated);
  },

  // --- Activities ---
  async getActivities(): Promise<Activity[]> {
    // Future API: return axiosInstance.get('/activities');
    const cachedActivities = await storageHelper.getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES);
    if (!cachedActivities) {
      await storageHelper.setItem(STORAGE_KEYS.ACTIVITIES, MOCK_ACTIVITIES);
      return simulateNetworkCall(MOCK_ACTIVITIES);
    }
    return simulateNetworkCall(cachedActivities);
  },

  async logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    // Future API: return axiosInstance.post('/activities', activity);
    const cachedActivities = await storageHelper.getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES);
    const currentActivities = cachedActivities || MOCK_ACTIVITIES;
    const newActivity: Activity = {
      ...activity,
      id: `act-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newActivity, ...currentActivities];
    await storageHelper.setItem(STORAGE_KEYS.ACTIVITIES, updated);
    return simulateNetworkCall(newActivity);
  },

  // --- Leaderboard ---
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Future API: return axiosInstance.get('/leaderboard');
    const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    const profileName = cachedProfile?.name || MOCK_PROFILE.name;
    const mappedLeaderboard = MOCK_LEADERBOARD.map((entry) => {
      if (entry.isCurrentUser) {
        return { ...entry, name: profileName };
      }
      return entry;
    });
    return simulateNetworkCall(mappedLeaderboard);
  },

  // --- Insights & Trends ---
  async getInsights(): Promise<Insight[]> {
    // Future API: return axiosInstance.get('/insights');
    return simulateNetworkCall(MOCK_INSIGHTS);
  },

  async getCalorieTrends(): Promise<TrendData> {
    // Future API: return axiosInstance.get('/trends/calories');
    return simulateNetworkCall(MOCK_CALORIE_TRENDS);
  },

  async getStepTrends(): Promise<TrendData> {
    // Future API: return axiosInstance.get('/trends/steps');
    return simulateNetworkCall(MOCK_STEP_TRENDS);
  },
};

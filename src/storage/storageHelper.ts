import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeyType } from './storageKeys';

export const storageHelper = {
  /**
   * Save a value to AsyncStorage
   */
  async setItem<T>(key: StorageKeyType, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`AsyncStorage error saving key ${key}:`, error);
      return false;
    }
  },

  /**
   * Retrieve a value from AsyncStorage
   */
  async getItem<T>(key: StorageKeyType): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (error) {
      console.error(`AsyncStorage error reading key ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove a key from AsyncStorage
   */
  async removeItem(key: StorageKeyType): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`AsyncStorage error removing key ${key}:`, error);
      return false;
    }
  },

  /**
   * Clear all app-related AsyncStorage data
   */
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('AsyncStorage error clearing storage:', error);
      return false;
    }
  },
};

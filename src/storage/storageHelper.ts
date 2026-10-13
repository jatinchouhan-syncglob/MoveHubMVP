import { MMKV } from 'react-native-mmkv';
import { StorageKeyType } from './storageKeys';

// Initialize a highly secure, encrypted MMKV instance
const storage = new MMKV({
  id: 'movehub-secure-storage',
  encryptionKey: 'movehub_secure_key_3527!',
});

export const storageHelper = {
  /**
   * Save a value to MMKV
   */
  async setItem<T>(key: StorageKeyType, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      storage.set(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`MMKV error saving key ${key}:`, error);
      return false;
    }
  },

  /**
   * Retrieve a value from MMKV
   */
  async getItem<T>(key: StorageKeyType): Promise<T | null> {
    try {
      const jsonValue = storage.getString(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (error) {
      console.error(`MMKV error reading key ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove a key from MMKV
   */
  async removeItem(key: StorageKeyType): Promise<boolean> {
    try {
      storage.delete(key);
      return true;
    } catch (error) {
      console.error(`MMKV error removing key ${key}:`, error);
      return false;
    }
  },

  /**
   * Clear all app-related MMKV data
   */
  async clear(): Promise<boolean> {
    try {
      storage.clearAll();
      return true;
    } catch (error) {
      console.error('MMKV error clearing storage:', error);
      return false;
    }
  },
};

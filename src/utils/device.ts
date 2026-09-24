import DeviceInfo from 'react-native-device-info';

/**
 * Dynamically gets the device unique ID using react-native-device-info.
 * Falls back to '99kjkhgg' if it fails.
 */
export const getDynamicDeviceId = async (): Promise<string> => {
  try {
    const id = await DeviceInfo.getUniqueId();
    if (id) {
      return id;
    }
  } catch (err) {
    console.warn('[getDynamicDeviceId] Failed to get unique deviceId, using fallback:', err);
  }
  return '99kjkhgg';
};

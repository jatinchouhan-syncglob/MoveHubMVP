import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { UserProfile } from '../types';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const updated = await apiService.updateProfile(newProfile);
      setProfile(updated);
      setError(null);
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};

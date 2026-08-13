import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Switch,
  ActivityIndicator,
  Animated,
  PanResponder,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ActivityCard } from '../../components/cards/ActivityCard';
import { apiService } from '../../services/api';
import { Activity, UserProfile } from '../../types';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { getDynamicDeviceId } from '../../utils/device';
import { WELLNESS_ACTIVITIES_REGISTRY } from '../../constants/activityTypes';
import { StepsLogsTab } from './components/StepsLogsTab';
import Svg, { Circle, G } from 'react-native-svg';
import { useDrawer } from '../../navigation/DrawerContext';
import { useNavigation } from '@react-navigation/native';
const getActivityEmoji = (activityName: string, categoryName?: string): string => {
  const nameLower = activityName.toLowerCase();
  if (nameLower.includes('walk')) return '🚶';
  if (nameLower.includes('run') || nameLower.includes('jog')) return '🏃';
  if (nameLower.includes('cycle') || nameLower.includes('bike')) return '🚴';
  if (nameLower.includes('swim')) return '🏊';
  if (nameLower.includes('yoga') || nameLower.includes('stretch') || nameLower.includes('meditat')) return '🧘';
  if (nameLower.includes('zumba') || nameLower.includes('aerobic') || nameLower.includes('dance')) return '💃';
  if (nameLower.includes('cricket')) return '🏏';
  if (nameLower.includes('badminton')) return '🏸';
  if (nameLower.includes('soccer') || nameLower.includes('football')) return '⚽';
  if (nameLower.includes('lift') || nameLower.includes('strength') || nameLower.includes('weight') || nameLower.includes('squat') || nameLower.includes('bench') || nameLower.includes('deadlift') || nameLower.includes('press') || nameLower.includes('row')) return '🏋️';
  
  if (categoryName) {
    const catLower = categoryName.toLowerCase();
    if (catLower.includes('strength') || catLower.includes('weight') || catLower.includes('resistance')) return '🏋️';
    if (catLower.includes('condition') || catLower.includes('cardio') || catLower.includes('endurance')) return '🏃';
    if (catLower.includes('sport') || catLower.includes('game') || catLower.includes('court')) return '⚽';
  }
  return '🏃';
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const ITEM_HEIGHT = 60;
const MINUTES_LIST = Array.from({ length: 90 }, (_, i) => i + 1);
const PICKER_DATA = ['', ...MINUTES_LIST, ''];

export const ActivityTrackingScreen: React.FC = () => {
  const { setActiveScreen } = useDrawer();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'Steps' | 'Workout'>('Workout');

  // Modal & Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [activityType, setActivityType] = useState('Walking');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('2.0');

  // Resistance Parameters (Strength workouts)
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weightKg, setWeightKg] = useState('15');

  // Contextual Modifiers
  const [highIntensity, setHighIntensity] = useState(false);
  const [strengthRest, setStrengthRest] = useState(false);
  const [activeRecovery, setActiveRecovery] = useState(false);

  // Wearable Integration Toggles
  const [syncWearable, setSyncWearable] = useState(false);

  // Benefits Modal Visibility & Logging Summary
  const [benefitsVisible, setBenefitsVisible] = useState(false);
  const [lastLoggedSummary, setLastLoggedSummary] = useState<{
    type: string;
    emoji: string;
    category: string;
    duration: number;
    calories: number;
    gainPoints: number;
    musculoPoints: number;
    cardioPoints: number;
  } | null>(null);

  // Profile Weight state for Live Calorie updates
  const [userWeight, setUserWeight] = useState(74.5);

  // Category Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Additional Popup & Saving States
  const [seeAllVisible, setSeeAllVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [dynamicActivities, setDynamicActivities] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDynamicActivity, setSelectedDynamicActivity] = useState<any | null>(null);
  const [catalogActivities, setCatalogActivities] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [trainingProfile, setTrainingProfile] = useState('Working Set');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [parentScrollEnabled, setParentScrollEnabled] = useState(true);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSelectedPill, setModalSelectedPill] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState(5.0);
  const rpe = Math.round(sliderVal);
  const trackRef = useRef<any>(null);
  const trackLeftOffset = useRef(0);
  const trackWidth = useRef(0);
  const flatListRef = useRef<any>(null);
  const animValue = useRef(new Animated.Value(0)).current;

  // Custom PanResponder for RPE Slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        trackRef.current?.measure((x: number, y: number, width: number, height: number, pageXOffset: number) => {
          if (width > 0) {
            trackLeftOffset.current = pageXOffset;
            trackWidth.current = width;
            const relativeX = evt.nativeEvent.pageX - pageXOffset;
            let pct = relativeX / width;
            pct = Math.max(0, Math.min(1, pct));
            setSliderVal(pct * 9 + 1);
          }
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (trackWidth.current > 0) {
          const relativeX = gestureState.moveX - trackLeftOffset.current;
          let pct = relativeX / trackWidth.current;
          pct = Math.max(0, Math.min(1, pct));
          setSliderVal(pct * 9 + 1);
        }
      },
    })
  ).current;

  const getRpeDescription = (val: number) => {
    if (val <= 2) return 'Easy / Rest';
    if (val <= 4) return 'Moderate Effort';
    if (val <= 6) return 'Hard / Challenging';
    if (val <= 8) return 'Very Hard';
    return 'Max Effort / Peak';
  };

  const getWorkoutBreakdown = () => {
    if (!activeRegistryItem) {
      return { cardioPct: 50, strengthPct: 20, balancePct: 15, recoveryPct: 15 };
    }
    const itemAny = activeRegistryItem as any;
    if (
      typeof itemAny.cardioPct === 'number' &&
      typeof itemAny.strengthPct === 'number' &&
      typeof itemAny.balancePct === 'number' &&
      typeof itemAny.recoveryPct === 'number'
    ) {
      return {
        cardioPct: itemAny.cardioPct,
        strengthPct: itemAny.strengthPct,
        balancePct: itemAny.balancePct,
        recoveryPct: itemAny.recoveryPct,
      };
    }
    const cat = activeRegistryItem.category;
    const nameLower = activeRegistryItem.name.toLowerCase();
    
    if (cat === 'distance') {
      return { cardioPct: 80, strengthPct: 10, balancePct: 5, recoveryPct: 5 };
    } else if (cat === 'strength') {
      return { cardioPct: 10, strengthPct: 80, balancePct: 5, recoveryPct: 5 };
    } else {
      // duration based
      if (
        nameLower.includes('yoga') || 
        nameLower.includes('stretch') || 
        nameLower.includes('meditat') || 
        nameLower.includes('pilates') || 
        nameLower.includes('stroll') ||
        nameLower.includes('roll') || 
        nameLower.includes('mobility')
      ) {
        return { cardioPct: 10, strengthPct: 10, balancePct: 40, recoveryPct: 40 };
      } else if (
        nameLower.includes('zumba') || 
        nameLower.includes('dance') || 
        nameLower.includes('aerobic') || 
        nameLower.includes('badminton') || 
        nameLower.includes('cricket') || 
        nameLower.includes('football') || 
        nameLower.includes('kabaddi') ||
        nameLower.includes('sport') ||
        nameLower.includes('boxing') ||
        nameLower.includes('martial')
      ) {
        return { cardioPct: 70, strengthPct: 10, balancePct: 10, recoveryPct: 10 };
      } else {
        return { cardioPct: 50, strengthPct: 20, balancePct: 15, recoveryPct: 15 };
      }
    }
  };

  // Sync animation of the segmented donut ring when modal is visible or activity type changes
  useEffect(() => {
    if (modalVisible) {
      animValue.setValue(0);
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [modalVisible, activityType]);

  useEffect(() => {
    if (modalSearchQuery.trim().length > 0) {
      setModalSelectedPill('ALL');
    } else {
      setModalSelectedPill(null);
    }
  }, [modalSearchQuery]);

  const getFilteredModalList = () => {
    const query = modalSearchQuery.trim().toLowerCase();
    const filteredBySearch = catalogActivities.filter(
      e => (e.displayName || '').toLowerCase().includes(query) || (e.activityName || '').toLowerCase().includes(query)
    );

    if (modalSelectedPill && modalSelectedPill !== 'ALL') {
      return filteredBySearch.filter(e => e.categoryName === modalSelectedPill);
    }
    return filteredBySearch;
  };

  const getCountsForModalQuery = () => {
    const query = modalSearchQuery.trim().toLowerCase();
    const filteredBySearch = catalogActivities.filter(
      e => (e.displayName || '').toLowerCase().includes(query) || (e.activityName || '').toLowerCase().includes(query)
    );
    
    const counts: Record<string, number> = {
      ALL: filteredBySearch.length,
    };

    const uniqueCategories = Array.from(new Set(catalogActivities.map(e => e.categoryName).filter(Boolean)));
    uniqueCategories.forEach(cat => {
      counts[cat] = filteredBySearch.filter(e => e.categoryName === cat).length;
    });

    return counts;
  };

  const modalCounts = getCountsForModalQuery();
  const currentModalList = getFilteredModalList();

  const getModalSectionData = () => {
    const light = currentModalList.filter(e => (e.intensityBand || '').toUpperCase() === 'LIGHT');
    const moderate = currentModalList.filter(e => (e.intensityBand || '').toUpperCase() === 'MODERATE');
    const vigorous = currentModalList.filter(e => {
      const band = (e.intensityBand || '').toUpperCase();
      return band === 'VIGOROUS' || band === 'VIGOUR';
    });

    return [
      { title: '🟢 LIGHT INTENSITY', data: light },
      { title: '🟡 MODERATE INTENSITY', data: moderate },
      { title: '🔴 VIGOROUS INTENSITY', data: vigorous },
    ].filter(sec => sec.data.length > 0);
  };



  const fetchActivities = async () => {
    try {
      const data = await apiService.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchInitialCatalog = async () => {
    setCatalogLoading(true);
    try {
      const url = `https://txsbp7baq1.execute-api.ap-south-1.amazonaws.com/backend/health-connect/getActivityCatalog?search=`;
      console.log('[ActivityLogger] Fetching initial catalog URL:', url);
      const response = await fetch(url);
      const json = await response.json();
      console.log('[ActivityLogger] Initial Catalog Response:', JSON.stringify(json, null, 2));

      if (json.status === 'Success' && Array.isArray(json.data)) {
        setCatalogActivities(json.data);
      }
    } catch (error) {
      console.error('[ActivityLogger] Failed to fetch initial catalog:', error);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchInitialCatalog();
    // Fetch profile to get weight for live calorie previews
    apiService
      .getProfile()
      .then(p => {
        if (p && p.weight) {
          setUserWeight(p.weight);
        }
      })
      .catch(err => console.error('Failed to load profile weight:', err));
  }, []);

  useEffect(() => {
    if (!seeAllVisible) {
      setDynamicActivities([]);
      return;
    }

    const fetchSearchedActivities = async () => {
      setSearchLoading(true);
      try {
        const url = `https://txsbp7baq1.execute-api.ap-south-1.amazonaws.com/backend/health-connect/getActivityCatalog?search=${encodeURIComponent(
          searchQuery,
        )}`;
        console.log('[ActivityLogger] Fetching catalog URL:', url);
        const response = await fetch(url);
        const json = await response.json();
        console.log('[ActivityLogger] Dynamic Catalog Response:', JSON.stringify(json, null, 2));

        if (json.status === 'Success' && Array.isArray(json.data)) {
          setDynamicActivities(json.data);
        } else {
          setDynamicActivities([]);
        }
      } catch (error) {
        console.error('[ActivityLogger] Failed to fetch catalog:', error);
        setDynamicActivities([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearchedActivities();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, seeAllVisible]);
  // Auto-resolve dynamic activity metadata when activityType changes
  useEffect(() => {
    if (activityType) {
      const found = catalogActivities.find(
        item => item.activityName.toLowerCase() === activityType.toLowerCase()
      );
      if (found) {
        setSelectedDynamicActivity(found);
      }
    }
  }, [activityType, catalogActivities]);
  // Sync category tab with selected activity category on open
  useEffect(() => {
    if (modalVisible) {
      const foundInCatalog = catalogActivities.find(
        item => item.activityName.toLowerCase() === activityType.toLowerCase()
      );
      if (foundInCatalog && foundInCatalog.categoryName) {
        setSelectedCategory(foundInCatalog.categoryName);
        return;
      }
      
      const keys = Object.keys(categoryMainOptions);
      if (keys.length > 0) {
        const item = WELLNESS_ACTIVITIES_REGISTRY.find(
          act => act.name.toLowerCase() === activityType.toLowerCase()
        );
        if (item) {
          const actCat = item.category;
          const matchedKey = keys.find(key => {
            const catLower = key.toLowerCase();
            if (actCat === 'distance' && (catLower.includes('run') || catLower.includes('walk') || catLower.includes('cycle') || catLower.includes('swim') || catLower.includes('endurance') || catLower.includes('bicycling'))) return true;
            if (actCat === 'strength' && (catLower.includes('strength') || catLower.includes('weight') || catLower.includes('resistance') || catLower.includes('condition'))) return true;
            if (actCat === 'duration' && (catLower.includes('mind') || catLower.includes('body') || catLower.includes('yoga') || catLower.includes('stretch') || catLower.includes('recovery') || catLower.includes('studio'))) return true;
            return false;
          });
          if (matchedKey) {
            setSelectedCategory(matchedKey);
          }
        }
      }
    }
  }, [modalVisible, activityType, catalogActivities]);

  // Set initial category tab on catalog load
  useEffect(() => {
    if (catalogActivities.length > 0) {
      const uniqueCats: string[] = [];
      catalogActivities.forEach(item => {
        const cat = item.categoryName || 'General';
        if (!uniqueCats.includes(cat)) {
          uniqueCats.push(cat);
        }
      });
      if (uniqueCats.length > 0 && (!selectedCategory || !uniqueCats.includes(selectedCategory))) {
        setSelectedCategory(uniqueCats[0]);
      }
    }
  }, [catalogActivities, selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const activeRegistryItem = (() => {
    // 1. Search in catalogActivities first for dynamic exercises fetched from the API!
    const catalogItem = catalogActivities.find(
      act => (act.displayName || act.activityName || '').toLowerCase() === activityType.toLowerCase()
    );
    if (catalogItem) {
      const catLower = (catalogItem.categoryName || '').toLowerCase();
      const nameLower = (catalogItem.displayName || catalogItem.activityName || '').toLowerCase();
      
      let category: 'distance' | 'strength' | 'duration' = 'duration';
      let metric: 'km' | 'steps' | 'm' | 'mins' | 'reps' | 'sets' = 'mins';
      
      if (nameLower.includes('walk') || nameLower.includes('run') || nameLower.includes('cycle') || nameLower.includes('swim') || nameLower.includes('hike') || nameLower.includes('jog') || catLower.includes('bicycling') || catLower.includes('running') || catalogItem.metricType === 'DISTANCE_BASED') {
        category = 'distance';
        if (nameLower.includes('walk')) {
          metric = 'steps';
        } else if (nameLower.includes('swim')) {
          metric = 'm';
        } else {
          metric = 'km';
        }
      } else if (catLower.includes('strength') || catLower.includes('weight') || catLower.includes('resistance') || nameLower.includes('deadlift') || nameLower.includes('bench') || nameLower.includes('squat') || nameLower.includes('exercube')) {
        category = 'strength';
        if (nameLower.includes('squat') || nameLower.includes('press') || nameLower.includes('deadlift')) {
          metric = 'sets';
        } else {
          metric = 'reps';
        }
      }

      return {
        name: catalogItem.displayName || catalogItem.activityName,
        emoji: getActivityEmoji(catalogItem.activityName, catalogItem.categoryName),
        baseMET: catalogItem.baseMet || 4.0,
        metric,
        category,
        color: catalogItem.categoryName?.toLowerCase().includes('conditioning') ? '#DB2777' : '#0EA5E9',
        cardioPct: typeof catalogItem.cardioPct === 'number' ? catalogItem.cardioPct : undefined,
        strengthPct: typeof catalogItem.strengthPct === 'number' ? catalogItem.strengthPct : undefined,
        balancePct: typeof catalogItem.balancePct === 'number' ? catalogItem.balancePct : undefined,
        recoveryPct: typeof catalogItem.recoveryPct === 'number' ? catalogItem.recoveryPct : undefined,
      };
    }

    const staticItem = WELLNESS_ACTIVITIES_REGISTRY.find(
      act => act.name.toLowerCase() === activityType.toLowerCase()
    );
    if (staticItem) return staticItem;

    if (selectedDynamicActivity && selectedDynamicActivity.activityName.toLowerCase() === activityType.toLowerCase()) {
      const name = selectedDynamicActivity.activityName;
      const baseMET = selectedDynamicActivity.baseMet || 4.0;
      
      let category: 'distance' | 'strength' | 'duration' = 'duration';
      let metric: 'km' | 'steps' | 'm' | 'mins' | 'reps' | 'sets' = 'mins';
      
      const catLower = (selectedDynamicActivity.categoryName || '').toLowerCase();
      const nameLower = name.toLowerCase();
      
      if (nameLower.includes('walk') || nameLower.includes('run') || nameLower.includes('cycle') || nameLower.includes('swim') || nameLower.includes('hike') || nameLower.includes('jog') || catLower.includes('bicycling') || catLower.includes('running')) {
        category = 'distance';
        if (nameLower.includes('walk')) {
          metric = 'steps';
        } else if (nameLower.includes('swim')) {
          metric = 'm';
        } else {
          metric = 'km';
        }
      } else if (catLower.includes('strength') || catLower.includes('weight') || catLower.includes('resistance') || nameLower.includes('deadlift') || nameLower.includes('bench') || nameLower.includes('squat')) {
        category = 'strength';
        if (nameLower.includes('squat') || nameLower.includes('press') || nameLower.includes('deadlift')) {
          metric = 'sets';
        } else {
          metric = 'reps';
        }
      }

      return {
        name,
        emoji: getActivityEmoji(name, selectedDynamicActivity.categoryName),
        baseMET,
        metric,
        category,
        color: theme.colors.primary,
      };
    }

    return {
      name: activityType || 'Other',
      emoji: '💪',
      baseMET: 4.0,
      metric: 'mins',
      category: 'duration',
      color: theme.colors.primary,
    };
  })();
  const isDistanceBased = activeRegistryItem?.category === 'distance';

  const parsedDuration = parseFloat(duration) || 0;
  const parsedDistance = parseFloat(distance) || 0;
  const liveVelocity =
    parsedDuration > 0 && parsedDistance > 0
      ? parsedDistance / (parsedDuration / 60)
      : 0;

  const handleScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);
    const value = MINUTES_LIST[index];
    if (value !== undefined) {
      setDuration(value.toString());
    }
  };

  const getInterpolatedOffset = (percentage: number) => {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const targetOffset = circumference - (circumference * percentage);
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, targetOffset],
    });
  };

  const handleSaveActivity = async () => {
    setSaving(true);
    try {
      const registryItem = activeRegistryItem;

      let baseMET = registryItem.baseMET;
      let metric = registryItem.metric;

      // If syncWearable is enabled, simulate randomized/realistic wearable metrics
      let durationMin = Math.min(Math.max(parsedDuration, 1), 360);
      let localDistance = parsedDistance;

      if (syncWearable) {
        durationMin = Math.floor(Math.random() * 21) + 25;
        localDistance = parseFloat((Math.random() * 2.0 + 2.0).toFixed(1));
      }

      let value = durationMin;

      // Map metrics and values according to registry configuration (input is in KM)
      if (registryItem.category === 'distance') {
        if (metric === 'km') {
          value = parseFloat(localDistance.toFixed(1));
        } else if (metric === 'steps') {
          value = Math.round(localDistance * 1250);
        } else if (metric === 'm') {
          value = Math.round(localDistance * 1000);
        }
      } else if (registryItem.category === 'strength') {
        if (metric === 'sets') {
          value = parseInt(sets) || 5;
        } else if (metric === 'reps') {
          value = parseInt(reps) || 50;
        }
      }

      // Calculate metabolic burn with contextual modifiers
      let calculatedMET = baseMET;
      if (isDistanceBased) {
        const distanceMiles = localDistance / 1.60934;
        const speedMPH = distanceMiles / (durationMin / 60);
        calculatedMET = Math.min(speedMPH * 1.2 + baseMET, 23.0);
      }

      if (highIntensity) {
        calculatedMET += 1.5;
      }
      if (activeRecovery) {
        calculatedMET -= 0.5;
      }
      if (strengthRest) {
        calculatedMET -= 1.0;
      }
      if (calculatedMET < 1.0) {
        calculatedMET = 1.0;
      }

      // Calculate calories (calculatedMET * weight * duration * 0.0175)
      const calories = Math.round(
        calculatedMET * userWeight * durationMin * 0.0175,
      );

      let formattedNotes = '';
      if (syncWearable) {
        formattedNotes = `Completed ${activityType.toLowerCase()} routine.`;
      } else if (registryItem.category === 'strength') {
        const workoutDetail = `Target: ${trainingProfile}. Logged: ${sets} sets x ${reps} reps @ ${weightKg} kg. RPE Scale Intensity: ${rpe}.`;
        formattedNotes = `Completed ${activityType.toLowerCase()} routine. ${workoutDetail}`;
      } else {
        formattedNotes = `Completed ${activityType.toLowerCase()} routine. RPE Scale Intensity: ${rpe}.`;
      }

      // Call the Health Connect save API
      console.log('--------------------------------------------------');
      console.log('[Health Connect] SAVE API Initiated with payload...');

      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      const targetUhid = cachedProfile?.uhid || 'SAUSHA9775';

      const deviceId = await getDynamicDeviceId();
      const savePayload = {
        uhid: targetUhid,
        deviceId: deviceId,
        type: activityType,
        value: value,
        metric: metric,
        durationMinutes: durationMin,
        caloriesBurned: calories,
        notes: formattedNotes,
        modifier: registryItem.category === 'strength' ? trainingProfile : null,
      };

      console.log(
        '[Health Connect] Sending Save Payload:',
        JSON.stringify(savePayload, null, 2),
      );

      const response = await apiService.saveHealthConnectActivity(savePayload);

      console.log('[Health Connect] SAVE API SUCCESS!');
      console.log(
        '[Health Connect] SAVE API Response Data:',
        JSON.stringify(response, null, 2),
      );
      console.log('--------------------------------------------------');

      // Map the response fields or fallback to sent payload
      const responseData = response || {};
      const savedActivity: Activity = {
        id: responseData.id || `hc-${Date.now()}`,
        type: responseData.type || activityType,
        value: responseData.value !== undefined ? responseData.value : value,
        metric: responseData.metric || metric,
        durationMinutes:
          responseData.durationMinutes !== undefined
            ? responseData.durationMinutes
            : durationMin,
        caloriesBurned:
          responseData.caloriesBurned !== undefined
            ? responseData.caloriesBurned
            : calories,
        timestamp: responseData.timestamp || new Date().toISOString(),
        notes: responseData.notes || formattedNotes,
      };

      // Add the newly saved activity to the main list so it displays instantly on the screen
      setActivities(prev => [savedActivity, ...prev]);



      // Store results for the Benefits Summary Modal using response values
      const resDuration =
        responseData.durationMinutes !== undefined
          ? responseData.durationMinutes
          : durationMin;
      const resCalories =
        responseData.caloriesBurned !== undefined
          ? responseData.caloriesBurned
          : calories;
      const resGainPoints =
        responseData.gainPoints !== undefined
          ? responseData.gainPoints
          : Math.round(calculatedMET * resDuration);

      let resMusculoPoints = 0;
      let resCardioPoints = 0;
      if (registryItem.category === 'strength') {
        resMusculoPoints = Math.round(resGainPoints * 0.8);
        resCardioPoints = Math.round(resGainPoints * 0.2);
      } else if (registryItem.category === 'distance') {
        resCardioPoints = Math.round(resGainPoints * 0.8);
        resMusculoPoints = Math.round(resGainPoints * 0.2);
      } else {
        resCardioPoints = Math.round(resGainPoints * 0.5);
        resMusculoPoints = Math.round(resGainPoints * 0.5);
      }

      setLastLoggedSummary({
        type: responseData.type || activityType,
        emoji: registryItem.emoji || '💪',
        category: registryItem.category,
        duration: resDuration,
        calories: resCalories,
        gainPoints: resGainPoints,
        musculoPoints:
          responseData.musculoPoints !== undefined
            ? responseData.musculoPoints
            : resMusculoPoints,
        cardioPoints:
          responseData.cardioPoints !== undefined
            ? responseData.cardioPoints
            : resCardioPoints,
      });

      setModalVisible(false);
      setDuration('30');
      setDistance('2.0');
      setSets('3');
      setReps('10');
      setWeightKg('15');
      setHighIntensity(false);
      setStrengthRest(false);
      // Navigate to the DemoPostWorkoutSummary Screen first as Step 1
      navigation.navigate('DemoPostWorkoutSummary', {
        activityName: responseData.type || activityType,
        baseMet: calculatedMET,
        cardio: Math.round((resCardioPoints / (resGainPoints || 1)) * 100) || 50,
        strength: Math.round((resMusculoPoints / (resGainPoints || 1)) * 100) || 50,
        balance: 15,
        recovery: 15,
        duration: resDuration,
        calories: resCalories,
        gainPoints: resGainPoints,
        showBenefitsNext: true,
        fromActivityTracking: true,
      });
    } catch (error: any) {
      console.error('Failed to log workout details:', error);
      const errMsg = error.response?.data?.message || error.message || 'Unknown error';
      Alert.alert('Error', `Failed to save workout details. Reason: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSyncWearable(false);
    setHighIntensity(false);
    setStrengthRest(false);
    setActiveRecovery(false);
    setTrainingProfile('Working Set');
    setProfileDropdownOpen(false);
  };

  const activityOptions = WELLNESS_ACTIVITIES_REGISTRY.map(act => ({
    name: act.name,
    emoji: act.emoji,
  }));

  const categoryMainOptions: Record<string, { name: string; emoji: string }[]> = (() => {
    const result: Record<string, { name: string; emoji: string }[]> = {};

    catalogActivities.forEach((item: any) => {
      const name = item.activityName;
      const catName = item.categoryName || 'General';

      if (!result[catName]) {
        result[catName] = [];
      }

      // Show exactly up to 5 exercises per category, as requested
      if (result[catName].length < 5) {
        if (!result[catName].some((opt: { name: string; emoji: string }) => opt.name.toLowerCase() === name.toLowerCase())) {
          const itemEmoji = getActivityEmoji(name, catName);
          result[catName].push({ name, emoji: itemEmoji });
        }
      }
    });

    return result;
  })();

  const getCategoryEmoji = (catName: string): string => {
    const nameLower = catName.toLowerCase();
    if (nameLower.includes('run') || nameLower.includes('cardio') || nameLower.includes('endurance') || nameLower.includes('cycle') || nameLower.includes('bike') || nameLower.includes('walk')) return '🏃';
    if (nameLower.includes('strength') || nameLower.includes('weight') || nameLower.includes('resistance') || nameLower.includes('condition')) return '🏋️';
    if (nameLower.includes('mind') || nameLower.includes('body') || nameLower.includes('yoga') || nameLower.includes('stretch') || nameLower.includes('recovery') || nameLower.includes('studio')) return '🧘';
    if (nameLower.includes('water') || nameLower.includes('swim')) return '🏊';
    if (nameLower.includes('sport') || nameLower.includes('game') || nameLower.includes('court')) return '⚽';
    return '🏃';
  };

  const mainOptions = (selectedCategory && categoryMainOptions[selectedCategory]) || [];
  const isCurrentCategorySelected = (() => {
    if (!activeRegistryItem) return false;
    
    if (selectedDynamicActivity && selectedDynamicActivity.activityName.toLowerCase() === activityType.toLowerCase()) {
      return (selectedDynamicActivity.categoryName || 'General') === selectedCategory;
    }
    
    const catLower = selectedCategory.toLowerCase();
    const actCat = activeRegistryItem.category;
    if (actCat === 'distance' && (catLower.includes('run') || catLower.includes('walk') || catLower.includes('cycle') || catLower.includes('swim') || catLower.includes('endurance') || catLower.includes('bicycling'))) {
      return true;
    }
    if (actCat === 'strength' && (catLower.includes('strength') || catLower.includes('weight') || catLower.includes('resistance') || catLower.includes('condition'))) {
      return true;
    }
    if (actCat === 'duration' && (catLower.includes('mind') || catLower.includes('body') || catLower.includes('yoga') || catLower.includes('stretch') || catLower.includes('recovery') || catLower.includes('studio'))) {
      return true;
    }
    return false;
  })();

  let visibleOptions = [...mainOptions];
  if (isCurrentCategorySelected) {
    // If the selected activity is a newly-searched custom activity not present in the list,
    // prepend it to visibleOptions so the user can see it selected on the screen.
    const exists = mainOptions.some((opt: { name: string; emoji: string }) => opt.name.toLowerCase() === activityType.toLowerCase());
    if (!exists && activeRegistryItem) {
      visibleOptions = [{ name: activeRegistryItem.name, emoji: activeRegistryItem.emoji }, ...mainOptions];
    }
  }


  const getPillarBreakdown = (gainPoints: number, category: string) => {
    let cardioPct = 0.5;
    let agilityPct = 0.4;
    let metabolicPct = 0.3;
    let structuralPct = 0.2;

    if (category === 'strength') {
      cardioPct = 0.2;
      agilityPct = 0.3;
      metabolicPct = 0.4;
      structuralPct = 0.8;
    } else if (category === 'distance') {
      cardioPct = 0.8;
      agilityPct = 0.5;
      metabolicPct = 0.6;
      structuralPct = 0.1;
    } else {
      // Yoga / Other duration based
      cardioPct = 0.67;
      agilityPct = 0.4;
      metabolicPct = 0.2;
      structuralPct = 0.1;
    }

    const cardioTarget = 80;
    const agilityTarget = 80;
    const metabolicTarget = 50;
    const structuralTarget = 20;

    const cardio = Math.min(cardioTarget, Math.round(gainPoints * cardioPct));
    const agility = Math.min(
      agilityTarget,
      Math.round(gainPoints * agilityPct),
    );
    const metabolic = Math.min(
      metabolicTarget,
      Math.round(gainPoints * metabolicPct),
    );
    const structural = Math.min(
      structuralTarget,
      Math.round(gainPoints * structuralPct),
    );

    return {
      cardio,
      cardioTarget,
      agility,
      agilityTarget,
      metabolic,
      metabolicTarget,
      structural,
      structuralTarget,
    };
  };

  const renderCircularProgress = (pts: number, target: number) => {
    const size = 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circum = 2 * Math.PI * radius;
    const pct = Math.min(1, pts / target);
    const strokeDashoffset = circum * (1 - pct);

    return (
      <View style={styles.circularProgressContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.5}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#06b6d4"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circum} ${circum}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.circularProgressCenterText}>
          <Text style={styles.circularProgressValue}>{pts}</Text>
          <Text style={styles.circularProgressLabel}>PTS EARNED</Text>
        </View>
        <Text style={styles.circularProgressTarget}>{target}</Text>
      </View>
    );
  };

  const breakdown = getWorkoutBreakdown();
  const pCardio = breakdown.cardioPct / 100;
  const pStrength = breakdown.strengthPct / 100;
  const pBalance = breakdown.balancePct / 100;
  const pRecovery = breakdown.recoveryPct / 100;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const segments = {
    cardio: {
      percentage: pCardio,
      color: '#06B6D4',
      rotation: 0,
    },
    strength: {
      percentage: pStrength,
      color: '#F97316',
      rotation: 360 * pCardio,
    },
    balance: {
      percentage: pBalance,
      color: '#2DD4BF',
      rotation: 360 * (pCardio + pStrength),
    },
    recovery: {
      percentage: pRecovery,
      color: '#FB923C',
      rotation: 360 * (pCardio + pStrength + pBalance),
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title={STRINGS.ACTIVITY_TRACKING.TITLE}
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Tabs Selector */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Workout' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('Workout')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'Workout' && styles.tabButtonTextActive,
            ]}
          >
            🏋️ Workout Logs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Steps' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('Steps')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'Steps' && styles.tabButtonTextActive,
            ]}
          >
            👣 Steps Logs
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Workout' ? (
        loading && activities.length === 0 ? (
          <Loader fullScreen message="Loading activities list..." />
        ) : (
          <FlatList
            data={activities}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ActivityCard activity={item} isDark={true} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ListHeaderComponent={
              <View style={styles.headerComponent}>
                <CustomButton
                  title={STRINGS.ACTIVITY_TRACKING.LOG_ACTIVITY}
                  onPress={() => setModalVisible(true)}
                  variant="primary"
                  style={styles.addButton}
                />
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                title="No Activities Yet"
                description={STRINGS.ACTIVITY_TRACKING.NO_ACTIVITIES}
                actionTitle="Log Your First Activity"
                onActionPress={() => setModalVisible(true)}
              />
            }
          />
        )
      ) : (
        <StepsLogsTab />
      )}

      {/* Interactive Activity Logging Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardAvoiding}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📝 Log Workout Plan</Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                scrollEnabled={parentScrollEnabled}
                contentContainerStyle={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Card 1: Select Activity */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardTitle}>🎯 Select Activity Type</Text>
                  
                  {/* Search Bar Input */}
                  <View style={styles.modalSearchBar}>
                    <TextInput
                      style={styles.modalSearchInput}
                      placeholder="Search exercise..."
                      placeholderTextColor="#94a3b8"
                      value={modalSearchQuery}
                      onChangeText={text => {
                        setModalSearchQuery(text);
                      }}
                    />
                  </View>

                  {/* Master Category Pills */}
                  <View style={{ maxHeight: 60, marginVertical: 8 }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.modalPillsScroll}
                      keyboardShouldPersistTaps="handled"
                    >
                      <TouchableOpacity
                        style={[styles.modalPill, modalSelectedPill === 'ALL' && styles.modalPillActive]}
                        onPress={() => setModalSelectedPill('ALL')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.modalPillText, modalSelectedPill === 'ALL' && styles.modalPillTextActive]}>
                          🎽 ALL ({modalCounts.ALL || 0})
                        </Text>
                      </TouchableOpacity>

                      {Array.from(new Set(catalogActivities.map(e => e.categoryName).filter(Boolean))).map((catName: string) => {
                        const count = modalCounts[catName] || 0;
                        const isActive = modalSelectedPill === catName;
                        let friendlyName = catName;
                        if (catName.includes('&')) {
                          friendlyName = catName.split('&')[0].trim();
                        }
                        if (friendlyName.length > 18) {
                          friendlyName = friendlyName.slice(0, 16) + '...';
                        }
                        return (
                          <TouchableOpacity
                            key={catName}
                            style={[styles.modalPill, isActive && styles.modalPillActive]}
                            onPress={() => setModalSelectedPill(catName)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.modalPillText, isActive && styles.modalPillTextActive]}>
                              🏷️ {friendlyName} ({count})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Main exercise results list */}
                  <View style={{ marginTop: 8 }}>
                    {modalSelectedPill === null ? (
                      /* Popular Workouts Block (first 4 items of catalogActivities) */
                      <View style={styles.popularBlock}>
                        <Text style={styles.sectionTitle}>🔥 POPULAR WORKOUTS RIGHT NOW</Text>
                        <View style={styles.popularList}>
                          {catalogActivities.slice(0, 4).map(item => {
                            const isSelected = activityType.toLowerCase() === (item.displayName || item.activityName || '').toLowerCase();
                            const emoji = getActivityEmoji(item.activityName, item.categoryName);
                            return (
                              <TouchableOpacity
                                key={item.activityCode}
                                style={[styles.card, isSelected && styles.cardActive]}
                                onPress={() => {
                                  setActivityType(item.displayName || item.activityName);
                                  setSelectedDynamicActivity(item);
                                  const band = (item.intensityBand || '').toUpperCase();
                                  setSliderVal(band === 'LIGHT' ? 3.0 : band === 'VIGOROUS' || band === 'VIGOUR' ? 8.0 : 5.0);
                                }}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.cardEmoji}>{emoji}</Text>
                                <View style={styles.cardTextWrapper}>
                                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>
                                    {item.displayName || item.activityName}
                                  </Text>
                                  <Text style={styles.cardSub}>{item.activityName}</Text>
                                </View>
                                <View
                                  style={[
                                    styles.badge,
                                    item.primaryMode === 'telemetry' ? styles.badgeTelemetry : styles.badgeManual,
                                  ]}
                                >
                                  <Text style={styles.badgeText}>
                                    {item.primaryMode === 'telemetry' ? '⌚ Auto' : '✍️ Manual'}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ) : modalSelectedPill !== 'ALL' && modalCounts[modalSelectedPill] > 8 ? (
                      /* If count > 8, render section mapping by Intensity Band */
                      <View>
                        {getModalSectionData().map((section, secIdx) => (
                          <React.Fragment key={secIdx}>
                            <View style={{ marginBottom: 12 }}>
                              <View style={styles.modalSectionHeader}>
                                <Text style={styles.modalSectionHeaderText}>{section.title}</Text>
                              </View>
                              <View style={styles.popularList}>
                                {section.data.map(item => {
                                  const isSelected = activityType.toLowerCase() === (item.displayName || item.activityName || '').toLowerCase();
                                  const emoji = getActivityEmoji(item.activityName, item.categoryName);
                                  return (
                                    <TouchableOpacity
                                      key={item.activityCode}
                                      style={[styles.card, isSelected && styles.cardActive]}
                                      onPress={() => {
                                        setActivityType(item.displayName || item.activityName);
                                        setSelectedDynamicActivity(item);
                                        const band = (item.intensityBand || '').toUpperCase();
                                        setSliderVal(band === 'LIGHT' ? 3.0 : band === 'VIGOROUS' || band === 'VIGOUR' ? 8.0 : 5.0);
                                      }}
                                      activeOpacity={0.8}
                                    >
                                      <Text style={styles.cardEmoji}>{emoji}</Text>
                                      <View style={styles.cardTextWrapper}>
                                        <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>
                                          {item.displayName || item.activityName}
                                        </Text>
                                        <Text style={styles.cardSub}>{item.activityName}</Text>
                                      </View>
                                      <View
                                        style={[
                                          styles.badge,
                                          item.primaryMode === 'telemetry' ? styles.badgeTelemetry : styles.badgeManual,
                                        ]}
                                      >
                                        <Text style={styles.badgeText}>
                                          {item.primaryMode === 'telemetry' ? '⌚ Auto' : '✍️ Manual'}
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>
                          </React.Fragment>
                        ))}
                      </View>
                    ) : (
                      /* Flat mapping of matching entries */
                      <View style={styles.popularList}>
                        {currentModalList.map(item => {
                          const isSelected = activityType.toLowerCase() === (item.displayName || item.activityName || '').toLowerCase();
                          const emoji = getActivityEmoji(item.activityName, item.categoryName);
                          return (
                            <TouchableOpacity
                              key={item.activityCode}
                              style={[styles.card, isSelected && styles.cardActive]}
                              onPress={() => {
                                setActivityType(item.displayName || item.activityName);
                                setSelectedDynamicActivity(item);
                                const band = (item.intensityBand || '').toUpperCase();
                                setSliderVal(band === 'LIGHT' ? 3.0 : band === 'VIGOROUS' || band === 'VIGOUR' ? 8.0 : 5.0);
                              }}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.cardEmoji}>{emoji}</Text>
                              <View style={styles.cardTextWrapper}>
                                <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>
                                  {item.displayName || item.activityName}
                                </Text>
                                <Text style={styles.cardSub}>{item.activityName}</Text>
                              </View>
                              <View
                                style={[
                                  styles.badge,
                                  item.primaryMode === 'telemetry' ? styles.badgeTelemetry : styles.badgeManual,
                                ]}
                              >
                                <Text style={styles.badgeText}>
                                  {item.primaryMode === 'telemetry' ? '⌚ Auto' : '✍️ Manual'}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                        {currentModalList.length === 0 && (
                          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#64748B', fontSize: 14 }}>No workouts found matching query.</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>

                {/* Card 2: Settings & Intensity */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardTitle}>
                    ⚡ Settings & Intensity
                  </Text>

                  {/* Contextual Modifiers */}
                  {activeRegistryItem.category === 'strength' ? (
                    <View style={[styles.inputGroup, { zIndex: 10 }]}>
                      <Text style={styles.label}>Select Training Target Profile</Text>
                      <TouchableOpacity
                        style={styles.dropdownSelector}
                        onPress={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.dropdownSelectorText}>{trainingProfile}</Text>
                        <Text style={styles.dropdownArrow}>{profileDropdownOpen ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                      
                      {profileDropdownOpen && (
                        <View style={styles.dropdownOptionsContainer}>
                          {['Working Set', 'Warmup', 'To Failure'].map(option => (
                            <TouchableOpacity
                              key={option}
                              style={[
                                styles.dropdownOptionItem,
                                trainingProfile === option && styles.dropdownOptionItemActive
                              ]}
                              onPress={() => {
                                setTrainingProfile(option);
                                setProfileDropdownOpen(false);
                              }}
                            >
                              <Text style={[
                                styles.dropdownOptionText,
                                trainingProfile === option && styles.dropdownOptionTextActive
                              ]}>{option}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Contextual Modifiers</Text>

                      {/* Row 1: High-Intensity & Active Recovery */}
                      <View style={styles.modifiersRow}>
                        <TouchableOpacity
                          style={[
                            styles.modifierButton,
                            highIntensity && styles.modifierButtonActive,
                          ]}
                          onPress={() => {
                            setHighIntensity(!highIntensity);
                            if (!highIntensity) {
                              setStrengthRest(false);
                              setActiveRecovery(false);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.modifierText,
                              highIntensity && styles.modifierTextActive,
                            ]}
                          >
                            ⚡ High-Intensity (+1.5 METs)
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.modifierButton,
                            activeRecovery && styles.modifierButtonActive,
                          ]}
                          onPress={() => {
                            setActiveRecovery(!activeRecovery);
                            if (!activeRecovery) {
                              setHighIntensity(false);
                              setStrengthRest(false);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.modifierText,
                              activeRecovery && styles.modifierTextActive,
                            ]}
                          >
                            🚶 Active Recovery (-0.5 METs)
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Row 2: Strength Rest (Centered below) */}
                      <View
                        style={[
                          styles.modifiersRow,
                          { marginTop: 8, justifyContent: 'center' },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.modifierButton,
                            { flex: 0, width: '48.5%' },
                            strengthRest && styles.modifierButtonActive,
                          ]}
                          onPress={() => {
                            setStrengthRest(!strengthRest);
                            if (!strengthRest) {
                              setHighIntensity(false);
                              setActiveRecovery(false);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.modifierText,
                              strengthRest && styles.modifierTextActive,
                            ]}
                          >
                            🧘 Strength Rest (-1.0 METs)
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                {/* Sync Smart Wearable Toggle Switch */}
                <View
                  style={[
                    styles.syncWearableContainer,
                    { marginBottom: syncWearable ? theme.spacing.md : 0 },
                  ]}
                >
                  <Text style={styles.syncWearableLabel}>
                    SYNC FROM APPLE WATCH/FITNESS TRACKER
                  </Text>
                  <Switch
                    value={syncWearable}
                    onValueChange={setSyncWearable}
                    trackColor={{ false: '#334155', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#334155"
                  />
                </View>

                {syncWearable && (
                  <View
                    style={[styles.wearableSyncInfoCard, { marginBottom: 0 }]}
                  >
                    <Text style={styles.wearableSyncInfoText}>
                      ⌚ Wearable Sync Enabled: Active Calories, Heart Rate, and
                      duration will be fetched automatically from your connected
                      wearable device.
                    </Text>
                  </View>
                )}
                <View style={{ marginBottom: 15 }} />

                {/* Card 3: Workout Metrics */}
                {(!syncWearable ||
                  activeRegistryItem?.category === 'strength') && (
                  <View style={styles.formCard}>
                    <Text style={styles.formCardTitle}>📊 Workout Metrics</Text>

                    {!syncWearable && (
                      <>
                        {/* Duration Input - Scroll Wheel */}
                        <Text style={[styles.label, { textAlign: 'center', marginBottom: 8 }]}>Duration (minutes)</Text>
                        <View style={styles.pickerContainer}>
                          <View style={styles.activeSelectionBox} />

                          <FlatList
                            ref={flatListRef}
                            data={PICKER_DATA}
                            keyExtractor={(_, index) => `min-${index}`}
                            nestedScrollEnabled={true}
                            onTouchStart={() => setParentScrollEnabled(false)}
                            onTouchEnd={() => setParentScrollEnabled(true)}
                            onMomentumScrollEnd={() => setParentScrollEnabled(true)}
                            renderItem={({ item, index }) => {
                              const isSelected = item === parseInt(duration);
                              if (item === '') {
                                return <View style={{ height: ITEM_HEIGHT }} />;
                              }
                              return (
                                <TouchableOpacity
                                  activeOpacity={0.7}
                                  onPress={() => {
                                    setDuration(item.toString());
                                    flatListRef.current?.scrollToIndex({ index: index - 1, animated: true });
                                  }}
                                  style={styles.pickerItem}
                                >
                                  <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                                    {item}
                                  </Text>
                                  {isSelected && (
                                    <Text style={styles.minutesLabel}>MINUTES</Text>
                                  )}
                                </TouchableOpacity>
                              );
                            }}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            getItemLayout={(_, index) => ({
                              length: ITEM_HEIGHT,
                              offset: ITEM_HEIGHT * index,
                              index,
                            })}
                            initialScrollIndex={29} // Index 29 maps to value 30
                            contentContainerStyle={styles.pickerContent}
                          />
                        </View>

                        {/* RPE Scale Section */}
                        <View style={styles.rpeSection}>
                          <View style={styles.rpeLabelRow}>
                            <Text style={styles.rpeTitle}>RPE Scale (Intensity)</Text>
                            <View style={styles.rpeBadge}>
                              <Text style={styles.rpeBadgeText}>
                                {rpe} - {getRpeDescription(rpe)}
                              </Text>
                            </View>
                          </View>
                          <View 
                            ref={trackRef}
                            onLayout={(e) => {
                              trackWidth.current = e.nativeEvent.layout.width;
                            }}
                            style={styles.rpeTrack}
                            {...panResponder.panHandlers}
                          >
                            {/* Active filled track */}
                            <View 
                              style={[
                                styles.rpeFill, 
                                { width: `${((sliderVal - 1) / 9) * 100}%` }
                              ]} 
                            />
                            {/* Thumb */}
                            <View 
                              style={[
                                styles.rpeThumb, 
                                { left: `${((sliderVal - 1) / 9) * 100}%` }
                              ]} 
                            />
                          </View>
                          <View style={styles.rpeScaleLabels}>
                            <Text style={styles.scaleLabelText}>2</Text>
                            <Text style={styles.scaleLabelText}>4</Text>
                            <Text style={styles.scaleLabelText}>6</Text>
                            <Text style={styles.scaleLabelText}>8</Text>
                            <Text style={styles.scaleLabelText}>10</Text>
                          </View>
                        </View>

                        {/* Segmented Donut Ring Breakdown */}
                        <View style={styles.breakdownCard}>
                          <View style={styles.svgWrapper}>
                            <Svg width={110} height={110} viewBox="0 0 110 110">
                              <G transform="rotate(-90, 55, 55)">
                                {/* Background static base ring */}
                                <Circle
                                  cx={55}
                                  cy={55}
                                  r={radius}
                                  stroke="#E2E8F0"
                                  strokeWidth={10}
                                  fill="transparent"
                                />
                                
                                {/* Segment 1: Cardio */}
                                <G transform={`rotate(${segments.cardio.rotation}, 55, 55)`}>
                                  <AnimatedCircle
                                    cx={55}
                                    cy={55}
                                    r={radius}
                                    stroke={segments.cardio.color}
                                    strokeWidth={10}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={getInterpolatedOffset(segments.cardio.percentage)}
                                    strokeLinecap="round"
                                  />
                                </G>

                                {/* Segment 2: Strength */}
                                <G transform={`rotate(${segments.strength.rotation}, 55, 55)`}>
                                  <AnimatedCircle
                                    cx={55}
                                    cy={55}
                                    r={radius}
                                    stroke={segments.strength.color}
                                    strokeWidth={10}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={getInterpolatedOffset(segments.strength.percentage)}
                                    strokeLinecap="round"
                                  />
                                </G>

                                {/* Segment 3: Balance */}
                                <G transform={`rotate(${segments.balance.rotation}, 55, 55)`}>
                                  <AnimatedCircle
                                    cx={55}
                                    cy={55}
                                    r={radius}
                                    stroke={segments.balance.color}
                                    strokeWidth={10}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={getInterpolatedOffset(segments.balance.percentage)}
                                    strokeLinecap="round"
                                  />
                                </G>

                                {/* Segment 4: Recovery */}
                                <G transform={`rotate(${segments.recovery.rotation}, 55, 55)`}>
                                  <AnimatedCircle
                                    cx={55}
                                    cy={55}
                                    r={radius}
                                    stroke={segments.recovery.color}
                                    strokeWidth={10}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={getInterpolatedOffset(segments.recovery.percentage)}
                                    strokeLinecap="round"
                                  />
                                </G>
                              </G>
                            </Svg>
                          </View>

                          {/* Legend Grid */}
                          <View style={styles.legendWrapper}>
                            <View style={styles.legendRow}>
                              <View style={[styles.legendDot, { backgroundColor: '#06B6D4' }]} />
                              <Text style={styles.legendText}>Cardio: {breakdown.cardioPct}%</Text>
                            </View>
                            <View style={styles.legendRow}>
                              <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                              <Text style={styles.legendText}>Strength: {breakdown.strengthPct}%</Text>
                            </View>
                            <View style={styles.legendRow}>
                              <View style={[styles.legendDot, { backgroundColor: '#2DD4BF' }]} />
                              <Text style={styles.legendText}>Balance: {breakdown.balancePct}%</Text>
                            </View>
                            <View style={styles.legendRow}>
                              <View style={[styles.legendDot, { backgroundColor: '#FB923C' }]} />
                              <Text style={styles.legendText}>Recovery: {breakdown.recoveryPct}%</Text>
                            </View>
                          </View>
                        </View>

                        {/* Distance Input (Conditional) */}
                        {isDistanceBased && (
                          <View
                            style={[styles.inputGroup, { marginTop: theme.spacing.lg, marginBottom: 0 }]}
                          >
                            <Text style={styles.label}>Distance (KM)</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="e.g. 2.5"
                              placeholderTextColor={theme.colors.textLight}
                              keyboardType="numeric"
                              value={distance}
                              onChangeText={setDistance}
                            />
                            {parsedDuration > 0 && parsedDistance > 0 && (
                              <View style={styles.velocityContainer}>
                                <Text style={styles.velocityText}>
                                  ⚡ Live Velocity Speed:{' '}
                                  {liveVelocity.toFixed(1)} km/h
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </>
                    )}

                    {/* Resistance Parameters (Strength workouts) */}
                    {activeRegistryItem?.category === 'strength' && (
                      <LinearGradient
                        colors={['#4f46e5', '#3730a3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.flatten([
                          styles.strengthParamsContainer,
                          {
                            marginBottom: 0,
                            marginTop: !syncWearable ? theme.spacing.lg : 0,
                          },
                        ])}
                      >
                        <Text style={styles.sectionHeader}>
                          🏋️‍♂️ Resistance Parameters
                        </Text>
                        <View style={styles.paramsRow}>
                          <View style={styles.paramInputGroup}>
                            <Text style={styles.paramLabel}>Sets</Text>
                            <TextInput
                              style={styles.paramInput}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="rgba(255, 255, 255, 0.4)"
                              value={sets}
                              onChangeText={setSets}
                            />
                          </View>
                          <View style={styles.paramInputGroup}>
                            <Text style={styles.paramLabel}>Reps</Text>
                            <TextInput
                              style={styles.paramInput}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="rgba(255, 255, 255, 0.4)"
                              value={reps}
                              onChangeText={setReps}
                            />
                          </View>
                          <View style={styles.paramInputGroup}>
                            <Text style={styles.paramLabel}>Weight (kg)</Text>
                            <TextInput
                              style={styles.paramInput}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="rgba(255, 255, 255, 0.4)"
                              value={weightKg}
                              onChangeText={setWeightKg}
                            />
                          </View>
                        </View>
                      </LinearGradient>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <CustomButton
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="outline"
                  style={styles.footerButton}
                />
                <CustomButton
                  title="Save Workout"
                  onPress={handleSaveActivity}
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                  style={styles.footerButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={seeAllVisible}
        onRequestClose={() => setSeeAllVisible(false)}
      >
        <View style={styles.searchModalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.searchModalKeyboardAvoiding}
          >
            <View style={styles.searchModalContent}>
              {/* Header */}
              <View style={styles.searchModalHeader}>
                <Text style={styles.searchModalTitle}>
                  🔍 All Activity Types
                </Text>
                <TouchableOpacity
                  onPress={() => setSeeAllVisible(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search activity..."
                  placeholderTextColor={theme.colors.textLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
              </View>

              {/* List of filtered activities */}
              {searchLoading ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={{ marginTop: 8, color: theme.colors.textSecondary }}>Searching catalog...</Text>
                </View>
              ) : (
                <ScrollView
                  contentContainerStyle={styles.searchScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {dynamicActivities.length === 0 ? (
                    <View style={{ padding: 24, alignItems: 'center' }}>
                      <Text style={{ color: theme.colors.textSecondary }}>No exercises found.</Text>
                    </View>
                  ) : (
                    dynamicActivities.map((item: any) => {
                      const isSelected = activityType === item.activityName;
                      const itemEmoji = getActivityEmoji(item.activityName, item.categoryName);
                      return (
                        <TouchableOpacity
                          key={item.activityCode + '-' + item.activityName}
                          style={[
                            styles.searchRowItem,
                            isSelected && styles.searchRowItemActive,
                          ]}
                          onPress={() => {
                            setActivityType(item.activityName);
                            setSelectedDynamicActivity(item);
                            
                            setSelectedCategory(item.categoryName || 'General');
                            
                            setSeeAllVisible(false);
                            setSearchQuery('');
                          }}
                        >
                          <Text style={styles.searchRowEmoji}>{itemEmoji}</Text>
                          <Text
                            style={[
                              styles.searchRowText,
                              isSelected && styles.searchRowTextActive,
                            ]}
                          >
                            {item.activityName}
                          </Text>
                          {isSelected && (
                            <Text style={styles.searchRowCheck}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={benefitsVisible}
        onRequestClose={() => setBenefitsVisible(false)}
      >
        <View style={styles.benefitsModalContainer}>
          <View style={styles.benefitsContent}>
            {lastLoggedSummary &&
              (() => {
                const workoutName = lastLoggedSummary.type || 'Workout';

                const formattedTime = new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const hpp =
                  Math.round(
                    ((lastLoggedSummary.cardioPoints || 0) / 11) * 10,
                  ) / 10;

                const pillars = getPillarBreakdown(
                  lastLoggedSummary.gainPoints,
                  lastLoggedSummary.category,
                );

                return (
                  <View style={styles.benefitContainerFull}>
                    {/* Title Header Bar (recreated matching screenshot header layout) */}
                    <View style={styles.benefitHeaderBar}>
                      <View style={styles.headerIconCircle}>
                        <Text style={styles.headerIconEmoji}>
                          {lastLoggedSummary.emoji || '🧘'}
                        </Text>
                      </View>
                      <View style={styles.headerTextCol}>
                        <Text style={styles.headerWorkoutTitle}>
                          {lastLoggedSummary.duration} {workoutName}
                        </Text>
                        <Text style={styles.headerWorkoutTime}>
                          🕒 {formattedTime}
                        </Text>
                      </View>
                    </View>

                    <ScrollView
                      style={styles.benefitsScrollView}
                      contentContainerStyle={styles.benefitsScrollViewContent}
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={styles.innerContentWrapper}>
                        {/* Exercise Benefit Summary Section */}
                        <Text style={styles.sectionTitleLabel}>
                          Logged Exercise Benefits
                        </Text>

                        <View style={styles.summaryGrid}>
                          {/* Active Energy Column */}
                          <View style={styles.summaryCol}>
                            <View style={[styles.colBadgeCircle, styles.colBadgeActiveEnergy]}>
                              <Text style={styles.colEmoji}>🔥</Text>
                            </View>
                            <Text style={styles.colLabel}>
                              TOTAL ACTIVE{'\n'}ENERGY BURNT:
                            </Text>
                            <Text style={styles.colValueMain}>
                              {lastLoggedSummary.calories}
                            </Text>
                            <Text style={styles.colValueSub}>
                              ({500}){'\n'}KCAL
                            </Text>
                          </View>

                          {/* Gain Points Column */}
                          <View style={styles.summaryCol}>
                            <View style={[styles.colBadgeCircle, styles.colBadgeGainPoints]}>
                              <Text style={styles.colEmoji}>💓</Text>
                            </View>
                            <Text style={styles.colLabel}>
                              TOTAL GAIN{'\n'}POINTS:
                            </Text>
                            <Text style={styles.colValueMain}>
                              {lastLoggedSummary.gainPoints}
                            </Text>
                            <Text style={styles.colValueSub}>
                              ({300}){'\n'}PTS
                            </Text>
                          </View>

                          {/* Heart Points Column */}
                          <View style={styles.summaryCol}>
                            <View style={[styles.colBadgeCircle, styles.colBadgeHeartPoints]}>
                              <Text style={styles.colEmoji}>❤️</Text>
                            </View>
                            <Text style={styles.colLabel}>
                              TOTAL{'\n'}HEART POINT:
                            </Text>
                            <Text style={styles.colValueMain}>{hpp}</Text>
                            <Text style={styles.colValueSub}>
                              ({(10.0).toFixed(1)}){'\n'}HPP
                            </Text>
                          </View>
                        </View>

                        {/* Card 2: Circular Ring and Pillars Grid */}
                        <View style={styles.card2Container}>
                          {/* Row: Circle on left, Cardio/Agility on right */}
                          <View style={styles.card2Row}>
                            {/* Circle Progress */}
                            {renderCircularProgress(
                              lastLoggedSummary.gainPoints,
                              300,
                            )}

                            {/* Cardio & Agility Columns */}
                            <View style={styles.card2RightCol}>
                              {/* Cardio */}
                              <View style={styles.cardioBarContainer}>
                                <Text style={styles.barTitleText}>Cardio</Text>
                                <Text style={styles.barSubtitleText}>
                                  Cardiovascular
                                </Text>
                                <View style={styles.barTrack}>
                                  <View
                                    style={[
                                      styles.barFill,
                                      {
                                        width: `${
                                          (pillars.cardio /
                                            pillars.cardioTarget) *
                                          100
                                        }%`,
                                        backgroundColor: '#ef4444',
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={styles.barValueText}>
                                  {pillars.cardio}/{pillars.cardioTarget}
                                </Text>
                              </View>

                              {/* Agility */}
                              <View>
                                <Text style={styles.barTitleText}>Agility</Text>
                                <Text style={styles.barSubtitleText}>
                                  Agility: {pillars.agility} (
                                  {pillars.agilityTarget}) Pts
                                </Text>
                                <View style={styles.barTrack}>
                                  <View
                                    style={[
                                      styles.barFill,
                                      {
                                        width: `${
                                          (pillars.agility /
                                            pillars.agilityTarget) *
                                          100
                                        }%`,
                                        backgroundColor: '#22c55e',
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={styles.barValueText}>
                                  {pillars.agility}/{pillars.agilityTarget}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Bottom Row: Metabolic and Structural */}
                          <View style={styles.card2BottomRow}>
                            {/* Metabolic */}
                            <View style={styles.card2HalfColLeft}>
                              <Text style={styles.barTitleText}>Metabolic</Text>
                              <Text style={styles.barSubtitleText}>
                                Cellular
                              </Text>
                              <View style={styles.barTrack}>
                                <View
                                  style={[
                                    styles.barFill,
                                    {
                                      width: `${
                                        (pillars.metabolic /
                                          pillars.metabolicTarget) *
                                        100
                                      }%`,
                                      backgroundColor: '#06b6d4',
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={styles.barValueText}>
                                {pillars.metabolic}/{pillars.metabolicTarget}
                              </Text>
                            </View>

                            {/* Structural */}
                            <View style={styles.card2HalfColRight}>
                              <Text style={styles.barTitleText}>
                                Structural
                              </Text>
                              <Text style={styles.barSubtitleText}>
                                Skeletal/Muscular
                              </Text>
                              <View style={styles.barTrack}>
                                <View
                                  style={[
                                    styles.barFill,
                                    {
                                      width: `${
                                        (pillars.structural /
                                          pillars.structuralTarget) *
                                        100
                                      }%`,
                                      backgroundColor: '#3b82f6',
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={styles.barValueText}>
                                {pillars.structural}/{pillars.structuralTarget}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Today's Logged Exercises Section (from Screenshot 2) */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setBenefitsVisible(false);
                            setActiveScreen('Dashboard');
                          }}
                          style={styles.goToDashboardLink}
                        >
                          <Text style={styles.goToDashboardLinkText}>
                            👉 Click here to see your fitness score
                          </Text>
                        </TouchableOpacity>

                        {/* Understand Action Button (only single button now) */}
                        <TouchableOpacity
                          style={styles.understandBtn}
                          onPress={() => setBenefitsVisible(false)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.understandBtnText}>
                            Understand
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                );
              })()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  modalSearchBar: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  modalSearchInput: {
    color: '#F8FAFC',
    fontSize: 15,
  },
  modalPillsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  modalPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  modalPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalPillTextActive: {
    color: '#FFFFFF',
  },
  popularBlock: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
    marginBottom: 10,
  },
  popularList: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  cardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E293B',
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardTitleActive: {
    color: '#3B82F6',
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTelemetry: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  badgeManual: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#0F172A',
  },
  modalSectionHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  pickerContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#0F172A',
  },
  activeSelectionBox: {
    position: 'absolute',
    height: ITEM_HEIGHT,
    width: '100%',
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
    borderWidth: 1.5,
    borderRadius: 16,
  },
  pickerContent: {
    paddingVertical: 0,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#64748B',
  },
  pickerItemTextActive: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3B82F6',
  },
  minutesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginTop: 2,
  },
  rpeSection: {
    width: '100%',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  rpeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rpeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
  },
  rpeBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rpeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  rpeTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    position: 'relative',
    justifyContent: 'center',
  },
  rpeFill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  rpeThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#3B82F6',
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  rpeScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 6,
  },
  scaleLabelText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  breakdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    width: '100%',
    paddingVertical: 12,
    marginVertical: 12,
  },
  svgWrapper: {
    marginRight: 24,
  },
  legendWrapper: {
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  listContent: {
    padding: theme.spacing.containerPadding,
    flexGrow: 1,
  },
  headerComponent: {
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalKeyboardAvoiding: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: theme.spacing.borderRadiusLg,
    borderTopRightRadius: theme.spacing.borderRadiusLg,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: theme.spacing.lg,
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  formCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#F1F5F9',
    marginBottom: theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  labelNoMargin: {
    fontSize: 14.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#F1F5F9',
  },
  showAllTextLink: {
    fontSize: 14,
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  optionsScroll: {
    paddingVertical: 4,
    gap: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  searchModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  searchModalKeyboardAvoiding: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalContent: {
    backgroundColor: '#0F172A',
    borderRadius: theme.spacing.borderRadiusLg,
    width: '90%',
    height: 650,
    maxHeight: '95%',
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  searchModalTitle: {
    fontSize: 16.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
  searchBarContainer: {
    padding: theme.spacing.md,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#1E293B',
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    color: '#FFFFFF',
  },
  searchScroll: {
    padding: theme.spacing.sm,
  },
  searchRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.borderRadiusMd,
    marginBottom: 4,
  },
  searchRowItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  searchRowEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  searchRowText: {
    fontSize: 14.5,
    color: '#E2E8F0',
    flex: 1,
  },
  searchRowTextActive: {
    fontWeight: theme.fonts.weights.bold as any,
    color: '#818cf8',
  },
  searchRowCheck: {
    fontSize: 16,
    color: '#818cf8',
    fontWeight: 'bold',
  },
  optionItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  optionEmoji: {
    fontSize: 17,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: theme.fonts.weights.medium as any,
  },
  optionTextActive: {
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: theme.spacing.borderRadiusMd,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  syncWearableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: theme.spacing.lg,
  },
  syncWearableLabel: {
    fontSize: 12.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#94A3B8',
    letterSpacing: 0.3,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  wearableSyncInfoCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  wearableSyncInfoText: {
    fontSize: 13.5,
    color: '#10B981',
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: theme.fonts.weights.medium as any,
  },
  velocityContainer: {
    marginTop: theme.spacing.xs,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.borderRadiusMd,
  },
  velocityText: {
    fontSize: 13.5,
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  ratingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  moodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: theme.fonts.weights.medium as any,
  },
  moodTextActive: {
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  rpeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  rpeButton: {
    width: '18%',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rpeText: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  strengthParamsContainer: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  paramsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  paramInputGroup: {
    flex: 1,
  },
  paramLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#e0e7ff',
    marginBottom: theme.spacing.xs,
  },
  paramInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  modifiersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  modifierButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modifierButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  modifierText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: theme.fonts.weights.medium as any,
    textAlign: 'center',
  },
  modifierTextActive: {
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  dropdownSelectorText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: theme.fonts.weights.medium as any,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#94A3B8',
  },
  dropdownOptionsContainer: {
    marginTop: 4,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  dropdownOptionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  dropdownOptionItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  dropdownOptionTextActive: {
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  previewCard: {
    backgroundColor: theme.colors.primaryLight + '30',
    borderColor: theme.colors.primary + '30',
    borderWidth: 1.5,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  previewCardTitle: {
    fontSize: 14,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  previewMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  previewMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  previewMetricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  previewMetricValue: {
    fontSize: 14.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  previewSplitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.primary + '20',
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  previewSplitText: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
  },
  boldText: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  benefitsModalContainer: {
    flex: 1,
    backgroundColor: '#070913e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsContent: {
    backgroundColor: '#0f172a',
    borderRadius: 28,
    width: '92%',
    height: '93%',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 20,
  },
  benefitContainerFull: {
    flex: 1,
    width: '100%',
  },
  benefitHeaderBar: {
    width: '100%',
    backgroundColor: '#1e1b4b',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  innerContentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sectionTitleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
    width: '100%',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#151f32',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  colBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colEmoji: {
    fontSize: 18,
  },
  colLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 6,
    height: 32,
    lineHeight: 12,
  },
  colValueMain: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 4,
  },
  colValueSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 11,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconEmoji: {
    fontSize: 22,
  },
  headerTextCol: {
    flex: 1,
  },
  headerWorkoutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerWorkoutTime: {
    fontSize: 12.5,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  headerChevron: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '700',
  },
  benefitsScrollView: {
    width: '100%',
    flex: 1,
  },
  benefitsScrollViewContent: {
    alignItems: 'center',
  },
  colBadgeActiveEnergy: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  colBadgeGainPoints: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  colBadgeHeartPoints: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  cardioBarContainer: {
    marginBottom: 12,
  },
  card2Container: {
    width: '100%',
    backgroundColor: '#151f32',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginTop: 12,
  },
  card2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  card2RightCol: {
    flex: 1,
    marginLeft: 16,
  },
  card2BottomRow: {
    flexDirection: 'row',
    width: '100%',
  },
  card2HalfColLeft: {
    flex: 1,
    marginRight: 8,
  },
  card2HalfColRight: {
    flex: 1,
    marginLeft: 8,
  },
  circularProgressContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressCenterText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  circularProgressLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  circularProgressTarget: {
    position: 'absolute',
    bottom: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  barTitleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  barSubtitleText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 1,
  },
  overviewBarsContainer: {
    width: '100%',
    backgroundColor: '#151f32',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  overviewBarRow: {
    marginBottom: 12,
  },
  barHeaderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabelText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  barValueText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 2,
  },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  concentricOuterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#151f32',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
  },
  concentricWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  concentricCenterText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
  },
  concentricLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  concentricValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  ringLabelOverlay: {
    marginLeft: 16,
    justifyContent: 'center',
    height: 120,
  },
  ringLabelItemText: {
    fontSize: 11,
    fontWeight: '800',
    position: 'relative',
  },
  summaryFooterText: {
    fontSize: 13.5,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 18,
    lineHeight: 18,
  },
  goToDashboardLink: {
    alignSelf: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    marginTop: 24,
    marginBottom: 24,
  },
  goToDashboardLinkText: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  understandBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  understandBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerContainer: {
    backgroundColor: '#0B0F19',
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#FFFFFF',
  },
  headerButton: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  headerIcon: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
    fontWeight: theme.fonts.weights.medium as any,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  borderError: {
    borderColor: theme.colors.error,
  },
  categoryTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 0,
    marginBottom: theme.spacing.md,
    backgroundColor: '#0F172A',
    padding: 2,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  categoryTabsRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: '#0F172A',
    padding: 6,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.spacing.borderRadiusMd - 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: theme.fonts.weights.medium as any,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fonts.weights.bold as any,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0E1626',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151E33',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepsPlaceholderContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  stepsPlaceholderCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    width: '100%',
    maxWidth: 340,
  },
  stepsPlaceholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  stepsPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepsPlaceholderDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
});

export default ActivityTrackingScreen;

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import {
  GENDER_OPTIONS,
  GenderOptionType,
  normalizeGender,
} from '../../utils/helpers';

type PhaseType = 'general' | 'providers';
type OccupationOptionType = 'Working Professional' | 'Student' | 'Homemaker' | 'Retired';

const OCCUPATION_OPTIONS: { id: OccupationOptionType; label: string; icon: string }[] = [
  { id: 'Working Professional', label: 'Working Professional', icon: '💼' },
  { id: 'Student', label: 'Student', icon: '🎓' },
  { id: 'Homemaker', label: 'Homemaker', icon: '🏡' },
  { id: 'Retired', label: 'Retired', icon: '🏖️' },
];
import {
  IServiceProvider,
  ProviderCategory,
  ICustomProviderPayload,
  IRegisterProvidersPayload,
} from './types';
import { CATEGORIES_CONFIG } from './mockData';
import { styles } from './styles';
import { useDrawer } from '../../navigation/DrawerContext';

export const ServiceProvidersScreen: React.FC = () => {
  const { setActiveScreen } = useDrawer();
  // Phase 1 vs Phase 2 State
  const [activePhase, setActivePhase] = useState<PhaseType>('general');

  // Phase 1: General Information States
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [uhid, setUhid] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<GenderOptionType | ''>('');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [occupation, setOccupation] = useState<OccupationOptionType>('Working Professional');
  const [universityName, setUniversityName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [city, setCity] = useState<string>('');

  // Dynamic API Directory State
  const [directory, setDirectory] = useState<Record<ProviderCategory, IServiceProvider[]>>({
    hospital: [],
    lab: [],
    physician: [],
    gym: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Custom Alert / Success Feedback Modal State
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [alertButtonText, setAlertButtonText] = useState<string>('');
  const [alertSuccessTarget, setAlertSuccessTarget] = useState<'providers' | 'fitness_challenges' | null>(null);

  // Selected Providers State (In-memory, dynamic)
  const [selectedProviders, setSelectedProviders] = useState<IServiceProvider[]>([]);
  // Server-saved providers state (tracks what came from GET or was last successfully saved)
  const [serverRegisteredProviders, setServerRegisteredProviders] = useState<IServiceProvider[]>([]);

  // All 4 categories start CLOSED by default
  const [expandedCategories, setExpandedCategories] = useState<
    Record<ProviderCategory, boolean>
  >({
    hospital: false,
    lab: false,
    physician: false,
    gym: false,
  });

  // Category-specific search filters for dropdowns
  const [categorySearch, setCategorySearch] = useState<Record<ProviderCategory, string>>({
    hospital: '',
    lab: '',
    physician: '',
    gym: '',
  });

  // Modal State for Adding Custom Provider
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [formCategory, setFormCategory] = useState<ProviderCategory>('hospital');
  const [formName, setFormName] = useState<string>('');
  const [formSubtext, setFormSubtext] = useState<string>('');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formState, setFormState] = useState<string>('');
  const [formCity, setFormCity] = useState<string>('');
  const [formPincode, setFormPincode] = useState<string>('');
  const [formArea, setFormArea] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Custom added providers list (dynamic in-memory)
  const [customProviders, setCustomProviders] = useState<IServiceProvider[]>([]);

  // Load providers & profile from backend API on mount
  useEffect(() => {
    const initialize = async () => {
      const cached = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      const targetUhid = cached?.uhid || '';
      fetchUserProfileData();
      fetchProviders(targetUhid);
    };
    initialize();
  }, []);

  const fetchUserProfileData = async () => {
    try {
      setProfileLoading(true);
      const cached = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      const targetUhid = cached?.uhid || '';

      if (cached?.uhid) setUhid(cached.uhid);
      if (cached?.name) setName(cached.name);
      const cachedGender = normalizeGender(cached?.gender);
      if (cachedGender) setGender(cachedGender);
      if (cached?.age && Number(cached.age) > 0) setAge(String(cached.age));
      if (cached?.weight && Number(cached.weight) > 0) setWeight(String(cached.weight));
      if (cached?.height && Number(cached.height) > 0) setHeight(String(cached.height));
      if (cached?.occupation) setOccupation(cached.occupation as OccupationOptionType);
      if (cached?.universityName) setUniversityName(cached.universityName);
      if (cached?.department) setDepartment(cached.department);
      if (cached?.companyName) setCompanyName(cached.companyName);
      if (cached?.location) setLocation(cached.location);
      if (cached?.city) setCity(cached.city);

      if (!targetUhid) {
        return;
      }

      const data = await apiService.getUserProfile(targetUhid);
      if (data) {
        if (data.uhid) setUhid(data.uhid);
        if (data.name) setName(data.name);
        const apiGender = normalizeGender(data.gender);
        if (apiGender) setGender(apiGender);
        if (data.age && Number(data.age) > 0) {
          setAge(String(data.age));
        }
        if (data.weight && Number(data.weight) > 0) {
          setWeight(String(data.weight));
        }
        if (data.height && Number(data.height) > 0) {
          setHeight(String(data.height));
        }
        if (data.occupation) {
          setOccupation(data.occupation as OccupationOptionType);
        }
        if (data.universityName) setUniversityName(data.universityName);
        if (data.department) setDepartment(data.department);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.location) setLocation(data.location);
        if (data.city) setCity(data.city);
      }
    } catch (err) {
      console.warn('[ServiceProviders] Failed to load user profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchProviders = async (passedUhid?: string) => {
    try {
      setIsLoading(true);
      const currentUhid =
        passedUhid ||
        uhid ||
        (await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE))?.uhid ||
        '';

      const data = await apiService.getHealthServiceProviders(currentUhid);
      const customList = data?.customProviders || [];

      // Helper to find custom metadata for an item
      const findCustom = (item: any) =>
        customList.find(
          (c: any) =>
            String(c.id) === String(item.id) ||
            (c.name &&
              item.name &&
              c.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
              c.category &&
              item.category &&
              c.category.trim().toLowerCase() === item.category.trim().toLowerCase()),
        );

      const dedupeList = (list: IServiceProvider[]): IServiceProvider[] => {
        const seen = new Set<string>();
        return list.filter(item => {
          const key = (item.name || '').trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      const hospitals = dedupeList(
        (data?.hospitals || []).map(item => {
          const custom = findCustom(item);
          return {
            ...item,
            category: 'hospital' as ProviderCategory,
            subtext: item.subtext || custom?.specialty,
            address: item.address || custom?.address,
            phone: item.phone || custom?.phone,
            state: item.state || custom?.state,
            city: item.city || custom?.city,
            pincode: item.pincode || custom?.pincode,
            area: item.area || custom?.area,
            isSelected: item.isSelected !== undefined ? item.isSelected : true,
          };
        }),
      );

      const labs = dedupeList(
        (data?.labs || []).map(item => {
          const custom = findCustom(item);
          return {
            ...item,
            category: 'lab' as ProviderCategory,
            subtext: item.subtext || custom?.specialty,
            address: item.address || custom?.address,
            phone: item.phone || custom?.phone,
            state: item.state || custom?.state,
            city: item.city || custom?.city,
            pincode: item.pincode || custom?.pincode,
            area: item.area || custom?.area,
            isSelected: item.isSelected !== undefined ? item.isSelected : true,
          };
        }),
      );

      const physicians = dedupeList(
        (data?.physicians || []).map(item => {
          const custom = findCustom(item);
          return {
            ...item,
            category: 'physician' as ProviderCategory,
            subtext: item.subtext || custom?.specialty,
            address: item.address || custom?.address,
            phone: item.phone || custom?.phone,
            state: item.state || custom?.state,
            city: item.city || custom?.city,
            pincode: item.pincode || custom?.pincode,
            area: item.area || custom?.area,
            isSelected: item.isSelected !== undefined ? item.isSelected : true,
          };
        }),
      );

      const gyms = dedupeList(
        (data?.gyms || []).map(item => {
          const custom = findCustom(item);
          return {
            ...item,
            category: 'gym' as ProviderCategory,
            subtext: item.subtext || custom?.specialty,
            address: item.address || custom?.address,
            phone: item.phone || custom?.phone,
            state: item.state || custom?.state,
            city: item.city || custom?.city,
            pincode: item.pincode || custom?.pincode,
            area: item.area || custom?.area,
            isSelected: item.isSelected !== undefined ? item.isSelected : true,
          };
        }),
      );

      setDirectory({
        hospital: hospitals,
        lab: labs,
        physician: physicians,
        gym: gyms,
      });

      // Loaded custom providers list (only keep items not already in the category directory lists)
      const isAlreadyInDirectory = (name?: string, category?: string) => {
        if (!name || !category) return false;
        const cat = category.toLowerCase();
        const list =
          cat === 'hospital'
            ? hospitals
            : cat === 'lab'
            ? labs
            : cat === 'physician'
            ? physicians
            : gyms;
        return list.some(
          d => d.name.trim().toLowerCase() === name.trim().toLowerCase(),
        );
      };

      const loadedCustomProviders: IServiceProvider[] = customList
        .filter((c: any) => !isAlreadyInDirectory(c.name, c.category))
        .map((c: any) => ({
          id: `custom_${c.id || Date.now()}`,
          category: (c.category || 'hospital').toLowerCase() as ProviderCategory,
          name: c.name || '',
          subtext: c.specialty || '',
          address: c.address || '',
          phone: c.phone || '',
          state: c.state || '',
          city: c.city || '',
          pincode: c.pincode || '',
          area: c.area || '',
          tags: [c.area, c.city, 'CUSTOM'].filter(Boolean),
          isSelected: true,
        }));
      setCustomProviders(loadedCustomProviders);

      // Pre-fill selected providers from GET API response:
      const serverSelected: IServiceProvider[] = [
        ...hospitals.filter(h => h.isSelected),
        ...labs.filter(l => l.isSelected),
        ...physicians.filter(p => p.isSelected),
        ...gyms.filter(g => g.isSelected),
        ...loadedCustomProviders.filter(cp => cp.isSelected),
      ];

      const seenSelected = new Set<string>();
      const uniqueSelected = serverSelected.filter(s => {
        const key = `${s.category}_${s.name.trim().toLowerCase()}`;
        if (seenSelected.has(key)) return false;
        seenSelected.add(key);
        return true;
      });

      setSelectedProviders(uniqueSelected);
      setServerRegisteredProviders(uniqueSelected);
    } catch (err) {
      console.warn('[ServiceProviders] Failed to fetch providers:', err);
      Alert.alert(
        'Connection Notice',
        'Unable to load live service providers directory. Pull down to retry.',
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activePhase === 'general') {
      await fetchUserProfileData();
    } else {
      await fetchProviders();
    }
    setRefreshing(false);
  };

  // Toggle Category Dropdown
  const toggleCategory = (cat: ProviderCategory) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // SELECT PROVIDER FROM DROPDOWN:
  // Auto-closes the category dropdown immediately upon selection
  const handleSelectOption = (item: IServiceProvider) => {
    const isAlreadySelected = selectedProviders.some(
      p =>
        p.id === item.id ||
        (p.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
          p.category === item.category),
    );

    if (isAlreadySelected) {
      // Already selected - keep selection and auto-close collapse
      setExpandedCategories(prev => ({
        ...prev,
        [item.category]: false,
      }));
      return;
    }

    // Check if category already has 1 provider selected
    const existingCount = selectedProviders.filter(
      p => p.category === item.category,
    ).length;

    if (existingCount >= 1) {
      const categoryName =
        CATEGORIES_CONFIG[item.category]?.title?.split('/')[0] || 'Provider';
      setAlertTitle(`${categoryName} Limit Reached`);
      setAlertMessage(
        `You can add only 1 ${categoryName}. You have already registered a ${categoryName}. Only one provider per category is permitted.`,
      );
      setAlertType('warning');
      setAlertModalVisible(true);
      return;
    }

    setSelectedProviders(prev => [...prev, item]);

    // AUTO-CLOSE THE COLLAPSE IMMEDIATELY UPON SELECTION
    setExpandedCategories(prev => ({
      ...prev,
      [item.category]: false,
    }));
  };


  // OPEN MODAL FOR CUSTOM ADD
  const handleOpenAddModal = (cat: ProviderCategory = 'hospital') => {
    const existingCount = selectedProviders.filter(p => p.category === cat).length;
    if (existingCount >= 1) {
      const categoryName =
        CATEGORIES_CONFIG[cat]?.title?.split('/')[0] || 'Provider';
      setAlertTitle(`${categoryName} Limit Reached`);
      setAlertMessage(
        `You can add only 1 ${categoryName}. You have already registered a ${categoryName}. Only one provider per category is permitted.`,
      );
      setAlertType('warning');
      setAlertModalVisible(true);
      return;
    }

    setFormCategory(cat);
    setFormName('');
    setFormSubtext('');
    setFormAddress('');
    setFormState('');
    setFormCity('');
    setFormPincode('');
    setFormArea('');
    setFormPhone('');
    setFormNotes('');
    setIsAddModalVisible(true);
  };

  // SAVE CUSTOM PROVIDER:
  // Dynamically adds custom provider and displays it in the closed collapse
  const handleSaveCustomProvider = () => {
    if (!formName.trim()) {
      setAlertTitle('Missing Name');
      setAlertMessage('Please enter a valid facility or provider name.');
      setAlertType('warning');
      setAlertModalVisible(true);
      return;
    }

    const existingCount = selectedProviders.filter(
      p => p.category === formCategory,
    ).length;
    if (existingCount >= 1) {
      const categoryName =
        CATEGORIES_CONFIG[formCategory]?.title?.split('/')[0] || 'Provider';
      setAlertTitle(`${categoryName} Limit Reached`);
      setAlertMessage(
        `You can add only 1 ${categoryName}. You have already added a ${categoryName}.`,
      );
      setAlertType('warning');
      setAlertModalVisible(true);
      return;
    }

    const newProvider: IServiceProvider = {
      id: `custom_${Date.now()}`,
      category: formCategory,
      name: formName.trim(),
      subtext: formSubtext.trim() || undefined,
      address: formAddress.trim() || undefined,
      state: formState.trim() || undefined,
      city: formCity.trim() || undefined,
      pincode: formPincode.trim() || undefined,
      area: formArea.trim() || undefined,
      phone: formPhone.trim() || undefined,
      notes: formNotes.trim() || undefined,
      tags: [CATEGORIES_CONFIG[formCategory].title, 'Custom Added'],
      isPrimary: false,
      isSelected: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Add to custom providers & selected providers
    setCustomProviders(prev => [newProvider, ...prev]);
    setSelectedProviders(prev => [...prev, newProvider]);

    // AUTO-CLOSE COLLAPSE SO IT IS VISIBLE IN THE CLOSED COLLAPSE
    setExpandedCategories(prev => ({
      ...prev,
      [formCategory]: false,
    }));

    setIsAddModalVisible(false);
  };

  // HANDLE SUBMIT: GENERAL INFORMATION -> SUCCESS MODAL -> SERVICE PROVIDERS
  const handleNextToServiceProviders = async () => {
    const missingFields: string[] = [];
    if (!gender) missingFields.push('gender');
    if (!age.trim()) missingFields.push('age');
    if (!weight.trim()) missingFields.push('weight');
    if (!height.trim()) missingFields.push('height');

    if (missingFields.length > 0) {
      setAlertTitle('Missing Information');
      setAlertMessage(
        `Please select/enter your ${missingFields.join(', ')} to proceed.`,
      );
      setAlertType('warning');
      setAlertButtonText('Dismiss');
      setAlertSuccessTarget(null);
      setAlertModalVisible(true);
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload = {
        uhid,
        name,
        gender,
        age: parseInt(age, 10) || 0,
        weight: parseFloat(weight) || 0,
        height: parseFloat(height) || 0,
        calorieGoal: 2400,
        occupation,
        universityName: occupation === 'Student' ? universityName.trim() : undefined,
        department: occupation === 'Student' ? department.trim() : undefined,
        companyName: occupation === 'Working Professional' ? companyName.trim() : undefined,
        location: location.trim() || undefined,
        city: city.trim() || undefined,
      };

      console.log('[ServiceProviders] Saving setupProfile:', payload);
      const res = await apiService.setupProfile(payload);

      const cached = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      const updatedProfile: UserProfile = {
        ...(cached || {}),
        uhid,
        name,
        gender: payload.gender,
        age: payload.age,
        weight: payload.weight,
        height: payload.height,
        calorieGoal: 2400,
        isSetupComplete: true,
        occupation: payload.occupation,
        universityName: payload.universityName,
        department: payload.department,
        companyName: payload.companyName,
        location: payload.location,
        city: payload.city,
      };
      await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, updatedProfile);

      const successMsg =
        res?.message ||
        res?.data?.message ||
        res?.msg ||
        'Profile information saved successfully.';
      setAlertTitle('Profile Updated');
      setAlertMessage(successMsg);
      setAlertType('success');
      setAlertButtonText('Go to Service Providers');
      setAlertSuccessTarget('providers');
      setAlertModalVisible(true);
    } catch (error: any) {
      console.error('[ServiceProviders] setupProfile error:', error);
      setAlertTitle('Save Error');
      setAlertMessage(
        error?.response?.data?.message ||
          'Failed to update general information. Please check your network and try again.'
      );
      setAlertType('error');
      setAlertButtonText('Dismiss');
      setAlertSuccessTarget(null);
      setAlertModalVisible(true);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // REGISTER BUTTON ACTION (DYNAMIC API CALL)
  const handleRegisterProviders = async () => {
    if (selectedProviders.length === 0) {
      setAlertTitle('No Providers Selected');
      setAlertMessage(
        'Please select or add at least one hospital, lab, doctor, or gym before registering.',
      );
      setAlertType('warning');
      setAlertModalVisible(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure dynamic UHID is present
      const activeUhid =
        uhid.trim() ||
        (await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE))?.uhid?.trim() ||
        'LIVSCO4573';

      // Format all selected providers into customProviders array as expected by the new API
      const customPayloadList: ICustomProviderPayload[] = selectedProviders.map(p => ({
        category: p.category.toLowerCase(),
        name: p.name.trim(),
        specialty: (p.subtext || '').trim(),
        address: (p.address || '').trim(),
        phone: (p.phone || '').trim(),
        state: (p.state || 'Karnataka').trim(),
        city: (p.city || city || 'Bengaluru').trim(),
        pincode: (p.pincode || '560038').trim(),
        area: (p.area || location || 'Indiranagar').trim(),
      }));

      const payload: IRegisterProvidersPayload = {
        uhid: activeUhid,
        customProviders: customPayloadList,
      };

      console.log('[ServiceProviders] Registering payload:', JSON.stringify(payload, null, 2));
      const response = await apiService.registerServiceProviders(payload);

      setAlertTitle('Registration Successful');
      setAlertMessage(
        response?.message ||
          `Successfully registered ${selectedProviders.length} service provider(s) with MoveHub.`,
      );
      setAlertType('success');
      setAlertButtonText("Let's Move");
      setAlertSuccessTarget('fitness_challenges');
      setAlertModalVisible(true);
      setServerRegisteredProviders(selectedProviders);

      const cachedProf = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      if (cachedProf) {
        await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, {
          ...cachedProf,
          isSetupComplete: true,
        });
      }

      // Re-fetch to keep prefilled and UI state synchronized with backend
      await fetchProviders(activeUhid);
    } catch (err: any) {
      console.error('[ServiceProviders] Registration failed:', err);
      const msg =
        err?.response?.data?.message ||
        'Failed to register service providers. Please check your internet connection.';
      setAlertTitle('Registration Error');
      setAlertMessage(msg);
      setAlertType('error');
      setAlertModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tracks whether the user has newly selected or changed any provider compared to server state
  const hasPendingChanges = useMemo(() => {
    if (selectedProviders.length === 0) return false;
    if (selectedProviders.length !== serverRegisteredProviders.length) return true;

    const serverKeys = new Set(
      serverRegisteredProviders.map(
        s => `${s.category}_${(s.name || '').trim().toLowerCase()}`,
      ),
    );

    return selectedProviders.some(
      p => !serverKeys.has(`${p.category}_${(p.name || '').trim().toLowerCase()}`),
    );
  }, [selectedProviders, serverRegisteredProviders]);

  // Total Available Directory Counts (Deduplicated unique count per category)
  const availableCounts = useMemo(() => {
    const getCount = (catKey: ProviderCategory) => {
      const raw = [
        ...customProviders.filter(p => p.category === catKey),
        ...(directory[catKey] || []),
      ];
      const seen = new Set<string>();
      return raw.filter(item => {
        const key = item.name.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).length;
    };

    return {
      hospital: getCount('hospital'),
      lab: getCount('lab'),
      physician: getCount('physician'),
      gym: getCount('gym'),
    };
  }, [directory, customProviders]);

  // Selected counts by category
  const selectedCounts = useMemo(() => {
    return {
      hospital: selectedProviders.filter(p => p.category === 'hospital').length,
      lab: selectedProviders.filter(p => p.category === 'lab').length,
      physician: selectedProviders.filter(p => p.category === 'physician').length,
      gym: selectedProviders.filter(p => p.category === 'gym').length,
      total: selectedProviders.length,
    };
  }, [selectedProviders]);

  const categoryKeys: ProviderCategory[] = ['hospital', 'lab', 'physician', 'gym'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Dark Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="#080C15" />

      {/* Top Header */}
      <CustomHeader
        title="Profile"
        showDrawerButton={true}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Two-Phase Tabs */}
      <View style={styles.phaseStepperContainer}>
        <TouchableOpacity
          style={[
            styles.phaseStepTab,
            activePhase === 'general' && styles.phaseStepTabActive,
          ]}
          onPress={() => setActivePhase('general')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.phaseStepLabel,
              activePhase === 'general' && styles.phaseStepLabelActive,
            ]}
            numberOfLines={1}
          >
            General Information
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.phaseStepTab,
            activePhase === 'providers' && styles.phaseStepTabActive,
          ]}
          onPress={() => setActivePhase('providers')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.phaseStepLabel,
              activePhase === 'providers' && styles.phaseStepLabelActive,
            ]}
            numberOfLines={1}
          >
            Service Provider
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {activePhase === 'general' ? (
          profileLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading profile data...</Text>
            </View>
          ) : (
            <View>
              {/* Card 1: Personal Biometrics */}
              <View style={styles.profileCard}>
                <View style={styles.profileCardHeader}>
                  <Text style={styles.profileCardIcon}>🎯</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileCardTitle}>Personal Biometrics</Text>
                    <Text style={styles.profileCardSubtitle}>
                      Core metrics prefilled from your health record
                    </Text>
                  </View>
                </View>
                <View style={styles.profileDivider} />

                {/* Name (Read-only / Unchangeable) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={[styles.inputField, styles.disabledInputField]}
                    value={name}
                    editable={false}
                    placeholder="Full Name"
                    placeholderTextColor="#64748B"
                  />
                  <View style={styles.lockBadge}>
                    <Text style={{ fontSize: 10 }}>🔒</Text>
                    <Text style={styles.lockBadgeText}>Read-only (Unchangeable)</Text>
                  </View>
                </View>

                {/* Gender Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Gender *</Text>
                  <View style={styles.genderChipsRow}>
                    {GENDER_OPTIONS.map(opt => {
                      const isSelected = gender === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.genderChip,
                            isSelected && styles.genderChipActive,
                          ]}
                          activeOpacity={0.75}
                          onPress={() => setGender(opt.id)}
                        >
                          <Text style={styles.genderChipIcon}>{opt.icon}</Text>
                          <Text
                            style={[
                              styles.genderChipText,
                              isSelected && styles.genderChipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Age, Weight, Height Row */}
                <View style={styles.formRow}>
                  <View style={[styles.inputGroup, styles.formCol]}>
                    <Text style={styles.inputLabel}>Age *</Text>
                    <TextInput
                      style={styles.inputField}
                      value={age}
                      onChangeText={setAge}
                      placeholder="e.g. 30"
                      placeholderTextColor="#64748B"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.formCol]}>
                    <Text style={styles.inputLabel}>Weight (kg) *</Text>
                    <TextInput
                      style={styles.inputField}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="e.g. 70.0"
                      placeholderTextColor="#64748B"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.formCol]}>
                    <Text style={styles.inputLabel}>Height (cm) *</Text>
                    <TextInput
                      style={styles.inputField}
                      value={height}
                      onChangeText={setHeight}
                      placeholder="e.g. 170.0"
                      placeholderTextColor="#64748B"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Card 2: Professional & Location Info */}
              <View style={styles.profileCard}>
                <View style={styles.profileCardHeader}>
                  <Text style={styles.profileCardIcon}>💼</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileCardTitle}>Professional & Location</Text>
                    <Text style={styles.profileCardSubtitle}>
                      Demographic details for customized fitness recommendations
                    </Text>
                  </View>
                </View>
                <View style={styles.profileDivider} />

                {/* Occupation Chips */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Occupation</Text>
                  <View style={styles.occupationChipsContainer}>
                    {OCCUPATION_OPTIONS.map(opt => {
                      const isSelected = occupation === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.occupationChip,
                            isSelected && styles.occupationChipActive,
                          ]}
                          activeOpacity={0.7}
                          onPress={() => setOccupation(opt.id)}
                        >
                          <Text style={{ fontSize: 13 }}>{opt.icon}</Text>
                          <Text
                            style={[
                              styles.occupationChipText,
                              isSelected && styles.occupationChipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Conditional Fields based on Occupation */}
                {occupation === 'Working Professional' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Company / Employer Name</Text>
                    <TextInput
                      style={styles.inputField}
                      value={companyName}
                      onChangeText={setCompanyName}
                      placeholder="e.g. Google"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                )}

                {occupation === 'Student' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>University / College Name</Text>
                      <TextInput
                        style={styles.inputField}
                        value={universityName}
                        onChangeText={setUniversityName}
                        placeholder="e.g. Delhi University"
                        placeholderTextColor="#64748B"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Department / Field of Study</Text>
                      <TextInput
                        style={styles.inputField}
                        value={department}
                        onChangeText={setDepartment}
                        placeholder="e.g. Computer Science"
                        placeholderTextColor="#64748B"
                      />
                    </View>
                  </>
                )}

                {/* Location and City */}
                <View style={styles.formRow}>
                  <View style={[styles.inputGroup, styles.formCol]}>
                    <Text style={styles.inputLabel}>Area / Locality</Text>
                    <TextInput
                      style={styles.inputField}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="e.g. Indiranagar"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.formCol]}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={styles.inputField}
                      value={city}
                      onChangeText={setCity}
                      placeholder="e.g. Bengaluru"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.nextPhaseBtn}
                activeOpacity={0.85}
                disabled={isSavingProfile}
                onPress={handleNextToServiceProviders}
              >
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.nextPhaseBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View>
        {/* 1. Hero Summary Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroEyebrowRow}>
              <View style={styles.heroEyebrowDot} />
              <Text style={styles.heroEyebrowText}>Care Network Registry</Text>
            </View>
            <TouchableOpacity
              style={styles.heroAddAllBtn}
              activeOpacity={0.8}
              onPress={() => {
                const availableCat = categoryKeys.find(
                  k => selectedProviders.filter(p => p.category === k).length === 0,
                );
                if (!availableCat) {
                  setAlertTitle('Limit Reached');
                  setAlertMessage(
                    'You have already registered 1 provider for each category (Hospital, Lab, Doctor, Gym). Maximum 1 provider per category is permitted.',
                  );
                  setAlertType('warning');
                  setAlertModalVisible(true);
                  return;
                }
                handleOpenAddModal(availableCat);
              }}
            >
              <Text style={styles.heroAddAllText}>+ Add Custom</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>Health Service Providers</Text>
          <Text style={styles.heroSubtitle}>
            Select or list your preferred hospitals, diagnostic labs, attending physicians, and gyms to sync with MoveHub.
          </Text>
           <Text style={styles.heroSubtitle}>
            This is not mandatory but highly recommended.
          </Text>

          {/* Quick Metrics Row showing live directory counts */}
          <View style={styles.heroStatsRow}>
            <TouchableOpacity
              style={styles.heroStatPill}
              activeOpacity={0.7}
              onPress={() => toggleCategory('hospital')}
            >
              <Text style={styles.heroStatIcon}>🏥</Text>
              <Text style={styles.heroStatCount}>{availableCounts.hospital}</Text>
              <Text style={styles.heroStatLabel}>Hospitals</Text>
              {selectedCounts.hospital > 0 && (
                <View style={styles.heroStatSelectedDot}>
                  <Text style={styles.heroStatSelectedText}>✓ {selectedCounts.hospital}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroStatPill}
              activeOpacity={0.7}
              onPress={() => toggleCategory('lab')}
            >
              <Text style={styles.heroStatIcon}>🧪</Text>
              <Text style={styles.heroStatCount}>{availableCounts.lab}</Text>
              <Text style={styles.heroStatLabel}>Labs</Text>
              {selectedCounts.lab > 0 && (
                <View style={styles.heroStatSelectedDot}>
                  <Text style={styles.heroStatSelectedText}>✓ {selectedCounts.lab}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroStatPill}
              activeOpacity={0.7}
              onPress={() => toggleCategory('physician')}
            >
              <Text style={styles.heroStatIcon}>👨‍⚕️</Text>
              <Text style={styles.heroStatCount}>{availableCounts.physician}</Text>
              <Text style={styles.heroStatLabel}>Doctors</Text>
              {selectedCounts.physician > 0 && (
                <View style={styles.heroStatSelectedDot}>
                  <Text style={styles.heroStatSelectedText}>✓ {selectedCounts.physician}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroStatPill}
              activeOpacity={0.7}
              onPress={() => toggleCategory('gym')}
            >
              <Text style={styles.heroStatIcon}>🏋️‍♂️</Text>
              <Text style={styles.heroStatCount}>{availableCounts.gym}</Text>
              <Text style={styles.heroStatLabel}>Gyms</Text>
              {selectedCounts.gym > 0 && (
                <View style={styles.heroStatSelectedDot}>
                  <Text style={styles.heroStatSelectedText}>✓ {selectedCounts.gym}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Indicator for Initial Load */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Fetching live healthcare network...</Text>
          </View>
        ) : null}

        {/* 2. The 4 Category Sections */}
        {categoryKeys.map(catKey => {
          const config = CATEGORIES_CONFIG[catKey];
          const isExpanded = !!expandedCategories[catKey];

          // Selected items for this category (displayed in the closed card)
          const categorySelectedItems = selectedProviders.filter(
            p => p.category === catKey,
          );

          // All selectable options for this category (live directory + custom added)
          const rawOptions = [
            ...customProviders.filter(p => p.category === catKey),
            ...(directory[catKey] || []),
          ];
          const seenKeys = new Set<string>();
          const allOptions = rawOptions.filter(opt => {
            const key = `${opt.category}_${opt.name.trim().toLowerCase()}`;
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
            return true;
          });

          // Filtered options based on category search input
          const searchQuery = categorySearch[catKey] || '';
          const filteredOptions = allOptions.filter(opt => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            return (
              opt.name.toLowerCase().includes(q) ||
              (opt.subtext && opt.subtext.toLowerCase().includes(q)) ||
              (opt.address && opt.address.toLowerCase().includes(q))
            );
          });

          return (
            <View
              key={catKey}
              style={[
                styles.categoryCard,
                {
                  borderColor: isExpanded
                    ? config.borderColor
                    : categorySelectedItems.length > 0
                    ? config.borderColor
                    : '#1E293B',
                },
              ]}
            >
              {/* Category Header Row (Tap to expand/collapse dropdown) */}
              <TouchableOpacity
                style={styles.categoryHeaderTouchable}
                activeOpacity={0.75}
                onPress={() => toggleCategory(catKey)}
              >
                <View style={styles.categoryHeaderTopRow}>
                  {/* Category Title & Icon */}
                  <View style={styles.categoryTitleGroup}>
                    <View
                      style={[
                        styles.categoryIconBox,
                        { backgroundColor: config.badgeBg },
                      ]}
                    >
                      <Text style={styles.categoryIconText}>{config.icon}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.categoryTitle}>
                      {config.title}
                    </Text>
                    {categorySelectedItems.length > 0 && (
                      <View
                        style={[
                          styles.categoryCountBadge,
                          { backgroundColor: config.badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryCountText,
                            { color: config.accentColor },
                          ]}
                        >
                          {categorySelectedItems.length}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Actions: Add Button + Dropdown Chevron */}
                  <View style={styles.categoryHeaderActions}>
                    {categorySelectedItems.length === 0 && (
                      <TouchableOpacity
                        style={[
                          styles.addCategoryBtn,
                          { backgroundColor: config.accentColor },
                        ]}
                        activeOpacity={0.7}
                        onPress={e => {
                          e.stopPropagation();
                          handleOpenAddModal(catKey);
                        }}
                      >
                        <Text style={styles.addCategoryIcon}>+</Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.chevronBox}>
                      <Text style={styles.chevronText}>
                        {isExpanded ? '▲' : '▼'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Subtitle / Instruction */}
                <Text style={styles.categoryInstruction}>
                  {config.instruction}
                </Text>

                {/* ========================================================= */}
                {/* SELECTED ITEMS PREVIEW (ALWAYS VISIBLE IN CLOSED COLLAPSE) */}
                {/* ========================================================= */}
                {categorySelectedItems.length > 0 ? (
                  <View style={styles.selectedPreviewContainer}>
                    {categorySelectedItems.map(item => (
                      <View
                        key={item.id}
                        style={[
                          styles.selectedItemPill,
                          { borderColor: config.borderColor },
                        ]}
                      >
                        <View style={styles.selectedItemTop}>
                          <View style={styles.selectedItemNameRow}>
                            <Text
                              style={[
                                styles.selectedCheckmark,
                                { color: config.accentColor },
                              ]}
                            >
                              ✓
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={styles.selectedItemName}
                            >
                              {item.name}
                            </Text>
                          </View>
                          {/* Cross button removed */}
                          <View />
                        </View>

                        {item.subtext ? (
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.selectedItemSubtext,
                              { color: config.accentColor },
                            ]}
                          >
                            {item.subtext}
                          </Text>
                        ) : null}

                        {item.address ? (
                          <View style={styles.selectedItemAddressRow}>
                            <Text style={{ fontSize: 11 }}>📍</Text>
                            <Text
                              numberOfLines={1}
                              style={styles.selectedAddressText}
                            >
                              {item.address}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : (
                  // If nothing is selected, subtle invite row
                  <View style={styles.emptySelectPrompt}>
                    <Text style={styles.emptySelectText}>
                      + Tap to Select or Add {config.title}
                    </Text>
                    <Text style={styles.emptySelectChevron}>▼</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* ========================================================= */}
              {/* DROPDOWN LIST (SHOWN ONLY WHEN USER OPENS/EXPANDS)        */}
              {/* ========================================================= */}
              {isExpanded && (
                <View style={styles.dropdownContainer}>
                  {/* Dropdown Quick Search */}
                  <View style={styles.dropdownSearchRow}>
                    <Text style={styles.dropdownSearchIcon}>🔍</Text>
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder={`Search or filter ${config.title.toLowerCase()}...`}
                      placeholderTextColor="#64748B"
                      value={categorySearch[catKey] || ''}
                      onChangeText={txt =>
                        setCategorySearch(prev => ({ ...prev, [catKey]: txt }))
                      }
                    />
                  </View>

                  {/* Dropdown Options Header Info */}
                  <View style={styles.dropdownHeaderInfoRow}>
                    <Text style={styles.dropdownHeaderInfoText}>
                      {filteredOptions.length} available {config.title.split('/')[0].toLowerCase()}
                    </Text>
                    <Text style={styles.dropdownHeaderInfoText}>
                      Tap to select
                    </Text>
                  </View>

                  {/* Selectable Options List */}
                  <View style={styles.dropdownList}>
                    {filteredOptions.length === 0 ? (
                      <Text style={styles.emptyDirectoryText}>
                        No {config.title.toLowerCase()} match your search.
                      </Text>
                    ) : (
                      filteredOptions.map(option => {
                        const isOptionSelected = selectedProviders.some(
                          p =>
                            p.id === option.id ||
                            (p.name.trim().toLowerCase() === option.name.trim().toLowerCase() &&
                              p.category === option.category),
                        );

                        return (
                          <TouchableOpacity
                            key={option.id}
                            style={[
                              styles.dropdownOptionCard,
                              isOptionSelected && [
                                styles.dropdownOptionCardSelected,
                                { borderColor: config.accentColor },
                              ],
                            ]}
                            activeOpacity={0.7}
                            onPress={() => handleSelectOption(option)}
                          >
                            <View style={styles.dropdownOptionLeft}>
                              <Text style={styles.dropdownOptionName}>
                                {option.name}
                              </Text>
                              {option.subtext ? (
                                <Text style={styles.dropdownOptionSubtext}>
                                  {option.subtext}
                                </Text>
                              ) : null}
                              {option.address ? (
                                <Text style={styles.dropdownOptionAddress}>
                                  📍 {option.address}
                                </Text>
                              ) : null}
                            </View>

                            {/* Checkbox indicator */}
                            <View
                              style={[
                                styles.dropdownSelectIndicator,
                                isOptionSelected && {
                                  backgroundColor: config.accentColor,
                                  borderColor: config.accentColor,
                                },
                              ]}
                            >
                              {isOptionSelected && (
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: '900',
                                  }}
                                >
                                  ✓
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}

                    {/* Bottom "+ Add Custom Provider" Button inside dropdown */}
                    {categorySelectedItems.length === 0 && (
                      <TouchableOpacity
                        style={styles.dropdownCustomAddRow}
                        activeOpacity={0.7}
                        onPress={() => handleOpenAddModal(catKey)}
                      >
                        <Text style={styles.dropdownCustomAddText}>
                          + Add Custom {config.title.split('/')[0]}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}
          </View>
        )}
      </ScrollView>

      {/* ========================================================= */}
      {/* 5. BOTTOM REGISTER BUTTON (DYNAMIC API REGISTRATION)       */}
      {/* ========================================================= */}
      {activePhase === 'providers' && (
      <View style={styles.registerBottomBar}>
        <TouchableOpacity
          style={[
            styles.registerBtn,
            (!hasPendingChanges || isSubmitting) && styles.registerBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!hasPendingChanges || isSubmitting}
          onPress={handleRegisterProviders}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.registerBtnText,
                (!hasPendingChanges || isSubmitting) && styles.registerBtnTextDisabled,
              ]}
            >
              {hasPendingChanges
                ? `Register Service Providers (${selectedProviders.length})`
                : serverRegisteredProviders.length > 0
                ? `Registered (${selectedProviders.length})`
                : 'Register Service Providers'}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.registerSubtext}>
          {hasPendingChanges
            ? 'Registers your selected healthcare & gym partners directly with MoveHub'
            : 'All selected healthcare & gym partners are registered with MoveHub'}
        </Text>
      </View>
      )}

      {/* ========================================================= */}
      {/* 6. ADD CUSTOM PROVIDER MODAL                               */}
      {/* ========================================================= */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Service Provider</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selector Chips */}
              <View style={styles.modalCategorySelector}>
                {categoryKeys.map(cat => {
                  const isSelected = formCategory === cat;
                  const cfg = CATEGORIES_CONFIG[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categorySelectChip,
                        isSelected && {
                          backgroundColor: cfg.badgeBg,
                          borderColor: cfg.accentColor,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text style={{ fontSize: 16 }}>{cfg.icon}</Text>
                      <Text
                        style={[
                          styles.categorySelectText,
                          isSelected && { color: cfg.accentColor },
                        ]}
                      >
                        {cfg.title.split('/')[0].split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Form Input: Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {formCategory === 'physician'
                    ? 'Doctor / Specialist Name *'
                    : 'Facility / Provider Name *'}
                </Text>
                <TextInput
                  style={styles.inputField}
                  placeholder={
                    formCategory === 'physician'
                      ? 'e.g. Dr. Rajesh Sharma, MD'
                      : formCategory === 'hospital'
                      ? 'e.g. Apollo Multispeciality Hospital'
                      : formCategory === 'lab'
                      ? 'e.g. Metropolis Diagnostic Center'
                      : "e.g. Cult.Fit / Gold's Gym"
                  }
                  placeholderTextColor="#64748B"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              {/* Form Input: Specialty / Subtext */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {formCategory === 'physician'
                    ? 'Specialization & Qualification'
                    : 'Specialty / Key Services'}
                </Text>
                <TextInput
                  style={styles.inputField}
                  placeholder={
                    formCategory === 'physician'
                      ? 'e.g. Cardiologist & Internal Medicine'
                      : formCategory === 'hospital'
                      ? 'e.g. Tertiary Emergency & ICU'
                      : formCategory === 'lab'
                      ? 'e.g. Pathology, Blood Tests & Lipid Profile'
                      : 'e.g. Strength, Functional HIIT & Cardio'
                  }
                  placeholderTextColor="#64748B"
                  value={formSubtext}
                  onChangeText={setFormSubtext}
                />
              </View>

              {/* Form Input: Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location / Address</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. 100ft Road, Near Metro"
                  placeholderTextColor="#64748B"
                  value={formAddress}
                  onChangeText={setFormAddress}
                />
              </View>

              {/* Form Input: State */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Karnataka"
                  placeholderTextColor="#64748B"
                  value={formState}
                  onChangeText={setFormState}
                />
              </View>

              {/* Form Input: City */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Bengaluru"
                  placeholderTextColor="#64748B"
                  value={formCity}
                  onChangeText={setFormCity}
                />
              </View>

              {/* Form Input: Pincode */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. 560038"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={formPincode}
                  onChangeText={setFormPincode}
                />
              </View>

              {/* Form Input: Area */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Area</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Indiranagar"
                  placeholderTextColor="#64748B"
                  value={formArea}
                  onChangeText={setFormArea}
                />
              </View>

              {/* Form Input: Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone Number</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                  value={formPhone}
                  onChangeText={setFormPhone}
                />
              </View>

              {/* Form Input: Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Personal Notes / Timings</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Primary OPD consultation / Tuesday visits"
                  placeholderTextColor="#64748B"
                  value={formNotes}
                  onChangeText={setFormNotes}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveModalBtn}
                activeOpacity={0.8}
                onPress={handleSaveCustomProvider}
              >
                <Text style={styles.saveModalBtnText}>
                  Save & Select Provider
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Alert / Success Feedback Modal */}
      <CustomAlertModal
        visible={alertModalVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText={alertButtonText || (alertType === 'success' ? 'Great!' : 'Dismiss')}
        onClose={() => {
          setAlertModalVisible(false);
          const target = alertSuccessTarget;
          setAlertSuccessTarget(null);
          setAlertButtonText('');

          if (alertType === 'success') {
            if (target === 'providers') {
              setActivePhase('providers');
            } else if (target === 'fitness_challenges' || alertTitle === 'Registration Successful') {
              setActivePhase('general');
              setActiveScreen('FitnessChallenges');
            }
          }
        }}
      />
    </SafeAreaView>
  );
};

export default ServiceProvidersScreen;

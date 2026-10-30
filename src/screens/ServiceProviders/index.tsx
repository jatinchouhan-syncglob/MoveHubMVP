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

export const ServiceProvidersScreen: React.FC = () => {
  // Phase 1 vs Phase 2 State
  const [activePhase, setActivePhase] = useState<PhaseType>('general');

  // Phase 1: General Information States
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [uhid, setUhid] = useState<string>('');
  const [name, setName] = useState<string>('');
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

  // Selected Providers State (In-memory, dynamic)
  const [selectedProviders, setSelectedProviders] = useState<IServiceProvider[]>([]);

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
    fetchUserProfileData();
    fetchProviders();
  }, []);

  const fetchUserProfileData = async () => {
    try {
      setProfileLoading(true);
      const cached = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      const targetUhid = cached?.uhid || '';

      if (cached?.uhid) setUhid(cached.uhid);
      if (cached?.name) setName(cached.name);
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

  const fetchProviders = async () => {
    try {
      const data = await apiService.getHealthServiceProviders();
      const hospitals = (data?.hospitals || []).map(item => ({
        ...item,
        category: 'hospital' as ProviderCategory,
      }));
      const labs = (data?.labs || []).map(item => ({
        ...item,
        category: 'lab' as ProviderCategory,
      }));
      const physicians = (data?.physicians || []).map(item => ({
        ...item,
        category: 'physician' as ProviderCategory,
      }));
      const gyms = (data?.gyms || []).map(item => ({
        ...item,
        category: 'gym' as ProviderCategory,
      }));

      setDirectory({
        hospital: hospitals,
        lab: labs,
        physician: physicians,
        gym: gyms,
      });

      // If backend returns any items with isSelected: true, reflect them
      const serverSelected: IServiceProvider[] = [
        ...hospitals.filter(h => h.isSelected),
        ...labs.filter(l => l.isSelected),
        ...physicians.filter(p => p.isSelected),
        ...gyms.filter(g => g.isSelected),
      ];

      if (serverSelected.length > 0) {
        setSelectedProviders(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const toAdd = serverSelected.filter(s => !existingIds.has(s.id));
          return [...prev, ...toAdd];
        });
      }
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
    const isAlreadySelected = selectedProviders.some(p => p.id === item.id);
    let updated: IServiceProvider[];

    if (isAlreadySelected) {
      // Toggle off / remove
      updated = selectedProviders.filter(p => p.id !== item.id);
    } else {
      // Add to selected list for this category
      updated = [...selectedProviders, item];
    }

    setSelectedProviders(updated);

    // AUTO-CLOSE THE COLLAPSE IMMEDIATELY UPON SELECTION
    setExpandedCategories(prev => ({
      ...prev,
      [item.category]: false,
    }));
  };

  // REMOVE SELECTED PROVIDER
  const handleRemoveSelected = (item: IServiceProvider) => {
    const updated = selectedProviders.filter(p => p.id !== item.id);
    setSelectedProviders(updated);
  };

  // OPEN MODAL FOR CUSTOM ADD
  const handleOpenAddModal = (cat: ProviderCategory = 'hospital') => {
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

  // HANDLE NEXT: GENERAL INFORMATION -> SERVICE PROVIDERS
  const handleNextToServiceProviders = async () => {
    if (!age.trim() || !weight.trim() || !height.trim()) {
      setAlertTitle('Missing Information');
      setAlertMessage('Please enter your age, weight, and height to proceed.');
      setAlertType('warning');
      setAlertModalVisible(true);
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload = {
        uhid,
        name,
        age: parseInt(age, 10) || 30,
        weight: parseFloat(weight) || 70,
        height: parseFloat(height) || 170,
        calorieGoal: 2400,
        occupation,
        universityName: occupation === 'Student' ? universityName.trim() : undefined,
        department: occupation === 'Student' ? department.trim() : undefined,
        companyName: occupation === 'Working Professional' ? companyName.trim() : undefined,
        location: location.trim() || undefined,
        city: city.trim() || undefined,
      };

      console.log('[ServiceProviders] Saving setupProfile:', payload);
      await apiService.setupProfile(payload);

      const cached = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      const updatedProfile: UserProfile = {
        ...(cached || {}),
        uhid,
        name,
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

      setActivePhase('providers');
    } catch (error: any) {
      console.error('[ServiceProviders] setupProfile error:', error);
      setAlertTitle('Save Error');
      setAlertMessage(
        error?.response?.data?.message ||
          'Failed to update general information. Please check your network and try again.'
      );
      setAlertType('error');
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
        '';

      // Extract selected IDs from the fetched directory
      const selectedProviderIds = selectedProviders
        .filter(p => !p.id.startsWith('custom_'))
        .map(p => p.id);

      // Extract custom providers formatted as required by backend (small case keys and values)
      const customPayloadList: ICustomProviderPayload[] = selectedProviders
        .filter(p => p.id.startsWith('custom_'))
        .map(p => ({
          category: p.category.toLowerCase(),
          name: p.name,
          specialty: p.subtext || '',
          address: p.address || '',
          state: (p.state || '').trim().toLowerCase(),
          city: (p.city || '').trim().toLowerCase(),
          pincode: (p.pincode || '').trim().toLowerCase(),
          area: (p.area || '').trim().toLowerCase(),
          uhid: activeUhid.toLowerCase(),
          phone: p.phone || '',
        }));

      const payload: IRegisterProvidersPayload = {
        uhid: activeUhid,
        selectedProviderIds,
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
      setAlertModalVisible(true);
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

  // Total Available Directory Counts (Real live API count + custom added)
  const availableCounts = useMemo(() => {
    return {
      hospital:
        (directory.hospital?.length || 0) +
        customProviders.filter(p => p.category === 'hospital').length,
      lab:
        (directory.lab?.length || 0) +
        customProviders.filter(p => p.category === 'lab').length,
      physician:
        (directory.physician?.length || 0) +
        customProviders.filter(p => p.category === 'physician').length,
      gym:
        (directory.gym?.length || 0) +
        customProviders.filter(p => p.category === 'gym').length,
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

      {/* Two-Phase Stepper */}
      <View style={styles.phaseStepperContainer}>
        <TouchableOpacity
          style={[
            styles.phaseStepTab,
            activePhase === 'general' && styles.phaseStepTabActive,
          ]}
          onPress={() => setActivePhase('general')}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.phaseStepNumberBox,
              activePhase === 'general' && styles.phaseStepNumberBoxActive,
            ]}
          >
            <Text
              style={[
                styles.phaseStepNumberText,
                activePhase === 'general' && styles.phaseStepNumberTextActive,
              ]}
            >
              1
            </Text>
          </View>
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

        <View style={styles.phaseArrowContainer}>
          <Text style={styles.phaseArrowText}>→</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.phaseStepTab,
            activePhase === 'providers' && styles.phaseStepTabActive,
          ]}
          onPress={() => setActivePhase('providers')}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.phaseStepNumberBox,
              activePhase === 'providers' && styles.phaseStepNumberBoxActive,
            ]}
          >
            <Text
              style={[
                styles.phaseStepNumberText,
                activePhase === 'providers' && styles.phaseStepNumberTextActive,
              ]}
            >
              2
            </Text>
          </View>
          <Text
            style={[
              styles.phaseStepLabel,
              activePhase === 'providers' && styles.phaseStepLabelActive,
            ]}
            numberOfLines={1}
          >
            Service Providers
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

              {/* Next Button */}
              <TouchableOpacity
                style={styles.nextPhaseBtn}
                activeOpacity={0.85}
                disabled={isSavingProfile}
                onPress={handleNextToServiceProviders}
              >
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.nextPhaseBtnText}>Next: Service Providers</Text>
                    <Text style={styles.nextPhaseBtnArrow}>→</Text>
                  </>
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
              onPress={() => handleOpenAddModal('hospital')}
            >
              <Text style={styles.heroAddAllText}>+ Add Custom</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>Health Service Providers</Text>
          <Text style={styles.heroSubtitle}>
            Select or list your preferred hospitals, diagnostic labs, attending physicians, and gyms to sync with MoveHub.
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
          const allOptions = [
            ...customProviders.filter(p => p.category === catKey),
            ...(directory[catKey] || []),
          ];

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
                          {/* Remove Selected Button */}
                          <TouchableOpacity
                            style={styles.removeItemBtn}
                            activeOpacity={0.7}
                            onPress={e => {
                              e.stopPropagation();
                              handleRemoveSelected(item);
                            }}
                          >
                            <Text style={styles.removeItemText}>✕</Text>
                          </TouchableOpacity>
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
                          p => p.id === option.id,
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
                    <TouchableOpacity
                      style={styles.dropdownCustomAddRow}
                      activeOpacity={0.7}
                      onPress={() => handleOpenAddModal(catKey)}
                    >
                      <Text style={styles.dropdownCustomAddText}>
                        + Add Custom {config.title.split('/')[0]}
                      </Text>
                    </TouchableOpacity>
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
          style={[styles.registerBtn, isSubmitting && styles.registerBtnDisabled]}
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={handleRegisterProviders}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.registerBtnText}>
              Register Service Providers {selectedProviders.length > 0 ? `(${selectedProviders.length})` : ''}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.registerSubtext}>
          Registers your selected healthcare & gym partners directly with MoveHub
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
        buttonText={alertType === 'success' ? 'Great!' : 'Dismiss'}
        onClose={() => {
          setAlertModalVisible(false);
          if (alertType === 'success' && alertTitle === 'Registration Successful') {
            setActivePhase('general');
          }
        }}
      />
    </SafeAreaView>
  );
};

export default ServiceProvidersScreen;

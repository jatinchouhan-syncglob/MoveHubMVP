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
import {
  IServiceProvider,
  ProviderCategory,
  ICustomProviderPayload,
  IRegisterProvidersPayload,
} from './types';
import { CATEGORIES_CONFIG } from './mockData';
import { styles } from './styles';

export const ServiceProvidersScreen: React.FC = () => {
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
  const [formPhone, setFormPhone] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Custom added providers list (dynamic in-memory)
  const [customProviders, setCustomProviders] = useState<IServiceProvider[]>([]);

  // Load providers from backend API on mount
  useEffect(() => {
    fetchProviders();
  }, []);

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
    await fetchProviders();
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
      // Extract selected IDs from the fetched directory
      const selectedProviderIds = selectedProviders
        .filter(p => !p.id.startsWith('custom_'))
        .map(p => p.id);

      // Extract custom providers formatted as required by backend
      const customPayloadList: ICustomProviderPayload[] = selectedProviders
        .filter(p => p.id.startsWith('custom_'))
        .map(p => ({
          category: p.category,
          name: p.name,
          specialty: p.subtext || '',
          address: p.address || '',
          phone: p.phone || '',
        }));

      const payload: IRegisterProvidersPayload = {
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
        title="Service Providers"
        showDrawerButton={true}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

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
      </ScrollView>

      {/* ========================================================= */}
      {/* 5. BOTTOM REGISTER BUTTON (DYNAMIC API REGISTRATION)       */}
      {/* ========================================================= */}
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
                  placeholder="e.g. Indiranagar 100ft Road, Bengaluru"
                  placeholderTextColor="#64748B"
                  value={formAddress}
                  onChangeText={setFormAddress}
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
        onClose={() => setAlertModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ServiceProvidersScreen;

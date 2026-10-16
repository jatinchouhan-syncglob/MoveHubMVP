import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { storageHelper } from '../../../storage/storageHelper';
import { STORAGE_KEYS } from '../../../storage/storageKeys';
import { apiService } from '../../../services/api';
import { UserProfile } from '../../../types';
import { IArena, IReferralEntity, INominateEntityPayload } from '../types';
import { styles } from './styles';
import {
  JoinChallengeRouteProp,
  JoinChallengeTab,
  JoinSuccessData,
} from './types';
import { EntityCard } from './components/EntityCard';
import { NominateForm } from './components/NominateForm';
import { JoinSuccessModal } from './components/JoinSuccessModal';

export const JoinChallengeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<JoinChallengeRouteProp>();
  const arena: IArena | undefined = route.params?.arena;

  const [activeTab, setActiveTab] = useState<JoinChallengeTab>('search');
  const [entities, setEntities] = useState<IReferralEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<IReferralEntity | null>(null);
  const [unitOrFlatNumber, setUnitOrFlatNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<JoinSuccessData | null>(null);

  const [userProfile, setUserProfile] = useState<{
    uhid: string;
    name: string;
    email: string;
    phone: string;
  }>({
    uhid: 'SAUSHA9775',
    name: 'Saurabh Sharma',
    email: 's.saurabh@example.com',
    phone: '9912345678',
  });

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load User Profile from local storage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const cached = await storageHelper.getItem<UserProfile>(
          STORAGE_KEYS.USER_PROFILE,
        );
        if (cached) {
          setUserProfile({
            uhid: cached.uhid || 'SAUSHA9775',
            name: cached.name || 'Saurabh Sharma',
            email: cached.email || 's.saurabh@example.com',
            phone:
              (cached as any).phoneNumber ||
              (cached as any).mobile ||
              '9912345678',
          });
        }
      } catch (err) {
        console.warn('[JoinChallengeScreen] Error loading cached profile:', err);
      }
    };
    loadProfile();
  }, []);

  // Fetch Entities from API
  const fetchEntities = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const response = await apiService.searchReferralEntities(query);
      if (response && Array.isArray(response.data)) {
        setEntities(response.data);
      } else {
        setEntities([]);
      }
    } catch (err) {
      console.warn('[JoinChallengeScreen] Fetch entities error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // Handle Search Input Change with Debounce
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      fetchEntities(text);
    }, 450);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchEntities();
  };

  // Filter entities by category chip
  const filteredEntities = entities.filter(item => {
    if (selectedFilter === 'ALL') return true;
    return item.entityType === selectedFilter;
  });

  // Handle Select Entity
  const handleSelectEntity = (entity: IReferralEntity) => {
    if (selectedEntity?.id === entity.id) {
      setSelectedEntity(null);
    } else {
      setSelectedEntity(entity);
    }
  };

  // Handle Confirm & Join via Associate API
  const handleConfirmJoin = async () => {
    if (!selectedEntity) {
      Alert.alert('Selection Required', 'Please select a Gym or Society to join.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        uhid: userProfile.uhid,
        referralCode: selectedEntity.referralCode,
        entityName: selectedEntity.entityName,
        unitOrFlatNumber: unitOrFlatNumber.trim() || undefined,
      };

      const result = await apiService.associateReferralEntity(payload);
      setSuccessData({
        type: 'associate',
        entityName: selectedEntity.entityName,
        referralCode: selectedEntity.referralCode,
        entityType: selectedEntity.entityType,
        city: selectedEntity.city,
        location: selectedEntity.location,
        message: result?.message || 'Challenge joined successfully',
      });
      setSuccessModalVisible(true);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to join challenge at this time. Please try again.';
      Alert.alert('Join Failed', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Submit Nominate Form
  const handleNominateSubmit = async (payload: INominateEntityPayload) => {
    setSubmitting(true);
    try {
      const result = await apiService.nominateReferralEntity(payload);
      const createdData = result?.data;

      // If createdData has a referralCode, automatically associate the user
      if (createdData?.referralCode) {
        try {
          await apiService.associateReferralEntity({
            uhid: userProfile.uhid,
            referralCode: createdData.referralCode,
            entityName: payload.entityName,
          });
        } catch (assocErr) {
          console.warn('[JoinChallengeScreen] Auto-associate after nominate notice:', assocErr);
        }
      }

      setSuccessData({
        type: 'nominate',
        entityName: payload.entityName,
        referralCode: createdData?.referralCode,
        entityType: payload.entityType,
        city: payload.city,
        location: payload.location,
        message: result?.message || 'Entity nominated successfully',
      });
      setSuccessModalVisible(true);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to submit nomination. Please try again.';
      Alert.alert('Nomination Error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle View Rankings
  const handleViewRankings = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header with Back Button */}
      <CustomHeader
        title="Join Challenge"
        showBackButton={true}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Arena Context Card */}
        {arena && (
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.arenaBannerCard}
          >
            <View style={styles.arenaBannerEyebrowRow}>
              <Text style={styles.arenaBannerEyebrow}>{arena.category}</Text>
              <View style={styles.arenaBannerStatusBadge}>
                <Text style={styles.arenaBannerStatusText}>{arena.status}</Text>
              </View>
            </View>
            <Text style={styles.arenaBannerTitle}>{arena.name}</Text>
            <Text style={styles.arenaBannerTagline}>
              {arena.tagline || arena.summary}
            </Text>
          </LinearGradient>
        )}

        {/* Tab Switcher: Search & Select vs. Nominate */}
        <View style={styles.tabSwitcherContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'search' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('search')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'search' && styles.tabButtonTextActive,
              ]}
            >
              🔍 Find Your Entity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'nominate' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('nominate')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'nominate' && styles.tabButtonTextActive,
              ]}
            >
              ➕ Nominate New
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= TAB 1: SEARCH & SELECT ================= */}
        {activeTab === 'search' && (
          <View>
            {/* Search Input */}
            <View style={styles.searchSection}>
              <View style={styles.searchInputWrapper}>
                <Text style={styles.searchIconText}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search gym, society, or tower name..."
                  placeholderTextColor="#64748B"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={handleClearSearch}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.clearSearchText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterChipsScroll}
              contentContainerStyle={styles.filterChipsContainer}
            >
              {[
                { id: 'ALL', label: 'All Entities' },
                { id: 'GYM', label: '🏋️ Gyms' },
                { id: 'TOWER_SOCIETY', label: '🏢 Towers & Societies' },
                { id: 'CORPORATE', label: '💼 Corporate' },
              ].map(chip => {
                const isActive = selectedFilter === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setSelectedFilter(chip.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Results Header */}
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsCountText}>
                {loading
                  ? 'SEARCHING ENTITIES...'
                  : `${filteredEntities.length} ENTIT${filteredEntities.length === 1 ? 'Y' : 'IES'} AVAILABLE`}
              </Text>
              <TouchableOpacity
                onPress={() => fetchEntities(searchQuery)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.refreshButtonText}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {loading && entities.length === 0 ? (
              <ActivityIndicator
                size="large"
                color="#3B82F6"
                style={styles.loadingIndicator}
              />
            ) : null}

            {/* Entity List */}
            {!loading && filteredEntities.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🏢</Text>
                <Text style={styles.emptyTitle}>
                  No matching Gym or Society found
                </Text>
                <Text style={styles.emptySubtext}>
                  Can't find your community in the list? You can nominate it directly and be the ambassador!
                </Text>
                <TouchableOpacity
                  style={styles.emptyNominateBtn}
                  activeOpacity={0.85}
                  onPress={() => setActiveTab('nominate')}
                >
                  <Text style={styles.emptyNominateBtnText}>
                    ➕ Nominate "{searchQuery || 'Your Entity'}" Now
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.entityCardsList}>
                {filteredEntities.map(entityItem => (
                  <EntityCard
                    key={`entity-${entityItem.id}-${entityItem.referralCode}`}
                    entity={entityItem}
                    isSelected={selectedEntity?.id === entityItem.id}
                    onSelect={handleSelectEntity}
                  />
                ))}
              </View>
            )}

            {/* Selected Entity Confirmation Box */}
            {selectedEntity && (
              <View style={styles.selectedBoxContainer}>
                <Text style={styles.selectedBoxTitle}>Selected Community</Text>
                <Text style={styles.selectedBoxEntityName}>
                  {selectedEntity.entityName}
                </Text>

                <Text style={styles.inputLabel}>
                  Unit / Flat / Membership ID (Optional)
                </Text>
                <TextInput
                  style={styles.unitInput}
                  placeholder="e.g. Tower 4, Flat 1204 or Member #308"
                  placeholderTextColor="#64748B"
                  value={unitOrFlatNumber}
                  onChangeText={setUnitOrFlatNumber}
                />

                <TouchableOpacity
                  style={styles.confirmJoinButton}
                  activeOpacity={0.85}
                  onPress={handleConfirmJoin}
                  disabled={submitting}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmJoinGradient}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={styles.confirmJoinButtonText}>
                          CONFIRM & JOIN CHALLENGE
                        </Text>
                        <Text style={styles.confirmJoinButtonText}>→</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 2: NOMINATE NEW ================= */}
        {activeTab === 'nominate' && (
          <NominateForm
            initialEntityName={searchQuery}
            userProfile={userProfile}
            onSubmit={handleNominateSubmit}
            loading={submitting}
          />
        )}
      </ScrollView>

      {/* Success Celebration Modal */}
      <JoinSuccessModal
        visible={successModalVisible}
        data={successData}
        uhid={userProfile.uhid}
        onViewRankings={handleViewRankings}
        onClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

export default JoinChallengeScreen;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { styles, SECTION_WIDTH } from './styles';
import { SEGMENT_CONFIGS, SEGMENT_ORDERED_KEYS } from './constants';
import { UserSegmentKey, ISegmentConfig } from './types';
import { ArenasHeroHeader } from './components/ArenasHeroHeader';
import { ArenasSelectorTabs } from './components/ArenasSelectorTabs';
import { ArenasCarouselSlide } from './components/ArenasCarouselSlide';
import { ArenasDetailsCard } from './components/ArenasDetailsCard';
import { GlobalTicker } from './components/GlobalTicker';
import { CoreQuadrantsBar } from './components/CoreQuadrantsBar';
import { FocusTrackersGrid } from './components/FocusTrackersGrid';
import { SegmentStandingsCard } from './components/SegmentStandingsCard';
import { SegmentActionButtons } from './components/SegmentActionButtons';
import { SegmentPickerModal } from './components/SegmentPickerModal';
import { TournamentPlaybookModal } from './components/TournamentPlaybookModal';
import { MetricSandboxModal } from './components/MetricSandboxModal';
import { ThreeWayReferralModal } from './components/ThreeWayReferralModal';
import { BiophysicalCalibrationModal } from './components/BiophysicalCalibrationModal';
import { MedicalDisclaimerModal } from './components/MedicalDisclaimerModal';
import { ArenasBottomDock, ArenasDockTab } from './components/ArenasBottomDock';
import { ArenasWarRoomView } from './components/ArenasWarRoomView';
import { ArenasBracketsView } from './components/ArenasBracketsView';
import { ArenasRewardsView } from './components/ArenasRewardsView';

export const ArenasScreen: React.FC = () => {
  // Promo code condition state
  const [isMassPromo, setIsMassPromo] = useState<boolean>(false);

  // Segment Selection State (default to MASS_INDIVIDUALS 01, overrides from user profile if available)
  const [selectedSegment, setSelectedSegment] = useState<UserSegmentKey>('MASS_INDIVIDUALS');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeViewportTab, setActiveViewportTab] = useState<ArenasDockTab>('arena');

  // Modals state
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const [isPlaybookVisible, setIsPlaybookVisible] = useState<boolean>(false);
  const [isSandboxVisible, setIsSandboxVisible] = useState<boolean>(false);
  const [isReferralVisible, setIsReferralVisible] = useState<boolean>(false);
  const [referralInitialNode, setReferralInitialNode] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [isCalibrationVisible, setIsCalibrationVisible] = useState<boolean>(false);
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState<boolean>(false);

  // Scroll & Carousel refs
  const scrollViewRef = useRef<ScrollView>(null);
  const carouselRef = useRef<FlatList<ISegmentConfig>>(null);
  const isUserInteractingRef = useRef<boolean>(false);

  // Ordered segments: 01 Mass Individuals, 02 Friends & Family, 03 Residential, 04 College, 05 Gyms, 06 Clinics, 07 Retail
  const segmentsList = isMassPromo
    ? [SEGMENT_CONFIGS['MASS_INDIVIDUALS']]
    : SEGMENT_ORDERED_KEYS.map(k => SEGMENT_CONFIGS[k]);
  const activeConfig = SEGMENT_CONFIGS[selectedSegment];
  const activeTheme = activeConfig.theme;

  // Check stored user profile & promo code for segment
  const checkStoredProfileSegment = useCallback(async () => {
    try {
      const rawProfile = await storageHelper.getItem(STORAGE_KEYS.USER_PROFILE);
      const parsed = rawProfile
        ? typeof rawProfile === 'string'
          ? JSON.parse(rawProfile)
          : rawProfile
        : null;

      const userPromo = (parsed?.promocode || parsed?.promoCode || '').toString().trim().toUpperCase();
      const isMass = userPromo === 'MASS01';
      setIsMassPromo(isMass);

      if (isMass) {
        setSelectedSegment('MASS_INDIVIDUALS');
        return;
      }

      if (parsed?.segment && SEGMENT_CONFIGS[parsed.segment as UserSegmentKey]) {
        const userSeg = parsed.segment as UserSegmentKey;
        setSelectedSegment(userSeg);
        const idx = SEGMENT_ORDERED_KEYS.indexOf(userSeg);
        if (idx >= 0) {
          carouselRef.current?.scrollToIndex({ index: idx, animated: false });
        }
      }
    } catch {
      // Fallback to default MASS_INDIVIDUALS (Segment 01)
    }
  }, []);

  useEffect(() => {
    checkStoredProfileSegment();
  }, [checkStoredProfileSegment]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkStoredProfileSegment();
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, [checkStoredProfileSegment]);

  // Tab & Carousel Sync
  const handleSelectSegment = (key: UserSegmentKey) => {
    isUserInteractingRef.current = true;
    setSelectedSegment(key);
    const targetIndex = SEGMENT_ORDERED_KEYS.indexOf(key);
    if (targetIndex >= 0) {
      carouselRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
      });
    }
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 3000);
  };

  const handleCarouselScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SECTION_WIDTH);
    if (newIndex >= 0 && newIndex < SEGMENT_ORDERED_KEYS.length) {
      const newKey = SEGMENT_ORDERED_KEYS[newIndex];
      if (newKey !== selectedSegment) {
        setSelectedSegment(newKey);
      }
    }
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 3000);
  };

  // Handlers for action triggers
  const handleOpenReferralNode = (node: 'A' | 'B' | 'C' | 'D') => {
    setReferralInitialNode(node);
    setIsReferralVisible(true);
  };

  const handleOpenPlaybook = () => {
    setIsPlaybookVisible(true);
  };

  const handleOpenSandbox = () => {
    setIsSandboxVisible(true);
  };

  const handleOpenCalibration = () => {
    setIsCalibrationVisible(true);
  };

  const handleOpenDisclaimer = () => {
    setIsDisclaimerVisible(true);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeTheme.canvasBase }]}
      edges={['top']}
    >
      <StatusBar barStyle="light-content" backgroundColor={activeTheme.canvasBase} />

      {/* Top Header with Drawer trigger */}
      <CustomHeader
        title={
          activeViewportTab === 'arena'
            ? 'THE ARENA'
            : activeViewportTab === 'warRoom'
            ? 'THE ARENA: War Room'
            : activeViewportTab === 'brackets'
            ? 'THE ARENA: Brackets'
            : 'The ARENA: 4-Way Referral'
        }
        showDrawerButton={true}
        containerStyle={[
          styles.headerContainer,
          { backgroundColor: activeTheme.canvasBase, borderBottomColor: activeTheme.mutedBorders },
        ]}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Main Tab Viewport (Switches between Arena, War Room, Brackets, and Rewards) */}
      <View style={styles.mainTabContent}>
        {activeViewportTab === 'arena' && (
          <ScrollView
            ref={scrollViewRef}
            style={[styles.container, { backgroundColor: activeTheme.canvasBase }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={activeTheme.coreAccent}
                colors={[activeTheme.coreAccent]}
              />
            }
          >
            {/* 1. Main Hero Headline & Subhead */}
            <ArenasHeroHeader config={activeConfig} />

            {/* 2. Horizontal Segment Selector Tabs (Ordered 01 to 07) - Hidden for MASS01 */}
            {!isMassPromo && (
              <ArenasSelectorTabs
                segments={segmentsList}
                selectedSegmentKey={selectedSegment}
                onSelectSegment={handleSelectSegment}
              />
            )}

            {/* 3. Hero Showcase Carousel Slide - Shows only Mass Individuals for MASS01 */}
            <View style={styles.carouselSection}>
              {isMassPromo ? (
                <ArenasCarouselSlide config={activeConfig} />
              ) : (
                <FlatList
                  ref={carouselRef}
                  data={segmentsList}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.key}
                  renderItem={({ item }) => <ArenasCarouselSlide config={item} />}
                  onMomentumScrollEnd={handleCarouselScrollEnd}
                  getItemLayout={(_, index) => ({
                    length: SECTION_WIDTH,
                    offset: SECTION_WIDTH * index,
                    index,
                  })}
                />
              )}
            </View>

            {/* 4. Arena Details Card (Tagline, Title, Facts Pills & Summary) */}
            <ArenasDetailsCard config={activeConfig} />

            {/* 5. Global Live Ticker Stream */}
            <GlobalTicker config={activeConfig} />

            {/* 6. Cardiometabolic Focus Trackers Grid */}
            <FocusTrackersGrid config={activeConfig} />

            {/* 7. Standings / Tournament Knockout Bracket */}
            <SegmentStandingsCard config={activeConfig} />

            {/* 8. Primary Segment Action CTAs */}
            <SegmentActionButtons
              config={activeConfig}
              onOpenReferralModal={() => setActiveViewportTab('rewards')}
              onOpenPlaybookModal={() => setActiveViewportTab('brackets')}
            />

            {/* 9. Core Quadrants Launcher Chips (Tournament Playbook, Metric Sandbox, etc.) */}
            <CoreQuadrantsBar
              config={activeConfig}
              onOpenPlaybook={() => setActiveViewportTab('brackets')}
              onOpenSandbox={() => setActiveViewportTab('warRoom')}
              onOpenReferral={() => setActiveViewportTab('rewards')}
              onOpenCalibration={handleOpenCalibration}
              onOpenDisclaimer={handleOpenDisclaimer}
            />
          </ScrollView>
        )}

        {/* Tab 2: War Room (Full on-screen view) */}
        {activeViewportTab === 'warRoom' && (
          <ArenasWarRoomView
            config={activeConfig}
            onOpenCalibration={handleOpenCalibration}
            onOpenDisclaimer={handleOpenDisclaimer}
          />
        )}

        {/* Tab 3: Brackets (Full on-screen view) */}
        {activeViewportTab === 'brackets' && (
          <ArenasBracketsView
            config={activeConfig}
          />
        )}

        {/* Tab 4: Rewards (Full on-screen view) */}
        {activeViewportTab === 'rewards' && (
          <ArenasRewardsView
            config={activeConfig}
          />
        )}
      </View>

      {/* Pinned Bottom Dock Bar (Always visible at bottom, outside ScrollView) */}
      <ArenasBottomDock
        activeTab={activeViewportTab}
        theme={activeTheme}
        onPressArena={() => {
          setActiveViewportTab('arena');
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
        onPressWarRoom={() => setActiveViewportTab('warRoom')}
        onPressBrackets={() => setActiveViewportTab('brackets')}
        onPressRewards={() => setActiveViewportTab('rewards')}
      />

      {/* 1-Click Segment Switcher Modal (Accessible via search / dropdown if needed) */}
      {!isMassPromo && (
        <SegmentPickerModal
          visible={isPickerVisible}
          activeSegment={selectedSegment}
          onSelectSegment={(segment) => {
            handleSelectSegment(segment);
            setIsPickerVisible(false);
          }}
          onClose={() => setIsPickerVisible(false)}
        />
      )}

      {/* Quadrant 1: Tournament Ledger & Playbook Modal */}
      <TournamentPlaybookModal
        visible={isPlaybookVisible}
        onClose={() => setIsPlaybookVisible(false)}
        activeTheme={activeTheme}
      />

      {/* Quadrant 2: Metric Deep-Dive & Strategy Sandbox Modal */}
      <MetricSandboxModal
        visible={isSandboxVisible}
        onClose={() => setIsSandboxVisible(false)}
        activeTheme={activeTheme}
      />

      {/* Quadrant 3: 3-Way Network Referral Node Modal */}
      <ThreeWayReferralModal
        visible={isReferralVisible}
        onClose={() => setIsReferralVisible(false)}
        initialNode={referralInitialNode}
      />

      {/* Quadrant 5: Biophysical Sensor Calibration Modal */}
      <BiophysicalCalibrationModal
        visible={isCalibrationVisible}
        onClose={() => setIsCalibrationVisible(false)}
        activeTheme={activeTheme}
      />

      {/* Clinical & Medical Disclaimer Modal */}
      <MedicalDisclaimerModal
        visible={isDisclaimerVisible}
        onClose={() => setIsDisclaimerVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ArenasScreen;

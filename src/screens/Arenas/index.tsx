import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { styles } from './styles';
import { SEGMENT_CONFIGS } from './constants';
import { UserSegmentKey } from './types';
import { ArenasHeroHeader } from './components/ArenasHeroHeader';
import { ArenasCarouselSlide } from './components/ArenasCarouselSlide';
import { ArenasDetailsCard } from './components/ArenasDetailsCard';
import { GlobalTicker } from './components/GlobalTicker';
import { CoreQuadrantsBar } from './components/CoreQuadrantsBar';
import { FocusTrackersGrid } from './components/FocusTrackersGrid';
import { SegmentActionButtons } from './components/SegmentActionButtons';
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
  // Segment Selection State - Exclusively MASS_INDIVIDUALS per user instruction
  const selectedSegment: UserSegmentKey = 'MASS_INDIVIDUALS';
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

  // Scroll ref
  const scrollViewRef = useRef<ScrollView>(null);

  // Exclusively Mass Individuals segment
  const segmentsList = [SEGMENT_CONFIGS['MASS_INDIVIDUALS']];
  const activeConfig = SEGMENT_CONFIGS['MASS_INDIVIDUALS'];
  const activeTheme = activeConfig.theme;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

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

            {/* 2. Hero Showcase Slide - Exclusively Mass Individuals */}
            <View style={styles.carouselSection}>
              <ArenasCarouselSlide config={activeConfig} />
            </View>

            {/* 3. Arena Details Card (Tagline, Title, Facts Pills & Summary) */}
            <ArenasDetailsCard config={activeConfig} />

            {/* 5. Global Live Ticker Stream */}
            <GlobalTicker config={activeConfig} />

            {/* 6. Cardiometabolic Focus Trackers Grid */}
            <FocusTrackersGrid config={activeConfig} />

            {/* 7. Standings / Tournament Knockout Bracket */}
            {/* <SegmentStandingsCard config={activeConfig} /> */}

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

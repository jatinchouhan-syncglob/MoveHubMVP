import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { ROUTES } from '../../constants/routes';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import { styles, SECTION_WIDTH } from './styles';
import { FALLBACK_ARENAS, ARENA_THEMES } from './constants';
import { IArena } from './types';
import { ArenaHeader } from './components/ArenaHeader';
import { ArenaSelectorTabs } from './components/ArenaSelectorTabs';
import { ArenaCarouselSlide } from './components/ArenaCarouselSlide';
import { ArenaDetails } from './components/ArenaDetails';
import { ArenaActions } from './components/ArenaActions';
import { ArenaExplorerModal } from './components/ArenaExplorerModal';
import { Faq } from './components/faq';
import { ArenaTopNavTabs, ArenaNavTab } from './components/ArenaTopNavTabs';
import { GauntletTab } from './components/GauntletTab';
import { RankingsTab } from './components/RankingsTab';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ArenaScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isMassPromo, setIsMassPromo] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<ArenaNavTab>('arenas');
  const [arenas, setArenas] = useState<IArena[]>(FALLBACK_ARENAS);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [explorerModalVisible, setExplorerModalVisible] =
    useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const carouselRef = useRef<FlatList<IArena>>(null);
  const activeIndexRef = useRef<number>(activeIndex);
  activeIndexRef.current = activeIndex;
  const isUserInteractingRef = useRef<boolean>(false);

  // Fetch arenas from API & check MASS01 promo code
  const fetchArenas = useCallback(async () => {
    try {
      const rawProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      const userPromo = (rawProfile?.promocode || rawProfile?.promoCode || rawProfile?.referralCode || '').toString().trim().toUpperCase();
      const isMass = userPromo === 'MASS01';
      setIsMassPromo(isMass);

      const data = await apiService.getArenas();
      if (Array.isArray(data) && data.length > 0) {
        if (isMass) {
          const massOnly = data.filter(
            a =>
              a.id === '01' ||
              a.id === 'solo' ||
              a.name?.toLowerCase().includes('solo') ||
              a.name?.toLowerCase().includes('mass'),
          );
          setArenas(massOnly.length > 0 ? massOnly : [data[0]]);
        } else {
          setArenas(data);
        }
      } else if (isMass) {
        setArenas([FALLBACK_ARENAS[0]]);
      }
    } catch (err) {
      console.warn('[ArenaScreen] Failed to fetch arenas from API, using fallback data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArenas();
  }, [fetchArenas]);

  // Auto-slide carousel every 3 seconds (active only when Arenas tab is visible)
  useEffect(() => {
    if (activeNavTab !== 'arenas' || arenas.length <= 1 || explorerModalVisible) {
      return;
    }

    const timer = setInterval(() => {
      if (isUserInteractingRef.current) {
        return;
      }
      const nextIndex = (activeIndexRef.current + 1) % arenas.length;
      setActiveIndex(nextIndex);
      carouselRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [activeNavTab, arenas.length, explorerModalVisible]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeNavTab === 'arenas') {
      fetchArenas();
    } else if (activeNavTab === 'rankings') {
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => setRefreshing(false), 600);
    } else {
      setTimeout(() => setRefreshing(false), 600);
    }
  }, [fetchArenas, activeNavTab]);

  // Tab selection handler
  const handleSelectArena = (index: number) => {
    isUserInteractingRef.current = true;
    setActiveIndex(index);
    carouselRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    // Resume auto-slide 3 seconds after user tap
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 3000);
  };

  // Carousel momentum scroll listener
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SECTION_WIDTH);
    if (newIndex >= 0 && newIndex < arenas.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
    // Resume auto-slide 3 seconds after user finishes manual swipe
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 3000);
  };

  // Social Share Handler for Arena Data
  const handleShareArena = async (arena: IArena) => {
    try {
      const factsText =
        arena.facts && arena.facts.length > 0
          ? arena.facts.map(f => `⚡ ${f}`).join('\n')
          : '';

      const shareMessage =
        `🏆 ${arena.name.toUpperCase()} - MoveHub Arena Challenge\n\n` +
        `🔥 Category: ${arena.category}\n` +
        `📍 Status: ${arena.status}\n\n` +
        `"${arena.tagline || arena.summary}"\n\n` +
        (factsText ? `Key Highlights:\n${factsText}\n\n` : '') +
        `Join me on Uncurl: health, compete in the 21-Day Gauntlet, track your biometric pacing, and conquer the National Podium!\n\n` +
        `👉 Compete now on Uncurl: https://uncurl.app/arena/${arena.slug || arena.id}`;

      await Share.share(
        Platform.OS === 'ios'
          ? {
              title: `${arena.name} | MoveHub Arena`,
              message: shareMessage,
              url: `https://movehub.app/arena/${arena.slug || arena.id}`,
            }
          : {
              title: `${arena.name} | MoveHub Arena`,
              message: shareMessage,
            },
        {
          dialogTitle: `Share ${arena.name} Challenge`,
        },
      );
    } catch (err) {
      console.warn('[ArenaScreen] Share error:', err);
    }
  };

  // Join Challenge Handler
  const handleJoinChallenge = (arenaToJoin: IArena) => {
    navigation.navigate(ROUTES.JOIN_CHALLENGE as any, {
      arena: arenaToJoin,
      arenaId: arenaToJoin.id,
      arenaName: arenaToJoin.name,
    });
  };

  const currentArena = arenas[activeIndex] || arenas[0] || FALLBACK_ARENAS[0];
  const activeThemeConfig =
    ARENA_THEMES[currentArena.themeColor] || ARENA_THEMES['arena-blue'];

  if (loading && arenas.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <CustomHeader
          title="Arena"
          showDrawerButton
          containerStyle={styles.headerContainer}
          titleStyle={styles.headerTitle}
          buttonStyle={styles.headerButton}
          iconStyle={styles.headerIcon}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading arenas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header with Drawer Toggle */}
      <CustomHeader
        title="Arena"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Top 4 Navigation Tabs */}
      <ArenaTopNavTabs
        activeTab={activeNavTab}
        onSelectTab={setActiveNavTab}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6', '#10B981', '#DB2777']}
          />
        }
      >
        {/* ================= TAB 1: ARENAS & CAROUSEL ================= */}
        {activeNavTab === 'arenas' && (
          <View style={styles.sectionCard}>
            {/* Dynamic Display Title & Eyebrow */}
            <ArenaHeader currentArena={currentArena} />

            {/* Horizontal Arena Category Tabs - Hidden for MASS01 */}
            {!isMassPromo && (
              <ArenaSelectorTabs
                arenas={arenas}
                selectedIndex={activeIndex}
                onSelectArena={handleSelectArena}
              />
            )}

            {/* Carousel Slider */}
            <View style={styles.carouselSection}>
              <FlatList
                ref={carouselRef}
                data={arenas}
                keyExtractor={(item, index) => item.id || String(index)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScrollBeginDrag={() => {
                  isUserInteractingRef.current = true;
                }}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollToIndexFailed={info => {
                  setTimeout(() => {
                    carouselRef.current?.scrollToIndex({
                      index: info.index,
                      animated: true,
                    });
                  }, 100);
                }}
                getItemLayout={(_, index) => ({
                  length: SECTION_WIDTH,
                  offset: SECTION_WIDTH * index,
                  index,
                })}
                renderItem={({ item }) => <ArenaCarouselSlide arena={item} />}
              />

              {/* Carousel Pagination Dots */}
              <View style={styles.dotsRow}>
                {arenas.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <View
                      key={`dot-${item.id || index}`}
                      style={[
                        styles.dot,
                        isActive ? styles.activeDot : styles.inactiveDot,
                        isActive && { backgroundColor: activeThemeConfig.primary },
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            {/* Arena Details Block */}
            <ArenaDetails arena={currentArena} onShare={handleShareArena} />

            {/* CTA Actions */}
            <ArenaActions
              arena={currentArena}
              onExplore={() => setExplorerModalVisible(true)}
              onShare={handleShareArena}
              onJoinChallenge={handleJoinChallenge}
            />
          </View>
        )}

        {/* ================= TAB 2: THE GAUNTLET ================= */}
        {activeNavTab === 'gauntlet' && <GauntletTab />}

        {/* ================= TAB 3: RANKINGS ================= */}
        {activeNavTab === 'rankings' && (
          <RankingsTab refreshTrigger={refreshTrigger} />
        )}

        {/* ================= TAB 4: FAQ ================= */}
        {activeNavTab === 'faq' && <Faq />}
      </ScrollView>

      {/* Explorer Modal */}
      <ArenaExplorerModal
        visible={explorerModalVisible}
        arena={currentArena}
        onClose={() => setExplorerModalVisible(false)}
        onShare={handleShareArena}
        onJoinChallenge={handleJoinChallenge}
      />
    </SafeAreaView>
  );
};

export default ArenaScreen;

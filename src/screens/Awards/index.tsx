import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Text as SvgText,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { CustomHeader } from '../../components/common/CustomHeader';
import { apiService } from '../../services/api';
import { IChallengePodiumResponse, IPodiumTier } from '../../types';
import { styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FALLBACK_PODIUM_DATA: IChallengePodiumResponse = {
  podiumTiers: [
    {
      reward: 'National Championship Belt + Health Grant',
      tier: 1,
      qualificationDays: 'Days 15–21',
      place: '01',
      title: 'NATIONAL CHAMPION',
      status: 'STAGE 3 PODIUM FINALE',
    },
    {
      reward: 'Silver Laurels + Longevity Grant',
      tier: 2,
      qualificationDays: 'Days 15–21',
      place: '02',
      title: 'NATIONAL RUNNER-UP',
      status: 'STAGE 3 PODIUM FINALE',
    },
    {
      reward: 'Bronze Medal + Fitness Technology Kit',
      tier: 3,
      qualificationDays: 'Days 15–21',
      place: '03',
      title: 'NATIONAL PODIUM',
      status: 'STAGE 3 PODIUM FINALE',
    },
  ],
  heading: 'THE NATIONAL PODIUM.',
  tagline: '21 days. Thousands of contenders. One national podium.',
  status: 'SUCCESS',
};

export const AwardsScreen: React.FC = () => {
  const footerWidth = SCREEN_WIDTH - 24;

  const [podiumData, setPodiumData] =
    useState<IChallengePodiumResponse>(FALLBACK_PODIUM_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch live podium data from API
  const fetchPodium = useCallback(async () => {
    try {
      const res = await apiService.getChallengePodium();
      if (res && Array.isArray(res.podiumTiers) && res.podiumTiers.length > 0) {
        setPodiumData(res);
      }
    } catch (err) {
      console.warn('[AwardsScreen] Failed to fetch challenge podium:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPodium();
  }, [fetchPodium]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPodium();
  }, [fetchPodium]);

  // Extract tiers by priority
  const tiers: IPodiumTier[] =
    podiumData.podiumTiers && podiumData.podiumTiers.length > 0
      ? podiumData.podiumTiers
      : FALLBACK_PODIUM_DATA.podiumTiers;

  const tier1 =
    tiers.find(t => t.tier === 1 || t.place === '01') ||
    FALLBACK_PODIUM_DATA.podiumTiers[0];
  const tier2 =
    tiers.find(t => t.tier === 2 || t.place === '02') ||
    FALLBACK_PODIUM_DATA.podiumTiers[1];
  const tier3 =
    tiers.find(t => t.tier === 3 || t.place === '03') ||
    FALLBACK_PODIUM_DATA.podiumTiers[2];

  // Split Champion title for two-tone color ("NATIONAL" white, "CHAMPION" gold)
  const [t1First, ...t1Rest] = (tier1.title || 'NATIONAL CHAMPION').split(' ');
  const t1Second = t1Rest.join(' ') || 'CHAMPION';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#070B14" />

      {/* Screen Header */}
      <CustomHeader
        title="REWARDS"
        showDrawerButton={true}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F59E0B"
            colors={['#F59E0B', '#EC4899', '#3B82F6']}
          />
        }
      >
        {/* ================= TOP HEADER SECTION ================= */}
        <View style={styles.headerSection}>
          {/* Eyebrow */}
          <Text style={styles.eyebrowText}>THE DESTINATION</Text>

          {/* Main Title Line 1 */}
          <Text style={styles.mainTitleWhite}>THE NATIONAL</Text>

          {/* Main Title Line 2 (Gradient Text: PODIUM.) */}
          <View style={styles.gradientTitleContainer}>
            <Svg height="44" width="220" viewBox="0 0 220 44">
              <Defs>
                <SvgGradient id="podiumGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#F59E0B" />
                  <Stop offset="55%" stopColor="#EC4899" />
                  <Stop offset="100%" stopColor="#E11D48" />
                </SvgGradient>
              </Defs>
              <SvgText
                fill="url(#podiumGrad)"
                fontSize="36"
                fontWeight="900"
                x="110"
                y="34"
                textAnchor="middle"
                letterSpacing="-0.5"
              >
                PODIUM.
              </SvgText>
            </Svg>
          </View>

          {/* Subtitle / Tagline from API */}
          <Text style={styles.subtitleText}>
            {podiumData.tagline || FALLBACK_PODIUM_DATA.tagline}
          </Text>
        </View>

        {/* ================= 3-TIER PODIUM SECTION ================= */}
        <View style={styles.podiumWrapper}>
          <View style={styles.podiumColumnsRow}>
            {/* ---------- LEFT COLUMN: 02 (NATIONAL RUNNER-UP) ---------- */}
            <View style={[styles.pillarColumn, styles.columnSide]}>
              <Text style={styles.numberSideText}>{tier2.place || '02'}</Text>

              <Text style={styles.titleSideText}>
                {tier2.title || 'NATIONAL RUNNER-UP'}
              </Text>

              <View style={[styles.dashedBadge, styles.dashedBadgeSide]}>
                <Text style={styles.badgeRewardsText}>REWARDS</Text>
                <Text
                  style={styles.badgeAnnouncedText}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {tier2.reward || 'TO BE ANNOUNCED'}
                </Text>
              </View>

              <View style={[styles.podiumBlockSide, styles.podiumBlockLeft]} />
            </View>

            {/* ---------- CENTER COLUMN: 01 (NATIONAL CHAMPION) ---------- */}
            <View style={[styles.pillarColumn, styles.columnCenter]}>
              <View style={styles.numberContainerCenter}>
                <Svg height="60" width="80" viewBox="0 0 80 60">
                  <Defs>
                    <SvgGradient id="championNumGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor="#EC4899" />
                      <Stop offset="100%" stopColor="#F59E0B" />
                    </SvgGradient>
                  </Defs>
                  <SvgText
                    fill="url(#championNumGrad)"
                    fontSize="50"
                    fontWeight="900"
                    x="40"
                    y="48"
                    textAnchor="middle"
                    letterSpacing="-1"
                  >
                    {tier1.place || '01'}
                  </SvgText>
                </Svg>
              </View>

              <View style={styles.titleCenterRow}>
                <Text style={styles.titleCenterWhite}>{t1First}</Text>
                <Text style={styles.titleCenterGold}>{t1Second}</Text>
              </View>

              <View style={[styles.dashedBadge, styles.dashedBadgeCenter]}>
                <Text
                  style={[
                    styles.badgeRewardsText,
                    styles.badgeRewardsTextCenter,
                  ]}
                >
                  REWARDS
                </Text>
                <Text
                  style={[
                    styles.badgeAnnouncedText,
                    styles.badgeAnnouncedTextCenter,
                  ]}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {tier1.reward || 'TO BE ANNOUNCED'}
                </Text>
              </View>

              <View style={styles.podiumBlockCenter}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.01)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.podiumCenterGlowOverlay}
                />
              </View>
            </View>

            {/* ---------- RIGHT COLUMN: 03 (NATIONAL PODIUM) ---------- */}
            <View style={[styles.pillarColumn, styles.columnSide]}>
              <Text style={styles.numberSideText}>{tier3.place || '03'}</Text>

              <Text style={styles.titleSideText}>
                {tier3.title || 'NATIONAL PODIUM'}
              </Text>

              <View style={[styles.dashedBadge, styles.dashedBadgeSide]}>
                <Text style={styles.badgeRewardsText}>REWARDS</Text>
                <Text
                  style={styles.badgeAnnouncedText}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {tier3.reward || 'TO BE ANNOUNCED'}
                </Text>
              </View>

              <View style={[styles.podiumBlockSide, styles.podiumBlockRight]} />
            </View>
          </View>

          {/* Floor / Ground Line */}
          <View style={styles.podiumBaseLine} />
        </View>

        {/* ================= BOTTOM HERO CALLOUT / QUOTE ================= */}
        <View style={styles.footerHeroContainer}>
          <Text style={styles.footerWhiteQuote}>
            YOUR ARENA GETS YOU INTO THE GAME.
          </Text>

          <View style={styles.footerGradientSvgContainer}>
            <Svg
              height="28"
              width={footerWidth}
              viewBox={`0 0 ${footerWidth} 28`}
            >
              <Defs>
                <SvgGradient id="footerQuoteGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#3B82F6" />
                  <Stop offset="30%" stopColor="#8B5CF6" />
                  <Stop offset="62%" stopColor="#EC4899" />
                  <Stop offset="100%" stopColor="#F59E0B" />
                </SvgGradient>
              </Defs>
              <SvgText
                fill="url(#footerQuoteGrad)"
                fontSize="12"
                fontWeight="900"
                x={footerWidth / 2}
                y="19"
                textAnchor="middle"
                letterSpacing="0.2"
              >
                YOUR PERFORMANCE TAKES YOU TO THE PODIUM.
              </SvgText>
            </Svg>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AwardsScreen;

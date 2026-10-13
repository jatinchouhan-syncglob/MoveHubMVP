import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './styles';

export const GauntletTab: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);

  // Gradient colors for the funnel bar based on active stage (matching Reference Images 1, 2, and 3)
  const getFunnelGradientColors = () => {
    switch (activeStage) {
      case 2:
        return ['#3B82F6', '#8B5CF6', '#D946EF', '#EC4899'];
      case 3:
        return ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#F59E0B'];
      case 1:
      default:
        return ['#3B82F6', '#6366F1', '#D946EF'];
    }
  };

  // Funnel bar gradient fill width matching image 1, 2, 3 progression
  const getFunnelWidthPercent = () => {
    switch (activeStage) {
      case 2:
        return '58%';
      case 3:
        return '100%';
      case 1:
      default:
        return '28%';
    }
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER SECTION ================= */}
      <View style={styles.headerSection}>
        {/* Eyebrow */}
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrowText}>THE TOURNAMENT FORMAT</Text>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleWhite}>21 DAYS.</Text>
          <Text style={styles.titleMagenta}>3 STAGES.</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>
          Survive the cut. Make the National Podium.
        </Text>
      </View>

      {/* ================= FUNNEL / ELIMINATION PROGRESSION BAR ================= */}
      <View style={styles.funnelWrapper}>
        {/* Dynamic Gradient Fill behind active stage progression */}
        <LinearGradient
          colors={getFunnelGradientColors()}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.funnelGradientFill, { width: getFunnelWidthPercent() }]}
        />

        <View style={styles.funnelSegmentsRow}>
          {/* Segment 1: 100% */}
          <TouchableOpacity
            style={styles.funnelSegment}
            onPress={() => setActiveStage(1)}
            activeOpacity={0.8}
          >
            <Text style={styles.funnelValueText}>100%</Text>
            <Text
              style={[
                styles.funnelLabelText,
                activeStage >= 1 && styles.funnelLabelTextActive,
              ]}
            >
              THE FIELD ENTERS
            </Text>
          </TouchableOpacity>

          {/* Segment 2: 50% */}
          <TouchableOpacity
            style={styles.funnelSegment}
            onPress={() => setActiveStage(2)}
            activeOpacity={0.8}
          >
            <Text style={styles.funnelValueText}>50%</Text>
            <Text
              style={[
                styles.funnelLabelText,
                activeStage >= 2 && styles.funnelLabelTextActive,
              ]}
            >
              AFTER QUALIFY
            </Text>
          </TouchableOpacity>

          {/* Segment 3: 25% */}
          <TouchableOpacity
            style={styles.funnelSegment}
            onPress={() => setActiveStage(3)}
            activeOpacity={0.8}
          >
            <Text style={styles.funnelValueText}>25%</Text>
            <Text
              style={[
                styles.funnelLabelText,
                activeStage >= 3 && styles.funnelLabelTextActive,
              ]}
            >
              AFTER COMPETE
            </Text>
          </TouchableOpacity>

          {/* Segment 4: PODIUM */}
          <TouchableOpacity
            style={[styles.funnelSegment, styles.funnelSegmentLast]}
            onPress={() => setActiveStage(3)}
            activeOpacity={0.8}
          >
            <Text style={styles.funnelValuePodium}>PODIUM</Text>
            <Text
              style={[
                styles.funnelLabelText,
                activeStage >= 3 && styles.funnelLabelTextActive,
              ]}
            >
              NATIONAL PODIUM
            </Text>
            <View style={styles.podiumAngledAccent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= STAGE CARDS ================= */}
      <View style={styles.stageCardsContainer}>
        {/* STAGE 1: QUALIFY */}
        <TouchableOpacity
          style={[
            styles.stageCard,
            activeStage === 1 && styles.stageCardActiveBlue,
          ]}
          onPress={() => setActiveStage(1)}
          activeOpacity={0.9}
        >
          {/* Top Blue Accent Bar */}
          <View style={[styles.stageTopAccentBar, styles.topAccentBlue]} />

          <View style={styles.stageHeaderRow}>
            <Text style={styles.stageNumberBlue}>01</Text>
            <Text style={styles.stageDaysText}>DAYS 1–7</Text>
          </View>

          <Text style={styles.stageTitleText}>QUALIFY</Text>
          <Text style={styles.stageDescText}>
            Movement becomes your entry test.
          </Text>

          {/* Cutoff Row */}
          <View style={styles.stageCutoffRow}>
            <Text style={styles.cutoffStartBlue}>100%</Text>
            <View style={styles.cutoffTrackWrapper}>
              <View style={[styles.cutoffTrackLine, styles.cutoffTrackLineBlue]} />
              <Text style={[styles.cutoffTrackArrow, styles.cutoffArrowBlue]}>▸</Text>
            </View>
            <Text style={styles.cutoffEndWhite}>50%</Text>
          </View>
        </TouchableOpacity>

        {/* Connecting Chevron */}
        <View style={styles.connectingRow}>
          <Text style={styles.connectingChevron}>↓</Text>
        </View>

        {/* STAGE 2: COMPETE */}
        <TouchableOpacity
          style={[
            styles.stageCard,
            activeStage === 2 && styles.stageCardActiveMagenta,
          ]}
          onPress={() => setActiveStage(2)}
          activeOpacity={0.9}
        >
          {/* Top Magenta Accent Bar */}
          <View style={[styles.stageTopAccentBar, styles.topAccentMagenta]} />

          <View style={styles.stageHeaderRow}>
            <Text style={styles.stageNumberMagenta}>02</Text>
            <Text style={styles.stageDaysText}>DAYS 8–14</Text>
          </View>

          <Text style={styles.stageTitleText}>COMPETE</Text>
          <Text style={styles.stageDescText}>
            Recovery separates the field.
          </Text>

          {/* Cutoff Row */}
          <View style={styles.stageCutoffRow}>
            <Text style={styles.cutoffStartMagenta}>50%</Text>
            <View style={styles.cutoffTrackWrapper}>
              <View style={[styles.cutoffTrackLine, styles.cutoffTrackLineMagenta]} />
              <Text style={[styles.cutoffTrackArrow, styles.cutoffArrowMagenta]}>▸</Text>
            </View>
            <Text style={styles.cutoffEndWhite}>25%</Text>
          </View>
        </TouchableOpacity>

        {/* Connecting Chevron */}
        <View style={styles.connectingRow}>
          <Text style={styles.connectingChevron}>↓</Text>
        </View>

        {/* STAGE 3: CONQUER */}
        <TouchableOpacity
          style={[
            styles.stageCard,
            activeStage === 3 && styles.stageCardActiveAmber,
          ]}
          onPress={() => setActiveStage(3)}
          activeOpacity={0.9}
        >
          {/* Top Amber Accent Bar */}
          <View style={[styles.stageTopAccentBar, styles.topAccentAmber]} />

          <View style={styles.stageHeaderRow}>
            <Text style={styles.stageNumberAmber}>03</Text>
            <Text style={styles.stageDaysText}>DAYS 15–21</Text>
          </View>

          <Text style={[styles.stageTitleText, styles.stageTitleAmber]}>CONQUER</Text>
          <Text style={styles.stageDescText}>
            The remaining contenders fight for the National Podium.
          </Text>

          {/* Cutoff Row */}
          <View style={styles.stageCutoffRow}>
            <Text style={styles.cutoffStartAmber}>25%</Text>
            <View style={styles.cutoffTrackWrapper}>
              <View style={[styles.cutoffTrackLine, styles.cutoffTrackLineAmber]} />
              <Text style={[styles.cutoffTrackArrow, styles.cutoffArrowAmber]}>▸</Text>
            </View>
            <Text style={styles.cutoffPodiumWhite}>NATIONAL PODIUM</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

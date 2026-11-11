import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDrawer } from '../../../navigation/DrawerContext';
import { apiService } from '../../../services/api';
import { storageHelper } from '../../../storage/storageHelper';
import { STORAGE_KEYS } from '../../../storage/storageKeys';
import {
  UserProfile,
  IDailyQuestResponse,
  IDailyQuestChallengeItem,
  IQuestScreenSuggestedCard,
} from '../../../types';
import { styles } from './styles';

type QuestTabType = 'daily' | 'gym' | 'ongoing' | 'archive';

interface StatusCardProps {
  icon: string;
  badge?: string;
  isComingSoon?: boolean;
  title: string;
  description: string;
  metaPills?: string[];
  actionText?: string;
  onActionPress?: () => void;
}

const SUGGESTION_PALETTE = [
  {
    tagColor: '#38BDF8',
    tagBg: 'rgba(56, 189, 248, 0.12)',
    tagBorder: 'rgba(56, 189, 248, 0.3)',
  },
  {
    tagColor: '#34D399',
    tagBg: 'rgba(52, 211, 153, 0.12)',
    tagBorder: 'rgba(52, 211, 153, 0.3)',
  },
  {
    tagColor: '#F59E0B',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    tagBorder: 'rgba(245, 158, 11, 0.3)',
  },
  {
    tagColor: '#A78BFA',
    tagBg: 'rgba(167, 139, 250, 0.12)',
    tagBorder: 'rgba(167, 139, 250, 0.3)',
  },
];

const formatDateShort = (dateStr?: string | null): string => {
  if (!dateStr) return 'N/A';
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return dateStr;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = months[monthIdx] || parts[1];
  return `${parts[2]} ${monthName} ${parts[0]}`;
};

const formatTimestamp = (ts?: string | null): string => {
  if (!ts) return 'Pending';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
};

const formatChallengeTitle = (challengeId: string): string => {
  if (!challengeId) return 'Tournament Challenge';
  return challengeId
    .split('_')
    .map(part =>
      part.toLowerCase() === 'ecfl'
        ? 'ECFL'
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ');
};

const hasText = (val?: string | null): boolean =>
  typeof val === 'string' && val.trim().length > 0;

const getChallengeDisplayTitle = (
  challenge: IDailyQuestChallengeItem,
  metaMap: Record<string, { title?: string; subtitle?: string; tier?: string }>,
): string =>
  metaMap[challenge.challenge_id]?.title ||
  challenge.title ||
  formatChallengeTitle(challenge.challenge_id);

const StatusStateCard: React.FC<StatusCardProps> = ({
  icon,
  badge = 'COMING SOON',
  isComingSoon = true,
  title,
  description,
  metaPills,
  actionText,
  onActionPress,
}) => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyStateIconCircle}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
    </View>

    <View style={isComingSoon ? styles.comingSoonBadge : styles.emptyStateBadge}>
      <Text
        style={
          isComingSoon ? styles.comingSoonBadgeText : styles.emptyStateBadgeText
        }
      >
        {badge}
      </Text>
    </View>

    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateDesc}>{description}</Text>

    {metaPills && metaPills.length > 0 && (
      <View style={styles.metaPillsRow}>
        {metaPills.map((pill, idx) => (
          <View key={`${pill}-${idx}`} style={styles.metaPill}>
            <Text style={styles.metaPillText}>{pill}</Text>
          </View>
        ))}
      </View>
    )}

    {actionText && onActionPress && (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.emptyStateButton}
        onPress={onActionPress}
      >
        <Text style={styles.emptyStateButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const MyQuestsScreen: React.FC = () => {
  const { openDrawer } = useDrawer();
  const [activeTab, setActiveTab] = useState<QuestTabType>('daily');

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [questData, setQuestData] = useState<IDailyQuestResponse | null>(null);
  const [challengeMetaMap, setChallengeMetaMap] = useState<
    Record<string, { title?: string; subtitle?: string; tier?: string }>
  >({});

  const fetchQuests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMsg(null);

      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      const targetUhid = cachedProfile?.uhid?.trim();

      if (!targetUhid) {
        setErrorMsg('User UHID not found. Please log in again.');
        setQuestData(null);
        return;
      }

      const [dailyQuestRes, activeChallengesRes] = await Promise.allSettled([
        apiService.getDailyQuest(targetUhid),
        apiService.getActiveChallenges(targetUhid),
      ]);

      if (dailyQuestRes.status === 'fulfilled' && dailyQuestRes.value) {
        const resData = dailyQuestRes.value;
        setQuestData(resData);

        if (!isRefresh && resData.quest_screen?.tabs) {
          const t = resData.quest_screen.tabs;
          const isTruthy = (v?: string | boolean) =>
            v === true || (typeof v === 'string' && v.toLowerCase() === 'true');
          if (isTruthy(t.daily_gym?.selected)) {
            setActiveTab('gym');
          } else if (isTruthy(t.ongoing_quest?.selected)) {
            setActiveTab('ongoing');
          } else if (isTruthy(t.archive?.selected)) {
            setActiveTab('archive');
          } else if (isTruthy(t.daily_quest?.selected)) {
            setActiveTab('daily');
          }
        }
      } else {
        const err =
          dailyQuestRes.status === 'rejected' ? dailyQuestRes.reason : null;
        setErrorMsg(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to fetch quest details.',
        );
      }

      if (
        activeChallengesRes.status === 'fulfilled' &&
        activeChallengesRes.value?.status === 'Success' &&
        Array.isArray(activeChallengesRes.value?.data)
      ) {
        const meta: Record<
          string,
          { title?: string; subtitle?: string; tier?: string }
        > = {};
        activeChallengesRes.value.data.forEach((c: any) => {
          if (c?.challengeId) {
            meta[c.challengeId] = {
              title: c.title,
              subtitle: c.subtitle,
              tier: c.tier,
            };
          }
        });
        setChallengeMetaMap(meta);
      }
    } catch (err: any) {
      console.error('[MyQuestsScreen] Error loading quests:', err);
      setErrorMsg(err?.message || 'Unable to load quests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests(false);
  }, [fetchQuests]);

  const questScreen = questData?.quest_screen;
  const tabsCfg = questScreen?.tabs;
  const dailyQuest = questData?.daily_quest;
  const dailyQuestCardCfg = questScreen?.daily_quest_card;
  const suggestedCfg = questScreen?.suggested_for_you;

  // Header fields strictly from API with clean defaults when backend sends ""
  const headerTitle = hasText(questScreen?.title)
    ? questScreen!.title!.trim()
    : 'My Quests';
  const headerSubtitle = hasText(questScreen?.subtitle)
    ? questScreen!.subtitle!.trim()
    : questData?.date
    ? `Protocol Date: ${formatDateShort(questData.date)}`
    : 'Active Directives & Protocol Hub';
  const hubIcon = hasText(questScreen?.quests_hub?.icon)
    ? questScreen!.quests_hub!.icon!.trim()
    : '⚡';
  const hubLabel = hasText(questScreen?.quests_hub?.label)
    ? questScreen!.quests_hub!.label!.trim()
    : 'Quests Hub';

  // Tab labels & icons from API with clean defaults when ""
  const dailyTabIcon = hasText(tabsCfg?.daily_quest?.icon)
    ? tabsCfg!.daily_quest!.icon!.trim()
    : '📅';
  const dailyTabLabel = hasText(tabsCfg?.daily_quest?.label)
    ? tabsCfg!.daily_quest!.label!.trim()
    : 'Daily Quest';

  const gymTabIcon = hasText(tabsCfg?.daily_gym?.icon)
    ? tabsCfg!.daily_gym!.icon!.trim()
    : '🏋️';
  const gymTabLabel = hasText(tabsCfg?.daily_gym?.label)
    ? tabsCfg!.daily_gym!.label!.trim()
    : 'Daily Gym Quest';

  const ongoingTabIcon = hasText(tabsCfg?.ongoing_quest?.icon)
    ? tabsCfg!.ongoing_quest!.icon!.trim()
    : '⚡';
  const ongoingTabLabel = hasText(tabsCfg?.ongoing_quest?.label)
    ? tabsCfg!.ongoing_quest!.label!.trim()
    : 'Ongoing Quest';

  const archiveTabIcon = hasText(tabsCfg?.archive?.icon)
    ? tabsCfg!.archive!.icon!.trim()
    : '📦';
  const archiveTabLabel = hasText(tabsCfg?.archive?.label)
    ? tabsCfg!.archive!.label!.trim()
    : 'Archive';

  // Suggested cards filtered strictly for non-empty items from API
  const validSuggestedCards: IQuestScreenSuggestedCard[] = (
    suggestedCfg?.cards || []
  ).filter(
    c =>
      hasText(c.title) ||
      hasText(c.description) ||
      hasText(c.quest_id) ||
      hasText(c.frequency) ||
      hasText(c.duration),
  );

  // Split challenges from daily-quest API into Ongoing (current/upcoming) vs Archive (ended)
  const referenceDate = (
    questData?.date || new Date().toISOString().split('T')[0]
  ).slice(0, 10);

  const allChallenges: IDailyQuestChallengeItem[] = Array.isArray(
    questData?.challenges,
  )
    ? questData!.challenges!
    : [];

  const ongoingChallenges = allChallenges
    .filter(c => {
      const end = (c.end_date || '').slice(0, 10);
      return !end || end >= referenceDate;
    })
    .sort((a, b) => {
      const aStart = (a.start_date || '').slice(0, 10);
      const bStart = (b.start_date || '').slice(0, 10);
      const aActive = aStart <= referenceDate ? 0 : 1;
      const bActive = bStart <= referenceDate ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return aStart.localeCompare(bStart);
    });

  const endedChallenges = allChallenges.filter(c => {
    const end = (c.end_date || '').slice(0, 10);
    return Boolean(end && end < referenceDate);
  });

  const explicitArchiveItems: any[] = Array.isArray(questData?.archive)
    ? questData!.archive!
    : [];

  const explicitOngoingItems: any[] = Array.isArray(questData?.ongoing_quests)
    ? questData!.ongoing_quests!
    : [];

  // Check if gym quest data is dynamically returned by API
  const gymQuestPayload = questData?.daily_gym || questScreen?.daily_gym_card;
  const hasGymQuestData = Boolean(
    gymQuestPayload &&
      typeof gymQuestPayload === 'object' &&
      (hasText(gymQuestPayload.title) ||
        hasText(gymQuestPayload.exerciseName) ||
        hasText(gymQuestPayload.prescriptionCardType) ||
        hasText(gymQuestPayload.description)),
  );

  // Check if daily quest evaluation is active vs NOT_AVAILABLE
  const isDailyQuestAvailable = Boolean(
    (dailyQuest?.status &&
      dailyQuest.status.toUpperCase() !== 'NOT_AVAILABLE') ||
      hasText(dailyQuestCardCfg?.title),
  );

  const renderDailyQuestTab = () => {
    const checkBtnIcon = hasText(dailyQuestCardCfg?.check_for_updates?.icon)
      ? dailyQuestCardCfg!.check_for_updates!.icon!.trim()
      : '🔄';
    const checkBtnLabel = hasText(dailyQuestCardCfg?.check_for_updates?.label)
      ? dailyQuestCardCfg!.check_for_updates!.label!.trim()
      : 'Check for Updates';

    const dailyMetaPills: string[] = [];
    if (dailyQuest?.CONTINUOUS_SITTING_MAX_MINS !== undefined) {
      dailyMetaPills.push(
        `🪑 Max Sitting Limit: ${dailyQuest.CONTINUOUS_SITTING_MAX_MINS} mins`,
      );
    }
    if (dailyQuest?.LAST_EVALUATION_TIMESTAMP) {
      dailyMetaPills.push(
        `🕒 Checked: ${formatTimestamp(dailyQuest.LAST_EVALUATION_TIMESTAMP)}`,
      );
    }
    if (questData?.date) {
      dailyMetaPills.push(`📅 ${formatDateShort(questData.date)}`);
    }

    return (
      <View>
        {isDailyQuestAvailable ? (
          <View style={styles.questCard}>
            <View style={styles.questCardHeader}>
              <View style={styles.questCategoryBadge}>
                <Text style={styles.questCategoryText}>
                  {hasText(dailyQuestCardCfg?.icon)
                    ? `${dailyQuestCardCfg!.icon} `
                    : '🎯 '}
                  {(hasText(dailyQuestCardCfg?.status)
                    ? dailyQuestCardCfg!.status
                    : dailyQuest?.status || 'ACTIVE'
                  )
                    ?.toString()
                    .replace(/_/g, ' ')
                    .toUpperCase()}
                </Text>
              </View>
              {questData?.date && (
                <View style={styles.questXpBadge}>
                  <Text style={styles.questXpText}>
                    📅 {formatDateShort(questData.date)}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.questTitle}>
              {hasText(dailyQuestCardCfg?.title)
                ? dailyQuestCardCfg!.title!.trim()
                : 'Daily Sitting-Streak Quest'}
            </Text>

            <Text style={styles.questDesc}>
              {hasText(dailyQuestCardCfg?.description)
                ? dailyQuestCardCfg!.description!.trim()
                : dailyQuest?.MIDDAY_QUEST_ALERT || 'Daily quest evaluation active.'}
            </Text>

            {dailyQuest?.CONTINUOUS_SITTING_MAX_MINS !== undefined && (
              <View style={styles.questTargetRow}>
                <Text style={styles.questTargetLabel}>
                  🪑 Continuous Sitting Max Threshold
                </Text>
                <Text style={styles.questTargetValue}>
                  {dailyQuest.CONTINUOUS_SITTING_MAX_MINS} Mins
                </Text>
              </View>
            )}

            {dailyQuest?.LAST_EVALUATION_TIMESTAMP && (
              <View style={styles.questTargetRow}>
                <Text style={styles.questTargetLabel}>🕒 Last Evaluation</Text>
                <Text style={styles.questTargetValue}>
                  {formatTimestamp(dailyQuest.LAST_EVALUATION_TIMESTAMP)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.questActionBtn}
              onPress={() => fetchQuests(true)}
            >
              <Text style={styles.questActionBtnText}>
                {checkBtnIcon} {checkBtnLabel}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <StatusStateCard
            icon={
              hasText(dailyQuestCardCfg?.icon)
                ? dailyQuestCardCfg!.icon!.trim()
                : '🎯'
            }
            badge={
              hasText(dailyQuestCardCfg?.status)
                ? dailyQuestCardCfg!.status!.trim().toUpperCase()
                : 'COMING SOON'
            }
            isComingSoon={true}
            title={
              hasText(dailyQuestCardCfg?.title)
                ? dailyQuestCardCfg!.title!.trim()
                : 'Daily Quest Evaluation Coming Soon'
            }
            description={
              hasText(dailyQuestCardCfg?.description)
                ? dailyQuestCardCfg!.description!.trim()
                : dailyQuest?.MIDDAY_QUEST_ALERT ||
                  'No verified current sitting-streak evaluation is available yet. Check back after your next sync.'
            }
            metaPills={dailyMetaPills}
            actionText={`${checkBtnIcon} ${checkBtnLabel}`}
            onActionPress={() => fetchQuests(true)}
          />
        )}

        {/* Suggested For You Section */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionHeaderIcon}>✨</Text>
            <Text style={styles.sectionHeaderTitle}>
              {hasText(suggestedCfg?.title)
                ? suggestedCfg!.title!.trim()
                : 'SUGGESTED FOR YOU'}
            </Text>
          </View>
          <Text style={styles.sectionHeaderSubtext}>
            {hasText(suggestedCfg?.subtitle)
              ? suggestedCfg!.subtitle!.trim()
              : 'Weekly Foundational'}
          </Text>
        </View>

        {validSuggestedCards.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsHorizontalWrapper}
            contentContainerStyle={styles.suggestionsRow}
          >
            {validSuggestedCards.map((item, idx) => {
              const palette =
                SUGGESTION_PALETTE[idx % SUGGESTION_PALETTE.length];
              return (
                <TouchableOpacity
                  key={item.quest_id || `suggested-${idx}`}
                  activeOpacity={0.85}
                  style={styles.suggestionCard}
                  onPress={() =>
                    Alert.alert(
                      item.title || 'Suggested Quest',
                      `${
                        hasText(item.duration)
                          ? `⏱️ Duration: ${item.duration}\n`
                          : ''
                      }${
                        hasText(item.frequency)
                          ? `📅 Frequency: ${item.frequency}\n\n`
                          : ''
                      }${item.description || ''}`,
                    )
                  }
                >
                  <View>
                    <View style={styles.suggestionTop}>
                      <View style={styles.suggestionIconBox}>
                        <Text style={styles.suggestionIcon}>
                          {hasText(item.icon) ? item.icon : '✨'}
                        </Text>
                      </View>
                      {hasText(item.frequency) && (
                        <View
                          style={[
                            styles.suggestionTagWrap,
                            {
                              backgroundColor: palette.tagBg,
                              borderColor: palette.tagBorder,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.suggestionTag,
                              { color: palette.tagColor },
                            ]}
                          >
                            {item.frequency}
                          </Text>
                        </View>
                      )}
                    </View>

                    {hasText(item.title) && (
                      <Text style={styles.suggestionTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                    )}

                    {hasText(item.duration) && (
                      <View style={styles.suggestionDurationRow}>
                        <Text style={styles.suggestionDurationIcon}>⏱️</Text>
                        <Text style={styles.suggestionDurationText}>
                          {item.duration}
                        </Text>
                      </View>
                    )}

                    {hasText(item.description) && (
                      <Text style={styles.suggestionDesc} numberOfLines={3}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.comingSoonCompactCard}>
            <Text style={styles.comingSoonCompactIcon}>🚀</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
            </View>
            <Text style={styles.comingSoonCompactTitle}>
              Suggested Quests Coming Soon
            </Text>
            <Text style={styles.comingSoonCompactDesc}>
              Personalized weekly foundational quests will appear here automatically once available for your profile.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderDailyGymQuestTab = () => {
    if (hasGymQuestData) {
      return (
        <View style={styles.questCard}>
          <View style={styles.questCardHeader}>
            <View style={styles.questCategoryBadge}>
              <Text style={styles.questCategoryText}>
                {hasText(gymQuestPayload.icon) ? `${gymQuestPayload.icon} ` : '🏋️ '}
                {(gymQuestPayload.status || 'ACTIVE GYM QUEST')
                  .toString()
                  .toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.questTitle}>
            {gymQuestPayload.title ||
              gymQuestPayload.exerciseName ||
              gymQuestPayload.prescriptionCardType}
          </Text>
          {hasText(gymQuestPayload.description) && (
            <Text style={styles.questDesc}>{gymQuestPayload.description}</Text>
          )}
          {hasText(gymQuestPayload.targetAllocation || gymQuestPayload.duration) && (
            <View style={styles.questTargetRow}>
              <Text style={styles.questTargetLabel}>🎯 Target</Text>
              <Text style={styles.questTargetValue}>
                {gymQuestPayload.targetAllocation || gymQuestPayload.duration}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <StatusStateCard
        icon={gymTabIcon}
        badge="COMING SOON"
        isComingSoon={true}
        title="Daily Gym Quest Coming Soon"
        description="Personalized machine resistance quests, prescribed volume targets, and biomechanical alerts will appear here once enabled for your profile."
        actionText="🔄 Check for Updates"
        onActionPress={() => fetchQuests(true)}
      />
    );
  };

  const renderOngoingQuestTab = () => {
    const hasOngoing =
      ongoingChallenges.length > 0 || explicitOngoingItems.length > 0;

    if (!hasOngoing) {
      return (
        <StatusStateCard
          icon={ongoingTabIcon}
          badge="COMING SOON"
          isComingSoon={true}
          title="Ongoing Quests Coming Soon"
          description="Your active multi-day challenge quests and telemetry-synced habit directives will appear here once started."
          actionText="🔄 Check for Updates"
          onActionPress={() => fetchQuests(true)}
        />
      );
    }

    return (
      <View>
        {ongoingChallenges.map(challenge => {
          const startStr = (challenge.start_date || '').slice(0, 10);
          const isStarted = !startStr || startStr <= referenceDate;
          const enriched = challengeMetaMap[challenge.challenge_id];
          const displayTitle = getChallengeDisplayTitle(
            challenge,
            challengeMetaMap,
          );
          const qEval = challenge.daily_quest;
          const isEvalActive =
            qEval?.status && qEval.status.toUpperCase() !== 'NOT_AVAILABLE';

          return (
            <View key={challenge.challenge_id} style={styles.questCard}>
              <View style={styles.ongoingBadgeRow}>
                <View
                  style={[
                    styles.ongoingStatusBadge,
                    {
                      backgroundColor: isStarted
                        ? 'rgba(16, 185, 129, 0.14)'
                        : 'rgba(245, 158, 11, 0.14)',
                      borderColor: isStarted
                        ? 'rgba(16, 185, 129, 0.35)'
                        : 'rgba(245, 158, 11, 0.35)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.ongoingStatusText,
                      { color: isStarted ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    {isStarted ? '● ACTIVE NOW' : '⏳ UPCOMING'}
                  </Text>
                </View>

                <Text style={styles.ongoingDateBadge}>
                  {formatDateShort(challenge.start_date)} –{' '}
                  {formatDateShort(challenge.end_date)}
                </Text>
              </View>

              <Text style={styles.questTitle}>{displayTitle}</Text>
              <Text style={styles.questDesc}>
                {enriched?.subtitle ||
                  challenge.subtitle ||
                  `Challenge ID: ${challenge.challenge_id}`}
              </Text>

              <View style={styles.questTargetRow}>
                <Text style={styles.questTargetLabel}>
                  🪑 Continuous Sitting Limit
                </Text>
                <Text style={styles.questTargetValue}>
                  {qEval?.CONTINUOUS_SITTING_MAX_MINS ?? 60} Mins
                </Text>
              </View>

              <View style={styles.questTargetRow}>
                <Text style={styles.questTargetLabel}>📡 Daily Quest Status</Text>
                <Text
                  style={[
                    styles.questTargetValue,
                    { color: isEvalActive ? '#10B981' : '#F59E0B' },
                  ]}
                >
                  {(qEval?.status || 'NOT_AVAILABLE').replace(/_/g, ' ')}
                </Text>
              </View>

              {qEval?.LAST_EVALUATION_TIMESTAMP && (
                <View style={styles.questTargetRow}>
                  <Text style={styles.questTargetLabel}>🕒 Last Evaluated</Text>
                  <Text style={styles.questTargetValue}>
                    {formatTimestamp(qEval.LAST_EVALUATION_TIMESTAMP)}
                  </Text>
                </View>
              )}

              {hasText(qEval?.MIDDAY_QUEST_ALERT) && (
                <View style={styles.challengeAlertBox}>
                  <Text style={styles.challengeAlertLabel}>
                    Midday Quest Evaluation
                  </Text>
                  <Text style={styles.challengeAlertText}>
                    {qEval!.MIDDAY_QUEST_ALERT}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {explicitOngoingItems.map((item: any, idx: number) => (
          <View
            key={item.id || item.quest_id || `ongoing-${idx}`}
            style={styles.questCard}
          >
            <View style={styles.questCardHeader}>
              <View style={styles.questCategoryBadge}>
                <Text style={styles.questCategoryText}>
                  {(item.status || 'ONGOING').toString().toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.questTitle}>
              {item.title || item.name || 'Ongoing Quest'}
            </Text>
            {hasText(item.description) && (
              <Text style={styles.questDesc}>{item.description}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderArchiveTab = () => {
    const hasArchive =
      endedChallenges.length > 0 || explicitArchiveItems.length > 0;

    if (!hasArchive) {
      return (
        <StatusStateCard
          icon={archiveTabIcon}
          badge="COMING SOON"
          isComingSoon={true}
          title="Quest Archive Coming Soon"
          description="Completed daily quests and finished challenge records will automatically appear here once your quest history is finalized."
          actionText="🔄 Check for Updates"
          onActionPress={() => fetchQuests(true)}
        />
      );
    }

    return (
      <View>
        {endedChallenges.map(challenge => {
          const displayTitle = getChallengeDisplayTitle(
            challenge,
            challengeMetaMap,
          );
          return (
            <View key={challenge.challenge_id} style={styles.archiveItemCard}>
              <View style={styles.archiveItemTop}>
                <Text style={styles.archiveCategory}>
                  {challenge.challenge_id.toUpperCase()}
                </Text>
                <View style={styles.archiveCompletedBadge}>
                  <Text style={styles.archiveCompletedText}>ENDED</Text>
                </View>
              </View>
              <Text style={styles.archiveItemTitle}>{displayTitle}</Text>
              {hasText(challenge.daily_quest?.MIDDAY_QUEST_ALERT) && (
                <View style={styles.archiveOutcomeRow}>
                  <Text style={styles.archiveOutcomeText}>
                    {challenge.daily_quest.MIDDAY_QUEST_ALERT}
                  </Text>
                </View>
              )}
              <Text style={styles.archiveDateFooter}>
                Window: {formatDateShort(challenge.start_date)} –{' '}
                {formatDateShort(challenge.end_date)}
              </Text>
            </View>
          );
        })}

        {explicitArchiveItems.map((item: any, idx: number) => (
          <View
            key={item.id || item.quest_id || `archive-${idx}`}
            style={styles.archiveItemCard}
          >
            <View style={styles.archiveItemTop}>
              <Text style={styles.archiveCategory}>
                {(item.category || 'ARCHIVED QUEST').toString().toUpperCase()}
              </Text>
              <View style={styles.archiveCompletedBadge}>
                <Text style={styles.archiveCompletedText}>
                  {(item.status || 'COMPLETED').toString().toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.archiveItemTitle}>
              {item.title || item.name || 'Archived Quest'}
            </Text>
            {hasText(item.description || item.outcome) && (
              <View style={styles.archiveOutcomeRow}>
                <Text style={styles.archiveOutcomeText}>
                  {item.description || item.outcome}
                </Text>
              </View>
            )}
            {hasText(item.date || item.completedAt) && (
              <Text style={styles.archiveDateFooter}>
                {formatDateShort(item.date || item.completedAt)}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />

      {/* Screen Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
            <Text style={{ fontSize: 18, color: '#FFFFFF' }}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {headerSubtitle}
            </Text>
          </View>
        </View>

        <View style={styles.headerXpBadge}>
          <Text style={styles.headerXpText}>
            {hubIcon} {hubLabel}
          </Text>
        </View>
      </View>

      {/* 4-Way Mode Switcher Tabs */}
      <View style={styles.tabScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabBtn, activeTab === 'daily' && styles.tabBtnActive]}
            onPress={() => setActiveTab('daily')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'daily' && styles.tabBtnTextActive,
              ]}
            >
              {dailyTabIcon} {dailyTabLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabBtn, activeTab === 'gym' && styles.tabBtnActive]}
            onPress={() => setActiveTab('gym')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'gym' && styles.tabBtnTextActive,
              ]}
            >
              {gymTabIcon} {gymTabLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              activeTab === 'ongoing' && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab('ongoing')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'ongoing' && styles.tabBtnTextActive,
              ]}
            >
              {ongoingTabIcon} {ongoingTabLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              activeTab === 'archive' && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab('archive')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'archive' && styles.tabBtnTextActive,
              ]}
            >
              {archiveTabIcon} {archiveTabLabel}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchQuests(true)}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Syncing your quests...</Text>
          </View>
        ) : errorMsg && !questData ? (
          <StatusStateCard
            icon="⚠️"
            badge="SYNC ERROR"
            isComingSoon={false}
            title="Unable to Load Quests"
            description={errorMsg}
            actionText="🔄 Retry"
            onActionPress={() => fetchQuests(false)}
          />
        ) : (
          <>
            {activeTab === 'daily' && renderDailyQuestTab()}
            {activeTab === 'gym' && renderDailyGymQuestTab()}
            {activeTab === 'ongoing' && renderOngoingQuestTab()}
            {activeTab === 'archive' && renderArchiveTab()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyQuestsScreen;

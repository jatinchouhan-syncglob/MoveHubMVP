import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';

interface ProfileTooltipProps {
  visible: boolean;
  onClose: () => void;
  onSeeMore: () => void;
  anchorPosition?: { top: number; right: number };
  initialProfile?: UserProfile | null;
}

export const ProfileTooltip: React.FC<ProfileTooltipProps> = ({
  visible,
  onClose,
  onSeeMore,
  anchorPosition,
  initialProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile || null);

  useEffect(() => {
    if (visible) {
      storageHelper
        .getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE)
        .then((cached) => {
          if (cached) {
            setProfile(cached);
          }
        })
        .catch((err) => {
          console.warn('[ProfileTooltip] Failed to read user profile:', err);
        });
    }
  }, [visible]);

  if (!visible) return null;

  const displayName = profile?.name?.trim() || 'MoveHub User';
  const displayEmail = profile?.email?.trim() || 'No email registered';

  // Extract initials (e.g. "Jatin Chouhan" -> "JC")
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Additional secondary info if available
  const metaParts: string[] = [];
  if (profile?.gender) metaParts.push(profile.gender);
  if (profile?.age && Number(profile.age) > 0) metaParts.push(`${profile.age} yrs`);
  if (!metaParts.length && profile?.occupation) metaParts.push(profile.occupation);
  const secondaryMeta = metaParts.join(' • ');

  const topPos = anchorPosition?.top ?? (Platform.OS === 'ios' ? 62 : 56);
  const rightPos = anchorPosition?.right ?? 14;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.tooltipCard,
                {
                  top: topPos,
                  right: rightPos,
                },
              ]}
            >
              {/* Tooltip top pointer arrow pointing to profile icon */}
              <View style={styles.pointerArrow} />

              {/* Header row with Avatar, Name, and Close button */}
              <View style={styles.headerRow}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                  <View style={styles.activeDot} />
                </View>

                <View style={styles.nameContainer}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>Active Member</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="#94A3B8"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Minimum Info Rows (Email & optional secondary meta) */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={styles.infoIcon}>
                    <Path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      stroke="#94A3B8"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M22 6l-10 7L2 6"
                      stroke="#94A3B8"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.infoText} numberOfLines={1}>
                    {displayEmail}
                  </Text>
                </View>

                {secondaryMeta ? (
                  <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <Svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={styles.infoIcon}>
                      <Circle cx="12" cy="12" r="9" stroke="#64748B" strokeWidth={2} />
                      <Path d="M12 7v5l3 3" stroke="#64748B" strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                    <Text style={styles.secondaryMetaText} numberOfLines={1}>
                      {secondaryMeta}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Bottom "See More Info" Action Button */}
              <TouchableOpacity
                onPress={onSeeMore}
                style={styles.seeMoreBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.seeMoreBtnText}>See More Info</Text>
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="#FFFFFF"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.45)',
  },
  tooltipCard: {
    position: 'absolute',
    width: 270,
    backgroundColor: '#151E33',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22324D',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  pointerArrow: {
    position: 'absolute',
    top: -6,
    right: 14,
    width: 12,
    height: 12,
    backgroundColor: '#151E33',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#22324D',
    transform: [{ rotate: '45deg' }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#151E33',
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoSection: {
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 11.5,
    color: '#94A3B8',
    flex: 1,
  },
  secondaryMetaText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 10,
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  seeMoreBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 6,
    letterSpacing: 0.3,
  },
});

export default ProfileTooltip;

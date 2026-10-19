import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface HealthConnectPermissionModalProps {
  visible: boolean;
  onNavigateToHealthConnect: () => void;
  onDismiss: () => void;
}

export const HealthConnectPermissionModal: React.FC<HealthConnectPermissionModalProps> = ({
  visible,
  onNavigateToHealthConnect,
  onDismiss,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Close Button */}
          <TouchableOpacity
            style={styles.closeIconButton}
            onPress={onDismiss}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>

          {/* Glowing Icon Badge */}
          <View style={styles.iconGlowRing}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconEmoji}>❤️</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>PERMISSIONS MISSING • NOT CONNECTED</Text>
          </View>

          {/* Modal Title */}
          <Text style={styles.titleText}>Health Connect Permissions Required</Text>

          {/* Description & Impact Warning */}
          <Text style={styles.messageText}>
            Health Connect permissions are currently missing or disconnected. Without these permissions, MoveHub <Text style={styles.highlightText}>cannot track or sync</Text> your daily steps, active calorie burn, workout sessions, and cardiometabolic data.
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningBoxTitle}>⚠️ Data Sync Paused</Text>
            <Text style={styles.warningBoxDesc}>
              Please grant all permissions in Health Connect so your activity counts toward your daily goals, Habit War Room, and Arena tournaments.
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={onNavigateToHealthConnect}
            activeOpacity={0.85}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5', '#4338CA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Go to Steps Tracking ➔</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDismiss}
            activeOpacity={0.7}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Remind Me in 1 Min</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 16, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIconText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  iconGlowRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 26,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  statusBadgeText: {
    color: '#F59E0B',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  highlightText: {
    color: '#F87171',
    fontWeight: '800',
  },
  warningBox: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#070C18',
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 10,
    marginBottom: 16,
  },
  warningBoxTitle: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  warningBoxDesc: {
    color: '#64748B',
    fontSize: 10.5,
    lineHeight: 15,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default HealthConnectPermissionModal;

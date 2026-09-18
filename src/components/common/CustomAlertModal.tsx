import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'warning' | 'info';
  buttonText?: string;
  icon?: string;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  onClose,
  type = 'error',
  buttonText,
  icon,
}) => {
  // Determine colors and icons based on alert type
  let defaultIcon = '⚠️';
  let badgeBg = 'rgba(244, 63, 94, 0.08)';
  let badgeBorder = 'rgba(244, 63, 94, 0.2)';
  let gradientColors = ['#f43f5e', '#e11d48'];
  let shadowColor = '#f43f5e';
  let defaultBtnText = 'Dismiss';

  if (type === 'success') {
    defaultIcon = '🎉';
    badgeBg = 'rgba(16, 185, 129, 0.12)';
    badgeBorder = 'rgba(16, 185, 129, 0.3)';
    gradientColors = ['#10b981', '#059669'];
    shadowColor = '#10b981';
    defaultBtnText = 'Continue';
  } else if (type === 'warning') {
    defaultIcon = '⚠️';
    badgeBg = 'rgba(245, 158, 11, 0.12)';
    badgeBorder = 'rgba(245, 158, 11, 0.3)';
    gradientColors = ['#f59e0b', '#d97706'];
    shadowColor = '#f59e0b';
    defaultBtnText = 'OK';
  } else if (type === 'info') {
    defaultIcon = 'ℹ️';
    badgeBg = 'rgba(99, 102, 241, 0.12)';
    badgeBorder = 'rgba(99, 102, 241, 0.3)';
    gradientColors = ['#6366f1', '#4f46e5'];
    shadowColor = '#6366f1';
    defaultBtnText = 'OK';
  }

  const displayIcon = icon || defaultIcon;
  const displayBtnText = buttonText || defaultBtnText;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { shadowColor }]}>
          <View style={[styles.iconBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
            <Text style={styles.iconText}>{displayIcon}</Text>
          </View>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>
          
          <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.button}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>{displayBtnText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  titleText: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default CustomAlertModal;

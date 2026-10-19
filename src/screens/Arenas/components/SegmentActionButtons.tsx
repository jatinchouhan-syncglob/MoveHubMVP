import React from 'react';
import { View, Text, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { ISegmentConfig, ISegmentAction } from '../types';

interface SegmentActionButtonsProps {
  config: ISegmentConfig;
  onOpenReferralModal: () => void;
  onOpenPlaybookModal: () => void;
}

export const SegmentActionButtons: React.FC<SegmentActionButtonsProps> = ({
  config,
  onOpenReferralModal,
  onOpenPlaybookModal,
}) => {
  const [action1, action2] = config.actions;

  const handleActionPress = async (action: ISegmentAction) => {
    switch (action.type) {
      case 'share': {
        try {
          await Share.share(
            Platform.OS === 'ios'
              ? {
                  title: `${config.name} | MoveHub Arena`,
                  message: `🏆 Join my squad in the ${config.title} on MoveHub!\n\nLock in your team multiplier and compete for the National Podium.\n👉 https://movehub.app/arenas?segment=${config.key}`,
                  url: `https://movehub.app/arenas?segment=${config.key}`,
                }
              : {
                  title: `${config.name} | MoveHub Arena`,
                  message: `🏆 Join my squad in the ${config.title} on MoveHub!\n\nLock in your team multiplier and compete for the National Podium.\n👉 https://movehub.app/arenas?segment=${config.key}`,
                },
          );
        } catch (err) {
          console.warn('[SegmentActionButtons] Share error:', err);
        }
        break;
      }
      case 'challenge': {
        onOpenPlaybookModal();
        break;
      }
      case 'refer':
      case 'register': {
        onOpenReferralModal();
        break;
      }
      case 'menu': {
        Alert.alert(
          '7-Day Clinical Menu',
          'Your personalized Indian nutrition menu has been calibrated with unrefined food substrates (Ragi, Sprouts, Turmeric).',
        );
        break;
      }
      case 'audit': {
        Alert.alert(
          'Biomechanical Leak Audit',
          '96% Off-Body Audit: Continuous passive accelerometer telemetry is tracking your non-gym recovery and posture.',
        );
        break;
      }
      case 'scan': {
        Alert.alert(
          'Store Checkout Voucher',
          'Scan this token at your local partner retail outlet to claim your 10% co-branded partnership discount.',
        );
        break;
      }
      default:
        break;
    }
  };

  const renderButton = (action: ISegmentAction, isPrimary: boolean) => {
    return (
      <TouchableOpacity
        key={action.id}
        style={[
          styles.actionButton,
          {
            borderColor: isPrimary
              ? config.theme.coreAccent
              : config.theme.mutedBorders,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => handleActionPress(action)}
      >
        <LinearGradient
          colors={
            isPrimary
              ? [config.theme.cardBg, config.theme.canvasBase]
              : ['#0F172A', '#020617']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionButtonGradient}
        >
          <Text style={styles.actionButtonIcon}>{action.icon}</Text>
          <Text
            style={[
              styles.actionButtonText,
              { color: isPrimary ? config.theme.coreAccent : '#FFFFFF' },
            ]}
          >
            {action.label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.actionsSection}>
      {renderButton(action1, true)}
      {renderButton(action2, false)}
    </View>
  );
};

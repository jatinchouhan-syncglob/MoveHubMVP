import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { JoinSuccessData } from '../types';

interface JoinSuccessModalProps {
  visible: boolean;
  data: JoinSuccessData | null;
  uhid: string;
  onViewRankings: () => void;
  onClose: () => void;
}

export const JoinSuccessModal: React.FC<JoinSuccessModalProps> = ({
  visible,
  data,
  uhid,
  onViewRankings,
  onClose,
}) => {
  if (!data) return null;

  const isNominated = data.type === 'nominate';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalTrophyBadge}>
            <Text style={styles.modalTrophyText}>🏆</Text>
          </View>

          <Text style={styles.modalSuccessTitle}>
            {isNominated ? 'ENTITY NOMINATED!' : 'CHALLENGE JOINED!'}
          </Text>

          <Text style={styles.modalSuccessSubtitle}>
            {isNominated
              ? 'Your nomination was submitted and verified successfully. Notifications sent.'
              : 'You are now officially linked and competing with your squad in the Arena!'}
          </Text>

          {/* Details Summary Card */}
          <View style={styles.modalSummaryCard}>
            <View style={styles.modalSummaryRow}>
              <Text style={styles.modalSummaryLabel}>COMMUNITY / ENTITY:</Text>
              <Text style={styles.modalSummaryValue}>{data.entityName}</Text>
            </View>

            {data.referralCode ? (
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>REFERRAL CODE:</Text>
                <Text style={styles.modalSummaryHighlight}>
                  {data.referralCode}
                </Text>
              </View>
            ) : null}

            {data.entityType ? (
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>CATEGORY:</Text>
                <Text style={styles.modalSummaryValue}>{data.entityType}</Text>
              </View>
            ) : null}

            <View style={styles.modalSummaryRow}>
              <Text style={styles.modalSummaryLabel}>YOUR UHID:</Text>
              <Text style={styles.modalSummaryValue}>{uhid}</Text>
            </View>

            {data.location || data.city ? (
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>LOCATION:</Text>
                <Text style={styles.modalSummaryValue}>
                  {[data.location, data.city].filter(Boolean).join(', ')}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.modalPrimaryActionBtn}
            activeOpacity={0.85}
            onPress={onViewRankings}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalPrimaryGradient}
            >
              <Text style={styles.modalPrimaryText}>VIEW ARENA RANKINGS</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Action Button */}
          <TouchableOpacity
            style={styles.modalSecondaryActionBtn}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.modalSecondaryText}>BACK TO ARENA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { ISegmentTheme } from '../types';
import { MOCK_CALIBRATION_PROFILE } from '../constants';

interface BiophysicalCalibrationModalProps {
  visible: boolean;
  onClose: () => void;
  activeTheme?: ISegmentTheme;
}

export const BiophysicalCalibrationModal: React.FC<BiophysicalCalibrationModalProps> = ({
  visible,
  onClose,
}) => {
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditComplete, setAuditComplete] = useState<boolean>(false);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
      Alert.alert(
        'Calibration Complete',
        'Biophysical sensors successfully synced with 98.4% signal integrity. Dynamic handicap locked for Tournament Playbook.'
      );
    }, 1800);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Biophysical Calibration</Text>
              <Text style={styles.modalSubtitle}>
                PRE-TOURNAMENT PASSIVE SENSOR AUDIT
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Prompt Card */}
            <View style={styles.calibrationCard}>
              <View style={styles.calibrationStatusBadge}>
                <Text style={styles.calibrationStatusText}>
                  {auditComplete ? '● CALIBRATED & VERIFIED' : `● ${MOCK_CALIBRATION_PROFILE.status}`}
                </Text>
              </View>

              <Text style={styles.calibrationPromptHeading}>
                Calibrate your sensor profile today
              </Text>
              <Text style={styles.calibrationPromptSub}>
                To ensure competitive fairness across all segments, our system audits passive accelerometer baseline, stride velocity, and sedentary transition rate prior to tournament match gates.
              </Text>

              {/* Stat Grid */}
              <View style={styles.calibrationStatsGrid}>
                <View style={styles.calibrationStatCard}>
                  <Text style={styles.calibrationStatLabel}>Sensor Audit Score</Text>
                  <Text style={styles.calibrationStatValue}>
                    {MOCK_CALIBRATION_PROFILE.auditScore}
                  </Text>
                </View>

                <View style={styles.calibrationStatCard}>
                  <Text style={styles.calibrationStatLabel}>Cadence Velocity</Text>
                  <Text style={styles.calibrationStatValue}>
                    {MOCK_CALIBRATION_PROFILE.cadenceVelocity}
                  </Text>
                </View>

                <View style={styles.calibrationStatCard}>
                  <Text style={styles.calibrationStatLabel}>Resting Stride</Text>
                  <Text style={styles.calibrationStatValue}>
                    {MOCK_CALIBRATION_PROFILE.restingStrideLength}
                  </Text>
                </View>

                <View style={styles.calibrationStatCard}>
                  <Text style={styles.calibrationStatLabel}>Sedentary Drop</Text>
                  <Text style={styles.calibrationStatValue}>
                    {MOCK_CALIBRATION_PROFILE.sedentaryDropRate}
                  </Text>
                </View>
              </View>

              {/* Audit Details */}
              <View style={styles.calibrationAuditCard}>
                <View style={styles.calibrationAuditRow}>
                  <Text style={styles.calibrationAuditLabel}>Sedentary Drop Rate</Text>
                  <Text style={styles.calibrationAuditValue}>
                    {MOCK_CALIBRATION_PROFILE.sedentaryDropRate}
                  </Text>
                </View>
                <View style={styles.calibrationAuditRow}>
                  <Text style={styles.calibrationAuditLabel}>Accelerometer Drift</Text>
                  <Text style={styles.calibrationAuditValue}>&lt; 0.02 m/s² (Optimal)</Text>
                </View>
                <View style={styles.calibrationAuditRow}>
                  <Text style={styles.calibrationAuditLabel}>Handicap Margin</Text>
                  <Text style={styles.calibrationAuditValue}>1.00x Base Factor</Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.calibrationActionBtn}
                activeOpacity={0.85}
                disabled={isAuditing}
                onPress={handleRunAudit}
              >
                <LinearGradient
                  colors={['#0284C7', '#0369A1']}
                  style={styles.calibrationActionBtnGradient}
                >
                  {isAuditing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.calibrationActionBtnText}>
                      {auditComplete
                        ? '✓ RE-RUN PASSIVE SENSOR AUDIT'
                        : '⚡ RUN PASSIVE SENSOR AUDIT'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.calibrationInfoBox}>
                <Text style={styles.calibrationInfoText}>
                  ℹ️ Passive sensor audit runs on-device without GPS streaming to safeguard privacy and battery performance.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

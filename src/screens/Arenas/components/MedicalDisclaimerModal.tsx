import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from '../styles';
import { MANDATORY_MEDICAL_DISCLAIMER } from '../constants';

interface MedicalDisclaimerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  visible,
  onClose,
}) => {
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
              <Text style={styles.modalTitle}>Clinical Disclaimer</Text>
              <Text style={styles.modalSubtitle}>
                SAFETY & MEDICAL PROTOCOLS
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
            <View style={styles.disclaimerBox}>
              <View style={styles.disclaimerHeaderTag}>
                <Text style={styles.disclaimerHeaderTagText}>
                  ⚠️ MANDATORY SAFETY NOTICE (PAGE 17)
                </Text>
              </View>

              <Text style={styles.disclaimerText}>
                {MANDATORY_MEDICAL_DISCLAIMER}
              </Text>

              <Text style={styles.disclaimerBullet}>
                • Educational & Gamification Only: Arena challenges and cardiometabolic indexes are not medical prescriptions.
              </Text>
              <Text style={styles.disclaimerBullet}>
                • Consult a Physician: Always consult a licensed healthcare practitioner before undertaking high-intensity physical activity.
              </Text>
              <Text style={styles.disclaimerBullet}>
                • On-Device Sensor Safety: Calibrations are passive calculations and should never override clinical symptom awareness.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

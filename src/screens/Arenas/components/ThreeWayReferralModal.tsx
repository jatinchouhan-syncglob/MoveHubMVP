import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';

interface ThreeWayReferralModalProps {
  visible: boolean;
  onClose: () => void;
  initialNode?: 'A' | 'B' | 'C';
}

export const ThreeWayReferralModal: React.FC<ThreeWayReferralModalProps> = ({
  visible,
  onClose,
  initialNode = 'A',
}) => {
  const [activeNode, setActiveNode] = useState<'A' | 'B' | 'C'>(initialNode);

  React.useEffect(() => {
    if (initialNode) {
      setActiveNode(initialNode);
    }
  }, [initialNode]);

  // Node B state
  const [deanName, setDeanName] = useState('');
  const [deanContact, setDeanContact] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  // Node C state
  const [commercialName, setCommercialName] = useState('');
  const [commercialContact, setCommercialContact] = useState('');
  const [commercialType, setCommercialType] = useState('Gym');

  const handleShareNodeA = async () => {
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? {
              title: 'MoveHub Arena Squad Invite',
              message:
                '🏆 Join my MoveHub Arena squad! Lock in our 1.4x Team Multiplier and compete together:\n👉 https://movehub.app/invite/squad-circle',
              url: 'https://movehub.app/invite/squad-circle',
            }
          : {
              title: 'MoveHub Arena Squad Invite',
              message:
                '🏆 Join my MoveHub Arena squad! Lock in our 1.4x Team Multiplier and compete together:\n👉 https://movehub.app/invite/squad-circle',
            },
      );
    } catch (err) {
      console.warn('[ThreeWayReferralModal] Share error:', err);
    }
  };

  const handleSubmitNodeB = () => {
    if (!institutionName.trim()) {
      Alert.alert('Required', 'Please enter your College or Company name.');
      return;
    }
    Alert.alert(
      'Institutional Ingress Submitted',
      `Thank you! Details for ${institutionName} have been recorded. Our campus ambassador team will reach out.`,
    );
    setInstitutionName('');
    setDeanName('');
    setDeanContact('');
    onClose();
  };

  const handleSubmitNodeC = () => {
    if (!commercialName.trim()) {
      Alert.alert('Required', 'Please enter your local gym or outlet name.');
      return;
    }
    Alert.alert(
      'Commercial Node Submitted',
      `Thank you! ${commercialName} (${commercialType}) has been nominated. Our ground activation team will contact them to close the partnership.`,
    );
    setCommercialName('');
    setCommercialContact('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>3-WAY NETWORK REFERRAL NODE</Text>
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
            {/* Node A */}
            <View
              style={[
                styles.referralNodeCard,
                activeNode === 'A' && { borderColor: '#3B82F6' },
              ]}
            >
              <View style={styles.referralNodeTopRow}>
                <View
                  style={[
                    styles.referralNodeBadge,
                    { backgroundColor: 'rgba(59, 130, 246, 0.18)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.referralNodeBadgeText,
                      { color: '#38BDF8' },
                    ]}
                  >
                    NODE A
                  </Text>
                </View>
                <Text style={styles.referralNodeTitle}>
                  Friends & Family Squad Multiplier
                </Text>
              </View>

              <Text style={styles.referralNodeDesc}>
                Generates a custom tracking code via WhatsApp to lock in your squad's 1.4x team multiplier and 5% commission clip.
              </Text>

              <TouchableOpacity
                style={styles.referralNodeBtn}
                activeOpacity={0.85}
                onPress={handleShareNodeA}
              >
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  style={styles.referralNodeBtnGradient}
                >
                  <Text style={styles.referralNodeBtnText}>
                    💬 SHARE VIA WHATSAPP (NODE A)
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Node B */}
            <View
              style={[
                styles.referralNodeCard,
                activeNode === 'B' && { borderColor: '#EC4899' },
              ]}
            >
              <View style={styles.referralNodeTopRow}>
                <View
                  style={[
                    styles.referralNodeBadge,
                    { backgroundColor: 'rgba(236, 72, 153, 0.18)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.referralNodeBadgeText,
                      { color: '#F472B6' },
                    ]}
                  >
                    NODE B
                  </Text>
                </View>
                <Text style={styles.referralNodeTitle}>
                  Institutional Ingress (College / HR)
                </Text>
              </View>

              <Text style={styles.referralNodeDesc}>
                Allows students or corporate workers to input their College Dean's or HR Director's contact info for bulk campus onboarding.
              </Text>

              <TextInput
                style={styles.referralInput}
                placeholder="College / Company Name"
                placeholderTextColor="#64748B"
                value={institutionName}
                onChangeText={setInstitutionName}
              />
              <TextInput
                style={[styles.referralInput, styles.referralInputSpacing]}
                placeholder="Dean / HR Director Name & Phone (Optional)"
                placeholderTextColor="#64748B"
                value={deanContact}
                onChangeText={setDeanContact}
              />

              <TouchableOpacity
                style={styles.referralNodeBtn}
                activeOpacity={0.85}
                onPress={handleSubmitNodeB}
              >
                <LinearGradient
                  colors={['#DB2777', '#BE185D']}
                  style={styles.referralNodeBtnGradient}
                >
                  <Text style={styles.referralNodeBtnText}>
                    🏛️ SUBMIT INSTITUTIONAL INGRESS (NODE B)
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Node C */}
            <View
              style={[
                styles.referralNodeCard,
                activeNode === 'C' && { borderColor: '#F59E0B' },
              ]}
            >
              <View style={styles.referralNodeTopRow}>
                <View
                  style={[
                    styles.referralNodeBadge,
                    { backgroundColor: 'rgba(245, 158, 11, 0.18)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.referralNodeBadgeText,
                      { color: '#FBBF24' },
                    ]}
                  >
                    NODE C
                  </Text>
                </View>
                <Text style={styles.referralNodeTitle}>
                  Commercial Node (Gym / Trainer / Store)
                </Text>
              </View>

              <Text style={styles.referralNodeDesc}>
                Drop details about your local gym, personal trainer, or favorite health food outlet to activate our ground partnership team.
              </Text>

              <TextInput
                style={[styles.referralInput, styles.referralInputSpacing]}
                placeholder="Gym / Trainer / Health Store Name"
                placeholderTextColor="#64748B"
                value={commercialName}
                onChangeText={setCommercialName}
              />

              <TouchableOpacity
                style={styles.referralNodeBtn}
                activeOpacity={0.85}
                onPress={handleSubmitNodeC}
              >
                <LinearGradient
                  colors={['#D97706', '#B45309']}
                  style={styles.referralNodeBtnGradient}
                >
                  <Text style={styles.referralNodeBtnText}>
                    🏪 NOMINATE COMMERCIAL NODE (NODE C)
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

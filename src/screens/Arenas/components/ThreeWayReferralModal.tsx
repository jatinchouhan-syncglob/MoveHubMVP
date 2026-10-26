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
  initialNode?: 'A' | 'B' | 'C' | 'D';
  circleId?: string;
}

export const ThreeWayReferralModal: React.FC<ThreeWayReferralModalProps> = ({
  visible,
  onClose,
  initialNode = 'A',
  circleId = 'UNCURL-7842',
}) => {
  const [activeNode, setActiveNode] = useState<'A' | 'B' | 'C' | 'D'>(initialNode);

  React.useEffect(() => {
    if (initialNode) {
      setActiveNode(initialNode);
    }
  }, [initialNode]);

  // Node B state (Institutional)
  const [institutionName, setInstitutionName] = useState('');
  const [deanContact, setDeanContact] = useState('');

  // Node C state (Clinical)
  const [clinicalName, setClinicalName] = useState('');
  const [clinicalContact, setClinicalContact] = useState('');

  // Node D state (Commercial)
  const [commercialName, setCommercialName] = useState('');
  const [commercialContact, setCommercialContact] = useState('');

  const handleShareNodeA = async () => {
    try {
      const inviteMessage = `Hey! 👋 I’ve just entered our team into the National ECFL™ Longevity Tournament, and I want YOU in my official Inner Circle! 🏆 \n\nInstead of basic tracking, this is an AI-powered tournament where we combine our daily habits to out-move the chair, and boost our health.\n\nLet’s smash this, showcase our collective athleticism, and bring home one of the Top 3 National Championship Trophies! 🥇🔥\n\n👇 Tap the link to download the app and join my Inner Circle instantly:\n👉 https://play.google.com/store/apps/details?id=com.livingscopehealth.uncurl\n🔑 Enter my Unique Circle ID during registration: ${circleId}`;

      await Share.share(
        Platform.OS === 'ios'
          ? {
              title: 'Inner Circle National Tournament Invite',
              message: inviteMessage,
              url: 'https://play.google.com/store/apps/details?id=com.livingscopehealth.uncurl',
            }
          : {
              title: 'Inner Circle National Tournament Invite',
              message: inviteMessage,
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
    setDeanContact('');
    onClose();
  };

  const handleSubmitNodeC = () => {
    if (!clinicalName.trim()) {
      Alert.alert('Required', 'Please enter your Hospital, Clinic, or Lab name.');
      return;
    }
    Alert.alert(
      'Clinical Ingress Submitted',
      `Thank you! Details for ${clinicalName} have been recorded. We will reach out to them and mention your wish and referral!`,
    );
    setClinicalName('');
    setClinicalContact('');
    onClose();
  };

  const handleSubmitNodeD = () => {
    if (!commercialName.trim()) {
      Alert.alert('Required', 'Please enter your local gym or outlet name.');
      return;
    }
    Alert.alert(
      'Commercial Node Submitted',
      `Thank you! ${commercialName} has been nominated. Our ground activation team will contact them to initiate the partnership.`,
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
            <Text style={styles.modalTitle}>4-WAY NETWORK REFERRAL NODE</Text>
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
                  Inner Circle 🔥
                </Text>
              </View>

              <Text style={styles.referralNodeDesc}>
                Form your exclusive 10 to 25-member Inner Circle. Rally your friends and family to combine daily habits and battle in the Inter-"Inner Circle" National Tournament!
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
                  Institutional Ingress (Campuses & Corporates)
                </Text>
              </View>

              <Text style={styles.referralNodeDesc}>
                Bring your university department or company into the national arena to unlock custom-branded corporate leaderboards.
              </Text>

              <TextInput
                style={styles.referralInput}
                placeholder="College / Company Name *"
                placeholderTextColor="#64748B"
                value={institutionName}
                onChangeText={setInstitutionName}
              />
              <TextInput
                style={[styles.referralInput, styles.referralInputSpacing]}
                placeholder="Dean / HR Contact Name or Info (Optional)"
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

            {/* Node C: Clinical */}
            <View
              style={[
                styles.referralNodeCard,
                activeNode === 'C' && { borderColor: '#10B981' },
              ]}
            >
              <View style={styles.referralNodeTopRow}>
                <View
                  style={[
                    styles.referralNodeBadge,
                    { backgroundColor: 'rgba(16, 185, 129, 0.18)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.referralNodeBadgeText,
                      { color: '#34D399' },
                    ]}
                  >
                    NODE C
                  </Text>
                </View>
                <Text style={styles.referralNodeTitle}>
                  Clinical Ingress (Hospitals, Clinics, & Labs)
                </Text>
              </View>

              <Text style={styles.referralNodeDesc}>
                Nominate your primary care hospital, family clinic, or diagnostic lab to unlock preventative check-up loops and medical subsidies.
              </Text>

              <TextInput
                style={styles.referralInput}
                placeholder="Hospital / Clinic / Lab Name *"
                placeholderTextColor="#64748B"
                value={clinicalName}
                onChangeText={setClinicalName}
              />
              <TextInput
                style={[styles.referralInput, styles.referralInputSpacing]}
                placeholder="CEO / Director / Doctor Contact (Optional)"
                placeholderTextColor="#64748B"
                value={clinicalContact}
                onChangeText={setClinicalContact}
              />

              <TouchableOpacity
                style={styles.referralNodeBtn}
                activeOpacity={0.85}
                onPress={handleSubmitNodeC}
              >
                <LinearGradient
                  colors={['#059669', '#047857']}
                  style={styles.referralNodeBtnGradient}
                >
                  <Text style={styles.referralNodeBtnText}>
                    🏥 NOMINATE CLINICAL PROVIDER (NODE C)
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Node D: Commercial */}
            <View
              style={[
                styles.referralNodeCard,
                activeNode === 'D' && { borderColor: '#F59E0B' },
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
                    NODE D
                  </Text>
                </View>
                <Text style={styles.referralNodeTitle}>
                  Commercial Ingress (Gyms & Nutrition Partners)
                </Text>
              </View>

              <Text style={styles.referralNodeDesc}>
                Nominate your local fitness center, CrossFit box, or nutrition store to fuel your team's leaderboard climb.
              </Text>

              <TextInput
                style={[styles.referralInput, styles.referralInputSpacing]}
                placeholder="Gym / Nutrition Outlet Name *"
                placeholderTextColor="#64748B"
                value={commercialName}
                onChangeText={setCommercialName}
              />
              <TextInput
                style={[styles.referralInput, styles.referralInputSpacing]}
                placeholder="Manager / Owner Info (Optional)"
                placeholderTextColor="#64748B"
                value={commercialContact}
                onChangeText={setCommercialContact}
              />

              <TouchableOpacity
                style={styles.referralNodeBtn}
                activeOpacity={0.85}
                onPress={handleSubmitNodeD}
              >
                <LinearGradient
                  colors={['#D97706', '#B45309']}
                  style={styles.referralNodeBtnGradient}
                >
                  <Text style={styles.referralNodeBtnText}>
                    🏋️ NOMINATE COMMERCIAL PARTNER (NODE D)
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

export default ThreeWayReferralModal;

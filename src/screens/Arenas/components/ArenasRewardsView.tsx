import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';
import { storageHelper } from '../../../storage/storageHelper';
import { STORAGE_KEYS } from '../../../storage/storageKeys';
import { UserProfile } from '../../../types';
import { apiService } from '../../../services/api';
import { INominateEntityPayload } from '../../Arena/types';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';

interface ArenasRewardsViewProps {
  config: ISegmentConfig;
}

type ReferralNode = 'A' | 'B' | 'C' | 'D';

export const ArenasRewardsView: React.FC<ArenasRewardsViewProps> = ({ config }) => {
  const [activeNode, setActiveNode] = useState<ReferralNode>('A');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [submittingNodeB, setSubmittingNodeB] = useState(false);
  const [submittingNodeC, setSubmittingNodeC] = useState(false);
  const [submittingNodeD, setSubmittingNodeD] = useState(false);
  const [circleId, setCircleId] = useState('UNCURL-7842');
  const theme = config.theme;

  // Custom Alert Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
        if (cachedProfile) {
          setUserProfile(cachedProfile);
        }
        if (cachedProfile?.uhid) {
          setCircleId(cachedProfile.uhid);
        } else if (cachedProfile?.userId) {
          setCircleId(`UNCURL-${cachedProfile.userId}`);
        }
      } catch (err) {
        console.warn('[ArenasRewardsView] Failed to fetch profile circleId:', err);
      }
    };
    fetchUserProfile();
  }, []);

  // Node B Form State (Institutional Ingress)
  const [institutionName, setInstitutionName] = useState('');
  const [deanName, setDeanName] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionPhone, setInstitutionPhone] = useState('');

  // Node C Form State (Clinical Ingress)
  const [clinicalName, setClinicalName] = useState('');
  const [clinicalCategory, setClinicalCategory] = useState('');
  const [clinicalContact, setClinicalContact] = useState('');
  const [clinicalEmail, setClinicalEmail] = useState('');
  const [clinicalPhone, setClinicalPhone] = useState('');

  // Node D Form State (Commercial Ingress)
  const [commercialName, setCommercialName] = useState('');
  const [commercialCategory, setCommercialCategory] = useState('');
  const [commercialContact, setCommercialContact] = useState('');
  const [commercialEmail, setCommercialEmail] = useState('');
  const [commercialPhone, setCommercialPhone] = useState('');

  const handleShareInnerCircle = async () => {
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
      console.warn('[ArenasRewardsView] Share error:', err);
    }
  };

  const handleCopyLink = () => {
    Alert.alert(
      'Link Copied',
      `Inner Circle invitation link copied:\nhttps://play.google.com/store/apps/details?id=com.livingscopehealth.uncurl\n\nUnique Circle ID: ${circleId}`,
    );
  };

  const handleCopyCircleId = () => {
    Alert.alert(
      'Circle ID Copied',
      `Your Unique Circle ID copied: ${circleId}\nShare this with members during registration.`,
    );
  };

  const handleSubmitNodeB = async () => {
    if (!institutionName.trim()) {
      showAlert('Required', 'Please enter your College, University, or Company name.', 'warning');
      return;
    }
    setSubmittingNodeB(true);
    try {
      const payload: INominateEntityPayload = {
        entityType: 'CORPORATE',
        entityName: institutionName.trim(),
        contactPersonName: deanName.trim() || 'Head / Dean / HR Contact',
        email: institutionEmail.trim() || userProfile?.email || 'contact@institution.com',
        phoneNumber: institutionPhone.trim() || (userProfile as any)?.phoneNumber || (userProfile as any)?.mobile || '9999999999',
        city: (userProfile as any)?.city || 'Indore',
        location: 'Campus / Workspace',
        nominatedByName: userProfile?.name || 'MoveHub Member',
        nominatedByPhone: (userProfile as any)?.phoneNumber || (userProfile as any)?.mobile || '9999999999',
        nominatedByEmail: userProfile?.email || 'user@movehub.com',
      };

      const res = await apiService.nominateReferralEntity(payload);
      console.log('[ArenasRewardsView] Node B nominate response:', res);

      if (res?.data?.referralCode && userProfile?.uhid) {
        try {
          await apiService.associateReferralEntity({
            uhid: userProfile.uhid,
            referralCode: res.data.referralCode,
            entityName: institutionName.trim(),
          });
        } catch (assocErr) {
          console.warn('[ArenasRewardsView] Auto-associate notice:', assocErr);
        }
      }

      showAlert(
        'Institutional Ingress Submitted! 🎉',
        res?.message || `Thank you! Details for ${institutionName} have been recorded. Our campus ambassador team will reach out.`,
        'success',
      );
      setInstitutionName('');
      setDeanName('');
      setInstitutionEmail('');
      setInstitutionPhone('');
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to submit institutional ingress. Please try again.';
      showAlert('Submission Error', errMsg, 'error');
    } finally {
      setSubmittingNodeB(false);
    }
  };

  const handleSubmitNodeC = async () => {
    if (!clinicalName.trim()) {
      showAlert('Required', 'Please enter your primary Hospital, Clinic, or Lab name.', 'warning');
      return;
    }
    setSubmittingNodeC(true);
    try {
      const payload: INominateEntityPayload = {
        entityType: 'CLINIC',
        entityName: clinicalName.trim(),
        contactPersonName: clinicalContact.trim() || 'Medical Director / Facility Head',
        email: clinicalEmail.trim() || userProfile?.email || 'contact@clinic.com',
        phoneNumber: clinicalPhone.trim() || (userProfile as any)?.phoneNumber || (userProfile as any)?.mobile || '9999999999',
        city: (userProfile as any)?.city || 'Indore',
        location: clinicalCategory.trim() || 'Clinical Facility',
        nominatedByName: userProfile?.name || 'MoveHub Member',
        nominatedByPhone: (userProfile as any)?.phoneNumber || (userProfile as any)?.mobile || '9999999999',
        nominatedByEmail: userProfile?.email || 'user@movehub.com',
      };

      const res = await apiService.nominateReferralEntity(payload);
      console.log('[ArenasRewardsView] Node C nominate response:', res);

      if (res?.data?.referralCode && userProfile?.uhid) {
        try {
          await apiService.associateReferralEntity({
            uhid: userProfile.uhid,
            referralCode: res.data.referralCode,
            entityName: clinicalName.trim(),
          });
        } catch (assocErr) {
          console.warn('[ArenasRewardsView] Auto-associate notice:', assocErr);
        }
      }

      showAlert(
        'Clinical Ingress Submitted! 🏥',
        res?.message || `Thank you! Details for ${clinicalName} have been recorded. We will reach out to them and mention your referral!`,
        'success',
      );
      setClinicalName('');
      setClinicalCategory('');
      setClinicalContact('');
      setClinicalEmail('');
      setClinicalPhone('');
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to submit clinical nomination. Please try again.';
      showAlert('Submission Error', errMsg, 'error');
    } finally {
      setSubmittingNodeC(false);
    }
  };

  const handleSubmitNodeD = async () => {
    if (!commercialName.trim()) {
      showAlert('Required', 'Please enter your fitness center, CrossFit box, or nutrition outlet name.', 'warning');
      return;
    }
    setSubmittingNodeD(true);
    try {
      const payload: INominateEntityPayload = {
        entityType: 'GYM',
        entityName: commercialName.trim(),
        contactPersonName: commercialContact.trim() || 'Manager / Facility Head',
        email: commercialEmail.trim() || userProfile?.email || 'contact@gym.com',
        phoneNumber: commercialPhone.trim() || (userProfile as any)?.phoneNumber || (userProfile as any)?.mobile || '9999999999',
        city: (userProfile as any)?.city || 'Indore',
        location: commercialCategory.trim() || 'Fitness / Nutrition Hub',
        nominatedByName: userProfile?.name || 'MoveHub Member',
        nominatedByPhone: (userProfile as any)?.phoneNumber || (userProfile as any)?.mobile || '9999999999',
        nominatedByEmail: userProfile?.email || 'user@movehub.com',
      };

      const res = await apiService.nominateReferralEntity(payload);
      console.log('[ArenasRewardsView] Node D nominate response:', res);

      if (res?.data?.referralCode && userProfile?.uhid) {
        try {
          await apiService.associateReferralEntity({
            uhid: userProfile.uhid,
            referralCode: res.data.referralCode,
            entityName: commercialName.trim(),
          });
        } catch (assocErr) {
          console.warn('[ArenasRewardsView] Auto-associate notice:', assocErr);
        }
      }

      showAlert(
        'Commercial Partner Nominated! 🏋️',
        res?.message || `Thank you! ${commercialName} has been nominated. Our ground activation team will initiate the partnership.`,
        'success',
      );
      setCommercialName('');
      setCommercialCategory('');
      setCommercialContact('');
      setCommercialEmail('');
      setCommercialPhone('');
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to submit commercial nomination. Please try again.';
      showAlert('Submission Error', errMsg, 'error');
    } finally {
      setSubmittingNodeD(false);
    }
  };

  return (
    <ScrollView
      style={styles.rewardsContainer}
      contentContainerStyle={styles.rewardsScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 4-Way Network Referral Node Hero Card */}
      <View
        style={[
          styles.rewardsHeroCard,
          { borderColor: theme.coreAccent, backgroundColor: theme.cardBg },
        ]}
      >
        <Text style={[styles.rewardsProgressLabelText, { color: theme.coreAccent, marginBottom: 6 }]}>
          QUADRANT 3: THE 4-WAY NETWORK REFERRAL NODE
        </Text>
        <Text style={styles.rewardsHeroTitle}>
          The 4-Way Network Referral Node
        </Text>
        <Text style={[styles.rewardsHeroHeadline, { color: theme.coreAccent }]}>
          Empower Your Ecosystem. Fuel Collective Victory.
        </Text>
        <Text style={styles.rewardsHeroSub}>
          This advanced connectivity engine dynamically scales your health matrix across your personal, professional, and institutional networks. Use this interface to link data with your immediate social circles, register the corporate or academic organizations you belong to, or onboard your primary healthcare facilities and fitness spaces into the national arena.
        </Text>
        <Text style={styles.rewardsHeroSub}>
          The moment your referred networks accept the challenge, your individual tracking scores automatically syndicate to activate their entity-level tournament dashboards. Your personal daily performance directly drives their collective ranking, giving you the power to spearhead their climb up the live national leaderboard and bring ultimate competitive glory to your community!
        </Text>
      </View>

      {/* 4-Way Network Referral Node Selector Tabs */}
      <View style={styles.rewardsNodeNav}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rewardsNodeNavScroll}
        >
          <TouchableOpacity
            style={[
              styles.rewardsNodeNavTab,
              activeNode === 'A' && styles.rewardsNodeNavTabActive,
              activeNode === 'A' && { borderColor: theme.coreAccent, backgroundColor: theme.badgeBg },
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveNode('A')}
          >
            <Text
              style={[
                styles.rewardsNodeNavText,
                activeNode === 'A' && styles.rewardsNodeNavTextActive,
                activeNode === 'A' && { color: theme.coreAccent },
              ]}
            >
              Node A: Inner Circle 🔥
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rewardsNodeNavTab,
              activeNode === 'B' && styles.rewardsNodeNavTabActive,
              activeNode === 'B' && { borderColor: theme.coreAccent, backgroundColor: theme.badgeBg },
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveNode('B')}
          >
            <Text
              style={[
                styles.rewardsNodeNavText,
                activeNode === 'B' && styles.rewardsNodeNavTextActive,
                activeNode === 'B' && { color: theme.coreAccent },
              ]}
            >
              Node B: Ingress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rewardsNodeNavTab,
              activeNode === 'C' && styles.rewardsNodeNavTabActive,
              activeNode === 'C' && { borderColor: theme.coreAccent, backgroundColor: theme.badgeBg },
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveNode('C')}
          >
            <Text
              style={[
                styles.rewardsNodeNavText,
                activeNode === 'C' && styles.rewardsNodeNavTextActive,
                activeNode === 'C' && { color: theme.coreAccent },
              ]}
            >
              🏥 Node C: Care Providers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rewardsNodeNavTab,
              activeNode === 'D' && styles.rewardsNodeNavTabActive,
              activeNode === 'D' && { borderColor: theme.coreAccent, backgroundColor: theme.badgeBg },
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveNode('D')}
          >
            <Text
              style={[
                styles.rewardsNodeNavText,
                activeNode === 'D' && styles.rewardsNodeNavTextActive,
                activeNode === 'D' && { color: theme.coreAccent },
              ]}
            >
              🏋️ Node D: Partners
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* NODE A: Inner Circle */}
      {activeNode === 'A' && (
        <View
          style={[
            styles.rewardsCard,
            { borderColor: theme.mutedBorders },
          ]}
        >
          <Text style={styles.rewardsCardTitle}>
            Node A: Inner Circle 🔥
          </Text>
          <Text style={[styles.rewardsHeroHeadline, { color: theme.coreAccent, marginBottom: 6 }]}>
            Rally Your Circle. Claim the National Crown.
          </Text>

          <View style={styles.rewardsQuoteBox}>
            <Text style={styles.rewardsQuoteText}>
              “True resilience is built together—out-move the chair alongside those who matter most to you.”
            </Text>
          </View>

          <Text style={styles.rewardsCardDesc}>
            Form your exclusive up to 25-member Inner Circle (minimum 10) by pooling together your closest friends, family members, office colleagues, or local neighbours into a single, high-performance health alliance. By combining your daily habits, your team will enter the high-velocity Inter-"Inner Circle" National Tournament!
          </Text>

          <Text style={[styles.rewardsCardDesc, { marginTop: -4 }]}>
            This is your chance as a team leader and your team's definitive stage to showcase your collective lifestyle discipline and athletic pacing. Rally your circle to climb the live global standings, protect each other from sedentary stasis, and battle to win one of the Top 3 “Inner Circle”, National Championship Trophies to bring absolute glory to your circle on the grand national stage!
          </Text>

          {/* Referral Link Box */}
          <View style={styles.rewardsLinkBox}>
            <Text style={styles.rewardsLinkText} numberOfLines={1}>
              https://play.google.com/store/apps/details?id=com.livingscopehealth.uncurl
            </Text>
            <TouchableOpacity
              style={styles.rewardsCopyBtn}
              activeOpacity={0.7}
              onPress={handleCopyLink}
            >
              <Text style={styles.rewardsCopyBtnText}>COPY LINK</Text>
            </TouchableOpacity>
          </View>

          {/* Unique Circle ID Box */}
          <View style={styles.rewardsCircleIdBox}>
            <View>
              <Text style={styles.rewardsCircleIdLabel}>Unique Circle ID</Text>
              <Text style={styles.rewardsCircleIdVal}>{circleId}</Text>
            </View>
            <TouchableOpacity
              style={styles.rewardsCopyBtn}
              activeOpacity={0.7}
              onPress={handleCopyCircleId}
            >
              <Text style={styles.rewardsCopyBtnText}>COPY ID</Text>
            </TouchableOpacity>
          </View>

          {/* Share CTA Button */}
          <TouchableOpacity
            style={styles.rewardsShareActionBtn}
            activeOpacity={0.8}
            onPress={handleShareInnerCircle}
          >
            <LinearGradient
              colors={['#25D366', '#128C7E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rewardsShareActionGradient}
            >
              <Text style={styles.rewardsShareActionText}>
                📲 INVITE VIA WHATSAPP
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* NODE B: Institutional Ingress (Campuses & Corporates) */}
      {activeNode === 'B' && (
        <View
          style={[
            styles.rewardsCard,
            { borderColor: theme.mutedBorders },
          ]}
        >
          <Text style={styles.rewardsCardTitle}>
            NODE B: INSTITUTIONAL INGRESS (CAMPUSES & CORPORATES)
          </Text>
          <Text style={[styles.rewardsHeroHeadline, { color: theme.coreAccent, marginBottom: 6 }]}>
            Why Nominate Your Workspace or Campus?
          </Text>
          <Text style={styles.rewardsCardDesc}>
            Bring your university department or company into the national arena to unlock custom-branded corporate leaderboards, sponsor prizes, and premium wellness subsidies. By nominating your workspace, you transform your daily professional environment into a high-performance fitness bracket. Simply enter the contact details of your HR Head, Dean, or Sports Secretary below; once they accept the challenge, your individual metrics will automatically count toward your organization's collective rank on the national stage!
          </Text>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Institution / College / Company Name *</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. IIT Bombay / Infosys"
              placeholderTextColor="#64748B"
              value={institutionName}
              onChangeText={setInstitutionName}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Dean / Sports Secretary / HR Contact</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Dr. Verma / Ramesh Sharma"
              placeholderTextColor="#64748B"
              value={deanName}
              onChangeText={setDeanName}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Official Email (Optional)</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. sports@institution.edu / hr@company.com"
              placeholderTextColor="#64748B"
              value={institutionEmail}
              onChangeText={setInstitutionEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Contact Phone Number (Optional)</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#64748B"
              value={institutionPhone}
              onChangeText={setInstitutionPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.rewardsSubmitBtn, { backgroundColor: theme.coreAccent }]}
            activeOpacity={0.8}
            onPress={handleSubmitNodeB}
            disabled={submittingNodeB}
          >
            {submittingNodeB ? (
              <ActivityIndicator color="#0A0E17" size="small" />
            ) : (
              <Text style={styles.rewardsSubmitBtnText}>
                SUBMIT INSTITUTIONAL INGRESS
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* NODE C: Clinical Ingress (Hospitals, Clinics, & Labs) */}
      {activeNode === 'C' && (
        <View
          style={[
            styles.rewardsCard,
            { borderColor: theme.mutedBorders },
          ]}
        >
          <Text style={styles.rewardsCardTitle}>
            🏥 NODE C: CLINICAL INGRESS (HOSPITALS, CLINICS, & LABS)
          </Text>
          <Text style={[styles.rewardsHeroHeadline, { color: theme.coreAccent, marginBottom: 6 }]}>
            Why Nominate Your Healthcare Providers?
          </Text>
          <Text style={styles.rewardsCardDesc}>
            Bring your primary care network, family clinic, or diagnostic lab into the tournament to unlock automated, data-driven check-up loops and medical sponsor vouchers and discount from time to time. Linking your healthcare provider transforms your passive medical records into an active preventative shield. Simply fill in your doctor's or facility manager's details below; once they partner with us, your tracking metrics will directly showcase your recovery discipline on their official clinical leaderboard!
          </Text>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Hospital / Clinic / Lab Name *</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Max Healthcare / City Care Clinic / Dr. Lal PathLabs"
              placeholderTextColor="#64748B"
              value={clinicalName}
              onChangeText={setClinicalName}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Facility Category</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Hospital / Family Clinic / Diagnostic Lab"
              placeholderTextColor="#64748B"
              value={clinicalCategory}
              onChangeText={setClinicalCategory}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>CEO / Director / Owner / HRD Head</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Dr. Rajesh Verma (Medical Director / CEO)"
              placeholderTextColor="#64748B"
              value={clinicalContact}
              onChangeText={setClinicalContact}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Official Email (Optional)</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. contact@careclinic.com"
              placeholderTextColor="#64748B"
              value={clinicalEmail}
              onChangeText={setClinicalEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Contact Phone Number (Optional)</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#64748B"
              value={clinicalPhone}
              onChangeText={setClinicalPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.rewardsSubmitBtn, { backgroundColor: theme.coreAccent }]}
            activeOpacity={0.8}
            onPress={handleSubmitNodeC}
            disabled={submittingNodeC}
          >
            {submittingNodeC ? (
              <ActivityIndicator color="#0A0E17" size="small" />
            ) : (
              <Text style={styles.rewardsSubmitBtnText}>
                NOMINATE HEALTHCARE PROVIDER
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* NODE D: Commercial Ingress (Gyms & Nutrition Partners) */}
      {activeNode === 'D' && (
        <View
          style={[
            styles.rewardsCard,
            { borderColor: theme.mutedBorders },
          ]}
        >
          <Text style={styles.rewardsCardTitle}>
            🏋️ NODE D: COMMERCIAL INGRESS (GYMS & NUTRITION PARTNERS)
          </Text>
          <Text style={[styles.rewardsHeroHeadline, { color: theme.coreAccent, marginBottom: 6 }]}>
            Why Nominate Your Fitness & Nutrition Hubs?
          </Text>
          <Text style={styles.rewardsCardDesc}>
            Bring your local fitness center, CrossFit box, or organic nutrition store into the platform. Nominating your training space positions Uncurl: AI as your official background recovery engine during the 23 hours you spend outside their doors. Simply enter the owner's or manager's phone or email below to fuel your team's leaderboard climb!
          </Text>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Gym / Nutrition Outlet Name *</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Gold's Gym / Cult.fit / Nature's Basket"
              placeholderTextColor="#64748B"
              value={commercialName}
              onChangeText={setCommercialName}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Outlet Category</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Gym / CrossFit Box / Nutrition Store"
              placeholderTextColor="#64748B"
              value={commercialCategory}
              onChangeText={setCommercialCategory}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Manager / Owner Name</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Rajesh Kumar (Facility Head)"
              placeholderTextColor="#64748B"
              value={commercialContact}
              onChangeText={setCommercialContact}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Official Email (Optional)</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. manager@fitnesshub.com"
              placeholderTextColor="#64748B"
              value={commercialEmail}
              onChangeText={setCommercialEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Contact Phone Number (Optional)</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#64748B"
              value={commercialPhone}
              onChangeText={setCommercialPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.rewardsSubmitBtn, { backgroundColor: theme.coreAccent }]}
            activeOpacity={0.8}
            onPress={handleSubmitNodeD}
            disabled={submittingNodeD}
          >
            {submittingNodeD ? (
              <ActivityIndicator color="#0A0E17" size="small" />
            ) : (
              <Text style={styles.rewardsSubmitBtnText}>
                NOMINATE COMMERCIAL PARTNER
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Success & Error Feedback Modal */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText={alertType === 'success' ? 'Great!' : 'Dismiss'}
        onClose={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
};

export default ArenasRewardsView;

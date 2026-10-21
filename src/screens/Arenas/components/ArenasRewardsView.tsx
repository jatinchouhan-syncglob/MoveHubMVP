import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';

interface ArenasRewardsViewProps {
  config: ISegmentConfig;
}

type ReferralNode = 'A' | 'B' | 'C';

const REWARD_TIERS = [
  { points: '5,000 PTS', reward: '10% Partner Nutrition & Retail Vouchers' },
  { points: '15,000 PTS', reward: 'MoveHub Custom Metal Shaker & Team Jersey' },
  { points: '35,000 PTS', reward: '3-Month Premium Gym Membership Subsidy' },
  { points: '75,000 PTS', reward: 'Comprehensive Annual Biomarker & Lab Panel' },
];

export const ArenasRewardsView: React.FC<ArenasRewardsViewProps> = ({ config }) => {
  const [activeNode, setActiveNode] = useState<ReferralNode>('A');
  const theme = config.theme;

  // Node B Form State
  const [institutionName, setInstitutionName] = useState('');
  const [deanName, setDeanName] = useState('');
  const [institutionContact, setInstitutionContact] = useState('');

  // Node C Form State
  const [commercialName, setCommercialName] = useState('');
  const [commercialContact, setCommercialContact] = useState('');
  const [outletType, setOutletType] = useState('Gym');

  const handleShareSquad = async () => {
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
      console.warn('[ArenasRewardsView] Share error:', err);
    }
  };

  const handleCopyLink = () => {
    Alert.alert('Link Copied', 'Squad invitation link copied to clipboard: https://movehub.app/invite/squad-circle');
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
    setInstitutionContact('');
  };

  const handleSubmitNodeC = () => {
    if (!commercialName.trim()) {
      Alert.alert('Required', 'Please enter your local gym or retail outlet name.');
      return;
    }
    Alert.alert(
      'Commercial Node Submitted',
      `Thank you! ${commercialName} (${outletType}) has been nominated. Our ground activation team will initiate the partnership.`,
    );
    setCommercialName('');
    setCommercialContact('');
  };

  return (
    <ScrollView
      style={styles.rewardsContainer}
      contentContainerStyle={styles.rewardsScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Multiplier Hero Card */}
      <View
        style={[
          styles.rewardsHeroCard,
          { borderColor: theme.coreAccent, backgroundColor: theme.cardBg },
        ]}
      >
        <Text style={[styles.rewardsProgressLabelText, { color: theme.coreAccent, marginBottom: 4 }]}>
          QUADRANT 3: THE 3-WAY NETWORK REFERRAL NODE
        </Text>
        <Text style={[styles.rewardsHeroMultiplier, { color: theme.coreAccent }]}>
          1.4x MULTIPLIER ACTIVE 🔥
        </Text>
        <Text style={styles.rewardsHeroSub}>
          Advanced referral engine driving viral growth across all 7 B2C segments. Lock in squad bonuses, submit institutional ingress, or nominate commercial partners.
        </Text>

        {/* Progress Bar */}
        <View style={styles.rewardsProgressTrack}>
          <View
            style={[
              styles.rewardsProgressFill,
              styles.rewardsProgressFillActive,
              { backgroundColor: theme.coreAccent },
            ]}
          />
        </View>

        <View style={styles.rewardsProgressLabels}>
          <Text style={styles.rewardsProgressLabelText}>1.0x (Solo)</Text>
          <Text style={[styles.rewardsProgressLabelText, { color: theme.coreAccent }]}>
            1.4x (Squad Active)
          </Text>
          <Text style={styles.rewardsProgressLabelText}>1.8x (Max Elite)</Text>
        </View>
      </View>

      {/* 3-Way Network Referral Node Selector Tabs */}
      <View style={styles.rewardsNodeNav}>
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
            Inner Circle
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
            College & University
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
            GYM/Partners
          </Text>
        </TouchableOpacity>
      </View>

      {/* Node Content Card */}
      {activeNode === 'A' && (
        <View
          style={[
            styles.rewardsCard,
            { borderColor: theme.mutedBorders },
          ]}
        >
          <Text style={styles.rewardsCardTitle}>
            Inner Circle Multiplier (1.4x Active)
          </Text>
          <Text style={styles.rewardsCardDesc}>
            Form a 3-member squad to lock in the 1.4x scoring bonus. All members must log at least 5,000 steps daily to maintain streak.
          </Text>

          {/* Referral Link Box */}
          <View style={styles.rewardsLinkBox}>
            <Text style={styles.rewardsLinkText} numberOfLines={1}>
              https://movehub.app/invite/squad-circle
            </Text>
            <TouchableOpacity
              style={styles.rewardsCopyBtn}
              activeOpacity={0.7}
              onPress={handleCopyLink}
            >
              <Text style={styles.rewardsCopyBtnText}>COPY</Text>
            </TouchableOpacity>
          </View>

          {/* Share CTA Button */}
          <TouchableOpacity
            style={styles.rewardsShareActionBtn}
            activeOpacity={0.8}
            onPress={handleShareSquad}
          >
            <LinearGradient
              colors={['#25D366', '#128C7E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rewardsShareActionGradient}
            >
              <Text style={styles.rewardsShareActionText}>
                📲 INVITE VIA WHATSAPP (1.4x BONUS)
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {activeNode === 'B' && (
        <View
          style={[
            styles.rewardsCard,
            { borderColor: theme.mutedBorders },
          ]}
        >
          <Text style={styles.rewardsCardTitle}>
            College & University Ingress
          </Text>
          <Text style={styles.rewardsCardDesc}>
            Bring your university department or company into the Arena to unlock custom branded leaderboards, sponsor prizes, and wellness subsidies.
          </Text>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Institution / College / Company Name</Text>
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
            <Text style={styles.rewardsFormLabel}>Official Email or Phone</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. sports@institution.edu"
              placeholderTextColor="#64748B"
              value={institutionContact}
              onChangeText={setInstitutionContact}
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity
            style={[styles.rewardsSubmitBtn, { backgroundColor: theme.coreAccent }]}
            activeOpacity={0.8}
            onPress={handleSubmitNodeB}
          >
            <Text style={styles.rewardsSubmitBtnText}>
              SUBMIT INSTITUTIONAL INGRESS
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeNode === 'C' && (
        <View
          style={[
            styles.rewardsCard,
            { borderColor: theme.mutedBorders },
          ]}
        >
          <Text style={styles.rewardsCardTitle}>
            GYM / Retail Partners
          </Text>
          <Text style={styles.rewardsCardDesc}>
            Nominate your fitness center, crossfit box, or organic store. Partner locations unlock exclusive 15% subscriber discounts and free body composition tests.
          </Text>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Gym / Nutrition Outlet Name</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Gold's Gym Indiranagar"
              placeholderTextColor="#64748B"
              value={commercialName}
              onChangeText={setCommercialName}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Outlet Category</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. Gym / Health Food Store / Diagnostic Lab"
              placeholderTextColor="#64748B"
              value={outletType}
              onChangeText={setOutletType}
            />
          </View>

          <View style={styles.rewardsFormGroup}>
            <Text style={styles.rewardsFormLabel}>Manager / Owner Phone or Email</Text>
            <TextInput
              style={styles.rewardsFormInput}
              placeholder="e.g. manager@fitnesshub.com"
              placeholderTextColor="#64748B"
              value={commercialContact}
              onChangeText={setCommercialContact}
            />
          </View>

          <TouchableOpacity
            style={[styles.rewardsSubmitBtn, { backgroundColor: theme.coreAccent }]}
            activeOpacity={0.8}
            onPress={handleSubmitNodeC}
          >
            <Text style={styles.rewardsSubmitBtnText}>
              NOMINATE COMMERCIAL PARTNER
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reward Milestone Tiers Ledger */}
      <View style={styles.rewardsTierCard}>
        <Text style={styles.rewardsTierTitle}>
          MILESTONE REWARD TIERS
        </Text>
        {REWARD_TIERS.map(tier => (
          <View key={tier.points} style={styles.rewardsTierRow}>
            <Text style={styles.rewardsTierPts}>{tier.points}</Text>
            <Text style={styles.rewardsTierName}>{tier.reward}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ArenasRewardsView;

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { IMAGES } from '../../assets/images';

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = (screenWidth - theme.spacing.lg * 3) / 2; // Responsive 2-column layout

interface TrainingItem {
  id: string;
  title: string;
  image: any;
}

export const FitnessTrainingScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<string>('');


  const trainingData: TrainingItem[] = [
    { id: 'zumba', title: 'Zumba', image: IMAGES.zumba },
    { id: 'crossfit', title: 'CrossFit', image: IMAGES.crossfit },
    { id: 'yoga', title: 'Yoga', image: IMAGES.yoga },
    { id: 'gym', title: 'GYM', image: IMAGES.gym },
  ];

  const handleItemPress = (title: string) => {
    setSelectedTraining(title);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Fitness Training" showDrawerButton />

      {/* Ambient background glow spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {trainingData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleItemPress(item.title)}
            >
              {/* Image Container */}
              <View style={styles.imageContainer}>
                <Image
                  source={item.image}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </View>

              {/* Title shaded footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Premium Lock/Subscription Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <View style={styles.modalCard}>
            {/* Animated Lock/Crown Circle */}
            <View style={styles.lockCircle}>
              <Text style={styles.lockIcon}>✨</Text>
            </View>

            <Text style={styles.modalTitle}>Unlock {selectedTraining}!</Text>
            
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PREMIUM MEMBER ONLY</Text>
            </View>

            <Text style={styles.modalDescription}>
              This exclusive {selectedTraining} training program is part of our premium wellness suite. Subscribe to unlock guided video workouts, custom pacing recommendations, and expert training modules.
            </Text>

            <TouchableOpacity
              style={styles.upgradeBtn}
              activeOpacity={0.9}
              onPress={handleCloseModal}
            >
              <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeLink}
              activeOpacity={0.7}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeLinkText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  glowSpot1: {
    position: 'absolute',
    top: '15%',
    right: '-15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '35',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '20%',
    left: '-15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '12',
    zIndex: -1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  card: {
    width: CARD_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BDD6EC', // Light blue-grey border matching screenshot
    overflow: 'hidden',
    // Card Shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: CARD_SIZE - 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    backgroundColor: '#E6F0FA', // Light shaded blue background matching screenshot
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#D2E3F4',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: 'bold',
    color: '#0F172A',
    textDecorationLine: 'underline', // Underlined label as in screenshot
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Deep slate overlay mask
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  lockCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  lockIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  modalDescription: {
    fontSize: 14.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  upgradeBtn: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  closeLink: {
    paddingVertical: 8,
  },
  closeLinkText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FitnessTrainingScreen;

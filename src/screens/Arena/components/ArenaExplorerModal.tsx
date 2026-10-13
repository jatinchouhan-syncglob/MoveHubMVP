import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { ARENA_THEMES } from '../constants';
import { IArena } from '../types';

interface ArenaExplorerModalProps {
  visible: boolean;
  arena: IArena | null;
  onClose: () => void;
}

export const ArenaExplorerModal: React.FC<ArenaExplorerModalProps> = ({
  visible,
  arena,
  onClose,
}) => {
  if (!arena) return null;

  const themeConfig =
    ARENA_THEMES[arena.themeColor] || ARENA_THEMES['arena-blue'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ARENA EXPLORER</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Explorer Image */}
            <View style={styles.modalImageWrapper}>
              <Image
                source={{ uri: arena.explorerImage || arena.bannerImage }}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(11, 15, 23, 0.9)']}
                style={styles.modalImageGradient}
              />
            </View>

            {/* Category Tag */}
            <View
              style={[
                styles.modalCategoryTag,
                {
                  backgroundColor: themeConfig.badgeBg,
                  borderColor: themeConfig.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalCategoryText,
                  { color: themeConfig.accent },
                ]}
              >
                {arena.category}
              </Text>
            </View>

            {/* Arena Name & Tagline */}
            <Text style={styles.modalArenaName}>{arena.name}</Text>
            <Text
              style={[styles.modalTagline, { color: themeConfig.accent }]}
            >
              {arena.tagline}
            </Text>

            {/* Summary */}
            <Text style={styles.modalSummary}>{arena.summary}</Text>

            {/* Arena Rules & Mechanics */}
            <View style={styles.modalFactsCard}>
              <Text style={styles.modalFactsHeading}>
                COMPETITION SPECIFICATIONS
              </Text>
              {arena.facts.map((fact, index) => (
                <View key={`modal-fact-${index}`} style={styles.modalFactRow}>
                  <View
                    style={[
                      styles.modalFactDot,
                      { backgroundColor: themeConfig.primary },
                    ]}
                  />
                  <Text style={styles.modalFactText}>{fact}</Text>
                </View>
              ))}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseAction}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseActionText}>CLOSE EXPLORER</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import { UserSegmentKey } from '../types';
import { SEGMENT_CONFIGS, SEGMENT_ORDERED_KEYS } from '../constants';

interface SegmentPickerModalProps {
  visible: boolean;
  activeSegment: UserSegmentKey;
  onSelectSegment: (key: UserSegmentKey) => void;
  onClose: () => void;
}

export const SegmentPickerModal: React.FC<SegmentPickerModalProps> = ({
  visible,
  activeSegment,
  onSelectSegment,
  onClose,
}) => {
  const segmentsList = SEGMENT_ORDERED_KEYS.map(k => SEGMENT_CONFIGS[k]);

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
            <Text style={styles.modalTitle}>SELECT ARENA SEGMENT</Text>
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
            {segmentsList.map(item => {
              const isSelected = activeSegment === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.segmentPickerItem,
                    isSelected && styles.segmentPickerItemActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    onSelectSegment(item.key);
                    onClose();
                  }}
                >
                  <View style={styles.segmentPickerLeft}>
                    <Text style={styles.segmentPickerIcon}>{item.icon}</Text>
                    <View>
                      <Text
                        style={[
                          styles.segmentPickerName,
                          isSelected && { color: item.theme.coreAccent },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.segmentPickerAudience}>
                        {item.targetAudience}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.segmentPickerRadio,
                      isSelected && styles.segmentPickerRadioSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.segmentPickerRadioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

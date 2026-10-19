import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import { METRIC_STRATEGIES } from '../constants';
import { ISegmentTheme } from '../types';

interface MetricSandboxModalProps {
  visible: boolean;
  onClose: () => void;
  activeTheme?: ISegmentTheme;
}

export const MetricSandboxModal: React.FC<MetricSandboxModalProps> = ({
  visible,
  onClose,
}) => {
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
            <Text style={styles.modalTitle}>METRIC STRATEGY SANDBOX</Text>
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
            {METRIC_STRATEGIES.map(metric => (
              <View
                key={metric.id}
                style={[
                  styles.sandboxCard,
                  { borderColor: metric.accentColor },
                ]}
              >
                <View style={styles.sandboxCardHeader}>
                  <Text
                    style={[
                      styles.sandboxMetricCode,
                      { color: metric.accentColor },
                    ]}
                  >
                    {metric.code}
                  </Text>
                  <View style={styles.sandboxTargetBadge}>
                    <Text style={styles.sandboxTargetText}>{metric.target}</Text>
                  </View>
                </View>

                <Text style={styles.sandboxMetricName}>{metric.name}</Text>

                <View style={styles.sandboxRuleBox}>
                  <Text style={styles.sandboxRuleText}>
                    💡 Rule: {metric.simpleRule}
                  </Text>
                </View>

                <Text style={styles.sandboxStrategyText}>
                  🎯 How to Maximize: {metric.actionStrategy}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

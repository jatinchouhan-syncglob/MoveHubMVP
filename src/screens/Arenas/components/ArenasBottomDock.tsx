import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { ISegmentTheme } from '../types';

export type ArenasDockTab = 'arena' | 'warRoom' | 'brackets' | 'rewards';

interface ArenasBottomDockProps {
  activeTab: ArenasDockTab;
  theme: ISegmentTheme;
  onPressArena: () => void;
  onPressWarRoom: () => void;
  onPressBrackets: () => void;
  onPressRewards: () => void;
}

export const ArenasBottomDock: React.FC<ArenasBottomDockProps> = ({
  activeTab,
  theme,
  onPressArena,
  onPressWarRoom,
  onPressBrackets,
  onPressRewards,
}) => {
  return (
    <View style={styles.bottomDockContainer}>
      <View
        style={[
          styles.bottomDockCard,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.mutedBorders,
          },
        ]}
      >
        {/* Tab 1: Arena */}
        <TouchableOpacity
          style={[
            styles.bottomDockTab,
            activeTab === 'arena' && styles.bottomDockTabActive,
          ]}
          activeOpacity={0.7}
          onPress={onPressArena}
        >
          <Text style={styles.bottomDockIcon}>🏟️</Text>
          <Text
            style={[
              styles.bottomDockLabel,
              {
                color:
                  activeTab === 'arena'
                    ? theme.coreAccent
                    : theme.textSecondary,
              },
              activeTab === 'arena' && styles.bottomDockLabelActive,
            ]}
          >
            Arena
          </Text>
          <View
            style={[
              styles.bottomDockMicroBadge,
              {
                backgroundColor:
                  activeTab === 'arena'
                    ? theme.badgeBg
                    : 'rgba(255, 255, 255, 0.05)',
              },
            ]}
          >
            <Text
              style={[
                styles.bottomDockMicroBadgeText,
                {
                  color:
                    activeTab === 'arena'
                      ? theme.coreAccent
                      : '#64748B',
                },
              ]}
            >
              DECK
            </Text>
          </View>
          {activeTab === 'arena' && (
            <View
              style={[
                styles.bottomDockActiveLine,
                { backgroundColor: theme.coreAccent },
              ]}
            />
          )}
        </TouchableOpacity>

        {/* Tab 2: War Room */}
        <TouchableOpacity
          style={[
            styles.bottomDockTab,
            activeTab === 'warRoom' && styles.bottomDockTabActive,
          ]}
          activeOpacity={0.7}
          onPress={onPressWarRoom}
        >
          <Text style={styles.bottomDockIcon}>🛡️</Text>
          <Text
            style={[
              styles.bottomDockLabel,
              {
                color:
                  activeTab === 'warRoom'
                    ? theme.coreAccent
                    : theme.textSecondary,
              },
              activeTab === 'warRoom' && styles.bottomDockLabelActive,
            ]}
          >
            War Room
          </Text>
          <View
            style={[
              styles.bottomDockMicroBadge,
              {
                backgroundColor:
                  activeTab === 'warRoom'
                    ? theme.badgeBg
                    : 'rgba(255, 255, 255, 0.05)',
              },
            ]}
          >
            <Text
              style={[
                styles.bottomDockMicroBadgeText,
                {
                  color:
                    activeTab === 'warRoom'
                      ? theme.coreAccent
                      : '#64748B',
                },
              ]}
            >
              3 METRICS
            </Text>
          </View>
          {activeTab === 'warRoom' && (
            <View
              style={[
                styles.bottomDockActiveLine,
                { backgroundColor: theme.coreAccent },
              ]}
            />
          )}
        </TouchableOpacity>

        {/* Tab 3: Brackets */}
        <TouchableOpacity
          style={[
            styles.bottomDockTab,
            activeTab === 'brackets' && styles.bottomDockTabActive,
          ]}
          activeOpacity={0.7}
          onPress={onPressBrackets}
        >
          <Text style={styles.bottomDockIcon}>📊</Text>
          <Text
            style={[
              styles.bottomDockLabel,
              {
                color:
                  activeTab === 'brackets'
                    ? theme.coreAccent
                    : theme.textSecondary,
              },
              activeTab === 'brackets' && styles.bottomDockLabelActive,
            ]}
          >
            Brackets
          </Text>
          <View
            style={[
              styles.bottomDockMicroBadge,
              {
                backgroundColor:
                  activeTab === 'brackets'
                    ? theme.badgeBg
                    : 'rgba(255, 255, 255, 0.05)',
              },
            ]}
          >
            <Text
              style={[
                styles.bottomDockMicroBadgeText,
                {
                  color:
                    activeTab === 'brackets'
                      ? theme.coreAccent
                      : '#64748B',
                },
              ]}
            >
              KNOCKOUT
            </Text>
          </View>
          {activeTab === 'brackets' && (
            <View
              style={[
                styles.bottomDockActiveLine,
                { backgroundColor: theme.coreAccent },
              ]}
            />
          )}
        </TouchableOpacity>

        {/* Tab 4: Rewards */}
        <TouchableOpacity
          style={[
            styles.bottomDockTab,
            activeTab === 'rewards' && styles.bottomDockTabActive,
          ]}
          activeOpacity={0.7}
          onPress={onPressRewards}
        >
          <Text style={styles.bottomDockIcon}>🎁</Text>
          <Text
            style={[
              styles.bottomDockLabel,
              {
                color:
                  activeTab === 'rewards'
                    ? theme.coreAccent
                    : theme.textSecondary,
              },
              activeTab === 'rewards' && styles.bottomDockLabelActive,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            Referral
          </Text>
          <View
            style={[
              styles.bottomDockMicroBadge,
              {
                backgroundColor:
                  activeTab === 'rewards'
                    ? theme.badgeBg
                    : 'rgba(255, 255, 255, 0.05)',
              },
            ]}
          >
            <Text
              style={[
                styles.bottomDockMicroBadgeText,
                {
                  color:
                    activeTab === 'rewards'
                      ? theme.coreAccent
                      : '#64748B',
                },
              ]}
            >
              1.4x MULTI
            </Text>
          </View>
          {activeTab === 'rewards' && (
            <View
              style={[
                styles.bottomDockActiveLine,
                { backgroundColor: theme.coreAccent },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ArenasBottomDock;

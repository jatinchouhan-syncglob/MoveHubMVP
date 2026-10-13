import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

export type ArenaNavTab = 'arenas' | 'gauntlet' | 'rankings' | 'faq';

export interface IArenaNavTabItem {
  id: ArenaNavTab;
  label: string;
}

const TABS: IArenaNavTabItem[] = [
  { id: 'arenas', label: 'Arenas' },
  { id: 'gauntlet', label: 'The Gauntlet' },
  { id: 'rankings', label: 'Rankings' },
  { id: 'faq', label: 'Faq' },
];

interface ArenaTopNavTabsProps {
  activeTab: ArenaNavTab;
  onSelectTab: (tab: ArenaNavTab) => void;
}

export const ArenaTopNavTabs: React.FC<ArenaTopNavTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<{ [key: string]: { x: number; width: number } }>({});

  const scrollToTab = (tabId: ArenaNavTab) => {
    const layout = tabPositions.current[tabId];
    if (scrollRef.current && layout) {
      if (tabId === 'arenas') {
        // Bring back to the start
        scrollRef.current.scrollTo({ x: 0, animated: true });
      } else {
        // Scroll left so active tab is positioned near left edge (~20px),
        // making upcoming tabs (Rankings, Faq) fully visible on the right
        const targetX = Math.max(0, layout.x - 10);
        scrollRef.current.scrollTo({ x: targetX, animated: true });
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTab(activeTab);
    }, 60);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTabPress = (tabId: ArenaNavTab) => {
    onSelectTab(tabId);
    scrollToTab(tabId);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {TABS.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onLayout={e => {
                tabPositions.current[tab.id] = {
                  x: e.nativeEvent.layout.x,
                  width: e.nativeEvent.layout.width,
                };
              }}
              style={[
                styles.tabButton,
                isActive && styles.tabButtonActive,
              ]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#080A0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 10,
  },
  container: {
    paddingLeft: 8,
    paddingRight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderColor: '#10B981',
  },
  tabLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: '#10B981',
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: '#10B981',
    borderRadius: 1,
  },
});

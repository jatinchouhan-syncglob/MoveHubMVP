import React, { useEffect, useMemo, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DEFAULT_BEDTIME,
  ParsedBedtime,
  parseBedtime,
} from '../../utils/helpers';

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const BASE_MINUTES = [
  '00',
  '05',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
];
const PERIODS: ('AM' | 'PM')[] = ['AM', 'PM'];
const QUICK_PRESETS = ['9:00 PM', '10:30 PM', '12:30 AM'];

interface WheelColumnProps {
  items: string[];
  selectedValue: string;
  onSelect: (val: string) => void;
  accessibilityLabel: string;
}

const WheelColumn: React.FC<WheelColumnProps> = ({
  items,
  selectedValue,
  onSelect,
  accessibilityLabel,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, items.indexOf(selectedValue));
  const hasMountedRef = useRef(false);

  const scrollToIndex = (idx: number, animated: boolean) => {
    const safeIdx = Math.max(0, Math.min(items.length - 1, idx));
    scrollRef.current?.scrollTo({
      y: safeIdx * ITEM_HEIGHT,
      animated,
    });
  };

  useEffect(() => {
    if (hasMountedRef.current) {
      scrollToIndex(selectedIndex, true);
    }
  }, [selectedIndex]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.max(
      0,
      Math.min(items.length - 1, Math.round(offsetY / ITEM_HEIGHT)),
    );
    const nextValue = items[idx];
    if (nextValue && nextValue !== selectedValue) {
      onSelect(nextValue);
    }
  };

  return (
    <View style={styles.wheelColumn}>
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}
        accessibilityLabel={accessibilityLabel}
        contentContainerStyle={styles.wheelContent}
        onLayout={() => {
          scrollToIndex(selectedIndex, false);
          hasMountedRef.current = true;
        }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={e => {
          const velocityY = e.nativeEvent.velocity?.y ?? 0;
          if (Math.abs(velocityY) < 0.15) {
            handleScrollEnd(e);
          }
        }}
      >
        {items.map((item, idx) => {
          const isSelected = item === selectedValue;
          return (
            <TouchableOpacity
              key={`${item}-${idx}`}
              style={styles.wheelItem}
              activeOpacity={0.7}
              onPress={() => {
                scrollToIndex(idx, true);
                if (item !== selectedValue) {
                  onSelect(item);
                }
              }}
            >
              <Text
                style={[
                  styles.wheelItemText,
                  isSelected && styles.wheelItemTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface ScrollableTimePickerProps {
  value: string;
  onChange: (nextTime: string) => void;
}

export const ScrollableTimePicker: React.FC<ScrollableTimePickerProps> = ({
  value,
  onChange,
}) => {
  const parsed = useMemo(() => parseBedtime(value || DEFAULT_BEDTIME), [value]);

  const minuteOptions = useMemo(() => {
    if (BASE_MINUTES.includes(parsed.minute)) {
      return BASE_MINUTES;
    }
    return [...BASE_MINUTES, parsed.minute].sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10),
    );
  }, [parsed.minute]);

  const updatePart = (next: Partial<ParsedBedtime>) => {
    const merged: ParsedBedtime = { ...parsed, ...next };
    onChange(`${merged.hour}:${merged.minute} ${merged.period}`);
  };

  const formattedCurrent = `${parsed.hour}:${parsed.minute} ${parsed.period}`;

  return (
    <View style={styles.wrapper}>
      {/* Selected Bedtime Readout Header */}
      <View style={styles.selectedTimeBar}>
        <View style={styles.selectedTimeLeft}>
          <Text style={styles.moonIcon}>🌙</Text>
          <View>
            <Text style={styles.selectedTimeLabel}>Selected Bedtime</Text>
            <Text style={styles.selectedTimeValue}>{formattedCurrent}</Text>
          </View>
        </View>
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Default: 10:30 PM</Text>
        </View>
      </View>

      {/* Scrollable 3-Column Wheel Picker */}
      <View style={styles.pickerContainer}>
        {/* Center Highlight Selection Band */}
        <View pointerEvents="none" style={styles.selectionBand} />

        <View style={styles.columnsRow}>
          <WheelColumn
            items={HOURS}
            selectedValue={parsed.hour}
            onSelect={hour => updatePart({ hour })}
            accessibilityLabel="Sleep hour picker"
          />

          <Text style={styles.colonSeparator}>:</Text>

          <WheelColumn
            items={minuteOptions}
            selectedValue={parsed.minute}
            onSelect={minute => updatePart({ minute })}
            accessibilityLabel="Sleep minute picker"
          />

          <View style={styles.periodSpacer} />

          <WheelColumn
            items={PERIODS}
            selectedValue={parsed.period}
            onSelect={period => updatePart({ period: period as 'AM' | 'PM' })}
            accessibilityLabel="AM or PM picker"
          />
        </View>
      </View>

      {/* Quick One-Tap Presets */}
      <View style={styles.presetsRow}>
        {QUICK_PRESETS.map(preset => {
          const isActive = formattedCurrent === preset;
          return (
            <TouchableOpacity
              key={preset}
              style={[styles.presetChip, isActive && styles.presetChipActive]}
              activeOpacity={0.75}
              onPress={() => onChange(preset)}
            >
              <Text
                style={[
                  styles.presetChipText,
                  isActive && styles.presetChipTextActive,
                ]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    marginBottom: 12,
  },
  selectedTimeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E2B45',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  selectedTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moonIcon: {
    fontSize: 20,
  },
  selectedTimeLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  selectedTimeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 1,
  },
  defaultBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#38BDF8',
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    backgroundColor: '#0A101E',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1E2B45',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  selectionBand: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: PICKER_HEIGHT,
  },
  wheelColumn: {
    width: 68,
    height: PICKER_HEIGHT,
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  wheelItemTextSelected: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  colonSeparator: {
    fontSize: 20,
    fontWeight: '900',
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  periodSpacer: {
    width: 10,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E2B45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: '#10B981',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default ScrollableTimePicker;

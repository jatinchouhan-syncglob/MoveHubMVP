import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { IReferralEntity } from '../../types';

interface EntityCardProps {
  entity: IReferralEntity;
  isSelected: boolean;
  onSelect: (entity: IReferralEntity) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  isSelected,
  onSelect,
}) => {
  const getBadgeStyle = () => {
    switch (entity.entityType) {
      case 'GYM':
        return styles.badgeGym;
      case 'TOWER_SOCIETY':
        return styles.badgeTower;
      case 'CORPORATE':
        return styles.badgeCorporate;
      default:
        return styles.badgeOther;
    }
  };

  const getBadgeTextStyle = () => {
    switch (entity.entityType) {
      case 'GYM':
        return styles.textGym;
      case 'TOWER_SOCIETY':
        return styles.textTower;
      case 'CORPORATE':
        return styles.textCorporate;
      default:
        return styles.textOther;
    }
  };

  const formatEntityType = (type: string) => {
    if (type === 'TOWER_SOCIETY') return 'TOWER / SOCIETY';
    return type;
  };

  return (
    <TouchableOpacity
      style={[styles.entityCard, isSelected && styles.entityCardSelected]}
      activeOpacity={0.85}
      onPress={() => onSelect(entity)}
    >
      <View style={styles.entityCardTopRow}>
        <View style={styles.entityCardInfoLeft}>
          <View style={styles.entityTypeBadgeRow}>
            <View style={[styles.entityTypeBadge, getBadgeStyle()]}>
              <Text style={[styles.entityTypeText, getBadgeTextStyle()]}>
                {formatEntityType(entity.entityType)}
              </Text>
            </View>
          </View>
          <Text style={styles.entityName}>{entity.entityName}</Text>
        </View>

        <View
          style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>

      {(entity.location || entity.city) && (
        <View style={styles.entityLocationRow}>
          <Text style={styles.entityLocationPin}>📍</Text>
          <Text style={styles.entityLocationText} numberOfLines={1}>
            {[entity.location, entity.city].filter(Boolean).join(', ')}
          </Text>
        </View>
      )}

      <View style={styles.entityMetaRow}>
        <View style={styles.referralCodeBadge}>
          <Text style={styles.referralCodeLabel}>CODE:</Text>
          <Text style={styles.referralCodeValue}>{entity.referralCode}</Text>
        </View>

        {typeof entity.usageCount === 'number' && (
          <Text style={styles.usageCountText}>
            👥 {entity.usageCount} {entity.usageCount === 1 ? 'member' : 'members'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

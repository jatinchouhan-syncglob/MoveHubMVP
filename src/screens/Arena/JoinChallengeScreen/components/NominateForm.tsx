import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { INominateEntityPayload, ReferralEntityType } from '../../types';

interface NominateFormProps {
  initialEntityName?: string;
  userProfile: {
    name: string;
    email: string;
    phone: string;
  };
  onSubmit: (payload: INominateEntityPayload) => Promise<void>;
  loading: boolean;
}

const ENTITY_TYPES: { id: ReferralEntityType; label: string }[] = [
  { id: 'GYM', label: '🏋️ GYM' },
  { id: 'TOWER_SOCIETY', label: '🏢 TOWER / SOCIETY' },
  { id: 'CORPORATE', label: '💼 CORPORATE' },
  { id: 'OTHER', label: '⭐ OTHER' },
];

export const NominateForm: React.FC<NominateFormProps> = ({
  initialEntityName = '',
  userProfile,
  onSubmit,
  loading,
}) => {
  const [entityType, setEntityType] = useState<ReferralEntityType>('GYM');
  const [entityName, setEntityName] = useState(initialEntityName);
  const [contactPersonName, setContactPersonName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');

  const handleFormSubmit = async () => {
    if (!entityName.trim()) {
      setFormError('Please enter the entity / organization name');
      return;
    }
    if (!city.trim()) {
      setFormError('Please enter the city');
      return;
    }
    setFormError('');

    const payload: INominateEntityPayload = {
      entityType,
      entityName: entityName.trim(),
      contactPersonName: contactPersonName.trim() || `${userProfile.name} (Nominee)`,
      email: email.trim() || userProfile.email,
      phoneNumber: phoneNumber.trim() || userProfile.phone,
      city: city.trim(),
      location: location.trim(),
      nominatedByName: userProfile.name,
      nominatedByPhone: userProfile.phone,
      nominatedByEmail: userProfile.email,
    };

    await onSubmit(payload);
  };

  return (
    <View style={styles.nominateCard}>
      <View style={styles.nominateHeaderRow}>
        <Text style={styles.nominateHeading}>Nominate Your Entity</Text>
        <Text style={styles.nominateSubtext}>
          Can't find your Gym, Society, or Campus in the list? Nominate it now to bring your squad into the Arena!
        </Text>
      </View>

      {/* Entity Type Picker */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>
          Entity Category <Text style={styles.formRequiredStar}>*</Text>
        </Text>
        <View style={styles.entityTypeSelectorRow}>
          {ENTITY_TYPES.map(typeItem => {
            const isSelected = entityType === typeItem.id;
            return (
              <TouchableOpacity
                key={typeItem.id}
                style={[
                  styles.entityTypePill,
                  isSelected && styles.entityTypePillActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setEntityType(typeItem.id)}
              >
                <Text
                  style={[
                    styles.entityTypePillText,
                    isSelected && styles.entityTypePillTextActive,
                  ]}
                >
                  {typeItem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Entity Name */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>
          Entity / Gym / Society Name <Text style={styles.formRequiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. Snap Fitness Koramangala or Prestige Tower 4"
          placeholderTextColor="#64748B"
          value={entityName}
          onChangeText={setEntityName}
        />
      </View>

      {/* City */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>
          City <Text style={styles.formRequiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. Bengaluru, Mumbai, Delhi"
          placeholderTextColor="#64748B"
          value={city}
          onChangeText={setCity}
        />
      </View>

      {/* Location / Area */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Location / Street / Area</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. Koramangala, Indiranagar, Whitefield"
          placeholderTextColor="#64748B"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Contact Person Name */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Contact Person / Manager (Optional)</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. Vikram Verma (Manager / Ambassador)"
          placeholderTextColor="#64748B"
          value={contactPersonName}
          onChangeText={setContactPersonName}
        />
      </View>

      {/* Entity Contact Phone */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Entity Contact Phone (Optional)</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. 8876543210"
          placeholderTextColor="#64748B"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      {/* Entity Contact Email */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Entity Contact Email (Optional)</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. manager@snapfitness.com"
          placeholderTextColor="#64748B"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Pre-filled Nominator (Logged-in User) Information */}
      <View style={styles.nominatedByBox}>
        <View style={styles.nominatedByHeaderRow}>
          <Text style={styles.nominatedByIcon}>👤</Text>
          <Text style={styles.nominatedByTitle}>Nominated By (Your Details)</Text>
        </View>
        <Text style={styles.nominatedByDesc}>
          Your MoveHub profile details will automatically be attached as the verified nominator:
        </Text>

        <View style={styles.nominatedByInfoRow}>
          <Text style={styles.nominatedByLabel}>Name:</Text>
          <Text style={styles.nominatedByValue}>{userProfile.name}</Text>
        </View>

        <View style={styles.nominatedByInfoRow}>
          <Text style={styles.nominatedByLabel}>Phone:</Text>
          <Text style={styles.nominatedByValue}>{userProfile.phone}</Text>
        </View>

        <View style={styles.nominatedByInfoRow}>
          <Text style={styles.nominatedByLabel}>Email:</Text>
          <Text style={styles.nominatedByValue}>{userProfile.email}</Text>
        </View>
      </View>

      {formError ? (
        <View style={styles.formGroup}>
          <Text style={[styles.nominateSubtext, styles.formRequiredStar]}>
            ⚠️ {formError}
          </Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitNominateBtn}
        activeOpacity={0.85}
        onPress={handleFormSubmit}
        disabled={loading}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB', '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitNominateGradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.submitNominateBtnText}>
                SUBMIT & NOMINATE ENTITY
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

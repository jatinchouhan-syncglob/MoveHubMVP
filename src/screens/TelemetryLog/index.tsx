import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { StepsLogsTab } from '../ActivityTracking/components/StepsLogsTab';

export const TelemetryLogScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Telemetry Logs"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />
      <View style={styles.content}>
        <StepsLogsTab />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#0B0F19',
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#FFFFFF',
  },
  headerButton: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  headerIcon: {
    color: '#FFFFFF',
  },
});

export default TelemetryLogScreen;

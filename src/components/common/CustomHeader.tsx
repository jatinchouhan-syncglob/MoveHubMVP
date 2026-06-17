import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { theme } from '../../theme';
import { useDrawer } from '../../navigation/DrawerContext';

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  showDrawerButton?: boolean;
  rightComponent?: React.ReactNode;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showBackButton = false,
  showDrawerButton = false,
  rightComponent,
}) => {
  const navigation = useNavigation<any>();
  let drawer: any = null;
  try {
    drawer = useDrawer();
  } catch (e) {
    // Ignore if rendered outside DrawerProvider context
  }

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleDrawerToggle = () => {
    if (drawer) {
      drawer.openDrawer();
    } else {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.button} activeOpacity={0.7}>
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
        )}
        {showDrawerButton && (
          <TouchableOpacity onPress={handleDrawerToggle} style={styles.button} activeOpacity={0.7}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.titleContainer}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightComponent ? rightComponent : <View style={styles.buttonPlaceholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60, // slightly taller for premium breathing space
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    // Modern soft drop-shadow
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  leftContainer: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 17,
    fontWeight: '800' as any, // bold premium font weight
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 10, // modern rounded tiles
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  iconText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  buttonPlaceholder: {
    width: 38,
    height: 38,
  },
});

export default CustomHeader;

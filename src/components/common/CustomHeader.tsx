import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { theme } from '../../theme';
import DrawerContext from '../../navigation/DrawerContext';
import Svg, { Path, Circle } from 'react-native-svg';

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  showDrawerButton?: boolean;
  rightComponent?: React.ReactNode;
  containerStyle?: any;
  titleStyle?: any;
  buttonStyle?: any;
  iconStyle?: any;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showBackButton = false,
  showDrawerButton = false,
  rightComponent,
  containerStyle,
  titleStyle,
  buttonStyle,
  iconStyle,
}) => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleProfilePress = () => {
    if (drawer) {
      drawer.setActiveScreen('Profile');
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
    <View style={[styles.container, containerStyle]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={[styles.button, buttonStyle]} activeOpacity={0.7}>
            <Text style={[styles.iconText, iconStyle]}>←</Text>
          </TouchableOpacity>
        )}
        {showDrawerButton && (
          <TouchableOpacity onPress={handleDrawerToggle} style={[styles.button, buttonStyle]} activeOpacity={0.7}>
            <Text style={[styles.iconText, iconStyle]}>☰</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.titleContainer}>
        <Text numberOfLines={1} style={[styles.title, titleStyle]}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : showDrawerButton ? (
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileHeaderBtn} activeOpacity={0.7}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx="12"
                cy="7"
                r="4"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonPlaceholder} />
        )}
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
  profileHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default CustomHeader;

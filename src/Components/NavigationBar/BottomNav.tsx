import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { Icon } from '@ui-kitten/components';

/**
 * Bottom navigation bar component for faculty role
 * Provides navigation buttons for Faculty Dashboard, MyClass, and FacultyProfile
 */
const BottomNav = () => {
  // Hook from NavigationController for navigating
  const { handleNextStep } = useNavigationHelper();
  
  // State to track selected tab
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  /**
   * Navigates to the FacultyDashboard page
   */
  const goToDashboard = () => {
    setSelectedIndex(0);
    handleNextStep('FacultyDashboard');
  };

  /**
   * Navigates to the MyClass page
   */
  const goToMyClass = () => {
    setSelectedIndex(1);
    handleNextStep('MyClass');
  };

  /**
   * Navigates to the FacultyProfile page
   */
  const goToFacultyProfile = () => {
    setSelectedIndex(2);
    handleNextStep('FacultyProfile');
  };

  return (
    <View style={styles.container}>
      {/* Dashboard Tab */}
      <TouchableOpacity 
        style={[
          styles.tab,
          selectedIndex === 0 && styles.selectedTab
        ]} 
        onPress={goToDashboard}
      >
        {/* <Icon 
          name="home-outline" 
          style={styles.icon}
          fill={selectedIndex === 0 ? '#3366FF' : '#8F9BB3'}
        /> */}
        <Text style={[
          styles.text,
          selectedIndex === 0 && styles.selectedText
        ]}>
          DASHBOARD
        </Text>
      </TouchableOpacity>

      {/* My Class Tab */}
      <TouchableOpacity 
        style={[
          styles.tab,
          selectedIndex === 1 && styles.selectedTab
        ]} 
        onPress={goToMyClass}
      >
        {/* <Icon 
          name="people-outline" 
          style={styles.icon}
          fill={selectedIndex === 1 ? '#3366FF' : '#8F9BB3'}
        /> */}
        <Text style={[
          styles.text,
          selectedIndex === 1 && styles.selectedText
        ]}>
          MY CLASS
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity 
        style={[
          styles.tab,
          selectedIndex === 2 && styles.selectedTab
        ]} 
        onPress={goToFacultyProfile}
      >
        {/* <Icon 
          name="person-outline" 
          style={styles.icon}
          fill={selectedIndex === 2 ? '#3366FF' : '#8F9BB3'}
        /> */}
        <Text style={[
          styles.text,
          selectedIndex === 2 && styles.selectedText
        ]}>
          PROFILE
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Styles matching UI Kitten's BottomNavigation design
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDF1F7',
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  selectedTab: {
    // Optional: add background color for selected tab
    backgroundColor: '#F7F9FC',
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    color: '#8F9BB3',
  },
  selectedText: {
    color: '#3366FF',
  },
});

export default BottomNav;
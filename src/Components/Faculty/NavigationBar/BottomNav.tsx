import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigationHelper } from '../../../Controller/NavigationController';
import { useNavigation, useRoute } from '@react-navigation/native';
/**
 * Bottom navigation bar component for faculty role
 * Provides navigation buttons for Faculty Dashboard, MyClass, and FacultyProfile
 */
const BottomNav = () => {
  // Hook from NavigationController for navigating
  const { handleTabNavigation } = useNavigationHelper();
  
  // State to track selected tab
  // Get current route information
  const route = useRoute();
  const navigation = useNavigation();
  
  // Determine selected index based on current route name
  const getSelectedIndex = () => {
    const routeName = route.name;
    
    switch(routeName) {
      case 'FacultyDashboard':
        return 0;
      case 'MyClass':
        return 1;
      case 'Archive':
        return 2;
      case 'FacultyProfile':
          return 3;
      default:
        return 0; // Default to Dashboard
    }
  };
  
  const selectedIndex = getSelectedIndex();

  /**
   * Navigates to the FacultyDashboard page
   */
  const goToDashboard = () => {
    if (route.name !== 'FacultyDashboard') {
    handleTabNavigation('FacultyDashboard');
  }
  };

  /**
   * Navigates to the MyClass page
   */
  const goToMyClass = () => {
    if (route.name !== 'MyClass') {
      handleTabNavigation('MyClass');
    }
  };

  /**
   * Navigates to the FacultyProfile page
   */
  const goToFacultyProfile = () => {
    if (route.name !== 'FacultyProfile') {
      handleTabNavigation('FacultyProfile');
    }
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
        <Text style={[
          styles.text,
          selectedIndex === 1 && styles.selectedText
        ]}>
          MY CLASS
        </Text>

      </TouchableOpacity>
            {/* My Class Tab */}
            <TouchableOpacity 
        style={[
          styles.tab,
          selectedIndex === 2 && styles.selectedTab
        ]} 
        onPress={goToMyClass}
      >
        <Text style={[
          styles.text,
          selectedIndex === 2 && styles.selectedText
        ]}>
          ARCHIVE
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity 
        style={[
          styles.tab,
          selectedIndex === 3 && styles.selectedTab
        ]} 
        onPress={goToFacultyProfile}
      >
        <Text style={[
          styles.text,
          selectedIndex === 3 && styles.selectedText
        ]}>
          PROFILE
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;


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
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  selectedTab: {
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
    fontFamily: 'Andika-Bold',
  },
  selectedText: {
    color: '#3366FF',
  },
});

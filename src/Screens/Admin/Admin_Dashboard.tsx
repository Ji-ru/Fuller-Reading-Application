import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import adminDashboard from '../../UI_Designs/AdminDashboardStyles';
import Sidebar from '../../Components/GlobalUse/Sidebar';
import {
  getCurrentAcademicYear,
  getAcademicYearOptions,
  formatAcademicYear,
} from '../../Utilities/acadYearUtils';

// Chart components
import UsersByRoleChart from '../../Components/Admin/UsersByRoleChart';
import UsersRegisteredChart from '../../Components/Admin/UsersRegisteredChart';
import ClassStatusChart from '../../Components/Admin/ClassStatusChart';
import ClassesPerGradeChart from '../../Components/Admin/ClassesPerGradeChart';
import ReadingLevelDistributionChart from '../../Components/Admin/ReadingLevelDistributionChart';
import { sw, sh, sf } from '../../Utils/responsive';

const COLORS = {
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  primary: '#4ECDC4',
  border: '#E9ECEF',
  background: '#F8F9FA',
};

export default function AdminDashboard() {
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
  const [selectedAcadYear, setSelectedAcadYear] = useState<string>(getCurrentAcademicYear());
  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);

  const { handleLogout, handleReplaceStep } = useNavigationHelper();

  // Generate year options (most recent first)
  const academicYearOptions = getAcademicYearOptions(); // e.g., ["2025-2026", "2024-2025"]
  const allOptions = ['All Years', ...academicYearOptions];

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: require('../../../assets/icons/Dashboard-icon.png'),
      onPress: () => handleReplaceStep('AdminDashboard'),
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: require('../../../assets/icons/UserManagement-icon.png'),
      onPress: () => handleReplaceStep('AdminUserManagement'),
    },
    {
      id: 'activity-logs',
      label: 'Activity Logs',
      icon: require('../../../assets/icons/Logs-icon.png'),
      onPress: () => {},
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: require('../../../assets/icons/Settings-icon.png'),
      onPress: () => {},
    },
  ];

  const toggleMenu = () => setSidebarVisible(!sidebarVisible);
  const handleLogoutPress = () => {
    setSidebarVisible(false);
    setLogoutVisible(true);
  };
  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };
  const cancelLogout = () => setLogoutVisible(false);

  return (
    <SafeAreaView style={adminDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={adminDashboard.container}>
          <BubbleBackground />

          {/* Header */}
          <View style={upperNav.header}>
            {/* <Image
              style={upperNav.ciscLogo}
              source={require('../../../assets/images/cisckids.png')}
            /> */}
            <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
              <Image
                style={upperNav.menuIcon}
                source={require('../../../assets/icons/Menu-icon.png')}
              />
            </TouchableOpacity>
          </View>

          {/* Sidebar */}
          <Sidebar
            visible={sidebarVisible}
            onClose={() => setSidebarVisible(false)}
            onLogout={handleLogoutPress}
            currentRoute="dashboard"
            menuItems={menuItems}
          />

          {/* Logout Modal */}
          <LogoutModal
            visible={logoutVisible}
            onCancel={cancelLogout}
            onConfirm={confirmLogout}
          />

          {/* Main Dashboard Content */}
          <View style={[adminDashboard.content, { paddingHorizontal: sw(20) }]}>
            <View style={styles.headerTitleSection}>
              <Text style={styles.sectionTitle}>Admin Dashboard</Text>
              <Text style={styles.sectionSubtitle}>
                {selectedAcadYear === 'All Years'
                  ? 'Analytics for all academic years'
                  : `Analytics for ${formatAcademicYear(selectedAcadYear)}`}
              </Text>
            </View>

            {/* Academic Year Dropdown */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Select Academic Year</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowYearDropdown(!showYearDropdown)}
                activeOpacity={0.7}
              >
                <View style={styles.filterButtonContent}>
                  <Text style={styles.filterButtonText}>
                    {selectedAcadYear === 'All Years'
                      ? 'All Academic Years'
                      : formatAcademicYear(selectedAcadYear)}
                  </Text>
                  <Text style={styles.dropdownArrow}>
                    {showYearDropdown ? '▲' : '▼'}
                  </Text>
                </View>
              </TouchableOpacity>

              {showYearDropdown && (
                <View style={styles.filterDropdownMenu}>
                  <ScrollView>
                    {allOptions.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.filterDropdownItem,
                          selectedAcadYear === year && styles.filterDropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedAcadYear(year);
                          setShowYearDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            selectedAcadYear === year && styles.filterDropdownItemTextSelected,
                          ]}
                        >
                          {year === 'All Years' ? 'All Years' : formatAcademicYear(year)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Charts Section */}
            <View style={styles.chartsGrid}>
              <ReadingLevelDistributionChart
                acadYear={selectedAcadYear === 'All Years' ? undefined : selectedAcadYear}
              />
              <UsersByRoleChart
                acadYear={selectedAcadYear === 'All Years' ? undefined : selectedAcadYear}
              />
              <UsersRegisteredChart
                acadYear={selectedAcadYear === 'All Years' ? undefined : selectedAcadYear}
              />
              <ClassStatusChart
                acadYear={selectedAcadYear === 'All Years' ? undefined : selectedAcadYear}
              />
              <ClassesPerGradeChart
                acadYear={selectedAcadYear === 'All Years' ? undefined : selectedAcadYear}
              />
            </View>
            
            <View style={{ height: sh(40) }} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitleSection: {
    marginTop: sh(10),
    marginBottom: sh(25),
  },
  sectionTitle: {
    fontSize: sf(30),
    fontFamily: 'Comfortaa-Bold',
    color: COLORS.textPrimary,
    marginBottom: sh(6),
  },
  sectionSubtitle: {
    fontSize: sf(15),
    fontFamily: 'Comfortaa-Regular',
    color: COLORS.textSecondary,
    lineHeight: sf(20),
  },
  filterSection: {
    marginBottom: sh(30),
    position: 'relative',
    zIndex: 100,
  },
  filterLabel: {
    fontSize: sf(12),
    fontFamily: 'Comfortaa-Bold',
    color: COLORS.textSecondary,
    marginBottom: sh(8),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: sw(18),
    paddingVertical: sh(14),
    borderRadius: sw(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.05,
    shadowRadius: sw(8),
    elevation: 2,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButtonText: {
    fontSize: sf(15),
    fontFamily: 'Comfortaa-Bold',
    color: COLORS.textPrimary,
  },
  dropdownArrow: {
    fontSize: sf(12),
    color: COLORS.textSecondary,
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: sh(85),
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: sw(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: sh(250),
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(10) },
    shadowOpacity: 0.12,
    shadowRadius: sw(15),
    elevation: 10,
    overflow: 'hidden',
  },
  filterDropdownItem: {
    paddingVertical: sh(15),
    paddingHorizontal: sw(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  filterDropdownItemSelected: {
    backgroundColor: '#E8F8F7',
  },
  filterDropdownItemText: {
    fontSize: sf(15),
    fontFamily: 'Comfortaa-Regular',
    color: COLORS.textPrimary,
  },
  filterDropdownItemTextSelected: {
    color: COLORS.primary,
    fontFamily: 'Comfortaa-Bold',
  },
  chartsGrid: {
    gap: sh(10), // This adds spacing between chart components
  },
});
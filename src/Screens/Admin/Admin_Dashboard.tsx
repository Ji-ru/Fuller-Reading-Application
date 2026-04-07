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
  textPrimary: '#1E1E1E',
  textSecondary: '#999999',
  primary: '#4ECDC4',
  border: '#E5E5E5',
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
            <Image
              style={upperNav.ciscLogo}
              source={require('../../../assets/images/cisckids.png')}
            />
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
          <View style={[adminDashboard.content, { paddingHorizontal: 16 }]}>
            <Text style={styles.sectionTitle}>Admin Dashboard</Text>
            <Text style={styles.sectionSubtitle}>
              {selectedAcadYear === 'All Years'
                ? 'Analytics for all academic years'
                : `Analytics for ${formatAcademicYear(selectedAcadYear)}`}
            </Text>

            {/* Academic Year Dropdown */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Academic Year</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowYearDropdown(!showYearDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.filterButtonText}>
                  {selectedAcadYear === 'All Years'
                    ? 'All Years'
                    : formatAcademicYear(selectedAcadYear)}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {showYearDropdown ? '▲' : '▼'}
                </Text>
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

            {/* Charts */}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: sf(28),
    fontFamily: 'Satoshi-Bold',
    color: COLORS.textPrimary,
    marginBottom: sh(4),
  },
  sectionSubtitle: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Regular',
    color: COLORS.textSecondary,
    marginBottom: sh(20),
  },
  filterItem: {
    marginBottom: sh(20),
    position: 'relative',
    zIndex: 10,
  },
  filterLabel: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: COLORS.textSecondary,
    marginBottom: sh(6),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: sw(14),
    paddingVertical: sh(12),
    borderRadius: sw(8),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonText: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Regular',
    color: COLORS.textPrimary,
  },
  dropdownArrow: {
    fontSize: sf(12),
    color: '#7F8C8D',
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: sh(70), // adjust based on button height
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: sw(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: sw(200),
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.1,
    shadowRadius: sw(4),
    elevation: 3,
  },
  filterDropdownItem: {
    paddingVertical: sh(12),
    paddingHorizontal: sw(14),
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  filterDropdownItemSelected: {
    backgroundColor: '#E8F8F7',
  },
  filterDropdownItemText: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Regular',
    color: '#555',
  },
  filterDropdownItemTextSelected: {
    color: COLORS.primary,
    fontFamily: 'Satoshi-Medium',
  },
});
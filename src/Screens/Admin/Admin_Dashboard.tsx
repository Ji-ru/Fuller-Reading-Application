import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from '@react-native-firebase/auth';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getUserProfile } from '../../Controller/AuthenticationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import Sidebar from '../../Components/GlobalUse/Sidebar';
import adminDashboard from '../../UI_Designs/AdminDashboardStyles';
import { FacultyColors } from '../../Utilities/Theme';
import { Icon, IconName } from '../../Components/GlobalUse/Icon';
import { useUserAnalytics } from '../../Hooks/Admin/useUserAnalytics';
import { useClassMetrics } from '../../Hooks/Admin/useClassMetrics';
import {
  getCurrentAcademicYear,
  getAcademicYearOptions,
  formatAcademicYear,
} from '../../Utilities/acadYearUtils';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { buildAdminMenuItems } from '../../Utilities/adminMenuItems';

// Chart components
import UsersByRoleChart from '../../Components/Admin/UsersByRoleChart';
import UsersRegisteredChart from '../../Components/Admin/UsersRegisteredChart';
import ClassStatusChart from '../../Components/Admin/ClassStatusChart';
import ClassesPerGradeChart from '../../Components/Admin/ClassesPerGradeChart';
import ReadingLevelDistributionChart from '../../Components/Admin/ReadingLevelDistributionChart';

// KPI Card Component
const KPICard = ({ icon, label, value, color }: { icon: IconName; label: string; value: number | string; color: string }) => (
  <View style={adminDashboard.kpiCard}>
    <View style={[adminDashboard.kpiIconContainer, { backgroundColor: `${color}20` }]}>
      <Icon name={icon} size={18} color={color} />
    </View>
    <Text style={adminDashboard.kpiValue} numberOfLines={1}>{value}</Text>
    <Text style={adminDashboard.kpiLabel} numberOfLines={1}>{label}</Text>
  </View>
);

// Hamburger icon — mirrors Faculty dashboard
function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
      <View style={{ width: 12, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
      <View style={{ width: 18, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
    </View>
  );
}

const SectionDivider = ({ label }: { label: string }) => (
  <View style={adminDashboard.sectionDivider}>
    <Text style={adminDashboard.sectionDividerLabel}>{label}</Text>
    <View style={adminDashboard.sectionDividerLine} />
  </View>
);

export default function AdminDashboard() {
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
  const [selectedAcadYear, setSelectedAcadYear] = useState<string>(getCurrentAcademicYear());
  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('Admin');

  const { handleLogout, handleReplaceStep } = useNavigationHelper();
  const auth = getAuth();

  // Current academic year — KPI cards are always locked to this, ignoring the chart filter
  const currentAcadYear = getCurrentAcademicYear();

  // KPI Data — always for the current school year only
  const { roleCounts } = useUserAnalytics(currentAcadYear);
  const { activeClassCount } = useClassMetrics(currentAcadYear);

  useEffect(() => {
    const loadName = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const profile = await getUserProfile(uid);
        if (profile?.firstName) setFirstName(profile.firstName);
      } catch (err) {
        console.warn('Failed to load admin profile name', err);
      }
    };
    loadName();
  }, [auth.currentUser?.uid]);

  const menuItems = buildAdminMenuItems(handleReplaceStep);

  // Generate year options (most recent first)
  const academicYearOptions = getAcademicYearOptions(); // e.g., ["2025-2026", "2024-2025"]
  const allOptions = ['All Years', ...academicYearOptions];

  const toggleMenu = () => setSidebarVisible(prev => !prev);
  const handleLogoutPress = () => {
    setSidebarVisible(false);
    setLogoutVisible(true);
  };
  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };
  const cancelLogout = () => setLogoutVisible(false);

  const acadYearParam = selectedAcadYear === 'All Years' ? undefined : selectedAcadYear;

  return (
    <SafeAreaView style={adminDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={adminDashboard.container}>
          <BubbleBackground />
          {/* TOP BAR — menu button (Faculty-style design) */}
          <View style={adminDashboard.topBar}>
            <TouchableOpacity
              style={adminDashboard.menuBtn}
              onPress={toggleMenu}
              activeOpacity={0.7}
            >
              <MenuBars />
            </TouchableOpacity>
          </View>

          {/* HERO HEADER CARD */}
          <View style={adminDashboard.heroCard}>
            <View style={adminDashboard.heroCardLeft}>
              <Text style={adminDashboard.heroGreeting}>Good Day, {firstName}!</Text>
              <Text style={adminDashboard.heroTitle}>Admin Dashboard</Text>
            </View>
            <View style={adminDashboard.heroIconWrap}>
              <Icon name="adminBadge" size={28} color="#FFFFFF" filled />
            </View>
          </View>

          {/* Sidebar navigation */}
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

          <View style={adminDashboard.content}>
            {/* KPI STRIP — current school year only */}
            <View style={adminDashboard.kpiStripContainer}>
              <View style={adminDashboard.kpiStrip}>
                <View style={adminDashboard.kpiRow}>
                  <KPICard icon="students" label={`Total Students\n${formatAcademicYear(currentAcadYear)}`} value={roleCounts.students} color={FacultyColors.primary} />
                  <KPICard icon="teacher" label={`Total Teachers\n${formatAcademicYear(currentAcadYear)}`} value={roleCounts.faculty} color={FacultyColors.primary} />
                </View>
                <View style={adminDashboard.kpiRowCentered}>
                  <View style={adminDashboard.kpiCardHalf}>
                    <KPICard icon="myclass" label={`Active Classes\n${formatAcademicYear(currentAcadYear)}`} value={activeClassCount} color={FacultyColors.primaryLight} />
                  </View>
                </View>
              </View>
            </View>

            {/* YEAR FILTER DROPDOWN */}
            {/* <View style={adminDashboard.yearFilterContainer}>
              <Text style={adminDashboard.yearFilterLabel}>Filter Charts by Academic Year</Text>
              <TouchableOpacity
                style={adminDashboard.filterDropdownButton}
                onPress={() => setShowYearDropdown(prev => !prev)}
                activeOpacity={0.7}
              >
                <Text style={adminDashboard.filterDropdownButtonText}>
                  {selectedAcadYear === 'All Years' ? 'All Academic Years' : formatAcademicYear(selectedAcadYear)}
                </Text>
                <View style={adminDashboard.filterDropdownChevron}>
                  <Icon name="chevron-right"
                    size={16}
                    color={FacultyColors.slate}
                  />
                </View>
              </TouchableOpacity>

              {showYearDropdown && (
                <View style={adminDashboard.filterDropdownMenu}>
                  {allOptions.map(year => {
                    const isSelected = selectedAcadYear === year;
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[adminDashboard.filterDropdownItem, isSelected && adminDashboard.filterDropdownItemSelected]}
                        onPress={() => {
                          setSelectedAcadYear(year);
                          setShowYearDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[adminDashboard.filterDropdownItemText, isSelected && adminDashboard.filterDropdownItemTextSelected]}>
                          {year === 'All Years' ? 'All Academic Years' : formatAcademicYear(year)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View> */}

            {/* CHARTS SECTION */}
            <View style={adminDashboard.chartsContainer}>
              {/* <SectionDivider label="Users" /> */}
              {/* <View style={adminDashboard.chartWrapper}>
                <ReadingLevelDistributionChart acadYear={acadYearParam} />
              </View> */}
              {/* <View style={adminDashboard.chartWrapper}>
                <UsersByRoleChart acadYear={acadYearParam} />
              </View> */}
              {/* <View style={adminDashboard.chartWrapper}>
                <UsersRegisteredChart acadYear={acadYearParam} />
              </View> */}

              {/* <SectionDivider label="Classes" /> */}
              {/* <View style={adminDashboard.chartWrapper}>
                <ClassStatusChart acadYear={acadYearParam} />
              </View> */}
              {/* <View style={adminDashboard.chartWrapper}>
                <ClassesPerGradeChart acadYear={acadYearParam} />
              </View> */}
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
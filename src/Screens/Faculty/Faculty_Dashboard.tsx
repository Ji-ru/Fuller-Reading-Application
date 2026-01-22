// FacultyDashboard.tsx (Updated with TypeScript)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import BottomNav from '../../Components/Faculty/NavigationBar/BottomNav';
import { getForStudentsMiscueStats } from '../../Hooks/use_ForStudentMiscueStats';
import { getAuth } from '@react-native-firebase/auth';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import ActiveHoursChart from '../../Components/Faculty/Dashboard/ActiveHoursChart';
import MiscueAnalytics from '../../Components/Faculty/Dashboard/MiscueChart';
import ClassReadingStatus from '../../Components/Faculty/Dashboard/ClassReadingStatus'; 

export default function FacultyDashboard() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<{
    classCount: number;
    studentCount: number;
  }>({ classCount: 0, studentCount: 0 });
  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleLogout } = useNavigationHelper();
  const auth = getAuth();
  const { getNumberOfClasses, getNumbersOfAllStudents } =
  getForStudentsMiscueStats();
  

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchStats = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Fetch both counts in parallel for better performance
      const [classCount, studentCount] = await Promise.all([
        getNumberOfClasses(currentUser.uid),
        getNumbersOfAllStudents(currentUser.uid),
      ]);

      setStats({
        classCount: classCount,
        studentCount: studentCount,
      });
    } catch (error: any) {
      throw new Error('Failed to fetch stats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setLogoutVisible(false);
  };

  const renderStatsSection = () => {
    if (loading) {
      return (
        <View style={facultyDashboard.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={facultyDashboard.loadingText}>Loading dashboard data...</Text>
        </View>
      );
    }

    if (stats.classCount === 0) {
      return (
        <View style={facultyDashboard.noDataContainer}>
          <Text style={facultyDashboard.noDataText}>No Classes Yet</Text>
          <Text style={facultyDashboard.noDataSubtext}>
            Create your first class to get started
          </Text>
        </View>
      );
    }

    return (
      <View style={facultyDashboard.statsContainer}>
        <View style={facultyDashboard.statCard}>
          <View style={facultyDashboard.iconContainer}>
            <Image
              style={facultyDashboard.icons}
              source={require('../../../assets/icons/Class-icon.png')}
            />
            <Text style={facultyDashboard.statValue}>{stats.classCount}</Text>
          </View>
          <Text style={facultyDashboard.statLabel}>
            Total Class{stats.classCount !== 1 ? 'es' : ''}
          </Text>
        </View>
        <View style={facultyDashboard.statCard}>
        <View style={facultyDashboard.iconContainer}>
        <Image
              style={facultyDashboard.icons}
              source={require('../../../assets/icons/Student-icon.png')}
            />
          <Text style={facultyDashboard.statValue}>{stats.studentCount}</Text>
          </View>
          <Text style={facultyDashboard.statLabel}>
            Total Student{stats.studentCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={facultyDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={facultyDashboard.container}>
          {/* BUBBLE DECORATIONS */}
          <View style={bubbles.bubblesContainer}>
            <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
            <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
            <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
          </View>

          {/* HEADER */}
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

          {/* DROPDOWN MENU */}
          {menuVisible && (
            <View style={upperNav.dropdownMenu}>
              <TouchableOpacity
                onPress={handleLogoutPress}
                style={upperNav.logoutButton}
              >
                <Image
                  source={require('../../../assets/icons/Logout-icon.png')}
                  style={upperNav.logoutIcon}
                />
                <Text style={upperNav.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OVERLAY TO CLOSE MENU */}
          {menuVisible && (
            <TouchableOpacity
              style={upperNav.closeMenu}
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
          )}

          {/* LOGOUT MODAL */}
          <LogoutModal
            visible={logoutVisible}
            onCancel={cancelLogout}
            onConfirm={confirmLogout}
          />

          {/* MAIN CONTENT */}
          <View style={facultyDashboard.content}>
            <Text style={facultyDashboard.dashboardTitle}>Faculty Dashboard</Text>
            <Text style={facultyDashboard.dashboardSubtitle}>
              Reading Performance Overview
            </Text>

            {/* STATS SUMMARY */}
            {renderStatsSection()}

            <ClassReadingStatus facultyId={auth.currentUser?.uid} />
            
            <ActiveHoursChart facultyId={auth.currentUser?.uid} />
            
            <MiscueAnalytics facultyId={auth.currentUser?.uid} />

          </View>
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}


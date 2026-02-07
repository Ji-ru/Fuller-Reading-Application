// FacultyDashboard.tsx (Updated with TypeScript)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import upperNav from '../../UI_Designs/UpperNavigation';
import { getForStudentsMiscueStats } from '../../Hooks/use_ForStudentMiscueStats';
import { getAuth } from '@react-native-firebase/auth';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import ActiveHoursChart from '../../Components/Faculty/Dashboard/ActiveHoursChart';
import MiscueAnalytics from '../../Components/Faculty/Dashboard/MiscueChart';
import ClassReadingStatus from '../../Components/Faculty/Dashboard/ClassReadingStatus';
import AccuracyTrendsChart from '../../Components/Faculty/Dashboard/AccuracyTrends';
import NumberOfClassesAndStudents from '../../Components/Faculty/Dashboard/NumberOFClassesAndStudents';
import { HeaderMenu } from '../../Components/GlobalUse/HeaderMenu';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';

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

  return (
    <SafeAreaView style={facultyDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={facultyDashboard.container}>
          {/* BUBBLE DECORATIONS */}
          <BubbleBackground />

          {/* HEADER */}
          <View style={upperNav.header}>
            <Image
              style={upperNav.ciscLogo}
              source={require('../../../assets/images/cisckids.png')}
            />
            <HeaderMenu onLogout={handleLogout} />
          </View>

          {/* MAIN CONTENT */}
          <View style={facultyDashboard.content}>
            <Text style={facultyDashboard.dashboardTitle}>Faculty Dashboard</Text>
            <Text style={facultyDashboard.dashboardSubtitle}>
              Reading Performance Overview
            </Text>

            {/* STATS SUMMARY */}
            <NumberOfClassesAndStudents
              loading={loading}
              classCount={stats.classCount}
              studentCount={stats.studentCount}
            />

            <ClassReadingStatus facultyId={auth.currentUser?.uid} />

            <AccuracyTrendsChart facultyId={auth.currentUser?.uid} />

            <ActiveHoursChart facultyId={auth.currentUser?.uid} />

            <MiscueAnalytics facultyId={auth.currentUser?.uid} />

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


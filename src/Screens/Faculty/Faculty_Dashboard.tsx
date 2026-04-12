// FacultyDashboard.tsx (Updated with TypeScript)
import { getAuth } from '@react-native-firebase/auth';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClassReadingStatus from '../../Components/Faculty/Dashboard/ClassReadingStatus';
import MiscueAnalytics from '../../Components/Faculty/Dashboard/MiscueChart';
import FacultySideMenu from '../../Components/Faculty/NavigationBar/FacultySideMenu';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { BookOpenIcon, HistoryIcon, TrophyIcon, UsersIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { getForStudentsMiscueStats } from '../../Hooks/use_ForStudentMiscueStats';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';

export default function FacultyDashboard() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('Guro');
  const [stats, setStats] = useState<{
    classCount: number;
    studentCount: number;
    reportCount: number;
    avgAccuracy: number;
  }>({ classCount: 0, studentCount: 0, reportCount: 0, avgAccuracy: 0 });
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [showClassPicker, setShowClassPicker] = useState<boolean>(false);
  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleLogout } = useNavigationHelper();
  const auth = getAuth();
  const route = useRoute();
  const { getNumberOfClasses, getNumbersOfAllStudents, getOverallAverageWPMandAccuracy } =
    getForStudentsMiscueStats();


  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchStats = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      // Fetch Profile for name
      try {
        const { getUserProfile } = require('../../Controller/AuthenticationController');
        const profile = await getUserProfile(currentUser.uid);
        if (profile?.firstName) {
          setUserName(profile.firstName);
        }
      } catch (err) {
        console.log('Name fetch error:', err);
      }

      const [classCount, studentCount, averages] = await Promise.all([
        getNumberOfClasses(currentUser.uid),
        getNumbersOfAllStudents(currentUser.uid),
        getOverallAverageWPMandAccuracy(currentUser.uid, { type: 'overall' }),
      ]);

      setStats({
        classCount,
        studentCount,
        reportCount: averages.totalReports,
        avgAccuracy: averages.averageAccuracy,
      });

      const facultyClasses = await getFacultyClasses_Student.getFacultyClasses(currentUser.uid);
      setClasses(facultyClasses);
    } catch (error: any) {
      console.log('Stats error:', error);
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
      <View style={S.summaryGrid}>
        <View style={S.sumCard}>
          <BookOpenIcon size={20} color={F.primary} />
          <Text style={S.sumVal}>{stats.classCount}</Text>
          <Text style={S.sumLabel}>Mga Klase</Text>
        </View>
        <View style={S.sumCard}>
          <UsersIcon size={20} color={F.primary} />
          <Text style={S.sumVal}>{stats.studentCount}</Text>
          <Text style={S.sumLabel}>Mag-aaral</Text>
        </View>
        <View style={S.sumCard}>
          <HistoryIcon size={20} color={F.primary} />
          <Text style={S.sumVal}>{stats.reportCount}</Text>
          <Text style={S.sumLabel}>Mga Ulat</Text>
        </View>
        <View style={S.sumCard}>
          <TrophyIcon size={20} color={F.primary} />
          <Text style={S.sumVal}>{stats.avgAccuracy.toFixed(0)}%</Text>
          <Text style={S.sumLabel}>Mastery</Text>
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

          <View style={S.headerRow}>
            <TouchableOpacity style={S.menuBtn} onPress={toggleMenu}>
              <View style={S.menuDotLine} />
              <View style={[S.menuDotLine, { width: 14 }]} />
              <View style={S.menuDotLine} />
            </TouchableOpacity>
            <Image
              style={S.logo}
              source={require('../../../assets/images/cisckids.png')}
              resizeMode="contain"
            />
            <View style={{ width: 44 }} />
          </View>

          {/* LOGOUT MODAL */}
          <LogoutModal
            visible={logoutVisible}
            onCancel={cancelLogout}
            onConfirm={confirmLogout}
          />

          {/* MAIN CONTENT */}
          <View style={facultyDashboard.content}>
            <BounceIn delay={100}>
              <View style={S.heroCard}>
                <View>
                  <Text style={S.heroSubtitle}>Magandang araw, {userName}!</Text>
                  <Text style={S.heroTitle}>Faculty Dashboard</Text>
                </View>
                <TrophyIcon size={48} color={F.primaryLight} />
              </View>
            </BounceIn>

            <View style={{ marginBottom: 20 }}>
              <Text style={S.sectionLabel}>Dashboard Overview</Text>
              {renderStatsSection()}
            </View>

            <View style={{ marginBottom: 3 }}>
              <Text style={S.sectionLabel}>Class</Text>
              <ClassReadingStatus facultyId={auth.currentUser?.uid} />
            </View>

            <View style={{ marginBottom: 24 }}>
              <TouchableOpacity
                style={S.classSelectBtn}
                onPress={() => setShowClassPicker(!showClassPicker)}
              >
                <View style={S.classSelectLeft}>
                  <View style={S.filterCircle}>
                    <UsersIcon size={16} color={F.primary} />
                  </View>
                  <Text style={S.classSelectText}>
                    {selectedClassId === 'all'
                      ? 'Mga Klase'
                      : classes.find(c => c.classId === selectedClassId)?.className || 'Select Class'}
                  </Text>
                </View>
                <Text style={S.chevron}>{showClassPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showClassPicker && (
                <View style={S.classOptions}>
                  <TouchableOpacity
                    style={S.optionItem}
                    onPress={() => { setSelectedClassId('all'); setShowClassPicker(false); }}
                  >
                    <Text style={[S.optionText, selectedClassId === 'all' && S.optionTextActive]}>Mga Klase</Text>
                  </TouchableOpacity>
                  {classes.map(c => (
                    <TouchableOpacity
                      key={c.classId}
                      style={S.optionItem}
                      onPress={() => { setSelectedClassId(c.classId); setShowClassPicker(false); }}
                    >
                      <Text style={[S.optionText, selectedClassId === c.classId && S.optionTextActive]}>
                        {c.className} ({c.classCode})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={S.sectionLabel}>Error Analytics</Text>
              <MiscueAnalytics
                facultyId={auth.currentUser?.uid}
                classId={selectedClassId === 'all' ? undefined : selectedClassId}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <FacultySideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogoutPress}
        currentRoute={route.name}
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, marginBottom: 10
  },
  logo: { width: 100, height: 90 },
  menuBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: F.white,
    justifyContent: 'center', alignItems: 'center', gap: 4, ...Shadows.subtle
  },
  menuDotLine: { width: 22, height: 2.5, borderRadius: 2, backgroundColor: F.ink },

  heroCard: {
    backgroundColor: F.primary, borderRadius: Radii.xl,
    padding: 24, marginBottom: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    ...Shadows.cardLift
  },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: F.white },

  sectionLabel: { fontSize: 13, fontWeight: '800', color: F.slate, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },

  summaryGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  sumCard: {
    flex: 1, minWidth: '45%', backgroundColor: F.white, borderRadius: Radii.lg,
    padding: 16, alignItems: 'center', ...Shadows.card, marginBottom: 10
  },
  sumVal: { fontSize: 22, fontWeight: '900', color: F.ink, marginVertical: 4 },
  sumLabel: { fontSize: 11, fontWeight: '700', color: F.slate, textTransform: 'uppercase' },

  classSelectBtn: {
    backgroundColor: F.white, borderRadius: Radii.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...Shadows.card
  },
  classSelectLeft: { flexDirection: 'row', alignItems: 'center' },
  filterCircle: { width: 32, height: 32, borderRadius: 10, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  classSelectText: { fontSize: 15, fontWeight: '800', color: F.ink },
  chevron: { fontSize: 12, color: F.slate, fontWeight: '800' },

  classOptions: {
    backgroundColor: F.white, borderRadius: Radii.lg, marginTop: 8,
    padding: 8, ...Shadows.cardLift, borderTopWidth: 1, borderTopColor: '#f1f1f1'
  },
  optionItem: { padding: 12, borderRadius: 8 },
  optionText: { fontSize: 14, fontWeight: '600', color: F.slate },
  optionTextActive: { color: F.primary, fontWeight: '800' },
});

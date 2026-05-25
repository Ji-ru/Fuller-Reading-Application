// FacultyDashboard.tsx (Updated with TypeScript)
import { getAuth } from '@react-native-firebase/auth';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
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
import FacultySideMenu from '../../Components/Faculty/NavigationBar/FacultySideMenu';
import MiscueAnalytics from '../../Components/Faculty/Dashboard/MiscueChart';
import MonthlyActivityHeatmap from '../../Components/Faculty/Dashboard/MonthlyActivityHeatmap';
import ClassAccuracySpeedChart from '../../Components/Faculty/Dashboard/ClassAccuracySpeedChart';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';
import {
  BookOpenIcon,
  HistoryIcon,
  TrophyIcon,
  UsersIcon,
  BriefcaseIcon,
  ClipboardListIcon,
  BurgerIcon,
  BarChartIcon
} from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { AssessmentController } from '../../Controller/AssessmentController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getUserProfile } from '../../Controller/AuthenticationController';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { useStudentMiscueStats } from '../../Hooks/use_ForStudentMiscueStats';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { FilterOptions } from '../../Interfaces/miscue';
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
  const [participation, setParticipation] = useState<{
    currentRate: number;
    lastRate: number;
    delta: number;
    activeThisWeek: number;
    totalStudents: number;
  } | null>(null);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);
  const [showClassDropdown, setShowClassDropdown] = useState<boolean>(false);
  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleLogout, handleTabNavigation } = useNavigationHelper();
  const auth = getAuth();
  const route = useRoute();
  const { getNumberOfClasses, getNumbersOfAllStudents, getOverallAverageWPMandAccuracy, getClassParticipationRate } =
    useStudentMiscueStats();


  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchStats = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      // Fetch Profile for name
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile?.firstName) {
          setUserName(profile.firstName);
        }
      } catch (err) {
        console.log('Name fetch error:', err);
      }

      const [classCount, studentCount, averages, assessmentList] = await Promise.all([
        getNumberOfClasses(currentUser.uid),
        getNumbersOfAllStudents(currentUser.uid),
        getOverallAverageWPMandAccuracy(currentUser.uid, { type: 'overall' }),
        AssessmentController.getFacultyActivities(),
      ]);

      setStats({
        classCount,
        studentCount,
        reportCount: assessmentList.length,
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

  useEffect(() => {
    if (classes.length === 0) return;
    if (!selectedAcademicYear) {
      const firstYear = classes[0]?.acadYear || '';
      if (firstYear) {
        setSelectedAcademicYear(firstYear);
        const firstClass = classes.find(c => c.acadYear === firstYear) || classes[0];
        setSelectedClassId(firstClass?.classId || '');
      }
      return;
    }
    const stillValid = classes.some(
      c => c.classId === selectedClassId && c.acadYear === selectedAcademicYear,
    );
    if (!stillValid) {
      const firstClass = classes.find(c => c.acadYear === selectedAcademicYear);
      setSelectedClassId(firstClass?.classId || '');
    }
  }, [classes, selectedAcademicYear]);

  useEffect(() => {
    const fetchParticipation = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const filter: FilterOptions = selectedClassId
          ? { type: 'class', classId: selectedClassId }
          : { type: 'overall' };
        const participationStats = await getClassParticipationRate(
          currentUser.uid,
          filter,
        );
        setParticipation(participationStats);
      } catch (error: any) {
        console.log('Participation error:', error);
      }
    };

fetchParticipation();
   }, [auth.currentUser?.uid, selectedClassId, getClassParticipationRate]);

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
          <LoadingDots />
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


      </View>
    );
  };

  const academicYears = useMemo(() => {
    return Array.from(new Set(classes.map(c => c.acadYear).filter(Boolean))).sort((a, b) => b.localeCompare(a));
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (!selectedAcademicYear) return classes;
    return classes.filter(c => c.acadYear === selectedAcademicYear);
  }, [classes, selectedAcademicYear]);

  const classOptions = useMemo(() => {
    return filteredClasses.map(c => ({
      value: c.classId,
      label: c.className || `Grade ${c.gradeLevel}`,
    }));
  }, [filteredClasses]);

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
            <TouchableOpacity style={S.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
              <BurgerIcon size={24} color={F.ink} />
            </TouchableOpacity>
            <Image
              style={S.logo}
              source={require('../../../assets/images/cisckids copy.png')}
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

<View style={{ marginBottom: 20 }}>
              <Text style={S.sectionLabel}>Academic Filters</Text>
              <View style={S.filterCard}>
                <View style={S.filterRow}>
                  <View style={S.filterItem}>
                    <Text style={S.filterLabel}>Academic Year</Text>
                    <TouchableOpacity
                      style={[S.filterButton, showYearDropdown && S.filterButtonActive]}
                      onPress={() => {
                        setShowYearDropdown(v => !v);
                        setShowClassDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={S.filterButtonText}>
                        {selectedAcademicYear || 'Select Year'}
                      </Text>
                      <Text style={S.filterButtonIcon}>
                        {showYearDropdown ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                    {showYearDropdown && (
                      <View style={S.filterDropdownMenu}>
                        {academicYears.length === 0 ? (
                          <Text style={S.filterDropdownEmpty}>No academic years</Text>
                        ) : (
                          academicYears.map((year, idx) => (
                            <TouchableOpacity
                              key={year}
                              style={[
                                S.filterDropdownOption,
                                idx === academicYears.length - 1 && S.filterDropdownOptionLast,
                                selectedAcademicYear === year && S.filterDropdownOptionActive,
                              ]}
                              onPress={() => {
                                setSelectedAcademicYear(year);
                                const firstClass = classes.find(c => c.acadYear === year);
                                setSelectedClassId(firstClass?.classId || '');
                                setShowYearDropdown(false);
                              }}
                              activeOpacity={0.75}
                            >
                              <Text
                                style={[
                                  S.filterDropdownOptionText,
                                  selectedAcademicYear === year && S.filterDropdownOptionTextActive,
                                ]}
                              >
                                {year}
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    )}
                  </View>

                  <View style={S.filterItem}>
                    <Text style={S.filterLabel}>Section</Text>
                    <TouchableOpacity
                      style={[S.filterButton, showClassDropdown && S.filterButtonActive]}
                      onPress={() => {
                        setShowClassDropdown(v => !v);
                        setShowYearDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={S.filterButtonText}>
                        {classOptions.find(o => o.value === selectedClassId)?.label || 'Select Class'}
                      </Text>
                      <Text style={S.filterButtonIcon}>
                        {showClassDropdown ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                    {showClassDropdown && (
                      <View style={S.filterDropdownMenu}>
                        {classOptions.length === 0 ? (
                          <Text style={S.filterDropdownEmpty}>No classes</Text>
                        ) : (
                          classOptions.map((opt, idx) => (
                            <TouchableOpacity
                              key={opt.value}
                              style={[
                                S.filterDropdownOption,
                                idx === classOptions.length - 1 && S.filterDropdownOptionLast,
                                selectedClassId === opt.value && S.filterDropdownOptionActive,
                              ]}
                              onPress={() => {
                                setSelectedClassId(opt.value);
                                setShowClassDropdown(false);
                              }}
                              activeOpacity={0.75}
                            >
                              <Text
                                style={[
                                  S.filterDropdownOptionText,
                                  selectedClassId === opt.value && S.filterDropdownOptionTextActive,
                                ]}
                              >
                                {opt.label}
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={S.sectionLabel}>Class Participation</Text>
              <View style={S.participationCard}>
                <View style={S.participationHeader}>
                  <View style={S.participationIconBox}>
                    <UsersIcon size={18} color={F.primary} />
                  </View>
                  <Text style={S.participationTitle}>This Week</Text>
                </View>
                <Text style={S.participationValue}>
                  {participation ? `${participation.currentRate.toFixed(0)}%` : '0%'}
                </Text>
                <Text style={S.participationSub}>
                  {participation
                    ? `${participation.activeThisWeek}/${participation.totalStudents} active students`
                    : 'No activity yet'}
                </Text>
                {participation && (
                  <View style={S.participationTrendRow}>
                    <Text
                      style={[
                        S.participationTrend,
                        participation.delta >= 0 ? S.participationTrendUp : S.participationTrendDown,
                      ]}
                    >
                      {participation.delta >= 0 ? '↑' : '↓'} {Math.abs(participation.delta).toFixed(0)}% from last week
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* <View style={{ marginBottom: 30 }}>
              <Text style={S.sectionLabel}>Mabilisang Aksyon</Text>
              <View style={S.quickActions}>
                 <TouchableOpacity 
                   style={[S.actionCard, { backgroundColor: F.white }]} 
                   onPress={() => handleTabNavigation('MyClass' as any)}
                 >
                   <View style={[S.actionIconBox, { backgroundColor: F.primary + '15' }]}>
                     <BriefcaseIcon size={24} color={F.primary} />
                   </View>
                   <Text style={S.actionLabel}>Aking Klase</Text>
                   <Text style={S.actionSub}>Pamahalaan ang mga mag-aaral</Text>
                 </TouchableOpacity>

                 <TouchableOpacity 
                   style={[S.actionCard, { backgroundColor: F.white }]} 
                   onPress={() => handleTabNavigation('FacultyReports' as any)}
                 >
                   <View style={[S.actionIconBox, { backgroundColor: F.primary + '15' }]}>
                     <BarChartIcon size={24} color={F.primary} />
                   </View>
                   <Text style={S.actionLabel}>Mga Ulat</Text>
                   <Text style={S.actionSub}>Tingnan ang galing ng mag-aaral</Text>
                 </TouchableOpacity>

              </View>
            </View> */}

            <View style={{ marginBottom: 30 }}>
              <Text style={S.sectionLabel}>Monthly Activity</Text>
              <MonthlyActivityHeatmap
                facultyId={auth.currentUser?.uid || null}
                classId={selectedClassId || undefined}
              />
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text style={S.sectionLabel}>Class Accuracy at Bilis</Text>
              <ClassAccuracySpeedChart
                facultyId={auth.currentUser?.uid || null}
                classId={selectedClassId || undefined}
              />
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text style={S.sectionLabel}>Miscue Insights</Text>
              <MiscueAnalytics
                facultyId={auth.currentUser?.uid || null}
                classId={selectedClassId || undefined}
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
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  menuDotLine: { width: 20, height: 2.5, backgroundColor: F.ink, borderRadius: 2, marginVertical: 2 },

  heroCard: {
    backgroundColor: F.primaryDeep, borderRadius: Radii.xl,
    padding: 24, marginBottom: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    ...Shadows.cardLift
  },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4, fontFamily: 'Andika-Regular' },
  heroTitle: { fontSize: 24, fontWeight: '900', color: F.white, fontFamily: 'Andika-Bold' },

  sectionLabel: { fontSize: 13, fontWeight: '800', color: F.slate, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4, fontFamily: 'Andika-Bold' },

  summaryGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  sumCard: {
    flex: 1, minWidth: '45%', backgroundColor: F.white, borderRadius: Radii.lg,
    padding: 16, alignItems: 'center', ...Shadows.card, marginBottom: 10
  },
  sumVal: { fontSize: 22, fontWeight: '900', color: F.ink, marginVertical: 4, fontFamily: 'Andika-Bold' },
  sumLabel: { fontSize: 11, fontWeight: '700', color: F.slate, textTransform: 'uppercase', fontFamily: 'Andika-Regular' },

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

  quickActions: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1, borderRadius: Radii.lg, padding: 20,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.card, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'
  },
  actionIconBox: {
    width: 54, height: 54, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14
  },
  actionLabel: { fontSize: 15, fontWeight: '900', color: F.ink, marginBottom: 4, fontFamily: 'Andika-Bold' },
  actionSub: { fontSize: 10, color: F.slate, fontWeight: '600', textAlign: 'center', lineHeight: 14, fontFamily: 'Andika-Regular' },

  participationCard: {
    backgroundColor: F.white,
    borderRadius: Radii.lg,
    padding: 18,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  participationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  participationIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: F.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participationTitle: { fontSize: 12, fontWeight: '800', color: F.slate, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Andika-Bold' },
  participationValue: { fontSize: 28, fontWeight: '900', color: F.ink, marginBottom: 4, fontFamily: 'Andika-Bold' },
  participationSub: { fontSize: 12, fontWeight: '700', color: F.slate, marginBottom: 10, fontFamily: 'Andika-Regular' },
  participationTrendRow: { flexDirection: 'row', alignItems: 'center' },
  participationTrend: { fontSize: 12, fontWeight: '800', fontFamily: 'Andika-Bold' },
  participationTrendUp: { color: F.teal },
  participationTrendDown: { color: F.red },

  filterCard: {
    backgroundColor: F.white,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  filterRow: { flexDirection: 'row', gap: 12 },
  filterItem: { flex: 1 },
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: F.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
    fontFamily: 'Andika-Bold',
  },
  filterButton: {
    backgroundColor: F.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eef2f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtonActive: { borderColor: F.primary },
  filterButtonText: { fontSize: 13, fontWeight: '700', color: F.ink, fontFamily: 'Andika-Regular' },
  filterButtonIcon: { fontSize: 11, fontWeight: '900', color: F.slate, fontFamily: 'Andika-Bold' },
  filterDropdownMenu: {
    marginTop: 8,
    backgroundColor: F.white,
    borderRadius: 12,
    paddingVertical: 6,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  filterDropdownOption: { paddingVertical: 10, paddingHorizontal: 12 },
  filterDropdownOptionLast: { borderBottomWidth: 0 },
  filterDropdownOptionActive: { backgroundColor: F.primary + '12' },
  filterDropdownOptionText: { fontSize: 13, fontWeight: '700', color: F.slate, fontFamily: 'Andika-Regular' },
  filterDropdownOptionTextActive: { color: F.primary, fontWeight: '800', fontFamily: 'Andika-Bold' },
  filterDropdownEmpty: { fontSize: 12, fontWeight: '700', color: F.slate, padding: 12, fontFamily: 'Andika-Regular' },

  analyticsCard: {
    backgroundColor: F.white,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  analyticsLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analyticsLoadingText: { fontSize: 12, fontWeight: '700', color: F.slate, fontFamily: 'Andika-Regular' },
});

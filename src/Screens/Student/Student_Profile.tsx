import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  ImageSourcePropType
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import {
  getUserProfile,
  getCurrentUser,
  getClassByCode,
} from '../../Controller/AuthenticationController';
import { getAuth } from '@react-native-firebase/auth';
import { UserDocument, ClassDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import StudentActivityTrackingCard from '../../Components/Faculty/StudentView_Status/Student_TimeTrack';
import StudentAccuracyTrendsChart from '../../Components/Faculty/StudentView_Status/Student_Accuracy_Chart';
import StudentMiscueAnalytics from '../../Components/Faculty/StudentView_Status/Student_MiscueChart';
import StudentTopMiscuePassageAndWords from '../../Components/Faculty/StudentView_Status/Student_TopPassage&TopWords';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import StudentAlphabetMastery from '../../Components/Faculty/StudentView_Status/StudentAlphabetMastery';
import StudentWordMastery from '../../Components/Faculty/StudentView_Status/StudentWordMastery';
import { sw, sh, sf } from '../../Utils/responsive';

/**
 * ==========================================================================
 * STUDENT PROFILE COMPONENT
 * ==========================================================================
 * Comprehensive student profile with:
 * - Basic and academic information
 * - Reading performance statistics
 * - Interactive progress visualizations
 * - Trend analysis
 * ==========================================================================
 */

// ========================================================================
// TYPE DEFINITIONS
// ========================================================================

interface StudentStats {
  totalAttempts: number;
  averageAccuracy: number;
  topMiscueType: string;
  mostCommonMiscueWords: { word: string; count: number }[];
  passagePerformance: { title: string; accuracy: number; attempts: number }[];
}

interface ProgressData {
  date: string;
  accuracy: number;
  wpm: number;
  passageTitle: string;
}

export default function Profile() {
  const auth = getAuth();
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  /** Controls visibility of dropdown menu */
  const [menuVisible, setMenuVisible] = useState(false);

  /** Controls visibility of logout confirmation modal */
  const [logoutVisible, setLogoutVisible] = useState(false);

  /** Stores current user's profile data from Firestore */
  const [profileData, setProfileData] = useState<UserDocument | null>(null);

  /** Stores class information if student is enrolled */
  const [classData, setClassData] = useState<ClassDocument | null>(null);

  /** Stores comprehensive reading statistics */
  const [readingStats, setReadingStats] = useState<StudentStats | null>(null);

  /** Stores progress data points for charts */
  const [progressData, setProgressData] = useState<ProgressData[]>([]);

  /** Loading state for async data fetching */
  const [loading, setLoading] = useState(true);

  /** Error message for display if data fetching fails */
  const [error, setError] = useState<string | null>(null);

  /** Profile image set */
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { handleLogout, handleBackStep } = useNavigationHelper();

  // ========================================================================
  // LIFECYCLE
  // ========================================================================

  useEffect(() => {
    fetchProfileData();
  }, []);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  /**
   * ==========================================================================
   * FETCH PROFILE DATA
   * ==========================================================================
   * Orchestrates fetching of all profile-related data:
   * 1. User profile from Authentication
   * 2. Class information if student is enrolled
   * 3. Reading statistics and analytics
   * 4. Progress data for visualizations
   *
   * @throws Sets error state if any fetch operation fails
   * ==========================================================================
   */
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();

      if (!currentUser) {
        setError('No user logged in');
        return;
      }

      // Fetch user profile
      const profile = await getUserProfile(currentUser.uid);
      setProfileData(profile);

      // Fetch class data if student has a class
      if (profile?.studentData?.classCode) {
        const classInfo = await getClassByCode(profile.studentData.classCode);
        console.log(profile.studentData.classCode);
        setClassData(classInfo);
      }
    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  /**
   * Formats date of birth string to readable format
   * @param dateString - Date string to format
   * @returns Formatted date or 'Not set'
   */
  const formatDateOfBirth = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return dateString; // Already formatted from backend
  };

  /**
   * Gets readable reading level label
   * @param level - Reading level code
   * @returns Formatted reading level
   */
  const getReadingLevelLabel = (level?: string) => {
    const levels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    };
    return levels[level || 'beginner'] || 'Beginner';
  };

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

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // ========================================================================
  // ERROR STATE
  // ========================================================================

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const topMiscuedPassage = readingStats?.passagePerformance?.[0] || null;
  const hasProgressData = progressData.length > 0;

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  console.log("The current user: " + getCurrentUser);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>

          {/* BUBBLE DECORATIONS */}
          <BubbleBackground />


          {/* HEADER */}
          <View style={styles.header}>
            <View style={upperNav.header}>
              <TouchableOpacity
                style={upperNav.touchable}
                onPress={() => handleBackStep()}
              >
                <Image
                  style={upperNav.backButtonIcon}
                  source={require('../../../assets/icons/BackButton-icon.png')}
                />
              </TouchableOpacity>

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
                  style={styles.logoutButton}
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
          </View>

          {/* PROFILE HEADER */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  profileData?.profileImageUrl
                    ? { uri: profileData.profileImageUrl } : profileData?.sex === 'male' ?
                      require('../../../assets/images/Male-profile.png') : require('../../../assets/images/Female-profile.png')
                }
                style={styles.profileImage}
              />
            </View>
            <Text style={styles.studentName}>
              {profileData?.firstName} {profileData?.lastName}
            </Text>
            <Text style={styles.studentRole}>Student</Text>
          </View>

          {/* BASIC INFORMATION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.infoGrid}>
              <InfoItem
                label="First Name"
                value={profileData?.firstName || 'N/A'}
              />
              <InfoItem
                label="Middle Name"
                value={profileData?.middleName || 'N/A'}
              />
              <InfoItem
                label="Last Name"
                value={profileData?.lastName || 'N/A'}
              />
              <InfoItem
                label="Birthdate"
                value={formatDateOfBirth(profileData?.studentData?.dateOfBirth)}
              />
              <InfoItem
                label="Sex"
                value={
                  profileData?.sex === 'male'
                    ? 'Male'
                    : profileData?.sex === 'female'
                      ? 'Female'
                      : 'N/A'
                }
              />
            </View>
          </View>

          {/* ACADEMIC INFORMATION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <View style={styles.infoGrid}>
              <InfoItem
                label="Grade Level"
                value={`Grade ${profileData?.studentData?.gradeLevel || 'N/A'}`}
              />
              <InfoItem
                label="Class"
                value={classData?.className || 'Not assigned'}
              />
              <InfoItem
                label="Reading Level"
                value={getReadingLevelLabel(
                  profileData?.studentData?.reading_Level,
                )}
              />
            </View>
          </View>

          <View style={styles.section}>
            {/* ALPHABET AND ACCURACY */}
            <StudentAlphabetMastery studentId={auth.currentUser?.uid || ''} />
          </View>

          <View style={styles.section}>
            {/* WORD AND ACCURACY */}
            <StudentWordMastery studentId={auth.currentUser?.uid || ''} />
          </View>

          {/* READING STATISTICS */}
          <View style={styles.section}>

            {/* ACCURACY TRENDS */}
            <StudentAccuracyTrendsChart studentId={auth.currentUser?.uid || ''} />

          </View>

          <View style={styles.section}>

            {/* MISCUE TYPE CHART */}
            <StudentMiscueAnalytics studentId={auth.currentUser?.uid || ''} />

            {/* TOP MISCUED PASSAGE AND MOST COMMON MISCUE WORDS  */}
            <StudentTopMiscuePassageAndWords studentId={auth.currentUser?.uid || ''} />

          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Tracking</Text>

            {/* ACTIVITY TRACKING */}
            <StudentActivityTrackingCard studentId={auth.currentUser?.uid || ''} />
          </View>

          {/* READING PROGRESS CHARTS */}

        </View>

      </ScrollView>

      {/* LOGOUT MODAL */}
      <LogoutModal
        visible={logoutVisible}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// CHILD COMPONENTS
// ============================================================================

/**
 * ==========================================================================
 * INFO ITEM COMPONENT
 * ==========================================================================
 * Displays a label-value pair in the info grid
 * @param label - Display label
 * @param value - Display value
 * ==========================================================================
 */
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);


// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    flexGrow: 1,
    paddingBottom: sh(24),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: sh(12),
    fontSize: sf(16),
    color: '#64748b',
  },
  errorText: {
    fontSize: sf(16),
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: sh(16),
    paddingHorizontal: sw(32),
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: sw(24),
    paddingVertical: sh(12),
    borderRadius: sw(8),
  },
  retryButtonText: {
    color: 'white',
    fontSize: sf(16),
    fontWeight: '600',
  },
  header: {
    position: 'relative',
    zIndex: 100,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(16),
    borderRadius: sw(12),
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: sh(24),
    backgroundColor: 'white',
    marginHorizontal: sw(16),
    marginTop: sh(16),
    borderRadius: sw(16),
    elevation: 4,
  },
  profileImageContainer: {
    width: sw(100),
    height: sw(100),
    borderRadius: sw(50),
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(12),
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  profileImage: {
    width: sw(94),
    height: sw(94),
    borderRadius: sw(47),
  },
  studentName: {
    fontSize: sf(24),
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: sh(4),
  },
  studentRole: {
    fontSize: sf(16),
    color: '#64748b',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: sw(10),
    marginTop: sh(16),
    padding: sw(20),
    borderRadius: sw(16),
    elevation: 4,
  },
  sectionTitle: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: sh(16),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: sh(16),
  },
  infoLabel: {
    fontSize: sf(14),
    color: '#64748b',
    marginBottom: sh(4),
  },
  infoValue: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(16),
  },
  statCard: {
    backgroundColor: '#f1f5f9',
    padding: sw(10),
    borderRadius: sw(12),
    alignItems: 'center',
    marginHorizontal: sw(2),
  },
  statNumber: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: sh(4),
  },
  statLabel: {
    fontSize: sf(12),
    color: '#64748b',
    textAlign: 'center',
  },
  miscueCard: {
    backgroundColor: '#fef2f2',
    padding: sw(16),
    borderRadius: sw(12),
    marginTop: sh(12),
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  miscueTitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: sh(8),
  },
  miscuePassage: {
    fontSize: sf(14),
    color: '#1e293b',
    marginBottom: sh(8),
  },
  miscueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miscueStat: {
    fontSize: sf(14),
    color: '#64748b',
  },
  miscueStatValue: {
    fontWeight: '600',
    color: '#1e293b',
  },
  wordList: {
    marginTop: sh(8),
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sh(6),
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  wordText: {
    fontSize: sf(14),
    color: '#1e293b',
    fontStyle: 'italic',
  },
  wordCount: {
    fontSize: sf(12),
    color: '#64748b',
  },
  chartContainer: {
    marginBottom: sh(24),
  },
  chartSubtitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(12),
  },
  chartWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: sw(12),
    padding: sw(16),
    minHeight: sw(160),
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: sw(8),
    height: sw(120),
  },
  yAxisLabel: {
    fontSize: sf(10),
    color: '#94a3b8',
    fontWeight: '500',
  },
  chartScroll: {
    flex: 1,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: sw(120),
    paddingHorizontal: sw(4),
  },
  chartBarWrapper: {
    alignItems: 'center',
    marginHorizontal: sw(6),
  },
  chartBarColumn: {
    alignItems: 'center',
    position: 'relative',
  },
  chartValue: {
    fontSize: sf(11),
    fontWeight: '700',
    marginBottom: sh(4),
  },
  chartBar: {
    width: sw(16),
    borderTopLeftRadius: sw(8),
    borderTopRightRadius: sw(8),
    minHeight: sw(4),
  },
  chartConnector: {
    position: 'absolute',
    top: '50%',
    right: sw(-6),
    width: sw(12),
    height: sw(2),
    opacity: 0.4,
  },
  chartLabel: {
    fontSize: sf(10),
    color: '#64748b',
    textAlign: 'center',
  },
  wpmChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: sw(100),
    paddingHorizontal: sw(10),
    marginTop: sh(10),
  },

  wpmBarContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: sw(4),
  },

  wpmBar: {
    width: sw(20),
    backgroundColor: '#10b981',
    borderTopLeftRadius: sw(4),
    borderTopRightRadius: sw(4),
    marginBottom: sh(4),
  },

  wpmBarValue: {
    fontSize: sf(11),
    fontWeight: '600',
    color: '#065f46',
    marginBottom: sh(2),
  },

  wpmBarLabel: {
    fontSize: sf(10),
    color: '#64748b',
    textAlign: 'center',
  },

  statsSummaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: sw(12),
    padding: sw(16),
    marginTop: sh(10),
  },

  statsSummaryTitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(16),
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
    padding: sw(12),
    backgroundColor: 'white',
    borderRadius: sw(8),
    marginHorizontal: sw(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(2),
    elevation: 1,
  },

  statBoxNumber: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: sh(4),
  },

  statBoxLabel: {
    fontSize: sf(12),
    color: '#64748b',
    textAlign: 'center',
  },

  trendContainer: {
    backgroundColor: 'white',
    borderRadius: sw(8),
    padding: sw(12),
  },

  trendTitle: {
    fontSize: sf(14),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(8),
  },

  trendIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  trendText: {
    fontSize: sf(14),
    color: '#64748b',
  },

  trendArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendUp: {
    fontSize: sf(20),
    marginRight: sw(6),
  },

  trendUpText: {
    fontSize: sf(14),
    color: '#10b981',
    fontWeight: '600',
  },

  trendDown: {
    fontSize: sf(20),
    marginRight: sw(6),
  },

  trendDownText: {
    fontSize: sf(14),
    color: '#ef4444',
    fontWeight: '600',
  },

  trendNeutral: {
    fontSize: sf(20),
    marginRight: sw(6),
  },

  trendNeutralText: {
    fontSize: sf(14),
    color: '#f59e0b',
    fontWeight: '600',
  },
  // WPM Chart styles
  wpmBarWrapper: {
    alignItems: 'center',
    marginHorizontal: sw(4),
  },
  wpmValue: {
    fontSize: sf(11),
    fontWeight: '600',
    color: '#065f46',
    marginBottom: sh(4),
  },
  wpmLabel: {
    fontSize: sf(10),
    color: '#64748b',
    textAlign: 'center',
  },
  // Performance Summary styles
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: sw(12),
    padding: sw(16),
    marginTop: sh(16),
  },
  summaryTitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(16),
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(16),
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: sw(12),
    borderRadius: sw(8),
    alignItems: 'center',
    marginHorizontal: sw(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(2),
    elevation: 1,
  },
  summaryNumber: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: sh(4),
  },
  summaryLabel: {
    fontSize: sf(12),
    color: '#64748b',
    textAlign: 'center',
  },
  trendContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendEmoji: {
    fontSize: sf(20),
    marginRight: sw(6),
  },

  // Refresh Button
  refreshButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: sw(16),
    marginVertical: sh(24),
    paddingVertical: sh(16),
    borderRadius: sw(12),
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.2,
    shadowRadius: sw(8),
    elevation: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: sf(16),
    fontWeight: '600',
  },

  noDataText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: sh(16),
  },

  summarySubtext: {
    fontSize: sf(10),
    color: '#64748b',
    marginTop: sh(2),
  },

  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(8),
  },

  trendLabel: {
    fontSize: sf(14),
    color: '#475569',
    fontWeight: '500',
  },

  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendValue: {
    fontSize: sf(14),
    color: '#1e293b',
  },

  positiveTrend: {
    color: '#10b981',
    fontWeight: '600',
    marginLeft: sw(4),
  },

  negativeTrend: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: sw(4),
  },

  overallTrendContainer: {
    marginTop: sh(12),
    paddingTop: sh(12),
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },

  overallTrendLabel: {
    fontSize: sf(14),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(8),
  },
});

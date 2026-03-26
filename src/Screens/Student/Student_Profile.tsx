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
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'relative',
    zIndex: 100,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 4,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  studentRole: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  miscueCard: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  miscueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  miscuePassage: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
  },
  miscueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miscueStat: {
    fontSize: 14,
    color: '#64748b',
  },
  miscueStatValue: {
    fontWeight: '600',
    color: '#1e293b',
  },
  wordList: {
    marginTop: 8,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  wordText: {
    fontSize: 14,
    color: '#1e293b',
    fontStyle: 'italic',
  },
  wordCount: {
    fontSize: 12,
    color: '#64748b',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  chartWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    minHeight: 160,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
    height: 120,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  chartScroll: {
    flex: 1,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 4,
  },
  chartBarWrapper: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  chartBarColumn: {
    alignItems: 'center',
    position: 'relative',
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartBar: {
    width: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 4,
  },
  chartConnector: {
    position: 'absolute',
    top: '50%',
    right: -6,
    width: 12,
    height: 2,
    opacity: 0.4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  wpmChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 10,
    marginTop: 10,
  },

  wpmBarContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },

  wpmBar: {
    width: 20,
    backgroundColor: '#10b981',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 4,
  },

  wpmBarValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 2,
  },

  wpmBarLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },

  statsSummaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },

  statsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  statBoxNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },

  statBoxLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  trendContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },

  trendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },

  trendIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  trendText: {
    fontSize: 14,
    color: '#64748b',
  },

  trendArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendUp: {
    fontSize: 20,
    marginRight: 6,
  },

  trendUpText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },

  trendDown: {
    fontSize: 20,
    marginRight: 6,
  },

  trendDownText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },

  trendNeutral: {
    fontSize: 20,
    marginRight: 6,
  },

  trendNeutralText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  // WPM Chart styles
  wpmBarWrapper: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  wpmValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
  },
  wpmLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  // Performance Summary styles
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  trendContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendEmoji: {
    fontSize: 20,
    marginRight: 6,
  },

  // Refresh Button
  refreshButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  noDataText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 16,
  },

  summarySubtext: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },

  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  trendLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },

  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendValue: {
    fontSize: 14,
    color: '#1e293b',
  },

  positiveTrend: {
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },

  negativeTrend: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 4,
  },

  overallTrendContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },

  overallTrendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
});

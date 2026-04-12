import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import {
  getUserProfile,
  getCurrentUser,
  getClassByCode,
  updateStudentBasicInfo,
} from '../../Controller/AuthenticationController';
import { getAuth } from '@react-native-firebase/auth';
import { UserDocument, ClassDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import facultyProfile from '../../UI_Designs/FacultyProfile';
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

  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Alert Modal states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const [profileData, setProfileData] = useState<UserDocument | null>(null);
  const [classData, setClassData] = useState<ClassDocument | null>(null);
  const [readingStats, setReadingStats] = useState<StudentStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'performance' | 'activity'>('profile');

  // Edit states for Basic Information
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

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

      if (profile) {
        setFirstName(profile.firstName || '');
        setMiddleName(profile.middleName || '');
        setLastName(profile.lastName || '');
        setSex(profile.sex || '');
        setDateOfBirth(profile.studentData?.dateOfBirth || '');
      }

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

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !sex.trim()) {
      showAlert('Validation Error', 'First Name, Last Name, and Sex are required.');
      return;
    }

    setIsSaving(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await updateStudentBasicInfo(user.uid, {
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          sex: sex.trim(),
          dateOfBirth: dateOfBirth.trim(),
        });
        setIsEditing(false);
        showAlert('Success', 'Profile updated successfully!');
        fetchProfileData();
      }
    } catch (err: any) {
      showAlert('Update Failed', err.message || 'An error occurred while updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setMiddleName(profileData.middleName || '');
      setLastName(profileData.lastName || '');
      setSex(profileData.sex || '');
      setDateOfBirth(profileData.studentData?.dateOfBirth || '');
    }
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
  return (
    <SafeAreaView style={facultyProfile.container}>
      <View style={facultyProfile.insideContainer}>

        {/* BUBBLE DECORATIONS */}
        <BubbleBackground />

        {/* HEADER */}
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

        {/* MAIN SCROLL CONTENT */}
        <ScrollView
          contentContainerStyle={facultyProfile.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={facultyProfile.titleGroup}>
            <Text style={facultyProfile.screenTitle}>My Profile</Text>
          </View>

          {/* TAB NAVIGATION */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'profile' && styles.activeTab]}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'performance' && styles.activeTab]}
              onPress={() => setActiveTab('performance')}
            >
              <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>Performance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'activity' && styles.activeTab]}
              onPress={() => setActiveTab('activity')}
            >
              <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
            </TouchableOpacity>
          </View>

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <View style={facultyProfile.profileCard}>

              {/* Floating Avatar */}
              <View style={facultyProfile.avatarContainer}>
                <Image
                  source={
                    profileData?.profileImageUrl
                      ? { uri: profileData.profileImageUrl }
                      : profileData?.sex === 'male'
                        ? require('../../../assets/images/Male-profile.png')
                        : require('../../../assets/images/Female-profile.png')
                  }
                  style={facultyProfile.avatarIcon}
                />
              </View>

              {/* Student name banner */}
              <Text style={styles.cardName}>
                {profileData?.firstName} {profileData?.lastName}
              </Text>
              <Text style={styles.cardRole}>Student</Text>

              {/* ── BASIC INFORMATION ── */}
              <View style={styles.cardSectionHeader}>
                <Text style={styles.cardSectionTitle}>Basic Information</Text>
              </View>

              {isEditing ? (
                <>
                  {/* FIRST NAME */}
                  <View style={facultyProfile.inputGroup}>
                    <Text style={facultyProfile.label}>First Name</Text>
                    <TextInput
                      style={facultyProfile.textInput}
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>

                  {/* MIDDLE NAME */}
                  <View style={facultyProfile.inputGroup}>
                    <Text style={facultyProfile.label}>Middle Name</Text>
                    <TextInput
                      style={facultyProfile.textInput}
                      value={middleName}
                      onChangeText={setMiddleName}
                      placeholder="Optional"
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>

                  {/* LAST NAME */}
                  <View style={facultyProfile.inputGroup}>
                    <Text style={facultyProfile.label}>Last Name</Text>
                    <TextInput
                      style={facultyProfile.textInput}
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>

                  {/* BIRTHDATE */}
                  <View style={facultyProfile.inputGroup}>
                    <Text style={facultyProfile.label}>Birthdate (YYYY-MM-DD)</Text>
                    <TextInput
                      style={facultyProfile.textInput}
                      value={dateOfBirth}
                      onChangeText={setDateOfBirth}
                    />
                  </View>

                  {/* SEX */}
                  <View style={facultyProfile.inputGroup}>
                    <Text style={facultyProfile.label}>Sex</Text>
                    <TextInput
                      style={facultyProfile.textInput}
                      value={sex}
                      onChangeText={setSex}
                      autoCapitalize="none"
                    />
                  </View>

                  {/* ACTION BUTTONS */}
                  <View style={facultyProfile.actionRow}>
                    <TouchableOpacity
                      style={facultyProfile.cancelButton}
                      onPress={handleCancel}
                      disabled={isSaving}
                    >
                      <Text style={facultyProfile.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={facultyProfile.saveButton}
                      onPress={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={facultyProfile.saveButtonText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoGrid}>
                    <InfoItem label="First Name" value={profileData?.firstName || 'N/A'} />
                    <InfoItem label="Middle Name" value={profileData?.middleName || 'N/A'} />
                    <InfoItem label="Last Name" value={profileData?.lastName || 'N/A'} />
                    <InfoItem label="Birthdate" value={formatDateOfBirth(profileData?.studentData?.dateOfBirth)} />
                    <InfoItem
                      label="Sex"
                      value={
                        profileData?.sex === 'male' ? 'Male'
                          : profileData?.sex === 'female' ? 'Female' : 'N/A'
                      }
                    />
                  </View>

                  {/* Edit button */}
                  <View style={facultyProfile.actionRow}>
                    <TouchableOpacity
                      style={facultyProfile.editButton}
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={facultyProfile.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* ── ACADEMIC INFORMATION ── */}
              <View style={[styles.cardSectionHeader, { marginTop: sh(24) }]}>
                <Text style={styles.cardSectionTitle}>Academic Information</Text>
              </View>
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
                  value={getReadingLevelLabel(profileData?.studentData?.reading_Level)}
                />
              </View>

            </View>
          )}

          {activeTab === 'performance' && (
            <>
              <View style={styles.section}>
                <StudentAlphabetMastery studentId={auth.currentUser?.uid || ''} />
              </View>
              <View style={styles.section}>
                <StudentWordMastery studentId={auth.currentUser?.uid || ''} />
              </View>
              <View style={styles.section}>
                <StudentAccuracyTrendsChart studentId={auth.currentUser?.uid || ''} />
              </View>
              <View style={styles.section}>
                <StudentMiscueAnalytics studentId={auth.currentUser?.uid || ''} />
                <StudentTopMiscuePassageAndWords studentId={auth.currentUser?.uid || ''} />
              </View>
            </>
          )}

          {activeTab === 'activity' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Tracking</Text>
              <StudentActivityTrackingCard studentId={auth.currentUser?.uid || ''} />
            </View>
          )}

        </ScrollView>

        {/* LOGOUT MODAL */}
        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        <AlertModal
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFBFF',
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
  // Card name / role inside profile card
  cardName: {
    fontSize: sf(22),
    fontFamily: 'DynaPuff-Bold',
    color: '#3B7FC9',
    textAlign: 'center',
    marginBottom: sh(2),
    marginTop: sh(8),
  },
  cardRole: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#38B6FF',
    textAlign: 'center',
    marginBottom: sh(20),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(14),
  },
  cardSectionTitle: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#1E293B',
  },
  cardEditLink: {
    fontSize: sf(15),
    color: '#38B6FF',
    fontFamily: 'Satoshi-Bold',
  },
  section: {
    backgroundColor: 'white',
    marginTop: sh(16),
    padding: sw(20),
    borderRadius: sw(16),
    elevation: 4,
  },
  sectionTitle: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#1e293b',
    marginBottom: sh(14),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(16),
  },
  editButtonTextPrimary: {
    color: '#38B6FF',
    fontSize: sf(15),
    fontFamily: 'Satoshi-Bold',
  },
  formContainer: {
    marginTop: sh(8),
  },
  inputGroup: {
    marginBottom: sh(16),
  },
  inputLabel: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: '#3B7FC9',
    marginBottom: sh(6),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionalText: {
    fontWeight: '400',
    fontStyle: 'italic',
    fontSize: sf(12),
  },
  textInput: {
    backgroundColor: '#F4F9FF',
    borderWidth: 1.5,
    borderColor: '#B8E8F8',
    borderRadius: sw(15),
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
    color: '#2C2C2C',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: sh(16),
    gap: sw(12),
  },
  cancelButton: {
    paddingVertical: sh(10),
    paddingHorizontal: sw(20),
    borderRadius: sw(20),
    borderWidth: 2,
    borderColor: '#FF7043',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    color: '#FF7043',
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(14),
  },
  saveButton: {
    paddingVertical: sh(10),
    paddingHorizontal: sw(24),
    borderRadius: sw(20),
    backgroundColor: '#38B6FF',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: sw(80),
    elevation: 4,
    shadowColor: '#38B6FF',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.3,
    shadowRadius: sw(6),
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(14),
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
    fontSize: sf(13),
    fontFamily: 'Satoshi-Bold',
    color: '#3B7FC9',
    marginBottom: sh(4),
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
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

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    marginTop: sh(16),
    backgroundColor: '#E8F4FF',
    borderRadius: sw(20),
    padding: sw(5),
    elevation: 2,
    shadowColor: '#3B7FC9',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.15,
    shadowRadius: sw(4),
  },
  tabButton: {
    flex: 1,
    paddingVertical: sh(10),
    alignItems: 'center',
    borderRadius: sw(16),
  },
  activeTab: {
    backgroundColor: '#38B6FF',
    elevation: 3,
    shadowColor: '#38B6FF',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.3,
    shadowRadius: sw(4),
  },
  tabText: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: '#3B7FC9',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

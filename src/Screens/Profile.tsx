// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import bubbles from '../ui/BubblesDesign';
// import user from '../ui/UserStyle';
// import { useNavigationHelper } from '../Controller/NavigationController';
// import LogoutModal from '../Components/Buttons/LogoutModal';
// import { getUserProfile, getCurrentUser, getClassById } from '../Controller/AuthenticationController';
// import { MiscueReportController } from '../Controller/DatabaseController';
// import { UserDocument, MiscueReportDocument, ClassDocument } from '../Types/dataInterfaces';

// /**
//  * ==========================================================================
//  * PROFILE COMPONENT
//  * ==========================================================================
//  * Displays comprehensive student profile information including:
//  * - Basic personal information
//  * - Academic details (grade level, class)
//  * - Reading performance metrics
//  * - Reading journey visualization
//  * ==========================================================================
//  */
// export default function Profile() {
//   // ========================================================================
//   // STATE MANAGEMENT
//   // ========================================================================

//   /** Controls visibility of dropdown menu */
//   const [menuVisible, setMenuVisible] = useState(false);

//   /** Controls visibility of logout confirmation modal */
//   const [logoutVisible, setLogoutVisible] = useState(false);

//   /** Stores current user's profile data from Firestore */
//   const [profileData, setProfileData] = useState<UserDocument | null>(null);

//   /** Stores class information if student is enrolled */
//   const [classData, setClassData] = useState<ClassDocument | null>(null);

//   /** Stores all miscue reports for reading analytics */
//   const [reports, setReports] = useState<MiscueReportDocument[]>([]);

//   /** Loading state for async data fetching */
//   const [loading, setLoading] = useState(true);

//   /** Error message for display if data fetching fails */
//   const [error, setError] = useState<string | null>(null);

//   // ========================================================================
//   // HOOKS
//   // ========================================================================

//   const { handleLogout } = useNavigationHelper();

//   // ========================================================================
//   // DATA FETCHING
//   // ========================================================================

//   /**
//    * Fetches all profile-related data on component mount
//    * Includes: user profile, class info, and reading reports
//    */
//   useEffect(() => {
//     fetchProfileData();
//   }, []);

//   /**
//    * ==========================================================================
//    * FETCH PROFILE DATA
//    * ==========================================================================
//    * Orchestrates fetching of all profile-related data:
//    * 1. User profile from Authentication
//    * 2. Class information if student is enrolled
//    * 3. All reading reports for analytics
//    *
//    * @throws Sets error state if any fetch operation fails
//    * ==========================================================================
//    */
//   const fetchProfileData = async () => {
//     try {
//       setLoading(true);
//       const currentUser = getCurrentUser();

//       if (!currentUser) {
//         setError('No user logged in');
//         return;
//       }

//       // Fetch user profile
//       const profile = await getUserProfile(currentUser.uid);
//       setProfileData(profile);

//       // Fetch class data if student has a class
//       if (profile?.studentData?.classId) {
//         const classInfo = await getClassById(profile.studentData.classId);
//         setClassData(classInfo);
//       }

//       // Fetch all reading reports
//       const studentReports = await MiscueReportController.getStudentReports(currentUser.uid);
//       setReports(studentReports);

//     } catch (err: any) {
//       console.error('Error fetching profile data:', err);
//       setError(err.message || 'Failed to load profile data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ========================================================================
//   // ANALYTICS CALCULATIONS
//   // ========================================================================

//   /**
//    * ==========================================================================
//    * CALCULATE TOP MISCUE TYPE
//    * ==========================================================================
//    * Analyzes all reports to determine which miscue type occurs most frequently
//    * Counts miscues by filtering the miscues array for each type
//    *
//    * @returns Object with miscue type name and count
//    * @example { type: 'Substitution', count: 15 }
//    * ==========================================================================
//    */
//   const getTopMiscueType = (): { type: string; count: number } => {
//     if (reports.length === 0) return { type: 'None', count: 0 };

//     const miscueCounts = {
//       substitution: 0,
//       omission: 0,
//       insertion: 0,
//       repetition: 0,
//     };

//     reports.forEach(report => {
//       // Count each miscue type from the miscues array
//       report.miscues.forEach(miscue => {
//         if (miscue.type === 'substitution') miscueCounts.substitution++;
//         else if (miscue.type === 'omission') miscueCounts.omission++;
//         else if (miscue.type === 'insertion') miscueCounts.insertion++;
//         else if (miscue.type === 'repetition') miscueCounts.repetition++;
//       });
//     });

//     const maxType = Object.entries(miscueCounts).reduce((max, [type, count]) =>
//       count > max.count ? { type, count } : max
//     , { type: 'None', count: 0 });

//     // Capitalize first letter
//     return {
//       type: maxType.type.charAt(0).toUpperCase() + maxType.type.slice(1),
//       count: maxType.count
//     };
//   };

//   /**
//    * ==========================================================================
//    * CALCULATE TOP MISCUED PASSAGE
//    * ==========================================================================
//    * Identifies which passage has the most miscues across all attempts
//    * Counts total miscues from the miscues array for each passage
//    *
//    * @returns Object with passage title and total miscue count
//    * ==========================================================================
//    */
//   const getTopMiscuedPassage = (): { title: string; count: number } => {
//     if (reports.length === 0) return { title: 'None', count: 0 };

//     const passageMiscues: { [key: string]: number } = {};

//     reports.forEach(report => {
//       // Count total miscues from the miscues array
//       const totalMiscues = report.miscues.length;

//       passageMiscues[report.passageTitle] =
//         (passageMiscues[report.passageTitle] || 0) + totalMiscues;
//     });

//     const topPassage = Object.entries(passageMiscues).reduce(
//       (max, [title, count]) => count > max.count ? { title, count } : max,
//       { title: 'None', count: 0 }
//     );

//     return topPassage;
//   };

//   /**
//    * ==========================================================================
//    * CALCULATE AVERAGE ACCURACY
//    * ==========================================================================
//    * Computes the mean accuracy rate across all reading reports
//    *
//    * @returns Average accuracy percentage (0-100)
//    * ==========================================================================
//    */
//   const getAverageAccuracy = (): number => {
//     if (reports.length === 0) return 0;
//     const total = reports.reduce((sum, report) => sum + (report.accuracyRate || 0), 0);
//     return Math.round(total / reports.length);
//   };

//   /**
//    * ==========================================================================
//    * GET READING LEVEL
//    * ==========================================================================
//    * Determines reading proficiency based on average accuracy rate
//    *
//    * @returns Reading level classification (Beginner/Intermediate/Advanced)
//    * ==========================================================================
//    */
//   const getReadingLevel = (): string => {
//     const avgAccuracy = getAverageAccuracy();
//     if (avgAccuracy >= 90) return 'Advanced';
//     if (avgAccuracy >= 75) return 'Intermediate';
//     return 'Beginner';
//   };

//   // ========================================================================
//   // EVENT HANDLERS
//   // ========================================================================

//   const toggleMenu = () => {
//     setMenuVisible(!menuVisible);
//   };

//   const handleLogoutPress = () => {
//     setMenuVisible(false);
//     setLogoutVisible(true);
//   };

//   const confirmLogoout = async () => {
//     setLogoutVisible(false);
//     await handleLogout();
//   };

//   const cancelLogout = () => {
//     setLogoutVisible(false);
//   };

//   // ========================================================================
//   // LOADING STATE
//   // ========================================================================

//   if (loading) {
//     return (
//       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#4A90E2" />
//         <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>
//           Loading profile...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   // ========================================================================
//   // ERROR STATE
//   // ========================================================================

//   if (error) {
//     return (
//       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
//         <Text style={{ fontSize: 18, color: '#E74C3C', textAlign: 'center' }}>
//           {error}
//         </Text>
//         <TouchableOpacity
//           onPress={fetchProfileData}
//           style={{
//             marginTop: 20,
//             padding: 12,
//             backgroundColor: '#4A90E2',
//             borderRadius: 8
//           }}
//         >
//           <Text style={{ color: 'white', fontSize: 16 }}>Retry</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   // ========================================================================
//   // MAIN RENDER
//   // ========================================================================

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
//       <ScrollView>
//         <View>
//           {/* BUBBLE DECORATIONS */}
//           <View style={bubbles.bubblesContainer}>
//             <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
//             <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
//             <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
//             <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
//             <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
//             <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
//             <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
//             <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
//             <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
//             <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
//             <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
//             <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
//             <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
//             <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
//             <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
//             <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
//           </View>

//           {/* HEADER */}
//           <View style={user.header}>
//             <Image
//               style={user.ciscLogo}
//               source={require('../../assets/images/cisckids.png')}
//             />
//             <TouchableOpacity style={user.touchable} onPress={toggleMenu}>
//               <Image
//                 style={user.menuIcon}
//                 source={require('../../assets/icons/Menu-icon.png')}
//               />
//             </TouchableOpacity>
//           </View>

//           {/* DROPDOWN MENU */}
//           {menuVisible && (
//             <View style={user.dropdownMenu}>
//               <TouchableOpacity
//                 onPress={handleLogoutPress}
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   padding: 16,
//                   borderRadius: 12,
//                 }}
//               >
//                 <Image
//                   source={require('../../assets/icons/Logout-icon.png')}
//                   style={user.logoutIcon}
//                 />
//                 <Text style={user.logoutText}>Logout</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* OVERLAY TO CLOSE MENU */}
//           {menuVisible && (
//             <TouchableOpacity
//               style={user.closeMenu}
//               onPress={() => setMenuVisible(false)}
//               activeOpacity={1}
//             />
//           )}

//           {/* PROFILE CONTENT */}
//           <View style={{ padding: 20 }}>
//             {/* PROFILE HEADER */}
//             <View style={{
//               backgroundColor: 'white',
//               borderRadius: 16,
//               padding: 20,
//               marginBottom: 20,
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: 2 },
//               shadowOpacity: 0.1,
//               shadowRadius: 8,
//               elevation: 3,
//             }}>
//               <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 }}>
//                 Student Profile
//               </Text>
//               <Text style={{ fontSize: 14, color: '#7F8C8D' }}>
//                 View your academic information and reading progress
//               </Text>
//             </View>

//             {/* BASIC INFORMATION */}
//             <View style={{
//               backgroundColor: 'white',
//               borderRadius: 16,
//               padding: 20,
//               marginBottom: 20,
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: 2 },
//               shadowOpacity: 0.1,
//               shadowRadius: 8,
//               elevation: 3,
//             }}>
//               <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 16 }}>
//                 Basic Information
//               </Text>

//               <InfoRow label="First Name" value={profileData?.firstName || 'N/A'} />
//               <InfoRow label="Middle Name" value={profileData?.middleName || 'N/A'} />
//               <InfoRow label="Last Name" value={profileData?.lastName || 'N/A'} />
//               <InfoRow label="Date of Birth" value={profileData?.studentData?.dateOfBirth || 'N/A'} />
//               <InfoRow label="Sex" value={profileData?.sex || 'N/A'} />
//             </View>

//             {/* ACADEMIC INFORMATION */}
//             <View style={{
//               backgroundColor: 'white',
//               borderRadius: 16,
//               padding: 20,
//               marginBottom: 20,
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: 2 },
//               shadowOpacity: 0.1,
//               shadowRadius: 8,
//               elevation: 3,
//             }}>
//               <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 16 }}>
//                 Academic Information
//               </Text>

//               <InfoRow
//                 label="Grade Level"
//                 value={`Grade ${profileData?.studentData?.gradeLevel || 'N/A'}`}
//               />
//               <InfoRow
//                 label="Class"
//                 value={classData?.className || 'Not enrolled in any class'}
//               />
//               {classData && (
//                 <InfoRow
//                   label="Class Code"
//                   value={classData.classCode}
//                 />
//               )}
//             </View>

//             {/* READING ANALYTICS */}
//             <View style={{
//               backgroundColor: 'white',
//               borderRadius: 16,
//               padding: 20,
//               marginBottom: 20,
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: 2 },
//               shadowOpacity: 0.1,
//               shadowRadius: 8,
//               elevation: 3,
//             }}>
//               <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 16 }}>
//                 Reading Performance
//               </Text>

//               <InfoRow
//                 label="Reading Level"
//                 value={getReadingLevel()}
//                 valueColor={
//                   getReadingLevel() === 'Advanced' ? '#27AE60' :
//                   getReadingLevel() === 'Intermediate' ? '#F39C12' : '#E74C3C'
//                 }
//               />
//               <InfoRow
//                 label="Average Accuracy"
//                 value={`${getAverageAccuracy()}%`}
//                 valueColor={
//                   getAverageAccuracy() >= 90 ? '#27AE60' :
//                   getAverageAccuracy() >= 75 ? '#F39C12' : '#E74C3C'
//                 }
//               />
//               <InfoRow
//                 label="Total Readings"
//                 value={reports.length.toString()}
//               />
//               <InfoRow
//                 label="Top Miscue Type"
//                 value={`${getTopMiscueType().type} (${getTopMiscueType().count})`}
//               />
//               <InfoRow
//                 label="Most Challenging Passage"
//                 value={getTopMiscuedPassage().title}
//               />
//             </View>

//             {/* READING JOURNEY CHART */}
//             {reports.length > 0 && (
//               <View style={{
//                 backgroundColor: 'white',
//                 borderRadius: 16,
//                 padding: 20,
//                 marginBottom: 20,
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowOpacity: 0.1,
//                 shadowRadius: 8,
//                 elevation: 3,
//               }}>
//                 <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 16 }}>
//                   Reading Journey
//                 </Text>
//                 <Text style={{ fontSize: 14, color: '#7F8C8D', marginBottom: 12 }}>
//                   Your last {Math.min(reports.length, 5)} reading sessions
//                 </Text>

//                 {reports.slice(0, 5).map((report, index) => (
//                   <View key={report.reportId} style={{
//                     marginBottom: 12,
//                     paddingBottom: 12,
//                     borderBottomWidth: index < Math.min(reports.length, 5) - 1 ? 1 : 0,
//                     borderBottomColor: '#ECF0F1'
//                   }}>
//                     <Text style={{ fontSize: 14, fontWeight: '600', color: '#34495E', marginBottom: 4 }}>
//                       {report.passageTitle}
//                     </Text>
//                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
//                       <Text style={{ fontSize: 12, color: '#7F8C8D' }}>
//                         Accuracy: <Text style={{ fontWeight: '600', color: '#4A90E2' }}>
//                           {report.accuracyRate}%
//                         </Text>
//                       </Text>
//                       <Text style={{ fontSize: 12, color: '#7F8C8D' }}>
//                         WPM: <Text style={{ fontWeight: '600', color: '#4A90E2' }}>
//                           {report.wordPerMin}
//                         </Text>
//                       </Text>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>

//           {/* LOGOUT MODAL */}
//           <LogoutModal
//             visible={logoutVisible}
//             onCancel={cancelLogout}
//             onConfirm={confirmLogoout}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// /**
//  * ==========================================================================
//  * INFO ROW COMPONENT
//  * ==========================================================================
//  * Reusable component for displaying label-value pairs in profile sections
//  *
//  * @param label - Display label (e.g., "First Name")
//  * @param value - Display value (e.g., "John")
//  * @param valueColor - Optional custom color for value text
//  * ==========================================================================
//  */
// const InfoRow = ({
//   label,
//   value,
//   valueColor = '#34495E'
// }: {
//   label: string;
//   value: string;
//   valueColor?: string;
// }) => (
//   <View style={{
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ECF0F1'
//   }}>
//     <Text style={{ fontSize: 14, color: '#7F8C8D', flex: 1 }}>
//       {label}
//     </Text>
//     <Text style={{
//       fontSize: 14,
//       color: valueColor,
//       fontWeight: '600',
//       flex: 1,
//       textAlign: 'right'
//     }}>
//       {value}
//     </Text>
//   </View>
// );

// ==========================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import bubbles from '../ui/BubblesDesign';
import user from '../ui/UserStyle';
import { useNavigationHelper } from '../Controller/NavigationController';
import LogoutModal from '../Components/Buttons/LogoutModal';
import {
  getUserProfile,
  getCurrentUser,
  getClassById,
} from '../Controller/AuthenticationController';
import { MiscueReportController } from '../Controller/DatabaseController';
import { UserDocument, ClassDocument } from '../Types/dataInterfaces';
import upperNav from '../ui/UpperNavigation';

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

  // ========================================================================
  // HOOKS
  // ========================================================================

  const { handleLogout, handleBackStep } = useNavigationHelper();
  const screenWidth = Dimensions.get('window').width;

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
      if (profile?.studentData?.classId) {
        const classInfo = await getClassById(profile.studentData.classId);
        setClassData(classInfo);
      }

      // Fetch reading statistics
      const stats = await MiscueReportController.getStudentReadingStats(
        currentUser.uid,
      );
      setReadingStats(stats);

      // Fetch progress data for charts
      const progress = await MiscueReportController.getStudentProgressOverTime(
        currentUser.uid,
      );
      setProgressData(progress);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>

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
          <View style={styles.header}>
            <View style={upperNav.header}>
              <TouchableOpacity
                style={upperNav.touchable}
                onPress={() => handleBackStep()}
              >
                <Image
                  source={require('../../assets/icons/BackButton-icon.png')}
                />
              </TouchableOpacity>

              <Image
                style={upperNav.ciscLogo}
                source={require('../../assets/images/cisckids.png')}
              />
              <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
                <Image
                  style={upperNav.menuIcon}
                  source={require('../../assets/icons/Menu-icon.png')}
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
                    source={require('../../assets/icons/Logout-icon.png')}
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
                    ? { uri: profileData.profileImageUrl }
                    : require('../../assets/images/defaultProfile.png')
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

          {/* READING STATISTICS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reading Statistics</Text>
            <View style={styles.statsGrid}>
              <StatCard
                number={readingStats?.totalAttempts || 0}
                label="Total Attempts"
              />
              <StatCard
                number={`${readingStats?.averageAccuracy || 0}%`}
                label="Avg. Accuracy"
              />
              <StatCard
                number={readingStats?.topMiscueType || 'N/A'}
                label="Top Miscue Type"
              />
            </View>

            {/* TOP MISCUED PASSAGE */}
            {topMiscuedPassage && (
              <View style={styles.miscueCard}>
                <Text style={styles.miscueTitle}>Top Miscued Passage</Text>
                <Text style={styles.miscuePassage}>
                  {topMiscuedPassage.title}
                </Text>
                <View style={styles.miscueStats}>
                  <Text style={styles.miscueStat}>
                    Accuracy:{' '}
                    <Text style={styles.miscueStatValue}>
                      {topMiscuedPassage.accuracy.toFixed(1)}%
                    </Text>
                  </Text>
                  <Text style={styles.miscueStat}>
                    Attempts:{' '}
                    <Text style={styles.miscueStatValue}>
                      {topMiscuedPassage.attempts}
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            {/* MOST COMMON MISCUE WORDS */}
            {readingStats?.mostCommonMiscueWords &&
              readingStats.mostCommonMiscueWords.length > 0 && (
                <View style={styles.miscueCard}>
                  <Text style={styles.miscueTitle}>
                    Most Common Miscue Words
                  </Text>
                  <View style={styles.wordList}>
                    {readingStats.mostCommonMiscueWords.map((item, index) => (
                      <View key={index} style={styles.wordItem}>
                        <Text style={styles.wordText}>"{item.word}"</Text>
                        <Text style={styles.wordCount}>{item.count} times</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
          </View>

          {/* READING PROGRESS CHARTS */}
          {hasProgressData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reading Progress</Text>

              {/* ACCURACY OVER TIME CHART */}
              <AccuracyChart data={progressData} />

              {/* WPM OVER TIME CHART */}
              <WPMChart data={progressData} />

              {/* PERFORMANCE SUMMARY */}
              <PerformanceSummary data={progressData} />
            </View>
          )}

          {/* REFRESH BUTTON */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchProfileData}
          >
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
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

/**
 * ==========================================================================
 * STAT CARD COMPONENT
 * ==========================================================================
 * Displays a statistic in a card format
 * @param number - Statistic number/value
 * @param label - Statistic label
 * ==========================================================================
 */
const StatCard = ({
  number,
  label,
}: {
  number: number | string;
  label: string;
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * ==========================================================================
 * ACCURACY CHART COMPONENT
 * ==========================================================================
 * Renders a line chart showing accuracy progression over time
 * Features:
 * - Animated bars with connecting lines
 * - Y-axis percentage labels
 * - Color-coded by performance level
 * @param data - Array of progress data points
 * ==========================================================================
 */
const AccuracyChart = ({ data }: { data: ProgressData[] }) => {
  const maxHeight = 120;
  const chartData = data.slice(-10); // Show last 10 readings

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartSubtitle}>Accuracy Over Time</Text>
      <View style={styles.chartWrapper}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>100%</Text>
          <Text style={styles.yAxisLabel}>75%</Text>
          <Text style={styles.yAxisLabel}>50%</Text>
          <Text style={styles.yAxisLabel}>25%</Text>
          <Text style={styles.yAxisLabel}>0%</Text>
        </View>

        {/* Chart Bars */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartScroll}
        >
          <View style={styles.chartBarsContainer}>
            {chartData.map((item, index) => {
              const height = (item.accuracy / 100) * maxHeight;
              const isLast = index === chartData.length - 1;
              const barColor =
                item.accuracy >= 90
                  ? '#10b981'
                  : item.accuracy >= 75
                  ? '#f59e0b'
                  : '#ef4444';

              return (
                <View key={index} style={styles.chartBarWrapper}>
                  <View style={styles.chartBarColumn}>
                    {/* Accuracy Value */}
                    <Text style={[styles.chartValue, { color: barColor }]}>
                      {item.accuracy}%
                    </Text>

                    {/* Bar */}
                    <View
                      style={[
                        styles.chartBar,
                        { height, backgroundColor: barColor },
                      ]}
                    />

                    {/* Connector Line */}
                    {!isLast && (
                      <View
                        style={[
                          styles.chartConnector,
                          { backgroundColor: barColor },
                        ]}
                      />
                    )}
                  </View>

                  {/* Date Label */}
                  <Text style={styles.chartLabel}>{item.date}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

/**
 * ==========================================================================
 * WPM CHART COMPONENT
 * ==========================================================================
 * Renders a bar chart showing words per minute progression
 * Features:
 * - Vertical bars scaled to max WPM
 * - Value labels on bars
 * - Gradient-like color scheme
 * @param data - Array of progress data points
 * ==========================================================================
 */
const WPMChart = ({ data }: { data: ProgressData[] }) => {
  const maxHeight = 100;
  const chartData = data.slice(-10); // Show last 10 readings
  const maxWPM = Math.max(...chartData.map(d => d.wpm), 100);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartSubtitle}>Words Per Minute Over Time</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.wpmChartContainer}>
          {chartData.map((item, index) => {
            const height = (item.wpm / maxWPM) * maxHeight;
            const barColor = `hsl(${160 + (item.wpm / maxWPM) * 40}, 70%, 50%)`;

            return (
              <View key={index} style={styles.wpmBarWrapper}>
                <Text style={styles.wpmValue}>{item.wpm}</Text>
                <View
                  style={[
                    styles.wpmBar,
                    { height, backgroundColor: '#10b981' },
                  ]}
                />
                <Text style={styles.wpmLabel}>{item.date}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
/**
 * ==========================================================================
 * PERFORMANCE SUMMARY COMPONENT
 * ==========================================================================
 * Displays aggregate statistics and trend analysis
 * Features:
 * - Best accuracy, average WPM, total readings
 * - Progress trend indicator with emoji
 * - First vs last comparison
 * @param data - Array of progress data points
 * ==========================================================================
 */
const PerformanceSummary = ({ data }: { data: ProgressData[] }) => {
  // Safety checks for empty data
  if (data.length === 0) {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Performance Summary</Text>
        <Text style={styles.noDataText}>No reading data available</Text>
      </View>
    );
  }

  // Find best and worst accuracy
  const bestAccuracy = Math.max(...data.map(d => d.accuracy));
  const worstAccuracy = Math.min(...data.map(d => d.accuracy));

  // Calculate average WPM with safety check
  const totalWPM = data.reduce((sum, d) => sum + d.wpm, 0);
  const avgWPM = Math.round(totalWPM / data.length);

  // Find best and average WPM
  const bestWPM = Math.max(...data.map(d => d.wpm));

  // Calculate WPM improvement
  const firstWPM = data[0]?.wpm || 0;
  const lastWPM = data[data.length - 1]?.wpm || 0;
  const wpmImprovement = lastWPM - firstWPM;

  // Accuracy trend calculation
  const firstAccuracy = data[0]?.accuracy || 0;
  const lastAccuracy = data[data.length - 1]?.accuracy || 0;
  const accuracyImprovement = lastAccuracy - firstAccuracy;

  // Determine overall trend (weighted: 70% accuracy, 30% WPM)
  const accuracyTrendScore =
    accuracyImprovement > 5 ? 1 : accuracyImprovement < -5 ? -1 : 0;
  const wpmTrendScore = wpmImprovement > 10 ? 1 : wpmImprovement < -10 ? -1 : 0;
  const overallTrendScore = accuracyTrendScore * 0.7 + wpmTrendScore * 0.3;

  const isImproving = overallTrendScore > 0.2;
  const isDecreasing = overallTrendScore < -0.2;

  const totalReadings = data.length;

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Performance Summary</Text>

      {/* Stats Grid */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{bestAccuracy}%</Text>
          <Text style={styles.summaryLabel}>Best Accuracy</Text>
          {worstAccuracy > 0 && (
            <Text style={styles.summarySubtext}>Lowest: {worstAccuracy}%</Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{avgWPM}</Text>
          <Text style={styles.summaryLabel}>Avg WPM</Text>
          {bestWPM > avgWPM && (
            <Text style={styles.summarySubtext}>Best: {bestWPM}</Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{totalReadings}</Text>
          <Text style={styles.summaryLabel}>Total Readings</Text>
          {data.length >= 5 && (
            <Text style={styles.summarySubtext}>
              Last 7 days: {data.slice(-7).length}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Trend - More Detailed */}
      {data.length >= 2 && (
        <View style={styles.trendContainer}>
          <Text style={styles.trendTitle}>Progress Analysis</Text>

          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Accuracy Trend:</Text>
            <View style={styles.trendValueContainer}>
              <Text style={styles.trendValue}>
                {firstAccuracy}% → {lastAccuracy}%
                {accuracyImprovement !== 0 && (
                  <Text
                    style={
                      accuracyImprovement > 0
                        ? styles.positiveTrend
                        : styles.negativeTrend
                    }
                  >
                    {accuracyImprovement > 0 ? ' ↑' : ' ↓'}{' '}
                    {Math.abs(accuracyImprovement).toFixed(1)}%
                  </Text>
                )}
              </Text>
            </View>
          </View>

          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>WPM Trend:</Text>
            <View style={styles.trendValueContainer}>
              <Text style={styles.trendValue}>
                {firstWPM} → {lastWPM}
                {wpmImprovement !== 0 && (
                  <Text
                    style={
                      wpmImprovement > 0
                        ? styles.positiveTrend
                        : styles.negativeTrend
                    }
                  >
                    {wpmImprovement > 0 ? ' ↑' : ' ↓'}{' '}
                    {Math.abs(wpmImprovement)}
                  </Text>
                )}
              </Text>
            </View>
          </View>

          {/* Overall Trend Indicator */}
          <View style={styles.overallTrendContainer}>
            <Text style={styles.overallTrendLabel}>Overall Progress:</Text>
            <View style={styles.trendIndicator}>
              {isImproving ? (
                <>
                  <Text style={styles.trendEmoji}>📈</Text>
                  <Text style={styles.trendUp}>Significant Improvement</Text>
                </>
              ) : isDecreasing ? (
                <>
                  <Text style={styles.trendEmoji}>📉</Text>
                  <Text style={styles.trendDown}>Needs Attention</Text>
                </>
              ) : (
                <>
                  <Text style={styles.trendEmoji}>➡️</Text>
                  <Text style={styles.trendNeutral}>Steady Progress</Text>
                </>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    padding: 10
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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

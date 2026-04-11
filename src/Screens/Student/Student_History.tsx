import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import styles from '../../UI_Designs/StudentHistoryStyles';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';
import { getAuth } from '@react-native-firebase/auth';
const auth = getAuth();
/**
 * Interface for grouped report data by passage
 * Each passage contains multiple reading attempts with their reports
 */
interface GroupedReport {
  passageTitle: string;
  reports: ReportData[];
}

/**
 * Interface for individual report data
 * Updated to match the new MiscueReportDocument structure
 */
interface ReportData {
  id: string;
  timestamp: any;
  accuracyRate: number; // Changed from accuracy (string) to accuracyRate (number)
  wordPerMin: number; // Added: words per minute as string
  recordingDuration?: string; // Added: optional recording duration
  totalMiscues?: number; // Optional: legacy field
  substitution: string;
  omission: string;
  insertion: string;
  repetition: string;
  substitutionCount?: number; // Optional: legacy field
  omissionCount?: number; // Optional: legacy field
  insertionCount?: number; // Optional: legacy field
  repetitionCount?: number; // Optional: legacy field
  miscues?: any[]; // Added: miscue details array
}

/**
 * ReadingHistoryScreen Component
 * Displays user's reading history organized by passages
 * Now shows additional data: wordPerMin and recordingDuration
 */
export default function ReadingHistoryScreen() {
  // State for storing grouped reports by passage
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);

  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);

  // State for tracking which passages are expanded (using passage index)
  const [expandedPassages, setExpandedPassages] = useState<Set<number>>(
    new Set(),
  );

  // HANDLE MENU
  const [menuVisible, setMenuVisible] = useState(false);
  // HANDLE LOGOUT
  const { handleLogout, handleBackStep, handleNextStep } = useNavigationHelper();

  // HANDLE LOGOUT MODAL VISIBILITY
  const [logoutVisible, setLogoutVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };

  const confirmLogoout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setLogoutVisible(false);
  };

  /**
   * Fetch reports when component mounts
   */
  useEffect(() => {
    fetchReports();
  }, []);

  /**
   * Fetch all reports for the current user from Firestore
   * Groups reports by passage title for organized display
   */
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'No authenticated user found');
        return;
      }

      // Fetch all reports for current user using the new interface
      const reports = await MiscueReportController.getStudentReports(user.uid);

      // Group reports by passage title
      const grouped = groupReportsByPassage(reports);
      setGroupedReports(grouped);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      Alert.alert('Error', 'Failed to load reading history');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Groups reports by passage title
   * Now handles both new and old data structures
   */
  const groupReportsByPassage = (
    reports: MiscueReportDocument[],
  ): GroupedReport[] => {
    // Create a map to group reports by passage title
    const groupMap = new Map<string, ReportData[]>();

    reports.forEach(report => {
      const passageTitle = report.passageTitle || 'Unknown Passage';

      if (!groupMap.has(passageTitle)) {
        groupMap.set(passageTitle, []);
      }

      // Convert MiscueReportDocument to ReportData
      const reportData: ReportData = {
        id: report.reportId, // Using reportId from the new structure
        timestamp: report.createdAt,
        accuracyRate: report.accuracyRate || 0,
        wordPerMin: report.wordPerMin || 0,
        recordingDuration: report.recordingDuration,

        // Miscue summaries
        substitution: report.substitution || 'None',
        omission: report.omission || 'None',
        insertion: report.insertion || 'None',
        repetition: report.repetition || 'None',

        // Miscue details array (if you want to display them)
        miscues: report.miscues || [],

        // Legacy fields for backward compatibility
        // Note: These might not exist in new reports
        totalMiscues: (report as any).totalMiscues,
        substitutionCount: (report as any).substitutionCount,
        omissionCount: (report as any).omissionCount,
        insertionCount: (report as any).insertionCount,
        repetitionCount: (report as any).repetitionCount,
      };

      groupMap.get(passageTitle)?.push(reportData);
    });

    // Convert map to array and sort reports within each passage by timestamp
    const grouped: GroupedReport[] = Array.from(groupMap.entries()).map(
      ([passageTitle, reports]) => ({
        passageTitle,
        reports: reports.sort((a, b) => {
          // Sort by timestamp descending (newest first)
          const timeA = a.timestamp?.toDate?.() || new Date(0);
          const timeB = b.timestamp?.toDate?.() || new Date(0);
          return timeB.getTime() - timeA.getTime();
        }),
      }),
    );

    return grouped;
  };

  /**
   * Toggle expansion state for a passage
   */
  const togglePassageExpansion = (index: number) => {
    setExpandedPassages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  /**
   * Format Firebase timestamp to readable date string
   */
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Unknown Date';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  /**
   * Format recording duration - returns MM:SS format
   */
  const formatDuration = (duration?: string | number): string => {
    if (!duration && duration !== 0) return 'N/A';

    // If duration is a string in MM:SS format, return it as-is
    if (typeof duration === 'string') {
      // Validate format (should be something like "1:23" or "0:45")
      if (/^\d+:\d{2}$/.test(duration)) {
        return duration;
      }

      // If it's a string but not in MM:SS, try to parse as seconds
      const seconds = parseInt(duration);
      if (!isNaN(seconds) && seconds > 0) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }

      return 'N/A';
    }

    // If duration is a number (legacy format - seconds)
    if (typeof duration === 'number') {
      if (duration <= 0) return 'N/A';

      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    return 'N/A';
  };
  /**
   * Calculate total miscues from miscues array if totalMiscues not available
   */
  const getTotalMiscues = (report: ReportData): number => {
    if (report.totalMiscues !== undefined) {
      return report.totalMiscues;
    }

    // Calculate from miscues array if available
    if (report.miscues && Array.isArray(report.miscues)) {
      return report.miscues.length;
    }

    // Try to calculate from individual counts
    const counts = [
      report.substitutionCount || 0,
      report.omissionCount || 0,
      report.insertionCount || 0,
      report.repetitionCount || 0,
    ];
    return counts.reduce((sum, count) => sum + count, 0);
  };

  /**
   * Compute summary stats across all reports
   */
  const getTotalAttempts = (): number => {
    return groupedReports.reduce((sum, g) => sum + g.reports.length, 0);
  };

  const getAverageAccuracy = (): string => {
    const allReports = groupedReports.flatMap(g => g.reports);
    if (allReports.length === 0) return '0';
    const avg =
      allReports.reduce((sum, r) => sum + r.accuracyRate, 0) /
      allReports.length;
    return avg.toFixed(1);
  };

  const getBestWPM = (): number => {
    const allReports = groupedReports.flatMap(g => g.reports);
    if (allReports.length === 0) return 0;
    return Math.max(...allReports.map(r => r.wordPerMin || 0));
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.insideContainer}>
          <BubbleBackground />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B7FC9" />
            <Text style={styles.loadingText}>Loading reading history...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Render empty state when no reports exist
   */
  if (groupedReports.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.insideContainer}>
          <BubbleBackground />

          {/* HEADER */}
          <View>
            <View style={upperNav.header}>
              <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
                <Image
                  style={upperNav.backButtonIcon}
                  source={require('../../../assets/icons/BackButton-icon.png')}
                />
              </TouchableOpacity>
              <Svg height={60} width={200}>
                <SvgText
                  x={100}
                  y={35}
                  fontSize={21}
                  fontFamily="Comfortaa-Bold"
                  textAnchor="middle"
                  fill="none"
                  stroke="#D7E9FF"
                  strokeWidth={8}
                  strokeLinejoin="round"
                >
                  Reading History
                </SvgText>
                <SvgText
                  x={100}
                  y={35}
                  fontSize={21}
                  fontFamily="Comfortaa-Bold"
                  textAnchor="middle"
                  fill="#3B7FC9"
                >
                  Reading History
                </SvgText>
              </Svg>
              <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
                <Image
                  style={upperNav.menuIcon}
                  source={require('../../../assets/icons/Menu-icon.png')}
                />
              </TouchableOpacity>
            </View>
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
          {menuVisible && (
            <TouchableOpacity
              style={upperNav.closeMenu}
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
          )}

          {/* EMPTY STATE */}
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
            </View>
            <Text style={styles.emptyTitle}>No Reading History Yet</Text>
            <Text style={styles.emptyMessage}>
              You haven't completed any reading activities yet. Start reading passages to track your progress and see your improvement over time!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => handleNextStep('StudentTabs' as any, { screen: 'StudentLibrary' } as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Start Reading</Text>
            </TouchableOpacity>
          </View>

          {/* LOGOUT MODAL */}
          <LogoutModal
            visible={logoutVisible}
            onCancel={cancelLogout}
            onConfirm={confirmLogoout}
          />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Main render
   */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.insideContainer}>
        {/* BUBBLE DECORATIONS */}
        <BubbleBackground />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER (LOGO + MENU ICON) */}
          <View>
            <View style={upperNav.header}>
              <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
                <Image
                  style={upperNav.backButtonIcon}
                  source={require('../../../assets/icons/BackButton-icon.png')}
                />
              </TouchableOpacity>
              {/* SVG Title - styled like Reading Materials */}
              <Svg height={60} width={220}>
                <SvgText
                  x={110}
                  y={35}
                  fontSize={23}
                  fontFamily="DynaPuff-Bold"
                  textAnchor="middle"
                  fill="none"
                  stroke="#D7E9FF"
                  strokeWidth={8}
                  strokeLinejoin="round"
                >
                  Reading History
                </SvgText>
                <SvgText
                  x={110}
                  y={35}
                  fontSize={23}
                  fontFamily="DynaPuff-Bold"
                  textAnchor="middle"
                  fill="#3B7FC9"
                >
                  Reading History
                </SvgText>
              </Svg>
              <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
                <Image
                  style={upperNav.menuIcon}
                  source={require('../../../assets/icons/Menu-icon.png')}
                />
              </TouchableOpacity>
            </View>
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

          {/* SUMMARY STATS BAR */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{groupedReports.length}</Text>
              <Text style={styles.statLabel}>Passages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getTotalAttempts()}</Text>
              <Text style={styles.statLabel}>Attempts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getAverageAccuracy()}%</Text>
              <Text style={styles.statLabel}>Avg. Accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getBestWPM()}</Text>
              <Text style={styles.statLabel}>Best WPM</Text>
            </View>
          </View>

          {/* SECTION LABEL */}
          <View style={styles.contentContainer}>
            <Text style={styles.sectionLabel}>Your Reading Sessions</Text>

            {/* List of passages with their reports */}
            {groupedReports.map((group, passageIndex) => {
              const isExpanded = expandedPassages.has(passageIndex);

              return (
                <View
                  key={passageIndex}
                  style={[
                    styles.passageCard,
                    isExpanded && styles.passageCardExpanded,
                  ]}
                >
                  {/* Passage Header - Clickable to expand/collapse */}
                  <TouchableOpacity
                    onPress={() => togglePassageExpansion(passageIndex)}
                    style={styles.passageHeader}
                    activeOpacity={0.7}
                  >
                    <View style={styles.passageIconContainer}>
                      <Text style={styles.passageIconText}>📖</Text>
                    </View>

                    <View style={styles.passageInfo}>
                      <Text style={styles.passageTitle} numberOfLines={2}>
                        {group.passageTitle}
                      </Text>
                      <Text style={styles.passageAttempts}>
                        {group.reports.length} attempt
                        {group.reports.length > 1 ? 's' : ''}
                      </Text>
                    </View>

                    {/* Expand/Collapse indicator */}
                    <View style={styles.passageArrowContainer}>
                      <Text style={styles.passageArrow}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Expanded content - List of reports for this passage */}
                  {isExpanded && (
                    <View style={styles.reportsContainer}>
                      <ScrollView
                        style={styles.nestedScroll}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                      >
                        {group.reports.map((report, reportIndex) => {
                          const totalMiscues = getTotalMiscues(report);

                          return (
                            <View key={report.id} style={styles.reportCard}>
                              {/* Report Date & Attempt Badge */}
                              <View style={styles.reportDateRow}>
                                <Text style={styles.reportDate}>
                                  {formatDate(report.timestamp)}
                                </Text>
                                <View style={styles.reportAttemptBadge}>
                                  <Text style={styles.reportAttemptText}>
                                    #{reportIndex + 1}
                                  </Text>
                                </View>
                              </View>

                              {/* Performance Metrics Grid */}
                              <View style={styles.metricsGrid}>
                                <View style={styles.metricCard}>
                                  <Text style={styles.metricValue}>
                                    {report.accuracyRate.toFixed(1)}%
                                  </Text>
                                  <Text style={styles.metricLabel}>Accuracy</Text>
                                </View>

                                <View style={styles.metricCard}>
                                  <Text style={styles.metricValue}>
                                    {report.wordPerMin}
                                  </Text>
                                  <Text style={styles.metricLabel}>
                                    Words / Min
                                  </Text>
                                </View>

                                <View style={styles.metricCard}>
                                  <Text style={styles.metricValue}>
                                    {formatDuration(report.recordingDuration)}
                                  </Text>
                                  <Text style={styles.metricLabel}>Duration</Text>
                                </View>

                                <View style={styles.metricCard}>
                                  <Text style={styles.metricValue}>
                                    {totalMiscues}
                                  </Text>
                                  <Text style={styles.metricLabel}>
                                    Total Miscues
                                  </Text>
                                </View>
                              </View>

                              {/* Miscue Details - Only show if there are miscues */}
                              {totalMiscues > 0 && (
                                <View style={styles.miscueSection}>
                                  <Text style={styles.miscueSectionTitle}>
                                    Miscue Breakdown
                                  </Text>

                                  {/* Substitution */}
                                  {report.substitution !== 'None' && (
                                    <View style={styles.miscueRow}>
                                      <View
                                        style={[
                                          styles.miscueTag,
                                          styles.miscueTagSubstitution,
                                        ]}
                                      >
                                        <Text style={styles.miscueTagText}>
                                          Substitution
                                        </Text>
                                      </View>
                                      <Text style={styles.miscueDetail}>
                                        {report.substitution}
                                      </Text>
                                    </View>
                                  )}

                                  {/* Omission */}
                                  {report.omission !== 'None' && (
                                    <View style={styles.miscueRow}>
                                      <View
                                        style={[
                                          styles.miscueTag,
                                          styles.miscueTagOmission,
                                        ]}
                                      >
                                        <Text style={styles.miscueTagText}>
                                          Omission
                                        </Text>
                                      </View>
                                      <Text style={styles.miscueDetail}>
                                        {report.omission}
                                      </Text>
                                    </View>
                                  )}

                                  {/* Insertion */}
                                  {report.insertion !== 'None' && (
                                    <View style={styles.miscueRow}>
                                      <View
                                        style={[
                                          styles.miscueTag,
                                          styles.miscueTagInsertion,
                                        ]}
                                      >
                                        <Text style={styles.miscueTagText}>
                                          Insertion
                                        </Text>
                                      </View>
                                      <Text style={styles.miscueDetail}>
                                        {report.insertion}
                                      </Text>
                                    </View>
                                  )}

                                  {/* Repetition */}
                                  {report.repetition !== 'None' && (
                                    <View style={styles.miscueRow}>
                                      <View
                                        style={[
                                          styles.miscueTag,
                                          styles.miscueTagRepetition,
                                        ]}
                                      >
                                        <Text style={styles.miscueTagText}>
                                          Repetition
                                        </Text>
                                      </View>
                                      <Text style={styles.miscueDetail}>
                                        {report.repetition}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              )}

                              {/* No miscues message */}
                              {totalMiscues === 0 && (
                                <View style={styles.perfectBadge}>
                                  <Text style={styles.perfectIcon}>🌟</Text>
                                  <Text style={styles.perfectText}>
                                    Perfect reading! No miscues detected.
                                  </Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </ScrollView>

                      {/* View More indicator if there are many reports */}
                      {group.reports.length > 5 && (
                        <Text style={styles.viewMoreText}>
                          Scroll to see more attempts
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* LOGOUT MODAL */}
        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogoout}
        />
      </View>
    </SafeAreaView>
  );
}

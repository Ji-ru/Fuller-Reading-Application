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
import auth from '@react-native-firebase/auth';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import user from '../../UI_Designs/UserStyle';
import bubbles from '../../UI_Designs/BubblesDesign';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';

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
  const { handleLogout, handleBackStep } = useNavigationHelper();

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
      const user = auth().currentUser;

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
        timestamp: report.timestamp,
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
   * Get miscue count for a specific type
   */
  const getMiscueCount = (report: ReportData, type: string): number => {
    // First check legacy counts
    switch (type) {
      case 'substitution':
        return report.substitutionCount || 0;
      case 'omission':
        return report.omissionCount || 0;
      case 'insertion':
        return report.insertionCount || 0;
      case 'repetition':
        return report.repetitionCount || 0;
      default:
        return 0;
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Loading reading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Render empty state when no reports exist
   */
  if (groupedReports.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 18, color: '#666' }}>
            No reading history yet
          </Text>
          <Text style={{ marginTop: 10, color: '#999' }}>
            Start reading passages to see your progress!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Main render
   */
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          {/* Top Bubbles */}
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />

          {/* Bottom Bubbles */}
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>

        {/* HEADER (LOGO + MENU ICON) */}
        <View>
          <View style={upperNav.header}>
            <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
              <Image
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

        {/* Header */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Reading History
          </Text>
        </View>

        {/* List of passages with their reports */}
        {groupedReports.map((group, passageIndex) => {
          const isExpanded = expandedPassages.has(passageIndex);

          return (
            <View
              key={passageIndex}
              style={{ marginBottom: 16, paddingHorizontal: 16 }}
            >
              {/* Passage Header - Clickable to expand/collapse */}
              <TouchableOpacity
                onPress={() => togglePassageExpansion(passageIndex)}
                style={{
                  padding: 16,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600' }}>
                    {group.passageTitle}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {group.reports.length} attempt
                    {group.reports.length > 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Expand/Collapse indicator */}
                <Text style={{ fontSize: 20 }}>{isExpanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {/* Expanded content - List of reports for this passage */}
              {isExpanded && (
                <View style={{ marginTop: 8 }}>
                  <ScrollView
                    style={{ maxHeight: 400 }}
                    nestedScrollEnabled={true}
                  >
                    {group.reports.map((report, reportIndex) => {
                      const totalMiscues = getTotalMiscues(report);

                      return (
                        <View
                          key={report.id}
                          style={{
                            padding: 16,
                            backgroundColor: '#fff',
                            borderRadius: 8,
                            marginBottom: 8,
                            borderWidth: 1,
                            borderColor: '#e0e0e0',
                          }}
                        >
                          {/* Report Date */}
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: '600',
                              marginBottom: 8,
                            }}
                          >
                            {formatDate(report.timestamp)}
                          </Text>

                          {/* Performance Metrics */}
                          <View style={{ marginBottom: 8 }}>
                            <Text style={{ fontSize: 14, marginBottom: 2 }}>
                              <Text style={{ fontWeight: '500' }}>
                                Accuracy:
                              </Text>{' '}
                              {report.accuracyRate.toFixed(1)}%
                            </Text>

                            <Text style={{ fontSize: 14, marginBottom: 2 }}>
                              <Text style={{ fontWeight: '500' }}>
                                Reading Speed:
                              </Text>{' '}
                              {report.wordPerMin} WPM
                            </Text>

                            <Text style={{ fontSize: 14, marginBottom: 2 }}>
                              <Text style={{ fontWeight: '500' }}>
                                Duration:
                              </Text>{' '}
                              {formatDuration(report.recordingDuration)}
                            </Text>

                            <Text style={{ fontSize: 14, marginBottom: 2 }}>
                              <Text style={{ fontWeight: '500' }}>
                                Total Miscues:
                              </Text>{' '}
                              {totalMiscues}
                            </Text>
                          </View>

                          {/* Miscue Details - Only show if there are miscues */}
                          {totalMiscues > 0 && (
                            <View
                              style={{
                                marginTop: 8,
                                borderTopWidth: 1,
                                borderTopColor: '#f0f0f0',
                                paddingTop: 8,
                              }}
                            >
                              <Text
                                style={{ fontWeight: '600', marginBottom: 4 }}
                              >
                                Miscue Details:
                              </Text>

                              {/* Substitution */}
                              {report.substitution !== 'None' && (
                                <View style={{ marginBottom: 4 }}>
                                  <Text style={{ fontWeight: '500' }}>
                                    Substitution (
                                    {getMiscueCount(report, 'substitution')}):
                                  </Text>
                                  <Text
                                    style={{ color: '#666', marginLeft: 8 }}
                                  >
                                    {report.substitution}
                                  </Text>
                                </View>
                              )}

                              {/* Omission */}
                              {report.omission !== 'None' && (
                                <View style={{ marginBottom: 4 }}>
                                  <Text style={{ fontWeight: '500' }}>
                                    Omission (
                                    {getMiscueCount(report, 'omission')}):
                                  </Text>
                                  <Text
                                    style={{ color: '#666', marginLeft: 8 }}
                                  >
                                    {report.omission}
                                  </Text>
                                </View>
                              )}

                              {/* Insertion */}
                              {report.insertion !== 'None' && (
                                <View style={{ marginBottom: 4 }}>
                                  <Text style={{ fontWeight: '500' }}>
                                    Insertion (
                                    {getMiscueCount(report, 'insertion')}):
                                  </Text>
                                  <Text
                                    style={{ color: '#666', marginLeft: 8 }}
                                  >
                                    {report.insertion}
                                  </Text>
                                </View>
                              )}

                              {/* Repetition */}
                              {report.repetition !== 'None' && (
                                <View style={{ marginBottom: 4 }}>
                                  <Text style={{ fontWeight: '500' }}>
                                    Repetition (
                                    {getMiscueCount(report, 'repetition')}):
                                  </Text>
                                  <Text
                                    style={{ color: '#666', marginLeft: 8 }}
                                  >
                                    {report.repetition}
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

                          {/* No miscues message */}
                          {totalMiscues === 0 && (
                            <View style={{ marginTop: 8 }}>
                              <Text
                                style={{
                                  color: '#4CAF50',
                                  fontStyle: 'italic',
                                }}
                              >
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
                    <Text
                      style={{
                        textAlign: 'center',
                        color: '#999',
                        marginTop: 8,
                      }}
                    >
                      -- View more --
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* LOGOUT MODAL */}
        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogoout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

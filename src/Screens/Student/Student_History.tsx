import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import historyStyles from '../../UI_Designs/StudentHistoryStyles';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';
import { getAuth } from '@react-native-firebase/auth';

// ── Performance / Activity components (moved from Student_Profile) ────────────
import StudentActivityTrackingCard from '../../Components/Faculty/StudentView_Status/Student_TimeTrack';
import StudentAccuracyTrendsChart  from '../../Components/Faculty/StudentView_Status/Student_Accuracy_Chart';
import StudentMiscueAnalytics      from '../../Components/Faculty/StudentView_Status/Student_MiscueChart';
import StudentTopMiscuePassageAndWords from '../../Components/Faculty/StudentView_Status/Student_TopPassage&TopWords';
import StudentAlphabetMastery from '../../Components/Faculty/StudentView_Status/StudentAlphabetMastery';
import StudentWordMastery     from '../../Components/Faculty/StudentView_Status/StudentWordMastery';
import { sw, sh, sf } from '../../Utils/responsive';

const auth = getAuth();

// ─── Types ────────────────────────────────────────────────────────────────────
interface GroupedReport {
  passageTitle: string;
  reports: ReportData[];
}

interface ReportData {
  id: string;
  timestamp: any;
  accuracyRate: number;
  wordPerMin: number;
  recordingDuration?: string;
  totalMiscues?: number;
  substitution: string;
  omission: string;
  insertion: string;
  repetition: string;
  substitutionCount?: number;
  omissionCount?: number;
  insertionCount?: number;
  repetitionCount?: number;
  miscues?: any[];
}

type ActiveTab = 'history' | 'performance' | 'activity';

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReadingHistoryScreen() {
  const [groupedReports,   setGroupedReports]   = useState<GroupedReport[]>([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [expandedPassages, setExpandedPassages] = useState<Set<number>>(new Set());
  const [menuVisible,      setMenuVisible]      = useState(false);
  const [logoutVisible,    setLogoutVisible]    = useState(false);

  // ── NEW: tab state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');

  const { handleLogout, handleBackStep, handleNextStep } = useNavigationHelper();

  const toggleMenu       = () => setMenuVisible(v => !v);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogoout   = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout     = () => setLogoutVisible(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) { Alert.alert('Error', 'No authenticated user found'); return; }
      const reports = await MiscueReportController.getStudentReports(user.uid);
      setGroupedReports(groupReportsByPassage(reports));
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      Alert.alert('Error', 'Failed to load reading history');
    } finally {
      setIsLoading(false);
    }
  };

  const groupReportsByPassage = (reports: MiscueReportDocument[]): GroupedReport[] => {
    const groupMap = new Map<string, ReportData[]>();
    reports.forEach(report => {
      const passageTitle = report.passageTitle || 'Unknown Passage';
      if (!groupMap.has(passageTitle)) groupMap.set(passageTitle, []);
      groupMap.get(passageTitle)?.push({
        id:               report.reportId,
        timestamp:        report.createdAt,
        accuracyRate:     report.accuracyRate    || 0,
        wordPerMin:       report.wordPerMin       || 0,
        recordingDuration: report.recordingDuration,
        substitution:     report.substitution    || 'None',
        omission:         report.omission         || 'None',
        insertion:        report.insertion         || 'None',
        repetition:       report.repetition        || 'None',
        miscues:          report.miscues           || [],
        totalMiscues:     (report as any).totalMiscues,
        substitutionCount:(report as any).substitutionCount,
        omissionCount:    (report as any).omissionCount,
        insertionCount:   (report as any).insertionCount,
        repetitionCount:  (report as any).repetitionCount,
      });
    });
    return Array.from(groupMap.entries()).map(([passageTitle, reps]) => ({
      passageTitle,
      reports: reps.sort((a, b) => {
        const A = a.timestamp?.toDate?.() || new Date(0);
        const B = b.timestamp?.toDate?.() || new Date(0);
        return B.getTime() - A.getTime();
      }),
    }));
  };

  const togglePassageExpansion = (index: number) => {
    setExpandedPassages(prev => {
      const s = new Set(prev);
      s.has(index) ? s.delete(index) : s.add(index);
      return s;
    });
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Unknown Date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return 'Invalid Date'; }
  };

  const formatDuration = (duration?: string | number): string => {
    if (!duration && duration !== 0) return 'N/A';
    if (typeof duration === 'string') {
      if (/^\d+:\d{2}$/.test(duration)) return duration;
      const s = parseInt(duration);
      if (!isNaN(s) && s > 0)
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
      return 'N/A';
    }
    if (typeof duration === 'number') {
      if (duration <= 0) return 'N/A';
      return `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
    }
    return 'N/A';
  };

  const getTotalMiscues = (report: ReportData): number => {
    if (report.totalMiscues !== undefined) return report.totalMiscues;
    if (report.miscues && Array.isArray(report.miscues)) return report.miscues.length;
    return (report.substitutionCount || 0) + (report.omissionCount || 0) +
           (report.insertionCount    || 0) + (report.repetitionCount || 0);
  };

  const getTotalAttempts  = () => groupedReports.reduce((s, g) => s + g.reports.length, 0);
  const getAverageAccuracy = () => {
    const all = groupedReports.flatMap(g => g.reports);
    if (!all.length) return '0';
    return (all.reduce((s, r) => s + r.accuracyRate, 0) / all.length).toFixed(1);
  };
  const getBestWPM = () => {
    const all = groupedReports.flatMap(g => g.reports);
    return all.length ? Math.max(...all.map(r => r.wordPerMin || 0)) : 0;
  };

  const uid = auth.currentUser?.uid || '';

  // ── Shared header (used in both loading/empty/main states) ─────────────────
  const Header = () => (
    <View>
      <View style={upperNav.header}>
        <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
          <Image
            style={upperNav.backButtonIcon}
            source={require('../../../assets/icons/BackButton-icon.png')}
          />
        </TouchableOpacity>
        <Svg height={60} width={220}>
          <SvgText
            x={110} y={35} fontSize={23}
            fontFamily="DynaPuff-Bold" textAnchor="middle"
            fill="none" stroke="#D7E9FF" strokeWidth={8} strokeLinejoin="round"
          >
            Reading History
          </SvgText>
          <SvgText
            x={110} y={35} fontSize={23}
            fontFamily="DynaPuff-Bold" textAnchor="middle"
            fill="#3B7FC9"
          >
            Reading History
          </SvgText>
        </Svg>
        <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
          <Image style={upperNav.menuIcon} source={require('../../../assets/icons/Menu-icon.png')} />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={upperNav.dropdownMenu}>
          <TouchableOpacity onPress={handleLogoutPress} style={upperNav.logoutButton}>
            <Image source={require('../../../assets/icons/Logout-icon.png')} style={upperNav.logoutIcon} />
            <Text style={upperNav.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      {menuVisible && (
        <TouchableOpacity style={upperNav.closeMenu} onPress={() => setMenuVisible(false)} activeOpacity={1} />
      )}
    </View>
  );

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={historyStyles.container}>
        <View style={historyStyles.insideContainer}>
          <BubbleBackground />
          <View style={historyStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B7FC9" />
            <Text style={historyStyles.loadingText}>Loading reading history...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={historyStyles.container}>
      <View style={historyStyles.insideContainer}>
        <BubbleBackground />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={historyStyles.scrollContent}
        >
          {/* Header */}
          <Header />

          {/* ── TAB BAR ────────────────────────────────────────────────────── */}
          <View style={tabStyles.tabBar}>
            {(
              [
                { key: 'history',     label: '📋 History'     },
                { key: 'performance', label: '📊 Performance' },
                { key: 'activity',    label: '⏱ Activity'    },
              ] as { key: ActiveTab; label: string }[]
            ).map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[tabStyles.tab, activeTab === tab.key && tabStyles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[tabStyles.tabText, activeTab === tab.key && tabStyles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ══════════════════════════════════════════════════════════════════
              HISTORY TAB — existing reading history content unchanged
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <>
              {groupedReports.length === 0 ? (
                /* Empty state */
                <View style={historyStyles.emptyContainer}>
                  <View style={historyStyles.emptyIconContainer}>
                    <Text style={historyStyles.emptyIcon}>📚</Text>
                  </View>
                  <Text style={historyStyles.emptyTitle}>No Reading History Yet</Text>
                  <Text style={historyStyles.emptyMessage}>
                    You haven't completed any reading activities yet. Start reading
                    passages to track your progress and see your improvement over time!
                  </Text>
                  <TouchableOpacity
                    style={historyStyles.emptyButton}
                    onPress={() => handleNextStep('StudentTabs' as any, { screen: 'StudentLibrary' } as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={historyStyles.emptyButtonText}>Start Reading</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Summary stats bar */}
                  <View style={historyStyles.statsBar}>
                    <View style={historyStyles.statItem}>
                      <Text style={historyStyles.statValue}>{groupedReports.length}</Text>
                      <Text style={historyStyles.statLabel}>Passages</Text>
                    </View>
                    <View style={historyStyles.statDivider} />
                    <View style={historyStyles.statItem}>
                      <Text style={historyStyles.statValue}>{getTotalAttempts()}</Text>
                      <Text style={historyStyles.statLabel}>Attempts</Text>
                    </View>
                    <View style={historyStyles.statDivider} />
                    <View style={historyStyles.statItem}>
                      <Text style={historyStyles.statValue}>{getAverageAccuracy()}%</Text>
                      <Text style={historyStyles.statLabel}>Avg. Accuracy</Text>
                    </View>
                    <View style={historyStyles.statDivider} />
                    <View style={historyStyles.statItem}>
                      <Text style={historyStyles.statValue}>{getBestWPM()}</Text>
                      <Text style={historyStyles.statLabel}>Best WPM</Text>
                    </View>
                  </View>

                  {/* Passage list */}
                  <View style={historyStyles.contentContainer}>
                    <Text style={historyStyles.sectionLabel}>Your Reading Sessions</Text>

                    {groupedReports.map((group, passageIndex) => {
                      const isExpanded = expandedPassages.has(passageIndex);
                      return (
                        <View
                          key={passageIndex}
                          style={[
                            historyStyles.passageCard,
                            isExpanded && historyStyles.passageCardExpanded,
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => togglePassageExpansion(passageIndex)}
                            style={historyStyles.passageHeader}
                            activeOpacity={0.7}
                          >
                            <View style={historyStyles.passageIconContainer}>
                              <Text style={historyStyles.passageIconText}>📖</Text>
                            </View>
                            <View style={historyStyles.passageInfo}>
                              <Text style={historyStyles.passageTitle} numberOfLines={2}>
                                {group.passageTitle}
                              </Text>
                              <Text style={historyStyles.passageAttempts}>
                                {group.reports.length} attempt{group.reports.length > 1 ? 's' : ''}
                              </Text>
                            </View>
                            <View style={historyStyles.passageArrowContainer}>
                              <Text style={historyStyles.passageArrow}>
                                {isExpanded ? '▼' : '▶'}
                              </Text>
                            </View>
                          </TouchableOpacity>

                          {isExpanded && (
                            <View style={historyStyles.reportsContainer}>
                              <ScrollView
                                style={historyStyles.nestedScroll}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                              >
                                {group.reports.map((report, reportIndex) => {
                                  const totalMiscues = getTotalMiscues(report);
                                  return (
                                    <View key={report.id} style={historyStyles.reportCard}>
                                      <View style={historyStyles.reportDateRow}>
                                        <Text style={historyStyles.reportDate}>
                                          {formatDate(report.timestamp)}
                                        </Text>
                                        <View style={historyStyles.reportAttemptBadge}>
                                          <Text style={historyStyles.reportAttemptText}>
                                            #{reportIndex + 1}
                                          </Text>
                                        </View>
                                      </View>

                                      <View style={historyStyles.metricsGrid}>
                                        <View style={historyStyles.metricCard}>
                                          <Text style={historyStyles.metricValue}>{report.accuracyRate.toFixed(1)}%</Text>
                                          <Text style={historyStyles.metricLabel}>Accuracy</Text>
                                        </View>
                                        <View style={historyStyles.metricCard}>
                                          <Text style={historyStyles.metricValue}>{report.wordPerMin}</Text>
                                          <Text style={historyStyles.metricLabel}>Words / Min</Text>
                                        </View>
                                        <View style={historyStyles.metricCard}>
                                          <Text style={historyStyles.metricValue}>{formatDuration(report.recordingDuration)}</Text>
                                          <Text style={historyStyles.metricLabel}>Duration</Text>
                                        </View>
                                        <View style={historyStyles.metricCard}>
                                          <Text style={historyStyles.metricValue}>{totalMiscues}</Text>
                                          <Text style={historyStyles.metricLabel}>Total Miscues</Text>
                                        </View>
                                      </View>

                                      {totalMiscues > 0 && (
                                        <View style={historyStyles.miscueSection}>
                                          <Text style={historyStyles.miscueSectionTitle}>Miscue Breakdown</Text>
                                          {report.substitution !== 'None' && (
                                            <View style={historyStyles.miscueRow}>
                                              <View style={[historyStyles.miscueTag, historyStyles.miscueTagSubstitution]}>
                                                <Text style={historyStyles.miscueTagText}>Substitution</Text>
                                              </View>
                                              <Text style={historyStyles.miscueDetail}>{report.substitution}</Text>
                                            </View>
                                          )}
                                          {report.omission !== 'None' && (
                                            <View style={historyStyles.miscueRow}>
                                              <View style={[historyStyles.miscueTag, historyStyles.miscueTagOmission]}>
                                                <Text style={historyStyles.miscueTagText}>Omission</Text>
                                              </View>
                                              <Text style={historyStyles.miscueDetail}>{report.omission}</Text>
                                            </View>
                                          )}
                                          {report.insertion !== 'None' && (
                                            <View style={historyStyles.miscueRow}>
                                              <View style={[historyStyles.miscueTag, historyStyles.miscueTagInsertion]}>
                                                <Text style={historyStyles.miscueTagText}>Insertion</Text>
                                              </View>
                                              <Text style={historyStyles.miscueDetail}>{report.insertion}</Text>
                                            </View>
                                          )}
                                          {report.repetition !== 'None' && (
                                            <View style={historyStyles.miscueRow}>
                                              <View style={[historyStyles.miscueTag, historyStyles.miscueTagRepetition]}>
                                                <Text style={historyStyles.miscueTagText}>Repetition</Text>
                                              </View>
                                              <Text style={historyStyles.miscueDetail}>{report.repetition}</Text>
                                            </View>
                                          )}
                                        </View>
                                      )}

                                      {totalMiscues === 0 && (
                                        <View style={historyStyles.perfectBadge}>
                                          <Text style={historyStyles.perfectIcon}>🌟</Text>
                                          <Text style={historyStyles.perfectText}>
                                            Perfect reading! No miscues detected.
                                          </Text>
                                        </View>
                                      )}
                                    </View>
                                  );
                                })}
                              </ScrollView>

                              {group.reports.length > 5 && (
                                <Text style={historyStyles.viewMoreText}>
                                  Scroll to see more attempts
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PERFORMANCE TAB — moved from Student_Profile
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'performance' && (
            <View style={tabStyles.tabContent}>
              <View style={tabStyles.section}>
                <StudentAlphabetMastery studentId={uid} />
              </View>
              <View style={tabStyles.section}>
                <StudentWordMastery studentId={uid} />
              </View>
              <View style={tabStyles.section}>
                <StudentAccuracyTrendsChart studentId={uid} />
              </View>
              <View style={tabStyles.section}>
                <StudentMiscueAnalytics studentId={uid} />
                <StudentTopMiscuePassageAndWords studentId={uid} />
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              ACTIVITY TAB — moved from Student_Profile
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'activity' && (
            <View style={tabStyles.tabContent}>
              <View style={tabStyles.section}>
                <Text style={tabStyles.sectionTitle}>Activity Tracking</Text>
                <StudentActivityTrackingCard studentId={uid} />
              </View>
            </View>
          )}

        </ScrollView>

        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogoout}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Tab styles (self-contained, don't touch StudentHistoryStyles) ─────────────
const tabStyles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: sw(16),
    marginTop: sh(12),
    marginBottom: sh(4),
    backgroundColor: '#fff',
    borderRadius: sw(12),
    padding: sw(5),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.08,
    shadowRadius: sw(3),
  },
  tab: {
    flex: 1,
    paddingVertical: sh(10),
    alignItems: 'center',
    borderRadius: sw(8),
  },
  tabActive: {
    backgroundColor: '#3B7FC9',
  },
  tabText: {
    fontSize: sf(13),
    fontWeight: '600',
    color: '#64748b',
    fontFamily: 'Satoshi-Bold',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabContent: {
    paddingHorizontal: sw(12),
    paddingTop: sh(8),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: sw(14),
    padding: sw(14),
    marginBottom: sh(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.07,
    shadowRadius: sw(3),
  },
  sectionTitle: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#1e293b',
    marginBottom: sh(10),
  },
});
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import FadeSlideIn from '../../Components/GlobalUse/FadeSlideIn';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import historyStyles from '../../UI_Designs/StudentHistoryStyles';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { DateRangeFilter, DateBounds } from '../../Components/GlobalUse/DateRangeFilter';

// ── Performance / Activity components (moved from Student_Profile) ────────────
import StudentAccuracyTrendsChart from '../../Components/Faculty/StudentView_Status/Student_Accuracy_Chart';
import StudentMiscueInsights from '../../Components/Faculty/StudentView_Status/Student_MiscueInsights';
// import StudentAlphabetMastery from '../../Components/Faculty/StudentView_Status/StudentAlphabetMastery';
import StudentWordMastery from '../../Components/Faculty/StudentView_Status/StudentWordMastery';
import StudentCompletionProgress from '../../Components/Faculty/StudentView_Status/StudentCompletionProgress';
import { Icon, IconName } from '../../Components/GlobalUse/Icon';
import { sw, sh, sf } from '../../Utils/responsive';
import { StudentColors } from '../../Utilities/Theme';
import { StudentHeader } from '../../Components/Student/StudentHeader';

const auth = getAuth();

const C = {
  white: '#ffffff',
  darkBlue: '#163F6C',
  ink: '#1b2e23',
};

const headerStyles = StyleSheet.create({
  menuBtn: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  backBtn: {
    width: 45, height: 45, borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40, fontFamily: 'Nunito-Bold',
    color: C.white, lineHeight: 28, marginLeft: -2, paddingBottom: 2
  },
  aboutRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: sw(16), paddingVertical: sh(14),
  },
  aboutText: {
    fontSize: sf(15), fontFamily: 'Nunito-Bold',
    color: StudentColors.slate, marginLeft: sw(12),
  },
  dropdownDivider: {
    height: 1, marginHorizontal: sw(12),
    backgroundColor: '#E3F0E7',
  },
});


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
type ActiveTab = 'completion' | 'sessions' | 'performance' | 'history';

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReadingHistoryScreen() {
  const [rawReports, setRawReports] = useState<MiscueReportDocument[]>([]);
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPassages, setExpandedPassages] = useState<Set<number>>(new Set());
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // ── NEW: tab state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('completion');
  const [gradeLevel, setGradeLevel] = useState<number | undefined>(undefined);

  // ── History & Performance filter state ──────────────────────────────────────
  const [historyBounds, setHistoryBounds] = useState<DateBounds | null>(null);
  const [perfBounds, setPerfBounds] = useState<DateBounds | null>(null);

  // Fetch the student's grade level once for the benchmark card
  useEffect(() => {
    let isMounted = true;
    const fetchGradeLevel = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(getFirestore(), 'users', user.uid));
        if (snap.exists() && isMounted) {
          const data = snap.data() as any;
          setGradeLevel(data?.studentData?.gradeLevel ?? undefined);
        }
      } catch {
        // Non-critical — benchmark card is simply hidden if unavailable
      }
    };
    fetchGradeLevel();
    return () => { isMounted = false; };
  }, []);

  const { handleLogout, handleBackStep, handleNextStep } = useNavigationHelper();

  const toggleMenu = () => setMenuVisible(v => !v);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogoout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      if (isMountedRef.current) setIsLoading(true);
      const user = auth.currentUser;
      if (!user) { Alert.alert('Error', 'No authenticated user found'); return; }
      const reports = await MiscueReportController.getStudentReports(user.uid);
      if (isMountedRef.current) {
        setRawReports(reports);
        setGroupedReports(groupReportsByPassage(reports));
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch reports:', error);
        Alert.alert('Error', 'Failed to load reading history');
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const groupReportsByPassage = (reports: MiscueReportDocument[]): GroupedReport[] => {
    const groupMap = new Map<string, ReportData[]>();
    reports.forEach(report => {
      const passageTitle = report.passageTitle || 'Unknown Passage';
      if (!groupMap.has(passageTitle)) groupMap.set(passageTitle, []);
      groupMap.get(passageTitle)?.push({
        id: report.reportId,
        timestamp: report.createdAt,
        accuracyRate: report.accuracyRate || 0,
        wordPerMin: report.wordPerMin || 0,
        recordingDuration: report.recordingDuration,
        substitution: report.substitution || 'None',
        omission: report.omission || 'None',
        insertion: report.insertion || 'None',
        repetition: report.repetition || 'None',
        miscues: report.miscues || [],
        totalMiscues: (report as any).totalMiscues,
        substitutionCount: (report as any).substitutionCount,
        omissionCount: (report as any).omissionCount,
        insertionCount: (report as any).insertionCount,
        repetitionCount: (report as any).repetitionCount,
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
      (report.insertionCount || 0) + (report.repetitionCount || 0);
  };



  // ── Filtered reports (client-side, no extra Firestore calls) ─────────────
  const filteredReports = useMemo(() => {
    if (!historyBounds) return groupedReports;
    const filtered: GroupedReport[] = [];
    for (const group of groupedReports) {
      const matchingReports = group.reports.filter(r => {
        try {
          const d: Date = r.timestamp?.toDate?.() ?? new Date(r.timestamp);
          return d >= historyBounds.start && d <= historyBounds.end;
        } catch { return false; }
      });
      if (matchingReports.length > 0) {
        filtered.push({ passageTitle: group.passageTitle, reports: matchingReports });
      }
    }
    return filtered;
  }, [groupedReports, historyBounds]);

  // Summary stats — derived from filtered data
  const getTotalAttempts = () => filteredReports.reduce((s, g) => s + g.reports.length, 0);
  const getAverageAccuracy = () => {
    const all = filteredReports.flatMap(g => g.reports);
    if (!all.length) return '0';
    return (all.reduce((s, r) => s + r.accuracyRate, 0) / all.length).toFixed(1);
  };
  const getBestWPM = () => {
    const all = filteredReports.flatMap(g => g.reports);
    return all.length ? Math.max(...all.map(r => r.wordPerMin || 0)) : 0;
  };

  const uid = auth.currentUser?.uid || '';

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
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchReports}
              colors={['#3B7FC9']}
              tintColor="#3B7FC9"
            />
          }
        >
          {/* Header */}
          <StudentHeader 
            title="Reading History"
            onBackPress={handleBackStep}
            onAboutPress={() => handleNextStep('About')}
            onLogoutPress={() => setLogoutVisible(true)}
          />
          
          {/* ── TAB BAR ────────────────────────────────────────────────────── */}
          <FadeSlideIn delay={60}>
            <View style={tabStyles.tabGrid}>
              {(
                [
                  { key: 'completion', icon: 'progress', label: 'Progress' },
                  { key: 'sessions', icon: 'sessions', label: 'Sessions' },
                  { key: 'performance', icon: 'analytics', label: 'Analytics' },
                  { key: 'history', icon: 'history', label: 'History' },
                ] as { key: ActiveTab; icon: IconName; label: string }[]
              ).map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[tabStyles.tab, isActive && tabStyles.tabActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name={tab.icon}
                      size={sf(18)}
                      color={isActive ? '#ffffff' : '#388E3C'}
                      filled={isActive}
                    />
                    <Text style={[tabStyles.tabText, isActive && tabStyles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FadeSlideIn>

          {/* ══════════════════════════════════════════════════════════════════
              HISTORY TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <>
              {/* ── Filter Bar ──────────────────────────────────────────── */}
              <FadeSlideIn delay={100}>
                <View style={[tabStyles.section, { marginHorizontal: sw(16) }]}>
                  <Text style={tabStyles.sectionTitle}>Reading History Filter</Text>
                  <DateRangeFilter onRangeChange={setHistoryBounds} />
                </View>
              </FadeSlideIn>

              {filteredReports.length === 0 ? (
                /* Empty state */
                <FadeSlideIn delay={120}>
                  <View style={historyStyles.emptyContainer}>
                    <View style={historyStyles.emptyIconContainer}>
                      <Icon name="bookStack" size={sf(36)} color="#388E3C" />
                    </View>
                    <Text style={historyStyles.emptyTitle}>No Reading History</Text>
                    <Text style={historyStyles.emptyMessage}>
                      No reading sessions found for this period. Try selecting a different
                      time range or tap the period label to jump back to today.
                    </Text>
                    <TouchableOpacity
                      style={historyStyles.emptyButton}
                      onPress={() => setHistoryBounds(null)}
                      activeOpacity={0.8}
                    >
                      <Text style={historyStyles.emptyButtonText}>Clear Filter</Text>
                    </TouchableOpacity>
                  </View>
                </FadeSlideIn>
              ) : (
                <>
                  {/* Summary stats bar */}
                  <FadeSlideIn delay={120}>
                    <View style={historyStyles.statsBar}>
                      <View style={historyStyles.statItem}>
                        <Text style={historyStyles.statValue}>{filteredReports.length}</Text>
                        <Text style={historyStyles.statLabel}>Passages</Text>
                      </View>
                      <View style={historyStyles.statDivider} />
                      <View style={historyStyles.statItem}>
                        <Text style={historyStyles.statValue}>{getTotalAttempts()}</Text>
                        <Text style={historyStyles.statLabel}>Attempts</Text>
                      </View>
                    </View>
                  </FadeSlideIn>

                  {/* Passage list */}
                  <View style={historyStyles.contentContainer}>
                    <FadeSlideIn delay={180}>
                      <Text style={historyStyles.sectionLabel}>Your Reading Sessions</Text>
                    </FadeSlideIn>

                    {filteredReports.map((group, passageIndex) => {
                      const isExpanded = expandedPassages.has(passageIndex);
                      return (
                        <FadeSlideIn key={passageIndex} delay={220 + passageIndex * 60}>
                          <View
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
                                <Icon name="bookOpen" size={sf(20)} color="#388E3C" filled />
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
                                <FlatList
                                  data={group.reports}
                                  keyExtractor={item => item.id}
                                  style={historyStyles.nestedScroll}
                                  showsVerticalScrollIndicator={false}
                                  renderItem={({ item: report, index: reportIndex }: { item: any, index: number }) => {
                                    const totalMiscues = getTotalMiscues(report);
                                    return (
                                      <View style={historyStyles.reportCard}>
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
                                            <Icon name="star" size={sf(16)} color="#15803D" filled />
                                            <Text style={historyStyles.perfectText}>
                                              Perfect reading! No miscues detected.
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                    );
                                  }}
                                />

                                {group.reports.length > 5 && (
                                  <Text style={historyStyles.viewMoreText}>
                                    Scroll to see more attempts
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        </FadeSlideIn>
                      );
                    })}
                  </View>
                </>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              COMPLETION TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'completion' && (
            <View style={tabStyles.tabContent}>
              <FadeSlideIn delay={80}>
                <View style={tabStyles.section}>
                  <Text style={tabStyles.sectionTitle}>Completion Progress</Text>
                  <StudentCompletionProgress studentId={uid} />
                </View>
              </FadeSlideIn>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SESSIONS TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'sessions' && (
            <View style={tabStyles.tabContent}>
              {/* <FadeSlideIn delay={80}>
                <View style={tabStyles.section}>
                  <StudentAlphabetMastery studentId={uid} />
                </View>
              </FadeSlideIn> */}
              <FadeSlideIn delay={160}>
                <View style={tabStyles.section}>
                  <StudentWordMastery studentId={uid} />
                </View>
              </FadeSlideIn>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PASSAGE PERFORMANCE TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'performance' && (
            <View style={tabStyles.tabContent}>
              {/* Shared performance filter bar */}
              {(() => {
                const activeDateKeys = new Set<string>();
                for (const group of groupedReports) {
                  for (const r of group.reports) {
                    try {
                      const d: Date = r.timestamp?.toDate?.() ?? new Date(r.timestamp);
                      activeDateKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
                    } catch { /* skip */ }
                  }
                }

                return (
                  <FadeSlideIn delay={60}>
                    <View style={tabStyles.section}>
                      <Text style={tabStyles.sectionTitle}>Performance Analytics Filter</Text>
                      <DateRangeFilter 
                        onRangeChange={setPerfBounds} 
                        activeDates={activeDateKeys} 
                      />
                    </View>
                  </FadeSlideIn>
                );
              })()}

              <FadeSlideIn delay={80}>
                <View style={tabStyles.section}>
                  <StudentAccuracyTrendsChart studentId={uid} role="student" timeRange={perfBounds?.range ?? 'week'} anchor={perfBounds?.start ?? new Date()} startDate={perfBounds?.start} endDate={perfBounds?.end} prefetchedReports={rawReports} />
                </View>
              </FadeSlideIn>
              <FadeSlideIn delay={160}>
                <View style={tabStyles.section}>
                  <StudentMiscueInsights studentId={uid} role="student" timeRange={perfBounds?.range ?? 'week'} anchor={perfBounds?.start ?? new Date()} startDate={perfBounds?.start} endDate={perfBounds?.end} prefetchedReports={rawReports} />
                </View>
              </FadeSlideIn>
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

// ─── Tab styles ─────────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: sw(16),
    marginTop: sh(8),
  },
  tabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: sw(16),
    marginTop: sh(12),
    marginBottom: sh(4),
    backgroundColor: '#E8F5E9',
    borderRadius: sw(14),
    padding: sw(4),
    gap: sw(4),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.08,
    shadowRadius: sw(3),
  },
  tab: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sh(10),
    paddingHorizontal: sw(6),
    borderRadius: sw(10),
    gap: sw(5),
  },
  tabActive: {
    backgroundColor: '#388E3C',
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.22,
    shadowRadius: sw(2.22),
  },
  tabIcon: {
    fontSize: sf(16),
    lineHeight: sf(20),
  },
  tabText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-ExtraBold',
    color: '#388E3C',
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
    fontFamily: 'Nunito-Bold',
    color: '#1F2937',
    marginBottom: sh(10),
  },
});
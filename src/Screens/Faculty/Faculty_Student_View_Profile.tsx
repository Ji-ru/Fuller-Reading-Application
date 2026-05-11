import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import upperNav from '../../UI_Designs/UpperNavigation';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';
import facultyStudentView from '../../UI_Designs/FacultyStudentViewStyles';
import { sw, sh, sf } from '../../Utils/responsive';

// --- Sub-components (Tabs) ---
import StudentActivityTrackingCard from '../../Components/Faculty/StudentView_Status/Student_TimeTrack';
import StudentAccuracyTrendsChart from '../../Components/Faculty/StudentView_Status/Student_Accuracy_Chart';
import StudentMiscueInsights from '../../Components/Faculty/StudentView_Status/Student_MiscueInsights';
import StudentAlphabetMastery from '../../Components/Faculty/StudentView_Status/StudentAlphabetMastery';
import StudentWordMastery from '../../Components/Faculty/StudentView_Status/StudentWordMastery';
import StudentCompletionProgress from '../../Components/Faculty/StudentView_Status/StudentCompletionProgress';
import StudentTotalActivityToday from '../../Components/Faculty/StudentView_Status/StudentTotalActivityToday';
import FadeSlideIn from '../../Components/GlobalUse/FadeSlideIn';
import { DateRangeFilter, DateBounds } from '../../Components/GlobalUse/DateRangeFilter';
import ExportExcel from '../../Components/GlobalUse/ExportExcel';
import ExportPdf from '../../Components/GlobalUse/ExportPdf';
import { Icon, IconName } from '../../Components/GlobalUse/Icon';
import { FacultyColors } from '../../Utilities/Theme';

const C = {
  ink: '#1b2e23',
  white: '#ffffff',
  coral: '#e74c3c',
  green: '#2ca96a',
  darkBlue: '#163F6C',
  slate: '#9CA3AF',
  inkLight: '#6B7280',
};

const headerStyles = StyleSheet.create({
  backBtn: {
    width: sw(45), height: sh(45), borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: sf(40), fontFamily: 'Nunito-Bold',
    color: C.white, lineHeight: sh(28), marginLeft: sw(-2), paddingBottom: sh(2)
  },
});

// --- Types ---
type RouteParams = {
  StudentViewProfile: {
    studentId: string;
    studentName: string;
    readingLevel: string;
    gradeLevel?: number;
  };
};

type ActiveTab = 'completion' | 'sessions' | 'performance' | 'history';

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

export default function StudentViewProfile() {
  const route = useRoute<RouteProp<RouteParams, 'StudentViewProfile'>>();
  const { studentId, studentName, readingLevel, gradeLevel } = route.params;
  const { handleBackStep } = useNavigationHelper();

  // --- Tabs State ---
  const [activeTab, setActiveTab] = useState<ActiveTab>('completion');
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [expandedPassages, setExpandedPassages] = useState<Set<number>>(new Set());

  // --- History/Performance Filter State (driven by DateRangeFilter) ---
  const [historyBounds, setHistoryBounds] = useState<DateBounds | null>(null);
  const [perfBounds, setPerfBounds] = useState<DateBounds | null>(null);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const reports = await MiscueReportController.getStudentReports(studentId);
      setGroupedReports(groupReportsByPassage(reports));
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      Alert.alert('Error', 'Failed to load reading history');
    } finally {
      setIsLoadingReports(false);
    }
  };

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

  const getTotalAttempts = () => filteredHistoryReports.reduce((s, g) => s + g.reports.length, 0);
  const getAverageAccuracy = () => {
    const all = filteredHistoryReports.flatMap(g => g.reports);
    if (!all.length) return '0';
    return (all.reduce((s, r) => s + r.accuracyRate, 0) / all.length).toFixed(1);
  };
  const getBestWPM = () => {
    const all = filteredHistoryReports.flatMap(g => g.reports);
    return all.length ? Math.max(...all.map(r => r.wordPerMin || 0)) : 0;
  };

  const filteredHistoryReports = useMemo(() => {
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

  return (
    <SafeAreaView style={facultyStudentView.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={facultyStudentView.innerContainer}>
          <BubbleBackground />

          {/* HEADER */}
          <View style={{ zIndex: 100 }}>
            <View style={upperNav.header}>
              <TouchableOpacity style={headerStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
                <Text style={headerStyles.backArrowText}>‹</Text>
              </TouchableOpacity>
              <Svg height={60} width={240}>
                <SvgText
                  x={120} y={35}
                  fontSize={22} fontFamily="Nunito-Black" textAnchor="middle"
                  fill="none" stroke="#E8F5E9" strokeWidth={8} strokeLinejoin='round'
                >
                  Student Profile
                </SvgText>
                <SvgText
                  x={120} y={35}
                  fontSize={22} fontFamily="Nunito-Black" textAnchor="middle"
                  fill="#1B5E20"
                >
                  Student Profile
                </SvgText>
              </Svg>
              <View style={{ width: 45 }} />
            </View>
          </View>

          {/* STUDENT SUMMARY */}
          <View style={facultyStudentView.profileHeader}>
            <View style={facultyStudentView.profileAvatarCircle}>
              <Text style={facultyStudentView.profileAvatarText}>
                {studentName
                  .split(' ')
                  .map((n: string) => n.charAt(0))
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>

            {/* Preserved Block as requested */}
            <View style={facultyStudentView.profileInfoColumn}>
              <Text style={facultyStudentView.studentName}>{studentName}</Text>
              {/* <View style={facultyStudentView.readingLevelBadge}>
                <View style={facultyStudentView.readingLevelDot} />
                <Text style={facultyStudentView.readingLevelText}>
                  Level {readingLevel}
                </Text>
              </View> */}
            </View>
          </View>

          {/* TAB SWITCHER (Reused from Student_History) */}
          <FadeSlideIn delay={60}>
            <View style={tabStyles.exportRow}>
              <ExportExcel studentName="Student" />
              <ExportPdf studentId={studentId} gradeLevel={gradeLevel} />
            </View>
            {/* <View style={tabStyles.tabGrid}></View> */}
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
                      color={isActive ? '#ffffff' : FacultyColors.primary}
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

          {/* TAB CONTENT */}
          <View style={tabStyles.tabContent}>

            {/* --- COMPLETION TAB --- */}
            {activeTab === 'completion' && (
              <FadeSlideIn delay={80}>
                <View style={tabStyles.section}>
                  <Text style={tabStyles.sectionTitle}>Completion Progress</Text>
                  <StudentCompletionProgress studentId={studentId} />
                </View>
              </FadeSlideIn>
            )}

            {/* --- SESSIONS TAB --- */}
            {activeTab === 'sessions' && (
              <>
                <FadeSlideIn delay={80}>
                  <View style={tabStyles.section}>
                    <Text style={tabStyles.sectionTitle}>Total Activity Today</Text>
                    <StudentTotalActivityToday studentId={studentId} />
                  </View>
                </FadeSlideIn>
                <FadeSlideIn delay={160}>
                  <View style={tabStyles.section}>
                    <Text style={tabStyles.sectionTitle}>Alphabet Mastery</Text>
                    <StudentAlphabetMastery studentId={studentId} />
                  </View>
                </FadeSlideIn>
                <FadeSlideIn delay={240}>
                  <View style={tabStyles.section}>
                    <Text style={tabStyles.sectionTitle}>Word Mastery</Text>
                    <StudentWordMastery studentId={studentId} />
                  </View>
                </FadeSlideIn>
              </>
            )}

            {/* --- PERFORMANCE TAB --- */}
            {activeTab === 'performance' && (
              <>
                <FadeSlideIn delay={60}>
                  <View style={tabStyles.section}>
                    <Text style={tabStyles.sectionTitle}>Performance Analytics</Text>
                    <DateRangeFilter onRangeChange={setPerfBounds} />
                  </View>
                </FadeSlideIn>
                <FadeSlideIn delay={120}>
                  <View style={tabStyles.section}>
                    <StudentMiscueInsights studentId={studentId} role="faculty" timeRange={perfBounds?.range ?? 'week'} anchor={perfBounds?.start ?? new Date()} startDate={perfBounds?.start} endDate={perfBounds?.end} />
                  </View>
                </FadeSlideIn>
                <FadeSlideIn delay={180}>
                  <View style={tabStyles.section}>
                    <StudentAccuracyTrendsChart studentId={studentId} gradeLevel={gradeLevel} role="faculty" timeRange={perfBounds?.range ?? 'week'} anchor={perfBounds?.start ?? new Date()} startDate={perfBounds?.start} endDate={perfBounds?.end} />
                  </View>
                </FadeSlideIn>
              </>
            )}

            {/* --- HISTORY TAB --- */}
            {activeTab === 'history' && (
              <>
                <FadeSlideIn delay={60}>
                  <View style={tabStyles.section}>
                    <Text style={tabStyles.sectionTitle}>Reading History Filter</Text>
                    <DateRangeFilter onRangeChange={setHistoryBounds} />
                  </View>
                </FadeSlideIn>

                {isLoadingReports ? (
                  <ActivityIndicator size="large" color="#008443" style={{ marginTop: 40 }} />
                ) : filteredHistoryReports.length === 0 ? (
                  <FadeSlideIn delay={120}>
                    <View style={historyTabStyles.emptyContainer}>
                      <View style={historyTabStyles.emptyIconContainer}>
                        <Text style={historyTabStyles.emptyIcon}>📚</Text>
                      </View>
                      <Text style={historyTabStyles.emptyTitle}>No Reading History</Text>
                      <Text style={historyTabStyles.emptyMessage}>
                        No reading sessions found for this period. Try selecting a different
                        time range or tap the period label to jump back to today.
                      </Text>
                      <TouchableOpacity
                        style={historyTabStyles.emptyButton}
                        onPress={() => setHistoryBounds(null)}
                        activeOpacity={0.8}
                      >
                        <Text style={historyTabStyles.emptyButtonText}>Go to Today</Text>
                      </TouchableOpacity>
                    </View>
                  </FadeSlideIn>
                ) : (
                  <>
                    <FadeSlideIn delay={120}>
                      <View style={historyTabStyles.statsBar}>
                        <View style={historyTabStyles.statItem}>
                          <Text style={historyTabStyles.statValue}>{filteredHistoryReports.length}</Text>
                          <Text style={historyTabStyles.statLabel}>Passages</Text>
                        </View>
                        <View style={historyTabStyles.statDivider} />
                        <View style={historyTabStyles.statItem}>
                          <Text style={historyTabStyles.statValue}>{getTotalAttempts()}</Text>
                          <Text style={historyTabStyles.statLabel}>Attempts</Text>
                        </View>
                        <View style={historyTabStyles.statDivider} />
                        <View style={historyTabStyles.statItem}>
                          <Text style={historyTabStyles.statValue}>{getAverageAccuracy()}%</Text>
                          <Text style={historyTabStyles.statLabel}>Avg. Accuracy</Text>
                        </View>
                        <View style={historyTabStyles.statDivider} />
                        <View style={historyTabStyles.statItem}>
                          <Text style={historyTabStyles.statValue}>{getBestWPM()}</Text>
                          <Text style={historyTabStyles.statLabel}>Best WPM</Text>
                        </View>
                      </View>
                    </FadeSlideIn>

                    <View style={historyTabStyles.contentContainer}>
                      <FadeSlideIn delay={180}>
                        <Text style={historyTabStyles.sectionLabel}>Reading Sessions</Text>
                      </FadeSlideIn>

                      {filteredHistoryReports.map((group, passageIndex) => {
                        const isExpanded = expandedPassages.has(passageIndex);
                        return (
                          <FadeSlideIn key={passageIndex} delay={220 + passageIndex * 60}>
                            <View style={[historyTabStyles.passageCard, isExpanded && historyTabStyles.passageCardExpanded]}>
                              <TouchableOpacity
                                onPress={() => togglePassageExpansion(passageIndex)}
                                style={historyTabStyles.passageHeader}
                                activeOpacity={0.7}
                              >
                                <View style={historyTabStyles.passageIconContainer}>
                                  <Text style={historyTabStyles.passageIconText}>📖</Text>
                                </View>
                                <View style={historyTabStyles.passageInfo}>
                                  <Text style={historyTabStyles.passageTitle} numberOfLines={2}>
                                    {group.passageTitle}
                                  </Text>
                                  <Text style={historyTabStyles.passageAttempts}>
                                    {group.reports.length} attempt{group.reports.length > 1 ? 's' : ''}
                                  </Text>
                                </View>
                                <View style={historyTabStyles.passageArrowContainer}>
                                  <Text style={historyTabStyles.passageArrow}>{isExpanded ? '▼' : '▶'}</Text>
                                </View>
                              </TouchableOpacity>

                              {isExpanded && (
                                <View style={historyTabStyles.reportsContainer}>
                                  <ScrollView
                                    style={historyTabStyles.nestedScroll}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={false}
                                  >
                                    {group.reports.map((report, reportIndex) => {
                                      const totalMiscues = getTotalMiscues(report);
                                      return (
                                        <View key={report.id} style={historyTabStyles.reportCard}>
                                          <View style={historyTabStyles.reportDateRow}>
                                            <Text style={historyTabStyles.reportDate}>{formatDate(report.timestamp)}</Text>
                                            <View style={historyTabStyles.reportAttemptBadge}>
                                              <Text style={historyTabStyles.reportAttemptText}>#{reportIndex + 1}</Text>
                                            </View>
                                          </View>

                                          <View style={historyTabStyles.metricsGrid}>
                                            <View style={historyTabStyles.metricCard}>
                                              <Text style={historyTabStyles.metricValue}>{report.accuracyRate.toFixed(1)}%</Text>
                                              <Text style={historyTabStyles.metricLabel}>Accuracy</Text>
                                            </View>
                                            <View style={historyTabStyles.metricCard}>
                                              <Text style={historyTabStyles.metricValue}>{report.wordPerMin}</Text>
                                              <Text style={historyTabStyles.metricLabel}>Words / Min</Text>
                                            </View>
                                            <View style={historyTabStyles.metricCard}>
                                              <Text style={historyTabStyles.metricValue}>{formatDuration(report.recordingDuration)}</Text>
                                              <Text style={historyTabStyles.metricLabel}>Duration</Text>
                                            </View>
                                            <View style={historyTabStyles.metricCard}>
                                              <Text style={historyTabStyles.metricValue}>{totalMiscues}</Text>
                                              <Text style={historyTabStyles.metricLabel}>Total Miscues</Text>
                                            </View>
                                          </View>

                                          {totalMiscues > 0 && (
                                            <View style={historyTabStyles.miscueSection}>
                                              <Text style={historyTabStyles.miscueSectionTitle}>Miscue Breakdown</Text>
                                              {report.substitution !== 'None' && (
                                                <View style={historyTabStyles.miscueRow}>
                                                  <View style={[historyTabStyles.miscueTag, historyTabStyles.miscueTagSubstitution]}>
                                                    <Text style={historyTabStyles.miscueTagText}>Substitution</Text>
                                                  </View>
                                                  <Text style={historyTabStyles.miscueDetail}>{report.substitution}</Text>
                                                </View>
                                              )}
                                              {report.omission !== 'None' && (
                                                <View style={historyTabStyles.miscueRow}>
                                                  <View style={[historyTabStyles.miscueTag, historyTabStyles.miscueTagOmission]}>
                                                    <Text style={historyTabStyles.miscueTagText}>Omission</Text>
                                                  </View>
                                                  <Text style={historyTabStyles.miscueDetail}>{report.omission}</Text>
                                                </View>
                                              )}
                                              {report.insertion !== 'None' && (
                                                <View style={historyTabStyles.miscueRow}>
                                                  <View style={[historyTabStyles.miscueTag, historyTabStyles.miscueTagInsertion]}>
                                                    <Text style={historyTabStyles.miscueTagText}>Insertion</Text>
                                                  </View>
                                                  <Text style={historyTabStyles.miscueDetail}>{report.insertion}</Text>
                                                </View>
                                              )}
                                              {report.repetition !== 'None' && (
                                                <View style={historyTabStyles.miscueRow}>
                                                  <View style={[historyTabStyles.miscueTag, historyTabStyles.miscueTagRepetition]}>
                                                    <Text style={historyTabStyles.miscueTagText}>Repetition</Text>
                                                  </View>
                                                  <Text style={historyTabStyles.miscueDetail}>{report.repetition}</Text>
                                                </View>
                                              )}
                                            </View>
                                          )}

                                          {totalMiscues === 0 && (
                                            <View style={historyTabStyles.perfectBadge}>
                                              <Text style={historyTabStyles.perfectIcon}>🌟</Text>
                                              <Text style={historyTabStyles.perfectText}>Perfect reading! No miscues detected.</Text>
                                            </View>
                                          )}
                                        </View>
                                      );
                                    })}
                                  </ScrollView>
                                  {group.reports.length > 5 && (
                                    <Text style={historyTabStyles.viewMoreText}>Scroll to see more attempts</Text>
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

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (Ported from Student_History) ---
const tabStyles = StyleSheet.create({
  tabGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: sw(16), marginTop: sh(12), marginBottom: sh(4),
    backgroundColor: '#E8F5E9', borderRadius: sw(14), padding: sw(4), gap: sw(4),
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.08, shadowRadius: sw(3),
  },
  tab: {
    width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: sh(10), paddingHorizontal: sw(6), borderRadius: sw(10), gap: sw(5),
  },
  tabActive: {
    backgroundColor: '#388E3C', elevation: 3, shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sw(1) }, shadowOpacity: 0.22, shadowRadius: sw(2.22),
  },
  tabIcon: { fontSize: sf(16), lineHeight: sf(20) },
  tabText: { fontSize: sf(13), fontFamily: 'Nunito-ExtraBold', color: '#388E3C' },
  tabTextActive: { color: '#ffffff' },
  tabContent: { paddingHorizontal: sw(12), paddingTop: sh(8), paddingBottom: sh(40) },
  section: {
    backgroundColor: '#fff', borderRadius: sw(14), padding: sw(14), marginBottom: sh(12),
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.07, shadowRadius: sw(3),
  },
  sectionTitle: {
    fontSize: sf(15), fontFamily: 'Nunito-Bold', color: '#1B5E20', marginBottom: sh(10),
  },
     exportRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: sw(16),
    gap: sw(8), 
    marginTop: sh(10),
    marginBottom: sh(4),
  },
});

const historyTabStyles = StyleSheet.create({
  emptyContainer: { alignItems: 'center', paddingVertical: sh(40), paddingHorizontal: sw(20) },
  emptyIconContainer: { width: sw(72), height: sw(72), borderRadius: sw(36), backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: sh(16) },
  emptyIcon: { fontSize: sf(36) },
  emptyTitle: { fontSize: sf(18), fontFamily: 'Nunito-Bold', color: '#1F2937', marginBottom: sh(8) },
  emptyMessage: { fontSize: sf(13), color: '#6B7280', textAlign: 'center', lineHeight: sf(20), marginBottom: sh(20) },
  emptyButton: { backgroundColor: '#388E3C', paddingVertical: sh(10), paddingHorizontal: sw(28), borderRadius: sw(10) },
  emptyButtonText: { fontSize: sf(14), fontFamily: 'Nunito-Bold', color: '#fff' },
  statsBar: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: sw(14), padding: sw(14),
    marginBottom: sh(12), elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(1) }, shadowOpacity: 0.07, shadowRadius: sw(3),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: sf(16), fontFamily: 'Nunito-Black', color: '#1B5E20' },
  statLabel: { fontSize: sf(10), fontFamily: 'Nunito-Medium', color: '#6B7280', marginTop: sh(2) },
  statDivider: { width: 1, backgroundColor: '#E8F5E9', marginVertical: sh(4) },
  contentContainer: { marginBottom: sh(20) },
  sectionLabel: { fontSize: sf(13), fontFamily: 'Nunito-Bold', color: '#6B7280', marginBottom: sh(8), marginLeft: sw(4) },
  passageCard: {
    backgroundColor: '#fff', borderRadius: sw(14), marginBottom: sh(10), overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: sh(1) }, shadowOpacity: 0.07, shadowRadius: sw(3),
  },
  passageCardExpanded: { elevation: 3 },
  passageHeader: { flexDirection: 'row', alignItems: 'center', padding: sw(14), backgroundColor: '#fff' },
  passageIconContainer: { width: sw(38), height: sw(38), borderRadius: sw(10), backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: sw(12) },
  passageIconText: { fontSize: sf(18) },
  passageInfo: { flex: 1 },
  passageTitle: { fontSize: sf(14), fontFamily: 'Nunito-Bold', color: '#1B5E20', marginBottom: sh(2) },
  passageAttempts: { fontSize: sf(11), fontFamily: 'Nunito-Medium', color: '#6B7280' },
  passageArrowContainer: { width: sw(28), height: sw(28), borderRadius: sw(8), backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  passageArrow: { fontSize: sf(12), color: '#388E3C' },
  reportsContainer: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  nestedScroll: { maxHeight: sh(400) },
  viewMoreText: { textAlign: 'center', fontSize: sf(11), color: '#9CA3AF', paddingVertical: sh(8), fontFamily: 'Nunito-Medium' },
  reportCard: {
    margin: sw(10), marginBottom: 0, padding: sw(12), backgroundColor: '#F9FAFB',
    borderRadius: sw(12), borderWidth: 1, borderColor: '#F3F4F6',
  },
  reportDateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sh(10) },
  reportDate: { fontSize: sf(11), fontFamily: 'Nunito-Medium', color: '#6B7280', flex: 1 },
  reportAttemptBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: sw(8), paddingVertical: sh(3), borderRadius: sw(8) },
  reportAttemptText: { fontSize: sf(11), fontFamily: 'Nunito-Bold', color: '#388E3C' },
  metricsGrid: { flexDirection: 'row', gap: sw(6), marginBottom: sh(10) },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: sw(10), padding: sw(8), alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  metricValue: { fontSize: sf(14), fontFamily: 'Nunito-Black', color: '#1B5E20' },
  metricLabel: { fontSize: sf(9), fontFamily: 'Nunito-Medium', color: '#6B7280', marginTop: sh(2), textAlign: 'center' },
  miscueSection: { backgroundColor: '#fff', borderRadius: sw(10), padding: sw(10), borderWidth: 1, borderColor: '#F3F4F6' },
  miscueSectionTitle: { fontSize: sf(12), fontFamily: 'Nunito-Bold', color: '#374151', marginBottom: sh(8) },
  miscueRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: sh(6), gap: sw(8) },
  miscueTag: { paddingHorizontal: sw(8), paddingVertical: sh(3), borderRadius: sw(6), minWidth: sw(90) },
  miscueTagText: { fontSize: sf(10), fontFamily: 'Nunito-Bold', color: '#fff', textAlign: 'center' },
  miscueTagSubstitution: { backgroundColor: '#EF4444' },
  miscueTagOmission: { backgroundColor: '#F59E0B' },
  miscueTagInsertion: { backgroundColor: '#3B82F6' },
  miscueTagRepetition: { backgroundColor: '#8B5CF6' },
  miscueDetail: { fontSize: sf(12), color: '#374151', flex: 1, flexWrap: 'wrap' },
  perfectBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: sw(10), padding: sw(10), gap: sw(8), borderWidth: 1, borderColor: '#BBF7D0' },
  perfectIcon: { fontSize: sf(16) },
  perfectText: { fontSize: sf(12), fontFamily: 'Nunito-Bold', color: '#15803D', flex: 1 },
  
});

import React, { useState, useEffect, useMemo } from 'react';
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
import FadeSlideIn from '../../Components/GlobalUse/FadeSlideIn';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import historyStyles from '../../UI_Designs/StudentHistoryStyles';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

// ── Performance / Activity components (moved from Student_Profile) ────────────
import StudentActivityTrackingCard from '../../Components/Faculty/StudentView_Status/Student_TimeTrack';
import StudentAccuracyTrendsChart from '../../Components/Faculty/StudentView_Status/Student_Accuracy_Chart';
import StudentMiscueInsights from '../../Components/Faculty/StudentView_Status/Student_MiscueInsights';
import StudentAlphabetMastery from '../../Components/Faculty/StudentView_Status/StudentAlphabetMastery';
import StudentWordMastery from '../../Components/Faculty/StudentView_Status/StudentWordMastery';
import StudentCompletionProgress from '../../Components/Faculty/StudentView_Status/StudentCompletionProgress';
import { sw, sh, sf } from '../../Utils/responsive';
import ExportExcel from '../../Components/GlobalUse/ExportExcel';
import ExportPdf from '../../Components/GlobalUse/ExportPdf';

const auth = getAuth();

const C = {
  white: '#ffffff',
  darkBlue: '#163F6C',
  ink: '#1b2e23',
};

function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

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
type HistoryFilter = 'week' | 'month' | 'year';

// ─── Date Utilities ───────────────────────────────────────────────────────────

/** Get Monday 00:00 of the week containing `d` */
const getWeekStart = (d: Date): Date => {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Get Sunday 23:59 of the week containing `d` */
const getWeekEnd = (d: Date): Date => {
  const start = getWeekStart(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

/** Get the start of the academic year (June 1) that contains `d`.
 *  Philippine school year: June 1 → March 31 of the following calendar year. */
const getAcadYearStart = (d: Date): Date => {
  const year = d.getMonth() >= 5 ? d.getFullYear() : d.getFullYear() - 1; // June = 5
  return new Date(year, 5, 1, 0, 0, 0, 0); // June 1
};

const getAcadYearEnd = (d: Date): Date => {
  const start = getAcadYearStart(d);
  return new Date(start.getFullYear() + 1, 2, 31, 23, 59, 59, 999); // March 31 next year
};

/** Format helpers */
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatPeriodLabel = (filter: HistoryFilter, anchor: Date): string => {
  if (filter === 'week') {
    const s = getWeekStart(anchor);
    const e = getWeekEnd(anchor);
    const sameMonth = s.getMonth() === e.getMonth();
    return sameMonth
      ? `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`
      : `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  }
  if (filter === 'month') {
    return `${MONTHS_SHORT[anchor.getMonth()]} ${anchor.getFullYear()}`;
  }
  // year = academic year
  const start = getAcadYearStart(anchor);
  return `SY ${start.getFullYear()} – ${start.getFullYear() + 1}`;
};

const shiftAnchor = (filter: HistoryFilter, anchor: Date, direction: -1 | 1): Date => {
  const d = new Date(anchor);
  if (filter === 'week') d.setDate(d.getDate() + direction * 7);
  else if (filter === 'month') d.setMonth(d.getMonth() + direction);
  else d.setFullYear(d.getFullYear() + direction);
  return d;
};

const getFilterRange = (filter: HistoryFilter, anchor: Date): [Date, Date] => {
  if (filter === 'week') return [getWeekStart(anchor), getWeekEnd(anchor)];
  if (filter === 'month') {
    const s = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0);
    const e = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
    return [s, e];
  }
  return [getAcadYearStart(anchor), getAcadYearEnd(anchor)];
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReadingHistoryScreen() {
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPassages, setExpandedPassages] = useState<Set<number>>(new Set());
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // ── NEW: tab state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('completion');
  const [gradeLevel, setGradeLevel] = useState<number | undefined>(undefined);

  // ── History filter state ────────────────────────────────────────────────────
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('week');
  const [filterAnchor, setFilterAnchor] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);       // 0=Mon..6=Sun (Week)
  const [selectedWeekOfMonth, setSelectedWeekOfMonth] = useState<number | null>(null); // 1..4/5 (Month)

  // ── Performance tab filter state ────────────────────────────────────────────
  const [perfTimeRange, setPerfTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [perfAnchor, setPerfAnchor] = useState<Date>(new Date());
  const [perfSelectedDay, setPerfSelectedDay] = useState<number | null>(null);
  const [perfSelectedWeekOfMonth, setPerfSelectedWeekOfMonth] = useState<number | null>(null);

  // Fetch the student's grade level once for the benchmark card
  useEffect(() => {
    const fetchGradeLevel = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(getFirestore(), 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data() as any;
          setGradeLevel(data?.studentData?.gradeLevel ?? undefined);
        }
      } catch {
        // Non-critical — benchmark card is simply hidden if unavailable
      }
    };
    fetchGradeLevel();
  }, []);

  const { handleLogout, handleBackStep, handleNextStep } = useNavigationHelper();

  const toggleMenu = () => setMenuVisible(v => !v);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogoout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

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

  // ── Week day data (for day chips) ───────────────────────────────────────────
  const weekDays = useMemo(() => {
    if (historyFilter !== 'week') return [];
    const monday = getWeekStart(filterAnchor);
    const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build a set of day-of-month numbers that have activity (for dot indicators)
    const activeDateKeys = new Set<string>();
    for (const group of groupedReports) {
      for (const r of group.reports) {
        try {
          const d: Date = r.timestamp?.toDate?.() ?? new Date(r.timestamp);
          activeDateKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        } catch { /* skip */ }
      }
    }

    return DAY_LABELS.map((label, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const isToday = date.getTime() === today.getTime();
      return { label, dateNum: date.getDate(), index: i, hasActivity: activeDateKeys.has(dateKey), isToday };
    });
  }, [historyFilter, filterAnchor, groupedReports]);

  // ── Month week data (for week-of-month chips) ─────────────────────────────
  const monthWeeks = useMemo(() => {
    if (historyFilter !== 'month') return [];
    const year = filterAnchor.getFullYear();
    const month = filterAnchor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const weekCount = Math.ceil(totalDays / 7);

    return Array.from({ length: weekCount }, (_, i) => {
      const weekStart = new Date(year, month, i * 7 + 1);
      const weekEndDate = Math.min((i + 1) * 7, totalDays);
      const weekEnd = new Date(year, month, weekEndDate, 23, 59, 59, 999);
      return { weekNum: i + 1, start: weekStart, end: weekEnd };
    });
  }, [historyFilter, filterAnchor]);

  // ── Filtered reports (client-side, no extra Firestore calls) ─────────────
  const filteredReports: GroupedReport[] = useMemo(() => {
    const [rangeStart, rangeEnd] = getFilterRange(historyFilter, filterAnchor);

    // Filter each group's reports to only those within the date range
    const filtered: GroupedReport[] = [];
    for (const group of groupedReports) {
      const matchingReports = group.reports.filter(r => {
        try {
          const d: Date = r.timestamp?.toDate?.() ?? new Date(r.timestamp);
          if (d < rangeStart || d > rangeEnd) return false;

          // Day-level filter (Week mode)
          if (historyFilter === 'week' && selectedDay !== null) {
            const monday = getWeekStart(filterAnchor);
            const targetDate = new Date(monday);
            targetDate.setDate(monday.getDate() + selectedDay);
            return d.getFullYear() === targetDate.getFullYear()
              && d.getMonth() === targetDate.getMonth()
              && d.getDate() === targetDate.getDate();
          }

          // Week-of-month filter (Month mode)
          if (historyFilter === 'month' && selectedWeekOfMonth !== null) {
            const weekInfo = monthWeeks.find(w => w.weekNum === selectedWeekOfMonth);
            if (weekInfo) {
              return d >= weekInfo.start && d <= weekInfo.end;
            }
          }

          return true;
        } catch {
          return false;
        }
      });
      if (matchingReports.length > 0) {
        filtered.push({ passageTitle: group.passageTitle, reports: matchingReports });
      }
    }
    return filtered;
  }, [groupedReports, historyFilter, filterAnchor, selectedDay, selectedWeekOfMonth, monthWeeks]);

  const periodLabel = useMemo(
    () => formatPeriodLabel(historyFilter, filterAnchor),
    [historyFilter, filterAnchor],
  );

  const navigatePeriod = (direction: -1 | 1) => {
    setSelectedDay(null);
    setSelectedWeekOfMonth(null);
    setFilterAnchor(prev => shiftAnchor(historyFilter, prev, direction));
  };

  const goToToday = () => {
    setSelectedDay(null);
    setSelectedWeekOfMonth(null);
    setFilterAnchor(new Date());
  };

  // Compute explicit date bounds for the Analytics sub-filter (day chip / week-of-month chip).
  // When neither chip is selected, returns undefined so the child components fall back to timeRange + anchor.
  const perfDateBounds = useMemo<{ start?: Date; end?: Date }>(() => {
    if (perfTimeRange === 'week' && perfSelectedDay !== null) {
      const monday = getWeekStart(perfAnchor);
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + perfSelectedDay);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      return { start: dayStart, end: dayEnd };
    }
    if (perfTimeRange === 'month' && perfSelectedWeekOfMonth !== null) {
      const year = perfAnchor.getFullYear();
      const month = perfAnchor.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const i = perfSelectedWeekOfMonth - 1;
      const wkStart = new Date(year, month, i * 7 + 1, 0, 0, 0, 0);
      const wkEnd = new Date(year, month, Math.min((i + 1) * 7, totalDays), 23, 59, 59, 999);
      return { start: wkStart, end: wkEnd };
    }
    return {};
  }, [perfTimeRange, perfAnchor, perfSelectedDay, perfSelectedWeekOfMonth]);

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

  // ── Shared header ─────────────────────────────────────────────────────────
  const Header = () => (
    <View>
      <View style={upperNav.header}>
        <TouchableOpacity style={headerStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
          <Text style={headerStyles.backArrowText}>‹</Text>
        </TouchableOpacity>

        <Svg height={60} width={220}>
          <SvgText
            x={110} y={35} fontSize={23}
            fontFamily="Nunito-Black" textAnchor="middle"
            fill="none" stroke="#E8F5E9" strokeWidth={8} strokeLinejoin="round"
          >
            Reading History
          </SvgText>
          <SvgText
            x={110} y={35} fontSize={23}
            fontFamily="Nunito-Black" textAnchor="middle"
            fill="#1B5E20"
          >
            Reading History
          </SvgText>
        </Svg>

        <TouchableOpacity style={headerStyles.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
          <MenuBars />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={upperNav.dropdownMenu}>
          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              handleNextStep('About');
            }}
            style={upperNav.logoutButton}
          >
            <Text style={upperNav.logoutText}>About</Text>
          </TouchableOpacity>
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
          <FadeSlideIn delay={60}>
            <View style={tabStyles.exportRow}>
              <ExportExcel studentName="Student" />
              <ExportPdf />
            </View>
            <View style={tabStyles.tabGrid}></View>
            <View style={tabStyles.tabGrid}>
              {(
                [
                  { key: 'completion', icon: '📋', label: 'Progress' },
                  { key: 'sessions',   icon: '📚', label: 'Sessions' },
                  { key: 'performance', icon: '📊', label: 'Analytics' },
                  { key: 'history',    icon: '🕓', label: 'History' },
                ] as { key: ActiveTab; icon: string; label: string }[]
              ).map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[tabStyles.tab, activeTab === tab.key && tabStyles.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={tabStyles.tabIcon}>{tab.icon}</Text>
                  <Text style={[tabStyles.tabText, activeTab === tab.key && tabStyles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeSlideIn>

          {/* ══════════════════════════════════════════════════════════════════
              HISTORY TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <>
              {/* ── Filter Bar ──────────────────────────────────────────── */}
              <FadeSlideIn delay={100}>
                <View style={filterStyles.container}>
                  {/* Range selector pills */}
                  <View style={filterStyles.rangeBar}>
                    {(['week', 'month', 'year'] as const).map(range => (
                      <TouchableOpacity
                        key={range}
                        style={[filterStyles.rangeBtn, historyFilter === range && filterStyles.rangeBtnActive]}
                        onPress={() => { setHistoryFilter(range); setFilterAnchor(new Date()); setSelectedDay(null); setSelectedWeekOfMonth(null); }}
                        activeOpacity={0.8}
                      >
                        <Text style={[filterStyles.rangeBtnText, historyFilter === range && filterStyles.rangeBtnTextActive]}>
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Period navigator */}
                  <View style={filterStyles.periodNav}>
                    <TouchableOpacity onPress={() => navigatePeriod(-1)} style={filterStyles.arrowBtn} activeOpacity={0.6}>
                      <Text style={filterStyles.arrowText}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goToToday} activeOpacity={0.7} style={filterStyles.periodLabelBtn}>
                      <Text style={filterStyles.periodLabel}>{periodLabel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigatePeriod(1)} style={filterStyles.arrowBtn} activeOpacity={0.6}>
                      <Text style={filterStyles.arrowText}>›</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Day-of-week chips (Week mode only) */}
                  {historyFilter === 'week' && weekDays.length > 0 && (
                    <View style={filterStyles.dayRow}>
                      {weekDays.map(day => {
                        const isSelected = selectedDay === day.index;
                        return (
                          <TouchableOpacity
                            key={day.index}
                            style={[
                              filterStyles.dayChip,
                              isSelected && filterStyles.dayChipActive,
                              day.isToday && !isSelected && filterStyles.dayChipToday,
                            ]}
                            onPress={() => setSelectedDay(prev => prev === day.index ? null : day.index)}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              filterStyles.dayChipLabel,
                              isSelected && filterStyles.dayChipLabelActive,
                            ]}>
                              {day.label}
                            </Text>
                            <Text style={[
                              filterStyles.dayChipDate,
                              isSelected && filterStyles.dayChipDateActive,
                            ]}>
                              {day.dateNum}
                            </Text>
                            {day.hasActivity && !isSelected && (
                              <View style={filterStyles.activityDot} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Week-of-month chips (Month mode only) */}
                  {historyFilter === 'month' && monthWeeks.length > 0 && (
                    <View style={filterStyles.weekOfMonthRow}>
                      {monthWeeks.map(w => {
                        const isSelected = selectedWeekOfMonth === w.weekNum;
                        return (
                          <TouchableOpacity
                            key={w.weekNum}
                            style={[
                              filterStyles.weekChip,
                              isSelected && filterStyles.weekChipActive,
                            ]}
                            onPress={() => setSelectedWeekOfMonth(prev => prev === w.weekNum ? null : w.weekNum)}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              filterStyles.weekChipText,
                              isSelected && filterStyles.weekChipTextActive,
                            ]}>
                              Week {w.weekNum}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </FadeSlideIn>

              {filteredReports.length === 0 ? (
                /* Empty state */
                <FadeSlideIn delay={120}>
                  <View style={historyStyles.emptyContainer}>
                    <View style={historyStyles.emptyIconContainer}>
                      <Text style={historyStyles.emptyIcon}>📚</Text>
                    </View>
                    <Text style={historyStyles.emptyTitle}>No Reading History</Text>
                    <Text style={historyStyles.emptyMessage}>
                      No reading sessions found for this period. Try selecting a different
                      time range or tap the period label to jump back to today.
                    </Text>
                    <TouchableOpacity
                      style={historyStyles.emptyButton}
                      onPress={goToToday}
                      activeOpacity={0.8}
                    >
                      <Text style={historyStyles.emptyButtonText}>Go to Today</Text>
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
              <FadeSlideIn delay={80}>
                <View style={tabStyles.section}>
                  <StudentAlphabetMastery studentId={uid} />
                </View>
              </FadeSlideIn>
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
              <FadeSlideIn delay={60}>
                <View style={tabStyles.section}>
                  <Text style={tabStyles.sectionTitle}>Performance Analytics</Text>
                  <View style={filterStyles.rangeBar}>
                    {(['week', 'month', 'year'] as const).map(range => (
                      <TouchableOpacity
                        key={range}
                        style={[filterStyles.rangeBtn, perfTimeRange === range && filterStyles.rangeBtnActive]}
                        onPress={() => { setPerfTimeRange(range); setPerfAnchor(new Date()); setPerfSelectedDay(null); setPerfSelectedWeekOfMonth(null); }}
                        activeOpacity={0.8}
                      >
                        <Text style={[filterStyles.rangeBtnText, perfTimeRange === range && filterStyles.rangeBtnTextActive]}>
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Period navigator */}
                  <View style={filterStyles.periodNav}>
                    <TouchableOpacity
                      onPress={() => { setPerfSelectedDay(null); setPerfSelectedWeekOfMonth(null); setPerfAnchor(prev => shiftAnchor(perfTimeRange as any, prev, -1)); }}
                      style={filterStyles.arrowBtn}
                      activeOpacity={0.6}
                    >
                      <Text style={filterStyles.arrowText}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setPerfSelectedDay(null); setPerfSelectedWeekOfMonth(null); setPerfAnchor(new Date()); }}
                      activeOpacity={0.7}
                      style={filterStyles.periodLabelBtn}
                    >
                      <Text style={filterStyles.periodLabel}>
                        {formatPeriodLabel(perfTimeRange as any, perfAnchor)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setPerfSelectedDay(null); setPerfSelectedWeekOfMonth(null); setPerfAnchor(prev => shiftAnchor(perfTimeRange as any, prev, 1)); }}
                      style={filterStyles.arrowBtn}
                      activeOpacity={0.6}
                    >
                      <Text style={filterStyles.arrowText}>›</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Day-of-week chips (Week mode only) */}
                  {perfTimeRange === 'week' && (() => {
                    const monday = getWeekStart(perfAnchor);
                    const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const days = DAY_LABELS.map((label, i) => {
                      const date = new Date(monday); date.setDate(monday.getDate() + i);
                      const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
                      return { label, dateNum: date.getDate(), index: i, isToday };
                    });
                    return (
                      <View style={filterStyles.dayRow}>
                        {days.map(day => {
                          const isSelected = perfSelectedDay === day.index;
                          return (
                            <TouchableOpacity
                              key={day.index}
                              style={[
                                filterStyles.dayChip,
                                isSelected && filterStyles.dayChipActive,
                                day.isToday && !isSelected && filterStyles.dayChipToday,
                              ]}
                              onPress={() => setPerfSelectedDay(prev => prev === day.index ? null : day.index)}
                              activeOpacity={0.7}
                            >
                              <Text style={[filterStyles.dayChipLabel, isSelected && filterStyles.dayChipLabelActive]}>
                                {day.label}
                              </Text>
                              <Text style={[filterStyles.dayChipDate, isSelected && filterStyles.dayChipDateActive]}>
                                {day.dateNum}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })()}

                  {/* Week-of-month chips (Month mode only) */}
                  {perfTimeRange === 'month' && (() => {
                    const year = perfAnchor.getFullYear();
                    const month = perfAnchor.getMonth();
                    const totalDays = new Date(year, month + 1, 0).getDate();
                    const weekCount = Math.ceil(totalDays / 7);
                    const weeks = Array.from({ length: weekCount }, (_, i) => ({ weekNum: i + 1 }));
                    return (
                      <View style={filterStyles.weekOfMonthRow}>
                        {weeks.map(w => {
                          const isSelected = perfSelectedWeekOfMonth === w.weekNum;
                          return (
                            <TouchableOpacity
                              key={w.weekNum}
                              style={[filterStyles.weekChip, isSelected && filterStyles.weekChipActive]}
                              onPress={() => setPerfSelectedWeekOfMonth(prev => prev === w.weekNum ? null : w.weekNum)}
                              activeOpacity={0.7}
                            >
                              <Text style={[filterStyles.weekChipText, isSelected && filterStyles.weekChipTextActive]}>
                                Week {w.weekNum}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })()}
                </View>
              </FadeSlideIn>

              <FadeSlideIn delay={80}>
                <View style={tabStyles.section}>
                  <StudentAccuracyTrendsChart studentId={uid} role="student" gradeLevel={gradeLevel} timeRange={perfTimeRange} anchor={perfAnchor} startDate={perfDateBounds.start} endDate={perfDateBounds.end} />
                </View>
              </FadeSlideIn>
              <FadeSlideIn delay={160}>
                <View style={tabStyles.section}>
                  <StudentMiscueInsights studentId={uid} role="student" timeRange={perfTimeRange} anchor={perfAnchor} startDate={perfDateBounds.start} endDate={perfDateBounds.end} />
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
    exportRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: sw(16),
    gap: sw(8), 
    marginTop: sh(10),
    marginBottom: sh(4),
  },
});

// ─── Filter styles ──────────────────────────────────────────────────────────
const filterStyles = StyleSheet.create({
  container: {
    marginHorizontal: sw(16),
    marginTop: sh(8),
    marginBottom: sh(4),
  },
  rangeBar: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: sw(10),
    padding: sw(3),
    marginBottom: sh(10),
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: sh(8),
    alignItems: 'center',
    borderRadius: sw(8),
  },
  rangeBtnActive: {
    backgroundColor: '#388E3C',
    elevation: 2,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(2),
  },
  rangeBtnText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: '#388E3C',
  },
  rangeBtnTextActive: {
    color: '#ffffff',
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: sw(12),
    paddingVertical: sh(6),
    paddingHorizontal: sw(6),
    borderWidth: 1,
    borderColor: '#E8F5E9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(2),
  },
  arrowBtn: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(10),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: sf(22),
    fontFamily: 'Nunito-Bold',
    color: '#388E3C',
    lineHeight: sf(24),
  },
  periodLabelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sh(4),
  },
  periodLabel: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: '#1F2937',
  },

  // Day chips (Week mode)
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sh(10),
    gap: sw(4),
  },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sh(8),
    borderRadius: sw(10),
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  dayChipActive: {
    backgroundColor: '#388E3C',
    borderColor: '#388E3C',
    elevation: 2,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(2),
  },
  dayChipToday: {
    borderColor: '#388E3C',
    borderWidth: 1.5,
  },
  dayChipLabel: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Medium',
    color: '#6B7280',
    marginBottom: sh(2),
  },
  dayChipLabelActive: {
    color: '#ffffff',
  },
  dayChipDate: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: '#1F2937',
  },
  dayChipDateActive: {
    color: '#ffffff',
  },
  activityDot: {
    width: sw(5),
    height: sw(5),
    borderRadius: sw(3),
    backgroundColor: '#388E3C',
    marginTop: sh(3),
  },

  // Week-of-month chips (Month mode)
  weekOfMonthRow: {
    flexDirection: 'row',
    marginTop: sh(10),
    gap: sw(6),
  },
  weekChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sh(8),
    borderRadius: sw(8),
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  weekChipActive: {
    backgroundColor: '#388E3C',
    borderColor: '#388E3C',
    elevation: 2,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(2),
  },
  weekChipText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: '#388E3C',
  },
  weekChipTextActive: {
    color: '#ffffff',
  },
  
});
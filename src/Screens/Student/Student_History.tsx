import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { AlertTriangleIcon, BarChartIcon, BookOpenIcon, FileTextIcon, FlexIcon, HistoryIcon, LockIcon, PartyIcon, StarIcon, ThumbsUpIcon, TimerIcon, TrendUpIcon, TrophyIcon, TypeIcon, ZapIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import { ACCENT_COLORS, StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';

const alphabetData = readingMaterialData?.Alphabet || [];
const wordsData = readingMaterialData?.Words || [];

const { width: SW } = Dimensions.get('window');

// ─── Header Icons ────────────────────────────────────────────────────────────
function BackArrow({ color = C.ink }: { color?: string }) {
  return (
    <View style={{ width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface AralinGroupedData {
  aralinIndex: number;
  aralinLabel: string;
  letter: string;
  accent: string;
  activities: ActivityGroup[];
}

interface ActivityGroup {
  type: 'Titik' | 'Salita' | 'Talata';
  title: string;
  reports: ReportData[];
}

interface ReportData {
  id: string;
  timestamp: any;
  accuracyRate: number;
  wordPerMin: number;
  totalWords: number;
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

// Palette and accent colors imported from Theme

// ─── Helpers ──────────────────────────────────────────────────────────────────
const accColor = (a: number) => a >= 90 ? C.green : a >= 75 ? C.orange : C.red;
const accLabel = (a: number) => a >= 90 ? 'Mahusay!' : a >= 75 ? 'Magaling!' : 'Kaya mo!';

const AccuracyFeedbackIcon = ({ accuracy, size = 18 }: { accuracy: number; size?: number }) => {
  if (accuracy >= 90) return <TrophyIcon size={size} color={C.white} />;
  if (accuracy >= 75) return <ThumbsUpIcon size={size} color={C.white} />;
  return <FlexIcon size={size} color={C.white} />;
};

const MasteryStar = ({ accuracy, size = 14 }: { accuracy: number; size?: number }) => {
  if (accuracy >= 100) return <TrophyIcon size={size} color="#f1c40f" />;
  if (accuracy >= 90) return <StarIcon size={size} color="#f1c40f" />;
  if (accuracy >= 75) return <StarIcon size={size} color="#bdc3c7" />;
  return null;
};

// Skeleton and BounceIn imported from Animations

// (Deleted MiscuePill - superseded by MiscueIcons)

// ─── Accordion & Detailed Attempt Card ───────────────────────────────────────
function DetailedMiscueBreakdown({ report }: { report: ReportData }) {
  const s = Number(report.substitutionCount || 0);
  const o = Number(report.omissionCount || 0);
  const i = Number(report.insertionCount || 0);
  const r = Number(report.repetitionCount || 0);

  if (s + o + i + r === 0) return (
    <View style={S.miscueBreakdownBox}>
      <Text style={S.miscueBreakdownTitle}>Mga Pagkakamali</Text>
      <View style={[S.perfectBadge, { backgroundColor: C.green + '15', marginTop: 8 }]}>
        <PartyIcon size={14} color={C.green} />
        <Text style={[S.perfectText, { color: C.green }]}>Walang mali! Ang galing!</Text>
      </View>
    </View>
  );

  const renderRow = (label: string, color: string, text: string) => {
    if (!text || text === 'None') return null;
    let words = text.split(',').map(w => w.trim()).filter(w => w.length > 0);
    const displayWords = words.map(w => `"${w}"`).join(', ');
    if (!displayWords) return null;

    return (
      <View style={S.miscueRow}>
        <View style={[S.miscueTag, { backgroundColor: color + '20' }]}>
          <Text style={[S.miscueTagText, { color }]}>{label}</Text>
        </View>
        <Text style={S.miscueWordList} numberOfLines={2}>{displayWords}</Text>
      </View>
    );
  };

  return (
    <View style={S.miscueBreakdownBox}>
      <Text style={S.miscueBreakdownTitle}>Mga Pagkakamali</Text>
      {renderRow('Palit', '#e67e22', report.substitution)}
      {renderRow('Kulang', '#e74c3c', report.omission)}
      {renderRow('Singit', '#2ecc71', report.insertion)}
      {renderRow('Ulit', '#9b59b6', report.repetition)}
    </View>
  );
}

function AttemptCard({ report, attemptNumber, isTitik, isBest, accent }: { report: ReportData; attemptNumber: number; isTitik: boolean, isBest: boolean, accent: string }) {
  const acc = report.accuracyRate;
  const color = accColor(acc);
  const totalMiscues = report.totalMiscues ?? report.miscues?.length ?? 0;

  const formatDate = (ts: any) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch { return '—'; }
  };

  return (
    <View style={[S.attemptCard, { borderColor: accent + '30' }, isBest && S.attemptCardBest]}>
      {isBest && (
        <View style={S.bestRibbon}>
          <StarIcon size={12} color={C.white} />
          <Text style={S.bestRibbonText}>Pinakamagaling!</Text>
        </View>
      )}

      <View style={[S.attemptHeader, isBest && { marginTop: 12 }]}>
        <Text style={S.attemptDate}>{formatDate(report.timestamp)}</Text>
        <View style={[S.attemptBadge, { backgroundColor: accent }]}>
          <Text style={S.attemptBadgeText}>#{attemptNumber}</Text>
        </View>
      </View>

      <View style={[S.statsGrid, { borderColor: accent + '30' }]}>
        <View style={[S.gridCell, { borderColor: accent + '30' }]}>
          <Text style={[S.gridVal, { color }]} adjustsFontSizeToFit numberOfLines={1}>
            {Number(acc.toFixed(1))}%
          </Text>
          <Text style={S.gridLab}>Galing</Text>
        </View>
        <View style={[S.gridCell, { borderColor: accent + '30' }]}>
          <Text style={[S.gridVal, { color: C.ink }]}>{isTitik ? '—' : report.wordPerMin}</Text>
          <Text style={S.gridLab}>Bilis (S/M)</Text>
        </View>
        <View style={[S.gridCell, { borderColor: accent + '30' }]}>
          <Text style={[S.gridVal, { color: C.ink }]}>{report.recordingDuration || '0:00'}</Text>
          <Text style={S.gridLab}>Tagal</Text>
        </View>
        <View style={[S.gridCell, { borderColor: accent + '30' }]}>
          <Text style={[S.gridVal, { color: totalMiscues > 0 ? C.red : C.ink }]}>{totalMiscues}</Text>
          <Text style={S.gridLab}>Mga Mali</Text>
        </View>
      </View>

      <DetailedMiscueBreakdown report={report} />
    </View>
  );
}

function ActivityAccordionItem({ act, index, accent }: { act: ActivityGroup, index: number, accent: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const getIcon = () => {
    if (act.type === 'Titik') return <TypeIcon size={18} color={accent} />;
    if (act.type === 'Salita') return <FileTextIcon size={18} color={accent} />;
    return <BookOpenIcon size={18} color={accent} />;
  };

  // Find the report with the highest accuracy
  const bestReportId = act.reports.reduce((best, cur) => {
    return cur.accuracyRate > best.accuracyRate ? cur : best;
  }, act.reports[0])?.id;

  const displayedReports = showAll ? act.reports : act.reports.slice(0, 3);
  const hasMore = act.reports.length > 3;

  return (
    <View style={[S.accordionContainer, { borderColor: accent }]}>
      <TouchableOpacity
        style={S.accordionHeader}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={[S.accordionIconBox, { backgroundColor: accent + '20' }]}>
          {getIcon()}
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={S.accordionTitle}>{act.title}</Text>
          <Text style={S.accordionSub}>{act.reports.length} subok</Text>
        </View>
        <View style={[S.chevronBox, { backgroundColor: accent + '20' }]}>
          <Text style={[S.chevronIcon, { color: accent }]}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={S.accordionBody}>
          {displayedReports.map((rep, ri) => (
            <AttemptCard
              key={rep.id || ri}
              report={rep}
              attemptNumber={act.reports.length - ri}
              isTitik={act.type === 'Titik'}
              isBest={rep.id === bestReportId && act.reports.length > 1}
              accent={accent}
            />
          ))}

          {hasMore && !showAll && (
            <TouchableOpacity style={[S.viewAllBtn, { backgroundColor: accent + '15' }]} onPress={() => setShowAll(true)}>
              <Text style={[S.viewAllText, { color: accent }]}>Tingnan ang lahat ({act.reports.length} subok)</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Aralin Mastery Card ─────────────────────────────────────────────────────
function AralinMasteryCard({ group }: { group: AralinGroupedData }) {
  const accent = group.accent;

  // Calculate aggregate stats for this Aralin
  const titikAttempts = group.activities.find(a => a.type === 'Titik')?.reports.length || 0;
  const salitaAttempts = group.activities.find(a => a.type === 'Salita')?.reports.length || 0;
  const talataActivities = group.activities.filter(a => a.type === 'Talata');

  return (
    <BounceIn delay={group.aralinIndex * 50}>
      <View style={[S.aralinCard, { borderTopColor: accent }]}>

        <View style={S.aralinHeader}>
          <View style={[S.aralinIconCircle, { backgroundColor: accent + '12' }]}>
            <Text style={[S.aralinLetter, { color: accent }]}>{group.letter}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[S.aralinLabelText, { color: accent }]}>{group.aralinLabel}</Text>
          </View>
        </View>


        {group.activities.length > 0 && (
          <View style={S.talataSection}>
            <Text style={[S.sessionsHeaderTitle, { color: accent }]}>Ang iyong mga sesyon ng pagbabasa</Text>
            {group.activities.map((act, ai) => (
              <ActivityAccordionItem
                key={`act-${ai}`}
                act={act}
                index={ai}
                accent={accent}
              />
            ))}
          </View>
        )}
      </View>
    </BounceIn>
  );
}

// (Deleted old AralinGroup component since we use AralinMasteryCard now)

// ─── Main Screen ──────────────────────────────────────────────────────────────
// ─── Badge Definitions ────────────────────────────────────────────────────────
const BADGE_DEFS = [
  { id: 'perfect', renderIcon: (c: string) => <StarIcon size={22} color={c} />, label: 'Perpekto!', desc: '100% na galing', color: '#f1c40f', check: (r: ReportData[]) => r.some(x => x.accuracyRate >= 100) },
  { id: 'fast', renderIcon: (c: string) => <ZapIcon size={22} color={c} />, label: 'Mabilis!', desc: '60+ salita/min', color: '#3498db', check: (r: ReportData[]) => r.some(x => x.wordPerMin >= 60) },
  { id: 'five', renderIcon: (c: string) => <FlexIcon size={22} color={c} />, label: 'Masipag', desc: '5+ na subok', color: '#e67e22', check: (r: ReportData[]) => r.length >= 5 },
  { id: 'ten', renderIcon: (c: string) => <TrophyIcon size={22} color={c} />, label: 'Kampeon', desc: '10+ na subok', color: '#9b59b6', check: (r: ReportData[]) => r.length >= 10 },
  { id: 'clean', renderIcon: (c: string) => <PartyIcon size={22} color={c} />, label: 'Walang Mali', desc: '0 miscue sa isang pagbasa', color: '#2ecc71', check: (r: ReportData[]) => r.some(x => (x.totalMiscues ?? (x.miscues?.length ?? 0)) === 0) },
  { id: 'improve', renderIcon: (c: string) => <TrendUpIcon size={22} color={c} />, label: 'Umuunlad', desc: 'Tumaas ang galing', color: '#1abc9c', check: (r: ReportData[]) => { if (r.length < 2) return false; const sorted = [...r].sort((a, b) => { const ta = a.timestamp?.toDate?.() || new Date(a.timestamp || 0); const tb = b.timestamp?.toDate?.() || new Date(b.timestamp || 0); return ta.getTime() - tb.getTime(); }); return sorted[sorted.length - 1].accuracyRate > sorted[0].accuracyRate; } },
];

// ─── Streak & Trend Components ────────────────────────────────────────────────
function StreakCalendar({ streak, weekDays }: { streak: number; weekDays: boolean[] }) {
  const dayLabels = ['L', 'M', 'M', 'H', 'B', 'S', 'L'];
  return (
    <BounceIn delay={100}>
      <View style={S.streakCard}>
        <View style={S.streakTop}>
          <View style={S.streakFireBox}>
            <View style={[S.streakIconCircle, { backgroundColor: '#e67e22' + '15' }]}>
              <ZapIcon size={24} color="#e67e22" />
            </View>
            <Text style={S.streakCount}>{streak}</Text>
          </View>
          <View>
            <Text style={S.streakTitle}>{streak > 0 ? ` Araw na Sunod-sunod!` : 'Magsimula ng Streak!'}</Text>
            <Text style={S.streakSub}>{streak > 0 ? 'Patuloy lang, kaya mo yan!' : 'Magbasa araw-araw!'}</Text>
          </View>
        </View>
        <View style={S.calendarRow}>
          {dayLabels.map((d, i) => (
            <View key={i} style={S.calendarDayBox}>
              <Text style={[S.calendarDayLabel, weekDays[i] && { color: C.green }]}>{d}</Text>
              <View style={[S.calendarDot, weekDays[i] ? S.calendarDotActive : S.calendarDotInactive]}>
                {weekDays[i] && <Text style={{ fontSize: 10, color: C.white }}>✓</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>
    </BounceIn>
  );
}

function BadgesRow({ badges }: { badges: typeof BADGE_DEFS }) {
  if (badges.length === 0) return null;
  return (
    <BounceIn delay={120}>
      <View style={S.badgesSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <TrophyIcon size={16} color={C.orange} />
          <Text style={S.sectionTitle}>Mga Parangal</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }}>
          {badges.map(b => (
            <View key={b.id} style={[S.badgeCard, { borderColor: b.color + '40' }]}>
              <View style={[S.badgeIconCircle, { backgroundColor: b.color + '15' }]}>
                {b.renderIcon(b.color)}
              </View>
              <Text style={[S.badgeName, { color: b.color }]}>{b.label}</Text>
              <Text style={S.badgeDesc}>{b.desc}</Text>
            </View>
          ))}
          {BADGE_DEFS.filter(b => !badges.includes(b)).slice(0, 2).map(b => (
            <View key={b.id} style={[S.badgeCard, S.badgeLocked]}>
              <LockIcon size={20} color={C.slate + '50'} />
              <Text style={[S.badgeName, { color: C.slate + '60' }]}>{b.label}</Text>
              <Text style={[S.badgeDesc, { color: C.slate + '40' }]}>{b.desc}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </BounceIn>
  );
}

function TrendChart({ dataPoints }: { dataPoints: number[] }) {
  if (dataPoints.length < 2) return null;
  const maxVal = Math.max(...dataPoints, 100);
  const chartH = 80;
  return (
    <BounceIn delay={140}>
      <View style={S.trendSection}>
        <View style={S.trendHeader}>
          <TrendUpIcon size={16} color={C.green} />
          <Text style={S.sectionTitle}>Pag-unlad ng Galing</Text>
        </View>
        <View style={S.trendChartBox}>
          {/* Y-axis labels */}
          <View style={S.trendYAxis}>
            <Text style={S.trendYLabel}>100%</Text>
            <Text style={S.trendYLabel}>50%</Text>
            <Text style={S.trendYLabel}>0%</Text>
          </View>
          {/* Bars */}
          <View style={S.trendBars}>
            {dataPoints.map((val, i) => {
              const h = (val / maxVal) * chartH;
              const color = accColor(val);
              return (
                <View key={i} style={S.trendBarCol}>
                  <View style={[S.trendBar, { height: h, backgroundColor: color }]}>
                    <Text style={S.trendBarLabel}>{val.toFixed(0)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <Text style={S.trendCaption}>Huling {dataPoints.length} na pagbasa</Text>
      </View>
    </BounceIn>
  );
}

function FocusCard({ focusType, count, total }: { focusType: string; count: number; total: number }) {
  if (!focusType || count === 0) return null;
  const typeMap: Record<string, { emoji: string; tagalog: string; tip: string }> = {
    substitution: { emoji: '✎', tagalog: 'Pagpapalit', tip: 'Subukang basahin nang dahan-dahan ang bawat salita.' },
    omission: { emoji: '−', tagalog: 'Paglaktaw', tip: 'Ituro ang bawat salita habang binabasa para walang malaktawan.' },
    insertion: { emoji: '+', tagalog: 'Pagsingit', tip: 'Basahin muna nang tahimik bago basahin nang malakas.' },
    repetition: { emoji: '↺', tagalog: 'Pag-uulit', tip: 'Huwag matakot magkamali, tuloy lang ang pagbasa!' },
  };
  const info = typeMap[focusType] || { emoji: '?', tagalog: focusType, tip: '' };
  return (
    <BounceIn delay={160}>
      <View style={S.focusCard}>
        <View style={S.focusHeader}>
          <AlertTriangleIcon size={16} color={C.orange} />
          <Text style={S.sectionTitle}>Pagtuunan ng Pansin</Text>
        </View>
        <View style={S.focusBody}>
          <View style={S.focusIconBox}>
            <Text style={S.focusEmoji}>{info.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.focusType}>{info.tagalog}</Text>
            <Text style={S.focusStat}>{count} beses sa {total} na pagbasa</Text>
            <Text style={S.focusTip}>💡 {info.tip}</Text>
          </View>
        </View>
      </View>
    </BounceIn>
  );
}

export default function ReadingHistoryScreen() {
  const [groupedReports, setGroupedReports] = useState<AralinGroupedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Progression tracking
  const [lastPassage, setLastPassage] = useState<string>('—');
  const [talataCount, setTalataCount] = useState<number>(0);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  // New enhancement states
  const [streak, setStreak] = useState(0);
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [earnedBadges, setEarnedBadges] = useState<typeof BADGE_DEFS>([]);
  const [trendData, setTrendData] = useState<number[]>([]);
  const [focusType, setFocusType] = useState('');
  const [focusMiscueCount, setFocusMiscueCount] = useState(0);

  const { handleLogout, handleBackStep } = useNavigationHelper();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchReports();
    }
  }, [isFocused]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth().currentUser;
      if (!user) return;

      const reports = await MiscueReportController.getStudentReports(user.uid);
      const grouped = groupReportsByAralin(reports);
      setGroupedReports(grouped);
      setTotalAttempts(reports.length);

      // Calculate talata specific stats
      const allPassages = reports.filter(r => {
        const t = r.passageTitle?.toLowerCase() || '';
        return !t.includes('alphabet') && !t.includes('words for') && (t.length > 3);
      });

      const uniquePassages = new Set(allPassages.map(p => p.passageTitle));
      setTalataCount(uniquePassages.size);

      if (allPassages.length > 0) {
        setLastPassage(allPassages[0].passageTitle || '—');
      }

      // Progression for unlocked count
      const mastered = await MiscueReportController.getStudentMasteredLessons(user.uid);
      setUnlockedCount(mastered.length + 1);

      // ── Enhancement calculations ──────────────────────────────────────
      // 1. Streak & Weekly Calendar
      const reportDates = reports.map(r => {
        const d = r.timestamp?.toDate?.() || new Date(r.timestamp || 0);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });
      const uniqueDates = [...new Set(reportDates)].sort((a, b) => b - a);
      let streakCount = 0;
      const today = new Date();
      const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const oneDay = 86400000;
      for (let i = 0; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === todayMs - i * oneDay || uniqueDates[i] === todayMs - (i + 1) * oneDay) {
          streakCount++;
        } else break;
      }
      // Adjust: if streak started from yesterday, still count
      if (uniqueDates[0] !== todayMs && uniqueDates[0] === todayMs - oneDay) {
        // streak is valid from yesterday
      } else if (uniqueDates[0] !== todayMs) {
        streakCount = 0;
      }
      setStreak(streakCount);

      // Weekly calendar (Mon–Sun of current week)
      const dayOfWeek = today.getDay(); // 0=Sun
      const mondayMs = todayMs - ((dayOfWeek === 0 ? 6 : dayOfWeek - 1) * oneDay);
      const week = Array.from({ length: 7 }, (_, i) => {
        const dayMs = mondayMs + i * oneDay;
        return uniqueDates.includes(dayMs);
      });
      setWeekDays(week);

      // 2. Badges
      const allReportData: ReportData[] = grouped.flatMap(g => g.activities.flatMap(a => a.reports));
      const earned = BADGE_DEFS.filter(b => b.check(allReportData));
      setEarnedBadges(earned);

      // 3. Trend data (last 7 accuracy readings, oldest first)
      const sortedByDate = [...allReportData].sort((a, b) => {
        const ta = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
        const tb = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
        return ta.getTime() - tb.getTime();
      });
      const last7 = sortedByDate.slice(-7).map(r => r.accuracyRate);
      setTrendData(last7);

      // 4. Focus area (most common miscue type)
      let sTotal = 0, oTotal = 0, iTotal = 0, rTotal = 0;
      allReportData.forEach(rep => {
        sTotal += Number(rep.substitutionCount || 0);
        oTotal += Number(rep.omissionCount || 0);
        iTotal += Number(rep.insertionCount || 0);
        rTotal += Number(rep.repetitionCount || 0);
      });
      const miscueTotals = [
        { type: 'substitution', count: sTotal },
        { type: 'omission', count: oTotal },
        { type: 'insertion', count: iTotal },
        { type: 'repetition', count: rTotal },
      ].sort((a, b) => b.count - a.count);
      if (miscueTotals[0].count > 0) {
        setFocusType(miscueTotals[0].type);
        setFocusMiscueCount(miscueTotals[0].count);
      }

    } catch (e) {
      console.log("Error fetching history:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const groupReportsByAralin = (reports: MiscueReportDocument[]): AralinGroupedData[] => {
    const aralinMap = new Map<number, AralinGroupedData>();

    const getReportAralin = (title: string) => {
      const t = title.toLowerCase();

      // 1. Exact Passage Title Check
      const p = readingMaterialData.Passages.find(p => p.title.toLowerCase() === t);
      if (p) return { idx: (p.aralin ?? 1) - 1, type: 'Talata' as const, letter: '', title: p.title };

      // 2. Format Detection (Alphabet - M, Words for M)
      let letter = '';
      let type: 'Titik' | 'Salita' = 'Titik';

      if (t.includes('alphabet')) {
        letter = t.split('-')[1]?.trim() || '';
        type = 'Titik';
      } else if (t.includes('words for')) {
        letter = t.split('for')[1]?.trim() || '';
        type = 'Salita';
      } else if (t.length <= 3) {
        // Fallback for plain letters or common legacy formats (e.g. "M", "M-")
        letter = t.replace(/[^a-z]/g, '').trim().toUpperCase();
        // Check if this letter exists in our alphabet
        const exists = alphabetData.some(a => a.letter.toUpperCase() === letter);
        if (exists) type = 'Titik';
        else letter = '';
      }

      if (letter) {
        const aIdx = alphabetData.findIndex(a => a.letter.toUpperCase() === letter.toUpperCase());
        if (aIdx !== -1) {
          return {
            idx: aIdx,
            type,
            letter,
            title: type === 'Titik' ? `Titik ${letter.toUpperCase()}` : `Mga Salita (${letter.toUpperCase()})`
          };
        }
      }

      // 3. Catch-all for unknown passages (Put in Aralin 1 or find any aralin index)
      return { idx: 0, type: 'Talata' as const, letter: '', title };
    };

    reports.forEach(r => {
      const info = getReportAralin(r.passageTitle || '');
      if (info.idx === -1) return;

      if (!aralinMap.has(info.idx)) {
        aralinMap.set(info.idx, {
          aralinIndex: info.idx,
          aralinLabel: `Aralin ${info.idx + 1}`,
          letter: alphabetData[info.idx]?.letter || '?',
          accent: ACCENT_COLORS[info.idx % ACCENT_COLORS.length],
          activities: []
        });
      }

      const aralin = aralinMap.get(info.idx)!;
      let actGroup = aralin.activities.find(a => a.title === info.title);
      if (!actGroup) {
        actGroup = { type: info.type, title: info.title, reports: [] };
        aralin.activities.push(actGroup);
      }

      actGroup.reports.push({
        id: r.reportId,
        timestamp: r.timestamp,
        accuracyRate: r.accuracyRate ?? 0,
        wordPerMin: r.wordPerMin ?? 0,
        totalWords: r.totalWords ?? 0,
        recordingDuration: r.recordingDuration,
        substitution: r.substitution ?? 'None',
        omission: r.omission ?? 'None',
        insertion: r.insertion ?? 'None',
        repetition: r.repetition ?? 'None',
        miscues: r.miscues ?? [],
        totalMiscues: (r as any).totalMiscues,
        substitutionCount: (r as any).substitutionCount,
        omissionCount: (r as any).omissionCount,
        insertionCount: (r as any).insertionCount,
        repetitionCount: (r as any).repetitionCount,
      });
    });

    // Sort aralin by newest activity first, then activities by type order
    return Array.from(aralinMap.values())
      .map(aralin => {
        // Calculate latest timestamp for this Aralin
        const allActs = aralin.activities.flatMap(a => a.reports);
        const latestTime = Math.max(...allActs.map(r => {
          const d = r.timestamp?.toDate?.() || new Date(r.timestamp || 0);
          return d.getTime();
        }));

        aralin.activities.sort((a, b) => {
          const order = { 'Titik': 0, 'Salita': 1, 'Talata': 2 };
          return order[a.type] - order[b.type];
        });

        // Sort reports by date descending inside each activity
        aralin.activities.forEach(act => {
          act.reports.sort((a, b) => {
            const A = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
            const B = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
            return B.getTime() - A.getTime();
          });
        });

        return { ...aralin, latestTime };
      })
      .sort((a, b) => b.latestTime - a.latestTime);
  };

  // Helper for old toggle logic
  const toggle = (i: number) => { }; // Stub for compat

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={S.bg}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.green }} />
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.teal }} />
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.orange }} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.slate }}>Kinukuha ang iyong kasaysayan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.bg}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Bubbles */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
        </View>

        {/* Nav */}
        <View style={{ zIndex: 100 }}>
          <View style={S.headerBar}>
            <TouchableOpacity style={S.headerMenuBtn} onPress={handleBackStep} activeOpacity={0.7}>
              <BackArrow />
            </TouchableOpacity>
            <Text style={S.headerTitleText}>Kasaysayan ng Pagbabasa</Text>
            <View style={{ width: 44, opacity: 0 }} />
          </View>
        </View>

        {/* ── Top Summary Card ─────────────────────────────────────────── */}
        {!isLoading && groupedReports.length > 0 && (
          <BounceIn delay={40}>
            <View style={S.topStatsCard}>
              <View style={S.topStatCol}>
                <Text style={S.topStatVal}>{talataCount}</Text>
                <Text style={S.topStatLab}>Talata</Text>
              </View>
              
              <View style={S.topStatDivider} />
              
              <View style={S.topStatCol}>
                <Text style={S.topStatVal} adjustsFontSizeToFit numberOfLines={1}>
                  {totalAttempts}
                </Text>
                <Text style={S.topStatLab}>Subok</Text>
              </View>
              
              <View style={S.topStatDivider} />
              
              <View style={S.topStatCol}>
                <Text style={S.topStatVal} adjustsFontSizeToFit numberOfLines={1}>
                  {(() => {
                    const all = groupedReports.flatMap(g => g.activities.flatMap(a => a.reports.map(r => r.accuracyRate)));
                    if (!all.length) return '—';
                    const avg = all.reduce((s, v) => s + v, 0) / all.length;
                    return Number(avg.toFixed(1)) + '%';
                  })()}
                </Text>
                <Text style={S.topStatLab}>Galing</Text>
              </View>
              
              <View style={S.topStatDivider} />
              
              <View style={S.topStatCol}>
                <Text style={S.topStatVal} adjustsFontSizeToFit numberOfLines={1}>
                  {(() => {
                    const allWpm = groupedReports.flatMap(g => g.activities.flatMap(a => a.reports.map(r => r.wordPerMin || 0)));
                    return allWpm.length ? Math.max(...allWpm) : 0;
                  })()}
                </Text>
                <Text style={S.topStatLab}>Bilis (WPM)</Text>
              </View>
            </View>
          </BounceIn>
        )}

        {/* ── Streak & Weekly Calendar ──────────────────────────────────────── */}
        {!isLoading && groupedReports.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <StreakCalendar streak={streak} weekDays={weekDays} />
          </View>
        )}

        {/* ── Badges / Trophy Room ─────────────────────────────────────────── */}
        {!isLoading && groupedReports.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <BadgesRow badges={earnedBadges} />
          </View>
        )}

        {/* ── Performance Trend Chart ──────────────────────────────────────── */}
        {!isLoading && groupedReports.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <TrendChart dataPoints={trendData} />
          </View>
        )}

        {/* ── Area of Focus ────────────────────────────────────────────────── */}
        {!isLoading && groupedReports.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <FocusCard focusType={focusType} count={focusMiscueCount} total={totalAttempts} />
          </View>
        )}

        {/* ── Aralin Mastery Roadmap ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 40, marginTop: 4 }}>
          {groupedReports.map((aralinGroup, i) => (
            <AralinMasteryCard key={aralinGroup.aralinIndex} group={aralinGroup} />
          ))}
          {groupedReports.length === 0 && !isLoading && (
            <View style={S.emptyState}>
              <HistoryIcon size={64} color={C.greenLight} />
              <Text style={S.emptyTitle}>Wala pang kasaysayan</Text>
              <Text style={S.emptyHint}>Simulan ang iyong paglalakbay sa pagbabasa para makita ang iyong pag-unlad dito!</Text>
            </View>
          )}
        </View>

        <LogoutModal
          visible={logoutVisible}
          onCancel={() => setLogoutVisible(false)}
          onConfirm={async () => { setLogoutVisible(false); await handleLogout(); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },

  // ── Header ──────────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 100,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5b8fcb',
    textShadowColor: 'rgba(255,255,255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 6
  },
  headerMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },
  menuIcon: { width: 22, height: 22, tintColor: C.ink },

  // Top Summary Card (match exactly reading history screenshot)
  topStatsCard: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
    marginTop: 10,
    ...Shadows.cardLift,
  },
  topStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  topStatVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3b5998',
  },
  topStatLab: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  topStatDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#dae6f2',
  },

  latestBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
  latestBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.green + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendText: { fontSize: 10, fontWeight: '800', color: C.green },
  summaryPillLabel: { fontSize: 11, color: C.white, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  // Aralin Mastery Card
  aralinCard: {
    backgroundColor: C.white, borderRadius: 28,
    marginBottom: 20, borderTopWidth: 6,
    ...Shadows.cardLift, overflow: 'hidden', padding: 20,
  },
  aralinHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  aralinIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  aralinLetter: { fontSize: 28, fontWeight: '900', textTransform: 'uppercase', fontFamily: 'Poppins-ExtraBold' },
  aralinLabelText: { fontSize: 17, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'Poppins-Bold' },
  aralinTitleText: { fontSize: 22, fontWeight: '900', color: C.ink, fontFamily: 'Poppins-Bold' },
  aralinSummaryPills: { flexDirection: 'row', gap: 6 },
  miniPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  miniPillText: { fontSize: 12, fontWeight: '800' },

  // Progress Bar
  progressContainer: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabel: { fontSize: 12, fontWeight: '700' },
  progressValue: { fontSize: 14, fontWeight: '800' },
  progressBarBg: { height: 10, backgroundColor: C.bg, borderRadius: 5, overflow: 'hidden' as const },
  progressBarFill: { height: '100%' as any, borderRadius: 5 },

  // Section title
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.ink, marginLeft: 4 },

  // Streak & Calendar
  streakCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 14,
    ...Shadows.card,
  },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  streakFireBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  streakCount: { fontSize: 28, fontWeight: '900', color: '#e67e22' },
  streakTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  streakSub: { fontSize: 12, fontWeight: '600', color: C.slate, marginTop: 2 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calendarDayBox: { alignItems: 'center', gap: 4 },
  calendarDayLabel: { fontSize: 11, fontWeight: '700', color: C.slate },
  calendarDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  calendarDotActive: { backgroundColor: C.green },
  calendarDotInactive: { backgroundColor: C.bg },

  // Badges
  badgesSection: { marginBottom: 14 },
  badgeCard: {
    width: 100, backgroundColor: C.white, borderRadius: 16, padding: 12,
    alignItems: 'center', borderWidth: 1.5, ...Shadows.subtle,
  },
  badgeLocked: { borderColor: C.bg, opacity: 0.5 },
  badgeIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  badgeName: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  badgeDesc: { fontSize: 9, fontWeight: '600', color: C.slate, textAlign: 'center', marginTop: 2 },

  // Trend Chart
  trendSection: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 14,
    ...Shadows.card,
  },
  trendHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  trendChartBox: { flexDirection: 'row', height: 100 },
  trendYAxis: { justifyContent: 'space-between', marginRight: 6, paddingVertical: 4 },
  trendYLabel: { fontSize: 9, fontWeight: '700', color: C.slate },
  trendBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-evenly', gap: 4 },
  trendBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  trendBar: { width: '70%', borderRadius: 6, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2, minHeight: 8 },
  trendBarLabel: { fontSize: 8, fontWeight: '800', color: C.white },
  trendCaption: { fontSize: 10, fontWeight: '600', color: C.slate, textAlign: 'center', marginTop: 8 },

  // Focus Card
  focusCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 14,
    borderLeftWidth: 4, borderLeftColor: '#e67e22',
    ...Shadows.card,
  },
  focusHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  focusBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  focusIconBox: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#e67e22' + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  focusEmoji: { fontSize: 20 },
  focusType: { fontSize: 15, fontWeight: '800', color: C.ink },
  focusStat: { fontSize: 11, fontWeight: '700', color: C.slate, marginTop: 2 },
  focusTip: { fontSize: 11, fontWeight: '600', color: C.orange, marginTop: 4, lineHeight: 16 },

  // Accordion & Detailed Attempt Styles
  talataSection: { marginTop: 4, paddingTop: 16 },
  sessionsHeaderTitle: { fontSize: 13, fontWeight: '800', marginBottom: 12, marginLeft: 4, fontFamily: 'Poppins-Bold' },

  accordionContainer: {
    marginBottom: 12,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: C.white,
  },
  accordionIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  accordionTitle: { fontSize: 17, fontWeight: '700', color: C.ink, fontFamily: 'Poppins-Bold' },
  accordionSub: { fontSize: 13, color: C.slate, marginTop: 2, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  chevronBox: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  chevronIcon: { fontSize: 12, fontWeight: '900' },

  accordionBody: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },

  attemptCard: {
    backgroundColor: '#f8fafd',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  attemptCardBest: {
    backgroundColor: '#fdfce9',
    borderWidth: 1.5,
    borderColor: '#f1c40f',
  },
  bestRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#f1c40f',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bestRibbonText: { color: C.white, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  attemptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  attemptDate: { fontSize: 14, color: '#3b5998', fontWeight: '600' },
  attemptBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  attemptBadgeText: { color: C.white, fontSize: 12, fontWeight: '800' },

  viewAllBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#3b5998' + '15',
    borderRadius: 12,
  },
  viewAllText: { fontSize: 13, fontWeight: '700', color: '#3b5998' },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridCell: {
    width: '47%',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8f0fe',
  },
  gridVal: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  gridLab: { fontSize: 12, color: C.slate, fontWeight: '500' },

  miscueBreakdownBox: { marginTop: 4 },
  miscueBreakdownTitle: { fontSize: 15, fontWeight: '700', color: '#3b5998', marginBottom: 12 },
  miscueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8f0fe',
    marginBottom: 8,
  },
  miscueTag: { width: 100, paddingVertical: 6, borderRadius: 8, alignItems: 'center', marginRight: 12 },
  miscueTagText: { fontSize: 12, fontWeight: '700' },
  miscueWordList: { flex: 1, fontSize: 14, color: C.ink, fontStyle: 'italic' },

  perfectBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  perfectText: { fontSize: 14, fontWeight: '800' },

  // Empty
  emptyState: {
    alignItems: 'center', paddingTop: 60, paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'center', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: C.slate, textAlign: 'center', lineHeight: 21 },
  skeletonCard: { backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 12 },
});
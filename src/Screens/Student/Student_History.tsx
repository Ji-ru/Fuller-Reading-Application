import auth from '@react-native-firebase/auth';
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
interface GroupedReport {
  passageTitle: string;
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

// ─── Miscue pill ─────────────────────────────────────────────────────────────
function MiscuePill({ label, value, color }: { label: string; value: string; color: string }) {
  if (!value || value === 'None') return null;
  return (
    <View style={[S.miscuePill, { backgroundColor: color + '18', borderColor: color }]}>
      <Text style={[S.miscuePillLabel, { color }]}>{label}</Text>
      <Text style={S.miscuePillValue}>{value}</Text>
    </View>
  );
}

// ─── Report Card ─────────────────────────────────────────────────────────────
function ReportCard({ report, index }: { report: ReportData; index: number }) {
  const [open, setOpen] = useState(false);
  const rotAnim = useRef(new Animated.Value(0)).current;
  const hgtAnim = useRef(new Animated.Value(0)).current;

  const totalMiscues = report.totalMiscues ?? report.miscues?.length ?? 0;
  const acc = report.accuracyRate;
  const color = accColor(acc);

  const toggle = () => {
    Animated.parallel([
      Animated.timing(rotAnim, { toValue: open ? 0 : 1, duration: 220, useNativeDriver: true }),
      Animated.timing(hgtAnim, { toValue: open ? 0 : 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setOpen(v => !v);
  };

  const rotate = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const formatDate = (ts: any) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return 'Unknown Date'; }
  };

  const formatDur = (dur?: string | number) => {
    if (!dur && dur !== 0) return 'N/A';
    if (typeof dur === 'string') return dur;
    return `${Math.floor((dur as number) / 60)}:${Math.floor((dur as number) % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View style={[S.reportCard, { borderLeftColor: color }]}>
      {/* Summary row */}
      <View style={S.reportSummary}>
        {/* Accuracy badge */}
        <View style={[S.accBadge, { backgroundColor: color }]}>
          <AccuracyFeedbackIcon accuracy={acc} size={18} />
          <Text style={S.accBadgeVal}>{acc.toFixed(0)}%</Text>
        </View>

        <View style={{ flex: 1, paddingLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={S.reportDate}>{formatDate(report.timestamp)}</Text>
            {index === 0 && (
              <View style={[S.latestBadge, { backgroundColor: color + '22' }]}>
                <Text style={[S.latestBadgeText, { color }]}>Pinakahuli</Text>
              </View>
            )}
          </View>
          <View style={S.reportMetaRow}>
            {report.wordPerMin > 0 && report.totalWords > 5 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ZapIcon size={12} color={C.inkLight} />
                <Text style={S.reportMeta}>{report.wordPerMin} WPM</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TimerIcon size={12} color={C.inkLight} />
              <Text style={S.reportMeta}>{formatDur(report.recordingDuration)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <AlertTriangleIcon size={12} color={totalMiscues === 0 ? C.green : C.orange} />
              <Text style={[S.reportMeta, { color: totalMiscues === 0 ? C.green : C.orange }]}>
                {totalMiscues} mali
              </Text>
            </View>
          </View>
          {totalMiscues === 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <PartyIcon size={14} color={C.green} />
              <Text style={S.perfectText}>Walang pagkakamali!</Text>
            </View>
          )}
        </View>
      </View>

      {/* Detail section — always visible now */}
      <View style={S.reportDetail}>
        <View style={S.detailDivider} />

        {/* Accuracy bar */}
        <View style={S.barBg}>
          <View style={[S.barFill, { width: `${acc}%`, backgroundColor: color }]} />
        </View>
        <View style={S.barLabels}>
          <Text style={[S.barLabelLeft, { color }]}>{acc.toFixed(0)}% Katumpakan</Text>
          <Text style={S.barLabelRight}>{accLabel(acc)}</Text>
        </View>

        {/* Miscue pills (simplified) */}
        {totalMiscues > 0 && (
          <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {Number(report.substitutionCount) > 0 && <Text style={[S.miniMiscue, { color: C.red }]}>• {report.substitutionCount} Pagpapalit</Text>}
            {Number(report.omissionCount) > 0 && <Text style={[S.miniMiscue, { color: C.orange }]}>• {report.omissionCount} Kaligtaan</Text>}
            {Number(report.insertionCount) > 0 && <Text style={[S.miniMiscue, { color: C.teal }]}>• {report.insertionCount} Pagsingit</Text>}
            {Number(report.repetitionCount) > 0 && <Text style={[S.miniMiscue, { color: '#9b59b6' }]}>• {report.repetitionCount} Pag-uulit</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Aralin Group ─────────────────────────────────────────────────────────────
function AralinGroup({
  group,
  index,
}: {
  group: GroupedReport;
  index: number;
}) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  // Detect Category
  const getCategoryInfo = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('alphabet')) return { label: 'Titik', icon: TypeIcon, name: title.split('-')[1]?.trim() || title };
    if (t.includes('words for')) return { label: 'Salita', icon: FileTextIcon, name: title.split('for')[1]?.trim() || title };
    return { label: 'Talata', icon: BookOpenIcon, name: title };
  };

  const cat = getCategoryInfo(group.passageTitle);
  const Icon = cat.icon;

  // Best accuracy across attempts
  const bestAcc = Math.max(...group.reports.map(r => r.accuracyRate));
  const col = accColor(bestAcc);

  return (
    <BounceIn delay={index * 70}>
      <View style={S.passageGroup}>
        {/* Header */}
        <View style={[S.passageHeader, { borderLeftColor: accent }]}>
          {/* Icon bubble */}
          <View style={[S.passageIconBubble, { backgroundColor: accent + '22' }]}>
            <Icon size={22} color={accent} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={S.categoryLabel}>{cat.label}</Text>
              <MasteryStar accuracy={bestAcc} />
            </View>
            <Text style={S.passageTitle} numberOfLines={2}>{cat.name}</Text>
            <View style={S.passageMeta}>
              <View style={[S.attemptBadge, { backgroundColor: accent }]}>
                <Text style={S.attemptBadgeText}>{group.reports.length} subok</Text>
              </View>
              {group.reports.length > 1 && group.reports[0].accuracyRate > group.reports[1].accuracyRate && (
                <View style={S.trendBadge}>
                  <TrendUpIcon size={12} color={C.green} />
                  <Text style={S.trendText}>Improving</Text>
                </View>
              )}
              <Text style={[S.bestAccText, { color: col }]}>
                Mastery: {bestAcc.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Reports (Showing only the latest ONE to focus on important data, or small list) */}
        <View style={S.reportsContainer}>
          {group.reports.slice(0, 1).map((report, ri) => (
            <ReportCard key={report.id} report={report} index={ri} />
          ))}
          {group.reports.length > 1 && (
            <Text style={S.olderAttemptsText}>+ {group.reports.length - 1} pang mga nakaraang subok</Text>
          )}
        </View>
      </View>
    </BounceIn>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReadingHistoryScreen() {
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPassages, setExpandedPassages] = useState<Set<number>>(new Set());
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Progression tracking
  const [unlockedCount, setUnlockedCount] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const { handleLogout, handleBackStep } = useNavigationHelper();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth().currentUser;
      if (!user) return;

      // 1. Fetch reports
      const reports = await MiscueReportController.getStudentReports(user.uid);
      setGroupedReports(groupReportsByPassage(reports));
      setTotalAttempts(reports.length);

      // 2. Fetch progression to calculate "Open Aralin"
      const { completedAlpha, completedWords } = await MiscueReportController.getStudentDetailedCompletion(user.uid);

      const getTotalWords = (letter: string) => {
        const subset = wordsData.filter(w => w.letter === letter);
        const all = subset.flatMap(w => w.contrasts.flatMap(c => c.words));
        return Array.from(new Set(all)).filter(word => word.trim().toLowerCase() !== letter.toLowerCase()).length;
      };

      let openCount = 1;
      for (let i = 0; i < alphabetData.length; i++) {
        const letter = alphabetData[i].letter;
        const isAlphaDone = completedAlpha.has(letter);
        const wordCount = completedWords[letter]?.size || 0;
        const totalW = getTotalWords(letter);
        if (isAlphaDone && (totalW === 0 || wordCount >= totalW)) {
          openCount = i + 2;
        } else {
          break;
        }
      }
      setUnlockedCount(Math.min(openCount, alphabetData.length));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const groupReportsByPassage = (reports: MiscueReportDocument[]): GroupedReport[] => {
    const map = new Map<string, ReportData[]>();
    reports.forEach(r => {
      const title = r.passageTitle || 'Unknown Passage';
      if (!map.has(title)) map.set(title, []);
      map.get(title)!.push({
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
    return Array.from(map.entries()).map(([passageTitle, reps]) => ({
      passageTitle,
      reports: reps.sort((a, b) => {
        const A = a.timestamp?.toDate?.() || new Date(0);
        const B = b.timestamp?.toDate?.() || new Date(0);
        return B.getTime() - A.getTime();
      }),
    }));
  };

  const toggle = (i: number) => {
    setExpandedPassages(prev => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });
  };

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
            <Image style={S.headerLogo} source={require('../../../assets/images/cisckids.png')} resizeMode="contain" />
            <View style={{ width: 44 }} />
          </View>
        </View>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <BounceIn delay={40}>
          <View style={S.heroBanner}>
            <View>
              <Text style={S.heroSub}>Ang iyong</Text>
              <Text style={S.heroTitle}>Kasaysayan ng{'\n'}Pagbabasa</Text>
            </View>
            <View style={S.heroStars}>
              <StarIcon size={36} color={C.yellow} />
              <StarIcon size={20} color={C.orange} />
            </View>
          </View>
        </BounceIn>

        {/* ── Summary statistics ────────────────────────────────────────────── */}
        {!isLoading && groupedReports.length > 0 && (
          <BounceIn delay={80}>
            <View style={S.summaryGrid}>
              {/* Unlocked / Attempted */}
              <View style={[S.sumCard, { borderColor: C.teal + '33' }]}>
                <View style={[S.sumIconBox, { backgroundColor: C.teal + '15' }]}><LockIcon size={20} color={C.teal} /></View>
                <View>
                  <Text style={S.sumVal}>{unlockedCount}</Text>
                  <Text style={S.sumLabel}>Aralin na Bukas</Text>
                </View>
              </View>

              <View style={[S.sumCard, { borderColor: C.green + '33' }]}>
                <View style={[S.sumIconBox, { backgroundColor: C.green + '15' }]}><BookOpenIcon size={20} color={C.green} /></View>
                <View>
                  <Text style={S.sumVal}>{groupedReports.length}</Text>
                  <Text style={S.sumLabel}>Aralin na Nasubukan</Text>
                </View>
              </View>

              <View style={[S.sumCard, { borderColor: C.orange + '33' }]}>
                <View style={[S.sumIconBox, { backgroundColor: C.orange + '15' }]}><HistoryIcon size={20} color={C.orange} /></View>
                <View>
                  <Text style={S.sumVal}>{totalAttempts}</Text>
                  <Text style={S.sumLabel}>Kabuuang Subok</Text>
                </View>
              </View>

              <View style={[S.sumCard, { borderColor: '#9b59b633' }]}>
                <View style={[S.sumIconBox, { backgroundColor: '#9b59b615' }]}><BarChartIcon size={20} color={'#9b59b6'} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={S.sumVal}>
                    {(() => {
                      const all = groupedReports.flatMap(g => g.reports.map(r => r.accuracyRate));
                      return all.length ? (all.reduce((s, v) => s + v, 0) / all.length).toFixed(0) + '%' : '—';
                    })()}
                  </Text>
                  <Text style={S.sumLabel}>Mastery Balance</Text>
                </View>
              </View>
            </View>
          </BounceIn>
        )}

        {/* ── Passage groups ────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 40, marginTop: 4 }}>
          {groupedReports.map((group, i) => (
            <AralinGroup
              key={i}
              group={group}
              index={i}
            />
          ))}
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
  headerLogo: { width: 140, height: 48 },
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

  // Hero
  heroBanner: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.white, borderRadius: Radii.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 18,
    ...Shadows.cardLift,
  },
  heroSub: { fontSize: 13, color: C.slate, fontWeight: '600' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: C.greenDeep, lineHeight: 28, marginTop: 2 },
  heroStars: { alignItems: 'center', gap: 4 },


  // Summary pills
  summaryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginBottom: 16, marginTop: 8,
  },
  sumCard: {
    flex: 1, minWidth: '45%', backgroundColor: C.white, borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, ...Shadows.card,
  },
  sumIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sumVal: { fontSize: 18, fontWeight: '800', color: C.ink },
  sumLabel: { fontSize: 11, fontWeight: '700', color: C.slate, marginTop: -2 },

  latestBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
  latestBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.green + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendText: { fontSize: 10, fontWeight: '800', color: C.green },
  summaryPillLabel: { fontSize: 11, color: C.white, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  // Passage group
  passageGroup: {
    backgroundColor: C.white, borderRadius: Radii.lg,
    marginBottom: 14,
    ...Shadows.card,
    overflow: 'hidden',
  },
  passageHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderLeftWidth: 5, gap: 12,
  },
  passageIconBubble: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },

  passageTitle: { fontSize: 15, fontWeight: '800', color: C.ink, lineHeight: 20, marginBottom: 4 },
  categoryLabel: { fontSize: 10, fontWeight: '700', color: C.slate, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  passageMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  attemptBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  attemptBadgeText: { fontSize: 11, color: C.white, fontWeight: '700' },
  bestAccText: { fontSize: 12, fontWeight: '700' },
  passageChevron: { fontSize: 20, fontWeight: '900' },

  // Reports container
  reportsContainer: {
    paddingHorizontal: 12, paddingBottom: 12, paddingTop: 4,
    borderTopWidth: 1, borderTopColor: C.greenLight,
  },

  // Report card
  reportCard: {
    backgroundColor: C.greenPale, borderRadius: 14,
    borderLeftWidth: 4, marginBottom: 10, overflow: 'hidden',
  },
  reportSummary: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 4,
  },
  accBadge: {
    width: 60, borderRadius: 12, paddingVertical: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  accBadgeVal: { fontSize: 13, fontWeight: '800', color: C.white, marginTop: 2 },
  reportDate: { fontSize: 11, color: C.slate, marginBottom: 4 },
  reportMetaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  reportMeta: { fontSize: 12, color: C.inkLight, fontWeight: '600' },
  perfectText: { fontSize: 12, color: C.green, fontWeight: '700', marginTop: 4 },
  chevron: { fontSize: 18, color: C.slate, paddingLeft: 4 },

  // Report detail
  reportDetail: { paddingHorizontal: 14, paddingBottom: 14 },
  detailDivider: { height: 1, backgroundColor: C.greenLight, marginBottom: 10 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: C.inkLight, marginBottom: 6 },

  // Accuracy bar
  barBg: { height: 10, backgroundColor: C.greenLight, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 4 },
  barLabelLeft: { fontSize: 13, fontWeight: '800' },
  barLabelRight: { fontSize: 12, color: C.slate },

  // Miscue pills
  miscuePill: {
    borderRadius: 10, borderWidth: 1.5,
    paddingHorizontal: 10, paddingVertical: 7,
    marginBottom: 6,
  },
  miscuePillLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  miscuePillValue: { fontSize: 13, color: C.ink },

  miniMiscue: { fontSize: 11, fontWeight: '700' },
  olderAttemptsText: { fontSize: 10, color: C.slate, textAlign: 'right', marginTop: 4, fontStyle: 'italic' },

  // Empty
  emptyState: {
    alignItems: 'center', paddingTop: 60, paddingHorizontal: 32,
  },

  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'center', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: C.slate, textAlign: 'center', lineHeight: 21 },

  // Skeleton
  skeletonCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 12,
  },
});
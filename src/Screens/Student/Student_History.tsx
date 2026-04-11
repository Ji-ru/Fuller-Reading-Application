import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import bubbles from '../../UI_Designs/BubblesDesign';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import { StudentColors as C, Radii, Shadows, ACCENT_COLORS } from '../../Utilities/Theme';
import { BounceIn, Skeleton } from '../../Components/GlobalUse/Animations';
import { BookOpenIcon, StarIcon, TrophyIcon, ThumbsUpIcon, FlexIcon, ZapIcon, TimerIcon, AlertTriangleIcon, PartyIcon } from '../../Components/GlobalUse/Icons';

const { width: SW } = Dimensions.get('window');

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

// Palette and accent colors imported from Theme

// ─── Helpers ──────────────────────────────────────────────────────────────────
const accColor = (a: number) => a >= 90 ? C.green : a >= 75 ? C.orange : C.red;
const accLabel = (a: number) => a >= 90 ? 'Mahusay!' : a >= 75 ? 'Magaling!' : 'Kaya mo!';
const AccuracyFeedbackIcon = ({ accuracy, size = 18 }: { accuracy: number; size?: number }) => {
  if (accuracy >= 90) return <TrophyIcon size={size} color={C.white} />;
  if (accuracy >= 75) return <ThumbsUpIcon size={size} color={C.white} />;
  return <FlexIcon size={size} color={C.white} />;
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
  const rotAnim  = useRef(new Animated.Value(0)).current;
  const hgtAnim  = useRef(new Animated.Value(0)).current;

  const totalMiscues = report.totalMiscues ?? report.miscues?.length ?? 0;
  const acc   = report.accuracyRate;
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
      {/* Summary row — always visible */}
      <TouchableOpacity onPress={toggle} activeOpacity={0.85} style={S.reportSummary}>
        {/* Accuracy badge */}
        <View style={[S.accBadge, { backgroundColor: color }]}>
          <AccuracyFeedbackIcon accuracy={acc} size={18} />
          <Text style={S.accBadgeVal}>{acc.toFixed(1)}%</Text>
        </View>

        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={S.reportDate}>{formatDate(report.timestamp)}</Text>
          <View style={S.reportMetaRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ZapIcon size={12} color={C.inkLight} />
              <Text style={S.reportMeta}>{report.wordPerMin} WPM</Text>
            </View>
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

        <Animated.Text style={[S.chevron, { transform: [{ rotate }] }]}>▾</Animated.Text>
      </TouchableOpacity>

      {/* Detail section — toggled */}
      {open && (
        <View style={S.reportDetail}>
          <View style={S.detailDivider} />

          {/* Accuracy bar */}
          <Text style={S.detailLabel}>Katumpakan</Text>
          <View style={S.barBg}>
            <View style={[S.barFill, { width: `${acc}%`, backgroundColor: color }]} />
          </View>
          <View style={S.barLabels}>
            <Text style={[S.barLabelLeft, { color }]}>{acc.toFixed(1)}%</Text>
            <Text style={S.barLabelRight}>{accLabel(acc)}</Text>
          </View>

          {/* Miscue pills */}
          {totalMiscues > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={S.detailLabel}>Mga Pagkakamali</Text>
              <MiscuePill label="Pagpapalit"  value={report.substitution} color={C.red}    />
              <MiscuePill label="Kaligtaan"   value={report.omission}     color={C.orange}  />
              <MiscuePill label="Pagsingit"   value={report.insertion}    color={C.teal}    />
              <MiscuePill label="Pag-uulit"   value={report.repetition}   color={'#9b59b6'} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Passage Group ────────────────────────────────────────────────────────────
function PassageGroup({
  group,
  index,
  expanded,
  onToggle,
}: {
  group: GroupedReport;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const accent    = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const rotAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(rotAnim, { toValue: expanded ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [expanded]);

  const rotate = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const press = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  // Best accuracy across attempts
  const bestAcc = Math.max(...group.reports.map(r => r.accuracyRate));
  const col     = accColor(bestAcc);

  return (
    <BounceIn delay={index * 70}>
      <View style={S.passageGroup}>
        {/* Header */}
        <TouchableOpacity onPress={press} activeOpacity={0.88}>
          <Animated.View style={[S.passageHeader, { borderLeftColor: accent, transform: [{ scale: scaleAnim }] }]}>
            {/* Icon bubble */}
            <View style={[S.passageIconBubble, { backgroundColor: accent + '22' }]}>
              <BookOpenIcon size={22} color={accent} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={S.passageTitle} numberOfLines={2}>{group.passageTitle}</Text>
              <View style={S.passageMeta}>
                <View style={[S.attemptBadge, { backgroundColor: accent }]}>
                  <Text style={S.attemptBadgeText}>{group.reports.length} pagtatangka</Text>
                </View>
                <Text style={[S.bestAccText, { color: col }]}>
                  Pinakamataas: {bestAcc.toFixed(1)}%
                </Text>
              </View>
            </View>

            <Animated.Text style={[S.passageChevron, { color: accent, transform: [{ rotate }] }]}>
              ▾
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Reports */}
        {expanded && (
          <View style={S.reportsContainer}>
            {group.reports.map((report, ri) => (
              <ReportCard key={report.id} report={report} index={ri} />
            ))}
          </View>
        )}
      </View>
    </BounceIn>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReadingHistoryScreen() {
  const [groupedReports,    setGroupedReports]    = useState<GroupedReport[]>([]);
  const [isLoading,         setIsLoading]         = useState(true);
  const [expandedPassages,  setExpandedPassages]  = useState<Set<number>>(new Set());
  const [menuVisible,       setMenuVisible]       = useState(false);
  const [logoutVisible,     setLogoutVisible]     = useState(false);

  const { handleLogout, handleBackStep } = useNavigationHelper();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth().currentUser;
      if (!user) return;
      const reports = await MiscueReportController.getStudentReports(user.uid);
      setGroupedReports(groupReportsByPassage(reports));
    } catch {
      // silent — show empty state
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
        id:               r.reportId,
        timestamp:        r.timestamp,
        accuracyRate:     r.accuracyRate     ?? 0,
        wordPerMin:       r.wordPerMin        ?? 0,
        recordingDuration: r.recordingDuration,
        substitution:     r.substitution     ?? 'None',
        omission:         r.omission         ?? 'None',
        insertion:        r.insertion         ?? 'None',
        repetition:       r.repetition        ?? 'None',
        miscues:          r.miscues           ?? [],
        totalMiscues:     (r as any).totalMiscues,
        substitutionCount:(r as any).substitutionCount,
        omissionCount:    (r as any).omissionCount,
        insertionCount:   (r as any).insertionCount,
        repetitionCount:  (r as any).repetitionCount,
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
          <View style={upperNav.header}>
            <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
              <Image source={require('../../../assets/icons/BackButton-icon.png')} />
            </TouchableOpacity>
            <Image style={upperNav.ciscLogo} source={require('../../../assets/images/cisckids.png')} />
            <TouchableOpacity style={upperNav.touchable} onPress={() => setMenuVisible(v => !v)}>
              <Image style={upperNav.menuIcon} source={require('../../../assets/icons/Menu-icon.png')} />
            </TouchableOpacity>
          </View>
          {menuVisible && (
            <View style={upperNav.dropdownMenu}>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
                style={upperNav.logoutButton}
              >
                <Image source={require('../../../assets/icons/Logout-icon.png')} style={upperNav.logoutIcon} />
                <Text style={upperNav.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
          {menuVisible && (
            <TouchableOpacity style={upperNav.closeMenu} onPress={() => setMenuVisible(false)} activeOpacity={1} />
          )}
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

        {/* ── Loading skeletons ─────────────────────────────────────────────── */}
        {isLoading && (
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[S.passageGroup, { padding: 16, marginBottom: 12 }]}>
                <Skeleton h={20} w="65%" />
                <Skeleton h={14} w="40%" />
              </View>
            ))}
          </View>
        )}

        {/* ── Empty state ───────────────────────────────────────────────────── */}
        {!isLoading && groupedReports.length === 0 && (
          <BounceIn delay={100}>
            <View style={S.emptyState}>
              <BookOpenIcon size={56} color={C.mint} />
              <Text style={S.emptyTitle}>Walang nakaraang pagbabasa</Text>
              <Text style={S.emptyHint}>Simulan ang pagbasa para makita ang iyong pag-unlad!</Text>
            </View>
          </BounceIn>
        )}

        {/* ── Summary pills ─────────────────────────────────────────────────── */}
        {!isLoading && groupedReports.length > 0 && (
          <BounceIn delay={80}>
            <View style={S.summaryRow}>
              <View style={[S.summaryPill, { backgroundColor: C.green }]}>
                <Text style={S.summaryPillNum}>{groupedReports.length}</Text>
                <Text style={S.summaryPillLabel}>Talata</Text>
              </View>
              <View style={[S.summaryPill, { backgroundColor: C.teal }]}>
                <Text style={S.summaryPillNum}>
                  {groupedReports.reduce((s, g) => s + g.reports.length, 0)}
                </Text>
                <Text style={S.summaryPillLabel}>Pagtatangka</Text>
              </View>
              <View style={[S.summaryPill, { backgroundColor: C.orange }]}>
                <Text style={S.summaryPillNum}>
                  {(() => {
                    const all = groupedReports.flatMap(g => g.reports.map(r => r.accuracyRate));
                    return all.length ? (all.reduce((s, v) => s + v, 0) / all.length).toFixed(0) + '%' : '—';
                  })()}
                </Text>
                <Text style={S.summaryPillLabel}>Avg. Katumpakan</Text>
              </View>
            </View>
          </BounceIn>
        )}

        {/* ── Passage groups ────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 40, marginTop: 4 }}>
          {groupedReports.map((group, i) => (
            <PassageGroup
              key={i}
              group={group}
              index={i}
              expanded={expandedPassages.has(i)}
              onToggle={() => toggle(i)}
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

  // Hero
  heroBanner: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.white, borderRadius: Radii.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 18,
    ...Shadows.cardLift,
  },
  heroSub:      { fontSize: 13, color: C.slate, fontWeight: '600' },
  heroTitle:    { fontSize: 22, fontWeight: '900', color: C.greenDeep, lineHeight: 28, marginTop: 2 },
  heroStars:    { alignItems: 'center', gap: 4 },


  // Summary pills
  summaryRow: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 16, marginTop: 14, marginBottom: 4,
  },
  summaryPill: {
    flex: 1, borderRadius: 18, paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  summaryPillNum:   { fontSize: 20, fontWeight: '900', color: C.white },
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

  passageTitle:   { fontSize: 15, fontWeight: '800', color: C.ink, lineHeight: 20, marginBottom: 6 },
  passageMeta:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  attemptBadge:   { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  attemptBadgeText:{ fontSize: 11, color: C.white, fontWeight: '700' },
  bestAccText:    { fontSize: 12, fontWeight: '700' },
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

  accBadgeVal:   { fontSize: 13, fontWeight: '800', color: C.white, marginTop: 2 },
  reportDate:    { fontSize: 11, color: C.slate, marginBottom: 4 },
  reportMetaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  reportMeta:    { fontSize: 12, color: C.inkLight, fontWeight: '600' },
  perfectText:   { fontSize: 12, color: C.green, fontWeight: '700', marginTop: 4 },
  chevron:       { fontSize: 18, color: C.slate, paddingLeft: 4 },

  // Report detail
  reportDetail:  { paddingHorizontal: 14, paddingBottom: 14 },
  detailDivider: { height: 1, backgroundColor: C.greenLight, marginBottom: 10 },
  detailLabel:   { fontSize: 12, fontWeight: '700', color: C.inkLight, marginBottom: 6 },

  // Accuracy bar
  barBg:         { height: 10, backgroundColor: C.greenLight, borderRadius: 5, overflow: 'hidden' },
  barFill:       { height: 10, borderRadius: 5 },
  barLabels:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 4 },
  barLabelLeft:  { fontSize: 13, fontWeight: '800' },
  barLabelRight: { fontSize: 12, color: C.slate },

  // Miscue pills
  miscuePill: {
    borderRadius: 10, borderWidth: 1.5,
    paddingHorizontal: 10, paddingVertical: 7,
    marginBottom: 6,
  },
  miscuePillLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  miscuePillValue: { fontSize: 13, color: C.ink },

  // Empty
  emptyState: {
    alignItems: 'center', paddingTop: 60, paddingHorizontal: 32,
  },

  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'center', marginBottom: 8 },
  emptyHint:  { fontSize: 14, color: C.slate, textAlign: 'center', lineHeight: 21 },

  // Skeleton
  skeletonCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 12,
  },
});
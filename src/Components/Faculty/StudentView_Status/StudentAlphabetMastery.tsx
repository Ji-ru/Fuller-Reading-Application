import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useStudentAlphabetMasteryTrends } from '../../../Hooks/Student/useStudentAlphabetMasteryTrends';
import { sw, sh, sf } from '../../../Utils/responsive';

// ============================================================================
// DESIGN TOKENS  (light / white theme)
// ============================================================================

const T = {
  bg: '#ffffff',
  surface: '#f8fafc',
  surface2: '#f1f5f9',
  border: 'rgba(0,0,0,0.07)',
  text: '#0f172a',
  muted: '#64748b',
  dim: '#e2e8f0',

  green: '#34d399',
  greenDim: 'rgba(52,211,153,0.12)',
  greenBd: 'rgba(52,211,153,0.30)',
  amber: '#fbbf24',
  amberDim: 'rgba(251,191,36,0.12)',
  amberBd: 'rgba(251,191,36,0.30)',
  red: '#f87171',
  redDim: 'rgba(248,113,113,0.12)',
  redBd: 'rgba(248,113,113,0.30)',
  violet: '#a78bfa',
  violetDim: 'rgba(167,139,250,0.12)',
  violetBd: 'rgba(167,139,250,0.30)',
  blue: '#60a5fa',
  blueDim: 'rgba(96,165,250,0.12)',

  radius: sw(16),
};

// ============================================================================
// SATOSHI FONT HELPERS
// ============================================================================

const F = {
  black: { fontFamily: 'Satoshi-Black', fontWeight: '900' as const },
  bold: { fontFamily: 'Satoshi-Bold', fontWeight: '700' as const },
  medium: { fontFamily: 'Satoshi-Medium', fontWeight: '500' as const },
  regular: { fontFamily: 'Satoshi-Regular', fontWeight: '400' as const },
  light: { fontFamily: 'Satoshi-Light', fontWeight: '300' as const },
  italic: {
    fontFamily: 'Satoshi-Italic',
    fontStyle: 'italic' as const,
    fontWeight: '400' as const,
  },
  boldItalic: {
    fontFamily: 'Satoshi-BoldItalic',
    fontStyle: 'italic' as const,
    fontWeight: '700' as const,
  },
};

// ============================================================================
// DATE HELPERS  (kept inline — matches your current file)
// ============================================================================

type TimeRange = 'week' | 'month' | 'year';

function getDateRangeForTimeFilter(
  timeRange: TimeRange,
): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  if (timeRange === 'week') {
    const currentDay = end.getDay();
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    start.setDate(end.getDate() - daysSinceMonday);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (timeRange === 'month') {
    start.setMonth(end.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    // school year: June → August next year
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 5) {
      start.setFullYear(year);
      start.setMonth(5);
      start.setDate(1);
      end.setFullYear(year + 1);
      end.setMonth(7);
      end.setDate(31);
    } else {
      start.setFullYear(year - 1);
      start.setMonth(5);
      start.setDate(1);
      end.setFullYear(year);
      end.setMonth(7);
      end.setDate(31);
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

// ============================================================================
// TYPES (UI expects these fields; your hook/controller should provide them)
// ============================================================================

export interface AlphabetSessionData {
  alphabetSessionId: string;
  studentId: string;
  date: string; // YYYYMMDD
  displayDate: string;
  attemptedCount: number;
  correctCount: number;
  correctLetters: string[];
  incorrectLetters: string[];
}

interface PeriodSlot {
  label: string;
  sessions: AlphabetSessionData[];
  accuracy: number | null;

  // optional but supported (hook/controller may provide it)
  masteryPercent?: number | null;

  correctLetters: string[];
  incorrectLetters: string[];
  correctCount: number;
  attemptedCount: number;
}

interface Props {
  studentId: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const BAR_MAX_H = 80;

// ============================================================================
// UI HELPERS
// ============================================================================

const accentColor = (acc: number | null) =>
  acc === null ? T.dim : acc >= 85 ? T.green : acc >= 60 ? T.amber : T.red;

const accentDim = (acc: number | null) =>
  acc === null
    ? 'rgba(0,0,0,0.04)'
    : acc >= 85
      ? T.greenDim
      : acc >= 60
        ? T.amberDim
        : T.redDim;

const accentBorder = (acc: number | null) =>
  acc === null ? T.dim : acc >= 85 ? T.greenBd : acc >= 60 ? T.amberBd : T.redBd;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const BarColumn = ({
  slot,
  isActive,
  index,
  onPress,
}: {
  slot: PeriodSlot;
  isActive: boolean;
  index: number;
  onPress: () => void;
}) => {
  const acc = slot.accuracy;
  const color = accentColor(acc);
  const height = acc !== null ? (acc / 100) * BAR_MAX_H : 0;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: height,
      delay: index * 40,
      useNativeDriver: false,
      tension: sw(90),
      friction: sw(10),
    }).start();
  }, [height, heightAnim, index]);

  const isEmpty = acc === null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.barCol}
      activeOpacity={isEmpty ? 0.4 : 0.75}
    >
      <Text
        style={[
          styles.barPct,
          { color: isEmpty ? T.dim : isActive ? color : T.muted },
        ]}
      >
        {isEmpty ? '—' : `${acc}%`}
      </Text>

      <View style={styles.barBg}>
        {!isEmpty && (
          <Animated.View
            style={[
              styles.barInner,
              {
                height: heightAnim,
                backgroundColor: isActive ? color : `${color}66`,
              },
            ]}
          />
        )}
      </View>

      <View
        style={[
          styles.barTick,
          { backgroundColor: isActive && !isEmpty ? color : 'transparent' },
        ]}
      />

      <Text
        style={[
          styles.barDateLbl,
          isActive && !isEmpty && { color: T.text, ...F.bold },
          isEmpty && { color: T.dim },
        ]}
      >
        {slot.label}
      </Text>
    </TouchableOpacity>
  );
};

const LetterTile = ({
  letter,
  status,
  delay,
}: {
  letter: string;
  status: 'correct' | 'wrong' | 'untried';
  delay: number;
}) => {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: sw(1),
        delay,
        useNativeDriver: true,
        tension: sw(130),
        friction: sw(8),
      }),
      Animated.timing(opacity, {
        toValue: sw(1),
        duration: sw(200),
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, scale, status]);

  const bg =
    status === 'correct'
      ? T.greenDim
      : status === 'wrong'
        ? T.redDim
        : 'rgba(0,0,0,0.03)';

  const borderColor =
    status === 'correct' ? T.greenBd : status === 'wrong' ? T.redBd : T.dim;

  const textColor =
    status === 'correct' ? T.green : status === 'wrong' ? T.red : T.muted;

  const mark = status === 'correct' ? '✓' : status === 'wrong' ? '✗' : '';

  return (
    <Animated.View
      style={[
        styles.letterTile,
        { backgroundColor: bg, borderColor, transform: [{ scale }], opacity },
      ]}
    >
      <Text style={[styles.letterChar, { color: textColor }]}>{letter}</Text>
      {!!mark && (
        <Text style={[styles.letterMark, { color: textColor }]}>{mark}</Text>
      )}
    </Animated.View>
  );
};

const ProgressBar = ({ percent, color }: { percent: number; color: string }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: percent,
      useNativeDriver: false,
      tension: sw(60),
      friction: sw(10),
    }).start();
  }, [percent, widthAnim]);

  return (
    <View style={styles.progTrack}>
      <Animated.View
        style={[
          styles.progFill,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

// ============================================================================
// RANGE TAB
// ============================================================================

const RANGES: { key: TimeRange; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const RangeTab = ({
  active,
  onPress,
}: {
  active: TimeRange;
  onPress: (r: TimeRange) => void;
}) => (
  <View style={styles.rangeRow}>
    {RANGES.map(r => {
      const isActive = r.key === active;
      return (
        <TouchableOpacity
          key={r.key}
          onPress={() => onPress(r.key)}
          style={[styles.rangeTab, isActive && styles.rangeTabActive]}
          activeOpacity={0.75}
        >
          <Text style={[styles.rangeTabText, isActive && styles.rangeTabTextActive]}>
            {r.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptySlotNotice = ({ label }: { label: string }) => (
  <View style={styles.emptyNotice}>
    <Text style={styles.emptyIcon}>📭</Text>
    <Text style={styles.emptyTitle}>No session for {label}</Text>
    <Text style={styles.emptyBody}>
      No alphabet reading was recorded in this period. Select another period to
      view data.
    </Text>
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StudentAlphabetMastery({ studentId }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Firestore + computed slots (accuracy + mastery + trend-ready)
  const { slots, summary, defaultIndex, loading, error } =
    useStudentAlphabetMasteryTrends(studentId, timeRange);

  // Selected slot index (sync to defaultIndex when range/data changes)
  const [selIdx, setSelIdx] = useState<number>(defaultIndex);

  useEffect(() => {
    setSelIdx(defaultIndex);
  }, [defaultIndex, timeRange]);

  const stripRef = useRef<ScrollView>(null);

  // Auto-scroll strip so selected slot is visible
  useEffect(() => {
    if (!slots.length) return;
    const t = setTimeout(() => {
      stripRef.current?.scrollTo({ x: selIdx * 80, animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [selIdx, slots.length]);

  const slot: PeriodSlot | undefined = slots[selIdx] ?? slots[slots.length - 1];

  // If hook returns empty array (shouldn't, but safe), render minimal state
  if (!slot) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Alphabet Mastery</Text>
        <Text style={{ ...F.medium, color: T.muted }}>
          {loading ? 'Loading…' : 'No data available.'}
        </Text>
      </View>
    );
  }

  const acc = slot.accuracy;
  const color = accentColor(acc);

  // Mastery %: prefer controller-provided masteryPercent; fallback to letter count
  const pct =
    slot.masteryPercent !== undefined && slot.masteryPercent !== null
      ? slot.masteryPercent
      : acc !== null
        ? Math.round((slot.correctLetters.length / 26) * 100)
        : 0;

  // Trend vs previous slot that has data
  const prevSlot = (() => {
    for (let i = selIdx - 1; i >= 0; i--) {
      if (slots[i]?.accuracy !== null && slots[i]?.accuracy !== undefined) return slots[i];
    }
    return null;
  })();

  const trendDiff =
    acc !== null && prevSlot?.accuracy !== null && prevSlot?.accuracy !== undefined
      ? acc - prevSlot.accuracy
      : null;

  const letterStatus = (l: string): 'correct' | 'wrong' | 'untried' => {
    if (slot.correctLetters.includes(l)) return 'correct';
    if (slot.incorrectLetters.includes(l)) return 'wrong';
    return 'untried';
  };

  // Use summary from controller/hook
  const totalSessions = summary?.totalSessions ?? 0;
  const avgAccuracy = summary?.avgAccuracy ?? null;

  // Header range label
  const { start, end } = useMemo(
    () => getDateRangeForTimeFilter(timeRange),
    [timeRange],
  );

  const rangeLabel = useMemo(() => {
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (timeRange === 'week') return `${fmt(start)} – ${fmt(end)}`;
    if (timeRange === 'month') return 'Last 30 days';
    return 'School Year';
  }, [end, start, timeRange]);

  return (
    <View>
      {/* Optional: loading / error */}
      {loading && (
        <Text style={{ ...F.medium, color: T.muted, marginBottom: 10 }}>
          Loading…
        </Text>
      )}
      {!!error && (
        <Text style={{ ...F.medium, color: T.red, marginBottom: 10 }}>
          {error}
        </Text>
      )}

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.compTitle}>Alphabet{'\n'}Mastery</Text>
          <Text style={styles.compSubtitle}>{rangeLabel}</Text>
        </View>

        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: accentDim(acc),
              borderColor: accentBorder(acc),
            },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>
            {acc === null ? 'No Data' : pct === 100 ? '🏆 Complete' : `${pct}% Done`}
          </Text>
        </View>
      </View>

      {/* ── RANGE TABS ── */}
      <RangeTab active={timeRange} onPress={setTimeRange} />

      {/* ── SUMMARY ROW ── */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text
            style={[
              styles.summaryVal,
              { color: avgAccuracy !== null ? accentColor(avgAccuracy) : T.muted },
            ]}
          >
            {avgAccuracy !== null ? `${avgAccuracy}%` : '—'}
          </Text>
          <Text style={styles.summaryLbl}>Avg Accuracy</Text>
        </View>

        <View style={styles.summarySep} />

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: T.blue }]}>{totalSessions}</Text>
          <Text style={styles.summaryLbl}>Sessions</Text>
        </View>

        <View style={styles.summarySep} />

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: T.violet }]}>
            {acc !== null ? slot.correctLetters.length : '—'}
          </Text>
          <Text style={styles.summaryLbl}>Mastered</Text>
        </View>
      </View>

      {/* ── BAR CHART ── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Performance</Text>
        <View>
          <View>
            <Text style={styles.cardTitle}>
              Accuracy Per {timeRange === 'week' ? 'Day' : timeRange === 'month' ? 'Week' : 'Month'}
            </Text>
          </View>
          <View style={styles.tapHintBadge}>
            <Text style={styles.tapHintText}>👆 Tap bars to view details</Text>
          </View>

        </View>

        <ScrollView
          ref={stripRef}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.barsRow}>
            {slots.map((s, i) => (
              <BarColumn
                key={s.label}
                slot={s}
                isActive={i === selIdx}
                index={i}
                onPress={() => setSelIdx(i)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.legend}>
          {[
            { color: T.green, label: '≥ 85%  Excellent' },
            { color: T.amber, label: '≥ 60%  Good' },
            { color: T.red, label: '< 60%  Needs work' },
          ].map(l => (
            <View key={l.label} style={styles.legItem}>
              <View style={[styles.legDot, { backgroundColor: l.color }]} />
              <Text style={styles.legTxt}>{l.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── SELECTED PERIOD DETAIL ── */}
      {acc === null ? (
        <EmptySlotNotice label={slot.label} />
      ) : (
        <>
          {/* STAT TRIO */}
          <View style={styles.trio}>
            <View style={[styles.statBlock, { borderTopColor: color }]}>
              <Text style={[styles.statVal, { color }]}>{acc}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
              {trendDiff !== null ? (
                <Text
                  style={[
                    styles.statTrend,
                    { color: trendDiff >= 0 ? T.green : T.red },
                  ]}
                >
                  {trendDiff >= 0 ? '▲' : '▼'} {Math.abs(trendDiff)}%
                </Text>
              ) : (
                <Text style={[styles.statTrend, { color: T.muted }]}>
                  First session
                </Text>
              )}
            </View>

            <View style={[styles.statBlock, { borderTopColor: T.amber }]}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[styles.statVal, { color: T.amber }]}>
                  {slot.correctCount}
                </Text>
                <Text style={[styles.statValSub, { color: T.muted }]}>
                  /{slot.attemptedCount}
                </Text>
              </View>
              <Text style={styles.statLabel}>Correct</Text>
              <Text style={[styles.statTrend, { color: T.muted }]}>Attempted</Text>
            </View>

            <View style={[styles.statBlock, { borderTopColor: T.violet }]}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[styles.statVal, { color: T.violet }]}>
                  {slot.correctLetters.length}
                </Text>
                <Text style={[styles.statValSub, { color: T.muted }]}>/26</Text>
              </View>
              <Text style={styles.statLabel}>Mastered</Text>
              <Text style={[styles.statTrend, { color: T.muted }]}>Letters</Text>
            </View>
          </View>

          {/* LETTER GRID */}
          <View style={styles.card}>
            <View style={styles.gridHeaderRow}>
              <View>
                <Text style={styles.cardLabel}>Breakdown</Text>
                <Text style={[styles.cardTitle, { marginBottom: 0 }]}>
                  Letter Status
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View
                  style={[
                    styles.countChip,
                    { backgroundColor: T.greenDim, borderColor: T.greenBd },
                  ]}
                >
                  <Text style={[styles.countChipText, { color: T.green }]}>
                    ✓ {slot.correctLetters.length}
                  </Text>
                </View>

                <View
                  style={[
                    styles.countChip,
                    { backgroundColor: T.redDim, borderColor: T.redBd },
                  ]}
                >
                  <Text style={[styles.countChipText, { color: T.red }]}>
                    ✗ {slot.incorrectLetters.length}
                  </Text>
                </View>

                {26 - slot.attemptedCount > 0 && (
                  <View
                    style={[
                      styles.countChip,
                      {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderColor: T.dim,
                      },
                    ]}
                  >
                    <Text style={[styles.countChipText, { color: T.muted }]}>
                      — {26 - slot.attemptedCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.letterGrid}>
              {ALL_LETTERS.map((l, i) => (
                <LetterTile
                  key={l}
                  letter={l}
                  status={letterStatus(l)}
                  delay={i * 20}
                />
              ))}
            </View>

            {slot.sessions.length > 1 && (
              <Text style={styles.slotSessionCount}>
                {slot.sessions.length} sessions aggregated in this{' '}
                {timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'}
              </Text>
            )}
          </View>

          {/* COMPLETION */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Progress</Text>
            <Text style={styles.cardTitle}>Completion</Text>

            <View style={styles.progRow}>
              <ProgressBar percent={pct} color={color} />
              <Text style={[styles.progPct, { color }]}>{pct}%</Text>
            </View>

            <Text style={styles.progCaption}>
              {slot.correctLetters.length} of 26 letters mastered · {slot.label}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.historyWrap}
              contentContainerStyle={styles.historyScrollContent}
            >
              <View style={styles.historyLine} />
              <View style={styles.historyDots}>
                {slots.map((s, i) => {
                  const c = accentColor(s.accuracy);
                  const isActive = i === selIdx;
                  const isEmpty = s.accuracy === null;

                  return (
                    <TouchableOpacity
                      key={s.label}
                      onPress={() => setSelIdx(i)}
                      style={styles.histDotWrap}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.histDot,
                          isEmpty && styles.histDotEmpty,
                          !isEmpty && { backgroundColor: c },
                          isActive && { borderColor: T.text },
                          isActive && styles.histDotActive,
                        ]}
                      />
                      <Text
                        style={[
                          styles.histLabel,
                          isActive && { color: T.text, ...F.medium },
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sh(16),
  },
  compTitle: {
    ...F.black,
    fontSize: sf(26),
    color: T.text,
    letterSpacing: sf(-0.5),
    lineHeight: sf(30),
  },
  compSubtitle: {
    ...F.italic,
    fontSize: sf(12),
    color: T.muted,
    marginTop: sh(5),
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(6),
    paddingHorizontal: sw(12),
    paddingVertical: sh(8),
    borderRadius: sw(999),
    borderWidth: 1,
  },
  statusDot: {
    width: sw(7),
    height: sw(7),
    borderRadius: sw(99),
  },
  statusText: {
    ...F.bold,
    fontSize: sf(11),
    letterSpacing: sf(0.2),
  },

  rangeRow: {
    flexDirection: 'row',
    backgroundColor: T.surface2,
    borderRadius: sw(12),
    padding: sw(4),
    marginBottom: sh(16),
  },
  rangeTab: {
    flex: 1,
    paddingVertical: sh(8),
    alignItems: 'center',
    borderRadius: sw(10),
  },
  rangeTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: sw(4),
    shadowOffset: { width: 0, height: sw(2) },
    elevation: 2,
  },
  rangeTabText: {
    ...F.medium,
    fontSize: sf(13),
    color: T.muted,
  },
  rangeTabTextActive: {
    ...F.bold,
    color: T.text,
  },

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: sw(16),
    marginBottom: sh(14),
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: sw(4),
  },
  summaryVal: {
    ...F.black,
    fontSize: sf(20),
  },
  summaryLbl: {
    ...F.medium,
    fontSize: sf(9),
    letterSpacing: sf(0.6),
    textTransform: 'uppercase',
    color: T.muted,
  },
  summarySep: {
    width: sw(1),
    height: sw(32),
    backgroundColor: T.border,
  },

  card: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: sw(18),
    marginBottom: sh(14),
  },
  cardLabel: {
    ...F.bold,
    fontSize: sf(10),
    letterSpacing: sf(0.8),
    textTransform: 'uppercase',
    color: T.muted,
    marginBottom: sh(2),
  },
  cardTitle: {
    ...F.black,
    fontSize: sf(16),
    color: T.text,
    marginBottom: sh(14),
  },

  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: sw(6),
    paddingBottom: sh(4),
    minHeight: BAR_MAX_H + 50,
  },
  barCol: {
    alignItems: 'center',
    width: sw(48),
    gap: sw(4),
  },
  barPct: {
    ...F.bold,
    fontSize: sf(9),
  },
  barBg: {
    width: sw(26),
    height: BAR_MAX_H,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: sw(8),
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barInner: {
    width: '100%',
    borderRadius: sw(8),
  },
  barTick: {
    width: sw(4),
    height: sw(4),
    borderRadius: sw(99),
  },
  barDateLbl: {
    ...F.regular,
    fontSize: sf(8),
    color: T.muted,
    textAlign: 'center',
  },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(10),
    marginTop: sh(12),
    paddingTop: sh(12),
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legDot: { width: 7, height: 7, borderRadius: 99 },
  legTxt: { ...F.medium, fontSize: 9, color: T.muted },

  trio: {
    flexDirection: 'row',
    gap: sw(10),
    marginBottom: sh(14),
  },
  statBlock: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: T.radius,
    padding: sw(14),
    borderWidth: 1,
    borderColor: T.border,
    borderTopWidth: 2,
  },
  statVal: {
    ...F.black,
    fontSize: sf(21),
    lineHeight: sf(24),
    marginBottom: sh(4),
  },
  statValSub: {
    ...F.medium,
    fontSize: sf(13),
  },
  statLabel: {
    ...F.medium,
    fontSize: sf(9),
    letterSpacing: sf(0.7),
    textTransform: 'uppercase',
    color: T.muted,
  },
  statTrend: {
    ...F.bold,
    fontSize: sf(10),
    marginTop: sh(6),
  },

  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: sh(14),
  },
  countChip: {
    paddingHorizontal: sw(8),
    paddingVertical: sh(4),
    borderRadius: sw(999),
    borderWidth: 1,
  },
  countChipText: {
    ...F.bold,
    fontSize: sf(10),
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(6),
    justifyContent: 'center',
  },
  letterTile: {
    width: sw(38),
    height: sw(38),
    borderRadius: sw(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  letterChar: {
    ...F.black,
    fontSize: sf(13),
  },
  letterMark: {
    ...F.bold,
    fontSize: sf(7),
    position: 'absolute',
    bottom: sh(2),
    right: sw(4),
  },
  slotSessionCount: {
    ...F.italic,
    fontSize: sf(10),
    color: T.muted,
    textAlign: 'center',
    marginTop: sh(12),
  },

  progRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(10),
    marginBottom: sh(6),
  },
  progTrack: {
    flex: 1,
    height: sw(8),
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: sw(999),
    overflow: 'hidden',
  },
  progFill: {
    height: '100%',
    borderRadius: sw(999),
  },
  progPct: {
    ...F.black,
    fontSize: sf(15),
    minWidth: sw(44),
    textAlign: 'right',
  },
  progCaption: {
    ...F.italic,
    fontSize: sf(11),
    color: T.muted,
    marginBottom: sh(16),
  },

  historyWrap: { position: 'relative' },
  historyScrollContent: {
    flexGrow: 1,
    position: 'relative',
  },
  historyLine: {
    position: 'absolute',
    top: sh(7),
    left: sw(7),
    right: sw(7),
    height: sw(1.5),
    backgroundColor: T.dim,
    zIndex: 0,
  },
  historyDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: sw(12),
    position: 'relative',
    zIndex: 1,
    flexGrow: 1,
  },
  histDotWrap: {
    alignItems: 'center',
    gap: sw(6),
  },
  histDot: {
    width: sw(14),
    height: sw(14),
    borderRadius: sw(99),
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: T.dim,
  },
  histDotEmpty: {
    backgroundColor: T.dim,
    borderColor: 'transparent',
  },
  histDotActive: {
    transform: [{ scale: 1.3 }],
  },
  histLabel: {
    ...F.light,
    fontSize: sf(7),
    color: T.muted,
    textAlign: 'center',
    maxWidth: sw(32),
  },

  emptyNotice: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    borderStyle: 'dashed',
    padding: sw(28),
    alignItems: 'center',
    marginBottom: sh(14),
    gap: sw(8),
  },
  emptyIcon: {
    fontSize: sf(32),
    marginBottom: sh(4),
  },
  emptyTitle: {
    ...F.bold,
    fontSize: sf(15),
    color: T.text,
    textAlign: 'center',
  },
  emptyBody: {
    ...F.regular,
    fontSize: sf(12),
    color: T.muted,
    textAlign: 'center',
    lineHeight: sf(18),
  },
  tapHintBadge: {
    backgroundColor: T.violetDim,
    paddingHorizontal: sw(10),
    paddingVertical: sh(6),
    borderRadius: sw(8),
    borderWidth: 1,
    borderColor: T.violetBd,
  },
  tapHintText: {
    ...F.medium,
    fontSize: sf(10),
    color: T.violet,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  TimeRange,
  WordChapterProgress,
  WordLessonProgress,
} from '../../../Controller/SessionReportContoller';
import { useStudentWordMastery } from '../../../Hooks/Student/useStudentWordMastery';
import { WordPeriodSlot } from '../../../Interfaces/dataInterfaces';
import { sw, sh, sf } from '../../../Utils/responsive';

// ============================================================================
// DESIGN TOKENS
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
  blueBd: 'rgba(96,165,250,0.30)',

  radius: sw(16),
};

// ============================================================================
// FONT HELPERS
// ============================================================================

const F = {
  black: { fontFamily: 'Satoshi-Black', fontWeight: '900' as const },
  bold: { fontFamily: 'Satoshi-Bold', fontWeight: '700' as const },
  medium: { fontFamily: 'Satoshi-Medium', fontWeight: '500' as const },
  regular: { fontFamily: 'Satoshi-Regular', fontWeight: '400' as const },
  italic: { fontFamily: 'Satoshi-Italic', fontStyle: 'italic' as const, fontWeight: '400' as const },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type LessonProgress = WordLessonProgress;
type ChapterProgress = WordChapterProgress;

interface Props {
  studentId: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BAR_MAX_H = 80;

// ============================================================================
// HELPERS
// ============================================================================

const accentColor = (acc: number | null) =>
  acc === null ? T.dim : acc >= 85 ? T.green : acc >= 60 ? T.amber : T.red;

const accentDim = (acc: number | null) =>
  acc === null ? 'rgba(0,0,0,0.04)' : acc >= 85 ? T.greenDim : acc >= 60 ? T.amberDim : T.redDim;

const accentBorder = (acc: number | null) =>
  acc === null ? T.dim : acc >= 85 ? T.greenBd : acc >= 60 ? T.amberBd : T.redBd;

const isLessonComplete = (l: LessonProgress) =>
  l.totalWords > 0 && l.masteredWords.length >= l.totalWords;

// ============================================================================
// BAR COLUMN  —  animated vertical bar for the chart
// ============================================================================

const BarColumn = ({
  slot,
  isActive,
  index,
  onPress,
}: {
  slot: WordPeriodSlot;
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

// ============================================================================
// RANGE TABS  —  Week / Month / Year
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
// FILL BAR  —  animated horizontal progress bar
// ============================================================================

const FillBar = ({
  percent,
  color,
  height = 8,
}: {
  percent: number;
  color: string;
  height?: number;
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: percent,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [percent]);

  return (
    <View style={[styles.fillTrack, { height }]}>
      <Animated.View
        style={[
          styles.fillBar,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
};

// ============================================================================
// CHAPTER PILL  —  horizontal chapter selector
// ============================================================================

const ChapterPill = ({
  chapterId,
  chapterTitle,
  isActive,
  isComplete,
  hasData,
  onPress,
}: {
  chapterId: string;
  chapterTitle: string;
  isActive: boolean;
  isComplete: boolean;
  hasData: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      styles.chapterPill,
      isActive && styles.chapterPillActive,
      !hasData && styles.chapterPillEmpty,
    ]}
  >
    <Text
      numberOfLines={1}
      style={[
        styles.chapterPillText,
        isActive && styles.chapterPillTextActive,
        !hasData && styles.chapterPillTextEmpty,
      ]}
    >
      {chapterTitle || `Ch ${chapterId}`}
    </Text>
    {/* Green dot in corner signals fully completed chapter */}
    {isComplete && <View style={styles.chapterCompleteDot} />}
  </TouchableOpacity>
);

// ============================================================================
// LESSON CARD  —  name + status badge + progress bar only
// ============================================================================

const LessonCard = ({
  lesson,
  index,
  isSelected,
  onPress,
}: {
  lesson: LessonProgress;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const acc = lesson.latestAccuracy;
  const color = accentColor(acc);
  const complete = isLessonComplete(lesson);
  const pct = Math.round(
    (lesson.masteredWords.length / Math.max(lesson.totalWords, 1)) * 100,
  );
  const barColor = complete ? T.green : acc !== null ? color : T.dim;

  // Slide-in on mount
  const slideAnim = useRef(new Animated.Value(12)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 45,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(opacAnim, {
        toValue: 1,
        duration: 200,
        delay: index * 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacAnim }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[
          styles.lessonCard,
          isSelected && {
            borderColor: color,
            borderWidth: 1.5,
            backgroundColor: accentDim(acc),
          },
        ]}
      >
        {/* Colored left accent bar — signals accuracy tier at a glance */}
        <View style={[styles.lessonAccentBar, { backgroundColor: barColor }]} />

        <View style={styles.lessonCardBody}>

          {/* ── Row 1: Lesson name + status badge ── */}
          <View style={styles.lessonTopRow}>
            <Text style={styles.lessonName} numberOfLines={1}>
              {lesson.lessonDisplayName}
            </Text>

            {/* Status badge — Done / % / Not tried */}
            {complete ? (
              <View style={[styles.badge, { backgroundColor: T.greenDim, borderColor: T.greenBd }]}>
                <Text style={[styles.badgeText, { color: T.green }]}>✓ Done</Text>
              </View>
            ) : acc !== null ? (
              <View style={[styles.badge, { backgroundColor: accentDim(acc), borderColor: accentBorder(acc) }]}>
                <Text style={[styles.badgeText, { color }]}>{acc}%</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: T.surface2, borderColor: T.dim }]}>
                <Text style={[styles.badgeText, { color: T.muted }]}>Not tried</Text>
              </View>
            )}
          </View>

          {/* ── Row 2: Progress bar + fraction ── */}
          <View style={styles.lessonProgressRow}>
            <View style={{ flex: 1 }}>
              <FillBar percent={pct} color={barColor} height={5} />
            </View>
            <Text style={styles.lessonFraction}>
              <Text style={[styles.lessonFractionNum, { color: complete ? T.green : T.text }]}>
                {lesson.masteredWords.length}
              </Text>
              <Text style={styles.lessonFractionDen}>/{lesson.totalWords}</Text>
            </Text>
          </View>

        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// WORD GRID  —  revealed when a lesson card is tapped
// ============================================================================

const WordGrid = ({ lesson }: { lesson: LessonProgress }) => {
  const allWords = [
    ...lesson.masteredWords,
    ...lesson.missedWords,
    ...lesson.untriedWords,
  ];

  return (
    <View style={styles.wordGrid}>
      {allWords.map((word, i) => {
        const mastered = lesson.masteredWords.includes(word);
        const missed = lesson.missedWords.includes(word);

        const bg = mastered ? T.greenDim : missed ? T.redDim : T.surface2;
        const bd = mastered ? T.greenBd : missed ? T.redBd : T.dim;
        const tc = mastered ? T.green : missed ? T.red : T.muted;
        const mark = mastered ? '✓' : missed ? '✗' : '';

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const scaleAnim = useRef(new Animated.Value(0.5)).current;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            delay: i * 25,
            useNativeDriver: true,
            tension: 130,
            friction: 8,
          }).start();
        }, [word]);

        return (
          <Animated.View
            key={word}
            style={[
              styles.wordTile,
              { backgroundColor: bg, borderColor: bd, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={[styles.wordTileText, { color: tc }]}>{word}</Text>
            {!!mark && (
              <Text style={[styles.wordTileMark, { color: tc }]}>{mark}</Text>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState = () => (
  <View style={styles.emptyNotice}>
    <Text style={styles.emptyIcon}>📚</Text>
    <Text style={styles.emptyTitle}>No chapters yet</Text>
    <Text style={styles.emptyBody}>
      Complete a word reading session to see progress here.
    </Text>
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StudentWordMastery({ studentId }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { chapters, slots, summary, defaultIndex, loading, error } =
    useStudentWordMastery(studentId, timeRange);

  const [selChapter, setSelChapter] = useState<string | null>(
    chapters.length > 0 ? chapters[0].chapter : null,
  );
  const [selLesson, setSelLesson] = useState<string | null>(null);

  // ── Bar chart state ──
  const [selIdx, setSelIdx] = useState<number>(defaultIndex);
  const barStripRef = useRef<ScrollView>(null);

  // Sync selected bar index when defaultIndex or timeRange changes
  useEffect(() => {
    setSelIdx(defaultIndex);
  }, [defaultIndex, timeRange]);

  // Auto-scroll bar strip so selected slot is visible
  useEffect(() => {
    if (!slots.length) return;
    const t = setTimeout(() => {
      barStripRef.current?.scrollTo({ x: selIdx * 80, animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [selIdx, slots.length]);

  const chapterStripRef = useRef<ScrollView>(null);

  // Reset lesson when chapter changes
  useEffect(() => { setSelLesson(null); }, [selChapter]);

  // Auto-scroll chapter strip to selected pill
  useEffect(() => {
    const idx = chapters.findIndex(c => c.chapter === selChapter);
    if (idx >= 0) {
      setTimeout(() => {
        chapterStripRef.current?.scrollTo({ x: idx * 110, animated: true });
      }, 80);
    }
  }, [selChapter, chapters]);

  // ── Derived data ──
  const currentChapter = chapters.find(c => c.chapter === selChapter) ?? null;
  const currentLesson = currentChapter?.lessons.find(l => l.lesson === selLesson) ?? null;

  const masteredTotal = chapters.reduce((s, c) => s + c.masteredWords, 0);
  const totalWordSlots = chapters.reduce((s, c) => s + c.totalWords, 0);
  const overallPct = totalWordSlots > 0
    ? Math.round((masteredTotal / totalWordSlots) * 100)
    : 0;

  const { totalAttempted, totalCorrect } = chapters.reduce(
    (acc, ch) => {
      for (const l of ch.lessons) {
        acc.totalAttempted += l.attempted;
        acc.totalCorrect += l.correct;
      }
      return acc;
    },
    { totalAttempted: 0, totalCorrect: 0 },
  );

  const avgAccuracy = totalAttempted > 0
    ? Math.round((totalCorrect / totalAttempted) * 100)
    : null;

  // ── Loading / error states ──
  if (loading) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateText}>Loading word mastery…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateWrap}>
        <Text style={[styles.stateText, { color: T.red }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: T.bg }}>

      {/* ── LAYER 1: Header ──────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.compTitle}>Word Mastery</Text>
          <Text style={styles.compSubtitle}>
            {avgAccuracy !== null ? `${avgAccuracy}% avg accuracy · ` : ''}
            {masteredTotal}/{totalWordSlots} words mastered
          </Text>
        </View>
      </View>

      {/* ── Range filter ─────────────────────────────────────────────── */}
      <RangeTab active={timeRange} onPress={setTimeRange} />

      {/* ── LAYER 2: Summary strip ──────────────────────────────────── */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text
            style={[
              styles.summaryVal,
              { color: summary.avgAccuracy !== null ? accentColor(summary.avgAccuracy) : T.muted },
            ]}
          >
            {summary.avgAccuracy !== null ? `${summary.avgAccuracy}%` : '—'}
          </Text>
          <Text style={styles.summaryLbl}>Avg Accuracy</Text>
        </View>

        <View style={styles.summarySep} />

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: T.blue }]}>{summary.totalSessions}</Text>
          <Text style={styles.summaryLbl}>Sessions</Text>
        </View>

        <View style={styles.summarySep} />

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: T.green }]}>
            {masteredTotal}
          </Text>
          <Text style={styles.summaryLbl}>Mastered</Text>
        </View>
      </View>

      {/* ── LAYER 2b: Bar chart ─────────────────────────────────────── */}
      {slots.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Performance</Text>
          <View>
            <Text style={styles.cardTitle}>
              Accuracy Per {timeRange === 'week' ? 'Day' : timeRange === 'month' ? 'Week' : 'Month'}
            </Text>
            <View style={styles.tapHintBadge}>
              <Text style={styles.tapHintText}>👆 Tap bars to view details</Text>
            </View>
          </View>

          <ScrollView
            ref={barStripRef}
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
      )}

      {/* ── LAYER 3: Overall progress bar ───────────────────────────── */}
      <View style={styles.overallCard}>
        <View style={styles.overallCardHeader}>
          <Text style={styles.cardLabel}>Overall Progress</Text>
          <Text style={[styles.overallPct, { color: accentColor(avgAccuracy) }]}>
            {overallPct}%
          </Text>
        </View>
        <FillBar percent={overallPct} color={accentColor(avgAccuracy)} height={10} />
      </View>

      {/* ── LAYER 3: Chapter pills ───────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Chapters</Text>

        <ScrollView
          ref={chapterStripRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chapterStripContent}
        >
          {chapters.map(c => (
            <ChapterPill
              key={c.chapter}
              chapterId={c.chapter}
              chapterTitle={c.chapterTitle}
              isActive={c.chapter === selChapter}
              isComplete={
                c.completedLessons === c.lessons.length && c.lessons.length > 0
              }
              hasData={c.lessons.length > 0}
              onPress={() => setSelChapter(c.chapter)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── LAYER 4a: Lesson list ────────────────────────────────────── */}
      {currentChapter ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {currentChapter.chapterTitle} —{' '}
            {currentChapter.lessons.length} lesson
            {currentChapter.lessons.length !== 1 ? 's' : ''}
          </Text>

          {currentChapter.lessons.map((lesson, i) => (
            <LessonCard
              key={lesson.lesson}
              lesson={lesson}
              index={i}
              isSelected={lesson.lesson === selLesson}
              onPress={() =>
                setSelLesson(selLesson === lesson.lesson ? null : lesson.lesson)
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState />
      )}

      {/* ── LAYER 4b: Word tile grid (shown when lesson is tapped) ──── */}
      {currentLesson && (
        <View style={styles.card}>
          {/* Minimal header — just the lesson name and counts */}
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>Word Breakdown</Text>
              <Text style={styles.detailLessonName}>
                {currentLesson.lessonDisplayName}
              </Text>
            </View>

            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: T.greenDim, borderColor: T.greenBd }]}>
                <Text style={[styles.chipText, { color: T.green }]}>
                  ✓ {currentLesson.masteredWords.length}
                </Text>
              </View>
              <View style={[styles.chip, { backgroundColor: T.redDim, borderColor: T.redBd }]}>
                <Text style={[styles.chipText, { color: T.red }]}>
                  ✗ {currentLesson.missedWords.length}
                </Text>
              </View>
              {currentLesson.untriedWords.length > 0 && (
                <View style={[styles.chip, { backgroundColor: T.surface2, borderColor: T.dim }]}>
                  <Text style={[styles.chipText, { color: T.muted }]}>
                    — {currentLesson.untriedWords.length}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Word tiles */}
          <WordGrid lesson={currentLesson} />
        </View>
      )}

    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({

  // ── Loading / error ──────────────────────────────────────────────────────
  stateWrap: { paddingVertical: sh(24), alignItems: 'center' },
  stateText: { ...F.medium, fontSize: sf(13), color: T.muted },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sh(14),
  },
  compTitle: {
    ...F.black,
    fontSize: sf(22),
    color: T.text,
    letterSpacing: sf(-0.4),
  },
  compSubtitle: {
    ...F.regular,
    fontSize: sf(12),
    color: T.muted,
    marginTop: sh(3),
  },

  // ── Range filter ─────────────────────────────────────────────────────────
  rangeRow: {
    flexDirection: 'row',
    backgroundColor: T.surface2,
    borderRadius: sw(12),
    padding: sw(4),
    marginBottom: sh(14),
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
  rangeTabText: { ...F.medium, fontSize: sf(13), color: T.muted },
  rangeTabTextActive: { ...F.bold, color: T.text },

  // ── Overall progress card ─────────────────────────────────────────────────
  overallCard: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: sw(16),
    marginBottom: sh(12),
  },
  overallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(10),
  },
  overallPct: { ...F.black, fontSize: sf(20) },

  // ── Shared card ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: sw(16),
    marginBottom: sh(12),
  },
  cardLabel: {
    ...F.bold,
    fontSize: sf(10),
    letterSpacing: sf(0.8),
    textTransform: 'uppercase',
    color: T.muted,
    marginBottom: sh(10),
  },

  // ── Fill bar ─────────────────────────────────────────────────────────────
  fillTrack: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: sw(999),
    overflow: 'hidden',
  },
  fillBar: { borderRadius: 999 },

  // ── Chapter pills ─────────────────────────────────────────────────────────
  chapterStripContent: { gap: 8, paddingVertical: 2, paddingHorizontal: 2 },
  chapterPill: {
    minWidth: sw(72),
    maxWidth: sw(180),
    height: sw(40),
    paddingHorizontal: sw(14),
    borderRadius: sw(12),
    backgroundColor: T.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chapterPillActive: { backgroundColor: T.text, borderColor: T.text },
  chapterPillEmpty: { opacity: 0.35 },
  chapterPillText: { ...F.bold, fontSize: sf(13), color: T.muted },
  chapterPillTextActive: { color: '#ffffff' },
  chapterPillTextEmpty: { color: T.dim },
  chapterCompleteDot: {
    position: 'absolute',
    top: 4, right: 4,
    width: 6, height: 6,
    borderRadius: 99,
    backgroundColor: T.green,
  },

  // ── Lesson card ───────────────────────────────────────────────────────────
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: sw(12),
    borderWidth: 1,
    borderColor: T.border,
    marginBottom: sh(8),
    overflow: 'hidden',
  },
  lessonAccentBar: { width: 4 },
  lessonCardBody: { flex: 1, padding: sw(12), gap: sh(8) },
  lessonTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonName: {
    ...F.bold,
    fontSize: sf(14),
    color: T.text,
    flex: 1,
    marginRight: sw(8),
  },
  lessonProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(10),
  },
  lessonFraction: { fontSize: sf(12) },
  lessonFractionNum: { ...F.black, fontSize: sf(13) },
  lessonFractionDen: { ...F.regular, fontSize: sf(12), color: T.muted },

  // ── Status badge ──────────────────────────────────────────────────────────
  badge: {
    paddingHorizontal: sw(9),
    paddingVertical: sh(3),
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { ...F.bold, fontSize: sf(10) },

  // ── Word tile grid ────────────────────────────────────────────────────────
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: sh(4),
  },
  wordTile: {
    paddingHorizontal: sw(11),
    paddingVertical: sh(7),
    borderRadius: sw(10),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wordTileText: { ...F.bold, fontSize: sf(13) },
  wordTileMark: {
    ...F.bold,
    fontSize: sf(7),
    position: 'absolute',
    top: 2,
    right: 4,
  },

  // ── Lesson detail panel ───────────────────────────────────────────────────
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sh(12),
  },
  detailLessonName: {
    ...F.black,
    fontSize: sf(15),
    color: T.text,
    marginTop: sh(2),
  },
  chipRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  chip: {
    paddingHorizontal: sw(8),
    paddingVertical: sh(3),
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { ...F.bold, fontSize: sf(10) },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyNotice: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    borderStyle: 'dashed',
    padding: sw(28),
    alignItems: 'center',
    marginBottom: sh(12),
    gap: sw(8),
  },
  emptyIcon: { fontSize: 32, marginBottom: 4 },
  emptyTitle: { ...F.bold, fontSize: sf(15), color: T.text, textAlign: 'center' },
  emptyBody: { ...F.regular, fontSize: sf(12), color: T.muted, textAlign: 'center', lineHeight: 18 },

  // ── Summary strip ───────────────────────────────────────────────────────
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: sw(16),
    marginBottom: sh(12),
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

  // ── Bar chart ─────────────────────────────────────────────────────────
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

  cardTitle: {
    ...F.black,
    fontSize: sf(16),
    color: T.text,
    marginBottom: sh(14),
  },
  tapHintBadge: {
    backgroundColor: T.violetDim,
    paddingHorizontal: sw(10),
    paddingVertical: sh(6),
    borderRadius: sw(8),
    borderWidth: 1,
    borderColor: T.violetBd,
    alignSelf: 'flex-start',
    marginBottom: sh(10),
  },
  tapHintText: {
    ...F.medium,
    fontSize: sf(10),
    color: T.violet,
  },
});
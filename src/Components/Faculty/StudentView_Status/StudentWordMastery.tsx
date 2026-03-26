import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { TimeRange, WordChapterProgress, WordLessonProgress } from '../../../Controller/SessionReportContoller';
import { useStudentWordMastery } from '../../../Hooks/Student/useStudentWordMastery';

// ============================================================================
// DESIGN TOKENS  (same light system as AlphabetMastery)
// ============================================================================

const T = {
  bg: '#ffffff',
  surface: '#f8fafc',
  surface2: '#f1f5f9',
  border: 'rgba(0,0,0,0.07)',
  text: '#0f172a',
  muted: '#64748b',
  dim: '#e2e8f0',

  green: '#34d399', greenDim: 'rgba(52,211,153,0.12)', greenBd: 'rgba(52,211,153,0.30)',
  amber: '#fbbf24', amberDim: 'rgba(251,191,36,0.12)', amberBd: 'rgba(251,191,36,0.30)',
  red: '#f87171', redDim: 'rgba(248,113,113,0.12)', redBd: 'rgba(248,113,113,0.30)',
  violet: '#a78bfa', violetDim: 'rgba(167,139,250,0.12)', violetBd: 'rgba(167,139,250,0.30)',
  blue: '#60a5fa', blueDim: 'rgba(96,165,250,0.12)', blueBd: 'rgba(96,165,250,0.30)',
  indigo: '#818cf8', indigoDim: 'rgba(129,140,248,0.12)', indigoBd: 'rgba(129,140,248,0.30)',

  radius: 16,
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
  italic: { fontFamily: 'Satoshi-Italic', fontStyle: 'italic' as const, fontWeight: '400' as const },
  boldItalic: { fontFamily: 'Satoshi-BoldItalic', fontStyle: 'italic' as const, fontWeight: '700' as const },
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
// RANGE TAB (Week / Month / Year — same as StudentAlphabetMastery)
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
// SUB-COMPONENTS
// ============================================================================

/** Animated fill bar — reused across progress bars at every hierarchy level */
const FillBar = ({ percent, color, height = 8 }: { percent: number; color: string; height?: number }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(widthAnim, { toValue: percent, useNativeDriver: false, tension: 60, friction: 10 }).start();
  }, [percent]);
  return (
    <View style={[styles.fillTrack, { height }]}>
      <Animated.View style={[styles.fillBar, {
        width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        backgroundColor: color, height,
      }]} />
    </View>
  );
};

/**
 * 10-dot word progress strip — one dot per word slot.
 * Mastered = green, missed = red, untried = dim gray.
 * Dots spring-animate in from left → right on mount / lesson change.
 */
const WordDotStrip = ({ lesson, baseDelay }: { lesson: LessonProgress; baseDelay: number }) => {
  const totalSlots = Math.max(lesson.totalWords, 1);
  return (
    <View style={styles.dotStrip}>
      {Array.from({ length: totalSlots }, (_, i) => {
        const mastered = i < lesson.masteredWords.length;
        const missed = !mastered && i < lesson.masteredWords.length + lesson.missedWords.length;
        const bg = mastered ? T.green : missed ? T.red : T.dim;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const scaleAnim = useRef(new Animated.Value(0.1)).current;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          Animated.spring(scaleAnim, {
            toValue: 1, delay: baseDelay + i * 28,
            useNativeDriver: true, tension: 160, friction: 8,
          }).start();
        }, [lesson.lesson]);

        return (
          <Animated.View
            key={i}
            style={[styles.wordDot, { backgroundColor: bg, transform: [{ scale: scaleAnim }] }]}
          />
        );
      })}
    </View>
  );
};

/** Chapter pill in the horizontal selector strip — shows chapter title */
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
      ellipsizeMode="tail"
      style={[
        styles.chapterPillLetter,
        isActive && styles.chapterPillLetterActive,
        !hasData && styles.chapterPillLetterEmpty,
      ]}
    >
      {chapterTitle || `Ch ${chapterId}`}
    </Text>
    {isComplete && <View style={styles.chapterCompleteDot} />}
  </TouchableOpacity>
);

/** Lesson card with accent bar, dot strip, badge, progress bar */
const LessonCard = ({
  lesson, index, isSelected, onPress,
}: {
  lesson: LessonProgress; index: number; isSelected: boolean; onPress: () => void;
}) => {
  const acc = lesson.latestAccuracy;
  const color = accentColor(acc);
  const complete = isLessonComplete(lesson);
  const pct = Math.round((lesson.masteredWords.length / Math.max(lesson.totalWords, 1)) * 100);
  const barColor = complete ? T.green : acc !== null ? color : T.dim;

  // Slide-in animation on first render
  const slideAnim = useRef(new Animated.Value(14)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, delay: index * 55, useNativeDriver: true, tension: 100, friction: 10 }),
      Animated.timing(opacAnim, { toValue: 1, duration: 220, delay: index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacAnim }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[
          styles.lessonCard,
          isSelected && { borderColor: color, borderWidth: 1.5, backgroundColor: accentDim(acc) },
        ]}
      >
        {/* Colored left bar — signals accuracy tier at a glance */}
        <View style={[styles.lessonAccentBar, { backgroundColor: barColor }]} />

        <View style={styles.lessonCardBody}>
          {/* ── Top row: name / IPA / badge ── */}
          <View style={styles.lessonTopRow}>
            <View style={{ flex: 1 }}>
              {/* Satoshi-Bold: lesson name */}
              <Text style={styles.lessonName}>{lesson.lessonDisplayName}</Text>
              {/* Satoshi-Regular: IPA — subtle phonetic context */}
              <Text style={styles.lessonIpa}>{lesson.lessonIpa}</Text>
            </View>

            <View style={styles.lessonBadgeCol}>
              {complete ? (
                <View style={[styles.lessonBadge, { backgroundColor: T.greenDim, borderColor: T.greenBd }]}>
                  {/* Satoshi-Bold: status badge */}
                  <Text style={[styles.lessonBadgeText, { color: T.green }]}>✓ Done</Text>
                </View>
              ) : acc !== null ? (
                <View style={[styles.lessonBadge, { backgroundColor: accentDim(acc), borderColor: accentBorder(acc) }]}>
                  <Text style={[styles.lessonBadgeText, { color }]}>{acc}%</Text>
                </View>
              ) : (
                <View style={[styles.lessonBadge, { backgroundColor: T.surface2, borderColor: T.dim }]}>
                  <Text style={[styles.lessonBadgeText, { color: T.muted }]}>Not tried</Text>
                </View>
              )}
              {lesson.sessionCount > 0 && (
                /* Satoshi-Light: de-emphasized session count */
                <Text style={styles.lessonSessionCount}>
                  {lesson.sessionCount}× played
                </Text>
              )}
            </View>
          </View>

          {/* ── Word dot strip (10 dots) ── */}
          <WordDotStrip lesson={lesson} baseDelay={index * 55} />

          {/* ── Bottom row: mastery fraction + last-played date ── */}
          <View style={styles.lessonBottomRow}>
            <Text style={styles.lessonFractionText}>
              {/* Satoshi-Black: numerator */}
              <Text style={[styles.lessonFractionNum, { color: complete ? T.green : T.text }]}>
                {lesson.masteredWords.length}
              </Text>
              {/* Satoshi-Regular: denominator */}
              <Text style={styles.lessonFractionDen}>/{lesson.totalWords} mastered</Text>
            </Text>
            {/* Satoshi-Light: date stamp */}
            {!!lesson.lastPlayedDate && (
              <Text style={styles.lessonDate}>{lesson.lastPlayedDate}</Text>
            )}
          </View>

          {/* ── Thin progress bar ── */}
          <FillBar percent={pct} color={barColor} height={5} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Word tile grid — shown in the expanded lesson detail panel.
 * Uses the same green / red / gray tri-state as AlphabetMastery's letter grid,
 * but tiles are wider to accommodate full words.
 */
const WordGrid = ({ lesson }: { lesson: LessonProgress }) => {
  const allWords = [...lesson.masteredWords, ...lesson.missedWords, ...lesson.untriedWords];
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
            toValue: 1, delay: i * 28,
            useNativeDriver: true, tension: 130, friction: 8,
          }).start();
        }, [word]);

        return (
          <Animated.View
            key={word}
            style={[styles.wordTile, { backgroundColor: bg, borderColor: bd, transform: [{ scale: scaleAnim }] }]}
          >
            {/* Satoshi-Bold: word text — legible at small size */}
            <Text style={[styles.wordTileText, { color: tc }]}>{word}</Text>
            {!!mark && <Text style={[styles.wordTileMark, { color: tc }]}>{mark}</Text>}
          </Animated.View>
        );
      })}
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StudentWordMastery({ studentId }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { chapters, loading, error } = useStudentWordMastery(studentId, timeRange);

  const [selChapter, setSelChapter] = useState<string | null>(
    chapters.length > 0 ? chapters[0].chapter : null,
  );
  const [selLesson, setSelLesson] = useState<string | null>(null);

  const chapterStripRef = useRef<ScrollView>(null);

  // Reset lesson selection when chapter changes
  useEffect(() => { setSelLesson(null); }, [selChapter]);

  // Auto-scroll chapter strip to keep selected pill visible (pills are variable width)
  useEffect(() => {
    const idx = chapters.findIndex(c => c.chapter === selChapter);
    if (idx >= 0) {
      setTimeout(() => {
        chapterStripRef.current?.scrollTo({ x: idx * 100, animated: true });
      }, 80);
    }
  }, [selChapter, chapters]);

  const currentChapter = chapters.find(c => c.chapter === selChapter) ?? null;
  const currentLesson = currentChapter?.lessons.find(l => l.lesson === selLesson) ?? null;

  // ── Global rollup stats ──
  const totalLessons = chapters.reduce((s, c) => s + c.lessons.length, 0);
  const masteredTotal = chapters.reduce((s, c) => s + c.masteredWords, 0);
  const totalWordSlots = chapters.reduce((s, c) => s + c.totalWords, 0);
  const overallPct = totalWordSlots > 0
    ? Math.round((masteredTotal / totalWordSlots) * 100) : 0;

  // Global accuracy weighted by total attempts across all lessons (sum(correct) / sum(attempted))
  const { totalAttemptedAll, totalCorrectAll } = chapters.reduce(
    (acc, ch) => {
      for (const l of ch.lessons) {
        acc.totalAttemptedAll += l.attempted;
        acc.totalCorrectAll += l.correct;
      }
      return acc;
    },
    { totalAttemptedAll: 0, totalCorrectAll: 0 },
  );

  const avgAccuracy =
    totalAttemptedAll > 0
      ? Math.round((totalCorrectAll / totalAttemptedAll) * 100)
      : null;
  // ── Chapter-level stats ──
  const chapterColor = accentColor(currentChapter?.overallAccuracy ?? null);
  const chapterPct = currentChapter
    ? Math.round((currentChapter.masteredWords / Math.max(currentChapter.totalWords, 1)) * 100)
    : 0;

  return (
    <View style={{ backgroundColor: T.bg }}>

      {loading && (
        <Text style={{ ...F.medium, color: T.muted, marginBottom: 10 }}>Loading word mastery…</Text>
      )}
      {!!error && (
        <Text style={{ ...F.medium, color: T.red, marginBottom: 10 }}>{error}</Text>
      )}

      {/* ──────────────────────────────────────────────
          HEADER
      ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {/* Satoshi-Black: display headline */}
          <Text style={styles.compTitle}>Word{'\n'}Mastery</Text>
          {/* Satoshi-Italic: breadcrumb-style subtitle */}
          <Text style={styles.compSubtitle}>Chapters · Lessons · Words</Text>
        </View>

        {/* Global status chip */}
        <View style={[styles.statusChip, {
          backgroundColor: accentDim(avgAccuracy),
          borderColor: accentBorder(avgAccuracy),
        }]}>
          <View style={[styles.statusDot, { backgroundColor: accentColor(avgAccuracy) }]} />
          <Text style={[styles.statusText, { color: accentColor(avgAccuracy) }]}>
            {overallPct === 100 ? '🏆 Complete' : `${overallPct}% Done`}
          </Text>
        </View>
      </View>

      {/* ──────────────────────────────────────────────
          RANGE FILTER  (Week / Month / Year)
      ────────────────────────────────────────────── */}
      <RangeTab active={timeRange} onPress={setTimeRange} />

      {/* ──────────────────────────────────────────────
          GLOBAL SUMMARY STRIP  (4 metrics)
      ────────────────────────────────────────────── */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: accentColor(avgAccuracy) }]}>
            {avgAccuracy !== null ? `${avgAccuracy}%` : '—'}
          </Text>
          <Text style={styles.summaryLbl}>Avg Acc.</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: T.indigo }]}>{chapters.length}</Text>
          <Text style={styles.summaryLbl}>Chapters</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: T.blue }]}>{totalLessons}</Text>
          <Text style={styles.summaryLbl}>Lessons</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryItem}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1 }}>
            <Text style={[styles.summaryVal, { color: T.violet }]}>{masteredTotal}</Text>
            <Text style={[styles.summaryValSub, { color: T.muted }]}>/{totalWordSlots}</Text>
          </View>
          <Text style={styles.summaryLbl}>Words</Text>
        </View>
      </View>

      {/* ──────────────────────────────────────────────
          OVERALL PROGRESS BAR CARD
      ────────────────────────────────────────────── */}
      <View style={styles.overallCard}>
        <View style={styles.overallCardHeader}>
          <Text style={styles.cardLabel}>Overall Progress</Text>
          <Text style={[styles.overallPct, { color: accentColor(avgAccuracy) }]}>{overallPct}%</Text>
        </View>
        <FillBar percent={overallPct} color={accentColor(avgAccuracy)} height={10} />
        <Text style={styles.overallCaption}>
          {masteredTotal} of {totalWordSlots} words mastered across {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* ──────────────────────────────────────────────
          CHAPTER SELECTOR
      ────────────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Chapters</Text>
        <Text style={styles.cardTitle}>Select a Chapter</Text>

        {/* Horizontal scrolling letter pills */}
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
              isComplete={c.completedLessons === c.lessons.length && c.lessons.length > 0}
              hasData={c.lessons.length > 0}
              onPress={() => setSelChapter(c.chapter)}
            />
          ))}
        </ScrollView>

        {/* Chapter quick-stats (3 metrics) */}
        {currentChapter && (
          <View style={styles.chapterStatRow}>
            <View style={[styles.chapterStatBlock, { borderTopColor: chapterColor }]}>
              <Text style={[styles.chapterStatVal, { color: chapterColor }]}>
                {currentChapter.overallAccuracy !== null
                  ? `${currentChapter.overallAccuracy}%` : '—'}
              </Text>
              <Text style={styles.chapterStatLbl}>Accuracy</Text>
            </View>
            <View style={[styles.chapterStatBlock, { borderTopColor: T.amber }]}>
              {/* Satoshi-Black: completed / total */}
              <Text style={[styles.chapterStatVal, { color: T.amber }]}>
                {currentChapter.completedLessons}
                <Text style={styles.chapterStatSub}>/{currentChapter.lessons.length}</Text>
              </Text>
              <Text style={styles.chapterStatLbl}>Lessons Done</Text>
            </View>
            <View style={[styles.chapterStatBlock, { borderTopColor: T.violet }]}>
              <Text style={[styles.chapterStatVal, { color: T.violet }]}>
                {currentChapter.masteredWords}
                <Text style={styles.chapterStatSub}>/{currentChapter.totalWords}</Text>
              </Text>
              <Text style={styles.chapterStatLbl}>Words</Text>
            </View>
          </View>
        )}

        {/* Chapter progress bar */}
        {currentChapter && (
          <View style={{ marginTop: 10 }}>
            <FillBar percent={chapterPct} color={chapterColor} height={6} />
          </View>
        )}
      </View>

      {/* ──────────────────────────────────────────────
          LESSON LIST  (for selected chapter)
      ────────────────────────────────────────────── */}
      {currentChapter ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Lessons</Text>
          <Text style={styles.cardTitle}>
            {currentChapter.chapterTitle} · {currentChapter.lessons.length} lesson{currentChapter.lessons.length !== 1 ? 's' : ''}
          </Text>

          {currentChapter.lessons.map((lesson, i) => (
            <LessonCard
              key={lesson.lesson}
              lesson={lesson}
              index={i}
              isSelected={lesson.lesson === selLesson}
              onPress={() => setSelLesson(selLesson === lesson.lesson ? null : lesson.lesson)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyNotice}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No chapters yet</Text>
          <Text style={styles.emptyBody}>
            Complete a word reading session to see your progress here.
          </Text>
        </View>
      )}

      {/* ──────────────────────────────────────────────
          LESSON DETAIL PANEL  (tapping a lesson reveals this)
      ────────────────────────────────────────────── */}
      {currentLesson && (
        <View style={styles.card}>
          {/* Header row */}
          <View style={styles.detailHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>Word Breakdown</Text>
              <Text style={[styles.cardTitle, { marginBottom: 0 }]}>
                {currentLesson.lessonDisplayName}
              </Text>
              {/* Satoshi-Regular: IPA annotation */}
              <Text style={styles.detailIpa}>{currentLesson.lessonIpa}</Text>
            </View>

            {/* Count chips — same pattern as AlphabetMastery letter grid */}
            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: T.greenDim, borderColor: T.greenBd }]}>
                <Text style={[styles.chipText, { color: T.green }]}>✓ {currentLesson.masteredWords.length}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: T.redDim, borderColor: T.redBd }]}>
                <Text style={[styles.chipText, { color: T.red }]}>✗ {currentLesson.missedWords.length}</Text>
              </View>
              {currentLesson.untriedWords.length > 0 && (
                <View style={[styles.chip, { backgroundColor: T.surface2, borderColor: T.dim }]}>
                  <Text style={[styles.chipText, { color: T.muted }]}>— {currentLesson.untriedWords.length}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Word tile grid */}
          <WordGrid lesson={currentLesson} />

          {/* Session replay footnote */}
          {currentLesson.sessionCount > 1 && (
            <Text style={styles.replayNote}>
              Practiced {currentLesson.sessionCount} times · last on {currentLesson.lastPlayedDate}
            </Text>
          )}

          {/* Mastery progress bar + caption */}
          <View style={{ marginTop: 14 }}>
            <View style={styles.detailProgRow}>
              <View style={{ flex: 1 }}>
                <FillBar
                  percent={Math.round((currentLesson.masteredWords.length / Math.max(currentLesson.totalWords, 1)) * 100)}
                  color={isLessonComplete(currentLesson) ? T.green : accentColor(currentLesson.latestAccuracy)}
                  height={8}
                />
              </View>
              <Text style={[styles.detailProgPct, {
                color: isLessonComplete(currentLesson) ? T.green : accentColor(currentLesson.latestAccuracy),
              }]}>
                {Math.round((currentLesson.masteredWords.length / Math.max(currentLesson.totalWords, 1)) * 100)}%
              </Text>
            </View>
            {/* Satoshi-Italic: supportive caption */}
            <Text style={styles.detailCaption}>
              {currentLesson.masteredWords.length} of {currentLesson.totalWords} words mastered
            </Text>
          </View>
        </View>
      )}

    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  compTitle: {
    ...F.black,             // Satoshi-Black: dominant headline
    fontSize: 26,
    color: T.text,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  compSubtitle: {
    ...F.italic,            // Satoshi-Italic: lightweight breadcrumb contrast
    fontSize: 12,
    color: T.muted,
    marginTop: 5,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 99 },
  statusText: {
    ...F.bold,              // Satoshi-Bold: punchy badge label
    fontSize: 11,
    letterSpacing: 0.2,
  },

  // ── Range filter (Week / Month / Year) ────────────────────────────────────
  rangeRow: {
    flexDirection: 'row',
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  rangeTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rangeTabText: {
    ...F.medium,
    fontSize: 13,
    color: T.muted,
  },
  rangeTabTextActive: {
    ...F.bold,
    color: T.text,
  },

  // ── Summary strip ────────────────────────────────────────────────────────
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 3 },
  summaryVal: {
    ...F.black,             // Satoshi-Black: summary hero number
    fontSize: 18,
  },
  summaryValSub: {
    ...F.medium,            // Satoshi-Medium: subordinate denominator
    fontSize: 11,
  },
  summaryLbl: {
    ...F.medium,            // Satoshi-Medium uppercase: structured label
    fontSize: 8,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: T.muted,
  },
  summarySep: { width: 1, height: 28, backgroundColor: T.border },

  // ── Overall progress card ────────────────────────────────────────────────
  overallCard: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: 16,
    marginBottom: 14,
  },
  overallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overallPct: {
    ...F.black,             // Satoshi-Black: large pct
    fontSize: 20,
  },
  overallCaption: {
    ...F.italic,            // Satoshi-Italic: soft supporting note
    fontSize: 11,
    color: T.muted,
    marginTop: 6,
  },

  // ── Card base ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    ...F.bold,              // Satoshi-Bold uppercase: section category tag
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: T.muted,
    marginBottom: 2,
  },
  cardTitle: {
    ...F.black,             // Satoshi-Black: section headline
    fontSize: 16,
    color: T.text,
    marginBottom: 14,
  },

  // ── Fill bar ─────────────────────────────────────────────────────────────
  fillTrack: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fillBar: { borderRadius: 999 },

  // ── Chapter pill strip (shows chapter title) ──────────────────────────────
  chapterStripContent: { gap: 8, paddingVertical: 4, paddingHorizontal: 2 },
  chapterPill: {
    minWidth: 72,
    maxWidth: 180,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: T.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chapterPillActive: { backgroundColor: T.text, borderColor: T.text },
  chapterPillEmpty: { opacity: 0.35 },
  chapterPillLetter: {
    ...F.black,
    fontSize: 13,
    color: T.muted,
    textAlign: 'center',
  },
  chapterPillLetterActive: { color: '#fff' },
  chapterPillLetterEmpty: { color: T.dim },
  chapterCompleteDot: {
    position: 'absolute',
    top: 4, right: 4,
    width: 6, height: 6,
    borderRadius: 99,
    backgroundColor: T.green,
  },

  // ── Chapter stat row ──────────────────────────────────────────────────────
  chapterStatRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chapterStatBlock: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderTopWidth: 2,
    borderWidth: 1,
    borderColor: T.border,
  },
  chapterStatVal: {
    ...F.black,             // Satoshi-Black: chapter metric
    fontSize: 18,
    lineHeight: 22,
  },
  chapterStatSub: {
    ...F.medium,            // Satoshi-Medium: denominator
    fontSize: 12,
    color: T.muted,
  },
  chapterStatLbl: {
    ...F.medium,            // Satoshi-Medium uppercase: label
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: T.muted,
    marginTop: 3,
  },

  // ── Lesson card ──────────────────────────────────────────────────────────
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  lessonAccentBar: { width: 4 },
  lessonCardBody: { flex: 1, padding: 14, gap: 8 },
  lessonTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  lessonName: { ...F.bold, fontSize: 14, color: T.text },   // Satoshi-Bold
  lessonIpa: { ...F.regular, fontSize: 12, color: T.blue, marginTop: 1 }, // Satoshi-Regular
  lessonBadgeCol: { alignItems: 'flex-end', gap: 3 },
  lessonBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, borderWidth: 1,
  },
  lessonBadgeText: { ...F.bold, fontSize: 10 },     // Satoshi-Bold: badge label
  lessonSessionCount: { ...F.light, fontSize: 9, color: T.muted }, // Satoshi-Light: de-emphasized
  lessonBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lessonFractionText: { fontSize: 12 },
  lessonFractionNum: { ...F.black, fontSize: 13 },   // Satoshi-Black: mastered count
  lessonFractionDen: { ...F.regular, fontSize: 12, color: T.muted }, // Satoshi-Regular
  lessonDate: { ...F.light, fontSize: 10, color: T.muted }, // Satoshi-Light

  // ── Word dot strip ───────────────────────────────────────────────────────
  dotStrip: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  wordDot: { width: 10, height: 10, borderRadius: 99 },

  // ── Word tile grid ───────────────────────────────────────────────────────
  wordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  wordTile: {
    paddingHorizontal: 11, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1.5,
    position: 'relative',
    justifyContent: 'center', alignItems: 'center',
  },
  wordTileText: { ...F.bold, fontSize: 13 }, // Satoshi-Bold: word in tile
  wordTileMark: {
    ...F.bold,              // Satoshi-Bold: status mark at tiny size
    fontSize: 7,
    position: 'absolute', top: 2, right: 4,
  },

  // ── Lesson detail panel ───────────────────────────────────────────────────
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  detailIpa: {
    ...F.regular,           // Satoshi-Regular: phonetic annotation
    fontSize: 13,
    color: T.blue,
    marginTop: 2,
  },
  chipRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  chipText: { ...F.bold, fontSize: 10 }, // Satoshi-Bold: chip count
  replayNote: {
    ...F.italic,            // Satoshi-Italic: session footnote
    fontSize: 10,
    color: T.muted,
    textAlign: 'center',
    marginTop: 10,
  },
  detailProgRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailProgPct: {
    ...F.black,             // Satoshi-Black: closing pct
    fontSize: 14,
    minWidth: 40,
    textAlign: 'right',
  },
  detailCaption: {
    ...F.italic,            // Satoshi-Italic: soft closing note
    fontSize: 11,
    color: T.muted,
    marginTop: 5,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyNotice: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    borderStyle: 'dashed',
    padding: 28,
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  emptyIcon: { fontSize: 32, marginBottom: 4 },
  emptyTitle: { ...F.bold, fontSize: 15, color: T.text, textAlign: 'center' },
  emptyBody: { ...F.regular, fontSize: 12, color: T.muted, textAlign: 'center', lineHeight: 18 },
});
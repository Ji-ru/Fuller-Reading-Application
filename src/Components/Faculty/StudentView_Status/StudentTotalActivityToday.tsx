import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useStudentTotalActivityToday } from '../../../Hooks/Student/useStudentTotalActivityToday';
import { sw, sh, sf } from '../../../Utils/responsive';
import Svg, { Path, Rect, Circle as SvgCircle } from 'react-native-svg';

// ============================================================================
// DESIGN TOKENS  (matches the light theme used across the StudentView cards)
// ============================================================================

const T = {
  bg: '#ffffff',
  surface: '#f8fafc',
  border: 'rgba(0,0,0,0.07)',
  text: '#0f172a',
  muted: '#64748b',
  dim: '#e2e8f0',

  // Category colors — matching the reference image
  alphabet: '#c084fc',        // Pink/Purple
  alphabetDim: 'rgba(192,132,252,0.15)',
  word: '#fbbf24',            // Yellow/Amber
  wordDim: 'rgba(251,191,36,0.15)',
  passage: '#f97316',         // Orange/Red
  passageDim: 'rgba(249,115,22,0.15)',

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
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * AnimatedProgressBar
 *
 * A single colored progress bar that animates from 0% to the target percentage.
 * Used for the three category bars (Alphabet, Word, Passage).
 */
const AnimatedProgressBar = ({
  percent,
  color,
  delay = 0,
}: {
  percent: number;
  color: string;
  delay?: number;
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: percent,
      delay,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, [percent, widthAnim, delay]);

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
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
// SVG ICON COMPONENTS
// ============================================================================

/** Alphabet icon — stylized letter "A" with a small underline accent */
const AlphabetIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L4 21h3.5l1.5-4h6l1.5 4H20L12 3zm0 5.5L14.5 15h-5L12 8.5z"
      fill={color}
    />
  </Svg>
);

/** Word icon — horizontal text lines representing words */
const WordIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={5} width={18} height={2.5} rx={1.25} fill={color} />
    <Rect x={3} y={10.75} width={14} height={2.5} rx={1.25} fill={color} opacity={0.7} />
    <Rect x={3} y={16.5} width={10} height={2.5} rx={1.25} fill={color} opacity={0.45} />
  </Svg>
);

/** Passage icon — open book with center spine */
const PassageIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21c-1.5-1.2-3.8-2-6.5-2H3V5h2.5C7.8 5 10 5.8 12 7c2-1.2 4.2-2 6.5-2H21v14h-2.5c-2.7 0-5 .8-6.5 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Path d="M12 7v14" stroke={color} strokeWidth={1.5} />
  </Svg>
);

/**
 * CategoryStat
 *
 * A single stat column in the bottom row.
 * Shows a circular icon ring, a numeric percentage, and a category label.
 */
const CategoryStat = ({
  label,
  percent,
  color,
  dimColor,
  iconElement,
  delay = 0,
}: {
  label: string;
  percent: number | null;
  color: string;
  dimColor: string;
  iconElement: React.ReactNode;
  delay?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.categoryStat,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      {/* Icon ring */}
      <View style={[styles.categoryIconRing, { borderColor: color, backgroundColor: dimColor }]}>
        {iconElement}
      </View>

      {/* Percentage */}
      <Text style={[styles.categoryPercent, { color: T.text }]}>
        {percent !== null ? `${percent}%` : '—'}
      </Text>

      {/* Label */}
      <Text style={styles.categoryLabel}>{label}</Text>
    </Animated.View>
  );
};

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  studentId: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StudentTotalActivityToday({ studentId }: Props) {
  const {
    alphabetAccuracy,
    wordAccuracy,
    passageAccuracy,
    overallPercent,
    loading,
    error,
  } = useStudentTotalActivityToday(studentId);

  // ── Loading / Error states ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Loading today's activity…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Determine if there is any activity at all today
  const hasActivity =
    alphabetAccuracy !== null || wordAccuracy !== null || passageAccuracy !== null;

  return (
    <View style={styles.card}>
      {/* ── Overall percentage + label ── */}
      <View style={styles.overallRow}>
        <Text style={styles.overallPercent}>
          {hasActivity ? `${overallPercent}%` : '—'}
        </Text>
        <Text style={styles.overallLabel}>Total Activity{'\n'}Today</Text>
      </View>

      {/* ── Three category progress bars ── */}
      <View style={styles.barsContainer}>
        <AnimatedProgressBar
          percent={alphabetAccuracy ?? 0}
          color={T.alphabet}
          delay={0}
        />
        <AnimatedProgressBar
          percent={wordAccuracy ?? 0}
          color={T.word}
          delay={80}
        />
        <AnimatedProgressBar
          percent={passageAccuracy ?? 0}
          color={T.passage}
          delay={160}
        />
      </View>

      {/* ── Percentage labels under bars ── */}
      <View style={styles.barLabelsRow}>
        <Text style={[styles.barLabel, { color: T.alphabet }]}>
          {alphabetAccuracy !== null ? `${alphabetAccuracy}%` : '0%'}
        </Text>
        <Text style={[styles.barLabel, { color: T.word }]}>
          {wordAccuracy !== null ? `${wordAccuracy}%` : '0%'}
        </Text>
        <Text style={[styles.barLabel, { color: T.passage }]}>
          {passageAccuracy !== null ? `${passageAccuracy}%` : '0%'}
        </Text>
      </View>

      {/* ── Category stat cards ── */}
      <View style={styles.categoryRow}>
        <CategoryStat
          label="Alphabet"
          percent={alphabetAccuracy}
          color={T.alphabet}
          dimColor={T.alphabetDim}
          iconElement={<AlphabetIcon color={T.alphabet} />}
          delay={100}
        />
        <CategoryStat
          label="Word"
          percent={wordAccuracy}
          color={T.word}
          dimColor={T.wordDim}
          iconElement={<WordIcon color={T.word} />}
          delay={200}
        />
        <CategoryStat
          label="Passage"
          percent={passageAccuracy}
          color={T.passage}
          dimColor={T.passageDim}
          iconElement={<PassageIcon color={T.passage} />}
          delay={300}
        />
      </View>

      {/* ── No activity notice ── */}
      {!hasActivity && (
        <Text style={styles.noActivityText}>
          No reading activity recorded today.
        </Text>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.bg,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: sw(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.06,
    shadowRadius: sw(8),
    elevation: 3,
  },

  // ── Loading / Error ──
  loadingText: {
    ...F.medium,
    fontSize: sf(14),
    color: T.muted,
    textAlign: 'center',
    paddingVertical: sh(16),
  },
  errorText: {
    ...F.medium,
    fontSize: sf(13),
    color: '#f87171',
    textAlign: 'center',
    paddingVertical: sh(16),
  },

  // ── Overall percentage ──
  overallRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: sh(18),
    gap: sw(10),
  },
  overallPercent: {
    ...F.black,
    fontSize: sf(42),
    color: T.text,
    letterSpacing: sf(-1),
  },
  overallLabel: {
    ...F.medium,
    fontSize: sf(14),
    color: T.muted,
    lineHeight: sf(20),
  },

  // ── Progress bars ──
  barsContainer: {
    flexDirection: 'row',
    gap: sw(4),
    marginBottom: sh(8),
  },
  progressTrack: {
    flex: 1,
    height: sh(6),
    backgroundColor: T.dim,
    borderRadius: sw(99),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: sw(99),
  },

  // ── Bar labels ──
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(20),
    paddingHorizontal: sw(4),
  },
  barLabel: {
    ...F.bold,
    fontSize: sf(12),
    flex: 1,
    textAlign: 'center',
  },

  // ── Category stat cards ──
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: sw(8),
  },
  categoryStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: sw(14),
    paddingVertical: sh(16),
    paddingHorizontal: sw(8),
    borderWidth: 1,
    borderColor: T.border,
  },
  categoryIconRing: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(22),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(8),
  },
  categoryPercent: {
    ...F.black,
    fontSize: sf(18),
    marginBottom: sh(2),
  },
  categoryLabel: {
    ...F.medium,
    fontSize: sf(11),
    color: T.muted,
    textTransform: 'uppercase',
    letterSpacing: sf(0.5),
  },

  // ── Empty state ──
  noActivityText: {
    ...F.italic,
    fontSize: sf(12),
    color: T.muted,
    textAlign: 'center',
    marginTop: sh(12),
  },
});

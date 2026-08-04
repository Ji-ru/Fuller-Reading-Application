import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useStudentTotalActivityToday } from '../../../Hooks/Student/useStudentTotalActivityToday';
import { sw, sh, sf } from '../../../Utils/responsive';
import Svg, { Path, Rect } from 'react-native-svg';

// ─── Design Tokens ──────────────────────────────────────────────────────────
const T = {
  bg: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  muted: '#64748b',
  dim: '#f1f5f9',
  // Category colors
  alphabet: '#A855F7',
  word: '#F59E0B',
  passage: '#F97316',
  radius: sw(16),
};

const F = {
  bold: { fontFamily: 'Satoshi-Bold' },
  medium: { fontFamily: 'Satoshi-Medium' },
  regular: { fontFamily: 'Satoshi-Regular' },
};

// ─── Sub-Components ─────────────────────────────────────────────────────────
const ActivityRow = ({
  label,
  desc,
  percent,
  color,
  icon,
  delay = 0
}: {
  label: string;
  desc: string;
  percent: number;
  color: string;
  icon: React.ReactNode;
  delay?: number;
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(widthAnim, {
        toValue: percent,
        delay: delay + 100,
        useNativeDriver: false,
        tension: 30,
        friction: 8
      }),
    ]).start();
  }, [percent, delay]);

  return (
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        {icon}
      </View>

      <View style={styles.contentCol}>
        <View style={styles.labelRow}>
          <View>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowDesc}>{desc}</Text>
          </View>
          <Text style={[styles.rowPercent, { color }]}>{percent}%</Text>
        </View>

        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: color,
                width: widthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                })
              }
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Icons ──────────────────────────────────────────────────────────────────
const AlphabetIcon = ({ color }: { color: string }) => (
  <Svg width={sw(16)} height={sw(16)} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L4 21h3.5l1.5-4h6l1.5 4H20L12 3zm0 5.5L14.5 15h-5L12 8.5z" fill={color} />
  </Svg>
);

const WordIcon = ({ color }: { color: string }) => (
  <Svg width={sw(16)} height={sw(16)} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={5} width={18} height={2.5} rx={1} fill={color} />
    <Rect x={3} y={11} width={14} height={2.5} rx={1} fill={color} opacity={0.7} />
    <Rect x={3} y={17} width={10} height={2.5} rx={1} fill={color} opacity={0.4} />
  </Svg>
);

const PassageIcon = ({ color }: { color: string }) => (
  <Svg width={sw(16)} height={sw(16)} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21c-1.5-1.2-3.8-2-6.5-2H3V5h2.5C7.8 5 10 5.8 12 7c2-1.2 4.2-2 6.5-2H21v14h-2.5c-2.7 0-5 .8-6.5 2z" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
    <Path d="M12 7v14" stroke={color} strokeWidth={1.5} />
  </Svg>
);

// ─── Main Component ─────────────────────────────────────────────────────────
interface Props {
  studentId: string;
}

export default function StudentTotalActivityToday({ studentId }: Props) {
  const {
    alphabetAccuracy,
    wordAccuracy,
    passageAccuracy,
    loading,
    error,
  } = useStudentTotalActivityToday(studentId);

  if (loading || error) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator color={T.alphabet} size="small" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <ActivityRow
        label="Alphabet"
        desc="Letter sounds recognition"
        percent={alphabetAccuracy ?? 0}
        color={T.alphabet}
        icon={<AlphabetIcon color={T.alphabet} />}
        delay={0}
      />

      <ActivityRow
        label="Words"
        desc="Single word pronunciation"
        percent={wordAccuracy ?? 0}
        color={T.word}
        icon={<WordIcon color={T.word} />}
        delay={100}
      />

      <ActivityRow
        label="Passage"
        desc="Reading flow & comprehension"
        percent={passageAccuracy ?? 0}
        color={T.passage}
        icon={<PassageIcon color={T.passage} />}
        delay={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.bg,
    borderRadius: T.radius,
    padding: sw(14),
    borderWidth: 1,
    borderColor: T.border,
  },
  center: {
    height: sh(120),
    justifyContent: 'center',
  },
  title: {
    ...F.bold,
    fontSize: sf(14),
    color: T.muted,
    marginBottom: sh(14),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(12),
    backgroundColor: T.surface,
    padding: sw(10),
    borderRadius: sw(12),
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconBox: {
    width: sw(34),
    height: sw(34),
    borderRadius: sw(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(12),
  },
  contentCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sh(6),
  },
  rowLabel: {
    ...F.bold,
    fontSize: sf(13),
    color: T.text,
  },
  rowDesc: {
    ...F.regular,
    fontSize: sf(10),
    color: T.muted,
    marginTop: -sh(1),
  },
  rowPercent: {
    ...F.bold,
    fontSize: sf(14),
  },
  track: {
    height: sh(5),
    backgroundColor: T.dim,
    borderRadius: sw(10),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: sw(10),
  },
});

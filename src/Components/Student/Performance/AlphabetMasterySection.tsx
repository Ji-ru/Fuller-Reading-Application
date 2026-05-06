import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { StudentColors as C, Radii } from '../../../Utilities/Theme';
import {
  use_StudentAlphabetMasteryTrends,
  AlphabetPeriodSlot,
} from '../../../Hooks/use_StudentAlphabetMasteryTrends';
import readingMaterialData from '../../../../assets/ReadingMaterial/ReadingMaterial.json';
import { SubPeriodFilter } from '../DateFilter';

// ── Design constants ──────────────────────────────────────────────────────────
const TEAL       = '#1abc9c';
const TEAL_DIM   = 'rgba(26,188,156,0.14)';
const TEAL_BD    = 'rgba(26,188,156,0.35)';
const BAR_MAX_H  = 80;

// ── Bar column ────────────────────────────────────────────────────────────────

const BarColumn = ({
  slot,
  isActive,
  maxCount,
  index,
  onPress,
}: {
  slot: AlphabetPeriodSlot;
  isActive: boolean;
  maxCount: number;
  index: number;
  onPress: () => void;
}) => {
  const hasData  = slot.correctCount > 0;
  const targetH  = hasData && maxCount > 0 ? (slot.correctCount / maxCount) * BAR_MAX_H : 4;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: hasData ? targetH : 0,
      delay: index * 40,
      useNativeDriver: false,
      tension: 90,
      friction: 10,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetH, hasData]);

  return (
    <TouchableOpacity onPress={onPress} style={S.barCol} activeOpacity={0.75}>
      {/* Count label above bar */}
      <Text style={[S.barCount, { color: hasData ? (isActive ? TEAL : C.slate) : C.mint }]}>
        {hasData ? `×${slot.correctCount}` : '—'}
      </Text>

      {/* Bar track */}
      <View style={S.barTrack}>
        {hasData && (
          <Animated.View
            style={[
              S.barFill,
              { height: heightAnim, backgroundColor: isActive ? TEAL : `${TEAL}55` },
            ]}
          />
        )}
      </View>

      {/* Active indicator tick */}
      <View style={[S.barTick, { backgroundColor: isActive ? TEAL : 'transparent' }]} />

      {/* Slot label */}
      <Text style={[S.barLabel, isActive && S.barLabelActive, !hasData && S.barLabelEmpty]}>
        {slot.label}
      </Text>
    </TouchableOpacity>
  );
};

// ── Letter tile ───────────────────────────────────────────────────────────────

const LetterTile = ({
  letter,
  isSlotLetter,
  delay,
}: {
  letter: string;
  isSlotLetter: boolean;
  delay: number;
}) => {
  const scale   = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, delay, useNativeDriver: true, tension: 130, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, delay, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  const bg     = isSlotLetter ? TEAL_DIM : C.bg;
  const border = isSlotLetter ? TEAL_BD  : C.greenPale;
  const color  = isSlotLetter ? TEAL     : C.mint;

  return (
    <Animated.View
      style={[
        S.letterTile,
        { backgroundColor: bg, borderColor: border, transform: [{ scale }], opacity },
      ]}
    >
      <Text style={[S.letterChar, { color }]}>{letter}</Text>
      {isSlotLetter && <Text style={[S.letterMark, { color }]}>✓</Text>}
    </Animated.View>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface AlphabetMasterySectionProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
  periodOffset?: number;
  selectedSubFilter?: SubPeriodFilter | null;
}

export default function AlphabetMasterySection({
  studentId,
  timeFilter,
  periodOffset = 0,
  selectedSubFilter = null,
}: AlphabetMasterySectionProps) {
  const {
    loading,
    periodSlots,
    periodLetters,
    allTimeLetters,
    periodCount,
    allTimeCount,
    totalLetters,
  } = use_StudentAlphabetMasteryTrends(studentId, timeFilter, periodOffset);

  // ── Default to today's slot (or last slot with data for past periods) ──
  const defaultIdx = useMemo(() => {
    if (!periodSlots.length) return 0;
    const now = new Date();
    // Try to find today within the period
    for (let i = 0; i < periodSlots.length; i++) {
      const { slotStart, slotEnd } = periodSlots[i];
      if (now >= slotStart && now <= slotEnd) return i;
    }
    // Viewing a past period — default to last slot with data, else last slot
    for (let i = periodSlots.length - 1; i >= 0; i--) {
      if (periodSlots[i].correctCount > 0) return i;
    }
    return periodSlots.length - 1;
  }, [periodSlots]);

  const [activeIdx, setActiveIdx] = useState(defaultIdx);

  // Reset when period changes
  useEffect(() => {
    setActiveIdx(defaultIdx);
  }, [defaultIdx, timeFilter, periodOffset]);

  // ── Sync: DateFilter sub-filter → bar chart highlight ──
  const syncedIdx = useMemo(() => {
    if (!selectedSubFilter || !periodSlots.length) return null;
    const sfStart = selectedSubFilter.start;
    for (let i = 0; i < periodSlots.length; i++) {
      const { slotStart, slotEnd } = periodSlots[i];
      if (sfStart >= slotStart && sfStart <= slotEnd) return i;
    }
    return null;
  }, [selectedSubFilter, periodSlots]);

  useEffect(() => {
    if (syncedIdx !== null) setActiveIdx(syncedIdx);
  }, [syncedIdx]);

  // Auto-scroll to keep active bar visible
  const stripRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (!periodSlots.length) return;
    const t = setTimeout(() => {
      stripRef.current?.scrollTo({ x: activeIdx * 56, animated: true });
    }, 120);
    return () => clearTimeout(t);
  }, [activeIdx, periodSlots.length]);

  const activeSlot: AlphabetPeriodSlot | undefined = periodSlots[activeIdx];
  const maxCount = useMemo(
    () => Math.max(...periodSlots.map(s => s.correctCount), 1),
    [periodSlots],
  );

  // Letters highlighted in the grid = ONLY those mastered in the active slot
  const slotLetterSet = useMemo(
    () => new Set(activeSlot?.correctLetters ?? []),
    [activeSlot],
  );

  // All Marungko letters from ReadingMaterial
  const allLetters: string[] = useMemo(
    () => readingMaterialData.Alphabet.map((a: { letter: string }) => a.letter),
    [],
  );

  // ── Progress bar — keyed to active slot, same as bar chart + letter grid ──
  const slotCount   = activeSlot?.correctCount ?? 0;
  const progressPct = Math.round((slotCount / totalLetters) * 100) || 0;

  const progressWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Re-animate every time the active slot changes (reset to 0 first for a clean fill)
    progressWidth.setValue(0);
    Animated.spring(progressWidth, {
      toValue: progressPct,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [progressPct, progressWidth, activeIdx]);

  // ── Loading ──
  if (loading) {
    return (
      <View style={S.loadBox}>
        <ActivityIndicator color={TEAL} size="small" />
        <Text style={S.loadText}>Nilo-load ang datos…</Text>
      </View>
    );
  }

  const hasAnyActivity = periodSlots.some(s => s.correctCount > 0);

  return (
    <View>

      {/* ── LAYER 1: Summary chips ── */}
      <View style={S.chipRow}>
        <View style={[S.chip, { backgroundColor: TEAL_DIM }]}>
          <Text style={[S.chipNum, { color: TEAL }]}>{periodCount}</Text>
          <Text style={S.chipLabel}>Sa Panahon</Text>
        </View>
        <View style={[S.chip, { backgroundColor: C.greenLight + 'AA' }]}>
          <Text style={[S.chipNum, { color: C.green }]}>{allTimeCount}</Text>
          <Text style={S.chipLabel}>Kabuuan</Text>
        </View>
        <View style={[S.chip, { backgroundColor: C.bg }]}>
          <Text style={[S.chipNum, { color: C.slate }]}>{Math.max(0, totalLetters - allTimeCount)}</Text>
          <Text style={S.chipLabel}>Hindi pa</Text>
        </View>
      </View>

      {/* ── LAYER 2: Slot progress bar ── */}
      <View style={S.progressCard}>
        <View style={S.progressRow}>
          <Text style={S.progressLabel}>
            {activeSlot ? `Titik sa ${activeSlot.label}` : 'Pag-unlad'}
          </Text>
          <Text style={[S.progressPct, { color: TEAL }]}>{progressPct}%</Text>
        </View>
        <View style={S.trackBg}>
          <Animated.View
            style={[
              S.trackFill,
              {
                width: progressWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                backgroundColor: TEAL,
              },
            ]}
          />
        </View>
        <Text style={S.progressCaption}>
          {slotCount > 0
            ? `${slotCount} titik ang natapos sa ${activeSlot?.label ?? 'panahong ito'}`
            : `Walang titik ang natapos sa ${activeSlot?.label ?? 'panahong ito'}`}
        </Text>
      </View>

      {/* ── LAYER 3: Bar chart — letters mastered per slot ── */}
      <View style={S.chartSection}>
        <View style={S.chartHeader}>
          <Text style={S.chartTitle}>Mga Titik Natutuhan</Text>
          {hasAnyActivity && (
            <View style={[S.badge, { backgroundColor: TEAL_DIM }]}>
              <Text style={[S.badgeText, { color: TEAL }]}>{periodCount} titik</Text>
            </View>
          )}
        </View>

        {hasAnyActivity ? (
          <ScrollView
            ref={stripRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.barStrip}
          >
            {periodSlots.map((slot, i) => (
              <BarColumn
                key={i}
                slot={slot}
                isActive={activeIdx === i}
                maxCount={maxCount}
                index={i}
                onPress={() => setActiveIdx(i)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={S.emptyChart}>
            <Text style={S.emptyIcon}>📭</Text>
            <Text style={S.emptyTitle}>Walang bagong titik</Text>
            <Text style={S.emptyBody}>
              Walang titik ang natapos sa panahong ito.
            </Text>
          </View>
        )}
      </View>

      {/* ── LAYER 4: Letter grid for active slot ── */}
      <View style={S.gridSection}>
        <View style={S.gridHeader}>
          <Text style={S.gridTitle}>
            {activeSlot ? `Titik sa ${activeSlot.label}` : 'Lahat ng Titik'}
          </Text>
          {activeSlot && activeSlot.correctCount > 0 ? (
            <View style={[S.badge, { backgroundColor: TEAL_DIM }]}>
              <Text style={[S.badgeText, { color: TEAL }]}>
                {activeSlot.correctCount} bago
              </Text>
            </View>
          ) : (
            <Text style={S.gridNoActivity}>Walang aktibidad</Text>
          )}
        </View>

        <View style={S.letterGrid}>
          {allLetters.map((letter, idx) => (
            <LetterTile
              key={letter}
              letter={letter}
              isSlotLetter={slotLetterSet.has(letter)}
              delay={idx * 20}
            />
          ))}
        </View>

        {/* Legend */}
        <View style={S.legend}>
          <View style={S.legendItem}>
            <View style={[S.legendDot, { backgroundColor: TEAL }]} />
            <Text style={S.legendText}>Natutuhan sa slot na ito</Text>
          </View>
          <View style={S.legendItem}>
            <View style={[S.legendDot, { backgroundColor: C.mint }]} />
            <Text style={S.legendText}>Hindi pa / ibang araw</Text>
          </View>
        </View>
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  loadBox: { height: 160, justifyContent: 'center', alignItems: 'center' },
  loadText: { marginTop: 10, fontSize: 12, color: C.slate, fontWeight: '600' },

  /* Chips */
  chipRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  chip:      { flex: 1, marginHorizontal: 4, paddingVertical: 14, borderRadius: Radii.md, alignItems: 'center' },
  chipNum:   { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  chipLabel: { fontSize: 10, fontWeight: '700', color: C.slate, textTransform: 'uppercase', letterSpacing: 0.4 },

  /* Progress */
  progressCard:    { backgroundColor: C.bg, padding: 16, borderRadius: Radii.md, marginBottom: 16 },
  progressRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel:   { fontSize: 14, fontWeight: '800', color: C.ink },
  progressPct:     { fontSize: 18, fontWeight: '900' },
  trackBg:         { height: 10, backgroundColor: C.white, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  trackFill:       { height: '100%', borderRadius: 5 },
  progressCaption: { fontSize: 11, color: C.slate, fontWeight: '600', textAlign: 'center' },

  /* Bar chart */
  chartSection: { marginBottom: 16 },
  chartHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle:   { fontSize: 13, fontWeight: '800', color: C.ink },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radii.pill },
  badgeText:    { fontSize: 11, fontWeight: '800' },

  barStrip: { paddingVertical: 4, paddingRight: 16 },
  barCol:   { width: 48, alignItems: 'center', marginRight: 8 },
  barCount: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  barTrack: {
    width: 28,
    height: BAR_MAX_H,
    backgroundColor: C.bg,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill:        { width: '100%', borderRadius: 6 },
  barTick:        { width: 28, height: 3, borderRadius: 2, marginTop: 4, marginBottom: 4 },
  barLabel:       { fontSize: 10, fontWeight: '700', color: C.slate, textAlign: 'center' },
  barLabelActive: { color: C.ink, fontWeight: '900' },
  barLabelEmpty:  { color: C.mint },

  /* Empty chart */
  emptyChart: { paddingVertical: 28, alignItems: 'center', backgroundColor: C.bg, borderRadius: Radii.md },
  emptyIcon:  { fontSize: 28, marginBottom: 8 },
  emptyTitle: { fontSize: 13, fontWeight: '800', color: C.ink, marginBottom: 4 },
  emptyBody:  { fontSize: 11, color: C.slate, fontWeight: '600', textAlign: 'center', paddingHorizontal: 20 },

  /* Letter grid */
  gridSection:    { backgroundColor: C.bg, padding: 14, borderRadius: Radii.md },
  gridHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gridTitle:      { fontSize: 13, fontWeight: '800', color: C.ink },
  gridNoActivity: { fontSize: 11, fontWeight: '700', color: C.slate, fontStyle: 'italic' },

  letterGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  letterTile: {
    width: '18%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: Radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterChar: { fontSize: 14, fontWeight: '900' },
  letterMark: { fontSize: 9, fontWeight: '700', marginTop: 1 },

  /* Legend */
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.greenPale,
    gap: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot:  { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { fontSize: 10, fontWeight: '700', color: C.slate },
});

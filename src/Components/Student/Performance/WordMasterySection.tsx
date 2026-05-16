import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../../Utilities/Theme';
import { useFocusEffect } from '@react-navigation/native';
import {
  use_StudentWordMastery,
  AralinWordInfo,
  WordPeriodSlot,
} from '../../../Hooks/use_StudentWordMastery';
import readingMaterialData from '../../../../assets/ReadingMaterial/ReadingMaterial.json';
import { CheckCircleIcon, XCircleIcon } from '../../GlobalUse/Icons';
import { SubPeriodFilter } from '../DateFilter';

// ── Design constants ──────────────────────────────────────────────────────────
const GREEN = '#22c55e';
const GREEN_DIM = 'rgba(34,197,94,0.14)';
const BAR_MAX_H = 80;

// ── Bar column ────────────────────────────────────────────────────────────────

const BarColumn = ({
  slot,
  isActive,
  maxCount,
  index,
  onPress,
}: {
  slot: WordPeriodSlot;
  isActive: boolean;
  maxCount: number;
  index: number;
  onPress: () => void;
}) => {
  const hasData = slot.wordCount > 0;
  const targetH = hasData && maxCount > 0 ? (slot.wordCount / maxCount) * BAR_MAX_H : 0;
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
      <Text style={[S.barCount, { color: hasData ? (isActive ? GREEN : C.slate) : C.mint }]}>
        {hasData ? `×${slot.wordCount}` : '—'}
      </Text>

      <View style={S.barTrack}>
        {hasData && (
          <Animated.View
            style={[
              S.barFill,
              { height: heightAnim, backgroundColor: isActive ? GREEN : `${GREEN}55` },
            ]}
          />
        )}
      </View>

      <View style={[S.barTick, { backgroundColor: isActive ? GREEN : 'transparent' }]} />

      <Text style={[S.barLabel, isActive && S.barLabelActive, !hasData && S.barLabelEmpty]}>
        {slot.label}
      </Text>
    </TouchableOpacity>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface WordMasterySectionProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
  periodOffset?: number;
  selectedSubFilter?: SubPeriodFilter | null;
}

export default function WordMasterySection({
  studentId,
  timeFilter,
  periodOffset = 0,
  selectedSubFilter = null,
}: WordMasterySectionProps) {
  const {
    loading,
    stats,
    cumulativeStats,
    cumulativeLetters,
    periodSlots,
    getAralinWords,
    refresh,
  } = use_StudentWordMastery(studentId, timeFilter, periodOffset, selectedSubFilter);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const [selectedLetter, setSelectedLetter] = useState<string>('M');
  const [showGrid, setShowGrid] = useState(true);

  const aralinWords = getAralinWords(selectedLetter);

  // ── Bar chart: default active slot = today (or last slot with data) ──
  const defaultIdx = useMemo(() => {
    if (!periodSlots.length) return 0;
    const now = new Date();
    for (let i = 0; i < periodSlots.length; i++) {
      const { slotStart, slotEnd } = periodSlots[i];
      if (now >= slotStart && now <= slotEnd) return i;
    }
    for (let i = periodSlots.length - 1; i >= 0; i--) {
      if (periodSlots[i].wordCount > 0) return i;
    }
    return periodSlots.length - 1;
  }, [periodSlots]);

  const [activeIdx, setActiveIdx] = useState(defaultIdx);

  useEffect(() => {
    setActiveIdx(defaultIdx);
  }, [defaultIdx, timeFilter, periodOffset]);

  // ── Sync: DateFilter sub-filter → bar highlight ──
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

  // Auto-scroll bar strip to keep active bar visible
  const stripRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (!periodSlots.length) return;
    const t = setTimeout(() => {
      stripRef.current?.scrollTo({ x: activeIdx * 56, animated: true });
    }, 120);
    return () => clearTimeout(t);
  }, [activeIdx, periodSlots.length]);

  const maxCount = useMemo(
    () => Math.max(...periodSlots.map(s => s.wordCount), 1),
    [periodSlots],
  );
  const hasAnyActivity = periodSlots.some(s => s.wordCount > 0);

  // Letters mastered in the ACTIVE slot only — drives letter-pill highlight
  // so the selector reacts when the user taps a different bar.
  const activeSlot = periodSlots[activeIdx];
  const slotLetters = useMemo(() => {
    const set = new Set<string>();
    if (!activeSlot) return set;
    activeSlot.words.forEach(w => {
      const group = readingMaterialData.Words.find(g =>
        g.contrasts.some(c => c.words.includes(w)),
      );
      if (group) set.add(group.letter);
    });
    return set;
  }, [activeSlot]);

  // ── Loading ──
  if (loading) {
    return (
      <View style={S.loadBox}>
        <ActivityIndicator color={C.green} size="small" />
        <Text style={S.loadText}>Nilo-load ang datos…</Text>
      </View>
    );
  }

  const progressPercent = Math.round((stats.mastered / stats.total) * 100) || 0;
  const progressColor =
    progressPercent >= 85 ? '#22c55e' :
      progressPercent >= 60 ? '#f59e0b' :
        '#ef4444';

  return (
    <View>

      {/* ── LAYER 1: Summary chips (period-filtered) ── */}
      <View style={S.chipRow}>
        <View style={[S.chip, { backgroundColor: '#22c55e12' }]}>
          <Text style={[S.chipNum, { color: '#16a34a' }]}>{stats.mastered}</Text>
          <Text style={S.chipLabel}>Natutuhan</Text>
        </View>
        <View style={[S.chip, { backgroundColor: '#f59e0b12' }]}>
          <Text style={[S.chipNum, { color: '#d97706' }]}>{stats.tried}</Text>
          <Text style={S.chipLabel}>Sinubukan</Text>
        </View>
        <View style={[S.chip, { backgroundColor: C.bg }]}>
          <Text style={[S.chipNum, { color: C.slate }]}>{stats.new}</Text>
          <Text style={S.chipLabel}>Hindi pa</Text>
        </View>
      </View>

      {/* ── LAYER 2: Progress bar ── */}
      <View style={S.progressCard}>
        <View style={S.progressRow}>
          <Text style={S.progressLabel}>Kabuuan ng Pag-unlad</Text>
          <Text style={[S.progressPct, { color: progressColor }]}>{progressPercent}%</Text>
        </View>
        <View style={S.trackBg}>
          <View style={[S.trackFill, { width: `${progressPercent}%`, backgroundColor: progressColor }]} />
        </View>
        <Text style={S.progressCaption}>
          {stats.mastered} sa {stats.total} na salita ang natapos na
        </Text>
      </View>

      {/* ── LAYER 4: Lesson selector ── */}
      <View style={S.letterSection}>
        <View style={S.letterHeaderRow}>
          <Text style={S.letterHeaderText}>Pumili ng Aralin</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.letterScroll}
        >
          {readingMaterialData.Alphabet.map((item, idx) => {
            const sel = selectedLetter === item.letter;
            const done = slotLetters.has(item.letter);
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => { setSelectedLetter(item.letter); setShowGrid(true); }}
                style={[S.letterCircle, sel && S.letterCircleSel, !sel && done && S.letterCircleDone]}
                activeOpacity={0.7}
              >
                <Text style={[S.letterChar, sel && S.letterCharSel]}>{item.letter}</Text>
                {done && !sel && <View style={S.doneDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── LAYER 5: Word grid (progressive detail) ── */}
      {showGrid && (
        <View style={S.gridSection}>
          <View style={S.gridHeaderRow}>
            <Text style={S.gridTitle}>Salita para sa Aralin {selectedLetter}</Text>
            <View style={S.gridBadge}>
              <Text style={S.gridBadgeText}>
                {aralinWords.filter(w => w.status === 'mastered').length}/{aralinWords.length}
              </Text>
            </View>
          </View>

          {aralinWords.length > 0 ? (
            <View style={S.grid}>
              {aralinWords.map((item, idx) => (
                <View key={idx} style={[S.tile, tileStyle(item.status)]}>
                  <Text style={[
                    S.tileWord,
                    item.status === 'mastered' && { color: '#16a34a' },
                    item.status === 'tried' && { color: '#d97706' },
                  ]}>
                    {item.word}
                  </Text>
                  <View style={S.tileIcon}>
                    {item.status === 'mastered' ? (
                      <CheckCircleIcon size={14} color="#22c55e" />
                    ) : item.status === 'tried' ? (
                      <XCircleIcon size={14} color="#f59e0b" />
                    ) : (
                      <Text style={S.unseenDash}>—</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={S.emptyGrid}>
              <Text style={S.emptyGridText}>Walang salita sa araling ito.</Text>
            </View>
          )}

          <View style={S.legend}>
            <View style={S.legendItem}>
              <View style={[S.legendDot, { backgroundColor: '#22c55e' }]} />
              <Text style={S.legendText}>Natutuhan</Text>
            </View>
            <View style={S.legendItem}>
              <View style={[S.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={S.legendText}>Sanayin pa</Text>
            </View>
            <View style={S.legendItem}>
              <View style={[S.legendDot, { backgroundColor: C.mint }]} />
              <Text style={S.legendText}>Hindi pa</Text>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function tileStyle(status: string) {
  switch (status) {
    case 'mastered': return { backgroundColor: '#22c55e0D', borderColor: '#22c55e30' };
    case 'tried': return { backgroundColor: '#f59e0b0D', borderColor: '#f59e0b30' };
    default: return { backgroundColor: C.bg, borderColor: C.greenPale };
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  loadBox: { height: 160, justifyContent: 'center', alignItems: 'center' },
  loadText: { marginTop: 10, fontSize: 12, color: C.slate, fontWeight: '600' },

  /* Chips */
  chipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  chip: { flex: 1, marginHorizontal: 4, paddingVertical: 14, borderRadius: Radii.md, alignItems: 'center' },
  chipNum: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  chipLabel: { fontSize: 10, fontWeight: '700', color: C.slate, textTransform: 'uppercase', letterSpacing: 0.4 },

  /* Progress */
  progressCard: { backgroundColor: C.bg, padding: 16, borderRadius: Radii.md, marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '800', color: C.ink },
  progressPct: { fontSize: 18, fontWeight: '900' },
  trackBg: { height: 10, backgroundColor: C.white, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  trackFill: { height: '100%', borderRadius: 5 },
  progressCaption: { fontSize: 11, color: C.slate, fontWeight: '600', textAlign: 'center' },

  /* Bar chart */
  chartSection: { marginBottom: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: 13, fontWeight: '800', color: C.ink },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radii.pill },
  badgeText: { fontSize: 11, fontWeight: '800' },

  barStrip: { paddingVertical: 4, paddingRight: 16 },
  barCol: { width: 48, alignItems: 'center', marginRight: 8 },
  barCount: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  barTrack: {
    width: 28,
    height: BAR_MAX_H,
    backgroundColor: C.bg,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 6 },
  barTick: { width: 28, height: 3, borderRadius: 2, marginTop: 4, marginBottom: 4 },
  barLabel: { fontSize: 10, fontWeight: '700', color: C.slate, textAlign: 'center' },
  barLabelActive: { color: C.ink, fontWeight: '900' },
  barLabelEmpty: { color: C.mint },

  /* Empty chart */
  emptyChart: { paddingVertical: 28, alignItems: 'center', backgroundColor: C.bg, borderRadius: Radii.md },
  emptyIcon: { fontSize: 28, marginBottom: 8 },
  emptyTitle: { fontSize: 13, fontWeight: '800', color: C.ink, marginBottom: 4 },
  emptyBody: { fontSize: 11, color: C.slate, fontWeight: '600', textAlign: 'center', paddingHorizontal: 20 },

  /* Letter selector */
  letterSection: { marginBottom: 12 },
  letterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  letterHeaderText: { fontSize: 13, fontWeight: '800', color: C.ink },
  toggleText: { fontSize: 11, fontWeight: '700', color: C.green },
  letterScroll: { paddingVertical: 4, paddingRight: 16 },
  letterCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  letterCircleSel: { backgroundColor: C.green, transform: [{ scale: 1.08 }], ...Shadows.subtle },
  letterCircleDone: { backgroundColor: C.greenLight, borderWidth: 1.5, borderColor: C.green + '40' },
  letterChar: { fontSize: 14, fontWeight: '900', color: C.slate },
  letterCharSel: { color: C.white },
  doneDot: { position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.green },

  /* Word grid */
  gridSection: { backgroundColor: C.bg, padding: 14, borderRadius: Radii.md, marginTop: 4 },
  gridHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 14, fontWeight: '800', color: C.ink },
  gridBadge: { backgroundColor: C.green + '18', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radii.pill },
  gridBadgeText: { fontSize: 11, fontWeight: '800', color: C.green },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  tile: {
    width: '47%', marginHorizontal: '1.5%', marginBottom: 8,
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: Radii.sm, borderWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  tileWord: { fontSize: 14, fontWeight: '700', color: C.slate },
  tileIcon: { width: 20, alignItems: 'center' },
  unseenDash: { fontSize: 14, fontWeight: '700', color: C.mint },
  emptyGrid: { paddingVertical: 24, alignItems: 'center' },
  emptyGridText: { fontSize: 12, color: C.slate, fontStyle: 'italic' },

  /* Legend */
  legend: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.greenPale },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { fontSize: 10, fontWeight: '700', color: C.slate },
});

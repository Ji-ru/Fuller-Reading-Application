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
  use_StudentPassageMastery,
  AralinPassageInfo,
  PassagePeriodSlot,
} from '../../../Hooks/use_StudentPassageMastery';
import readingMaterialData from '../../../../assets/ReadingMaterial/ReadingMaterial.json';
import { CheckCircleIcon, XCircleIcon } from '../../GlobalUse/Icons';
import { SubPeriodFilter } from '../DateFilter';

// ── Design constants ──────────────────────────────────────────────────────────
const ORANGE = '#f97316';
const ORANGE_DIM = 'rgba(249,115,22,0.14)';
const BAR_MAX_H = 80;

// ── Bar column ────────────────────────────────────────────────────────────────

const BarColumn = ({
  slot,
  isActive,
  maxCount,
  index,
  onPress,
}: {
  slot: PassagePeriodSlot;
  isActive: boolean;
  maxCount: number;
  index: number;
  onPress: () => void;
}) => {
  const hasData = slot.passageCount > 0;
  const targetH = hasData && maxCount > 0 ? (slot.passageCount / maxCount) * BAR_MAX_H : 0;
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
      <Text style={[S.barCount, { color: hasData ? (isActive ? ORANGE : C.slate) : C.mint }]}>
        {hasData ? `×${slot.passageCount}` : '—'}
      </Text>

      <View style={S.barTrack}>
        {hasData && (
          <Animated.View
            style={[
              S.barFill,
              { height: heightAnim, backgroundColor: isActive ? ORANGE : `${ORANGE}55` },
            ]}
          />
        )}
      </View>

      <View style={[S.barTick, { backgroundColor: isActive ? ORANGE : 'transparent' }]} />

      <Text style={[S.barLabel, isActive && S.barLabelActive, !hasData && S.barLabelEmpty]}>
        {slot.label}
      </Text>
    </TouchableOpacity>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface PassageMasterySectionProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
  periodOffset?: number;
  selectedSubFilter?: SubPeriodFilter | null;
}

export default function PassageMasterySection({
  studentId,
  timeFilter,
  periodOffset = 0,
  selectedSubFilter = null,
}: PassageMasterySectionProps) {
  const {
    loading,
    stats,
    cumulativeStats,
    cumulativeLetters,
    periodSlots,
    getAralinPassages,
    refresh,
  } = use_StudentPassageMastery(studentId, timeFilter, periodOffset, selectedSubFilter);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const [selectedLetter, setSelectedLetter] = useState<string>('M');
  const [showGrid, setShowGrid] = useState(true);

  const aralinPassages = getAralinPassages(selectedLetter);

  // ── Bar chart: default active slot = today (or last slot with data) ──
  const defaultIdx = useMemo(() => {
    if (!periodSlots.length) return 0;
    const now = new Date();
    for (let i = 0; i < periodSlots.length; i++) {
      const { slotStart, slotEnd } = periodSlots[i];
      if (now >= slotStart && now <= slotEnd) return i;
    }
    for (let i = periodSlots.length - 1; i >= 0; i--) {
      if (periodSlots[i].passageCount > 0) return i;
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
    () => Math.max(...periodSlots.map(s => s.passageCount), 1),
    [periodSlots],
  );
  const hasAnyActivity = periodSlots.some(s => s.passageCount > 0);

  // Letters mastered in the ACTIVE slot only
  const activeSlot = periodSlots[activeIdx];
  const slotLetters = useMemo(() => {
    const set = new Set<string>();
    if (!activeSlot) return set;
    activeSlot.passages.forEach(title => {
      const passage = readingMaterialData.Passages.find((p: any) => p.title === title);
      if (passage) set.add(passage.letter);
    });
    return set;
  }, [activeSlot]);

  // ── Loading ──
  if (loading) {
    return (
      <View style={S.loadBox}>
        <ActivityIndicator color={ORANGE} size="small" />
        <Text style={S.loadText}>Nilo-load ang datos…</Text>
      </View>
    );
  }

  const progressPercent = Math.round((stats.mastered / stats.total) * 100) || 0;
  const progressColor =
    progressPercent >= 85 ? ORANGE :
      progressPercent >= 60 ? '#f59e0b' :
        '#ef4444';

  return (
    <View>

      {/* ── LAYER 1: Summary chips (Period Filtered) ── */}
      <View style={S.chipRow}>
        <View style={[S.chip, { backgroundColor: ORANGE_DIM }]}>
          <Text style={[S.chipNum, { color: ORANGE }]}>{stats.mastered}</Text>
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
          {stats.mastered} sa {stats.total} na talata ang natapos na
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

      {/* ── LAYER 5: Passage list (progressive detail) ── */}
      {showGrid && (
        <View style={S.gridSection}>
          <View style={S.gridHeaderRow}>
            <Text style={S.gridTitle}>Talata para sa Aralin {selectedLetter}</Text>
            <View style={S.gridBadge}>
              <Text style={S.gridBadgeText}>
                {aralinPassages.filter(w => w.status === 'mastered').length}/{aralinPassages.length}
              </Text>
            </View>
          </View>

          {aralinPassages.length > 0 ? (
            <View style={S.list}>
              {aralinPassages.map((item, idx) => (
                <View key={idx} style={[S.tile, tileStyle(item.status)]}>
                  <Text style={[
                    S.tileWord,
                    item.status === 'mastered' && { color: ORANGE },
                    item.status === 'tried' && { color: '#d97706' },
                  ]}>
                    "{item.title}"
                  </Text>
                  <View style={S.tileIcon}>
                    {item.status === 'mastered' ? (
                      <CheckCircleIcon size={16} color={ORANGE} />
                    ) : item.status === 'tried' ? (
                      <XCircleIcon size={16} color="#f59e0b" />
                    ) : (
                      <Text style={S.unseenDash}>—</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={S.emptyGrid}>
              <Text style={S.emptyGridText}>Walang talata sa araling ito.</Text>
            </View>
          )}

          <View style={S.legend}>
            <View style={S.legendItem}>
              <View style={[S.legendDot, { backgroundColor: ORANGE }]} />
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
    case 'mastered': return { backgroundColor: `${ORANGE}0D`, borderColor: `${ORANGE}30` };
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
  toggleText: { fontSize: 11, fontWeight: '700' },
  letterScroll: { paddingVertical: 4, paddingRight: 16 },
  letterCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  letterCircleSel: { backgroundColor: ORANGE, transform: [{ scale: 1.08 }], ...Shadows.subtle },
  letterCircleDone: { backgroundColor: '#ffedd5', borderWidth: 1.5, borderColor: ORANGE + '40' },
  letterChar: { fontSize: 14, fontWeight: '900', color: C.slate },
  letterCharSel: { color: C.white },
  doneDot: { position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: 2.5, backgroundColor: ORANGE },

  /* Passage list */
  gridSection: { backgroundColor: C.bg, padding: 14, borderRadius: Radii.md, marginTop: 4 },
  gridHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 14, fontWeight: '800', color: C.ink },
  gridBadge: { backgroundColor: ORANGE_DIM, paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radii.pill },
  gridBadgeText: { fontSize: 11, fontWeight: '800', color: ORANGE },
  list: { flexDirection: 'column' },
  tile: {
    width: '100%', marginBottom: 8,
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: Radii.sm, borderWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  tileWord: { fontSize: 14, fontWeight: '700', color: C.slate, fontStyle: 'italic', flex: 1, paddingRight: 8 },
  tileIcon: { width: 24, alignItems: 'center' },
  unseenDash: { fontSize: 14, fontWeight: '700', color: C.mint },
  emptyGrid: { paddingVertical: 24, alignItems: 'center' },
  emptyGridText: { fontSize: 12, color: C.slate, fontStyle: 'italic' },

  /* Legend */
  legend: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.greenPale },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { fontSize: 10, fontWeight: '700', color: C.slate },
});

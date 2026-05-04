import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../../Utilities/Theme';
import { use_StudentWordMastery, AralinWordInfo } from '../../../Hooks/use_StudentWordMastery';
import readingMaterialData from '../../../../assets/ReadingMaterial/ReadingMaterial.json';
import { CheckCircleIcon, XCircleIcon } from '../../GlobalUse/Icons';

interface WordMasterySectionProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
}

export default function WordMasterySection({ studentId, timeFilter }: WordMasterySectionProps) {
  const { loading, stats, cumulativeStats, cumulativeLetters, getAralinWords } = use_StudentWordMastery(studentId, timeFilter);
  const [selectedLetter, setSelectedLetter] = useState<string>('M');
  const [showGrid, setShowGrid] = useState(false);

  const aralinWords = getAralinWords(selectedLetter);

  if (loading) {
    return (
      <View style={S.loadBox}>
        <ActivityIndicator color={C.green} size="small" />
        <Text style={S.loadText}>Nilo-load ang datos…</Text>
      </View>
    );
  }

  const progressPercent = Math.round((cumulativeStats.mastered / cumulativeStats.total) * 100) || 0;
  const progressColor = progressPercent >= 85 ? '#22c55e' : progressPercent >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <View>
      {/* ── LAYER 1: Summary Chips ── */}
      <View style={S.chipRow}>
        <View style={[S.chip, { backgroundColor: '#22c55e12' }]}>  
          <Text style={[S.chipNum, { color: '#16a34a' }]}>{cumulativeStats.mastered}</Text>
          <Text style={S.chipLabel}>Natutuhan</Text>
        </View>
        <View style={[S.chip, { backgroundColor: '#f59e0b12' }]}>  
          <Text style={[S.chipNum, { color: '#d97706' }]}>{cumulativeStats.inProgress}</Text>
          <Text style={S.chipLabel}>Sinusubukan</Text>
        </View>
        <View style={[S.chip, { backgroundColor: C.bg }]}>  
          <Text style={[S.chipNum, { color: C.slate }]}>{cumulativeStats.new}</Text>
          <Text style={S.chipLabel}>Hindi pa</Text>
        </View>
      </View>

      {/* ── LAYER 2: Progress Bar ── */}
      <View style={S.progressCard}>
        <View style={S.progressRow}>
          <Text style={S.progressLabel}>Kabuuan ng Pag-unlad</Text>
          <Text style={[S.progressPct, { color: progressColor }]}>{progressPercent}%</Text>
        </View>
        <View style={S.trackBg}>
          <View style={[S.trackFill, { width: `${progressPercent}%`, backgroundColor: progressColor }]} />
        </View>
        <Text style={S.progressCaption}>
          {cumulativeStats.mastered} sa {cumulativeStats.total} na salita ang natapos na
        </Text>
      </View>

      {/* ── LAYER 3: Letter Selector ── */}
      <View style={S.letterSection}>
        <View style={S.letterHeaderRow}>
          <Text style={S.letterHeaderText}>Pumili ng Titik</Text>
          <TouchableOpacity onPress={() => setShowGrid(!showGrid)} activeOpacity={0.7}>
            <Text style={S.toggleText}>{showGrid ? 'Itago' : 'Ipakita'} ang Salita</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.letterScroll}
        >
          {readingMaterialData.Alphabet.map((item, idx) => {
            const sel = selectedLetter === item.letter;
            const done = cumulativeLetters.has(item.letter);
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

      {/* ── LAYER 4: Word Grid (Progressive Detail) ── */}
      {showGrid && (
        <View style={S.gridSection}>
          <View style={S.gridHeaderRow}>
            <Text style={S.gridTitle}>Titik {selectedLetter}</Text>
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
                  <Text style={[S.tileWord, item.status === 'mastered' && { color: '#16a34a' }, item.status === 'tried' && { color: '#d97706' }]}>
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

          {/* Legend */}
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

// ── Helpers ──
function tileStyle(status: string) {
  switch (status) {
    case 'mastered': return { backgroundColor: '#22c55e0D', borderColor: '#22c55e30' };
    case 'tried':    return { backgroundColor: '#f59e0b0D', borderColor: '#f59e0b30' };
    default:         return { backgroundColor: C.bg,         borderColor: C.greenPale };
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  /* Loading */
  loadBox: { height: 160, justifyContent: 'center', alignItems: 'center' },
  loadText: { marginTop: 10, fontSize: 12, color: C.slate, fontWeight: '600' },

  /* Layer 1: Chips */
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  chipNum: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  /* Layer 2: Progress */
  progressCard: {
    backgroundColor: C.bg,
    padding: 16,
    borderRadius: Radii.md,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: C.ink,
  },
  progressPct: {
    fontSize: 18,
    fontWeight: '900',
  },
  trackBg: {
    height: 10,
    backgroundColor: C.white,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  trackFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressCaption: {
    fontSize: 11,
    color: C.slate,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Layer 3: Letters */
  letterSection: {
    marginBottom: 12,
  },
  letterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  letterHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.ink,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.green,
  },
  letterScroll: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  letterCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  letterCircleSel: {
    backgroundColor: C.green,
    transform: [{ scale: 1.08 }],
    ...Shadows.subtle,
  },
  letterCircleDone: {
    backgroundColor: C.greenLight,
    borderWidth: 1.5,
    borderColor: C.green + '40',
  },
  letterChar: {
    fontSize: 14,
    fontWeight: '900',
    color: C.slate,
  },
  letterCharSel: {
    color: C.white,
  },
  doneDot: {
    position: 'absolute',
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.green,
  },

  /* Layer 4: Grid */
  gridSection: {
    backgroundColor: C.bg,
    padding: 14,
    borderRadius: Radii.md,
    marginTop: 4,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.ink,
  },
  gridBadge: {
    backgroundColor: C.green + '18',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  gridBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.green,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tile: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileWord: {
    fontSize: 14,
    fontWeight: '700',
    color: C.slate,
  },
  tileIcon: {
    width: 20,
    alignItems: 'center',
  },
  unseenDash: {
    fontSize: 14,
    fontWeight: '700',
    color: C.mint,
  },
  emptyGrid: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyGridText: {
    fontSize: 12,
    color: C.slate,
    fontStyle: 'italic',
  },

  /* Legend */
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.greenPale,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.slate,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { use_StudentMiscueInsights } from '../../../Hooks/use_StudentMiscueInsights';
import { StudentColors as C, Radii } from '../../../Utilities/Theme';
import { MiscueReportDocument } from '../../../Interfaces/dataInterfaces';
import { SubPeriodFilter } from '../DateFilter';

// ── Design Tokens ────────────────────────────────────────────────────────────
const PRIMARY = C.green;            // #3d71d9
const PRIMARY_LIGHT = C.greenLight; // #d6eaf8
const TRACK_BG = C.bg;             // #ebf5fb
const INK = C.ink;
const INK_LIGHT = C.slate;
const CORAL = '#EF4444';

// Miscue type color mapping (per plan spec)
const MISCUE_COLORS: Record<string, { bar: string; bg: string }> = {
  Substitution: { bar: '#eb5c6c', bg: '#FFEBEE' },
  Omission:     { bar: '#FF9800', bg: '#FFF3E0' },
  Insertion:    { bar: '#42A5F5', bg: '#E3F2FD' },
  Repetition:   { bar: '#AB47BC', bg: '#F3E5F5' },
};

// Filipino labels for miscue types
const MISCUE_LABELS: Record<string, string> = {
  Substitution: 'Pagpapalit',
  Omission:     'Pagkakaltas',
  Insertion:    'Pagdaragdag',
  Repetition:   'Pag-uulit',
};

interface MiscueInsightsChartProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
  periodOffset?: number;
  selectedSubFilter?: SubPeriodFilter | null;
  reports?: MiscueReportDocument[];
}

export default function MiscueInsightsChart({ studentId, timeFilter, periodOffset = 0, selectedSubFilter, reports }: MiscueInsightsChartProps) {
  const {
    miscueData,
    total,
    topPassage,
    topWords,
    loading,
    error,
  } = use_StudentMiscueInsights(studentId, timeFilter, periodOffset, selectedSubFilter, reports);

  const rangeLabel = timeFilter === 'week' ? 'Linggong Ito'
    : timeFilter === 'month' ? 'Buwang Ito' : 'Taong Ito';

  // ── State: Loading ──
  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={S.loadingText}>Nilo-load ang miscue insights…</Text>
      </View>
    );
  }

  // ── State: Error ──
  if (error) {
    return (
      <View style={S.errorCard}>
        <Text style={S.errorText}>⚠️ {error}</Text>
        <Text style={S.errorSub}>Hindi ma-load ang datos ng miscue</Text>
      </View>
    );
  }

  const maxMiscueCount = miscueData.length > 0
    ? Math.max(...miscueData.map(d => d.count), 1) : 1;

  return (
    <View>
      {/* ═══════════════════════════════════════════════════════
           LAYER 2: Miscue Type Breakdown
         ═══════════════════════════════════════════════════════ */}
      <View style={S.sectionCard}>
        <Text style={S.sectionTitle}>Mga Uri ng Miscue</Text>
        <Text style={S.sectionSubtitle}>{rangeLabel} · {total} kabuuang miscue</Text>

        {total === 0 ? (
          <View style={S.emptyBox}>
            <Text style={S.emptyText}>Walang miscue sa panahong ito 🎉</Text>
          </View>
        ) : (
          <View style={S.barsContainer}>
            {miscueData.map((item, index) => {
              const pct = maxMiscueCount > 0 ? (item.count / maxMiscueCount) * 100 : 0;
              const colors = MISCUE_COLORS[item.type] || { bar: INK_LIGHT, bg: TRACK_BG };
              return (
                <View key={index} style={S.miscueRow}>
                  <View style={S.miscueHeader}>
                    <View style={[S.miscueDot, { backgroundColor: colors.bar }]} />
                    <Text style={S.miscueType}>{MISCUE_LABELS[item.type] || item.type}</Text>
                    <Text style={S.miscuePct}>{item.percentage.toFixed(0)}%</Text>
                  </View>
                  <View style={S.barRow}>
                    <View style={[S.barTrack, { backgroundColor: colors.bg }]}>
                      <View
                        style={[
                          S.barFill,
                          { width: `${pct}%` as any, backgroundColor: colors.bar },
                        ]}
                      />
                    </View>
                    <Text style={[S.barCount, { color: colors.bar }]}>{item.count}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ═══════════════════════════════════════════════════════
           LAYER 3: Top Miscued Passage
         ═══════════════════════════════════════════════════════ */}
      <View style={S.sectionCard}>
        <Text style={S.sectionTitle}>Pinaka-Maraming Miscue na Talata</Text>

        {!topPassage ? (
          <View style={S.emptyBox}>
            <Text style={S.emptyText}>Walang datos ng talata sa panahong ito</Text>
          </View>
        ) : (
          <View>
            <Text style={S.passageName} numberOfLines={2}>
              "{topPassage.title}"
            </Text>
            <View style={S.passageStatsRow}>
              <View style={S.passageStat}>
                <Text style={S.passageStatValue}>{topPassage.averageAccuracy.toFixed(1)}%</Text>
                <Text style={S.passageStatLabel}>Accuracy</Text>
              </View>
              <View style={S.passageStatDivider} />
              <View style={S.passageStat}>
                <Text style={S.passageStatValue}>{topPassage.attempts}</Text>
                <Text style={S.passageStatLabel}>Attempts</Text>
              </View>
              <View style={S.passageStatDivider} />
              <View style={S.passageStat}>
                <Text style={[S.passageStatValue, { color: CORAL }]}>{topPassage.totalMiscues}</Text>
                <Text style={S.passageStatLabel}>Miscues</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ═══════════════════════════════════════════════════════
           LAYER 4: Most Miscued Words
         ═══════════════════════════════════════════════════════ */}
      <View style={S.sectionCard}>
        <Text style={S.sectionTitle}>Pinaka-Maling Salita</Text>

        {!topWords || topWords.length === 0 ? (
          <View style={S.emptyBox}>
            <Text style={S.emptyText}>Walang datos ng salita sa panahong ito</Text>
          </View>
        ) : (
          <View>
            {topWords.map((item, index) => {
              const colors = MISCUE_COLORS[item.dominantMiscueType || ''] || { bar: INK_LIGHT, bg: TRACK_BG };
              return (
                <View key={index} style={[S.wordRow, index === topWords.length - 1 && S.wordRowLast]}>
                  <View style={S.wordRank}>
                    <Text style={S.wordRankText}>{index + 1}</Text>
                  </View>
                  <View style={S.wordInfo}>
                    <Text style={S.wordText}>"{item.word}"</Text>
                    <View style={[S.wordBadge, { backgroundColor: colors.bg }]}>
                      <Text style={[S.wordBadgeText, { color: colors.bar }]}>
                        {MISCUE_LABELS[item.dominantMiscueType] || item.dominantMiscueType}
                      </Text>
                    </View>
                  </View>
                  <Text style={S.wordCount}>×{item.errorCount}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  /* States */
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: INK_LIGHT,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: CORAL,
    marginBottom: 4,
  },
  errorSub: {
    fontSize: 12,
    fontWeight: '600',
    color: INK_LIGHT,
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: C.white,
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: PRIMARY_LIGHT,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: INK_LIGHT,
    marginBottom: 14,
  },

  /* Empty */
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    color: INK_LIGHT,
  },

  /* Layer 2: Miscue Bars */
  barsContainer: {
    gap: 10,
  },
  miscueRow: {
    gap: 4,
  },
  miscueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miscueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miscueType: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: INK,
  },
  miscuePct: {
    fontSize: 12,
    fontWeight: '800',
    color: INK_LIGHT,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barCount: {
    minWidth: 28,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },

  /* Layer 3: Top Passage */
  passageName: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
    fontStyle: 'italic',
    marginBottom: 12,
    marginTop: 6,
  },
  passageStatsRow: {
    flexDirection: 'row',
    backgroundColor: TRACK_BG,
    borderRadius: Radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  passageStat: {
    flex: 1,
    alignItems: 'center',
  },
  passageStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 2,
  },
  passageStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: INK_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  passageStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: PRIMARY_LIGHT,
  },

  /* Layer 4: Word List */
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: TRACK_BG,
    gap: 10,
  },
  wordRowLast: {
    borderBottomWidth: 0,
  },
  wordRank: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordRankText: {
    fontSize: 12,
    fontWeight: '800',
    color: PRIMARY,
  },
  wordInfo: {
    flex: 1,
    gap: 3,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    fontStyle: 'italic',
  },
  wordBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wordBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  wordCount: {
    fontSize: 16,
    fontWeight: '800',
    color: INK_LIGHT,
  },
});

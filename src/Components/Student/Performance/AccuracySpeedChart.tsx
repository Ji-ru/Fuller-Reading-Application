import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { use_StudentAccuracySpeedTrends } from '../../../Hooks/use_StudentAccuracySpeedTrends';
import { StudentColors as C, Radii, Shadows } from '../../../Utilities/Theme';
import { MiscueReportDocument } from '../../../Interfaces/dataInterfaces';

// ── Design Tokens (aligned with project theme) ──────────────────────────────
const PRIMARY = C.green;            // #3d71d9
const PRIMARY_LIGHT = C.greenLight; // #d6eaf8
const PRIMARY_PALE = C.greenPale;   // #ebf5fb
const TRACK_BG = C.bg;             // #ebf5fb
const INK = C.ink;
const INK_LIGHT = C.slate;

const GREEN = '#2CA96A';
const GREEN_BG = '#D4F1E8';
const AMBER = '#F59E0B';
const AMBER_BG = '#FEF3C7';
const CORAL = '#EF4444';
const CORAL_BG = '#FEE2E2';

interface AccuracySpeedChartProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
  reports?: MiscueReportDocument[];
}

export default function AccuracySpeedChart({ studentId, timeFilter, reports }: AccuracySpeedChartProps) {
  const {
    chartData,
    avgAccuracy,
    avgWpm,
    maxWpm,
    accDir,
    accPct,
    peakAccIdx,
    loading,
    error,
  } = use_StudentAccuracySpeedTrends(studentId, timeFilter, reports);

  // ── Insight text ──
  const insight = useMemo(() => {
    const pct = Math.abs(accPct).toFixed(1);
    if (accDir === 'up') return `Ang accuracy ay tumaas ng ${pct}% sa panahong ito.`;
    if (accDir === 'down') return `Ang accuracy ay bumaba ng ${pct}%. Subukang mag-review.`;
    return 'Ang reading accuracy ay nananatiling consistent.';
  }, [accDir, accPct]);

  const trendColor = accDir === 'up' ? GREEN : accDir === 'down' ? CORAL : INK_LIGHT;
  const trendIcon = accDir === 'up' ? '▲' : accDir === 'down' ? '▼' : '—';

  const hasData = chartData.some(d => d.accuracy > 0);

  // ── State: Loading ──
  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={S.loadingText}>Nilo-load ang datos ng accuracy…</Text>
      </View>
    );
  }

  // ── State: Error ──
  if (error) {
    return (
      <View style={S.errorCard}>
        <Text style={S.errorText}>⚠️ {error}</Text>
        <Text style={S.errorSub}>Hindi ma-load ang datos ng accuracy</Text>
      </View>
    );
  }

  // ── State: Empty ──
  if (!hasData) {
    return (
      <View style={S.emptyBox}>
        <Text style={S.emptyIcon}>📊</Text>
        <Text style={S.emptyText}>Walang datos pa sa panahong ito.</Text>
      </View>
    );
  }

  return (
    <View>
      {/* ── Summary Stats ─────────────────────────────────────── */}
      <View style={S.summaryRow}>
        <View style={S.summaryItem}>
          <Text style={S.summaryValue}>{avgAccuracy.toFixed(1)}%</Text>
          <Text style={S.summaryLabel}>Avg Accuracy</Text>
        </View>
        <View style={S.summaryDivider} />
        <View style={S.summaryItem}>
          <Text style={S.summaryValue}>{avgWpm.toFixed(0)}</Text>
          <Text style={S.summaryLabel}>Avg WPM</Text>
        </View>
        <View style={S.summaryDivider} />
        <View style={S.summaryItem}>
          <Text style={[S.summaryValue, { color: trendColor }]}>
            {trendIcon} {Math.abs(accPct).toFixed(1)}%
          </Text>
          <Text style={S.summaryLabel}>Trend</Text>
        </View>
      </View>

      {/* ── Legend ─────────────────────────────────────────────── */}
      <View style={S.legendRow}>
        <View style={S.legendItem}>
          <View style={[S.legendDot, { backgroundColor: PRIMARY }]} />
          <Text style={S.legendText}>Accuracy</Text>
        </View>
        <View style={S.legendItem}>
          <View style={[S.legendDot, { backgroundColor: AMBER }]} />
          <Text style={S.legendText}>Speed (WPM)</Text>
        </View>
      </View>

      {/* ── Bar Breakdown (Dual Rows) ─────────────────────────── */}
      <View style={S.breakdownCard}>
        {chartData.map((item, index) => {
          const isPeak = index === peakAccIdx && item.accuracy > 0;
          const accPctFill = item.accuracy; // 0-100 already
          const wpmPctFill = maxWpm > 0 ? (item.wpm / maxWpm) * 100 : 0;
          const isLast = index === chartData.length - 1;

          return (
            <View key={index} style={[S.row, isLast && S.rowLast]}>
              {/* Period label */}
              <Text style={[S.rowLabel, isPeak && S.rowLabelPeak]} numberOfLines={1}>
                {item.label}
              </Text>

              <View style={S.barsCol}>
                {/* Accuracy bar */}
                <View style={S.barRow}>
                  <View style={S.barTrack}>
                    <View
                      style={[
                        S.barFill,
                        {
                          width: `${accPctFill}%` as any,
                          backgroundColor: isPeak ? PRIMARY : PRIMARY_LIGHT,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[S.barValue, isPeak && { color: PRIMARY }]}>
                    {item.accuracy > 0 ? `${item.accuracy.toFixed(1)}%` : '—'}
                  </Text>
                </View>

                {/* WPM bar */}
                <View style={S.barRow}>
                  <View style={S.barTrack}>
                    <View
                      style={[
                        S.barFill,
                        {
                          width: `${wpmPctFill}%` as any,
                          backgroundColor: AMBER_BG,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[S.barValue, { color: AMBER }]}>
                    {item.wpm > 0 ? `${item.wpm.toFixed(0)}` : '—'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Insight Pill ──────────────────────────────────────── */}
      <View
        style={[
          S.insightBar,
          accDir === 'up' ? { backgroundColor: GREEN_BG }
            : accDir === 'down' ? { backgroundColor: CORAL_BG }
              : { backgroundColor: PRIMARY_PALE },
        ]}
      >
        <Text style={S.insightIcon}>
          {accDir === 'up' ? '📈' : accDir === 'down' ? '📉' : '📊'}
        </Text>
        <Text
          style={[
            S.insightText,
            {
              color: accDir === 'up' ? GREEN : accDir === 'down' ? CORAL : INK_LIGHT,
            },
          ]}
        >
          {insight}
        </Text>
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
    backgroundColor: CORAL_BG,
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
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: INK_LIGHT,
  },

  /* Summary Row */
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: TRACK_BG,
    borderRadius: Radii.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: INK_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: PRIMARY_LIGHT,
  },

  /* Legend */
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: INK_LIGHT,
  },

  /* Breakdown Card */
  breakdownCard: {
    backgroundColor: C.white,
    borderRadius: Radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: PRIMARY_LIGHT,
    marginBottom: 12,
  },

  /* Row (Dual Horizontal Bars) */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: TRACK_BG,
    gap: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    width: 50,
    fontSize: 12,
    fontWeight: '600',
    color: INK_LIGHT,
  },
  rowLabelPeak: {
    fontWeight: '800',
    color: INK,
  },
  barsCol: {
    flex: 1,
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: TRACK_BG,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    minWidth: 42,
    fontSize: 12,
    fontWeight: '800',
    color: INK_LIGHT,
    textAlign: 'right',
  },

  /* Insight */
  insightBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  insightIcon: {
    fontSize: 16,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});

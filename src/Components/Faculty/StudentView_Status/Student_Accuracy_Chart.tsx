import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useStudentAccuracyTrends } from '../../../Hooks/Faculty/use_StudentView_Progress';
import { sw, sh, sf } from '../../../Utils/responsive';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#ECFBFF',
  primary: '#3B7FC9',
  primaryLight: '#D7E9FF',
  tabBg: '#c0e8f2',
  accent: '#38B6FF',
  card: '#FFFFFF',
  ink: '#1F2937',
  inkLight: '#6B7280',
  slate: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#F3F8FF',
  green: '#2CA96A',
  greenBg: '#D4F1E8',
  amber: '#F59E0B',
  amberBg: '#FEF3C7',
  coral: '#EF4444',
  coralBg: '#FEE2E2',
  track: '#EEF2FF',
};

type TimeRange = 'week' | 'month' | 'year';

interface AccuracyTrendsChartProps {
  studentId: string;
  role?: 'faculty' | 'student';
  /** Numeric grade level (1, 2, 3). When provided, renders a grade-level benchmark card. */
  gradeLevel?: number;
  /** When provided externally, the component hides its own filter bar and uses this value. */
  timeRange?: TimeRange;
  /** Anchor date for period navigation. When provided, data is filtered relative to this date. */
  anchor?: Date;
}

// ─── Grade-level benchmarks ───────────────────────────────────────────────────
// WPM: Hasbrouck & Tindal (2017), Spring 50th percentile
// Accuracy: Widely accepted instructional/independent reading thresholds
type BenchmarkStatus = 'below' | 'at' | 'above';

interface GradeBenchmark {
  grade: number;
  label: string;
  wpmMin: number;  // lower bound of on-grade range
  wpmMax: number;  // upper bound of on-grade range
  accMin: number;  // lower bound of on-grade accuracy range (%)
  accMax: number;  // upper bound of on-grade accuracy range (%)
}

const GRADE_BENCHMARKS: GradeBenchmark[] = [
  { grade: 1, label: 'Grade 1', wpmMin: 53,  wpmMax: 82,  accMin: 90, accMax: 100 },
  { grade: 2, label: 'Grade 2', wpmMin: 89,  wpmMax: 120, accMin: 92, accMax: 100 },
  { grade: 3, label: 'Grade 3', wpmMin: 107, wpmMax: 140, accMin: 94, accMax: 100 },
];

const getBenchmarkStatus = (
  value: number,
  min: number,
  max: number,
): BenchmarkStatus => {
  if (value >= min && value <= max) return 'at';
  if (value > max) return 'above';
  return 'below';
};

const BENCHMARK_CONFIG: Record<BenchmarkStatus, { label: string; color: string; bg: string; icon: string }> = {
  below: { label: 'Below Grade Level', color: '#EF4444', bg: '#FEE2E2', icon: '▼' },
  at:    { label: 'At Grade Level',    color: '#F59E0B', bg: '#FEF3C7', icon: '●' },
  above: { label: 'Above Grade Level', color: '#10B981', bg: '#D1FAE5', icon: '▲' },
};

const StudentAccuracyTrendsChart: React.FC<AccuracyTrendsChartProps> = ({ studentId, role = 'faculty', gradeLevel, timeRange: externalTimeRange, anchor }) => {
  const [internalTimeRange, setInternalTimeRange] = useState<TimeRange>('week');
  const timeRange = externalTimeRange ?? internalTimeRange;

  const { chartData: rawData, loading, error } = useStudentAccuracyTrends(studentId, timeRange, anchor);

  // ── Normalized data ────────────────────────────────────────────────────────
  const chartData = useMemo(
    () => rawData.map(item => ({ label: item.date, accuracy: item.accuracy, wpm: item.wpm })),
    [rawData],
  );

  const accuracyValues = useMemo(() => chartData.map(d => d.accuracy).filter(v => v > 0), [chartData]);
  const wpmValues = useMemo(() => chartData.map(d => d.wpm).filter(v => v > 0), [chartData]);
  const hasData = accuracyValues.length > 0;

  // ── Calculations ─────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    if (!hasData) return null;

    const avgAccuracy = accuracyValues.reduce((s, v) => s + v, 0) / accuracyValues.length;
    const avgWpm = wpmValues.length > 0 ? wpmValues.reduce((s, v) => s + v, 0) / wpmValues.length : 0;
    const maxWpm = Math.max(...wpmValues, 1);

    // Trend
    const validAcc = chartData.filter(d => d.accuracy > 0);
    const accDelta = (validAcc.at(-1)?.accuracy ?? 0) - (validAcc[0]?.accuracy ?? 0);
    const accPct = validAcc[0]?.accuracy ? ((accDelta / validAcc[0].accuracy) * 100) : 0;
    const accDir: 'up' | 'down' | 'same' = accDelta > 0 ? 'up' : accDelta < 0 ? 'down' : 'same';

    // Peak accuracy index
    const peakAccIdx = chartData.reduce(
      (maxI, item, i, arr) => (item.accuracy > arr[maxI].accuracy ? i : maxI), 0,
    );

    return { avgAccuracy, avgWpm, maxWpm, accDir, accPct, peakAccIdx };
  }, [chartData, accuracyValues, wpmValues, hasData]);

  // ── Benchmark lookup ────────────────────────────────────────────────────────
  const benchmark = gradeLevel
    ? GRADE_BENCHMARKS.find(b => b.grade === gradeLevel) ?? null
    : null;
  const insight = useMemo(() => {
    if (!calc) return '';
    const pct = Math.abs(calc.accPct).toFixed(1);
    if (calc.accDir === 'up') return `Accuracy improved by ${pct}% over this period.`;
    if (calc.accDir === 'down') return `Accuracy dropped by ${pct}%. Consider reviewing reading exercises.`;
    return 'Reading accuracy remained consistent over this period.';
  }, [calc]);

  const trendColor = calc?.accDir === 'up' ? C.green : calc?.accDir === 'down' ? C.coral : C.inkLight;
  const trendIcon = calc?.accDir === 'up' ? '▲' : calc?.accDir === 'down' ? '▼' : '—';

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={S.loadingText}>Loading accuracy data…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={S.errorCard}>
        <Text style={S.errorText}>⚠️ {error}</Text>
        <Text style={S.errorSub}>Failed to load accuracy data</Text>
      </View>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View>
      {/* Title */}
      <Text style={S.title}>Accuracy & Speed</Text>

      {/* Time range tabs (only shown when no external timeRange) */}
      {!externalTimeRange && (
        <View style={S.rangeBar}>
          {(['week', 'month', 'year'] as const).map(r => (
            <TouchableOpacity
              key={r}
              style={[S.rangeBtn, timeRange === r && S.rangeBtnActive]}
              onPress={() => setInternalTimeRange(r)}
              activeOpacity={0.8}
            >
              <Text style={[S.rangeBtnText, timeRange === r && S.rangeBtnTextActive]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!hasData ? (
        <View style={S.emptyBox}>
          <Text style={S.emptyIcon}>📊</Text>
          <Text style={S.emptyText}>No data recorded yet.</Text>
        </View>
      ) : (
        <>
          {/* Summary stats */}
          <View style={S.summaryRow}>
            <View style={S.summaryItem}>
              <Text style={S.summaryValue}>{calc!.avgAccuracy.toFixed(1)}%</Text>
              <Text style={S.summaryLabel}>Avg Accuracy</Text>
            </View>
            <View style={S.summaryDivider} />
            <View style={S.summaryItem}>
              <Text style={S.summaryValue}>{calc!.avgWpm.toFixed(0)}</Text>
              <Text style={S.summaryLabel}>Avg WPM</Text>
            </View>
            <View style={S.summaryDivider} />
            <View style={S.summaryItem}>
              <Text style={[S.summaryValue, { color: trendColor }]}>
                {trendIcon} {Math.abs(calc!.accPct).toFixed(1)}%
              </Text>
              <Text style={S.summaryLabel}>Trend</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={S.legendRow}>
            <View style={S.legendItem}>
              <View style={[S.legendDot, { backgroundColor: C.primary }]} />
              <Text style={S.legendText}>Accuracy (%)</Text>
            </View>
            <View style={S.legendItem}>
              <View style={[S.legendDot, { backgroundColor: C.amber }]} />
              <Text style={S.legendText}>Speed (WPM)</Text>
            </View>
          </View>

          {/* Grade-level benchmark card */}
          {benchmark && calc && hasData && (() => {
            const wpmStatus  = getBenchmarkStatus(calc.avgWpm,      benchmark.wpmMin, benchmark.wpmMax);
            const accStatus  = getBenchmarkStatus(calc.avgAccuracy, benchmark.accMin, benchmark.accMax);
            const wpmCfg  = BENCHMARK_CONFIG[wpmStatus];
            const accCfg  = BENCHMARK_CONFIG[accStatus];
            return (
              <View style={S.benchmarkCard}>
                {/* Header */}
                <View style={S.benchmarkHeader}>
                  <Text style={S.benchmarkTitle}>Grade-Level Benchmark</Text>
                  <View style={S.benchmarkGradePill}>
                    <Text style={S.benchmarkGradeText}>{benchmark.label}</Text>
                  </View>
                </View>

                {/* Expected ranges row */}
                <Text style={S.benchmarkRangeHint}>
                  Expected range — Accuracy: {benchmark.accMin}–{benchmark.accMax}%  ·  WPM: {benchmark.wpmMin}–{benchmark.wpmMax}
                </Text>

                {/* Accuracy indicator */}
                <View style={[S.benchmarkRow, { backgroundColor: accCfg.bg }]}>
                  <View style={S.benchmarkMeta}>
                    <Text style={S.benchmarkMetric}>Accuracy</Text>
                    <Text style={[S.benchmarkValue, { color: C.primary }]}>
                      {calc.avgAccuracy.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={[S.benchmarkBadge, { backgroundColor: accCfg.color }]}>
                    <Text style={S.benchmarkBadgeIcon}>{accCfg.icon}</Text>
                    <Text style={S.benchmarkBadgeText}>{accCfg.label}</Text>
                  </View>
                </View>

                {/* WPM indicator */}
                <View style={[S.benchmarkRow, { backgroundColor: wpmCfg.bg, marginTop: sh(6) }]}>
                  <View style={S.benchmarkMeta}>
                    <Text style={S.benchmarkMetric}>
                      {role === 'student' ? 'Reading Speed' : 'WPM'}
                    </Text>
                    <Text style={[S.benchmarkValue, { color: C.amber }]}>
                      {calc.avgWpm.toFixed(0)} wpm
                    </Text>
                  </View>
                  <View style={[S.benchmarkBadge, { backgroundColor: wpmCfg.color }]}>
                    <Text style={S.benchmarkBadgeIcon}>{wpmCfg.icon}</Text>
                    <Text style={S.benchmarkBadgeText}>{wpmCfg.label}</Text>
                  </View>
                </View>
              </View>
            );
          })()}

          {/* Bar breakdown */}
          <View style={S.breakdownCard}>
            {chartData.map((item, index) => {
              const isPeak = index === calc!.peakAccIdx && item.accuracy > 0;
              const accPct = item.accuracy; // already 0-100
              const wpmPct = calc!.maxWpm > 0 ? (item.wpm / calc!.maxWpm) * 100 : 0;
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
                              width: `${accPct}%` as any,
                              backgroundColor: isPeak ? C.primary : C.tabBg,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[S.barValue, isPeak && { color: C.primary }]}>
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
                              width: `${wpmPct}%` as any,
                              backgroundColor: C.amberBg,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[S.barValue, { color: C.amber }]}>
                        {item.wpm > 0 ? `${item.wpm.toFixed(0)}` : '—'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Insight */}
          <View style={[
            S.insightBar,
            calc!.accDir === 'up' ? { backgroundColor: C.greenBg }
              : calc!.accDir === 'down' ? { backgroundColor: C.coralBg }
                : { backgroundColor: C.inputBg },
          ]}>
            <Text style={S.insightIcon}>
              {calc!.accDir === 'up' ? '📈' : calc!.accDir === 'down' ? '📉' : '📊'}
            </Text>
            <Text style={[
              S.insightText,
              { color: calc!.accDir === 'up' ? C.green : calc!.accDir === 'down' ? C.coral : C.inkLight },
            ]}>
              {insight}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: sw(40),
  },
  loadingText: {
    marginTop: sh(12),
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  errorCard: {
    backgroundColor: C.coralBg,
    borderRadius: sw(14),
    padding: sw(16),
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  errorText: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: C.coral,
    marginBottom: sh(4),
  },
  errorSub: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },

  title: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(12),
  },

  // Time range
  rangeBar: {
    flexDirection: 'row',
    backgroundColor: C.tabBg,
    borderRadius: sw(10),
    padding: sw(3),
    marginBottom: sh(14),
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: sh(8),
    alignItems: 'center',
    borderRadius: sw(8),
  },
  rangeBtnActive: {
    backgroundColor: C.primary,
    elevation: 2,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(2),
  },
  rangeBtnText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
  },
  rangeBtnTextActive: {
    color: '#FFFFFF',
  },

  // Empty
  emptyBox: {
    paddingVertical: sh(40),
    alignItems: 'center',
    gap: sh(8),
  },
  emptyIcon: {
    fontSize: sf(40),
    opacity: 0.5,
  },
  emptyText: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.inputBg,
    borderRadius: sw(14),
    paddingVertical: sh(14),
    paddingHorizontal: sw(12),
    marginBottom: sh(12),
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: sf(18),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
    marginBottom: sh(2),
  },
  summaryLabel: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  summaryDivider: {
    width: 1,
    height: sh(30),
    backgroundColor: C.border,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sw(20),
    marginBottom: sh(10),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(6),
  },
  legendDot: {
    width: sw(10),
    height: sw(10),
    borderRadius: sw(5),
  },
  legendText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },

  // Benchmark card
  benchmarkCard: {
    backgroundColor: C.card,
    borderRadius: sw(14),
    padding: sw(14),
    borderWidth: 1,
    borderColor: C.primaryLight,
    marginBottom: sh(12),
  },
  benchmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(4),
  },
  benchmarkTitle: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },
  benchmarkGradePill: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: sw(10),
    paddingVertical: sh(3),
    borderRadius: sw(20),
  },
  benchmarkGradeText: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
  },
  benchmarkRangeHint: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Regular',
    color: C.slate,
    marginBottom: sh(10),
  },
  benchmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: sw(10),
    paddingVertical: sh(10),
    paddingHorizontal: sw(12),
  },
  benchmarkMeta: {
    gap: sh(2),
  },
  benchmarkMetric: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  benchmarkValue: {
    fontSize: sf(20),
    fontFamily: 'Nunito-Bold',
  },
  benchmarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(10),
    paddingVertical: sh(6),
    borderRadius: sw(8),
    gap: sw(4),
  },
  benchmarkBadgeIcon: {
    fontSize: sf(10),
    color: '#ffffff',
  },
  benchmarkBadgeText: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Bold',
    color: '#ffffff',
  },

  // Breakdown card
  breakdownCard: {
    backgroundColor: C.card,
    borderRadius: sw(14),
    padding: sw(14),
    borderWidth: 1,
    borderColor: C.primaryLight,
    marginBottom: sh(12),
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(8),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: sw(10),
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    width: sw(50),
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  rowLabelPeak: {
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },

  barsCol: {
    flex: 1,
    gap: sh(4),
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(6),
  },
  barTrack: {
    flex: 1,
    height: sw(7),
    backgroundColor: C.track,
    borderRadius: sw(4),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: sw(4),
  },
  barValue: {
    minWidth: sw(42),
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.slate,
    textAlign: 'right',
  },

  // Insight
  insightBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sw(10),
    paddingVertical: sh(10),
    paddingHorizontal: sw(12),
    gap: sw(8),
  },
  insightIcon: {
    fontSize: sf(16),
  },
  insightText: {
    flex: 1,
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    lineHeight: sf(19),
  },
});

export default StudentAccuracyTrendsChart;
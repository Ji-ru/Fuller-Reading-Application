// AccuracyTrends.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAccuracyTrends } from '../../../Hooks/use_HooksAccuracyTrends';
import { sw, sh, sf } from '../../../Utils/responsive';
import { FacultyColors, Radii, Shadows } from '../../../Utilities/Theme';
import { getBenchmarkForGrade } from '../../../Constants/wpmBenchmarks';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: FacultyColors.bg,
  primary: FacultyColors.primary,
  primaryLight: FacultyColors.primaryLight,
  primaryPale: FacultyColors.primaryPale,
  tabBg: FacultyColors.primaryPale,
  accent: FacultyColors.sky,
  card: FacultyColors.white,
  ink: FacultyColors.ink,
  inkLight: FacultyColors.inkLight,
  slate: FacultyColors.slate,
  border: '#E5E7EB',
  green: FacultyColors.primaryLight,
  greenBg: '#D4F1E8',
  amber: FacultyColors.orange,
  amberBg: '#FEF3C7',
  coral: FacultyColors.coral,
  coralBg: '#FEE2E2',
  track: '#E5E7EB',
};

type TimeRange = 'week' | 'month' | 'year';

interface AccuracyTrendsChartProps {
  facultyId?: string | null;
  filter: {
    academicYear: string;
    selectedView: string;
  };
  /** Display name of the currently selected class — shown in the insight text. */
  className?: string;
  /** Numeric grade level (1, 2, 3). When provided, renders a grade-level benchmark card. */
  gradeLevel?: number;
}

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

// ─── Grade-level benchmarks ───────────────────────────────────────────────────
// WPM: Hasbrouck & Tindal (2017), Spring 50th percentile
// Accuracy: Widely accepted instructional/independent reading thresholds
type BenchmarkStatus = 'below' | 'at' | 'above';

interface GradeBenchmark {
  grade: number;
  label: string;
  wpmMin: number;
  wpmMax: number;
  accMin: number;
  accMax: number;
}

const GRADE_BENCHMARKS: GradeBenchmark[] = [
  { grade: 1, label: 'Grade 1', wpmMin: 53,  wpmMax: 82,  accMin: 90, accMax: 100 },
  { grade: 2, label: 'Grade 2', wpmMin: 89,  wpmMax: 120, accMin: 92, accMax: 100 },
  { grade: 3, label: 'Grade 3', wpmMin: 107, wpmMax: 140, accMin: 94, accMax: 100 },
];

const getBenchmarkStatus = (value: number, min: number, max: number): BenchmarkStatus => {
  if (value >= min && value <= max) return 'at';
  if (value > max) return 'above';
  return 'below';
};

const BENCHMARK_CONFIG: Record<BenchmarkStatus, { label: string; color: string; bg: string; icon: string }> = {
  below: { label: 'Below Grade Level', color: '#EF4444', bg: '#FEE2E2', icon: '▼' },
  at:    { label: 'At Grade Level',    color: '#F59E0B', bg: '#FEF3C7', icon: '●' },
  above: { label: 'Above Grade Level', color: '#10B981', bg: '#D1FAE5', icon: '▲' },
};

const AccuracyTrendsChart: React.FC<AccuracyTrendsChartProps> = ({
  facultyId = null,
  filter,
  gradeLevel,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { academicYear, selectedView } = filter;
  const isOverall = selectedView === 'overall';

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const {
    chartData,
    loading,
    error,
  } = useAccuracyTrends(facultyId, {
    timeRange,
    filterType: isOverall ? 'overall' : 'class',
    classId: isOverall ? undefined : selectedView,
    academicYear,
  });

  // ─── Calculations ──────────────────────────────────────────────────────────
  const accuracyValues = useMemo(() => chartData.map(d => d.accuracy).filter(v => v > 0), [chartData]);
  const wpmValues = useMemo(() => chartData.map(d => d.wpm).filter(v => v > 0), [chartData]);
  const hasData = accuracyValues.length > 0;

  const calc = useMemo(() => {
    if (!hasData) return null;

    const avgAccuracy = accuracyValues.reduce((s, v) => s + v, 0) / accuracyValues.length;
    const avgWpm = wpmValues.length > 0 ? wpmValues.reduce((s, v) => s + v, 0) / wpmValues.length : 0;
    const maxWpm = Math.max(...wpmValues, 1);

    // Trend calculation: compare average of first half vs second half (chronologically).
    // Falls back to first-vs-last when there are fewer than 4 valid points.
    const validData = chartData.filter(d => d.accuracy > 0);
    let accDelta = 0;
    let accPct = 0;
    if (validData.length >= 4) {
      const mid = Math.floor(validData.length / 2);
      const firstHalf = validData.slice(0, mid);
      const secondHalf = validData.slice(mid);
      const avgFirst = firstHalf.reduce((s, d) => s + d.accuracy, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, d) => s + d.accuracy, 0) / secondHalf.length;
      accDelta = avgSecond - avgFirst;
      accPct = avgFirst ? (accDelta / avgFirst) * 100 : 0;
    } else if (validData.length >= 2) {
      accDelta = (validData.at(-1)?.accuracy ?? 0) - (validData[0]?.accuracy ?? 0);
      accPct = validData[0]?.accuracy ? (accDelta / validData[0].accuracy) * 100 : 0;
    }
    // Treat sub-1% drift as "stable" to avoid noise-driven labels
    const accDir: 'up' | 'down' | 'same' =
      accDelta > 1 ? 'up' : accDelta < -1 ? 'down' : 'same';

    // Peak index
    const peakIdx = chartData.reduce(
      (maxI, item, i, arr) => (item.accuracy > arr[maxI].accuracy ? i : maxI), 0
    );

    return { avgAccuracy, avgWpm, maxWpm, accDir, accPct, peakIdx };
  }, [chartData, accuracyValues, wpmValues, hasData]);

  const trendColor = calc?.accDir === 'up' ? C.green : calc?.accDir === 'down' ? C.coral : C.inkLight;
  const trendIcon = calc?.accDir === 'up' ? '▲' : calc?.accDir === 'down' ? '▼' : '—';
  const wpmBenchmark = gradeLevel ? getBenchmarkForGrade(gradeLevel) : null;
  const wpmBand = wpmBenchmark && calc
    ? {
        leftPct: Math.max(0, Math.min(100, (wpmBenchmark.expectedMin / calc.maxWpm) * 100)),
        rightPct: Math.max(0, Math.min(100, (wpmBenchmark.expectedMax / calc.maxWpm) * 100)),
      }
    : null;


  return (
    <View style={S.container}>
      <Text style={S.title}>Accuracy & Speed Trends</Text>

      {/* Time Range Selector */}
      <View style={S.rangeBar}>
        {TIME_RANGES.map(range => (
          <TouchableOpacity
            key={range.value}
            onPress={() => setTimeRange(range.value)}
            style={[S.rangeBtn, timeRange === range.value && S.rangeBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[S.rangeBtnText, timeRange === range.value && S.rangeBtnTextActive]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={S.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={S.loadingText}>Loading trends data...</Text>
        </View>
      ) : error ? (
        <View style={S.errorCard}>
          <Text style={S.errorText}>⚠️ Error loading trends</Text>
          <Text style={S.errorSub}>{error}</Text>
        </View>
      ) : !hasData ? (
        <View style={S.emptyBox}>
          <Text style={S.emptyIcon}>📊</Text>
          <Text style={S.emptyText}>No data available for this period</Text>
        </View>
      ) : (
        <>
          {/* Summary Stats Row */}
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
          {(() => {
            const benchmark = gradeLevel
              ? GRADE_BENCHMARKS.find(b => b.grade === gradeLevel) ?? null
              : null;
            if (!benchmark || !calc) return null;
            const wpmStatus = getBenchmarkStatus(calc.avgWpm, benchmark.wpmMin, benchmark.wpmMax);
            const accStatus = getBenchmarkStatus(calc.avgAccuracy, benchmark.accMin, benchmark.accMax);
            const wpmCfg = BENCHMARK_CONFIG[wpmStatus];
            const accCfg = BENCHMARK_CONFIG[accStatus];
            return (
              <View style={S.benchmarkCard}>
                <View style={S.benchmarkHeader}>
                  <Text style={S.benchmarkTitle}>Grade-Level Benchmark</Text>
                  <View style={S.benchmarkGradePill}>
                    <Text style={S.benchmarkGradeText}>{benchmark.label}</Text>
                  </View>
                </View>
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
                <View style={[S.benchmarkRow, { backgroundColor: wpmCfg.bg, marginTop: sh(6) }]}>
                  <View style={S.benchmarkMeta}>
                    <Text style={S.benchmarkMetric}>WPM</Text>
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

          {/* Horizontal Bar Breakdown */}
          <View style={S.breakdownCard}>
            {chartData.map((item, index) => {
              const isPeak = index === calc!.peakIdx && item.accuracy > 0;
              const accWidth = item.accuracy; // 0-100
              const wpmWidth = calc!.maxWpm > 0 ? (item.wpm / calc!.maxWpm) * 100 : 0;
              const isLast = index === chartData.length - 1;

              return (
                <View key={index} style={[S.row, isLast && S.rowLast]}>
                  <Text style={[S.rowLabel, isPeak && S.rowLabelPeak]} numberOfLines={1}>
                    {item.date}
                  </Text>

                  <View style={S.barsCol}>
                    {/* Accuracy Bar */}
                    <View style={S.barRow}>
                      <View style={S.barTrack}>
                        <View
                          style={[
                            S.barFill,
                            {
                              width: `${accWidth}%` as any,
                              backgroundColor: isPeak ? C.primary : C.primaryLight,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[S.barValue, isPeak && { color: C.primary }]}>
                        {item.accuracy > 0 ? `${item.accuracy.toFixed(1)}%` : '—'}
                      </Text>
                    </View>

                    {/* WPM Bar */}
                    <View style={S.barRow}>
                      <View style={S.barTrack}>
                        {wpmBand && wpmBand.rightPct > wpmBand.leftPct && (
                          <View
                            style={[
                              S.wpmBand,
                              {
                                left: `${wpmBand.leftPct}%` as any,
                                width: `${wpmBand.rightPct - wpmBand.leftPct}%` as any,
                              },
                            ]}
                          />
                        )}
                        <View
                          style={[
                            S.barFill,
                            {
                              width: `${wpmWidth}%` as any,
                              backgroundColor: C.amber,
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

          {/* Optional compact summary (intentionally removed to reduce visual noise). */}
        </>
      )}
    </View>
  );
};

const S = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: Radii.lg,
    padding: sw(16),
    marginVertical: sh(10),
    ...Shadows.card,
  },
  centered: {
    padding: sw(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: sh(12),
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  errorCard: {
    backgroundColor: C.coralBg,
    borderRadius: Radii.md,
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
    textAlign: 'center',
  },
  title: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(16),
  },
  rangeBar: {
    flexDirection: 'row',
    backgroundColor: C.tabBg,
    borderRadius: Radii.md,
    padding: sw(3),
    marginBottom: sh(16),
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: sh(8),
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  rangeBtnActive: {
    backgroundColor: C.primary,
    ...Shadows.subtle,
  },
  rangeBtnText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
  },
  rangeBtnTextActive: {
    color: '#FFFFFF',
  },
  emptyBox: {
    paddingVertical: sh(40),
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: sf(40),
    opacity: 0.5,
    marginBottom: sh(10),
  },
  emptyText: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.md,
    paddingVertical: sh(14),
    paddingHorizontal: sw(12),
    marginBottom: sh(16),
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
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sw(20),
    marginBottom: sh(12),
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
  breakdownCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: sw(14),
    borderWidth: 0,
    borderColor: 'transparent',
    marginBottom: sh(16),
  },
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
    width: sw(55),
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
    borderRadius: Radii.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  wpmBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 132, 67, 0.12)',
  },
  barFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  barValue: {
    minWidth: sw(45),
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.slate,
    textAlign: 'right',
  },
  // Benchmark card
  benchmarkCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: sw(14),
    borderWidth: 0,
    borderColor: 'transparent',
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
});

export default AccuracyTrendsChart;
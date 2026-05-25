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
  /** When provided externally, the component hides its own filter bar and uses this value. */
  timeRange?: TimeRange;
  /** Anchor date for period navigation. When provided, data is filtered relative to this date. */
  anchor?: Date;
  /** Optional explicit start of the date range. When both startDate and endDate are provided, they override timeRange + anchor. */
  startDate?: Date;
  /** Optional explicit end of the date range. */
  endDate?: Date;
}

const StudentAccuracyTrendsChart: React.FC<AccuracyTrendsChartProps> = ({ studentId, role = 'faculty', timeRange: externalTimeRange, anchor, startDate, endDate }) => {
  const [internalTimeRange, setInternalTimeRange] = useState<TimeRange>('week');
  const timeRange = externalTimeRange ?? internalTimeRange;

  const {
    chartData: rawData,
    loading,
    error,
    grandTotalWords,
    grandAccuracySum,
    grandTotalMinutes,
  } = useStudentAccuracyTrends(studentId, timeRange, anchor, startDate, endDate);

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

    // B6: words-weighted grand averages — consistent with per-bucket computation
    const avgAccuracy = grandTotalWords > 0
      ? Math.min(100, Math.max(0, grandAccuracySum / grandTotalWords))
      : 0;
    const avgWpm = grandTotalMinutes > 0
      ? grandTotalWords / grandTotalMinutes
      : 0;
    const maxWpm = Math.max(...wpmValues, 1);

    // B4: robust trend — first-half vs second-half average when ≥4 valid points,
    // otherwise first-vs-last.
    const validAcc = chartData.filter(d => d.accuracy > 0);
    let accDelta = 0;
    if (validAcc.length >= 4) {
      const mid = Math.floor(validAcc.length / 2);
      const avgFirst  = validAcc.slice(0, mid).reduce((s, d) => s + d.accuracy, 0) / mid;
      const avgSecond = validAcc.slice(mid).reduce((s, d) => s + d.accuracy, 0) / (validAcc.length - mid);
      accDelta = avgSecond - avgFirst;
    } else if (validAcc.length >= 2) {
      accDelta = (validAcc.at(-1)?.accuracy ?? 0) - (validAcc[0]?.accuracy ?? 0);
    }
    // B5: ±1 percentage-point threshold matches the unit shown
    const accDir: 'up' | 'down' | 'same' =
      accDelta > 1 ? 'up' : accDelta < -1 ? 'down' : 'same';

    const peakAccIdx = chartData.reduce(
      (maxI, item, i, arr) => (item.accuracy > arr[maxI].accuracy ? i : maxI), 0,
    );

    return { avgAccuracy, avgWpm, maxWpm, accDir, accDelta, peakAccIdx };
  }, [chartData, wpmValues, hasData, grandTotalWords, grandAccuracySum, grandTotalMinutes]);

  const insight = useMemo(() => {
    if (!calc) return '';
    const pts = Math.abs(calc.accDelta).toFixed(1);
    if (calc.accDir === 'up') return `Accuracy improved by ${pts} pts over this period.`;
    if (calc.accDir === 'down') return `Accuracy dropped by ${pts} pts. Consider reviewing reading exercises.`;
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
            {/* <View style={S.summaryDivider} />
            <View style={S.summaryItem}>
              <Text style={[S.summaryValue, { color: trendColor }]}>
                {trendIcon} {Math.abs(calc!.accDelta).toFixed(1)} pts
              </Text>
              <Text style={S.summaryLabel}>Trend</Text>
            </View> */}
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
          {/* <View style={[
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
          </View> */}
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
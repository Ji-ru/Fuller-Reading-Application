import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useStudentActiveHours } from '../../../Hooks/Faculty/use_StudentView_Progress';
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
  coral: '#ef4444',
  track: '#EEF2FF',
};

interface StudentActivityTrackingCardProps {
  studentId: string;
}

const StudentActivityTrackingCard: React.FC<StudentActivityTrackingCardProps> = ({ studentId }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [displayInMinutes, setDisplayInMinutes] = useState(false);

  const {
    chartData,
    loading,
    error,
    totalHours,
    averageHoursPerPeriod,
    trendComparison,
  } = useStudentActiveHours(studentId, { timeRange });

  // Trend info
  const trendPercentage = trendComparison?.percentChange ?? null;
  const trendDirection: 'up' | 'down' | 'same' = !trendComparison
    ? 'same'
    : trendComparison.difference > 0
      ? 'up'
      : trendComparison.difference < 0
        ? 'down'
        : 'same';

  const mostActive = chartData.length > 0
    ? chartData.reduce(
        (max, current) => (current.hours > max.hours ? current : max),
        chartData[0],
      )
    : null;
  const insightPrefix = { week: 'on', month: 'during', year: 'in' };
  const insightText =
    mostActive && mostActive.hours > 0
      ? `Most active ${insightPrefix[timeRange]} ${mostActive.day}`
      : 'No activity recorded yet';

  // Convert hours to display unit
  const formatValue = (value: number) => (displayInMinutes ? value * 60 : value);
  const unit = displayInMinutes ? 'min' : 'hr';
  const formatVal = (v: number) =>
    v === 0 ? `0 ${unit}` : `${v % 1 === 0 ? v : v.toFixed(1)} ${unit}`;

  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={S.loadingText}>Loading activity data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={S.errorCard}>
        <Text style={S.errorText}>⚠️ {error}</Text>
        <Text style={S.errorSub}>Failed to load activity tracking data</Text>
      </View>
    );
  }

  const maxBarValue = chartData.length > 0
    ? Math.max(...chartData.map(d => formatValue(d.hours)), 1)
    : 1;

  const peakIndex = chartData.length > 0
    ? chartData.reduce((maxIdx, item, i, arr) => (formatValue(item.hours) > formatValue(arr[maxIdx].hours) ? i : maxIdx), 0)
    : -1;

  const trendColor = trendDirection === 'up' ? C.green : trendDirection === 'down' ? C.coral : C.inkLight;
  const trendIcon = trendDirection === 'up' ? '▲' : trendDirection === 'down' ? '▼' : '—';

  return (
    <View>
      {/* ── Time Range Selector ─────────────────────────────────────── */}
      <View style={S.rangeBar}>
        {(['week', 'month', 'year'] as const).map(range => (
          <TouchableOpacity
            key={range}
            style={[S.rangeBtn, timeRange === range && S.rangeBtnActive]}
            onPress={() => setTimeRange(range)}
            activeOpacity={0.8}
          >
            <Text style={[S.rangeBtnText, timeRange === range && S.rangeBtnTextActive]}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Unit Toggle ────────────────────────────────────────────── */}
      <View style={S.toggleRow}>
        <TouchableOpacity
          style={[S.unitBtn, !displayInMinutes && S.unitBtnActive]}
          onPress={() => setDisplayInMinutes(false)}
          activeOpacity={0.8}
        >
          <Text style={[S.unitBtnText, !displayInMinutes && S.unitBtnTextActive]}>Hours</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.unitBtn, displayInMinutes && S.unitBtnActive]}
          onPress={() => setDisplayInMinutes(true)}
          activeOpacity={0.8}
        >
          <Text style={[S.unitBtnText, displayInMinutes && S.unitBtnTextActive]}>Minutes</Text>
        </TouchableOpacity>
      </View>

      {/* ── Summary Stats ──────────────────────────────────────────── */}
      <View style={S.summaryRow}>
        <View style={S.summaryItem}>
          <Text style={S.summaryValue}>{formatValue(totalHours).toFixed(1)}</Text>
          <Text style={S.summaryLabel}>Total {unit}</Text>
        </View>
        <View style={S.summaryDivider} />
        <View style={S.summaryItem}>
          <Text style={S.summaryValue}>{formatValue(averageHoursPerPeriod).toFixed(1)}</Text>
          <Text style={S.summaryLabel}>Avg / period</Text>
        </View>
        {trendPercentage !== null && (
          <>
            <View style={S.summaryDivider} />
            <View style={S.summaryItem}>
              <Text style={[S.summaryValue, { color: trendColor }]}>
                {trendIcon} {Math.abs(trendPercentage).toFixed(0)}%
              </Text>
              <Text style={S.summaryLabel}>vs. previous</Text>
            </View>
          </>
        )}
      </View>

      {/* ── Insight ────────────────────────────────────────────────── */}
      <View style={S.insightBar}>
        <Text style={S.insightIcon}>💡</Text>
        <Text style={S.insightText}>{insightText}</Text>
      </View>

      {/* ── Activity Breakdown ─────────────────────────────────────── */}
      <View style={S.breakdownCard}>
        <Text style={S.breakdownTitle}>Activity Breakdown</Text>
        {chartData.map((item, index) => {
          const val = formatValue(item.hours);
          const isPeak = index === peakIndex && val > 0;
          const fillPct = maxBarValue > 0 ? (val / maxBarValue) * 100 : 0;
          const isLast = index === chartData.length - 1;

          return (
            <View key={index} style={[S.row, isLast && S.rowLast]}>
              <Text style={[S.rowLabel, isPeak && S.rowLabelPeak]} numberOfLines={1}>
                {item.day}
              </Text>
              <View style={S.barContainer}>
                <View style={S.barTrack}>
                  <View
                    style={[
                      S.barFill,
                      {
                        width: `${fillPct}%` as any,
                        backgroundColor: isPeak ? C.primary : C.tabBg,
                      },
                    ]}
                  />
                </View>
                <Text style={[S.rowValue, isPeak && S.rowValuePeak]}>
                  {formatVal(val)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
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
    backgroundColor: '#FEF2F2',
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

  // Time range selector
  rangeBar: {
    flexDirection: 'row',
    backgroundColor: C.tabBg,
    borderRadius: sw(10),
    padding: sw(3),
    marginBottom: sh(12),
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

  // Unit toggle
  toggleRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    backgroundColor: C.primaryLight,
    borderRadius: sw(8),
    padding: sw(2),
    marginBottom: sh(14),
  },
  unitBtn: {
    paddingVertical: sh(5),
    paddingHorizontal: sw(14),
    borderRadius: sw(6),
  },
  unitBtnActive: {
    backgroundColor: C.card,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.08,
    shadowRadius: sw(2),
  },
  unitBtnText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.primary,
  },
  unitBtnTextActive: {
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.inputBg,
    borderRadius: sw(14),
    paddingVertical: sh(14),
    paddingHorizontal: sw(12),
    marginBottom: sh(10),
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: sf(20),
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

  // Insight bar
  insightBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenBg,
    borderRadius: sw(10),
    paddingVertical: sh(8),
    paddingHorizontal: sw(12),
    marginBottom: sh(14),
    gap: sw(8),
  },
  insightIcon: {
    fontSize: sf(16),
  },
  insightText: {
    flex: 1,
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: C.green,
  },

  // Breakdown card
  breakdownCard: {
    backgroundColor: C.card,
    borderRadius: sw(14),
    padding: sw(16),
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  breakdownTitle: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(12),
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(9),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: sw(10),
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    width: sw(60),
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  rowLabelPeak: {
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(8),
  },
  barTrack: {
    flex: 1,
    height: sw(8),
    backgroundColor: C.track,
    borderRadius: sw(4),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: sw(4),
  },
  rowValue: {
    minWidth: sw(50),
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.slate,
    textAlign: 'right',
  },
  rowValuePeak: {
    color: C.primary,
  },
});

export default StudentActivityTrackingCard;

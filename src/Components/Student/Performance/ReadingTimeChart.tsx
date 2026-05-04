import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { use_StudentReadingTime } from '../../../Hooks/use_StudentReadingTime';
import { StudentColors as C, Radii, Shadows } from '../../../Utilities/Theme';

// ── Design Tokens (project-consistent) ───────────────────────────────────────
const PRIMARY = C.green;        // #3d71d9 — brand royal blue
const PRIMARY_LIGHT = C.greenLight; // #d6eaf8
const PRIMARY_PALE = C.greenPale;   // #ebf5fb
const TRACK_BG = C.bg;             // #ebf5fb
const INK = C.ink;
const INK_LIGHT = C.slate;
const GREEN = '#2CA96A';
const GREEN_BG = '#D4F1E8';
const CORAL = '#ef4444';

interface ReadingTimeChartProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
  reports?: any[];
}

export default function ReadingTimeChart({ studentId, timeFilter, reports }: ReadingTimeChartProps) {
  const { data: realData, totalSessions: realTotal, loading, error } = use_StudentReadingTime(studentId, timeFilter);

  // ── Merge dummy report counts into chart slots ──
  const { data, totalSessions } = React.useMemo(() => {
    if (!reports || reports.length === 0) return { data: realData, totalSessions: realTotal };

    const dummyReports = reports.filter(r => r.reportId?.startsWith('dummy'));
    if (dummyReports.length === 0) return { data: realData, totalSessions: realTotal };

    const mergedData = realData.map(slot => {
      const slotLabel = slot.label.toLowerCase();
      let extraCount = 0;

      dummyReports.forEach(r => {
        const rDate = r.timestamp?.toDate?.() || new Date(r.timestamp);
        const rDay = rDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

        if (timeFilter === 'week' && rDay === slotLabel) {
          extraCount++;
        } else if (timeFilter === 'month' && slotLabel === 'ngayon' && rDate.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
          extraCount++;
        }
      });

      return { ...slot, count: slot.count + extraCount };
    });

    const mergedTotal = mergedData.reduce((acc, curr) => acc + curr.count, 0);
    return { data: mergedData, totalSessions: mergedTotal };
  }, [realData, realTotal, reports, timeFilter]);

  // ── State: Loading ──
  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={S.loadingText}>Nilo-load ang datos ng pagbasa…</Text>
      </View>
    );
  }

  // ── State: Error ──
  if (error) {
    return (
      <View style={S.errorCard}>
        <Text style={S.errorText}>⚠️ {error}</Text>
        <Text style={S.errorSub}>Hindi ma-load ang datos ng pagbasa</Text>
      </View>
    );
  }

  // ── Derived stats ──
  const avgPerPeriod = data.length > 0 ? (totalSessions / data.length) : 0;
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.count), 1) : 1;
  const peakIndex = data.length > 0
    ? data.reduce((maxIdx, item, i, arr) => (item.count > arr[maxIdx].count ? i : maxIdx), 0)
    : -1;
  const peakItem = peakIndex >= 0 ? data[peakIndex] : null;

  const periodWord = timeFilter === 'week' ? 'araw' : timeFilter === 'month' ? 'linggo' : 'buwan';
  const insightText = peakItem && peakItem.count > 0
    ? `Pinaka-aktibo noong ${peakItem.label}`
    : 'Walang aktibidad na naitala';

  // ── State: Empty ──
  if (totalSessions === 0) {
    return (
      <View style={S.centered}>
        <Text style={{ fontSize: 28, marginBottom: 8 }}>📚</Text>
        <Text style={S.loadingText}>Walang aktibidad sa panahong ito.</Text>
      </View>
    );
  }

  return (
    <View>
      {/* ── Summary Stats ──────────────────────────────────────────── */}
      <View style={S.summaryRow}>
        <View style={S.summaryItem}>
          <Text style={S.summaryValue}>{totalSessions}</Text>
          <Text style={S.summaryLabel}>Kabuuan</Text>
        </View>
        <View style={S.summaryDivider} />
        <View style={S.summaryItem}>
          <Text style={S.summaryValue}>{avgPerPeriod.toFixed(1)}</Text>
          <Text style={S.summaryLabel}>Avg / {periodWord}</Text>
        </View>
        <View style={S.summaryDivider} />
        <View style={S.summaryItem}>
          <Text style={S.summaryValue}>{peakItem?.count ?? 0}</Text>
          <Text style={S.summaryLabel}>Pinakamataas</Text>
        </View>
      </View>

      {/* ── Insight Bar ────────────────────────────────────────────── */}
      <View style={S.insightBar}>
        <Text style={S.insightIcon}>💡</Text>
        <Text style={S.insightText}>{insightText}</Text>
      </View>

      {/* ── Activity Breakdown (Horizontal Bars) ──────────────────── */}
      <View style={S.breakdownCard}>
        <Text style={S.breakdownTitle}>Detalye ng Pagbasa</Text>
        {data.map((item, index) => {
          const isPeak = index === peakIndex && item.count > 0;
          const fillPct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
          const isLast = index === data.length - 1;

          return (
            <View key={index} style={[S.row, isLast && S.rowLast]}>
              <Text style={[S.rowLabel, isPeak && S.rowLabelPeak]} numberOfLines={1}>
                {item.label}
              </Text>
              <View style={S.barContainer}>
                <View style={S.barTrack}>
                  <View
                    style={[
                      S.barFill,
                      {
                        width: `${fillPct}%` as any,
                        backgroundColor: isPeak ? PRIMARY : PRIMARY_LIGHT,
                      },
                    ]}
                  />
                </View>
                <Text style={[S.rowValue, isPeak && S.rowValuePeak]}>
                  {item.count === 0 ? '—' : item.count}
                </Text>
              </View>
            </View>
          );
        })}
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
    backgroundColor: '#FEF2F2',
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

  /* Summary Row */
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: TRACK_BG,
    borderRadius: Radii.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
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

  /* Insight Bar */
  insightBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_BG,
    borderRadius: Radii.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    gap: 8,
  },
  insightIcon: {
    fontSize: 16,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },

  /* Breakdown Card */
  breakdownCard: {
    backgroundColor: C.white,
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: PRIMARY_LIGHT,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    marginBottom: 14,
  },

  /* Row (Horizontal Bar) */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: TRACK_BG,
    gap: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    width: 55,
    fontSize: 13,
    fontWeight: '600',
    color: INK_LIGHT,
  },
  rowLabelPeak: {
    fontWeight: '800',
    color: INK,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: TRACK_BG,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  rowValue: {
    minWidth: 30,
    fontSize: 13,
    fontWeight: '800',
    color: INK_LIGHT,
    textAlign: 'right',
  },
  rowValuePeak: {
    color: PRIMARY,
  },
});

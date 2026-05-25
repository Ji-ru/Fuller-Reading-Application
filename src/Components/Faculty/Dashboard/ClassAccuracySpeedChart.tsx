import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FacultyColors as F, Radii, Shadows } from '../../../Utilities/Theme';
import { use_ClassAccuracySpeedTrends } from '../../../Hooks/use_ClassAccuracySpeedTrends';
import { ZapIcon, TrendUpIcon, AlertTriangleIcon, BarChartIcon } from '../../../Components/GlobalUse/Icons';
import DateFilter, { TimeFilterType, SubPeriodFilter } from '../../../Components/Student/DateFilter';

interface ClassAccuracySpeedChartProps {
  facultyId: string | null;
  classId: string | undefined;
}

export default function ClassAccuracySpeedChart({ facultyId, classId }: ClassAccuracySpeedChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubPeriodFilter | null>(null);

  const {
    chartData,
    avgAccuracy,
    avgWpm,
    maxWpm,
    accDir,
    accPct,
    loading,
    error,
    peakAccIdx,
  } = use_ClassAccuracySpeedTrends(facultyId || '', classId || '', timeFilter, periodOffset);

  const GREEN = '#2CA96A';
  const GREEN_BG = '#D4F1E8';
  const AMBER = '#F59E0B';
  const AMBER_BG = '#FEF3C7';
  const CORAL = '#EF4444';
  const CORAL_BG = '#FEE2E2';
  const TRACK_BG = F.bg;
  const INK = F.ink;
  const INK_LIGHT = F.slate;
  const NEUTRAL_BG = F.primaryPale;
  const NEUTRAL_ICON = F.inkLight;

  const trendColor = accDir === 'up' ? GREEN : accDir === 'down' ? CORAL : INK_LIGHT;
  const trendIcon = accDir === 'up' ? '▲' : accDir === 'down' ? '▼' : '—';

  const insight = accDir === 'up'
    ? `Ang class accuracy ay tumaas ng ${Math.abs(accPct).toFixed(1)}% sa panahong ito.`
    : accDir === 'down'
      ? `Ang class accuracy ay bumaba ng ${Math.abs(accPct).toFixed(1)}%. Subukang tingnan ang klase.`
      : 'Ang class accuracy ay nananatiling consistent.';

  const hasData = chartData.some(d => d.accuracy > 0);

  if (loading) {
    return (
      <View style={S.loadingBox}>
        <ActivityIndicator size="large" color={F.primary} />
        <Text style={S.loadingText}>Nilo-load ang datos ng accuracy...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={S.errorCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <AlertTriangleIcon size={18} color={CORAL} />
          <Text style={S.errorText}>{error}</Text>
        </View>
        <Text style={S.errorSub}>Hindi ma-load ang datos ng class accuracy</Text>
      </View>
    );
  }

  if (!hasData) {
    return (
      <View style={S.emptyBox}>
        <BarChartIcon size={40} color={INK_LIGHT} />
        <Text style={S.emptyText}>Walang datos pa sa panahong ito.</Text>
      </View>
    );
  }

  return (
    <View style={S.container}>
      {/* Date Filter */}
      <DateFilter
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        periodOffset={periodOffset}
        onOffsetChange={setPeriodOffset}
        selectedSubFilter={selectedSubFilter}
        onSubFilterChange={setSelectedSubFilter}
      />

      {/* Summary Stats Card */}
      <View style={[S.card, { marginBottom: 16 }]}>
        <Text style={S.cardTitle}>Accuracy at Bilis</Text>
        <View style={S.statsRow}>
          <View style={S.statItem}>
            <Text style={S.statValue}>{avgAccuracy.toFixed(1)}%</Text>
            <Text style={S.statLabel}>Avg Accuracy</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={S.statValue}>{avgWpm.toFixed(0)}</Text>
            <Text style={S.statLabel}>Avg WPM</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={[S.statValue, { color: trendColor }]}>
              {trendIcon} {selectedSubFilter ? 'N/A' : `${Math.abs(accPct).toFixed(1)}%`}
            </Text>
            <Text style={S.statLabel}>Trend</Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={S.legend}>
        <View style={S.legendItem}>
          <View style={[S.dot, { backgroundColor: F.primary }]} />
          <Text style={S.legendText}>Accuracy</Text>
        </View>
        <View style={S.legendItem}>
          <View style={[S.dot, { backgroundColor: AMBER }]} />
          <Text style={S.legendText}>Speed (WPM)</Text>
        </View>
      </View>

       {/* Bar Breakdown Card */}
       <View style={[S.card, { marginBottom: 16 }]}>
         {chartData.map((item, index) => {
           const isPeak = index === peakAccIdx && item.accuracy > 0;
           const accPctFill = Math.max(0, Math.min(100, item.accuracy));
           const wpmPctFill = maxWpm > 0 ? (item.wpm / maxWpm) * 100 : 0;
           const isLast = index === chartData.length - 1;

           return (
             <View key={index} style={[S.row, isLast && { borderBottomWidth: 0 }]}>
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
                           width: accPctFill,
                           backgroundColor: isPeak ? F.primary : F.primaryLight,
                         },
                       ]}
                     />
                   </View>
                   <Text style={[S.barValue, isPeak && { color: F.primary }]}>
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
                           width: wpmPctFill,
                           backgroundColor: AMBER_BG,
                         },
                       ]}
                     />
                   </View>
                   <Text style={[S.barValue, { color: AMBER }]}>
                     {item.wpm > 0 ? `${Math.round(item.wpm)}` : '—'}
                   </Text>
                 </View>
               </View>
             </View>
           );
         })}
       </View>

       {/* Insight Pill */}
       <View
         style={[
           S.insightBar,
           accDir === 'up' ? { backgroundColor: GREEN_BG }
             : accDir === 'down' ? { backgroundColor: CORAL_BG }
               : { backgroundColor: NEUTRAL_BG },
         ]}
       >
         <View style={{ marginRight: 8 }}>
           {accDir === 'up' ? <TrendUpIcon size={18} color={GREEN} />
             : accDir === 'down' ? <View style={{ transform: [{ rotate: '180deg' }] }}><TrendUpIcon size={18} color={CORAL} /></View>
               : <BarChartIcon size={18} color={NEUTRAL_ICON} />}
         </View>
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

const S = StyleSheet.create({
  container: { flex: 1 },
  loadingBox: { height: 300, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: F.slate, fontWeight: '600' },

  card: {
    backgroundColor: F.white,
    borderRadius: Radii.xl,
    padding: 20,
    ...Shadows.card,
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: F.ink, marginBottom: 16 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '900', color: F.primary, marginBottom: 2 },
  statLabel: { fontSize: 10, color: F.slate, fontWeight: '700', textTransform: 'uppercase' },
  statDivider: { width: 1, height: 30, backgroundColor: F.primaryLight },

  legend: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '600', color: F.slate },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: F.bg,
    gap: 10,
  },
  rowLabel: {
    width: 50,
    fontSize: 12,
    fontWeight: '600',
    color: F.slate,
  },
  rowLabelPeak: {
    fontWeight: '800',
    color: F.ink,
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
    backgroundColor: F.bg,
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
    color: F.slate,
    textAlign: 'right',
  },

  insightBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
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
    color: '#EF4444',
    marginBottom: 4,
  },
  errorSub: {
    fontSize: 12,
    fontWeight: '600',
    color: F.slate,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: F.slate,
  },
});
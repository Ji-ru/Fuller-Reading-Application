import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStudentMiscueStats } from '../../../Hooks/use_ForStudentMiscueStats';
import { FacultyColors as F, Radii, Shadows } from '../../../Utilities/Theme';

type HeatmapData = {
  daysInMonth: number;
  firstWeekday: number;
  counts: number[];
  maxCount: number;
  monthLabel: string;
};

interface MonthlyActivityHeatmapProps {
  facultyId?: string | null;
  classId?: string;
}

const WEEKDAY_LABELS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
const INTENSITY_STOPS = [
  'rgba(61, 113, 217, 0.08)',
  'rgba(61, 113, 217, 0.18)',
  'rgba(61, 113, 217, 0.32)',
  'rgba(61, 113, 217, 0.52)',
  'rgba(61, 113, 217, 0.72)',
];

const MonthlyActivityHeatmap: React.FC<MonthlyActivityHeatmapProps> = ({
  facultyId = null,
  classId,
}) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HeatmapData | null>(null);
  const { getMonthlyActivityHeatmap } = useStudentMiscueStats();

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!facultyId) {
          setData(null);
          return;
        }
        const result = await getMonthlyActivityHeatmap(
          facultyId,
          classId ? { type: 'class', classId } : { type: 'overall' },
          monthOffset,
        );
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load monthly activity');
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [facultyId, classId, monthOffset]);

  const cells = useMemo(() => {
    if (!data) return [];
    const leading = Array.from({ length: data.firstWeekday }, () => null);
    const days = data.counts.map((count, idx) => ({ day: idx + 1, count }));
    return [...leading, ...days];
  }, [data]);

  const getCellColor = (count: number, maxCount: number) => {
    if (maxCount <= 0 || count <= 0) return 'rgba(61, 113, 217, 0.05)';
    const ratio = count / maxCount;
    const idx = Math.min(INTENSITY_STOPS.length - 1, Math.floor(ratio * INTENSITY_STOPS.length));
    return INTENSITY_STOPS[idx];
  };

  if (loading) {
    return (
      <View style={S.loadingCard}>
        <ActivityIndicator size="large" color={F.primary} />
        <Text style={S.loadingText}>Loading monthly activity...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={S.errorCard}>
        <Text style={S.errorTitle}>Unable to load activity</Text>
        <Text style={S.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={S.emptyCard}>
        <Text style={S.emptyText}>No activity data available.</Text>
      </View>
    );
  }

  return (
    <View style={S.card}>
      <View style={S.headerRow}>
        <View>
          <Text style={S.cardTitle}>Monthly Activity Heatmap</Text>
          <Text style={S.cardSubtitle}>{data.monthLabel}</Text>
        </View>
        <View style={S.controls}>
          <TouchableOpacity
            style={S.controlButton}
            onPress={() => setMonthOffset(prev => prev + 1)}
            activeOpacity={0.7}
          >
            <Text style={S.controlButtonText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={S.controlButton}
            onPress={() => setMonthOffset(prev => Math.max(0, prev - 1))}
            activeOpacity={0.7}
          >
            <Text style={S.controlButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={S.weekdayRow}>
        {WEEKDAY_LABELS.map(label => (
          <Text key={label} style={S.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={S.grid}>
        {cells.map((cell, idx) => {
          if (!cell) {
            return <View key={`empty-${idx}`} style={S.dayCell} />;
          }
          const color = getCellColor(cell.count, data.maxCount);
          return (
            <View key={`day-${cell.day}`} style={[S.dayCell, { backgroundColor: color }]}> 
              <Text style={S.dayLabel}>{cell.day}</Text>
              {cell.count > 0 && <Text style={S.dayCount}>{cell.count}</Text>}
            </View>
          );
        })}
      </View>

      <View style={S.legendRow}>
        <Text style={S.legendLabel}>Less</Text>
        <View style={S.legendBar}>
          {INTENSITY_STOPS.map((color, idx) => (
            <View key={`legend-${idx}`} style={[S.legendCell, { backgroundColor: color }]} />
          ))}
        </View>
        <Text style={S.legendLabel}>More</Text>
      </View>
    </View>
  );
};

const S = StyleSheet.create({
  card: {
    backgroundColor: F.white,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: F.ink,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: F.slate,
    marginTop: 2,
  },
  controls: { flexDirection: 'row', gap: 8 },
  controlButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: F.primary + '15',
  },
  controlButtonText: { fontSize: 11, fontWeight: '700', color: F.primary },

  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: '13.5%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: F.slate,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayCell: {
    width: '13.5%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(61, 113, 217, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: F.ink,
  },
  dayCount: {
    fontSize: 9,
    fontWeight: '700',
    color: F.primary,
    marginTop: 2,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: F.slate,
  },
  legendBar: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginHorizontal: 8,
  },
  legendCell: {
    flex: 1,
    height: 10,
    borderRadius: 4,
  },

  loadingCard: {
    backgroundColor: F.white,
    borderRadius: Radii.lg,
    padding: 20,
    alignItems: 'center',
    ...Shadows.card,
  },
  loadingText: { marginTop: 10, fontSize: 12, fontWeight: '600', color: F.slate },
  errorCard: {
    backgroundColor: F.white,
    borderRadius: Radii.lg,
    padding: 16,
    alignItems: 'center',
    ...Shadows.card,
  },
  errorTitle: { fontSize: 13, fontWeight: '800', color: F.red, marginBottom: 4 },
  errorText: { fontSize: 11, fontWeight: '600', color: F.slate, textAlign: 'center' },
  emptyCard: {
    backgroundColor: F.white,
    borderRadius: Radii.lg,
    padding: 16,
    alignItems: 'center',
    ...Shadows.card,
  },
  emptyText: { fontSize: 12, fontWeight: '600', color: F.slate },
});

export default MonthlyActivityHeatmap;

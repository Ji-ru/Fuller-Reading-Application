import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useStudentActiveHours } from '../../../Hooks/Faculty/use_StudentView_Progress';
import { ActivitySummaryCard } from './Student_TimeTrackCards/ActivitySummaryCard';
import { ActivityBarChart } from './Student_TimeTrackCards/ActivityBarChart';
import { ActivityDetailsList } from './Student_TimeTrackCards/ActivityDetailsList';
import { sw, sh, sf } from '../../../Utils/responsive';

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

  // Trend info for ActivitySummaryCard
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
  const insightPrefix = {
    week: "on",
    month: "during",
    year: "in",
  };

  const insightText =
    mostActive && mostActive.hours > 0
      ? `The student is most active ${insightPrefix[timeRange]} ${mostActive.day}.`
      : 'No activity recorded yet.';


  // Convert hours to display unit
  const formatValue = (value: number) => (displayInMinutes ? value * 60 : value);
  const unit = displayInMinutes ? 'min' : 'hr';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading activity data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, styles.errorCard]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubText}>Failed to load activity tracking data</Text>
      </View>
    );
  }

  // chartData is always populated (all periods with 0 for empty)
  const maxBarValue =
    chartData.length > 0
      ? Math.max(...chartData.map(d => formatValue(d.hours)), 1)
      : 1;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Time Range Selector */}
      <View style={styles.timeRangeSelector}>
        {(['week', 'month', 'year'] as const).map(range => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === range && styles.timeRangeButtonTextActive,
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Minutes / Hours Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Display in Minutes</Text>
        <Switch value={displayInMinutes} onValueChange={setDisplayInMinutes} />
      </View>

      {/* Activity Summary */}
      <ActivitySummaryCard
        total={formatValue(totalHours)}
        average={formatValue(averageHoursPerPeriod)}
        trendPercentage={trendPercentage}
        trendDirection={trendDirection}
        unit={unit}
        insightText={insightText}
      />

      {/* Activity Bar Chart */}
      {/* <ActivityBarChart
        data={chartData.map(d => ({
          label: d.day,
          value: formatValue(d.hours),
        }))}
        maxValue={maxBarValue}
        unit={unit}
      /> */}

      {/* Detailed Activity List */}
      <ActivityDetailsList
        data={chartData.map(d => ({
          label: d.day,
          value: formatValue(d.hours),
        }))}
        unit={unit}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16 },
  errorCard: { borderLeftWidth: 4, borderLeftColor: '#ef4444', alignItems: 'center' },
  emptyCard: { borderLeftWidth: 4, borderLeftColor: '#9ca3af', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ef4444', fontWeight: '600' },
  errorSubText: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },

  // Time Range Selector
  timeRangeSelector: {
    flexDirection: 'row',
    marginBottom: sh(12),
    backgroundColor: '#f3f4f6',
    borderRadius: sw(12),
    overflow: 'hidden',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: sh(8),
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  timeRangeButtonText: {
    fontSize: sf(14),
    fontWeight: '500',
    color: '#6b7280',
  },
  timeRangeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: sh(16),
  },
  toggleLabel: {
    marginRight: sw(8),
    fontSize: sf(14),
    color: '#374151',
  },
});

export default StudentActivityTrackingCard;

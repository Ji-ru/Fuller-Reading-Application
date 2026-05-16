// ActiveHoursChart.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useActiveHours } from '../../../Hooks/use_ActiveHours';

type TimeRange = 'week' | 'month' | 'year';

interface ActiveHoursChartProps {
  facultyId?: string | null;
  data?: { day: string; hours: number }[];
  
}

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

const X_AXIS_LABELS: Record<TimeRange, string[]> = {
  week: ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'],
  month: ['W1', 'W2', 'W3', 'W4', 'W5'],
  year: [
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
  ],
};

const ActiveHoursChart: React.FC<ActiveHoursChartProps> = ({
  facultyId = null,
  data,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const {
    chartData: hookData,
    loading,
    error,
  } = useActiveHours(facultyId, {
    timeRange,
  });

  const labels = X_AXIS_LABELS[timeRange];

  let chartData =
    hookData && hookData.length > 0
      ? labels.map(label => {
          const match = hookData.find(d => d.day === label);
          return {
            day: label,
            hours: match ? match.hours : 0,
          };
        })
      : labels.map(label => ({ day: label, hours: 0 }));

  let displayInMinutes = false;

  const maxValue = Math.max(...chartData.map(d => d.hours), 0);
  displayInMinutes = maxValue < 1;

  const displayData = displayInMinutes
    ? chartData.map(item => ({
        ...item,
        hours: item.hours * 60,
      }))
    : chartData;

  const maxDisplayValue = displayInMinutes
    ? Math.ceil(Math.max(...displayData.map(d => d.hours), 10))
    : Math.ceil(Math.max(...displayData.map(d => d.hours), 8));

  const chartHeight = 200;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading activity data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>📊</Text>
          <Text style={styles.errorTitle}>Unable to Load Chart</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  const yAxisLabels = displayInMinutes
    ? Array.from({ length: 5 }, (_, i) =>
        Math.round((maxDisplayValue / 4) * (4 - i)),
      )
    : [8, 6, 4, 2, 0];

  const rangeTitle =
    timeRange === 'week'
      ? 'This Week'
      : timeRange === 'month'
      ? 'This Month'
      : 'This Academic Year';

  // Calculate total hours/minutes
  const totalValue = displayData.reduce((sum, item) => sum + item.hours, 0);
  const avgValue = displayData.length > 0 ? totalValue / displayData.length : 0;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrapper}>
            <Text style={styles.titleIcon}>📈</Text>
          </View>
          <View style={styles.titleContent}>
            <Text style={styles.title}>Activity Tracking</Text>
            <Text style={styles.subtitle}>{rangeTitle}</Text>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.rangeSelector}>
          {TIME_RANGES.map(range => (
            <TouchableOpacity
              key={range.value}
              onPress={() => setTimeRange(range.value)}
              style={[
                styles.rangeButton,
                timeRange === range.value && styles.rangeButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  timeRange === range.value && styles.rangeButtonTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {totalValue.toFixed(2)}
            <Text style={styles.statUnit}>
              {displayInMinutes ? ' min' : ' hr/s'}
            </Text>
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {avgValue.toFixed(2)}
            <Text style={styles.statUnit}>
              {displayInMinutes ? ' min' : ' hr/s'}
            </Text>
          </Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>

      {/* Chart Area */}
      <View style={styles.chartContainer}>
        {/* Y Axis */}
        <View style={styles.yAxisContainer}>
          {yAxisLabels.map((value, index) => (
            <View key={index} style={styles.yAxisLabelContainer}>
              <Text style={styles.yAxisLabel}>
                {value}
                <Text style={styles.yAxisUnit}>
                  {displayInMinutes ? ' m' : ' h'}
                </Text>
              </Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartArea}>
          {/* Grid Lines */}
          <View style={styles.gridLinesContainer}>
            {yAxisLabels.map((_, index) => (
              <View key={index} style={styles.gridLine} />
            ))}
          </View>

          {/* Bars */}
          <View style={styles.barsContainer}>
            {displayData.slice(0, labels.length).map((item, index) => {
              const barHeight = Math.max(
                (item.hours / maxDisplayValue) * chartHeight,
                2,
              );
              const isHighest =
                item.hours === Math.max(...displayData.map(d => d.hours));

              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    {/* Value on top of bar for highest */}
                    {item.hours > 0 && (
                      <Text style={styles.barTopValue}>
                        {item.hours.toFixed(2)}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.bar,
                        { height: barHeight },
                        isHighest && styles.barHighest,
                      ]}
                    />
                  </View>
                  <Text style={styles.xAxisLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>
            Active {displayInMinutes ? 'Minutes' : 'Hours'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  // HEADER
  headerSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleIcon: {
    fontSize: 24,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Andika-Regular',
    color: '#9CA3AF',
  },

  // TIME RANGE SELECTOR
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    alignSelf: 'flex-start',
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rangeButtonText: {
    fontSize: 13,
    fontFamily: 'Andika-Bold',
    color: '#6B7280',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },

  // STATS ROW
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Andika-Bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 16,
    fontFamily: 'Andika-Regular',
    color: '#9CA3AF',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Andika-Regular',
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },

  // CHART
  chartContainer: {
    flexDirection: 'row',
    height: 240,
  },
  yAxisContainer: {
    width: 40,
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
    marginBottom: 20,
  },
  yAxisLabelContainer: {
    height: 20,
    justifyContent: 'center',
  },
  yAxisLabel: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: '#6B7280',
    textAlign: 'right',
  },
  yAxisUnit: {
    fontSize: 9,
    fontFamily: 'Andika-Regular',
    color: '#9CA3AF',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingTop: 12,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 213,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 180,
  },
  barTopValue: {
    fontSize: 12,
    fontFamily: 'Andika-Bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  bar: {
    width: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    minHeight: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  barHighest: {
    backgroundColor: '#2E7D32',
    shadowOpacity: 0.25,
  },
  xAxisLabel: {
    fontSize: 11,
    fontFamily: 'Andika-Bold',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },

  // LEGEND
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Andika-Regular',
    color: '#6B7280',
  },

  // LOADING & ERROR
  loadingCard: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: '#6B7280',
  },
  errorCard: {
    padding: 40,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Andika-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ActiveHoursChart;

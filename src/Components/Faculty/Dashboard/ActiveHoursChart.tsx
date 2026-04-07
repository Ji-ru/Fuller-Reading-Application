// ActiveHoursChart.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useActiveHours } from '../../../Hooks/use_ActiveHours';
import { useFacultyClassesFilter } from '../../../Hooks/use_ReadingStudentStats';
import { FilterOptions } from '../../../Interfaces/miscue';
import { sw, sh, sf } from '../../../Utils/responsive';

type TimeRange = 'week' | 'month' | 'year';

interface ActiveHoursChartProps {
  facultyId?: string | null;
  filter: {
    academicYear: string;
    selectedView: string;
  };
}

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

const ActiveHoursChart: React.FC<ActiveHoursChartProps> = ({
  facultyId = null,
  filter,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { selectedView, academicYear } = filter;
  const isOverall = selectedView === 'overall';

  // Fetch classes to get class name from ID
  const { classes: facultyClasses } = useFacultyClassesFilter(facultyId);
  const selectedClassName = useMemo(() => {
    if (isOverall) return 'Overall';
    const cls = facultyClasses.find(c => c.classId === selectedView);
    return cls?.className || selectedView;
  }, [isOverall, selectedView, facultyClasses]);

  // Build filter options for the hook – explicitly typed as FilterOptions
  const filterOptions: FilterOptions = {
    type: isOverall ? 'overall' : 'class',
    ...(!isOverall && selectedView && { classId: selectedView }),
    ...(academicYear && { academicYear }),
  };

  // Fetch data
  const {
    chartData: hookData,
    loading,
    error,
  } = useActiveHours(facultyId, {
    timeRange,
    filter: filterOptions,
  });

  // Use the data directly – labels are already the correct period strings
  const chartData = hookData && hookData.length > 0 ? hookData : [];

  // Auto‑switch between hours and minutes
  const maxValue = Math.max(...chartData.map(d => d.hours), 0);
  const displayInMinutes = maxValue < 1;

  const displayData = displayInMinutes
    ? chartData.map(item => ({ ...item, hours: item.hours * 60 }))
    : chartData;

  const maxDisplayValue = displayInMinutes
    ? Math.ceil(Math.max(...displayData.map(d => d.hours), 10))
    : Math.ceil(Math.max(...displayData.map(d => d.hours), 8));

  const chartHeight = 200;

  // Y-axis labels
  const yAxisLabels = displayInMinutes
    ? Array.from({ length: 5 }, (_, i) =>
        Math.round((maxDisplayValue / 4) * (4 - i)),
      )
    : [8, 6, 4, 2, 0];

  // Range title for subtitle
  const rangeTitle =
    timeRange === 'week'
      ? 'This Week'
      : timeRange === 'month'
      ? 'Last 30 Days'
      : 'Academic Year';

  // Totals & average
  const totalValue = displayData.reduce((sum, item) => sum + item.hours, 0);
  const avgValue = displayData.length > 0 ? totalValue / displayData.length : 0;

  // Loading & Error states
  if (loading) {
    return (
      <View style={styles.container}>
        {/* <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            {isOverall ? '📊 Overall Activity' : `📚 Class: ${selectedClassName}`}
            {academicYear && ` • ${academicYear}`}
          </Text>
        </View> */}
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
        <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            {isOverall ? '📊 Overall Activity' : `📚 Class: ${selectedClassName}`}
            {academicYear && ` • ${academicYear}`}
          </Text>
        </View>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>📊</Text>
          <Text style={styles.errorTitle}>Unable to Load Chart</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter context header */}
      {/* <View style={styles.filterIndicator}>
        <Text style={styles.filterIndicatorText}>
          {isOverall ? '📊 Overall Activity' : `📚 Class: ${selectedClassName}`}
          {academicYear && ` • ${academicYear}`}
        </Text>
      </View> */}

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

          {/* Bars – using dynamic labels from the data */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={timeRange === 'year' || displayData.length > 8}
            style={styles.barsScrollView}
          >
            <View style={styles.barsContainer}>
              {displayData.map((item, index) => {
                const barHeight = Math.max(
                  (item.hours / maxDisplayValue) * chartHeight,
                  2,
                );
                const isHighest =
                  item.hours === Math.max(...displayData.map(d => d.hours));

                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barWrapper}>
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
          </ScrollView>
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
    borderRadius: sw(14),
    padding: sw(20),
    marginBottom: sh(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.06,
    shadowRadius: sw(8),
  },
  filterIndicator: {
    backgroundColor: '#F0F9FF',
    padding: sw(16),
    borderRadius: sw(12),
    marginBottom: sh(16),
    borderLeftWidth: 4,
    borderLeftColor: '#5B5FED',
  },
  filterIndicatorText: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#1F2937',
  },
  headerSection: {
    marginBottom: sh(20),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(16),
  },
  iconWrapper: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(12),
  },
  titleIcon: {
    fontSize: sf(24),
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    marginBottom: sh(2),
  },
  subtitle: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: sw(10),
    padding: sw(4),
    alignSelf: 'flex-start',
  },
  rangeButton: {
    paddingHorizontal: sw(16),
    paddingVertical: sh(8),
    borderRadius: sw(8),
    minWidth: sw(70),
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.2,
    shadowRadius: sw(4),
    elevation: 2,
  },
  rangeButtonText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: sw(10),
    padding: sw(16),
    marginBottom: sh(24),
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: sf(24),
    fontFamily: 'Satoshi-Black',
    color: '#4CAF50',
    marginBottom: sh(4),
  },
  statUnit: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
  },
  statLabel: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  statDivider: {
    width: sw(1),
    height: sw(40),
    backgroundColor: '#E5E7EB',
    marginHorizontal: sw(16),
  },
  chartContainer: {
    flexDirection: 'row',
    height: sw(240),
  },
  yAxisContainer: {
    width: sw(40),
    height: sw(200),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: sw(8),
    marginBottom: sh(20),
  },
  yAxisLabelContainer: {
    height: sw(20),
    justifyContent: 'center',
  },
  yAxisLabel: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
    textAlign: 'right',
  },
  yAxisUnit: {
    fontSize: sf(9),
    fontFamily: 'Satoshi-Medium',
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
    height: sw(200),
    justifyContent: 'space-between',
    paddingBottom: sh(10),
    paddingTop: sh(12),
  },
  gridLine: {
    height: sw(1),
    backgroundColor: '#F3F4F6',
  },
  barsScrollView: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: sw(213),
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: sw(180),
  },
  barTopValue: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Bold',
    color: '#4CAF50',
    marginBottom: sh(4),
  },
  bar: {
    width: sw(24),
    backgroundColor: '#4CAF50',
    borderRadius: sw(6),
    minHeight: sw(2),
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.15,
    shadowRadius: sw(4),
    marginLeft: sw(20),
  },
  barHighest: {
    backgroundColor: '#2E7D32',
    shadowOpacity: 0.25,
  },
  xAxisLabel: {
    fontSize: sf(11),
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: sh(8),
    marginLeft: sw(20),
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: sh(12),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: sw(10),
    height: sw(10),
    borderRadius: sw(5),
    backgroundColor: '#4CAF50',
    marginRight: sw(8),
  },
  legendText: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  loadingCard: {
    padding: sw(40),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: sh(16),
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  errorCard: {
    padding: sw(40),
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: sf(48),
    marginBottom: sh(12),
  },
  errorTitle: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#EF4444',
    marginBottom: sh(8),
  },
  errorText: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ActiveHoursChart;
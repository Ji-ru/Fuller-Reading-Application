import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { useStudentAccuracyTrends } from '../../../Hooks/Faculty/use_StudentView_Progress';

type TimeRange = 'week' | 'month' | 'year';

interface AccuracyTrendsChartProps {
  studentId: string;
}

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

const StudentAccuracyTrendsChart: React.FC<AccuracyTrendsChartProps> = ({
  studentId,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Fetch real accuracy data
  const {
    chartData: accuracyData,
    loading,
    error,
  } = useStudentAccuracyTrends(studentId, timeRange);

  // Transform accuracy data for the chart (memoized)
  const chartData = useMemo(
    () =>
      accuracyData.map(item => ({
        label: item.date,
        value: item.accuracy,
      })),
    [accuracyData],
  );

  // Calculate values for scaling (memoized)
  const values = useMemo(
    () => chartData.map(d => d.value).filter(v => v > 0),
    [chartData],
  );

  const hasData = values.length > 0;

  // Chart dimensions
  const chartWidth = 320;
  const chartHeight = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate chart calculations only once, regardless of data state
  const chartCalculations = useMemo(() => {
    if (!hasData) {
      return {
        minValue: 0,
        maxValue: 0,
        average: 0,
        yAxisLabels: [0, 0, 0],
        points: [],
        polylinePoints: '',
        trendDirection: '→' as const,
        trendPercentage: '0.0',
        trendColor: '#9CA3AF' as const,
      };
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const yAxisMin = Math.floor(minValue / 10) * 10;
    const yAxisMax = Math.ceil(maxValue / 10) * 10;
    const yRange = yAxisMax - yAxisMin || 1;

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    const yAxisLabels = [yAxisMax, (yAxisMax + yAxisMin) / 2, yAxisMin];

    // Convert data to points
    const points = chartData.map((item, index) => {
      const x =
        chartData.length > 1
          ? paddingLeft + (index / (chartData.length - 1)) * plotWidth
          : paddingLeft + plotWidth / 2;

      const y =
        item.value > 0
          ? paddingTop +
            plotHeight -
            ((item.value - yAxisMin) / yRange) * plotHeight
          : paddingTop + plotHeight;

      return { x, y, value: item.value };
    });

    // Create polyline path (only for points with value > 0)
    const polylinePoints = points
      .filter(p => p.value > 0)
      .map(p => `${p.x},${p.y}`)
      .join(' ');

    // Calculate trend
    const validPoints = chartData.filter(d => d.value > 0);
    const firstValue = validPoints[0]?.value ?? 0;
    const lastValue = validPoints[validPoints.length - 1]?.value ?? 0;
    const trend = lastValue - firstValue;
    const trendPercentage =
      firstValue !== 0 ? ((trend / firstValue) * 100).toFixed(1) : '0.0';
    const trendDirection = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
    const trendColor =
      trend > 0 ? '#4CAF50' : trend < 0 ? '#EF4444' : '#9CA3AF';

    return {
      minValue,
      maxValue,
      average,
      yAxisLabels,
      points,
      polylinePoints,
      trendDirection,
      trendPercentage,
      trendColor,
    };
  }, [
    chartData,
    values,
    hasData,
    paddingLeft,
    plotWidth,
    paddingTop,
    plotHeight,
  ]);

  const {
    minValue,
    maxValue,
    average,
    yAxisLabels,
    points,
    polylinePoints,
    trendDirection,
    trendPercentage,
    trendColor,
  } = chartCalculations;

  // Get the appropriate style based on trend direction
  const insightContainerStyle = useMemo(() => {
    switch (trendDirection) {
      case '↑':
        return [styles.insightContainer, styles.insightContainerImproving];
      case '↓':
        return [styles.insightContainer, styles.insightContainerDeclining];
      default:
        return [styles.insightContainer, styles.insightContainerStable];
    }
  }, [trendDirection]);

  // You can also change the insight text color based on trend
  const insightTextStyle = useMemo(() => {
    switch (trendDirection) {
      case '↑':
        return styles.insightTextImproving;
      case '↓':
        return styles.insightTextDeclining;
      default:
        return styles.insightTextStable;
    }
  }, [trendDirection]);
  const insightMessage = useMemo(() => {
    if (!hasData) return '';

    const change = Math.abs(parseFloat(trendPercentage));

    switch (trendDirection) {
      case '↑':
        return `Reading accuracy improved by ${change}%, indicating positive progress in students’ reading performance over the selected period.`;

      case '↓':
        return `Reading accuracy declined by ${change}%, suggesting possible reading difficulties that may require targeted intervention.`;

      default:
        return 'Reading accuracy remained stable, indicating consistent reading performance over the selected period.';
    }
  }, [trendDirection, trendPercentage, hasData]);

  // Handle loading state for accuracy data
  if (loading) {
    return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <View style={styles.iconWrapper}>
                <Text style={styles.titleIcon}>📊</Text>
              </View>
              <View style={styles.titleContent}>
                <Text style={styles.title}>
                  Student Reading Performance Insights
                </Text>
                <Text style={styles.subtitle}>Loading data...</Text>
              </View>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading accuracy data...</Text>
          </View>
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <View style={styles.iconWrapper}>
                <Text style={styles.titleIcon}>📊</Text>
              </View>
              <View style={styles.titleContent}>
                <Text style={styles.title}>
                  Student Reading Performance Insights
                </Text>
                <Text style={styles.subtitle}>Error loading data</Text>
              </View>
            </View>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load data</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        </View>
    );
  }

  return (
      <View>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrapper}>
              <Text style={styles.titleIcon}>📊</Text>
            </View>
            <View style={styles.titleContent}>
              <Text style={styles.title}>Accuracy Trends</Text>
              <Text style={styles.subtitle}>
                {timeRange === 'week'
                  ? 'Last 7 days'
                  : timeRange === 'month'
                  ? 'Last 4 weeks'
                  : 'Last 12 months'}
              </Text>
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

        {!hasData ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>📊</Text>
            <Text style={styles.noDataTitle}>No data of student yet</Text>
          </View>
        ) : (
          <>
            {/* Stats Summary */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {average.toFixed(1)}
                  <Text style={styles.statUnit}>%</Text>
                </Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {maxValue.toFixed(1)}
                  <Text style={styles.statUnit}>%</Text>
                </Text>
                <Text style={styles.statLabel}>Highest</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: trendColor }]}>
                  {trendDirection} {Math.abs(parseFloat(trendPercentage))}
                  <Text style={styles.statUnit}>%</Text>
                </Text>
                <Text style={styles.statLabel}>Trend</Text>
              </View>
            </View>
            {/* Performance Insights */}
            <View style={insightContainerStyle}>
              <Text style={insightTextStyle}>{insightMessage}</Text>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
              <Svg width={chartWidth} height={chartHeight}>
                {/* Grid lines */}
                {yAxisLabels.map((label, index) => {
                  const y =
                    paddingTop +
                    (index / (yAxisLabels.length - 1)) * plotHeight;
                  return (
                    <Line
                      key={`grid-${index}`}
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Y-axis labels */}
                {yAxisLabels.map((label, index) => {
                  const y =
                    paddingTop +
                    (index / (yAxisLabels.length - 1)) * plotHeight;
                  return (
                    <SvgText
                      key={`ylabel-${index}`}
                      x={paddingLeft - 10}
                      y={y + 5}
                      fontSize="12"
                      fill="#6B7280"
                      textAnchor="end"
                      fontFamily="Satoshi-Bold"
                    >
                      {label.toFixed(0)}%
                    </SvgText>
                  );
                })}

                {/* Line (only if we have at least 2 points with values) */}
                {points.filter(p => p.value > 0).length >= 2 && (
                  <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points (only for non-zero values) */}
                {points
                  .filter(point => point.value > 0)
                  .map((point, index) => (
                    <Circle
                      key={`point-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      fill="#4CAF50"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  ))}

                {/* X-axis labels */}
                {chartData.map((item, index) => {
                  const x =
                    paddingLeft + (index / (chartData.length - 1)) * plotWidth;
                  return (
                    <SvgText
                      key={`xlabel-${index}`}
                      x={x}
                      y={chartHeight - 10}
                      fontSize="11"
                      fill="#6B7280"
                      textAnchor="middle"
                      fontFamily="Satoshi-Bold"
                    >
                      {item.label}
                    </SvgText>
                  );
                })}
              </Svg>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Reading Accuracy</Text>
              </View>
            </View>
          </>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  // FILTER SECTION
  filterSection: {
    marginBottom: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 1000,
  },
  filterItem: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
    marginBottom: 6,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Satoshi-Medium',
    flex: 1,
    marginRight: 8,
  },
  filterArrow: {
    fontSize: 12,
    color: '#4CAF50',
    fontFamily: 'Satoshi-Bold',
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 2000,
  },
  filterDropdownOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterDropdownOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  filterDropdownOptionText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#1F2937',
  },
  filterDropdownOptionTextSelected: {
    color: '#4CAF50',
    fontFamily: 'Satoshi-Bold',
  },

  // CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    minHeight: 400,
  },
  cardHeader: {
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
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
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
    fontFamily: 'Satoshi-Bold',
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
    fontFamily: 'Satoshi-Black',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },

  // INSIGHTS
  insightContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  insightTextImproving: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#166534',
    lineHeight: 18,
  },
  insightTextDeclining: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#991B1B',
    lineHeight: 18,
  },
  insightTextStable: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#374151',
    lineHeight: 18,
  },
  insightContainerImproving: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#4CAF50',
  },
  insightContainerDeclining: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444',
  },
  insightContainerStable: {
    backgroundColor: '#F3F4F6',
    borderLeftColor: '#9CA3AF',
  },

  // CHART
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // LOADING STATES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  loadingContainerModal: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTextModal: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // ERROR STATES
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainerModal: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTextModal: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtextModal: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // NO DATA STATES
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  noDataTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  noClassesContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noClassesText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  noClassesSubtext: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontFamily: 'Satoshi-Bold',
  },
  classList: {
    padding: 20,
    paddingBottom: 10,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  selectedClassItem: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  classItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  classItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classItemIconText: {
    fontSize: 20,
  },
  classItemText: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  gradeLevel: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Satoshi-Bold',
  },
});

export default StudentAccuracyTrendsChart;

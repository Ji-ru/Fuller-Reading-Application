import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
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

  // Fetch real accuracy data - hook handles date filtering and returns all periods
  const {
    chartData: accuracyData,
    loading,
    error,
  } = useStudentAccuracyTrends(studentId, timeRange);

  // Transform data for chart
  const chartData = useMemo(
    () =>
      accuracyData.map(item => ({
        label: item.date,      // Already formatted label from hook
        accuracy: item.accuracy,
        wpm: item.wpm,
      })),
    [accuracyData],
  );

  // Get values for calculations (filter out zeros)
  const accuracyValues = useMemo(
    () => chartData.map(d => d.accuracy).filter(v => v > 0),
    [chartData],
  );

  const wpmValues = useMemo(
    () => chartData.map(d => d.wpm).filter(v => v > 0),
    [chartData],
  );

  const hasData = accuracyValues.length > 0;

  // Determine if scrolling is needed
  // Year view always scrolls because it shows 15 months (Jun to Aug next year)
  const needsScroll = timeRange === 'year';

  // Chart dimensions
  const baseChartWidth = 320;
  // For year: 50px per month ensures all labels fit nicely
  const chartWidth = needsScroll 
    ? Math.max(chartData.length * 50, 600) 
    : baseChartWidth;
  
  const chartHeight = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Generate Y-axis labels: 0%, 10%, 20%, ..., 100%
  const generateYAxisLabels = useCallback(() => {
    const labels = [];
    for (let i = 100; i >= 0; i -= 10) {
      labels.push(i);
    }
    return labels;
  }, []);

  // Calculate all chart metrics
  const chartCalculations = useMemo(() => {
    if (!hasData) {
      return {
        minAccuracy: 0,
        maxAccuracy: 0,
        averageAccuracy: 0,
        averageWpm: 0,
        yAxisLabels: generateYAxisLabels(),
        points: [],
        accuracyPolylinePoints: '',
        wpmPolylinePoints: '',
        accuracyTrendDirection: '→' as const,
        accuracyTrendPercentage: '0.0',
        accuracyTrendColor: '#9CA3AF' as const,
        wpmTrendDirection: '→' as const,
        wpmTrendPercentage: '0.0',
        wpmTrendColor: '#9CA3AF' as const,
      };
    }

    const minAccuracy = Math.min(...accuracyValues);
    const maxAccuracy = Math.max(...accuracyValues);
    const maxWpm = Math.max(...wpmValues);
    
    // Y-axis always 0-100 for percentage
    const yAxisMin = 0;
    const yAxisMax = 100;
    const yRange = yAxisMax - yAxisMin;

    const averageAccuracy = accuracyValues.reduce((sum, val) => sum + val, 0) / accuracyValues.length;
    const averageWpm = wpmValues.length > 0 ? wpmValues.reduce((sum, val) => sum + val, 0) / wpmValues.length : 0;

    const yAxisLabels = generateYAxisLabels();

    // Convert data to chart points
    const points = chartData.map((item, index) => {
      // X position: spread points evenly across plot width
      const x =
        chartData.length > 1
          ? paddingLeft + (index / (chartData.length - 1)) * plotWidth
          : paddingLeft + plotWidth / 2;

      // Y position for accuracy (0-100 scale)
      const accuracyY =
        item.accuracy > 0
          ? paddingTop + plotHeight - ((item.accuracy - yAxisMin) / yRange) * plotHeight
          : paddingTop + plotHeight;

      // Y position for WPM (normalized to same scale as accuracy)
      const wpmY =
        item.wpm > 0 && maxWpm > 0
          ? paddingTop + plotHeight - ((item.wpm / maxWpm) * 100 / yRange) * plotHeight
          : paddingTop + plotHeight;

      return { 
        x, 
        accuracyY, 
        wpmY,
        accuracy: item.accuracy,
        wpm: item.wpm,
        label: item.label,
      };
    });

    // Create line paths (only for points with data)
    const accuracyPolylinePoints = points
      .filter(p => p.accuracy > 0)
      .map(p => `${p.x},${p.accuracyY}`)
      .join(' ');

    const wpmPolylinePoints = points
      .filter(p => p.wpm > 0)
      .map(p => `${p.x},${p.wpmY}`)
      .join(' ');

    // Calculate accuracy trend
    const validAccuracyPoints = chartData.filter(d => d.accuracy > 0);
    const firstAccuracy = validAccuracyPoints[0]?.accuracy ?? 0;
    const lastAccuracy = validAccuracyPoints[validAccuracyPoints.length - 1]?.accuracy ?? 0;
    const accuracyTrend = lastAccuracy - firstAccuracy;
    const accuracyTrendPercentage =
      firstAccuracy !== 0 ? ((accuracyTrend / firstAccuracy) * 100).toFixed(1) : '0.0';
    const accuracyTrendDirection = accuracyTrend > 0 ? '↑' : accuracyTrend < 0 ? '↓' : '→';
    const accuracyTrendColor =
      accuracyTrend > 0 ? '#4CAF50' : accuracyTrend < 0 ? '#EF4444' : '#9CA3AF';

    // Calculate WPM trend
    const validWpmPoints = chartData.filter(d => d.wpm > 0);
    const firstWpm = validWpmPoints[0]?.wpm ?? 0;
    const lastWpm = validWpmPoints[validWpmPoints.length - 1]?.wpm ?? 0;
    const wpmTrend = lastWpm - firstWpm;
    const wpmTrendPercentage =
      firstWpm !== 0 ? ((wpmTrend / firstWpm) * 100).toFixed(1) : '0.0';
    const wpmTrendDirection = wpmTrend > 0 ? '↑' : wpmTrend < 0 ? '↓' : '→';
    const wpmTrendColor =
      wpmTrend > 0 ? '#4CAF50' : wpmTrend < 0 ? '#EF4444' : '#9CA3AF';

    return {
      minAccuracy,
      maxAccuracy,
      averageAccuracy,
      averageWpm,
      yAxisLabels,
      points,
      accuracyPolylinePoints,
      wpmPolylinePoints,
      accuracyTrendDirection,
      accuracyTrendPercentage,
      accuracyTrendColor,
      wpmTrendDirection,
      wpmTrendPercentage,
      wpmTrendColor,
    };
  }, [
    chartData,
    accuracyValues,
    wpmValues,
    hasData,
    paddingLeft,
    plotWidth,
    paddingTop,
    plotHeight,
    generateYAxisLabels,
  ]);

  const {
    averageAccuracy,
    averageWpm,
    yAxisLabels,
    points,
    accuracyPolylinePoints,
    wpmPolylinePoints,
    accuracyTrendDirection,
    accuracyTrendPercentage,
    accuracyTrendColor,
    wpmTrendDirection,
    wpmTrendPercentage,
    wpmTrendColor,
  } = chartCalculations;

  // Insight container styling based on trend
  const insightContainerStyle = useMemo(() => {
    switch (accuracyTrendDirection) {
      case '↑':
        return [styles.insightContainer, styles.insightContainerImproving];
      case '↓':
        return [styles.insightContainer, styles.insightContainerDeclining];
      default:
        return [styles.insightContainer, styles.insightContainerStable];
    }
  }, [accuracyTrendDirection]);

  const insightTextStyle = useMemo(() => {
    switch (accuracyTrendDirection) {
      case '↑':
        return styles.insightTextImproving;
      case '↓':
        return styles.insightTextDeclining;
      default:
        return styles.insightTextStable;
    }
  }, [accuracyTrendDirection]);

  // Generate insight message
  const insightMessage = useMemo(() => {
    if (!hasData) return '';

    const accuracyChange = Math.abs(parseFloat(accuracyTrendPercentage));
    const wpmChange = Math.abs(parseFloat(wpmTrendPercentage));

    switch (accuracyTrendDirection) {
      case '↑':
        return `Reading accuracy improved by ${accuracyChange}% and reading speed ${wpmTrendDirection === '↑' ? 'increased' : wpmTrendDirection === '↓' ? 'decreased' : 'remained stable'} by ${wpmChange}%, indicating ${wpmTrendDirection === '↑' ? 'excellent' : 'positive'} progress in reading performance.`;

      case '↓':
        return `Reading accuracy declined by ${accuracyChange}%, suggesting possible reading difficulties that may require targeted intervention.`;

      default:
        return 'Reading accuracy remained stable, indicating consistent reading performance over the selected period.';
    }
  }, [accuracyTrendDirection, accuracyTrendPercentage, wpmTrendDirection, wpmTrendPercentage, hasData]);

  // Render the chart SVG
  const renderChart = () => (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Grid lines at 10% intervals */}
      {yAxisLabels.map((label, index) => {
        const y = paddingTop + (index / (yAxisLabels.length - 1)) * plotHeight;
        return (
          <Line
            key={`grid-${label}`}
            x1={paddingLeft}
            y1={y}
            x2={paddingLeft + plotWidth}
            y2={y}
            stroke="#F3F4F6"
            strokeWidth="1"
          />
        );
      })}

      {/* Y-axis labels */}
      {yAxisLabels.map((label, index) => {
        const y = paddingTop + (index / (yAxisLabels.length - 1)) * plotHeight;
        return (
          <SvgText
            key={`y-label-${label}`}
            x={paddingLeft - 35}
            y={y + 4}
            fontSize="10"
            fill="#9CA3AF"
            textAnchor="end"
            fontFamily="Satoshi-Medium"
          >
            {label}%
          </SvgText>
        );
      })}

      {/* X-axis labels */}
      {points.map((point, index) => {
        // Show labels based on time range
        let showLabel = false;
        
        if (timeRange === 'week') {
          showLabel = true; // Show all days
        } else if (timeRange === 'month') {
          showLabel = index % 2 === 0 || index === points.length - 1; // Every other week
        } else if (timeRange === 'year') {
          showLabel = true; // Show all months (they're scrollable)
        }

        if (!showLabel) return null;

        return (
          <SvgText
            key={`x-label-${index}`}
            x={point.x}
            y={paddingTop + plotHeight + 20}
            fontSize="8"
            fill="#6B7280"
            textAnchor="middle"
            fontFamily="Satoshi-Medium"
          >
            {point.label}
          </SvgText>
        );
      })}

      {/* WPM line (behind accuracy) */}
      {wpmPolylinePoints && (
        <Polyline
          points={wpmPolylinePoints}
          fill="none"
          stroke="#FFA726"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      )}

      {/* Accuracy line */}
      {accuracyPolylinePoints && (
        <Polyline
          points={accuracyPolylinePoints}
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2.5"
        />
      )}

      {/* WPM data points with value labels */}
      {points.map((point, index) => (
        point.wpm > 0 && (
          <React.Fragment key={`wpm-point-${index}`}>
            <SvgText
              x={point.x}
              y={point.wpmY - 10}
              fontSize="9"
              fill="#FFA726"
              textAnchor="middle"
              fontFamily="Satoshi-Bold"
            >
              {point.wpm.toFixed(0)}
            </SvgText>
            <Circle
              cx={point.x}
              cy={point.wpmY}
              r="4"
              fill="#FFA726"
              stroke="#fff"
              strokeWidth="2"
            />
          </React.Fragment>
        )
      ))}

      {/* Accuracy data points with value labels */}
      {points.map((point, index) => (
        point.accuracy > 0 && (
          <React.Fragment key={`accuracy-point-${index}`}>
            <SvgText
              x={point.x}
              y={point.accuracyY - 10}
              fontSize="9"
              fill="#4CAF50"
              textAnchor="middle"
              fontFamily="Satoshi-Bold"
            >
              {point.accuracy.toFixed(1)}%
            </SvgText>
            <Circle
              cx={point.x}
              cy={point.accuracyY}
              r="5"
              fill="#4CAF50"
              stroke="#fff"
              strokeWidth="2"
            />
          </React.Fragment>
        )
      ))}
    </Svg>
  );

  // Loading state
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

  // Error state
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
            <Text style={styles.title}>Accuracy & Speed Trends</Text>
            <Text style={styles.subtitle}>
              {timeRange === 'week'
                ? 'Last 7 days'
                : timeRange === 'month'
                ? 'Last 4 weeks'
                : 'School Year (Jun - Aug)'}
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
                {averageAccuracy.toFixed(1)}
                <Text style={styles.statUnit}>%</Text>
              </Text>
              <Text style={styles.statLabel}>Avg Accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {averageWpm.toFixed(0)}
                <Text style={styles.statUnit}> WPM</Text>
              </Text>
              <Text style={styles.statLabel}>Avg Speed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accuracyTrendColor }]}>
                {accuracyTrendDirection} {Math.abs(parseFloat(accuracyTrendPercentage))}
                <Text style={styles.statUnit}>%</Text>
              </Text>
              <Text style={styles.statLabel}>Accuracy Trend</Text>
            </View>
          </View>

          {/* Insights */}
          <View style={insightContainerStyle}>
            <Text style={insightTextStyle}>{insightMessage}</Text>
          </View>

          {/* Chart - with conditional scrolling for year view */}
          <View style={styles.chartContainer}>
            {needsScroll ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
              >
                {renderChart()}
              </ScrollView>
            ) : (
              renderChart()
            )}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Accuracy Rate</Text>
            </View>
            <View style={styles.legendDivider} />
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFA726' }]} />
              <Text style={styles.legendText}>Reading Speed (WPM)</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // HEADER
  cardHeader: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // TIME RANGE SELECTOR
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 4,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rangeButtonText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  rangeButtonTextActive: {
    color: '#1F2937',
    fontFamily: 'Satoshi-Bold',
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
    textAlign: 'center',
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
  scrollView: {
    maxHeight: 260,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },

  // LEGEND
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  legendDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
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
});

export default StudentAccuracyTrendsChart;
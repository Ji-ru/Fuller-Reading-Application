// AccuracyTrends.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';

type TimeRange = 'week' | 'month' | 'year';

interface ClassOption {
  classId: string;
  className: string;
  gradeLevel: number;
}

interface AccuracyTrendsChartProps {
  facultyId?: string | null;
  filter: {
    academicYear: string;
    selectedView: string;
  };
  onFilterChange?: (filter: {
    academicYear: string;
    selectedView: string;
  }) => void;
  academicYears?: string[];
}

// Import your hooks
import { useAccuracyTrends } from '../../../Hooks/use_HooksAccuracyTrends';
import { useFacultyClassesFilter } from '../../../Hooks/use_ReadingStudentStats';

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

const AccuracyTrendsChart: React.FC<AccuracyTrendsChartProps> = ({
  facultyId = null,
  filter,
  onFilterChange,
  academicYears = [],
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [showClassModal, setShowClassModal] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const { academicYear, selectedView } = filter;
  const isOverall = selectedView === 'overall';

  // Fetch faculty classes for the modal using your existing hook
  const {
    classes: facultyClasses,
    loading: classesLoading,
    error: classesError,
  } = useFacultyClassesFilter(facultyId);

  // Find selected class name for display
  const selectedClassName = useMemo(() => {
    if (isOverall) return 'Overall Reading Health';
    const selectedClass = facultyClasses.find(c => c.classId === selectedView);
    return selectedClass?.className || 'Select Class';
  }, [isOverall, selectedView, facultyClasses]);

  // Determine if scrolling is needed for year view
  const needsScroll = timeRange === 'year';

  // Fetch real accuracy data based on parent filter
  const {
    chartData: accuracyData,
    loading,
    error,
  } = useAccuracyTrends(facultyId, {
    timeRange,
    filterType: isOverall ? 'overall' : 'class',
    classId: isOverall ? undefined : selectedView,
    academicYear,
  });

  const handleClassSelect = (classItem: ClassOption) => {
    setShowClassModal(false);
    onFilterChange?.({
      academicYear,
      selectedView: classItem.classId,
    });
  };

  const handleFilterTypeChange = (type: 'overall' | 'class') => {
    onFilterChange?.({
      academicYear,
      selectedView: type === 'overall' ? 'overall' : selectedView,
    });
    setShowFilterDropdown(false);
  };

  const handleAcademicYearChange = (year: string) => {
    onFilterChange?.({
      academicYear: year,
      selectedView: 'overall', // Reset to overall when changing year
    });
    setShowYearDropdown(false);
  };

  // Transform accuracy data for the chart (memoized)
  const chartData = useMemo(
    () =>
      accuracyData.map(item => ({
        label: item.date, // Already formatted label from hook
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
  const baseChartWidth = 320;
  // For year: 50px per month ensures all labels fit nicely
  const chartWidth = needsScroll 
    ? Math.max(chartData.length * 50, 600) 
    : baseChartWidth;
  
  const chartHeight = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Generate Y-axis labels: 0%, 20%, 40%, 60%, 80%, 100%
  const generateYAxisLabels = useCallback(() => {
    const labels = [];
    for (let i = 100; i >= 0; i -= 20) {
      labels.push(i);
    }
    return labels;
  }, []);

  // Calculate chart calculations only once, regardless of data state
  const chartCalculations = useMemo(() => {
    if (!hasData) {
      return {
        minValue: 0,
        maxValue: 0,
        average: 0,
        yAxisLabels: generateYAxisLabels(),
        points: [],
        polylinePoints: '',
        trendDirection: '→' as const,
        trendPercentage: '0.0',
        trendColor: '#9CA3AF' as const,
      };
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const yAxisMin = 0; // Always start at 0 for accuracy percentage
    const yAxisMax = 100; // Always end at 100 for accuracy percentage
    const yRange = yAxisMax - yAxisMin || 1;

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    const yAxisLabels = generateYAxisLabels();

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

      return { x, y, value: item.value, label: item.label };
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
  }, [chartData, values, hasData, generateYAxisLabels]);

  const {
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

  // Render the chart SVG
  const renderChart = () => (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Grid lines */}
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
            key={`ylabel-${label}`}
            x={paddingLeft - 10}
            y={y + 5}
            fontSize="10"
            fill="#6B7280"
            textAnchor="end"
            fontFamily="Satoshi-Bold"
          >
            {label}%
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

      {/* Data points with value labels */}
      {points
        .filter(point => point.value > 0)
        .map((point, index) => (
          <React.Fragment key={`point-${index}`}>
            <SvgText
              x={point.x}
              y={point.y - 12}
              fontSize="9"
              fill="#4CAF50"
              textAnchor="middle"
              fontFamily="Satoshi-Bold"
            >
              {point.value.toFixed(1)}%
            </SvgText>
            <Circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#4CAF50"
              stroke="#fff"
              strokeWidth="2"
            />
          </React.Fragment>
        ))}

      {/* X-axis labels */}
      {points.map((point, index) => {
        // Show labels based on time range to avoid overcrowding
        let showLabel = false;
        
        if (timeRange === 'week') {
          showLabel = true; // Show all days
        } else if (timeRange === 'month') {
          showLabel = true // Every week
        } else if (timeRange === 'year') {
          showLabel = true; // Show all months (they're scrollable)
        }

        if (!showLabel) return null;

        return (
          <SvgText
            key={`xlabel-${index}`}
            x={point.x}
            y={chartHeight - 10}
            fontSize="9"
            fill="#6B7280"
            textAnchor="middle"
            fontFamily="Satoshi-Bold"
          >
            {point.label}
          </SvgText>
        );
      })}
    </Svg>
  );

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
              <Text style={styles.title}>Accuracy Trends</Text>
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
              <Text style={styles.title}>Accuracy Trends</Text>
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
      {/* FILTER SECTION */}
      {/* <View style={styles.filterSection}>
        <View style={styles.filtersRow}> */}
          {/* Filter Type (Overall/Class) */}
          {/* <View style={styles.filterItem}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText} numberOfLines={1}>
                {isOverall ? '📊 Overall' : `📚 ${selectedClassName}`}
              </Text>
              <Text style={styles.filterArrow}>
                {showFilterDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showFilterDropdown && (
              <View style={styles.filterDropdownMenu}>
                <TouchableOpacity
                  style={[
                    styles.filterDropdownOption,
                    isOverall && styles.filterDropdownOptionSelected,
                  ]}
                  onPress={() => handleFilterTypeChange('overall')}
                >
                  <Text
                    style={[
                      styles.filterDropdownOptionText,
                      isOverall && styles.filterDropdownOptionTextSelected,
                    ]}
                  >
                    📊 Overall
                  </Text>
                </TouchableOpacity>
                
                {facultyClasses.length > 0 && (
                  <TouchableOpacity
                    style={[
                      styles.filterDropdownOption,
                      !isOverall && styles.filterDropdownOptionSelected,
                    ]}
                    onPress={() => {
                      setShowClassModal(true);
                      setShowFilterDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterDropdownOptionText,
                        !isOverall && styles.filterDropdownOptionTextSelected,
                      ]}
                    >
                      📚 Select Class...
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View> */}

          {/* Academic Year Filter */}
          {/* {academicYears.length > 0 && (
            <View style={styles.filterItem}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowYearDropdown(!showYearDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.filterButtonText}>
                  {academicYear || 'All Years'}
                </Text>
                <Text style={styles.filterArrow}>
                  {showYearDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showYearDropdown && (
                <View style={styles.filterDropdownMenu}>
                  <ScrollView>
                    <TouchableOpacity
                      style={[
                        styles.filterDropdownOption,
                        !academicYear && styles.filterDropdownOptionSelected,
                      ]}
                      onPress={() => handleAcademicYearChange('')}
                    >
                      <Text
                        style={[
                          styles.filterDropdownOptionText,
                          !academicYear && styles.filterDropdownOptionTextSelected,
                        ]}
                      >
                        All Years
                      </Text>
                    </TouchableOpacity>

                    {academicYears.map((year: string) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.filterDropdownOption,
                          academicYear === year && styles.filterDropdownOptionSelected,
                        ]}
                        onPress={() => handleAcademicYearChange(year)}
                      >
                        <Text
                          style={[
                            styles.filterDropdownOptionText,
                            academicYear === year && styles.filterDropdownOptionTextSelected,
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )} */}
        {/* </View>
      </View> */}

      {/* CHART CARD */}
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrapper}>
              <Text style={styles.titleIcon}>📊</Text>
            </View>
            <View style={styles.titleContent}>
              <Text style={styles.title}>Accuracy Trends</Text>
              <Text style={styles.subtitle}>
                {!isOverall && `Class: ${selectedClassName} • `}
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
            <Text style={styles.noDataText}>
              {!isOverall
                ? `No reading reports found for ${selectedClassName}`
                : 'No reading reports found for the selected period'}
            </Text>
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
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Reading Accuracy</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Class Selection Modal */}
      <Modal
        visible={showClassModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClassModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrapper}>
                <Text style={styles.modalIcon}>📚</Text>
                <Text style={styles.modalTitle}>Select Class</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowClassModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {classesLoading ? (
              <View style={styles.loadingContainerModal}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingTextModal}>Loading classes...</Text>
              </View>
            ) : classesError ? (
              <View style={styles.errorContainerModal}>
                <Text style={styles.errorTextModal}>Error loading classes</Text>
                <Text style={styles.errorSubtextModal}>{classesError}</Text>
              </View>
            ) : facultyClasses.length === 0 ? (
              <View style={styles.noClassesContainer}>
                <Text style={styles.noClassesText}>No classes found</Text>
                {facultyId && (
                  <Text style={styles.noClassesSubtext}>
                    This faculty doesn't have any classes assigned yet.
                  </Text>
                )}
              </View>
            ) : (
              <FlatList
                data={facultyClasses}
                keyExtractor={item => item.classId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.classItem,
                      selectedView === item.classId && styles.selectedClassItem,
                    ]}
                    onPress={() => handleClassSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.classItemContent}>
                      <View style={styles.classItemIcon}>
                        <Text style={styles.classItemIconText}>📚</Text>
                      </View>
                      <View style={styles.classItemText}>
                        <Text style={styles.className}>{item.className}</Text>
                        <Text style={styles.gradeLevel}>
                          Grade {item.gradeLevel}
                        </Text>
                      </View>
                    </View>
                    {selectedView === item.classId && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.classList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // FILTER SECTION
  filterSection: {
    marginBottom: 16,
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
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
    width: 48,
    height: 48,
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

  // STATS ROW
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
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },

  // INSIGHTS
  insightContainer: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
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
    maxHeight: 220,
  },
  scrollContent: {
    paddingHorizontal: 8,
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
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
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

export default AccuracyTrendsChart;


// components/Admin/AccuracyTrendsChart.tsx
// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   FlatList,
//   ScrollView,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
// import { useAccuracyTrends } from '../../../Hooks/use_AccuracyTrends';
// import { useFacultyClassesFilter } from '../../../Hooks/use_ReadingStudentStats';

// /** Time range options for the chart */
// type TimeRange = 'week' | 'month' | 'year';

// /** Class option structure for the modal */
// interface ClassOption {
//   classId: string;
//   className: string;
//   gradeLevel: number;
// }

// /** Props for the AccuracyTrendsChart component */
// interface AccuracyTrendsChartProps {
//   /** Faculty ID to fetch classes and data */
//   facultyId?: string | null;
//   /** Current filter state from parent */
//   filter: {
//     academicYear: string;
//     selectedView: string; // 'overall' or classId
//   };
//   /** Callback when filters change */
//   onFilterChange?: (filter: { academicYear: string; selectedView: string }) => void;
//   /** List of available academic years */
//   academicYears?: string[];
// }

// /** Time range selector labels and values */
// const TIME_RANGES: { label: string; value: TimeRange }[] = [
//   { label: 'Week', value: 'week' },
//   { label: 'Month', value: 'month' },
//   { label: 'Year', value: 'year' },
// ];

// const screenWidth = Dimensions.get('window').width;

// /**
//  * Chart configuration for react-native-chart-kit LineChart
//  */
// const chartConfig = {
//   backgroundColor: '#FFFFFF',
//   backgroundGradientFrom: '#FFFFFF',
//   backgroundGradientTo: '#FFFFFF',
//   decimalPlaces: 1,
//   color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green line
//   labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
//   style: { borderRadius: 16 },
//   propsForDots: {
//     r: '5',
//     strokeWidth: '2',
//     stroke: '#4CAF50',
//   },
//   propsForLabels: {
//     fontFamily: 'Satoshi-Medium',
//     fontSize: 10,
//   },
//   formatYLabel: (yValue: string) => `${Math.round(Number(yValue))}%`,
// };

// /**
//  * AccuracyTrendsChart
//  *
//  * Displays a line chart of reading accuracy over time (week/month/year).
//  * Allows filtering by overall or specific class, and by academic year.
//  * Uses react-native-chart-kit for the chart rendering.
//  */
// const AccuracyTrendsChart: React.FC<AccuracyTrendsChartProps> = ({
//   facultyId = null,
//   filter,
//   onFilterChange,
//   academicYears = [],
// }) => {
//   const [timeRange, setTimeRange] = useState<TimeRange>('week');
//   const [showClassModal, setShowClassModal] = useState(false);
//   const [showYearDropdown, setShowYearDropdown] = useState(false);
//   const [showFilterDropdown, setShowFilterDropdown] = useState(false);

//   const { academicYear, selectedView } = filter;
//   const isOverall = selectedView === 'overall';

//   // Fetch faculty classes for the modal
//   const {
//     classes: facultyClasses,
//     loading: classesLoading,
//     error: classesError,
//   } = useFacultyClassesFilter(facultyId);

//   // Find selected class name for display
//   const selectedClassName = useMemo(() => {
//     if (isOverall) return 'Overall Reading Health';
//     const selectedClass = facultyClasses.find(
//       (c: ClassOption) => c.classId === selectedView
//     );
//     return selectedClass?.className || 'Select Class';
//   }, [isOverall, selectedView, facultyClasses]);

//   // Fetch accuracy data
//   const {
//     chartData: accuracyData,
//     loading,
//     error,
//   } = useAccuracyTrends(facultyId, {
//     timeRange,
//     filterType: isOverall ? 'overall' : 'class',
//     classId: isOverall ? undefined : selectedView,
//     academicYear,
//   });

//   // Transform data for LineChart
//   const chartLabels = useMemo(
//     () => accuracyData.map((item: { date: string }) => item.date),
//     [accuracyData]
//   );
//   const chartValues = useMemo(
//     () => accuracyData.map((item: { accuracy: number }) => item.accuracy),
//     [accuracyData]
//   );

//   const hasData = chartValues.some((v: number) => v > 0);

//   // Compute statistics (average, trend)
//   const statistics = useMemo(() => {
//     if (!hasData) {
//       return {
//         average: 0,
//         trendDirection: '→' as const,
//         trendPercentage: '0.0',
//         trendColor: '#9CA3AF',
//         insightMessage: '',
//       };
//     }

//     const validValues = chartValues.filter((v: number) => v > 0);
//     const average = validValues.reduce((sum: number, v: number) => sum + v, 0) / validValues.length;

//     const firstValue = validValues[0] ?? 0;
//     const lastValue = validValues[validValues.length - 1] ?? 0;
//     const trend = lastValue - firstValue;
//     const trendPercentage =
//       firstValue !== 0 ? ((trend / firstValue) * 100).toFixed(1) : '0.0';
//     const trendDirection = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
//     const trendColor = trend > 0 ? '#4CAF50' : trend < 0 ? '#EF4444' : '#9CA3AF';

//     const change = Math.abs(parseFloat(trendPercentage));
//     let insightMessage = '';
//     if (trendDirection === '↑') {
//       insightMessage = `Reading accuracy improved by ${change}%, indicating positive progress in students’ reading performance over the selected period.`;
//     } else if (trendDirection === '↓') {
//       insightMessage = `Reading accuracy declined by ${change}%, suggesting possible reading difficulties that may require targeted intervention.`;
//     } else {
//       insightMessage = 'Reading accuracy remained stable, indicating consistent reading performance over the selected period.';
//     }

//     return {
//       average,
//       trendDirection,
//       trendPercentage,
//       trendColor,
//       insightMessage,
//     };
//   }, [chartValues, hasData]);

//   const { average, trendDirection, trendPercentage, trendColor, insightMessage } = statistics;

//   // Determine if chart needs horizontal scrolling (for year view with many months)
//   const needsScroll = timeRange === 'year' && chartLabels.length > 8;
//   const chartWidth = needsScroll ? Math.max(chartLabels.length * 50, screenWidth - 64) : screenWidth - 64;

//   // Handlers
//   const handleClassSelect = (classItem: ClassOption) => {
//     setShowClassModal(false);
//     onFilterChange?.({
//       academicYear,
//       selectedView: classItem.classId,
//     });
//   };

//   const handleFilterTypeChange = (type: 'overall' | 'class') => {
//     onFilterChange?.({
//       academicYear,
//       selectedView: type === 'overall' ? 'overall' : selectedView,
//     });
//     setShowFilterDropdown(false);
//   };

//   const handleAcademicYearChange = (year: string) => {
//     onFilterChange?.({
//       academicYear: year,
//       selectedView: 'overall',
//     });
//     setShowYearDropdown(false);
//   };

//   // Style helper for insight container – flatten the base style with conditional styles
//   const insightContainerStyle = useMemo(() => {
//     if (trendDirection === '↑') {
//       return StyleSheet.flatten([styles.insightContainer, styles.insightContainerImproving]);
//     } else if (trendDirection === '↓') {
//       return StyleSheet.flatten([styles.insightContainer, styles.insightContainerDeclining]);
//     } else {
//       return StyleSheet.flatten([styles.insightContainer, styles.insightContainerStable]);
//     }
//   }, [trendDirection]);

//   const insightTextStyle = useMemo(() => {
//     if (trendDirection === '↑') return styles.insightTextImproving;
//     if (trendDirection === '↓') return styles.insightTextDeclining;
//     return styles.insightTextStable;
//   }, [trendDirection]);

//   // Render loading/error states
//   if (loading) {
//     return (
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <View style={styles.titleRow}>
//             <View style={styles.iconWrapper}>
//               <Text style={styles.titleIcon}>📊</Text>
//             </View>
//             <View style={styles.titleContent}>
//               <Text style={styles.title}>Accuracy Trends</Text>
//               <Text style={styles.subtitle}>Loading data...</Text>
//             </View>
//           </View>
//         </View>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//           <Text style={styles.loadingText}>Loading accuracy data...</Text>
//         </View>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <View style={styles.titleRow}>
//             <View style={styles.iconWrapper}>
//               <Text style={styles.titleIcon}>📊</Text>
//             </View>
//             <View style={styles.titleContent}>
//               <Text style={styles.title}>Accuracy Trends</Text>
//               <Text style={styles.subtitle}>Error loading data</Text>
//             </View>
//           </View>
//         </View>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Failed to load data</Text>
//           <Text style={styles.errorSubtext}>{error}</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View>
//       {/* Filter UI (commented out in original, but can be added back if needed) */}
//       {/* ... filter section ... */}

//       {/* Main Card */}
//       <View style={styles.card}>
//         {/* Header with title and time range selector */}
//         <View style={styles.cardHeader}>
//           <View style={styles.titleRow}>
//             <View style={styles.iconWrapper}>
//               <Text style={styles.titleIcon}>📊</Text>
//             </View>
//             <View style={styles.titleContent}>
//               <Text style={styles.title}>Accuracy Trends</Text>
//               <Text style={styles.subtitle}>
//                 {!isOverall && `Class: ${selectedClassName} • `}
//                 {timeRange === 'week'
//                   ? 'Last 7 days'
//                   : timeRange === 'month'
//                   ? 'Last 4 weeks'
//                   : 'School Year (Jun - Aug)'}
//               </Text>
//             </View>
//           </View>

//           {/* Time Range Selector */}
//           <View style={styles.rangeSelector}>
//             {TIME_RANGES.map(range => (
//               <TouchableOpacity
//                 key={range.value}
//                 onPress={() => setTimeRange(range.value)}
//                 style={[
//                   styles.rangeButton,
//                   timeRange === range.value && styles.rangeButtonActive,
//                 ]}
//                 activeOpacity={0.7}
//               >
//                 <Text
//                   style={[
//                     styles.rangeButtonText,
//                     timeRange === range.value && styles.rangeButtonTextActive,
//                   ]}
//                 >
//                   {range.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {!hasData ? (
//           <View style={styles.noDataContainer}>
//             <Text style={styles.noDataIcon}>📊</Text>
//             <Text style={styles.noDataTitle}>No data of student yet</Text>
//             <Text style={styles.noDataText}>
//               {!isOverall
//                 ? `No reading reports found for ${selectedClassName}`
//                 : 'No reading reports found for the selected period'}
//             </Text>
//           </View>
//         ) : (
//           <>
//             {/* Stats Summary */}
//             <View style={styles.statsRow}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statValue}>
//                   {average.toFixed(1)}
//                   <Text style={styles.statUnit}>%</Text>
//                 </Text>
//                 <Text style={styles.statLabel}>Average</Text>
//               </View>
//               <View style={styles.statDivider} />
//               <View style={styles.statItem}>
//                 <Text style={[styles.statValue, { color: trendColor }]}>
//                   {trendDirection} {Math.abs(parseFloat(trendPercentage))}
//                   <Text style={styles.statUnit}>%</Text>
//                 </Text>
//                 <Text style={styles.statLabel}>Trend</Text>
//               </View>
//             </View>

//             {/* Performance Insights */}
//             <View style={insightContainerStyle}>
//               <Text style={insightTextStyle}>{insightMessage}</Text>
//             </View>

//             {/* Chart */}
//             <View style={styles.chartContainer}>
//               {needsScroll ? (
//                 <ScrollView horizontal showsHorizontalScrollIndicator>
//                   <LineChart
//                     data={{
//                       labels: chartLabels,
//                       datasets: [{ data: chartValues }],
//                     }}
//                     width={chartWidth}
//                     height={200}
//                     chartConfig={chartConfig}
//                     bezier
//                     style={{ borderRadius: 16 }}
//                     formatYLabel={(y) => `${Math.round(Number(y))}%`}
//                     yAxisLabel=""
//                     yAxisSuffix=""
//                     fromZero
//                     segments={5}
//                   />
//                 </ScrollView>
//               ) : (
//                 <LineChart
//                   data={{
//                     labels: chartLabels,
//                     datasets: [{ data: chartValues }],
//                   }}
//                   width={chartWidth}
//                   height={200}
//                   chartConfig={chartConfig}
//                   bezier
//                   style={{ borderRadius: 16 }}
//                   formatYLabel={(y) => `${Math.round(Number(y))}%`}
//                   yAxisLabel=""
//                   yAxisSuffix=""
//                   fromZero
//                   segments={5}
//                 />
//               )}
//             </View>

//             {/* Legend */}
//             <View style={styles.legend}>
//               <View style={styles.legendItem}>
//                 <View style={styles.legendDot} />
//                 <Text style={styles.legendText}>Reading Accuracy</Text>
//               </View>
//             </View>
//           </>
//         )}
//       </View>

//       {/* Class Selection Modal */}
//       <Modal
//         visible={showClassModal}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setShowClassModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <View style={styles.modalTitleWrapper}>
//                 <Text style={styles.modalIcon}>📚</Text>
//                 <Text style={styles.modalTitle}>Select Class</Text>
//               </View>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => setShowClassModal(false)}
//               >
//                 <Text style={styles.closeButtonText}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             {classesLoading ? (
//               <View style={styles.loadingContainerModal}>
//                 <ActivityIndicator size="small" color="#4CAF50" />
//                 <Text style={styles.loadingTextModal}>Loading classes...</Text>
//               </View>
//             ) : classesError ? (
//               <View style={styles.errorContainerModal}>
//                 <Text style={styles.errorTextModal}>Error loading classes</Text>
//                 <Text style={styles.errorSubtextModal}>{classesError}</Text>
//               </View>
//             ) : facultyClasses.length === 0 ? (
//               <View style={styles.noClassesContainer}>
//                 <Text style={styles.noClassesText}>No classes found</Text>
//                 {facultyId && (
//                   <Text style={styles.noClassesSubtext}>
//                     This faculty doesn't have any classes assigned yet.
//                   </Text>
//                 )}
//               </View>
//             ) : (
//               <FlatList
//                 data={facultyClasses}
//                 keyExtractor={item => item.classId}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={[
//                       styles.classItem,
//                       selectedView === item.classId && styles.selectedClassItem,
//                     ]}
//                     onPress={() => handleClassSelect(item)}
//                     activeOpacity={0.7}
//                   >
//                     <View style={styles.classItemContent}>
//                       <View style={styles.classItemIcon}>
//                         <Text style={styles.classItemIconText}>📚</Text>
//                       </View>
//                       <View style={styles.classItemText}>
//                         <Text style={styles.className}>{item.className}</Text>
//                         <Text style={styles.gradeLevel}>
//                           Grade {item.gradeLevel}
//                         </Text>
//                       </View>
//                     </View>
//                     {selectedView === item.classId && (
//                       <View style={styles.checkmark}>
//                         <Text style={styles.checkmarkText}>✓</Text>
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 )}
//                 contentContainerStyle={styles.classList}
//                 showsVerticalScrollIndicator={false}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// // Styles – unchanged from original (keep as provided)
// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//   },
//   cardHeader: {
//     marginBottom: 20,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   iconWrapper: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     backgroundColor: '#E8F5E9',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   titleIcon: {
//     fontSize: 24,
//   },
//   titleContent: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 18,
//     fontFamily: 'Satoshi-Bold',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 13,
//     fontFamily: 'Satoshi-Medium',
//     color: '#6B7280',
//   },
//   rangeSelector: {
//     flexDirection: 'row',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 10,
//     padding: 4,
//   },
//   rangeButton: {
//     flex: 1,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   rangeButtonActive: {
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   rangeButtonText: {
//     fontSize: 13,
//     fontFamily: 'Satoshi-Medium',
//     color: '#6B7280',
//   },
//   rangeButtonTextActive: {
//     color: '#1F2937',
//     fontFamily: 'Satoshi-Bold',
//   },
//   statsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statValue: {
//     fontSize: 20,
//     fontFamily: 'Satoshi-Bold',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   statUnit: {
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#6B7280',
//   },
//   statLabel: {
//     fontSize: 11,
//     fontFamily: 'Satoshi-Medium',
//     color: '#6B7280',
//   },
//   statDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: '#E5E7EB',
//     marginHorizontal: 8,
//   },
//   insightContainer: {
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//   },
//   insightContainerImproving: {
//     backgroundColor: '#F0FDF4',
//     borderLeftColor: '#4CAF50',
//   },
//   insightContainerDeclining: {
//     backgroundColor: '#FEF2F2',
//     borderLeftColor: '#EF4444',
//   },
//   insightContainerStable: {
//     backgroundColor: '#F3F4F6',
//     borderLeftColor: '#9CA3AF',
//   },
//   insightTextImproving: {
//     fontSize: 13,
//     fontFamily: 'Satoshi-Medium',
//     color: '#166534',
//     lineHeight: 18,
//   },
//   insightTextDeclining: {
//     fontSize: 13,
//     fontFamily: 'Satoshi-Medium',
//     color: '#991B1B',
//     lineHeight: 18,
//   },
//   insightTextStable: {
//     fontSize: 13,
//     fontFamily: 'Satoshi-Medium',
//     color: '#374151',
//     lineHeight: 18,
//   },
//   chartContainer: {
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   legend: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#F3F4F6',
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   legendDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#4CAF50',
//     marginRight: 6,
//   },
//   legendText: {
//     fontSize: 11,
//     fontFamily: 'Satoshi-Medium',
//     color: '#6B7280',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#6B7280',
//   },
//   loadingContainerModal: {
//     padding: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingTextModal: {
//     marginTop: 12,
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#6B7280',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   errorText: {
//     fontSize: 16,
//     fontFamily: 'Satoshi-Bold',
//     color: '#EF4444',
//     marginBottom: 8,
//   },
//   errorSubtext: {
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#9CA3AF',
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   errorContainerModal: {
//     padding: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorTextModal: {
//     fontSize: 16,
//     fontFamily: 'Satoshi-Bold',
//     color: '#EF4444',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   errorSubtextModal: {
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#9CA3AF',
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   noDataContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   noDataIcon: {
//     fontSize: 48,
//     marginBottom: 16,
//     opacity: 0.5,
//   },
//   noDataTitle: {
//     fontSize: 18,
//     fontFamily: 'Satoshi-Bold',
//     color: '#6B7280',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   noDataText: {
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#9CA3AF',
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   noClassesContainer: {
//     padding: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   noClassesText: {
//     fontSize: 16,
//     fontFamily: 'Satoshi-Bold',
//     color: '#6B7280',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   noClassesSubtext: {
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#9CA3AF',
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '70%',
//     paddingBottom: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 24,
//     paddingBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   modalTitleWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   modalIcon: {
//     fontSize: 24,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontFamily: 'Satoshi-Bold',
//     color: '#1F2937',
//   },
//   closeButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#F3F4F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     fontSize: 18,
//     color: '#6B7280',
//     fontFamily: 'Satoshi-Bold',
//   },
//   classList: {
//     padding: 20,
//     paddingBottom: 10,
//   },
//   classItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 10,
//   },
//   selectedClassItem: {
//     backgroundColor: '#E8F5E9',
//     borderWidth: 2,
//     borderColor: '#4CAF50',
//   },
//   classItemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   classItemIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 10,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   classItemIconText: {
//     fontSize: 20,
//   },
//   classItemText: {
//     flex: 1,
//   },
//   className: {
//     fontSize: 16,
//     fontFamily: 'Satoshi-Bold',
//     color: '#1F2937',
//     marginBottom: 2,
//   },
//   gradeLevel: {
//     fontSize: 13,
//     fontFamily: 'Satoshi-Medium',
//     color: '#6B7280',
//   },
//   checkmark: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkmarkText: {
//     fontSize: 16,
//     color: '#fff',
//     fontFamily: 'Satoshi-Bold',
//   },
// });

// export default AccuracyTrendsChart;
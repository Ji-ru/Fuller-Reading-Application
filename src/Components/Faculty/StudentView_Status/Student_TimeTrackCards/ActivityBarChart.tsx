import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface ActivityBarChartProps {
  data: { label: string; value: number }[];
  maxValue: number;
  unit: 'hr' | 'min';
}

export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({
  data,
  maxValue,
  unit,
}) => {
  const chartHeight = 180;
  const minBarHeight = 4; // Minimum visible height for bars with data
  
  // Define a reasonable threshold based on the unit
  // For minutes: cap at a reasonable max (e.g., 120 minutes = 2 hours)
  // For hours: cap at a reasonable max (e.g., 8 hours)
  const getThreshold = () => {
    if (unit === 'min') {
      return Math.min(maxValue, 120); // Cap at 120 minutes
    } else {
      return Math.min(maxValue, 8); // Cap at 8 hours
    }
  };

  const threshold = getThreshold();
  const displayMaxValue = threshold > 0 ? threshold : maxValue;

  // Calculate if we need scrolling (for many data points)
  const needsScroll = data.length > 12;

  // Generate Y-axis labels based on threshold
  const getYAxisLabels = () => {
    const labels = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const value = (displayMaxValue / steps) * (steps - i);
      labels.push(value);
    }
    return labels;
  };

  const yAxisLabels = getYAxisLabels();

  const renderChart = () => (
    <View style={styles.chartArea}>
      {/* Y-Axis */}
      <View style={styles.yAxis}>
        {yAxisLabels.map((label, index) => (
          <View key={index} style={styles.yAxisLabelContainer}>
            <Text style={styles.yAxisLabel}>
              {label.toFixed(2)}
              <Text style={styles.yAxisUnit}>{unit}</Text>
            </Text>
          </View>
        ))}
      </View>

      {/* Chart with bars */}
      <View style={styles.chartContent}>
        {/* Grid lines */}
        <View style={styles.gridContainer}>
          {yAxisLabels.map((_, index) => (
            <View key={index} style={styles.gridLine} />
          ))}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            // Calculate height with threshold
            let barHeight;
            if (item.value === 0) {
              barHeight = 0;
            } else if (item.value >= displayMaxValue) {
              // If value exceeds threshold, use full height
              barHeight = chartHeight;
            } else {
              // Normal scaling within threshold
              barHeight = Math.max(
                (item.value / displayMaxValue) * chartHeight,
                minBarHeight
              );
            }

            const isOverThreshold = item.value > displayMaxValue;

            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  {/* Value label on top of bar */}
                  {item.value > 0 && (
                    <View style={styles.valueContainer}>
                      <Text style={[
                        styles.valueText,
                        isOverThreshold && styles.valueTextWarning
                      ]}>
                        {item.value.toFixed(2)}
                        {isOverThreshold && '+'}
                      </Text>
                    </View>
                  )}
                  
                  {/* Bar */}
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight },
                      isOverThreshold && styles.barOverThreshold,
                      item.value === 0 && styles.barEmpty,
                    ]}
                  >
                    {/* Gradient effect for over-threshold bars */}
                    {isOverThreshold && (
                      <View style={styles.barOverThresholdIndicator} />
                    )}
                  </View>
                </View>

                {/* X-axis label */}
                <Text style={styles.xAxisLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotNormal]} />
          <Text style={styles.legendText}>Active {unit === 'hr' ? 'Hours' : 'Minutes'}</Text>
        </View>
        {data.some(item => item.value > displayMaxValue) && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotOverThreshold]} />
            <Text style={styles.legendText}>Over {displayMaxValue}{unit}</Text>
          </View>
        )}
      </View>

      {/* Chart */}
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

      {/* Info text for threshold */}
      {data.some(item => item.value > displayMaxValue) && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Values above {displayMaxValue}{unit} are capped for display
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  
  // LEGEND
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotNormal: {
    backgroundColor: '#4CAF50',
  },
  legendDotOverThreshold: {
    backgroundColor: '#F59E0B',
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // SCROLL VIEW
  scrollView: {
    maxHeight: 240,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },

  // CHART AREA
  chartArea: {
    flexDirection: 'row',
    height: 220,
  },

  // Y-AXIS
  yAxis: {
    width: 40,
    height: 180,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 24,
  },
  yAxisLabelContainer: {
    height: 20,
    justifyContent: 'center',
  },
  yAxisLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
    textAlign: 'right',
  },
  yAxisUnit: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
  },

  // CHART CONTENT
  chartContent: {
    flex: 1,
    position: 'relative',
  },

  // GRID LINES
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  // BARS CONTAINER
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: 4,
    minWidth: 300, // Minimum width for scrollable content
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    minWidth: 40,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 160,
    marginBottom: 4,
  },

  // VALUE LABEL
  valueContainer: {
    marginBottom: 4,
  },
  valueText: {
    fontSize: 10,
    fontFamily: 'Satoshi-Bold',
    color: '#4CAF50',
  },
  valueTextWarning: {
    color: '#F59E0B',
  },

  // BAR STYLES
  bar: {
    width: 24,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    minHeight: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  barEmpty: {
    backgroundColor: '#E5E7EB',
    minHeight: 2,
    shadowOpacity: 0,
  },
  barOverThreshold: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  barOverThresholdIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#EF4444',
  },

  // X-AXIS LABEL
  xAxisLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 50,
  },

  // INFO CONTAINER
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    gap: 6,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#92400E',
  },
});

export default ActivityBarChart;
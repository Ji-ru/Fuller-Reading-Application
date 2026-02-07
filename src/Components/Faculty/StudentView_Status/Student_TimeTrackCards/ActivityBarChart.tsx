import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface ActivityBarChartProps {
  data: { label: string; value: number }[];
  maxValue: number;
  unit: 'hr' | 'min';
}

/** Get a "nice" ceiling for chart scale so bars never overflow the Y-axis */
function getNiceMax(value: number, unit: 'hr' | 'min'): number {
  if (value <= 0) return unit === 'min' ? 60 : 1;
  const step = unit === 'min' ? 15 : 0.5;
  const raw = Math.ceil(value / step) * step;
  return Math.max(raw, step);
}

export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({
  data,
  maxValue,
  unit,
}) => {
  const chartHeight = 180;
  const minBarHeight = 4;

  // Y-axis scale: always accommodate max value so bars never overflow
  const displayMaxValue = getNiceMax(maxValue, unit);

  // Calculate if we need scrolling (for many data points)
  const needsScroll = data.length > 12;

  // Generate Y-axis labels (top to bottom: max to 0); use clean numbers
  const getYAxisLabels = () => {
    const steps = 4;
    const labels: number[] = [];
    for (let i = 0; i <= steps; i++) {
      labels.push((displayMaxValue / steps) * (steps - i));
    }
    return labels;
  };

  const formatYLabel = (val: number) =>
    Number.isInteger(val) ? String(val) : val.toFixed(0);

  const yAxisLabels = getYAxisLabels();

  const renderChart = () => (
    <View style={styles.chartArea}>
      {/* Y-Axis – redesigned layout */}
      <View style={styles.yAxis}>
        <View style={styles.yAxisLabelsWrapper}>
          {yAxisLabels.map((label, index) => (
            <View key={index} style={styles.yAxisTickRow}>
              <View style={styles.yAxisTick} />
              <Text style={styles.yAxisLabel}>
                {formatYLabel(label)}
                <Text style={styles.yAxisUnit}> {unit}</Text>
              </Text>
            </View>
          ))}
        </View>
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
            // Scale bars to fit Y-axis; displayMaxValue is always >= max data value
            const barHeight =
              item.value === 0
                ? 0
                : Math.max(
                    (item.value / displayMaxValue) * chartHeight,
                    minBarHeight,
                  );

            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  {/* Value label on top of bar */}
                  {item.value > 0 && (
                    <View style={styles.valueContainer}>
                      <Text style={styles.valueText}>
                        {item.value.toFixed(2)}
                      </Text>
                    </View>
                  )}

                  {/* Bar */}
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight },
                      item.value === 0 && styles.barEmpty,
                    ]}
                  />
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

  // Y-AXIS – redesigned layout
  yAxis: {
    width: 52,
    height: 180,
    paddingRight: 12,
    paddingBottom: 24,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  yAxisLabelsWrapper: {
    flex: 1,
    height: 180,
    justifyContent: 'space-between',
  },
  yAxisTickRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisTick: {
    width: 6,
    height: 1,
    backgroundColor: '#D1D5DB',
    marginRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    textAlign: 'right',
  },
  yAxisUnit: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
    fontWeight: '500',
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

  // X-AXIS LABEL
  xAxisLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 50,
  },
});

export default ActivityBarChart;
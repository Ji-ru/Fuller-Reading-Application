// components/PieChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.8;
const CHART_RADIUS = CHART_SIZE / 2;
const STROKE_WIDTH = 50;
const INNER_RADIUS = CHART_RADIUS - STROKE_WIDTH;

interface PieChartData {
  type: string;
  percentage: number;
  count: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  centerText?: string;
  showLegend?: boolean;
}

interface ChartSegment extends PieChartData {
  startAngle: number;
  endAngle: number;
  rotation: number;
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title = "Miscue Distribution", 
  centerText = "",
  showLegend = true 
}) => {
  // Calculate angles for each segment
  let startAngle = 0;
  const segments: ChartSegment[] = data.map((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const segment: ChartSegment = {
      ...item,
      startAngle,
      endAngle: startAngle + angle,
      rotation: startAngle,
    };
    startAngle += angle;
    return segment;
  });

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.chartContainer}>
        {/* Main chart */}
        <View style={[styles.chart, { width: CHART_SIZE, height: CHART_SIZE }]}>
          {/* Background circle */}
          <View style={styles.backgroundCircle} />
          
          {/* Segments */}
          {segments.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  width: CHART_SIZE,
                  height: CHART_SIZE,
                  borderRadius: CHART_RADIUS,
                  borderWidth: STROKE_WIDTH,
                  borderColor: segment.color,
                  transform: [
                    { rotate: `${segment.rotation}deg` }
                  ],
                }
              ]}
            >
              <View
                style={[
                  styles.segmentMask,
                  {
                    transform: [
                      { rotate: `${segment.endAngle - segment.startAngle}deg` }
                    ],
                  }
                ]}
              />
            </View>
          ))}
          
          {/* Center hole */}
          <View style={[
            styles.centerHole, 
            { 
              width: INNER_RADIUS * 2, 
              height: INNER_RADIUS * 2,
              borderRadius: INNER_RADIUS 
            }
          ]}>
            {centerText && (
              <Text style={styles.centerText}>{centerText}</Text>
            )}
          </View>
        </View>

        {/* Legend */}
        {showLegend && (
          <View style={styles.legendContainer}>
            {data.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.type}: {item.percentage.toFixed(1)}%
                </Text>
                {item.count !== undefined && (
                  <Text style={styles.legendCount}>({item.count})</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: CHART_SIZE,
    height: CHART_SIZE,
    borderRadius: CHART_RADIUS,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  segment: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    overflow: 'hidden',
  },
  segmentMask: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: CHART_RADIUS,
    height: CHART_SIZE,
    backgroundColor: 'transparent',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: CHART_RADIUS,
    borderBottomLeftRadius: CHART_RADIUS,
  },
  centerHole: {
    position: 'absolute',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  centerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  legendCount: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default PieChart;

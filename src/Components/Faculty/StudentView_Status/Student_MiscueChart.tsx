import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { useStudentMiscueStats } from '../../../Hooks/Faculty/use_StudentView_Progress';
import { sw, sh, sf } from '../../../Utils/responsive';

interface MiscueData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface MiscueAnalyticsProps {
  studentId: string;
}

const StudentMiscueAnalytics: React.FC<MiscueAnalyticsProps> = ({
  studentId,
}) => {
  // ==================== HOOKS ====================
  const {
    miscueData,
    total,
    loading: miscueLoading,
    error: miscueError,
  } = useStudentMiscueStats(studentId);

  // ==================== DEFAULT FALLBACKS ====================

  const defaultMiscueData: MiscueData[] = [
    { type: 'Substitution', count: 0, percentage: 0, color: '#FF2726' },
    { type: 'Omission', count: 0, percentage: 0, color: '#FF941A' },
    { type: 'Insertion', count: 0, percentage: 0, color: '#1A81FF' },
    { type: 'Repetition', count: 0, percentage: 0, color: '#BF00DD' },
  ];

  // ==================== DATA SELECTION ====================

  const hasNoData = total === 0;
  const finalMiscueData: MiscueData[] = hasNoData
  ? defaultMiscueData
  : miscueData;

  // ==================== LOADING & ERROR ====================

  if (miscueLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B5FED" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (miscueError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading data</Text>
        <Text style={styles.errorSubtext}>{miscueError}</Text>
      </View>
    );
  }

  // ==================== PIE CHART SETUP ====================

  const radius = 70;
  const strokeWidth = 20;
  const center = radius + strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = -90;

  // ==================== RENDER ====================

  return (
    <View style={styles.container}>
      <View style={styles.commonMiscueCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Common Miscue Type</Text>
        </View>

        <View style={styles.pieChartContainer}>
          <View style={styles.chartWrapper}>
            <Svg
              width={center * 2}
              height={center * 2}
              viewBox={`0 0 ${center * 2} ${center * 2}`}
            >
              <G rotation={0} origin={`${center}, ${center}`}>
                {hasNoData ? (
                  <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#CCCCCC"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                  />
                ) : (
                  finalMiscueData.map((item, index) => {
                    const segmentPercentage =
                      (item.count / total) * 100;
                    const strokeDashoffset =
                      circumference -
                      (segmentPercentage / 100) * circumference;

                    const rotation = currentAngle;
                    currentAngle +=
                      (segmentPercentage / 100) * 360;

                    return (
                      <Circle
                        key={index}
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        rotation={rotation}
                        origin={`${center}, ${center}`}
                        strokeLinecap="round"
                      />
                    );
                  })
                )}
              </G>
            </Svg>

            {hasNoData && (
              <View style={styles.noDataOverlay}>
                <Text style={styles.noDataText}>No Data</Text>
              </View>
            )}
          </View>

          <View style={styles.legend}>
            {hasNoData ? (
              <View style={styles.legendItem}>
                <View style={styles.legendRow}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: '#CCCCCC' },
                    ]}
                  />
                  <Text style={styles.legendLabel}>No Data</Text>
                </View>
                <Text style={styles.legendValue}>100%</Text>
              </View>
            ) : (
              finalMiscueData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendLabel}>{item.type} </Text>
                  </View>
                  <Text style={styles.legendValue}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: sh(10),
        flex: 1,
    },
    commonMiscueCard: {
        padding: sw(20),
        marginBottom: sh(16),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: sh(20),
    },
    cardTitle: {
        fontSize: sf(18),
        fontFamily: 'Satoshi-Bold',
        color: '#333',
    },
    pieChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chartWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    legend: {
        flex: 1,
        marginLeft: sw(20),
    },
    legendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: sh(12),
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: sw(12),
        height: sw(12),
        borderRadius: sw(6),
        marginRight: sw(8),
    },
    legendLabel: {
        fontSize: sf(14),
        color: '#333',
        fontFamily: 'Satoshi-Medium',
    },
    legendValue: {
        fontSize: sf(14),
        color: '#333',
        fontWeight: '600',
        fontFamily: 'Satoshi-Medium',
    },
    loadingContainer: {
        height: sw(200),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: sh(20),
    },
    loadingText: {
        marginTop: sh(10),
        color: '#666',
        fontSize: sf(14),
        fontFamily: 'Satoshi-Medium',
    },
    errorContainer: {
        padding: sw(20),
        backgroundColor: '#FFEBEE',
        borderRadius: sw(8),
        marginTop: sh(20),
    },
    errorText: {
        color: '#D32F2F',
        fontSize: sf(14),
        fontFamily: 'Satoshi-Bold',
    },
    errorSubtext: {
        color: '#666',
        fontSize: sf(12),
        fontFamily: 'Satoshi-Regular',
        marginTop: sh(4),
    },
    noDataOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: sf(14),
        color: '#999',
        fontFamily: 'Satoshi-Medium',
    },
});

export default StudentMiscueAnalytics;
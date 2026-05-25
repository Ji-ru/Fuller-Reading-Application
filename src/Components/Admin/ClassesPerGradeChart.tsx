// components/Admin/ClassesPerGradeChart.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useClassMetrics } from '../../Hooks/Admin/useClassMetrics';
import { sw, sh, sf } from '../../Utils/responsive';

const screenWidth = Dimensions.get('window').width;

interface ClassesPerGradeChartProps {
  acadYear?: string;
}

import { FacultyColors } from '../../Utilities/Theme';

const COLORS = {
  primary: FacultyColors.primaryLight,
  cardBackground: FacultyColors.white,
  textPrimary: FacultyColors.ink,
  textSecondary: FacultyColors.slate,
  error: FacultyColors.red,
};

const chartConfig = {
  backgroundColor: FacultyColors.white,
  backgroundGradientFrom: FacultyColors.white,
  backgroundGradientTo: '#F8F9FA',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(44, 169, 106, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(27, 43, 34, ${opacity})`,
  style: { borderRadius: 16 },
  barPercentage: sw(0.6),
  propsForBackgroundLines: {
    strokeDasharray: '', // solid background lines
    stroke: '#F1F2F6',
  },
};

const ClassesPerGradeChart: React.FC<ClassesPerGradeChartProps> = ({acadYear}) => {
  const {
    gradeDistribution,
    totalClasses,
    isLoading,
    errorMessage,
    fetchMetrics,
  } = useClassMetrics(acadYear);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Classes per Grade Level</Text>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Classes per Grade Level</Text>
        <Text style={styles.errorText}>Failed to load: {errorMessage}</Text>
      </View>
    );
  }

  // Sort grades numerically
  const sortedGrades = Object.keys(gradeDistribution)
    .map(Number)
    .sort((a, b) => a - b);

  const labels = sortedGrades.map(grade => `G${grade}`);
  const dataValues = sortedGrades.map(grade => gradeDistribution[grade]);

  const barData = {
    labels,
    datasets: [{ data: dataValues }],
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.title}>Classes per Grade Level</Text>
          <Text style={styles.subtitle}>Total Classes: {totalClasses}</Text>
          <Text style={styles.description}>Visualizes the distribution of classes across different grade levels.</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <BarChart
          data={barData}
          width={screenWidth - sw(48)}
          height={sh(200)}
          chartConfig={chartConfig}
          yAxisLabel=""
          yAxisSuffix=""
          style={{ marginVertical: sh(8), borderRadius: sw(16) }}
          fromZero
          showValuesOnTopOfBars
          withInnerLines={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: sw(20),
    padding: sw(20),
    marginBottom: sh(20),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.05,
    shadowRadius: sw(10),
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(16),
  },
  accentBar: {
    width: sw(4),
    height: sh(24),
    backgroundColor: COLORS.primary,
    borderRadius: sw(2),
    marginRight: sw(10),
  },
  title: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Regular',
    color: '#7F8C8D',
    marginTop: sh(4),
  },
  chartWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -sw(16),
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Satoshi-Medium',
    marginTop: sh(10),
  },
});

export default ClassesPerGradeChart;
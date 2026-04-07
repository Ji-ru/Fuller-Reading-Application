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
const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(61, 113, 217, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(30, 30, 30, ${opacity})`,
  style: { borderRadius: 16 },
  barPercentage: sw(0.7),
};

const COLORS = {
  cardBackground: '#FFFFFF',
  textPrimary: '#1E1E1E',
  textSecondary: '#999999',
  error: '#FE5A59',
};

/**
 * Displays a bar chart showing the number of classes per grade level.
 * Uses the useClassMetrics hook to fetch gradeDistribution.
 */
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
        <ActivityIndicator size="small" color="#3d71d9" />
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

  const labels = sortedGrades.map(grade => `Grade ${grade}`);
  const dataValues = sortedGrades.map(grade => gradeDistribution[grade]);

  const barData = {
    labels,
    datasets: [{ data: dataValues }],
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Classes per Grade Level</Text>
      <Text style={styles.subtitle}>Total Classes: {totalClasses}</Text>
      <BarChart
        data={barData}
        width={screenWidth - 64}
        height={200}
        chartConfig={chartConfig}
        yAxisLabel=""          // Required by TypeScript
        yAxisSuffix=""         // Required by TypeScript
        style={{ marginVertical: 8, borderRadius: 16 }}
        fromZero
        showValuesOnTopOfBars
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: sw(14),
    padding: sw(20),
    marginBottom: sh(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.08,
    shadowRadius: sw(6),
  },
  title: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: COLORS.textPrimary,
    marginBottom: sh(4),
  },
  subtitle: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Regular',
    color: COLORS.textSecondary,
    marginBottom: sh(16),
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Satoshi-Regular',
  },
});

export default ClassesPerGradeChart;
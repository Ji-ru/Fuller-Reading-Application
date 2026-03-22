// components/Admin/ClassStatusChart.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useClassMetrics } from '../../Hooks/Admin/useClassMetrics';

const screenWidth = Dimensions.get('window').width;
interface ClassStatusChartProps {
  acadYear?: string;
}
const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  useShadowColorFromDataset: false,
};

const COLORS = {
  active: '#4CAF50',
  archived: '#FE5A59',
  cardBackground: '#FFFFFF',
  textPrimary: '#1E1E1E',
  textSecondary: '#999999',
  error: '#FE5A59',
};

/**
 * Displays a pie chart comparing active vs archived classes.
 * Uses the useClassMetrics hook to fetch data.
 */
const ClassStatusChart: React.FC<ClassStatusChartProps> = ({acadYear}) => {
  const {
    activeClassCount,
    archivedClassCount,
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
        <Text style={styles.title}>Active vs Archived Classes</Text>
        <ActivityIndicator size="small" color={COLORS.active} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Active vs Archived Classes</Text>
        <Text style={styles.errorText}>Failed to load: {errorMessage}</Text>
      </View>
    );
  }

  const pieData = [
    {
      name: `Active (${activeClassCount})`,
      population: activeClassCount,
      color: COLORS.active,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 12,
    },
    {
      name: `Archived (${archivedClassCount})`,
      population: archivedClassCount,
      color: COLORS.archived,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 12,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Active vs Archived Classes</Text>
      <Text style={styles.subtitle}>Total Classes: {totalClasses}</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 64}
        height={180}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Regular',
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Satoshi-Regular',
  },
});

export default ClassStatusChart;
// components/Admin/UsersByRoleChart.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useUserAnalytics } from '../../Hooks/Admin/useUserAnalytics';

const screenWidth = Dimensions.get('window').width;

interface UsersByRoleChartProps {
  acadYear?: string;
}
/** Shared chart styling */
const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  useShadowColorFromDataset: false,
};

// Color palette for graphs
const COLORS = {
  student: '#3d71d9',
  faculty: '#57b8b3',
  cardBackground: '#FFFFFF',
  textPrimary: '#1E1E1E',
  textSecondary: '#999999',
  error: '#FE5A59',
};

/**
 * Displays a pie chart showing the distribution of users by role (students vs faculty).
 * Data is fetched from the useUserAnalytics hook.
 */
const UsersByRoleChart: React.FC<UsersByRoleChartProps> = ({ acadYear }) => {
  const { roleCounts, totalUsers, isLoading, errorMessage } = useUserAnalytics(acadYear, false);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Users by Role</Text>
        <ActivityIndicator size="small" color={COLORS.student} />
      </View>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Users by Role</Text>
        <Text style={styles.errorText}>Failed to load: {errorMessage}</Text>
      </View>
    );
  }

  // Prepare data for PieChart
  const pieData = [
    {
      name: `Students (${roleCounts.students})`,
      population: roleCounts.students,
      color: COLORS.student,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 12,
    },
    {
      name: `Faculty (${roleCounts.faculty})`,
      population: roleCounts.faculty,
      color: COLORS.faculty,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 12,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Users by Role</Text>
      <Text style={styles.subtitle}>Total Users: {totalUsers}</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 64} // account for card padding
        height={180}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute // show numbers on slices
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

export default UsersByRoleChart;
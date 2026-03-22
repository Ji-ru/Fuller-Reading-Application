// components/Admin/UsersRegisteredChart.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useUserAnalytics } from '../../Hooks/Admin/useUserAnalytics';

const screenWidth = Dimensions.get('window').width;

interface UsersRegisteredProps {
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
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#3d71d9' },
};

const COLORS = {
  cardBackground: '#FFFFFF',
  textPrimary: '#1E1E1E',
  textSecondary: '#999999',
  error: '#FE5A59',
};

/**
 * Displays a line chart showing the number of new user registrations per month.
 * Data is derived from the monthlyRegistrations field of useUserAnalytics.
 */
const UsersRegisteredChart: React.FC<UsersRegisteredProps> = ({acadYear}) => {
  const { monthlyRegistrations, isLoading, errorMessage } = useUserAnalytics(acadYear, false);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Users Registered Over Time</Text>
        <ActivityIndicator size="small" color="#3d71d9" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Users Registered Over Time</Text>
        <Text style={styles.errorText}>Failed to load: {errorMessage}</Text>
      </View>
    );
  }

  // If no data, show a placeholder
  if (monthlyRegistrations.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Users Registered Over Time</Text>
        <Text style={styles.subtitle}>No registration data available</Text>
      </View>
    );
  }

  // Extract month labels (e.g., "Jan") and counts
  const labels = monthlyRegistrations.map(item => {
    const [year, month] = item.yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'short' });
  });

  const data = {
    labels,
    datasets: [
      {
        data: monthlyRegistrations.map(item => item.count),
        color: (opacity = 1) => `rgba(61, 113, 217, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['New Users'],
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Users Registered Over Time</Text>
      <Text style={styles.subtitle}>Monthly sign-ups</Text>
      <LineChart
        data={data}
        width={screenWidth - 64}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={{ marginVertical: 8, borderRadius: 16 }}
        formatYLabel={(y) => Math.round(Number(y)).toString()}
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

export default UsersRegisteredChart;
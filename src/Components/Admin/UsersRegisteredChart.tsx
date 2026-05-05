// components/Admin/UsersRegisteredChart.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useUserAnalytics } from '../../Hooks/Admin/useUserAnalytics';
import { sw, sh, sf } from '../../Utils/responsive';

const screenWidth = Dimensions.get('window').width;

interface UsersRegisteredProps {
  acadYear?: string;
}

const COLORS = {
  primary: '#4ECDC4',
  cardBackground: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  error: '#FF7675',
};

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#F8F9FA',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(45, 52, 54, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#4ECDC4' },
  propsForBackgroundLines: {
    strokeDasharray: '', // solid background lines
    stroke: '#F1F2F6',
  },
};

const UsersRegisteredChart: React.FC<UsersRegisteredProps> = ({acadYear}) => {
  const { monthlyRegistrations, isLoading, errorMessage } = useUserAnalytics(acadYear, true);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Users Registered Over Time</Text>
        <ActivityIndicator size="small" color={COLORS.primary} />
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

  if (monthlyRegistrations.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>Users Registered Over Time</Text>
        </View>
        <Text style={styles.noDataText}>No registration data available</Text>
      </View>
    );
  }

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
        color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
        strokeWidth: sw(3),
      },
    ],
    legend: ['New Users'],
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.title}>Users Registered Over Time</Text>
          <Text style={styles.subtitle}>Monthly sign-ups</Text>
          <Text style={styles.description}>Tracks the number of new user registrations per month to monitor platform adoption.</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={data}
          width={screenWidth - sw(48)}
          height={sh(200)}
          chartConfig={chartConfig}
          bezier
          style={{ marginVertical: sh(8), borderRadius: sw(16) }}
          formatYLabel={(y) => Math.round(Number(y)).toString()}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
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
    fontFamily: 'Comfortaa-Bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: sf(13),
    fontFamily: 'Comfortaa-Regular',
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: sf(12),
    fontFamily: 'Comfortaa-Regular',
    color: '#7F8C8D',
    marginTop: sh(4),
  },
  chartWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -sw(16),
  },
  noDataText: {
    fontSize: sf(14),
    fontFamily: 'Comfortaa-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: sh(20),
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Comfortaa-Regular',
    marginTop: sh(10),
  },
});

export default UsersRegisteredChart;
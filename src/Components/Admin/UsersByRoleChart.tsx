// components/Admin/UsersByRoleChart.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useUserAnalytics } from '../../Hooks/Admin/useUserAnalytics';
import { sw, sh, sf } from '../../Utils/responsive';

const screenWidth = Dimensions.get('window').width;

interface UsersByRoleChartProps {
  acadYear?: string;
}

const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: sw(2),
  useShadowColorFromDataset: false,
};

const COLORS = {
  student: '#4ECDC4',
  faculty: '#96CEB4',
  cardBackground: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  error: '#FF7675',
};

const UsersByRoleChart: React.FC<UsersByRoleChartProps> = ({ acadYear }) => {
  const { roleCounts, totalUsers, isLoading, errorMessage } = useUserAnalytics(acadYear, false);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Users by Role</Text>
        <ActivityIndicator size="small" color={COLORS.student} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Users by Role</Text>
        <Text style={styles.errorText}>Failed to load: {errorMessage}</Text>
      </View>
    );
  }

  const pieData = [
    {
      name: `Students`,
      population: roleCounts.students,
      color: COLORS.student,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
    {
      name: `Faculty`,
      population: roleCounts.faculty,
      color: COLORS.faculty,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.title}>Users by Role</Text>
          <Text style={styles.subtitle}>Total Users: {totalUsers}</Text>
        </View>
      </View>
      
      <View style={styles.chartWrapper}>
        <PieChart
          data={pieData}
          width={screenWidth - sw(40)}
          height={sh(180)}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          center={[sw(10), 0]}
          absolute
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
    backgroundColor: COLORS.student,
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
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -sw(15),
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Comfortaa-Regular',
    marginTop: sh(10),
  },
});

export default UsersByRoleChart;
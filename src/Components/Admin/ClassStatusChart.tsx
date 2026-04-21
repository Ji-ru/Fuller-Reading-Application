// components/Admin/ClassStatusChart.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useClassMetrics } from '../../Hooks/Admin/useClassMetrics';
import { sw, sh, sf } from '../../Utils/responsive';

const screenWidth = Dimensions.get('window').width;

interface ClassStatusChartProps {
  acadYear?: string;
}

const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: sw(2),
  useShadowColorFromDataset: false,
};

const COLORS = {
  active: '#4ECDC4',
  archived: '#FF6B6B',
  cardBackground: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  error: '#FF7675',
};

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
      name: `Active`,
      population: activeClassCount,
      color: COLORS.active,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
    {
      name: `Archived`,
      population: archivedClassCount,
      color: COLORS.archived,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.title}>Active vs Archived Classes</Text>
          <Text style={styles.subtitle}>Total Classes: {totalClasses}</Text>
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
    backgroundColor: COLORS.active,
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

export default ClassStatusChart;
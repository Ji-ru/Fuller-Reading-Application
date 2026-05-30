// components/Admin/StudentsPerGradeChart.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { sw, sh, sf } from '../../Utils/responsive';
import { FacultyColors } from '../../Utilities/Theme';
import {
  getStudentGradeLevelDistribution,
  GradeLevelDistribution,
} from '../../Controller/AuthenticationController';

const screenWidth = Dimensions.get('window').width;

interface StudentsPerGradeChartProps {
  acadYear?: string;
}

// Grade levels the app supports (see GradeLevelSelectionButton). These always
// appear on the chart — even at zero students — so the axis stays consistent.
const SUPPORTED_GRADES = [1, 2, 3];

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

/**
 * Bar chart of enrolled students grouped by the grade level of their class.
 * Self-fetching via getStudentGradeLevelDistribution; honors the dashboard's
 * academic-year filter.
 */
const StudentsPerGradeChart: React.FC<StudentsPerGradeChartProps> = ({ acadYear }) => {
  const [data, setData] = useState<GradeLevelDistribution>({ byGrade: {}, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchDistribution = async () => {
      try {
        if (isActive) {
          setIsLoading(true);
          setErrorMessage(null);
        }
        const result = await getStudentGradeLevelDistribution(acadYear);
        if (isActive) setData(result);
      } catch (error: any) {
        if (isActive) setErrorMessage(error.message);
        console.error('[StudentsPerGradeChart] Failed to fetch distribution:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchDistribution();
    return () => {
      isActive = false;
    };
  }, [acadYear]);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Students per Grade Level</Text>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Students per Grade Level</Text>
        <Text style={styles.errorText}>Failed to load: {errorMessage}</Text>
      </View>
    );
  }

  // Always show the supported grades, plus any extra grades that have data,
  // so Grade 2 / Grade 3 appear even when their student count is zero.
  const sortedGrades = Array.from(
    new Set([...SUPPORTED_GRADES, ...Object.keys(data.byGrade).map(Number)]),
  ).sort((a, b) => a - b);

  const labels = sortedGrades.map(grade => `G${grade}`);
  const dataValues = sortedGrades.map(grade => data.byGrade[grade] ?? 0);
  const maxValue = Math.max(0, ...dataValues);
  const segments = maxValue > 0 ? Math.min(6, maxValue) : 1;

  const barData = {
    labels,
    datasets: [{ data: dataValues }],
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.title}>Students per Grade Level</Text>
          <Text style={styles.subtitle}>Total Students: {data.total}</Text>
          <Text style={styles.description}>
            Number of enrolled students grouped by their class's grade level.
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <BarChart
          data={barData}
          width={screenWidth - sw(48)}
          height={sh(200)}
          chartConfig={chartConfig}
          segments={segments}
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

export default StudentsPerGradeChart;

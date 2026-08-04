// components/GlobalUse/GenderDistributionChart.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { sw, sh, sf } from '../../Utils/responsive';
import { FacultyColors } from '../../Utilities/Theme';
import {
  getStudentGenderDistribution,
  GenderDistribution,
} from '../../Controller/AuthenticationController';

const screenWidth = Dimensions.get('window').width;

interface GenderDistributionChartProps {
  /** When set, the chart counts only students on this class's roster. */
  classId?: string;
  /** When set (and no classId), counts students for this academic year only. */
  acadYear?: string;
}

const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: sw(2),
  useShadowColorFromDataset: false,
};

const COLORS = {
  male: FacultyColors.sky,
  female: FacultyColors.coral,
  other: FacultyColors.slate,
  cardBackground: FacultyColors.white,
  textPrimary: FacultyColors.ink,
  textSecondary: FacultyColors.slate,
  error: FacultyColors.red,
};

/**
 * Pie chart of enrolled students by sex (male / female). Self-fetching via
 * getStudentGenderDistribution; scope is decided by the props it receives.
 * Shared by the Admin dashboard, Faculty dashboard, and Admin class dashboard.
 */
const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ classId, acadYear }) => {
  const [data, setData] = useState<GenderDistribution>({ male: 0, female: 0, other: 0, total: 0 });
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
        const result = await getStudentGenderDistribution({ classId, acadYear });
        if (isActive) setData(result);
      } catch (error: any) {
        if (isActive) setErrorMessage(error.message);
        console.error('[GenderDistributionChart] Failed to fetch distribution:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchDistribution();
    return () => {
      isActive = false;
    };
  }, [classId, acadYear]);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Gender Distribution</Text>
        <ActivityIndicator size="small" color={COLORS.male} style={{ marginTop: sh(20) }} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Gender Distribution</Text>
        <Text style={styles.errorText}>Failed to load: {errorMessage}</Text>
      </View>
    );
  }

  const pieData = [
    {
      name: 'Male',
      population: data.male,
      color: COLORS.male,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
    {
      name: 'Female',
      population: data.female,
      color: COLORS.female,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
    // Only surface "Other" when there is at least one such record.
    ...(data.other > 0
      ? [
          {
            name: 'Other',
            population: data.other,
            color: COLORS.other,
            legendFontColor: COLORS.textPrimary,
            legendFontSize: sw(12),
          },
        ]
      : []),
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.title}>Gender Distribution</Text>
          <Text style={styles.subtitle}>Total Students: {data.total}</Text>
          <Text style={styles.description}>
            Breakdown of enrolled students by sex (male and female).
          </Text>
        </View>
      </View>

      {data.total === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No enrolled students to display.</Text>
        </View>
      ) : (
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
      )}
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
    backgroundColor: COLORS.male,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -sw(15),
  },
  noDataContainer: {
    height: sh(150),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Satoshi-Medium',
    marginTop: sh(10),
  },
});

export default GenderDistributionChart;

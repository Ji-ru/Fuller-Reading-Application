// components/Admin/ReadingLevelDistributionChart.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useAdminReadingLevelAnalytics } from '../../Hooks/Admin/useAdminReadingLevelAnalytics';
import { sw, sh, sf } from '../../Utils/responsive';

const screenWidth = Dimensions.get('window').width;

interface ReadingLevelDistributionChartProps {
  acadYear?: string; 
}

const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: sw(2),
  useShadowColorFromDataset: false,
};

const COLORS = {
  beginner: '#3d71d9',
  intermediate: '#57b8b3',
  advanced: '#F4A261',
  cardBackground: '#FFFFFF',
  textPrimary: '#1E1E1E',
  textSecondary: '#999999',
  error: '#FE5A59',
  border: '#E8E8E8',
  primaryDim: '#EFF4FF',
};

/**
 * Displays a pie chart showing the distribution of students' reading levels
 * Allows filtering by Grade Level and Class.
 */
const ReadingLevelDistributionChart: React.FC<ReadingLevelDistributionChartProps> = ({acadYear}) => {
  const { studentData, uniqueGrades, classes, isLoading, errorMessage } =
    useAdminReadingLevelAnalytics(acadYear);

  const [selectedGrade, setSelectedGrade] = useState<number | 'Overall'>('Overall');
  const [selectedClass, setSelectedClass] = useState<string | 'Overall'>('Overall');

  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Store classCode internally; display uses className.
  const selectedClassLabel = useMemo(() => {
    if (selectedClass === 'Overall') return 'All Classes';
    return classes.find(c => c.classCode === selectedClass)?.className ?? selectedClass;
  }, [classes, selectedClass]);

  const classOptionsForSelectedGrade = useMemo(() => {
    const gradeFiltered =
      selectedGrade === 'Overall'
        ? classes
        : classes.filter(c => c.gradeLevel === selectedGrade);

    // Keep unique by classCode
    const seen = new Set<string>();
    return gradeFiltered.filter(c => {
      if (seen.has(c.classCode)) return false;
      seen.add(c.classCode);
      return true;
    });
  }, [classes, selectedGrade]);

  // When grade changes, ensure class selection stays valid.
  useEffect(() => {
    setSelectedGrade('Overall');
    setSelectedClass('Overall');
    setShowGradeDropdown(false);
    setShowClassDropdown(false);
  }, [acadYear]);

  // Compute filtered counts
  const readingLevels = useMemo(() => {
    let beginner = 0;
    let intermediate = 0;
    let advanced = 0;

    studentData.forEach(student => {
      if (selectedGrade !== 'Overall' && student.gradeLevel !== selectedGrade) return;
      if (selectedClass !== 'Overall' && student.classCode !== selectedClass) return;

      const level = student.readingLevel?.toLowerCase();
      if (level === 'beginner') beginner++;
      else if (level === 'intermediate') intermediate++;
      else if (level === 'advanced') advanced++;
    });

    return { beginner, intermediate, advanced };
  }, [studentData, selectedGrade, selectedClass]);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Reading Level Distribution</Text>
        <ActivityIndicator size="small" color={COLORS.beginner} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Reading Level Distribution</Text>
        <Text style={styles.errorText}>Failed to load: {errorMessage}</Text>
      </View>
    );
  }

  const totalStudents = readingLevels.beginner + readingLevels.intermediate + readingLevels.advanced;

  const pieData = [
    {
      name: `Beginner (${readingLevels.beginner})`,
      population: readingLevels.beginner,
      color: COLORS.beginner,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
    {
      name: `Intermediate (${readingLevels.intermediate})`,
      population: readingLevels.intermediate,
      color: COLORS.intermediate,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
    {
      name: `Advanced (${readingLevels.advanced})`,
      population: readingLevels.advanced,
      color: COLORS.advanced,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(12),
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Reading Level Distribution</Text>
      <Text style={styles.subtitle}>Students by proficiency</Text>

      {/* Filters Row */}
      <View style={styles.filtersRow}>
        {/* Grade Filter */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Grade Level</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowGradeDropdown(!showGradeDropdown);
              setShowClassDropdown(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonText}>
              {selectedGrade === 'Overall' ? 'All Grades' : `Grade ${selectedGrade}`}
            </Text>
            <Text style={{ fontSize: 10, color: COLORS.textSecondary }}>
              {showGradeDropdown ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showGradeDropdown && (
            <View style={styles.filterDropdownMenu}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                <TouchableOpacity
                  style={[styles.dropdownOption, selectedGrade === 'Overall' && styles.dropdownOptionActive]}
                  onPress={() => { setSelectedGrade('Overall'); setShowGradeDropdown(false); }}
                >
                  <Text style={[styles.dropdownOptionText, selectedGrade === 'Overall' && styles.dropdownOptionTextActive]}>
                    All Grades
                  </Text>
                </TouchableOpacity>
                {uniqueGrades.map(grade => (
                  <TouchableOpacity
                    key={grade}
                    style={[styles.dropdownOption, selectedGrade === grade && styles.dropdownOptionActive]}
                    onPress={() => { setSelectedGrade(grade); setShowGradeDropdown(false); }}
                  >
                    <Text style={[styles.dropdownOptionText, selectedGrade === grade && styles.dropdownOptionTextActive]}>
                      Grade {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Class Filter */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Class Name</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowClassDropdown(!showClassDropdown);
              setShowGradeDropdown(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonText}>
              {selectedClassLabel}
            </Text>
            <Text style={{ fontSize: 10, color: COLORS.textSecondary }}>
              {showClassDropdown ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showClassDropdown && (
            <View style={styles.filterDropdownMenu}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                <TouchableOpacity
                  style={[styles.dropdownOption, selectedClass === 'Overall' && styles.dropdownOptionActive]}
                  onPress={() => { setSelectedClass('Overall'); setShowClassDropdown(false); }}
                >
                  <Text style={[styles.dropdownOptionText, selectedClass === 'Overall' && styles.dropdownOptionTextActive]}>
                    All Classes
                  </Text>
                </TouchableOpacity>
                {classOptionsForSelectedGrade.map(cls => (
                  <TouchableOpacity
                    key={cls.classCode}
                    style={[
                      styles.dropdownOption,
                      selectedClass === cls.classCode && styles.dropdownOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedClass(cls.classCode);
                      setShowClassDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        selectedClass === cls.classCode && styles.dropdownOptionTextActive,
                      ]}
                    >
                      {cls.className}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {totalStudents === 0 ? (
        <Text style={styles.noDataText}>No student data available for this filter.</Text>
      ) : (
        <PieChart
          data={pieData}
          width={screenWidth - 64}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      )}
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
    zIndex: 1, // To allow dropdown to overflow nicely if needed, but react native usually needs careful z-indexing
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
  filtersRow: {
    flexDirection: 'row',
    gap: sw(12),
    marginBottom: sh(20),
    zIndex: 10,
  },
  filterItem: {
    flex: 1,
    position: 'relative',
    zIndex: 20,
  },
  filterLabel: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: COLORS.textSecondary,
    marginBottom: sh(6),
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sw(12),
    paddingVertical: sh(10),
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: sw(8),
  },
  filterButtonText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: COLORS.textPrimary,
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: sh(60),
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: sw(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.08,
    shadowRadius: sw(12),
    elevation: 5,
    zIndex: 100,
  },
  dropdownOption: {
    paddingVertical: sh(12),
    paddingHorizontal: sw(14),
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.primaryDim,
  },
  dropdownOptionText: {
    fontSize: sf(13),
    color: '#555',
    fontFamily: 'Satoshi-Regular',
  },
  dropdownOptionTextActive: {
    color: COLORS.beginner,
    fontFamily: 'Satoshi-Medium',
  },
  noDataText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: sh(20),
    marginBottom: sh(20),
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Satoshi-Regular',
  },
});

export default ReadingLevelDistributionChart;

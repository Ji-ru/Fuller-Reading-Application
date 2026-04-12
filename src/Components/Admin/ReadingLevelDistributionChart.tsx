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
  beginner: '#4ECDC4',
  intermediate: '#45B7D1',
  advanced: '#FFE66D',
  cardBackground: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  error: '#FF7675',
  border: '#F1F2F6',
  primaryDim: '#E8F8F7',
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
      name: `Beginner`,
      population: readingLevels.beginner,
      color: COLORS.beginner,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(11),
    },
    {
      name: `Intermediate`,
      population: readingLevels.intermediate,
      color: COLORS.intermediate,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(11),
    },
    {
      name: `Advanced`,
      population: readingLevels.advanced,
      color: COLORS.advanced,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: sw(11),
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.title}>Reading Level Distribution</Text>
          <Text style={styles.subtitle}>Students by proficiency</Text>
        </View>
      </View>

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
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedGrade === 'Overall' ? 'All Grades' : `Grade ${selectedGrade}`}
            </Text>
            <Text style={styles.dropdownIco}>
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
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedClassLabel}
            </Text>
            <Text style={styles.dropdownIco}>
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
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No student data available for this filter.</Text>
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
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(16),
  },
  accentBar: {
    width: sw(4),
    height: sh(24),
    backgroundColor: COLORS.beginner,
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
  filtersRow: {
    flexDirection: 'row',
    gap: sw(10),
    marginBottom: sh(20),
    zIndex: 10,
  },
  filterItem: {
    flex: 1,
    position: 'relative',
    zIndex: 20,
  },
  filterLabel: {
    fontSize: sf(11),
    fontFamily: 'Comfortaa-Bold',
    color: COLORS.textSecondary,
    marginBottom: sh(6),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sw(10),
    paddingVertical: sh(10),
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: sw(12),
  },
  filterButtonText: {
    fontSize: sf(12),
    fontFamily: 'Comfortaa-Bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: sw(4),
  },
  dropdownIco: {
    fontSize: sf(10),
    color: COLORS.textSecondary,
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: sh(60),
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: sw(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(6) },
    shadowOpacity: 0.1,
    shadowRadius: sw(12),
    elevation: 6,
    zIndex: 100,
  },
  dropdownOption: {
    paddingVertical: sh(12),
    paddingHorizontal: sw(14),
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F2F6',
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.primaryDim,
  },
  dropdownOptionText: {
    fontSize: sf(13),
    color: '#2D3436',
    fontFamily: 'Comfortaa-Regular',
  },
  dropdownOptionTextActive: {
    color: COLORS.beginner,
    fontFamily: 'Comfortaa-Bold',
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
    fontFamily: 'Comfortaa-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Comfortaa-Regular',
    marginTop: sh(10),
  },
});

export default ReadingLevelDistributionChart;

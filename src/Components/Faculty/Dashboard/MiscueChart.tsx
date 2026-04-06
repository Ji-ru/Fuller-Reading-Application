// MiscueAnalytics.tsx
import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import {
  useMiscueAnalystics,
  useOverallAverageWPMandAccuracy,
  useTopMiscueIdentifier,
} from '../../../Hooks/use_ReadingStudentStats';
import { FilterOptions } from '../../../Interfaces/miscue';
import { sw, sh, sf } from '../../../Utils/responsive';

// Update these interfaces to match the actual data structure
interface MiscueData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface CommonWord {
  word: string;
  errorExample: string;
  errorCount: number;
  dominantMiscueType?: string;
}

interface TopMiscuedPassage {
  title: string;
  averageAccuracy: number;
  attempts: number;
  totalMiscues: number;
}

interface MiscueAnalyticsProps {
  facultyId?: string | null;
  filter: {
    academicYear: string;
    selectedView: string;
  };
}

const MiscueAnalytics: React.FC<MiscueAnalyticsProps> = ({
  facultyId = null,
  filter,
}) => {
  const { selectedView, academicYear } = filter;
  const isOverall = selectedView === 'overall';

  // Build filter options for hooks based on parent filter
  const filterOptions = useMemo<FilterOptions>(() => {
    const options: FilterOptions = {
      type: isOverall ? 'overall' : 'class',
    };
    
    if (!isOverall && selectedView) {
      options.classId = selectedView;
    }
    
    if (academicYear) {
      options.acadYear = academicYear;
    }
    
    return options;
  }, [isOverall, selectedView, academicYear]);

  // Hook for common miscue type
  const {
    miscueData: hookMiscueData,
    loading: miscueLoading,
    error: miscueError,
  } = useMiscueAnalystics(facultyId, filterOptions);

  // Hook for Top 5 Miscue Data
  const {
    topMiscue,
    loading: topMiscueLoading,
    error: topMiscueError,
  } = useTopMiscueIdentifier(facultyId, filterOptions);

  // Hook for getting the average of WPM and Accuracy
  const {
    averages: hookAverages,
    loading: averagesLoading,
    error: averagesError,
  } = useOverallAverageWPMandAccuracy(facultyId, filterOptions);

  // Debug: Log the data from hooks
  useEffect(() => {
    // console.log('🔍 MISCCUE ANALYTICS DATA:');
    // console.log('Filter:', filterOptions);
    // console.log('hookMiscueData:', hookMiscueData);
    // console.log('topMiscue:', topMiscue);
    // console.log('hookAverages:', hookAverages);
  }, [filterOptions, hookMiscueData, topMiscue, hookAverages]);

  // Default data for fallback (empty/zero data)
  const defaultMiscueData: MiscueData[] = [
    { type: 'Substitution', count: 0, percentage: 0, color: '#FF2726' },
    { type: 'Omission', count: 0, percentage: 0, color: '#FF941A' },
    { type: 'Insertion', count: 0, percentage: 0, color: '#1A81FF' },
    { type: 'Repetition', count: 0, percentage: 0, color: '#BF00DD' },
  ];

  const defaultTopPassage: TopMiscuedPassage = {
    title: 'No passage data available',
    averageAccuracy: 0,
    attempts: 0,
    totalMiscues: 0,
  };

  const defaultCommonWords: CommonWord[] = [
    { word: 'No data', errorExample: 'No data', errorCount: 0 },
    { word: 'No data', errorExample: 'No data', errorCount: 0 },
    { word: 'No data', errorExample: 'No data', errorCount: 0 },
    { word: 'No data', errorExample: 'No data', errorCount: 0 },
    { word: 'No data', errorExample: 'No data', errorCount: 0 },
  ];

  const defaultAverages = {
    averageAccuracy: 0,
    averageWPM: 0,
    totalReports: 0,
    totalStudents: 0,
  };

  // ==================== DATA SELECTION LOGIC ====================
  
  // 1. Miscue Data (Pie Chart) - ALWAYS use hook data when available
  const miscueData = hookMiscueData && hookMiscueData.length > 0 
    ? hookMiscueData 
    : defaultMiscueData;

  // 2. Averages - ALWAYS use hook data when available
  const averages = hookAverages || defaultAverages;

  // 3. Top Passage and Common Words - Extract from topMiscue hook
  let passage = defaultTopPassage;
  let words = defaultCommonWords;

  if (topMiscue && topMiscue.length > 0 && topMiscue[0]) {
    const miscueData = topMiscue[0];
    
    // Check if we have actual data (not "No data" placeholder)
    if (miscueData.topMiscueType !== 'No data') {
      // Extract top passage if available
      if (miscueData.topMiscuedPassage && miscueData.topMiscuedPassage.length > 0) {
        const passageData = miscueData.topMiscuedPassage[0];
        passage = {
          title: passageData.title,
          averageAccuracy: passageData.averageAccuracy,
          attempts: passageData.attempts,
          totalMiscues: passageData.totalMiscues,
        };
      }

      // Extract common words if available
      if (miscueData.commonMiscueWords && miscueData.commonMiscueWords.length > 0) {
        words = miscueData.commonMiscueWords.map(word => ({
          word: word.word,
          errorExample: word.errorExample,
          errorCount: word.errorCount,
          dominantMiscueType: word.dominantMiscueType,
        }));
      }
    }
  }

  // ==================== LOADING & ERROR STATES ====================
  
  const isLoading = miscueLoading || topMiscueLoading || averagesLoading;
  const hasError = miscueError || topMiscueError || averagesError;

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Filter Indicator - Shows current filter context */}
        {/* <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            {isOverall 
              ? '📊 Overall Reading Statistics' 
              : `📚 Class: ${selectedView}`}
            {academicYear && ` • ${academicYear}`}
          </Text>
        </View> */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B5FED" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.container}>
        {/* Filter Indicator - Shows current filter context */}
        {/* <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            {isOverall 
              ? '📊 Overall Reading Statistics' 
              : `📚 Class: ${selectedView}`}
            {academicYear && ` • ${academicYear}`}
          </Text>
        </View> */}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading data</Text>
          <Text style={styles.errorSubtext}>
            {miscueError || topMiscueError || averagesError}
          </Text>
        </View>
      </View>
    );
  }

  // ==================== RENDER LOGIC ====================
  
  // Calculate total for pie chart segments
  const total = miscueData.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate pie chart segments
  const radius = 70;
  const strokeWidth = 20;
  const center = radius + strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = -90;

  // Check if there's no data (all counts are 0)
  const hasNoData = total === 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Filter Indicator - Shows current filter context */}
      {/* <View style={styles.filterIndicator}>
        <Text style={styles.filterIndicatorText}>
          {isOverall 
            ? '📊 Overall Reading Statistics' 
            : '📚 Class Reading Statistics'}
          {!isOverall && (
            <Text style={styles.filterBold}> {selectedView}</Text>
          )}
          {academicYear && (
            <Text style={styles.filterYear}> • {academicYear}</Text>
          )}
        </Text>
      </View> */}

      {/* Pie Chart Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Common Miscue Type</Text>
        </View>

        <View style={styles.pieChartContainer}>
          <View style={styles.chartWrapper}>
            <Svg
              width={center * 2}
              height={center * 2}
              viewBox={`0 0 ${center * 2} ${center * 2}`}
            >
              <G rotation={0} origin={`${center}, ${center}`}>
                {hasNoData ? (
                  // Show a single gray circle for "No Data"
                  <Circle
                    key="no-data"
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#CCCCCC"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                    rotation={0}
                    origin={`${center}, ${center}`}
                    strokeLinecap="round"
                  />
                ) : (
                  // Show normal pie chart segments
                  miscueData.map((item, index) => {
                    const segmentPercentage = (item.count / total) * 100;
                    const strokeDashoffset =
                      circumference - (segmentPercentage / 100) * circumference;
                    const rotation = currentAngle;
                    currentAngle += (segmentPercentage / 100) * 360;

                    return (
                      <Circle
                        key={index}
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        rotation={rotation}
                        origin={`${center}, ${center}`}
                        strokeLinecap="round"
                      />
                    );
                  })
                )}
              </G>
            </Svg>
            
            {/* Optional: Add a text overlay for "No Data" */}
            {hasNoData && (
              <View style={styles.noDataOverlay}>
                <Text style={styles.noDataText}>No Data</Text>
              </View>
            )}
          </View>

          <View style={styles.legend}>
            {hasNoData ? (
              // Show single "No Data" legend item
              <View style={styles.legendItem}>
                <View style={styles.legendRow}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#CCCCCC' }]}
                  />
                  <Text style={styles.legendLabel}>No Data</Text>
                </View>
                <Text style={styles.legendValue}>100%</Text>
              </View>
            ) : (
              // Show normal legend items
              miscueData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={styles.legendRow}>
                    <View
                      style={[styles.legendDot, { backgroundColor: item.color }]}
                    />
                    <Text style={styles.legendLabel}>{item.type}</Text>
                  </View>
                  <Text style={styles.legendValue}>
                    {item.percentage.toFixed(2)}%
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>

      {/* Average Stats Card */}
      <View style={[styles.card, styles.averagesCard]}>
        <Text style={styles.averagesTitle}>
          {isOverall ? 'Overall' : 'Class'} Reading Statistics
        </Text>
        <View style={styles.averagesGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{averages.averageAccuracy}%</Text>
            <Text style={styles.statLabel}>Avg. Accuracy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{averages.averageWPM}</Text>
            <Text style={styles.statLabel}>Avg. WPM</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{averages.totalStudents}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>
      </View>

      {/* Top Miscued Passage Card */}
      <View style={[styles.card, styles.passageCard]}>
        <Text style={styles.passageTitle}>Top Miscued Passage</Text>
        <Text style={styles.passageName}>{passage.title}</Text>
        <View style={styles.passageStats}>
          <View>
            <Text style={styles.passageStatLabel}>Accuracy:</Text>
            <Text style={styles.passageStatValue}>
              {passage.averageAccuracy.toFixed(1)}%
            </Text>
          </View>
          <View>
            <Text style={styles.passageStatLabel}>Attempts:</Text>
            <Text style={styles.passageStatValue}>{passage.attempts}</Text>
          </View>
          <View>
            <Text style={styles.passageStatLabel}>Miscues:</Text>
            <Text style={styles.passageStatValue}>{passage.totalMiscues}</Text>
          </View>
        </View>
      </View>

      {/* Most Common Miscue Words Card */}
      <View style={[styles.card, styles.wordsCard]}>
        <View style={styles.wordsHeader}>
          <Text style={styles.wordsTitle}>Most Common Miscue Words</Text>
        </View>

        {words.some(w => w.word !== 'No data' && w.errorCount > 0) ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Word</Text>
              <Text style={styles.headerText}>Miscue Type</Text>
              <Text style={[styles.headerText, styles.attemptHeader]}>
                Attempt
              </Text>
            </View>

            {words
              .filter(w => w.word !== 'No data' && w.errorCount > 0)
              .map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.column1}>
                    <Text style={styles.wordText}>"{item.word}"</Text>
                  </View>

                  <View style={styles.column2}>
                    {item.dominantMiscueType && item.dominantMiscueType !== 'N/A' && (
                      <View
                        style={[
                          styles.miscueTypeBadge,
                          item.dominantMiscueType === 'Substitution' && {
                            backgroundColor: '#FF2726',
                          },
                          item.dominantMiscueType === 'Omission' && {
                            backgroundColor: '#FF941A',
                          },
                          item.dominantMiscueType === 'Insertion' && {
                            backgroundColor: '#1A81FF',
                          },
                          item.dominantMiscueType === 'Repetition' && {
                            backgroundColor: '#BF00DD',
                          },
                        ]}
                      >
                        <Text style={styles.miscueTypeText}>
                          {item.dominantMiscueType}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.column3}>
                    <Text style={styles.attemptCount}>
                      {item.errorCount > 0 ? `${item.errorCount} times` : 'No attempts'}
                    </Text>
                  </View>
                </View>
              ))}
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataMessage}>No miscue words data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: sh(10),
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: sw(16),
    padding: sw(20),
    marginBottom: sh(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.1,
    shadowRadius: sw(4),
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(20),
  },
  cardTitle: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#333',
  },
  pieChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flex: 1,
    marginLeft: sw(20),
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(12),
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: sw(12),
    height: sw(12),
    borderRadius: sw(6),
    marginRight: sw(8),
  },
  legendLabel: {
    fontSize: sf(14),
    color: '#333',
    fontFamily: 'Satoshi-Medium',
  },
  legendValue: {
    fontSize: sf(14),
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Satoshi-Medium',
  },
  passageCard: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  passageTitle: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#FF6B6B',
    marginBottom: sh(12),
  },
  passageName: {
    fontSize: sf(20),
    fontFamily: 'Satoshi-Medium',
    color: '#333',
    marginBottom: sh(16),
  },
  passageStatLabel: {
    fontSize: sf(14),
    color: '#999',
    marginBottom: sh(4),
    fontFamily: 'Satoshi-Bold',
  },
  passageStatValue: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#333',
  },
  wordsCard: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  wordsTitle: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#FF6B6B',
    marginBottom: sh(16),
  },
  loadingContainer: {
    height: sw(200),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: sh(20),
  },
  loadingText: {
    marginTop: sh(10),
    color: '#666',
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
  },
  errorContainer: {
    padding: sw(20),
    backgroundColor: '#FFEBEE',
    borderRadius: sw(8),
    marginTop: sh(20),
  },
  errorText: {
    color: '#D32F2F',
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
  },
  errorSubtext: {
    color: '#666',
    fontSize: sf(12),
    fontFamily: 'Satoshi-Regular',
    marginTop: sh(4),
  },
  noDataOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: sf(14),
    color: '#999',
    fontFamily: 'Satoshi-Medium',
  },
  wordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(16),
  },
  passageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  // Table styles
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: sh(10),
    marginBottom: sh(10),
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  headerText: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: '#FF6B6B',
    flex: 1,
    textAlign: 'center',
  },
  attemptHeader: {
    textAlign: 'right',
    paddingRight: sw(10),
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sh(12),
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  column1: {
    flex: 1,
    paddingLeft: sw(5),
  },
  column2: {
    flex: 1,
    alignItems: 'center',
  },
  column3: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: sw(10),
  },
  wordText: {
    fontSize: sf(16),
    color: '#333',
    fontFamily: 'Satoshi-MediumItalic',
  },
  miscueTypeBadge: {
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: sw(12),
    minWidth: sw(100),
    alignItems: 'center',
  },
  miscueTypeText: {
    color: 'white',
    fontSize: sf(12),
    fontFamily: 'Satoshi-Bold',
  },
  attemptCount: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: '#999',
  },
  averagesCard: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#5B5FED',
  },
  averagesTitle: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#5B5FED',
    marginBottom: sh(16),
  },
  averagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: sw(12),
    padding: sw(10),
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: sf(24),
    fontFamily: 'Satoshi-Bold',
    color: '#5B5FED',
    marginBottom: sh(4),
  },
  statLabel: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: '#666',
  },
  statDivider: {
    width: sw(1),
    height: sw(40),
    backgroundColor: '#E5E7EB',
  },
  filterIndicator: {
    backgroundColor: '#F0F9FF',
    padding: sw(16),
    borderRadius: sw(12),
    marginBottom: sh(16),
    borderLeftWidth: 4,
    borderLeftColor: '#5B5FED',
  },
  filterIndicatorText: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#1F2937',
  },
  filterBold: {
    fontFamily: 'Satoshi-Bold',
    color: '#5B5FED',
  },
  filterYear: {
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  noDataContainer: {
    paddingVertical: sh(20),
    alignItems: 'center',
  },
  noDataMessage: {
    fontSize: sf(14),
    color: '#999',
    fontFamily: 'Satoshi-Medium',
  },
});

export default MiscueAnalytics;
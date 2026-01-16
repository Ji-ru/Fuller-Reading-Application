import React, { use } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useMiscueAnalystics, useOverallAverageWPMandAccuracy } from '../../Hooks/useReadingStudentStats';
import { useTopMiscueIdentifier } from '../../Hooks/useReadingStudentStats';
import { AverageWPMandAccuracy } from '../../Types/miscue';

// Update these interfaces to match the actual data structure
interface MiscueData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface CommonWord {
  word: string;
  errorExample: string; // Changed from 'spoken'
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
  miscueData?: MiscueData[];
  topPassage?: TopMiscuedPassage;
  commonWords?: CommonWord[];
  averages?: AverageWPMandAccuracy;
}

const MiscueAnalytics: React.FC<MiscueAnalyticsProps> = ({
  facultyId = null,
  miscueData: propMiscueData,
  topPassage: propTopPassage,
  commonWords: propCommonWords,
  averages: propAverages,
}) => {
  
  // Hook for common miscue type
  const { miscueData: hookMiscueData, loading, error } = useMiscueAnalystics(facultyId);

  // Hook for Top 5 Miscue Data
  const { topMiscue, loading: topMiscueLoading, error: topMiscueError } = useTopMiscueIdentifier(facultyId);
  
  // Hook for getting the average of WPM and Accuracy
  const { averages: hookAverages, loading: averagesLoading, error: averagesError } = useOverallAverageWPMandAccuracy(facultyId);
  
  // Default data for fallback  
  const defaultMiscueData: MiscueData[] = [
    { type: 'Substitution', count: 13, percentage: 20.4, color: '#FF2726' },
    { type: 'Omission', count: 52, percentage: 46.0, color: '#FF941A' },
    { type: 'Insertion', count: 19, percentage: 19.5, color: '#1A81FF' },
    { type: 'Repetition', count: 16, percentage: 14.1, color: '#BF00DD' },
  ];

  const defaultTopPassage: TopMiscuedPassage = {
    title: 'Hickory Dickory Dock',
    averageAccuracy: 47.0,
    attempts: 5,
    totalMiscues: 10,
  };

  const defaultCommonWords: CommonWord[] = [
    { word: 'dock', errorExample: 'dog', errorCount: 5 },
    { word: 'dickory', errorExample: 'dicory', errorCount: 4 },
    { word: 'the', errorExample: 'da', errorCount: 4 },
    { word: 'mouse', errorExample: 'mice', errorCount: 2 },
    { word: 'ran', errorExample: 'run', errorCount: 2 },
  ];

  // Determine which data to use
  let data = defaultMiscueData;
  let passage = propTopPassage || defaultTopPassage;
  let words = propCommonWords || defaultCommonWords;
    
    // Determine which averages to use
  const averages = propAverages || hookAverages || {
    averageAccuracy: 0,
    averageWPM: 0,
    totalReports: 0,
    totalStudents: 0
  };

  // Use hook miscue data if available and has values
  if (propMiscueData) {
    data = propMiscueData;
  } else if (hookMiscueData && hookMiscueData.length > 0) {
    const totalCount = hookMiscueData.reduce(
      (sum, item) => sum + item.count,
      0,
    );
    if (totalCount > 0) {
      data = hookMiscueData;
    }
  }

  // Use top miscue data from hook
  if (topMiscue && topMiscue.length > 0) {
    // Use top miscued passage from hook if available
    if (
      topMiscue[0].topMiscuedPassage &&
      topMiscue[0].topMiscuedPassage.length > 0 &&
      topMiscue[0].topMiscuedPassage[0].title !== 'No data'
    ) {
      const passageData = topMiscue[0].topMiscuedPassage[0];
      passage = {
        title: passageData.title,
        averageAccuracy: passageData.averageAccuracy,
        attempts: passageData.attempts,
        totalMiscues: passageData.totalMiscues,
      };
    }

    // Use common miscue words from hook if available
    if (
      topMiscue[0].commonMiscueWords &&
      topMiscue[0].commonMiscueWords.length > 0 &&
      !propCommonWords
    ) {
      words = topMiscue[0].commonMiscueWords.map(word => ({
        word: word.word,
        errorExample: word.errorExample,
        errorCount: word.errorCount,
        dominantMiscueType: word.dominantMiscueType,
      }));
    }
  }

  // Calculate total for pie chart segments
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate pie chart segments
  const radius = 70;
  const strokeWidth = 20;
  const center = radius + strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90; // Start from top

  // Show loading state - check both hooks
  if (loading || topMiscueLoading || averagesLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Common Miscue Type</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5B5FED" />
            <Text style={styles.loadingText}>Loading miscue analytics...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Show error state - check both hooks
  const hasError = error || topMiscueError || averagesError;
  if (hasError && !propMiscueData) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Common Miscue Type</Text>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading miscue data</Text>
            <Text style={styles.errorSubtext}>{error || topMiscueError || averagesError}</Text>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Pie Chart Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Common Miscue Type</Text>
          <Text style={styles.menuDots}>⋯</Text>
        </View>

        <View style={styles.pieChartContainer}>
          {/* Pie Chart */}
          <View style={styles.chartWrapper}>
            <Svg
              width={center * 2}
              height={center * 2}
              viewBox={`0 0 ${center * 2} ${center * 2}`}
            >
              <G rotation={0} origin={`${center}, ${center}`}>
                {data.map((item, index) => {
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
                })}
              </G>
            </Svg>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {data.map((item, index) => (
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
            ))}
          </View>
        </View>
      </View>

       
      {/* Average Stats Card */}
      <View style={[styles.card, styles.averagesCard]}>
        <Text style={styles.averagesTitle}>Overall Reading Statistics</Text>
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
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{averages.totalReports}</Text>
            <Text style={styles.statLabel}>Reports</Text>
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

        {words && words.length > 0 ? (
          <>
            {/* Header Row */}
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Word</Text>
              <Text style={styles.headerText}>Miscue Type</Text>
              <Text style={[styles.headerText, styles.attemptHeader]}>
                Attempt
              </Text>
            </View>

            {/* Data Rows */}
            {words.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                {/* Column 1: Expected Word */}
                <View style={styles.column1}>
                  <Text style={styles.wordText}>"{item.word}"</Text>
                </View>

                {/* Column 2: Miscue Type */}
                <View style={styles.column2}>
                  {item.dominantMiscueType && (
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

                {/* Column 3: Attempts */}
                <View style={styles.column3}>
                  <Text style={styles.attemptCount}>
                    {item.errorCount} times
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noDataText}>No miscue words data available</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#333',
  },
  menuDots: {
    fontSize: 20,
    color: '#999',
    fontFamily: 'Satoshi-Bold',
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
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Satoshi-Medium',
  },
  legendValue: {
    fontSize: 14,
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
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  passageName: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    color: '#333',
    marginBottom: 16,
  },
  passageStatLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'Satoshi-Bold',
  },
  passageStatValue: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#333',
  },
  passageStatRight: {
    alignItems: 'flex-end',
  },
  wordsCard: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  wordsTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#FF6B6B',
    marginBottom: 16,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },

  wordCount: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#999',
  },
  // Add these styles
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  errorSubtext: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
    marginTop: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
    paddingVertical: 20,
  },

  wordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  topMiscueTypeBadge: {
    backgroundColor: '#5B5FED',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
  },

  wordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  wordDetails: {
    alignItems: 'flex-end',
  },

  wordExample: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Satoshi-Regular',
    marginBottom: 2,
  },
  passageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  passageStatColumn: {
    flex: 1,
    minWidth: 100,
  },
   // Table styles
   tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  
  headerText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#FF6B6B',
    flex: 1,
    textAlign: 'center',
  },
  
  attemptHeader: {
    textAlign: 'right',
    paddingRight: 10,
  },
  
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  
  column1: {
    flex: 1,
    paddingLeft: 5,
  },
  
  column2: {
    flex: 1,
    alignItems: 'center',
  },
  
  column3: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  
  wordText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Satoshi-MediumItalic',
  },
  
  miscueTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  
  miscueTypeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
  },
  
  attemptCount: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#999',
  },
  averagesCard: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#5B5FED',
  },
  
  averagesTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#5B5FED',
    marginBottom: 16,
  },
  
  averagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    color: '#5B5FED',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#666',
  },
  
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
});

export default MiscueAnalytics;

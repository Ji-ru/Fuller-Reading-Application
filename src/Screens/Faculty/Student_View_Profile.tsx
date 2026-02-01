import React, { use } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';

import bubbles from '../../UI_Designs/BubblesDesign';
import upperNav from '../../UI_Designs/UpperNavigation';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { useStudentReadingStats } from '../../Hooks/use_ReadingStudentStats';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type RouteParams = {
  StudentViewProfile: {
    studentId: string;
    studentName: string;
    readingLevel: string;
  };
};

interface ProgressData {
  date: string;
  accuracy: number;
  wpm: number;
  passageTitle: string;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function StudentViewProfile() {
  const route = useRoute<RouteProp<RouteParams, 'StudentViewProfile'>>();
  const { studentId, studentName, readingLevel } = route.params;

  const { handleBackStep } = useNavigationHelper();
  const { stats, progress, loading, error, refresh } =
    useStudentReadingStats(studentId);

  const topMiscuedPassage = stats?.passagePerformance?.[0];
  const hasProgressData = progress.length > 0;

  /* ------------------------------------------------------------------------ */
  /* LOADING                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading reading statistics...</Text>
      </SafeAreaView>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR                                                                    */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /**
   * ==========================================================================
   * ACCURACY CHART COMPONENT
   * ==========================================================================
   * Renders a line chart showing accuracy progression over time
   * Features:
   * - Animated bars with connecting lines
   * - Y-axis percentage labels
   * - Color-coded by performance level
   * @param data - Array of progress data points
   * ==========================================================================
   */
  const AccuracyChart = ({ data }: { data: ProgressData[] }) => {
    const maxHeight = 120;
    const chartData = data.slice(-10); // Show last 10 readings

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartSubtitle}>Accuracy Over Time</Text>
        <View style={styles.chartWrapper}>
          {/* Y-Axis Labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>100%</Text>
            <Text style={styles.yAxisLabel}>75%</Text>
            <Text style={styles.yAxisLabel}>50%</Text>
            <Text style={styles.yAxisLabel}>25%</Text>
            <Text style={styles.yAxisLabel}>0%</Text>
          </View>

          {/* Chart Bars */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chartScroll}
          >
            <View style={styles.chartBarsContainer}>
              {chartData.map((item, index) => {
                const height = (item.accuracy / 100) * maxHeight;
                const isLast = index === chartData.length - 1;
                const barColor =
                  item.accuracy >= 90
                    ? '#10b981'
                    : item.accuracy >= 75
                    ? '#f59e0b'
                    : '#ef4444';

                return (
                  <View key={index} style={styles.chartBarWrapper}>
                    <View style={styles.chartBarColumn}>
                      {/* Accuracy Value */}
                      <Text style={[styles.chartValue, { color: barColor }]}>
                        {item.accuracy}%
                      </Text>

                      {/* Bar */}
                      <View
                        style={[
                          styles.chartBar,
                          { height, backgroundColor: barColor },
                        ]}
                      />

                      {/* Connector Line */}
                      {!isLast && (
                        <View
                          style={[
                            styles.chartConnector,
                            { backgroundColor: barColor },
                          ]}
                        />
                      )}
                    </View>

                    {/* Date Label */}
                    <Text style={styles.chartLabel}>{item.date}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  /**
   * ==========================================================================
   * PERFORMANCE SUMMARY COMPONENT
   * ==========================================================================
   * Displays aggregate statistics and trend analysis
   * Features:
   * - Best accuracy, average WPM, total readings
   * - Progress trend indicator with emoji
   * - First vs last comparison
   * @param data - Array of progress data points
   * ==========================================================================
   */
  const PerformanceSummary = ({ data }: { data: ProgressData[] }) => {
    // Safety checks for empty data
    if (data.length === 0) {
      return (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Performance Summary</Text>
          <Text style={styles.noDataText}>No reading data available</Text>
        </View>
      );
    }

    // Find best and worst accuracy
    const bestAccuracy = Math.max(...data.map(d => d.accuracy));
    const worstAccuracy = Math.min(...data.map(d => d.accuracy));

    // Calculate average WPM with safety check
    const totalWPM = data.reduce((sum, d) => sum + d.wpm, 0);
    const avgWPM = Math.round(totalWPM / data.length);

    // Find best and average WPM
    const bestWPM = Math.max(...data.map(d => d.wpm));

    // Calculate WPM improvement
    const firstWPM = data[0]?.wpm || 0;
    const lastWPM = data[data.length - 1]?.wpm || 0;
    const wpmImprovement = lastWPM - firstWPM;

    // Accuracy trend calculation
    const firstAccuracy = data[0]?.accuracy || 0;
    const lastAccuracy = data[data.length - 1]?.accuracy || 0;
    const accuracyImprovement = lastAccuracy - firstAccuracy;

    // Determine overall trend (weighted: 70% accuracy, 30% WPM)
    const accuracyTrendScore =
      accuracyImprovement > 5 ? 1 : accuracyImprovement < -5 ? -1 : 0;
    const wpmTrendScore =
      wpmImprovement > 10 ? 1 : wpmImprovement < -10 ? -1 : 0;
    const overallTrendScore = accuracyTrendScore * 0.7 + wpmTrendScore * 0.3;

    const isImproving = overallTrendScore > 0.2;
    const isDecreasing = overallTrendScore < -0.2;

    const totalReadings = data.length;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Performance Summary</Text>

        {/* Stats Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{bestAccuracy}%</Text>
            <Text style={styles.summaryLabel}>Best Accuracy</Text>
            {worstAccuracy > 0 && (
              <Text style={styles.summarySubtext}>
                Lowest: {worstAccuracy}%
              </Text>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{avgWPM}</Text>
            <Text style={styles.summaryLabel}>Avg WPM</Text>
            {bestWPM > avgWPM && (
              <Text style={styles.summarySubtext}>Best: {bestWPM}</Text>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalReadings}</Text>
            <Text style={styles.summaryLabel}>Total Readings</Text>
            {data.length >= 5 && (
              <Text style={styles.summarySubtext}>
                Last 7 days: {data.slice(-7).length}
              </Text>
            )}
          </View>
        </View>

        {/* Progress Trend - More Detailed */}
        {data.length >= 2 && (
          <View style={styles.trendContainer}>
            <Text style={styles.trendTitle}>Progress Analysis</Text>

            <View style={styles.trendRow}>
              <Text style={styles.trendLabel}>Accuracy Trend:</Text>
              <View style={styles.trendValueContainer}>
                <Text style={styles.trendValue}>
                  {firstAccuracy}% → {lastAccuracy}%
                  {accuracyImprovement !== 0 && (
                    <Text
                      style={
                        accuracyImprovement > 0
                          ? styles.positiveTrend
                          : styles.negativeTrend
                      }
                    >
                      {accuracyImprovement > 0 ? ' ↑' : ' ↓'}{' '}
                      {Math.abs(accuracyImprovement).toFixed(1)}%
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.trendRow}>
              <Text style={styles.trendLabel}>WPM Trend:</Text>
              <View style={styles.trendValueContainer}>
                <Text style={styles.trendValue}>
                  {firstWPM} → {lastWPM}
                  {wpmImprovement !== 0 && (
                    <Text
                      style={
                        wpmImprovement > 0
                          ? styles.positiveTrend
                          : styles.negativeTrend
                      }
                    >
                      {wpmImprovement > 0 ? ' ↑' : ' ↓'}{' '}
                      {Math.abs(wpmImprovement)}
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            {/* Overall Trend Indicator */}
            <View style={styles.overallTrendContainer}>
              <Text style={styles.overallTrendLabel}>Overall Progress:</Text>
              <View style={styles.trendIndicator}>
                {isImproving ? (
                  <>
                    <Text style={styles.trendEmoji}>📈</Text>
                    <Text style={styles.trendUp}>Significant Improvement</Text>
                  </>
                ) : isDecreasing ? (
                  <>
                    <Text style={styles.trendEmoji}>📉</Text>
                    <Text style={styles.trendDown}>Needs Attention</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.trendEmoji}>➡️</Text>
                    <Text style={styles.trendNeutral}>Steady Progress</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };
  /**
   * ==========================================================================
   * WPM CHART COMPONENT
   * ==========================================================================
   * Renders a bar chart showing words per minute progression
   * Features:
   * - Vertical bars scaled to max WPM
   * - Value labels on bars
   * - Gradient-like color scheme
   * @param data - Array of progress data points
   * ==========================================================================
   */
  const WPMChart = ({ data }: { data: ProgressData[] }) => {
    const maxHeight = 100;
    const chartData = data.slice(-10); // Show last 10 readings
    const maxWPM = Math.max(...chartData.map(d => d.wpm), 100);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartSubtitle}>Words Per Minute Over Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.wpmChartContainer}>
            {chartData.map((item, index) => {
              const height = (item.wpm / maxWPM) * maxHeight;
              const barColor = `hsl(${
                160 + (item.wpm / maxWPM) * 40
              }, 70%, 50%)`;

              return (
                <View key={index} style={styles.wpmBarWrapper}>
                  <Text style={styles.wpmValue}>{item.wpm}</Text>
                  <View
                    style={[
                      styles.wpmBar,
                      { height, backgroundColor: '#10b981' },
                    ]}
                  />
                  <Text style={styles.wpmLabel}>{item.date}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          {/* BUBBLES */}
          <View style={bubbles.bubblesContainer}>
            <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          </View>

          {/* HEADER */}
          <View style={upperNav.header}>
            <TouchableOpacity
              style={upperNav.touchable}
              onPress={handleBackStep}
            >
              <Image
                source={require('../../../assets/icons/BackButton-icon.png')}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Student Reading Profile</Text>

            <View style={{ width: 40 }} />
          </View>

          {/* STUDENT SUMMARY */}
          <View style={styles.profileHeader}>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.studentMeta}>
              Reading Level: {readingLevel}
            </Text>
          </View>

          {/* READING STATISTICS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reading Statistics</Text>

            <View style={styles.statsGrid}>
              <StatCard
                number={stats?.totalAttempts || 0}
                label="Total Attempts"
              />
              <StatCard
                number={`${stats?.averageAccuracy || 0}%`}
                label="Avg. Accuracy"
              />
              <StatCard
                number={stats?.topMiscueType || 'N/A'}
                label="Top Miscue Type"
              />
            </View>

            {topMiscuedPassage && (
              <View style={styles.miscueCard}>
                <Text style={styles.miscueTitle}>Top Miscued Passage</Text>
                <Text style={styles.miscuePassage}>
                  {topMiscuedPassage.title}
                </Text>
                <View style={styles.miscueStats}>
                  <Text style={styles.miscueStat}>
                    Accuracy:{' '}
                    <Text style={styles.miscueStatValue}>
                      {topMiscuedPassage.accuracy.toFixed(1)}%
                    </Text>
                  </Text>
                  <Text style={styles.miscueStat}>
                    Attempts:{' '}
                    <Text style={styles.miscueStatValue}>
                      {topMiscuedPassage.attempts}
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            {stats?.mostCommonMiscueWords?.length ? (
              <View style={styles.miscueCard}>
                <Text style={styles.miscueTitle}>Most Common Miscue Words</Text>
                {stats.mostCommonMiscueWords.map((item, index) => (
                  <View key={index} style={styles.wordItem}>
                    <Text style={styles.wordText}>"{item.word}"</Text>
                    <Text style={styles.wordCount}>{item.count}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* PROGRESS */}
          {hasProgressData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reading Progress</Text>
              <AccuracyChart data={progress} />
              <WPMChart data={progress} />
              <PerformanceSummary data={progress} />
            </View>
          )}

          {/* REFRESH */}
          <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* REUSED CHILD COMPONENTS (UNCHANGED LOGIC)                                  */
/* -------------------------------------------------------------------------- */

const StatCard = ({
  number,
  label,
}: {
  number: number | string;
  label: string;
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/* ⬇️ AccuracyChart, WPMChart, PerformanceSummary
   COPY DIRECTLY FROM Profile — NO CHANGES REQUIRED ⬇️ */

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    padding: 10,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'relative',
    zIndex: 100,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  studentRole: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  miscueCard: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  miscueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  miscuePassage: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
  },
  miscueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miscueStat: {
    fontSize: 14,
    color: '#64748b',
  },
  miscueStatValue: {
    fontWeight: '600',
    color: '#1e293b',
  },
  wordList: {
    marginTop: 8,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  wordText: {
    fontSize: 14,
    color: '#1e293b',
    fontStyle: 'italic',
  },
  wordCount: {
    fontSize: 12,
    color: '#64748b',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  chartWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    minHeight: 160,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
    height: 120,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  chartScroll: {
    flex: 1,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 4,
  },
  chartBarWrapper: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  chartBarColumn: {
    alignItems: 'center',
    position: 'relative',
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartBar: {
    width: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 4,
  },
  chartConnector: {
    position: 'absolute',
    top: '55%',
    right: -6,
    width: 12,
    height: 2,
    opacity: 0.4,
  },  
  chartLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  wpmChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 10,
    marginTop: 10,
  },

  wpmBar: {
    width: 20,
    backgroundColor: '#10b981',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 4,
  },

  statsSummaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },

  statsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  statBoxNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },

  statBoxLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  trendContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },

  trendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },

  trendIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  trendText: {
    fontSize: 14,
    color: '#64748b',
  },

  trendArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendUp: {
    fontSize: 20,
    marginRight: 6,
  },

  trendUpText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },

  trendDown: {
    fontSize: 20,
    marginRight: 6,
  },

  trendDownText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },

  trendNeutral: {
    fontSize: 20,
    marginRight: 6,
  },

  trendNeutralText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  // WPM Chart styles
  wpmBarWrapper: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  wpmValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
  },
  wpmLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  // Performance Summary styles
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  trendContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendEmoji: {
    fontSize: 20,
    marginRight: 6,
  },

  // Refresh Button
  refreshButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  noDataText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 16,
  },

  summarySubtext: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },

  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  trendLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },

  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendValue: {
    fontSize: 14,
    color: '#1e293b',
  },

  positiveTrend: {
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },

  negativeTrend: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 4,
  },

  overallTrendContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },

  overallTrendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  studentMeta: {
    fontSize: 14,
    color: '#64748b',
  },
});

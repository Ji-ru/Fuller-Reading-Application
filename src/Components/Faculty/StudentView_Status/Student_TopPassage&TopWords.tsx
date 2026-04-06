import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from "react-native";
import { useStudentTopMiscuePassageAndWords } from "../../../Hooks/Faculty/use_StudentView_Progress";
import { sw, sh, sf } from '../../../Utils/responsive';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 380;

interface MiscueInsightsCardProps {
  studentId: string;
}

const StudentTopMiscuePassageAndWords: React.FC<MiscueInsightsCardProps> = ({ studentId }) => {
  const { topPassage, topWords, loading, error } = useStudentTopMiscuePassageAndWords(studentId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading miscue insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!topPassage && (!topWords || topWords.length === 0)) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noDataText}>No miscue data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Miscued Passage Card */}
      {topPassage && (
        <View style={[styles.card, styles.passageCard]}>
          <Text style={styles.passageTitle}>Top Miscued Passage</Text>
          <Text style={styles.passageName} numberOfLines={2}>
            {topPassage.title}
          </Text>
          <View style={styles.passageStats}>
            <View style={styles.passageStatItem}>
              <Text style={styles.passageStatLabel}>Accuracy:</Text>
              <Text style={styles.passageStatValue}>
                {topPassage.averageAccuracy.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.passageStatItem}>
              <Text style={styles.passageStatLabel}>Attempts:</Text>
              <Text style={styles.passageStatValue}>{topPassage.attempts}</Text>
            </View>
            <View style={styles.passageStatItem}>
              <Text style={styles.passageStatLabel}>Miscues:</Text>
              <Text style={styles.passageStatValue}>{topPassage.totalMiscues}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Most Common Miscue Words Card */}
      <View style={[styles.card, styles.wordsCard]}>
        <View style={styles.wordsHeader}>
          <Text style={styles.wordsTitle}>Most Common Miscue Words</Text>
        </View>

        {topWords && topWords.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Word</Text>
              <Text style={styles.headerText}>Miscue Type</Text>
              <Text style={[styles.headerText, styles.attemptHeader]}>Attempt</Text>
            </View>

            {topWords.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.column1}>
                  <Text style={styles.wordText}>"{item.word}"</Text>
                </View>

                <View style={styles.column2}>
                  {item.dominantMiscueType && item.dominantMiscueType !== 'N/A' ? (
                    <View
                      style={[
                        styles.miscueTypeBadge,
                        item.dominantMiscueType === 'Substitution' && styles.substitutionBadge,
                        item.dominantMiscueType === 'Omission' && styles.omissionBadge,
                        item.dominantMiscueType === 'Insertion' && styles.insertionBadge,
                        item.dominantMiscueType === 'Repetition' && styles.repetitionBadge,
                      ]}
                    >
                      <Text style={styles.miscueTypeText}>{item.dominantMiscueType}</Text>
                    </View>
                  ) : (
                    <Text style={styles.noMiscueType}>N/A</Text>
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
    flex: 1,
    width: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: sh(12),
    fontSize: sf(16),
    color: '#6b7280',
  },
  errorText: {
    fontSize: sf(16),
    color: '#ef4444',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: sf(16),
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: sw(12),
    padding: isSmallScreen ? 12 : 15,
    marginHorizontal: sw(10),
    marginBottom: sh(16),
    elevation: 5,
  },
  passageCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  wordsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  passageTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: sh(8),
  },
  passageName: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: sh(16),
  },
  passageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sh(8),
  },
  passageStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  passageStatLabel: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#6b7280',
    marginBottom: sh(4),
  },
  passageStatValue: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  wordsHeader: {
    marginBottom: sh(16),
  },
  wordsTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: sh(12),
    paddingHorizontal: sw(8),
    borderRadius: sw(8),
    marginBottom: sh(8),
  },
  headerText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  attemptHeader: {
    textAlign: 'right',
    paddingRight: sw(8),
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(12),
    paddingHorizontal: sw(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  column1: {
    flex: 1,
  },
  column2: {
    flex: 1,
    alignItems: 'center',
  },
  column3: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: sw(8),
  },
  wordText: {
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '500',
    color: '#1f2937',
    fontStyle: 'italic',
  },
  miscueTypeBadge: {
    paddingHorizontal: sw(12),
    paddingVertical: sh(4),
    borderRadius: sw(20),
    minWidth: sw(80),
    alignItems: 'center',
  },
  miscueTypeText: {
    color: 'white',
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  substitutionBadge: {
    backgroundColor: '#FF2726',
  },
  omissionBadge: {
    backgroundColor: '#FF941A',
  },
  insertionBadge: {
    backgroundColor: '#1A81FF',
  },
  repetitionBadge: {
    backgroundColor: '#BF00DD',
  },
  noMiscueType: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  attemptCount: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#374151',
    fontWeight: '500',
  },
  noDataContainer: {
    padding: sw(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataMessage: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default StudentTopMiscuePassageAndWords;
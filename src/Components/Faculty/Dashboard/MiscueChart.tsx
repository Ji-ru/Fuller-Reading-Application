import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  useMiscueAnalystics,
  useOverallAverageWPMandAccuracy,
  useTopMiscueIdentifier,
} from '../../../Hooks/use_ReadingStudentStats';
import { FilterOptions } from '../../../Interfaces/miscue';
import { sw, sh, sf } from '../../../Utils/responsive';
import { FacultyColors } from '../../../Utilities/Theme';
import { DateRangeFilter, DateBounds } from '../../GlobalUse/DateRangeFilter';

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  primary: FacultyColors.primary,
  primaryLight: FacultyColors.primaryLight,
  primaryPale: FacultyColors.primaryPale,
  accent: FacultyColors.sky,
  card: FacultyColors.white,
  ink: FacultyColors.ink,
  inkLight: FacultyColors.inkLight,
  slate: FacultyColors.slate,
  border: '#E5E7EB',
  inputBg: '#F3F8FF',
  green: FacultyColors.primaryLight,
  coral: FacultyColors.coral,
  track: FacultyColors.primaryPale,
  // Miscue colors (use-case specific, kept as is for clarity)
  substitution: '#FF5252',
  substitutionBg: '#FFEBEE',
  omission: '#FF9800',
  omissionBg: '#FFF3E0',
  insertion: '#42A5F5',
  insertionBg: '#E3F2FD',
  repetition: '#AB47BC',
  repetitionBg: '#F3E5F5',
};

const MISCUE_COLORS: Record<string, { bar: string; bg: string }> = {
  Substitution: { bar: C.substitution, bg: C.substitutionBg },
  Omission: { bar: C.omission, bg: C.omissionBg },
  Insertion: { bar: C.insertion, bg: C.insertionBg },
  Repetition: { bar: C.repetition, bg: C.repetitionBg },
};

interface MiscueData {
  type: string;
  count: number;
  percentage: number;
}

interface CommonWord {
  word: string;
  errorCount: number;
  studentCount: number;
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
  /** Display name of the currently selected class — used in the header when not viewing overall. */
  className?: string;
  totalStudentsInClass?: number;
}

const MiscueAnalytics: React.FC<MiscueAnalyticsProps> = ({
  facultyId = null,
  filter,
  className,
  totalStudentsInClass,
}) => {
  const { selectedView, academicYear } = filter;
  const isOverall = selectedView === 'overall';

  const [dateBounds, setDateBounds] = useState<DateBounds | null>(null);

  const filterOptions = useMemo<FilterOptions>(() => {
    const options: FilterOptions = {
      type: isOverall ? 'overall' : 'class',
    };
    if (!isOverall && selectedView) options.classId = selectedView;
    if (academicYear) options.acadYear = academicYear;
    if (dateBounds) {
      options.startDate = dateBounds.start;
      options.endDate = dateBounds.end;
    }
    return options;
  }, [isOverall, selectedView, academicYear, dateBounds]);

  const {
    miscueData: hookMiscueData,
    loading: miscueLoading,
    error: miscueError,
  } = useMiscueAnalystics(facultyId, filterOptions);

  const {
    topMiscue,
    loading: topMiscueLoading,
    error: topMiscueError,
  } = useTopMiscueIdentifier(facultyId, filterOptions);

  const {
    averages: hookAverages,
    loading: averagesLoading,
    error: averagesError,
  } = useOverallAverageWPMandAccuracy(facultyId, filterOptions);

  const isLoading = miscueLoading || topMiscueLoading || averagesLoading;
  const hasError = miscueError || topMiscueError || averagesError;

  // Data processing
  const miscueData = hookMiscueData || [];
  const totalMiscues = miscueData.reduce((sum, item) => sum + item.count, 0);
  const maxMiscueCount = miscueData.length > 0 ? Math.max(...miscueData.map(d => d.count), 1) : 1;
  const averages = hookAverages || { averageAccuracy: 0, averageWPM: 0, totalStudents: 0 };
  const totalStudentsForWords = totalStudentsInClass ?? averages.totalStudents;

  let passage: TopMiscuedPassage | null = null;
  let words: CommonWord[] = [];

  // Check for actual data presence rather than relying on a magic sentinel string.
  const data = topMiscue?.[0];
  if (data) {
    if (data.topMiscuedPassage && data.topMiscuedPassage.length > 0) {
      const p = data.topMiscuedPassage[0];
      passage = {
        title: p.title,
        averageAccuracy: p.averageAccuracy,
        attempts: p.attempts,
        totalMiscues: p.totalMiscues,
      };
    }
    if (data.commonMiscueWords && data.commonMiscueWords.length > 0) {
      words = data.commonMiscueWords.map(w => ({
        word: w.word,
        errorCount: w.errorCount,
        studentCount: w.studentCount ?? 0,
        dominantMiscueType: w.dominantMiscueType,
      }));
    }
  }

  return (
    <ScrollView style={S.container} showsVerticalScrollIndicator={false}>
      {/* ── Date Filter ─────────────────────────────────────────────── */}
      <View style={S.filterCard}>
        <DateRangeFilter simple onRangeChange={setDateBounds} />
      </View>

      {isLoading ? (
        <View style={S.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={S.loadingText}>Loading statistics...</Text>
        </View>
      ) : hasError ? (
        <View style={S.errorCard}>
          <Text style={S.errorText}>⚠️ Error loading data</Text>
          <Text style={S.errorSub}>{miscueError || topMiscueError || averagesError}</Text>
        </View>
      ) : (
        <>
          {/* ── Section 1: Average Stats (New Layout) ───────────────── */}
          <View style={S.sectionCard}>
            <Text style={S.sectionTitle}>
              {isOverall ? 'Overall' : (className || 'Class')} Reading Statistics
            </Text>
            <Text style={S.sectionSubtitle}>
              {academicYear ? `SY ${academicYear}` : 'No academic year selected'}
            </Text>

            <View style={S.statsGridRow}>
              <View style={S.statItem}>
                <Text style={S.statValue}>{averages.averageAccuracy}%</Text>
                <Text style={S.statLabel}>Avg. Accuracy</Text>
              </View>
              <View style={S.statDivider} />
              <View style={S.statItem}>
                <Text style={S.statValue}>{averages.averageWPM}</Text>
                <Text style={S.statLabel}>Avg. WPM</Text>
              </View>
              <View style={S.statDivider} />
              <View style={S.statItem}>
                <Text style={S.statValue}>{averages.totalStudents}</Text>
                <Text style={S.statLabel}>Students</Text>
              </View>
            </View>
          </View>

          {/* ── Section 2: Miscue Type Breakdown ────────────────────── */}
          <View style={S.sectionCard}>
            <Text style={S.sectionTitle}>Common Miscue Types</Text>
            <Text style={S.sectionSubtitle}>{totalMiscues} total miscues recorded</Text>

            {totalMiscues === 0 ? (
              <View style={S.emptyBox}>
                <Text style={S.emptyText}>No miscues recorded yet 🎉</Text>
              </View>
            ) : (
              <View style={S.barsContainer}>
                {miscueData.map((item, index) => {
                  const pct = maxMiscueCount > 0 ? (item.count / maxMiscueCount) * 100 : 0;
                  const colors = MISCUE_COLORS[item.type] || { bar: C.slate, bg: C.track };
                  return (
                    <View key={index} style={S.miscueRow}>
                      <View style={S.miscueHeader}>
                        <View style={[S.miscueDot, { backgroundColor: colors.bar }]} />
                        <Text style={S.miscueType}>{item.type}</Text>
                        <Text style={S.miscuePct}>{item.percentage.toFixed(0)}%</Text>
                      </View>
                      <View style={S.barRow}>
                        <View style={[S.barTrack, { backgroundColor: colors.bg }]}>
                          <View style={[S.barFill, { width: `${pct}%` as any, backgroundColor: colors.bar }]} />
                        </View>
                        <Text style={[S.barCount, { color: colors.bar }]}>{item.count}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── Section 3: Top Miscued Passage ───────────────────────── */}
          <View style={S.sectionCard}>
            <Text style={S.sectionTitle}>Top Miscued Passage</Text>

            {!passage ? (
              <View style={S.emptyBox}>
                <Text style={S.emptyText}>No passage data available</Text>
              </View>
            ) : (
              <View>
                <Text style={S.passageName}>"{passage.title}"</Text>
                <View style={S.passageStatsRow}>
                  <View style={S.passageStat}>
                    <Text style={S.passageStatValue}>{passage.averageAccuracy.toFixed(1)}%</Text>
                    <Text style={S.passageStatLabel}>Accuracy</Text>
                  </View>
                  <View style={S.passageStatDivider} />
                  <View style={S.passageStat}>
                    <Text style={S.passageStatValue}>{passage.attempts}</Text>
                    <Text style={S.passageStatLabel}>Attempts</Text>
                  </View>
                  <View style={S.passageStatDivider} />
                  <View style={S.passageStat}>
                    <Text style={[S.passageStatValue, { color: C.coral }]}>{passage.totalMiscues}</Text>
                    <Text style={S.passageStatLabel}>Miscues</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ── Section 4: Most Miscued Words ────────────────────────── */}
          <View style={S.sectionCard}>
            <Text style={S.sectionTitle}>Most Common Miscue Words</Text>

            {words.length === 0 ? (
              <View style={S.emptyBox}>
                <Text style={S.emptyText}>No word data available</Text>
              </View>
            ) : (
              <View>
                {words.map((item, index) => {
                  const colors = MISCUE_COLORS[item.dominantMiscueType || ''] || { bar: C.slate, bg: C.track };
                  const studentPct = totalStudentsForWords
                    ? item.studentCount / totalStudentsForWords
                    : null;
                  const studentColor =
                    studentPct === null ? C.inkLight
                    : studentPct > 0.5 ? C.coral
                    : studentPct > 0.25 ? C.omission
                    : C.inkLight;
                  const studentBg =
                    studentPct === null ? C.inputBg
                    : studentPct > 0.5 ? C.substitutionBg
                    : studentPct > 0.25 ? C.omissionBg
                    : C.inputBg;
                  return (
                    <View key={index} style={[S.wordRow, index === words.length - 1 && S.wordRowLast]}>
                      <View style={S.wordRank}>
                        <Text style={S.wordRankText}>{index + 1}</Text>
                      </View>
                      <View style={S.wordInfo}>
                        <Text style={S.wordText}>"{item.word}"</Text>
                        <View style={S.wordMetaRow}>
                          <View style={[S.wordBadge, { backgroundColor: colors.bg }]}>
                            <Text style={[S.wordBadgeText, { color: colors.bar }]}>
                              {item.dominantMiscueType || 'N/A'}
                            </Text>
                          </View>
                          <View style={[S.studentCountChip, { backgroundColor: studentBg }]}>
                            <Text style={[S.studentCountText, { color: studentColor }]}>
                              👥 {item.studentCount} student{item.studentCount !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={S.wordCount}>×{item.errorCount} errors</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const S = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: sh(10),
  },
  filterCard: {
    backgroundColor: C.card,
    borderRadius: sw(16),
    padding: sw(14),
    borderWidth: 1,
    borderColor: C.primaryLight,
    marginBottom: sh(12),
  },
  filterTitle: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: '#1B5E20',
    marginBottom: sh(8),
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: sw(40),
  },
  loadingText: {
    marginTop: sh(12),
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  errorCard: {
    backgroundColor: C.substitutionBg,
    borderRadius: sw(14),
    padding: sw(16),
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  errorText: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: C.coral,
    marginBottom: sh(4),
  },
  errorSub: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: sw(16),
    padding: sw(20),
    borderWidth: 1,
    borderColor: C.primaryLight,
    marginBottom: sh(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.05,
    shadowRadius: sw(4),
    elevation: 2,
  },
  sectionTitle: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(2),
  },
  sectionSubtitle: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
    marginBottom: sh(16),
  },
  emptyBox: {
    paddingVertical: sh(20),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },
  // Stats row
  statsGridRow: {
    flexDirection: 'row',
    backgroundColor: C.inputBg,
    borderRadius: sw(14),
    paddingVertical: sh(16),
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: sf(22),
    fontFamily: 'Satoshi-Black',
    color: C.primary,
    marginBottom: sh(2),
  },
  statLabel: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Bold',
    color: C.inkLight,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: sh(30),
    backgroundColor: C.border,
  },
  // Bars
  barsContainer: {
    gap: sh(12),
  },
  miscueRow: {
    gap: sh(4),
  },
  miscueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(6),
  },
  miscueDot: {
    width: sw(8),
    height: sw(8),
    borderRadius: sw(4),
  },
  miscueType: {
    flex: 1,
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },
  miscuePct: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.inkLight,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(10),
    paddingLeft: sw(14),
  },
  barTrack: {
    flex: 1,
    height: sw(8),
    borderRadius: sw(4),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: sw(4),
  },
  barCount: {
    minWidth: sw(30),
    fontSize: sf(13),
    fontFamily: 'Satoshi-Black',
    textAlign: 'right',
  },
  // Passage
  passageName: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
    fontStyle: 'italic',
    marginBottom: sh(14),
    marginTop: sh(4),
  },
  passageStatsRow: {
    flexDirection: 'row',
    backgroundColor: C.inputBg,
    borderRadius: sw(14),
    paddingVertical: sh(14),
    alignItems: 'center',
  },
  passageStat: {
    flex: 1,
    alignItems: 'center',
  },
  passageStatValue: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Black',
    color: C.primary,
    marginBottom: sh(2),
  },
  passageStatLabel: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Bold',
    color: C.inkLight,
    textTransform: 'uppercase',
  },
  passageStatDivider: {
    width: 1,
    height: sh(28),
    backgroundColor: C.border,
  },
  // Words
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(12),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: sw(10),
  },
  wordRowLast: {
    borderBottomWidth: 0,
  },
  wordRank: {
    width: sw(28),
    height: sw(28),
    borderRadius: sw(14),
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordRankText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
  },
  wordInfo: {
    flex: 1,
    gap: sh(2),
  },
  wordMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(6),
    flexWrap: 'wrap',
    marginTop: sh(3),
  },
  wordText: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    fontStyle: 'italic',
  },
  wordBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: sw(10),
    paddingVertical: sh(2),
    borderRadius: sw(8),
  },
  wordBadgeText: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Bold',
  },
  studentCountChip: {
    paddingHorizontal: sw(8),
    paddingVertical: sh(2),
    borderRadius: sw(8),
  },
  studentCountText: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Bold',
  },
  wordCount: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Black',
    color: C.inkLight,
  },
});

export default MiscueAnalytics;
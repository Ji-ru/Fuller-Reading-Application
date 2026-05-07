import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { usePassageDifficultyRanking } from '../../../Hooks/Faculty/usePassageDifficultyRanking';
import { FilterOptions } from '../../../Interfaces/miscue';
import { sw, sh, sf } from '../../../Utils/responsive';
import { FacultyColors, Radii, Shadows } from '../../../Utilities/Theme';

const C = {
  primary: FacultyColors.primary,
  primaryLight: FacultyColors.primaryLight,
  ink: FacultyColors.ink,
  inkLight: FacultyColors.inkLight,
  slate: FacultyColors.slate,
  white: FacultyColors.white,
  orange: FacultyColors.orange,
  red: FacultyColors.red,
  border: '#E5E7EB',
  track: '#F3F4F6',
};

const DIFFICULTY_CONFIG = {
  hard:     { label: 'HARD',  color: FacultyColors.red,     bg: '#FEE2E2', barColor: FacultyColors.red },
  moderate: { label: 'MOD',   color: FacultyColors.orange,  bg: '#FEF3C7', barColor: FacultyColors.orange },
  easy:     { label: 'EASY',  color: FacultyColors.primary, bg: '#D1FAE5', barColor: FacultyColors.primary },
} as const;

interface PassageDifficultyRankingProps {
  facultyId?: string | null;
  filter: {
    academicYear: string;
    selectedView: string;
  };
  className?: string;
}

const PassageDifficultyRanking: React.FC<PassageDifficultyRankingProps> = ({
  facultyId = null,
  filter,
  className,
}) => {
  const { selectedView, academicYear } = filter;
  const isOverall = selectedView === 'overall';
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filterOptions = useMemo<FilterOptions>(() => {
    const options: FilterOptions = { type: isOverall ? 'overall' : 'class' };
    if (!isOverall && selectedView) options.classId = selectedView;
    if (academicYear) options.acadYear = academicYear;
    return options;
  }, [isOverall, selectedView, academicYear]);

  const { rows, loading, error } = usePassageDifficultyRanking(facultyId, filterOptions);

  const hardCount = rows.filter(r => r.difficultyLevel === 'hard').length;
  const warningText = hardCount > 0
    ? `${hardCount} passage${hardCount > 1 ? 's' : ''} below 70% — review required`
    : rows.length > 0
    ? 'All passages are at or above expected accuracy'
    : '';

  return (
    <View style={S.container}>
      {/* Header */}
      <View style={S.header}>
        <View style={S.headerText}>
          <Text style={S.title}>Passage Difficulty Ranking</Text>
          <Text style={S.subtitle}>
            {isOverall ? 'Overall' : (className || 'Selected Class')}
            {academicYear ? ` · SY ${academicYear}` : ''}
          </Text>
          {warningText ? (
            <Text style={[S.warning, { color: hardCount > 0 ? C.red : C.primary }]}>
              {warningText}
            </Text>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={S.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={S.loadingText}>Loading passage data...</Text>
        </View>
      ) : error ? (
        <View style={S.errorCard}>
          <Text style={S.errorText}>⚠️ Failed to load passage data</Text>
          <Text style={S.errorSub}>{error}</Text>
        </View>
      ) : rows.length === 0 ? (
        <View style={S.emptyBox}>
          <Text style={S.emptyIcon}>📖</Text>
          <Text style={S.emptyTitle}>No passage data available</Text>
          <Text style={S.emptyText}>
            Passage rankings appear once students complete reading sessions.
          </Text>
        </View>
      ) : (
        <>
          {/* Column Headers */}
          <View style={S.tableHeader}>
            <Text style={[S.colHead, { width: sw(30) }]}>#</Text>
            <Text style={[S.colHead, { flex: 1 }]}>Passage Title</Text>
            <Text style={[S.colHead, { width: sw(46) }]}>Avg</Text>
            <Text style={[S.colHead, { width: sw(46) }]}>Tag</Text>
          </View>

          {/* Rows */}
          {rows.map((row, index) => {
            const cfg = DIFFICULTY_CONFIG[row.difficultyLevel];
            const isExpanded = expandedIndex === index;
            const isLast = index === rows.length - 1;

            return (
              <TouchableOpacity
                key={row.title}
                activeOpacity={0.8}
                onPress={() => setExpandedIndex(isExpanded ? null : index)}
                style={[S.row, isLast && S.rowLast, isExpanded && { backgroundColor: cfg.bg }]}
              >
                {/* Rank */}
                <View style={[S.rankBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[S.rankText, { color: cfg.color }]}>{index + 1}</Text>
                </View>

                {/* Title + expanded detail */}
                <View style={S.rowBody}>
                  <Text style={S.rowTitle} numberOfLines={isExpanded ? undefined : 1}>
                    {row.title}
                  </Text>

                  {isExpanded && (
                    <View style={S.expandedDetail}>
                      {/* Accuracy bar */}
                      <View style={S.barTrack}>
                        <View
                          style={[
                            S.barFill,
                            { width: `${row.avgAccuracy}%` as any, backgroundColor: cfg.barColor },
                          ]}
                        />
                      </View>
                      <Text style={S.detailMeta}>
                        {row.attempts} attempt{row.attempts !== 1 ? 's' : ''} · {row.uniqueStudents} student{row.uniqueStudents !== 1 ? 's' : ''} · {row.avgTotalMiscues} avg miscues
                      </Text>
                      <View style={[S.difficultyChip, { backgroundColor: cfg.bg }]}>
                        <Text style={[S.difficultyChipText, { color: cfg.color }]}>
                          {cfg.label}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Avg Accuracy */}
                <Text style={[S.avgValue, { color: cfg.color, width: sw(46) }]}>
                  {row.avgAccuracy}%
                </Text>

                {/* Tag chip */}
                <View style={[S.tagChip, { backgroundColor: cfg.bg, width: sw(46) }]}>
                  <Text style={[S.tagText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </View>
  );
};

const S = StyleSheet.create({
  container: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: sw(18),
    marginBottom: sh(16),
    borderWidth: 1,
    borderColor: C.border,
    ...Shadows.subtle,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sh(16),
  },
  headerText: { flex: 1 },
  title: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(2),
  },
  subtitle: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
    marginBottom: sh(4),
  },
  warning: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    lineHeight: sf(16),
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(4),
    paddingBottom: sh(8),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: sh(4),
    gap: sw(6),
  },
  colHead: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Bold',
    color: C.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(10),
    paddingHorizontal: sw(4),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: sw(6),
    borderRadius: sw(8),
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rankBadge: {
    width: sw(26),
    height: sw(26),
    borderRadius: sw(13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },

  // Expanded detail
  expandedDetail: {
    marginTop: sh(8),
    gap: sh(6),
  },
  barTrack: {
    height: sw(8),
    backgroundColor: C.track,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  detailMeta: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: sw(10),
    paddingVertical: sh(3),
    borderRadius: Radii.pill,
  },
  difficultyChipText: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Right columns
  avgValue: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Black',
    textAlign: 'right',
  },
  tagChip: {
    paddingVertical: sh(3),
    borderRadius: Radii.pill,
    alignItems: 'center',
  },
  tagText: {
    fontSize: sf(9),
    fontFamily: 'Nunito-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // States
  centered: {
    paddingVertical: sh(30),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: sh(10),
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radii.md,
    padding: sw(14),
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  errorText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.red,
    marginBottom: sh(4),
  },
  errorSub: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
    textAlign: 'center',
  },
  emptyBox: {
    paddingVertical: sh(30),
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: sf(36),
    marginBottom: sh(8),
  },
  emptyTitle: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(4),
  },
  emptyText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
    textAlign: 'center',
  },
});

export default PassageDifficultyRanking;

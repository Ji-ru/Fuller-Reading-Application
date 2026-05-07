import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useClassParticipationRate } from '../../../Hooks/Faculty/useClassParticipationRate';
import { FilterOptions } from '../../../Interfaces/miscue';
import { sw, sh, sf } from '../../../Utils/responsive';
import { FacultyColors, Radii, Shadows } from '../../../Utilities/Theme';

const C = {
  primary: FacultyColors.primary,
  primaryDark: FacultyColors.primaryDark,
  bg: FacultyColors.bg,
  ink: FacultyColors.ink,
  inkLight: FacultyColors.inkLight,
  slate: FacultyColors.slate,
  white: FacultyColors.white,
  orange: FacultyColors.orange,
  red: FacultyColors.red,
};

interface ClassParticipationRateProps {
  facultyId?: string | null;
  filter: {
    academicYear: string;
    selectedView: string;
  };
  /** Display name of the selected class for context (optional). */
  className?: string;
}

const ClassParticipationRate: React.FC<ClassParticipationRateProps> = ({
  facultyId = null,
  filter,
  className,
}) => {
  const { selectedView, academicYear } = filter;
  const isOverall = selectedView === 'overall';

  const filterOptions = useMemo<FilterOptions>(() => {
    const options: FilterOptions = {
      type: isOverall ? 'overall' : 'class',
    };
    if (!isOverall && selectedView) options.classId = selectedView;
    if (academicYear) options.acadYear = academicYear;
    return options;
  }, [isOverall, selectedView, academicYear]);

  const { data, loading, error } = useClassParticipationRate(
    facultyId,
    filterOptions,
  );

  const rateColor = data
    ? data.thisWeek.rate >= 80
      ? C.primary
      : data.thisWeek.rate >= 60
      ? C.orange
      : C.red
    : C.inkLight;

  const trendConfig = data
    ? data.trend === 'up'
      ? { label: `UP ${Math.abs(data.change)}%`, color: C.primary, bg: '#D1FAE5' }
      : data.trend === 'down'
      ? { label: `DOWN ${Math.abs(data.change)}%`, color: C.red, bg: '#FEE2E2' }
      : { label: 'NO CHANGE', color: C.slate, bg: '#F3F4F6' }
    : { label: '', color: C.slate, bg: '#F3F4F6' };

  return (
    <View style={S.container}>
      <Text style={S.title}>Class Participation</Text>
      <Text style={S.subtitle}>
        {isOverall ? 'Overall' : (className || 'Selected Class')}
      </Text>

      {loading ? (
        <View style={S.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={S.loadingText}>Loading participation...</Text>
        </View>
      ) : error ? (
        <View style={S.errorCard}>
          <Text style={S.errorText}>Error loading participation</Text>
          <Text style={S.errorSub}>{error}</Text>
        </View>
      ) : !data ? (
        <View style={S.emptyBox}>
          <Text style={S.emptyText}>No participation data available</Text>
        </View>
      ) : (
        <View style={S.body}>
          <View style={S.weekHeader}>
            <Text style={S.weekLabel}>{data.thisWeek.weekLabel}</Text>
            {trendConfig.label ? (
              <View style={[S.trendBadge, { backgroundColor: trendConfig.bg }]}> 
                <Text style={[S.trendText, { color: trendConfig.color }]}> {trendConfig.label} </Text>
              </View>
            ) : null}
          </View>

          <View style={S.mainRow}>
            <Text style={[S.rateValue, { color: rateColor }]}> {data.thisWeek.rate}% </Text>
            <View style={S.rateMeta}>
              <Text style={S.rateMetaText}>
                {data.thisWeek.participatingStudents} of {data.thisWeek.totalStudents} students
              </Text>
              <Text style={S.rateMetaText}>read at least once this week</Text>
            </View>
          </View>

          <View style={S.divider} />

          <View style={S.lastWeekRow}>
            <Text style={S.lastWeekLabel}>Last Week</Text>
            <Text style={S.lastWeekValue}>
              {data.lastWeek.rate}% · {data.lastWeek.participatingStudents} of {data.lastWeek.totalStudents} students
            </Text>
            <Text style={S.lastWeekDate}>{data.lastWeek.weekLabel}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const S = StyleSheet.create({
  container: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: sw(18),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: sh(16),
    ...Shadows.subtle,
  },
  title: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: C.ink,
  },
  subtitle: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
    marginTop: sh(2),
    marginBottom: sh(12),
  },
  body: {
    marginTop: sh(4),
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(10),
  },
  weekLabel: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.inkLight,
  },
  trendBadge: {
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: Radii.pill,
  },
  trendText: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Bold',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(12),
  },
  rateValue: {
    fontSize: sf(42),
    fontFamily: 'Satoshi-Black',
  },
  rateMeta: {
    flex: 1,
  },
  rateMetaText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  divider: {
    height: 1,
    backgroundColor: '#DDE6E0',
    marginVertical: sh(12),
  },
  lastWeekRow: {
    gap: sh(2),
  },
  lastWeekLabel: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Bold',
    color: C.slate,
    textTransform: 'uppercase',
  },
  lastWeekValue: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },
  lastWeekDate: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: sh(16),
  },
  loadingText: {
    marginTop: sh(8),
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radii.md,
    padding: sw(12),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.red,
  },
  errorSub: {
    marginTop: sh(4),
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  emptyBox: {
    paddingVertical: sh(12),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },
});

export default ClassParticipationRate;

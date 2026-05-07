import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useReadingCalendarHeatmap } from '../../../Hooks/Faculty/useReadingCalendarHeatmap';
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
  border: '#E5E7EB',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ReadingCalendarHeatmapProps {
  facultyId?: string | null;
  filter: {
    academicYear: string;
    selectedView: string;
  };
  className?: string;
}

const parseAcademicYear = (academicYear?: string) => {
  if (!academicYear) return null;
  const parts = academicYear.match(/\d{4}/g);
  if (!parts || parts.length < 2) return null;
  const start = Number(parts[0]);
  const end = Number(parts[1]);
  if (!start || !end) return null;
  return { start, end };
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const ReadingCalendarHeatmap: React.FC<ReadingCalendarHeatmapProps> = ({
  facultyId = null,
  filter,
  className,
}) => {
  const { selectedView, academicYear } = filter;
  const isOverall = selectedView === 'overall';
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const filterOptions = useMemo<FilterOptions>(() => {
    const options: FilterOptions = {
      type: isOverall ? 'overall' : 'class',
    };
    if (!isOverall && selectedView) options.classId = selectedView;
    if (academicYear) options.acadYear = academicYear;
    return options;
  }, [isOverall, selectedView, academicYear]);

  const { data, loading, error } = useReadingCalendarHeatmap(
    facultyId,
    filterOptions,
    selectedMonth,
  );

  const yearRange = parseAcademicYear(academicYear);
  const minMonth = yearRange ? new Date(yearRange.start, 5, 1) : null;
  const maxMonth = yearRange ? new Date(yearRange.end, 2, 1) : null;
  const todayMonth = startOfMonth(new Date());

  const canGoPrev = !minMonth || startOfMonth(selectedMonth) > startOfMonth(minMonth);
  const canGoNext = (() => {
    const nextMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    if (nextMonth > todayMonth) return false;
    if (!maxMonth) return true;
    return nextMonth <= startOfMonth(maxMonth);
  })();

  const legendItems = [
    { label: 'No sessions', color: '#F3F4F6' },
    { label: '1-2', color: 'rgba(0, 132, 67, 0.25)' },
    { label: '3-5', color: 'rgba(0, 132, 67, 0.55)' },
    { label: '6+', color: C.primary },
  ];

  const selectedDay = data?.weeks
    .flat()
    .find(day => day.dateKey === selectedDayKey) ?? null;

  return (
    <View style={S.container}>
      <Text style={S.title}>Reading Activity</Text>
      <Text style={S.subtitle}>{isOverall ? 'Overall' : (className || 'Selected Class')}</Text>

      <View style={S.monthRow}>
        <TouchableOpacity
          onPress={() => {
            if (!canGoPrev) return;
            setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
            setSelectedDayKey(null);
          }}
          activeOpacity={0.7}
          disabled={!canGoPrev}
          style={[S.navBtn, !canGoPrev && S.navBtnDisabled]}
        >
          <Text style={S.navBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={S.monthLabel}>{data?.monthLabel || 'Loading...'}</Text>
        <TouchableOpacity
          onPress={() => {
            if (!canGoNext) return;
            setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
            setSelectedDayKey(null);
          }}
          activeOpacity={0.7}
          disabled={!canGoNext}
          style={[S.navBtn, !canGoNext && S.navBtnDisabled]}
        >
          <Text style={S.navBtnText}>→</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={S.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={S.loadingText}>Loading calendar...</Text>
        </View>
      ) : error ? (
        <View style={S.errorCard}>
          <Text style={S.errorText}>Error loading activity</Text>
          <Text style={S.errorSub}>{error}</Text>
        </View>
      ) : !data ? (
        <View style={S.emptyBox}>
          <Text style={S.emptyText}>No calendar data available</Text>
        </View>
      ) : (
        <>
          <View style={S.dayHeaderRow}>
            {DAY_LABELS.map(label => (
              <Text key={label} style={S.dayHeaderText}>{label}</Text>
            ))}
          </View>

          <View style={S.grid}>
            {data.weeks.map((week, wIndex) => (
              <View key={wIndex} style={S.weekRow}>
                {week.map(day => {
                  const isSelected = selectedDayKey === day.dateKey;
                  const intensityColor =
                    day.intensity === 0
                      ? day.isWeekend
                        ? 'rgba(0,0,0,0.03)'
                        : '#F3F4F6'
                      : day.intensity === 1
                      ? 'rgba(0, 132, 67, 0.25)'
                      : day.intensity === 2
                      ? 'rgba(0, 132, 67, 0.55)'
                      : C.primary;

                  const textColor = day.intensity >= 2 ? '#FFFFFF' : C.inkLight;
                  const opacity = day.isInMonth ? 1 : 0.35;

                  return (
                    <TouchableOpacity
                      key={day.dateKey}
                      style={[
                        S.dayCell,
                        {
                          backgroundColor: intensityColor,
                          opacity,
                          borderColor: isSelected ? C.primaryDark : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        if (!day.isInMonth || day.isFuture) return;
                        setSelectedDayKey(day.dateKey);
                      }}
                      activeOpacity={0.8}
                      disabled={!day.isInMonth || day.isFuture}
                    >
                      <Text style={[S.dayText, { color: textColor }]}>{day.dayOfMonth}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={S.legendRow}>
            {legendItems.map(item => (
              <View key={item.label} style={S.legendItem}>
                <View style={[S.legendSwatch, { backgroundColor: item.color }]} />
                <Text style={S.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={S.summaryRow}>
            <Text style={S.summaryText}>{data.activeDays} active days · {data.totalSessions} total sessions</Text>
            {data.peakDay ? (
              <Text style={S.summaryText}>
                Peak: {data.peakDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' '}({data.peakDay.sessionCount} sessions)
              </Text>
            ) : null}
          </View>

          {selectedDay ? (
            <View style={S.selectedDayCard}>
              <Text style={S.selectedDayTitle}>
                {selectedDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={S.selectedDayText}>
                {selectedDay.sessionCount} sessions by {selectedDay.studentCount} students
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

const S = StyleSheet.create({
  container: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: sw(16),
    marginBottom: sh(16),
    borderWidth: 1,
    borderColor: C.border,
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
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sh(12),
  },
  navBtn: {
    width: sw(34),
    height: sw(34),
    borderRadius: sw(10),
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: sf(14),
    color: C.ink,
    fontFamily: 'Nunito-Bold',
  },
  monthLabel: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: C.ink,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: sw(2),
    marginBottom: sh(6),
  },
  dayHeaderText: {
    width: sw(36),
    textAlign: 'center',
    fontSize: sf(10),
    fontFamily: 'Nunito-Bold',
    color: C.inkLight,
  },
  grid: {
    gap: sh(6),
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  dayText: {
    fontSize: sf(11),
    fontFamily: 'Satoshi-Medium',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(10),
    marginTop: sh(12),
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(6),
  },
  legendSwatch: {
    width: sw(12),
    height: sw(12),
    borderRadius: sw(4),
  },
  legendText: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  summaryRow: {
    marginTop: sh(10),
    gap: sh(4),
  },
  summaryText: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  selectedDayCard: {
    marginTop: sh(10),
    backgroundColor: C.bg,
    padding: sw(12),
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  selectedDayTitle: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },
  selectedDayText: {
    marginTop: sh(4),
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  centered: {
    paddingVertical: sh(16),
    alignItems: 'center',
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
    color: FacultyColors.red,
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

export default ReadingCalendarHeatmap;

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { getDateRange, getRangeLabel, TimeFilterType } from '../../Utilities/analyticsDateHelpers';

export type { TimeFilterType };

export interface SubPeriodFilter {
  start: Date;
  end: Date;
}

interface DateFilterProps {
  timeFilter: TimeFilterType;
  setTimeFilter: (filter: TimeFilterType) => void;
  periodOffset?: number;
  onOffsetChange?: (offset: number) => void;
  selectedSubFilter?: SubPeriodFilter | null;
  onSubFilterChange?: (subFilter: SubPeriodFilter | null) => void;
  selectedSubItem?: number | null;
  setSelectedSubItem?: (id: number | null) => void;
}

export default function DateFilter({
  timeFilter,
  setTimeFilter,
  periodOffset = 0,
  onOffsetChange,
  selectedSubFilter = null,
  onSubFilterChange,
  selectedSubItem: propsSubItem,
  setSelectedSubItem: propsSetSubItem,
}: DateFilterProps) {
  const [localSubItem, setLocalSubItem] = useState<number | null>(null);
  const activeSubItem = propsSubItem !== undefined ? propsSubItem : localSubItem;
  const setActiveSubItem = propsSetSubItem || setLocalSubItem;

  const rangeLabel = useMemo(
    () => getRangeLabel(timeFilter, periodOffset),
    [timeFilter, periodOffset],
  );

  const dateRange = useMemo(
    () => getDateRange(timeFilter, periodOffset),
    [timeFilter, periodOffset],
  );

  const weekItems = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = new Date().toDateString();
    return days.map((day, i) => {
      // Create date without getting hit by timezone offsets around midnight
      const d = new Date(dateRange.start.getTime() + (i * 24 * 60 * 60 * 1000));
      return { id: i, day, date: String(d.getDate()), isToday: d.toDateString() === todayStr, fullDate: new Date(d) };
    });
  }, [dateRange]);

  const monthItems = useMemo(() => {
    const { start } = dateRange;
    const weeks: Array<{ id: number; label: string; fullDateStart: Date; fullDateEnd: Date }> = [];
    const cur = new Date(start);
    let weekNum = 1;
    while (cur.getMonth() === start.getMonth() && weekNum <= 5) {
      const weekStart = new Date(cur);
      const weekEnd = new Date(cur);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      // Ensure the weekEnd is within the current month
      if (weekEnd.getMonth() !== start.getMonth()) {
        weekEnd.setMonth(start.getMonth() + 1, 0); // last day of current month
      }

      weeks.push({ id: weekNum - 1, label: `Week ${weekNum}`, fullDateStart: weekStart, fullDateEnd: weekEnd });
      cur.setDate(cur.getDate() + 7);
      weekNum++;
    }
    return weeks;
  }, [dateRange]);

  const isCurrentPeriod = periodOffset === 0;

  const handlePrev = () => onOffsetChange?.(periodOffset + 1);
  const handleNext = () => { if (!isCurrentPeriod) onOffsetChange?.(periodOffset - 1); };

  return (
    <View style={S.container}>
      {/* ── TOP: Week / Month / Year tabs ── */}
      <View style={S.tabTrack}>
        {(['week', 'month', 'year'] as const).map(f => {
          const active = timeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setTimeFilter(f)}
              style={[S.tabPill, active && S.tabPillActive]}
              activeOpacity={0.8}
            >
              <Text style={[S.tabLabel, active && S.tabLabelActive]}>
                {f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'Year'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── MIDDLE: Period navigator ── */}
      <View style={S.navCard}>
        <TouchableOpacity style={S.navButton} onPress={handlePrev} activeOpacity={0.7}>
          <Text style={S.navButtonIcon}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={S.rangeLabel}>{rangeLabel}</Text>

        <TouchableOpacity
          style={[S.navButton, isCurrentPeriod && S.navButtonDisabled]}
          onPress={handleNext}
          activeOpacity={isCurrentPeriod ? 1 : 0.7}
        >
          <Text style={[S.navButtonIcon, isCurrentPeriod && S.navButtonIconDisabled]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM: Sub-range reference (visual only) ── */}
      {timeFilter === 'week' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.subRangeScroll}
        >
          {weekItems.map(item => {
            const startOfDay = new Date(item.fullDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(item.fullDate);
            endOfDay.setHours(23, 59, 59, 999);
            const isSelected = selectedSubFilter?.start.getTime() === startOfDay.getTime();

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  S.subItemCard,
                  item.isToday && !isSelected && S.subItemCardActive,
                  isSelected && { backgroundColor: C.mint, borderColor: C.greenDark, borderWidth: 1 }
                ]}
                onPress={() => {
                  if (isSelected) {
                    onSubFilterChange?.(null);
                  } else {
                    onSubFilterChange?.({ start: startOfDay, end: endOfDay });
                  }
                }}
              >
                <Text style={[S.subItemDay, (item.isToday || isSelected) && S.subItemDayActive, isSelected && { color: C.greenDark }]}>
                  {item.day}
                </Text>
                <Text style={[S.subItemDate, (item.isToday || isSelected) && S.subItemDateActive, isSelected && { color: C.greenDark }]}>
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {timeFilter === 'month' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.subRangeScroll}
        >
          {monthItems.map(item => {
            const isSelected = selectedSubFilter?.start.getTime() === item.fullDateStart.getTime();
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  S.subItemCard,
                  S.monthSubItemCard,
                  isSelected && { backgroundColor: C.mint, borderColor: C.greenDark, borderWidth: 1 }
                ]}
                onPress={() => {
                  if (isSelected) {
                    onSubFilterChange?.(null);
                  } else {
                    onSubFilterChange?.({ start: item.fullDateStart, end: item.fullDateEnd });
                  }
                }}
              >
                <Text style={[S.monthSubItemText, isSelected && { color: C.greenDark, fontWeight: '700' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.subtle,
  },

  // Tabs
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: C.greenPale,
    borderRadius: 12,
    padding: 4,
    width: '100%',
    marginBottom: 12,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabPillActive: {
    backgroundColor: C.green,
    ...Shadows.subtle,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.green,
  },
  tabLabelActive: {
    color: C.white,
  },

  // Nav card
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Shadows.subtle,
    marginBottom: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.greenPale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  navButtonIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: C.green,
  },
  navButtonIconDisabled: {
    color: '#BDBDBD',
  },
  rangeLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C3E50',
  },

  // Sub-range row
  subRangeScroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  subItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 10,
    width: 52,
    alignItems: 'center',
  },
  subItemCardActive: {
    borderColor: C.green,
    borderWidth: 2,
    paddingVertical: 9,
  },
  subItemDay: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9E9E',
    marginBottom: 4,
  },
  subItemDayActive: {
    color: C.green,
    fontWeight: '800',
  },
  subItemDate: {
    fontSize: 16,
    fontWeight: '800',
    color: '#424242',
  },
  subItemDateActive: {
    color: C.green,
  },
  monthSubItemCard: {
    width: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  monthSubItemText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.green,
  },
});

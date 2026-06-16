/**
 * DateRangeFilter.tsx
 *
 * Reusable date filter — Week / Month / Year toggle plus subfilter chips
 * (day-of-week chips for "week", week-of-month chips for "month").
 * Mirrors the filter UI in Faculty_Student_View_Profile.tsx.
 *
 * The component manages all internal state and emits the resolved
 * { start, end } bounds via `onRangeChange` whenever the user changes anything.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { sw, sh, sf } from '../../Utils/responsive';

export type DateRangeType = 'week' | 'month' | 'year';

export interface DateBounds {
  start: Date;
  end: Date;
  range: DateRangeType;
}

interface Props {
  /** Initial range (defaults to "week"). */
  initialRange?: DateRangeType;
  /** Fired whenever the resolved bounds change. */
  onRangeChange?: (bounds: DateBounds) => void;
  /** Show day-of-week chips when range = "week". Defaults to true. */
  showDayChips?: boolean;
  /** Show week-of-month chips when range = "month". Defaults to true. */
  showWeekChips?: boolean;
  /** When true, hides the period navigator and all chip subfilters — just the Week/Month/Year toggle. */
  simple?: boolean;
  /** Set of date strings (YYYY-M-D) that have activity, to show a dot on the chip */
  activeDates?: Set<string>;
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

const getWeekStart = (d: Date): Date => {
  const c = new Date(d);
  const day = c.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  c.setDate(c.getDate() + diff);
  c.setHours(0, 0, 0, 0);
  return c;
};
const getWeekEnd = (d: Date): Date => {
  const s = getWeekStart(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
};
const getAcadYearStart = (d: Date): Date => {
  const year = d.getMonth() >= 5 ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(year, 5, 1, 0, 0, 0, 0);
};
const getAcadYearEnd = (d: Date): Date => {
  const s = getAcadYearStart(d);
  return new Date(s.getFullYear() + 1, 2, 31, 23, 59, 59, 999);
};

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatPeriodLabel = (range: DateRangeType, anchor: Date): string => {
  if (range === 'week') {
    const s = getWeekStart(anchor);
    const e = getWeekEnd(anchor);
    return s.getMonth() === e.getMonth()
      ? `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`
      : `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  }
  if (range === 'month') return `${MONTHS_SHORT[anchor.getMonth()]} ${anchor.getFullYear()}`;
  const start = getAcadYearStart(anchor);
  return `SY ${start.getFullYear()} – ${start.getFullYear() + 1}`;
};

const shiftAnchor = (range: DateRangeType, anchor: Date, dir: -1 | 1): Date => {
  const d = new Date(anchor);
  if (range === 'week') d.setDate(d.getDate() + dir * 7);
  else if (range === 'month') d.setMonth(d.getMonth() + dir);
  else d.setFullYear(d.getFullYear() + dir);
  return d;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const DateRangeFilter: React.FC<Props> = ({
  initialRange = 'week',
  onRangeChange,
  showDayChips = true,
  showWeekChips = true,
  simple = false,
  activeDates = new Set(),
}) => {
  // simple mode = toggle only; force-disable nav and chips
  const _showDayChips = simple ? false : showDayChips;
  const _showWeekChips = simple ? false : showWeekChips;
  const _showNav = !simple;
  const [range, setRange] = useState<DateRangeType>(initialRange);
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedWeekOfMonth, setSelectedWeekOfMonth] = useState<number | null>(null);

  // ── Resolved bounds ────────────────────────────────────────────────────────
  const bounds = useMemo<DateBounds>(() => {
    if (range === 'week') {
      if (selectedDay !== null) {
        const monday = getWeekStart(anchor);
        const dayStart = new Date(monday);
        dayStart.setDate(monday.getDate() + selectedDay);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        return { start: dayStart, end: dayEnd, range };
      }
      return { start: getWeekStart(anchor), end: getWeekEnd(anchor), range };
    }
    if (range === 'month') {
      const year = anchor.getFullYear();
      const month = anchor.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();
      if (selectedWeekOfMonth !== null) {
        const i = selectedWeekOfMonth - 1;
        const wkStart = new Date(year, month, i * 7 + 1, 0, 0, 0, 0);
        const wkEnd = new Date(year, month, Math.min((i + 1) * 7, totalDays), 23, 59, 59, 999);
        return { start: wkStart, end: wkEnd, range };
      }
      const s = new Date(year, month, 1, 0, 0, 0, 0);
      const e = new Date(year, month + 1, 0, 23, 59, 59, 999);
      return { start: s, end: e, range };
    }
    return { start: getAcadYearStart(anchor), end: getAcadYearEnd(anchor), range };
  }, [range, anchor, selectedDay, selectedWeekOfMonth]);

  // Emit bounds to parent on every change
  useEffect(() => {
    onRangeChange?.(bounds);
  }, [bounds]);

  // ── Sub-renders ────────────────────────────────────────────────────────────
  const weekDays = useMemo(() => {
    if (range !== 'week') return [];
    const monday = getWeekStart(anchor);
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return labels.map((label, i) => {
      const date = new Date(monday); date.setDate(monday.getDate() + i);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const isToday = date.getTime() === today.getTime();
      const hasActivity = activeDates.has(dateKey);
      return { label, dateNum: date.getDate(), index: i, isToday, hasActivity };
    });
  }, [range, anchor, activeDates]);

  const monthWeeks = useMemo(() => {
    if (range !== 'month') return [];
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const weekCount = Math.ceil(totalDays / 7);
    return Array.from({ length: weekCount }, (_, i) => ({ weekNum: i + 1 }));
  }, [range, anchor]);

  const navigatePeriod = (dir: -1 | 1) => {
    setSelectedDay(null);
    setSelectedWeekOfMonth(null);
    setAnchor(prev => shiftAnchor(range, prev, dir));
  };

  const jumpToToday = () => {
    setSelectedDay(null);
    setSelectedWeekOfMonth(null);
    setAnchor(new Date());
  };

  const switchRange = (r: DateRangeType) => {
    setRange(r);
    setAnchor(new Date());
    setSelectedDay(null);
    setSelectedWeekOfMonth(null);
  };

  return (
    <View>
      {/* ── Range Toggle ─────────────────────────────────────────────────── */}
      <View style={S.rangeBar}>
        {(['week', 'month', 'year'] as const).map(r => (
          <TouchableOpacity
            key={r}
            style={[S.rangeBtn, range === r && S.rangeBtnActive]}
            onPress={() => switchRange(r)}
            activeOpacity={0.8}
          >
            <Text style={[S.rangeBtnText, range === r && S.rangeBtnTextActive]}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Period Navigator ─────────────────────────────────────────────── */}
      {_showNav && (
        <View style={S.periodNav}>
          <TouchableOpacity onPress={() => navigatePeriod(-1)} style={S.arrowBtn} activeOpacity={0.6}>
            <Text style={S.arrowText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={jumpToToday} activeOpacity={0.7} style={S.periodLabelBtn}>
            <Text style={S.periodLabel}>{formatPeriodLabel(range, anchor)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigatePeriod(1)} style={S.arrowBtn} activeOpacity={0.6}>
            <Text style={S.arrowText}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Day Chips (Week sub-filter) ──────────────────────────────────── */}
      {range === 'week' && _showDayChips && (
        <View style={S.dayRow}>
          {weekDays.map(day => {
            const isSelected = selectedDay === day.index;
            return (
              <TouchableOpacity
                key={day.index}
                style={[S.dayChip, isSelected && S.dayChipActive, day.isToday && !isSelected && S.dayChipToday]}
                onPress={() => setSelectedDay(prev => prev === day.index ? null : day.index)}
                activeOpacity={0.7}
              >
                <Text style={[S.dayChipLabel, isSelected && S.dayChipLabelActive]}>{day.label}</Text>
                <Text style={[S.dayChipDate, isSelected && S.dayChipDateActive]}>
                  {day.dateNum}
                </Text>
                {day.hasActivity && !isSelected && (
                  <View style={S.activityDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Week-of-Month Chips (Month sub-filter) ───────────────────────── */}
      {range === 'month' && _showWeekChips && (
        <View style={S.weekOfMonthRow}>
          {monthWeeks.map(w => {
            const isSelected = selectedWeekOfMonth === w.weekNum;
            return (
              <TouchableOpacity
                key={w.weekNum}
                style={[S.weekChip, isSelected && S.weekChipActive]}
                onPress={() => setSelectedWeekOfMonth(prev => prev === w.weekNum ? null : w.weekNum)}
                activeOpacity={0.7}
              >
                <Text style={[S.weekChipText, isSelected && S.weekChipTextActive]}>Week {w.weekNum}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

// ─── Styles (mirrored from Faculty_Student_View_Profile.tsx) ─────────────────

const S = StyleSheet.create({
  rangeBar: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: sw(10),
    padding: sw(3),
    marginBottom: sh(10),
  },
  rangeBtn: { flex: 1, paddingVertical: sh(8), alignItems: 'center', borderRadius: sw(8) },
  rangeBtnActive: {
    backgroundColor: '#388E3C',
    elevation: 2,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(2),
  },
  rangeBtnText: { fontSize: sf(13), fontFamily: 'Nunito-Bold', color: '#388E3C' },
  rangeBtnTextActive: { color: '#fff' },

  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: sw(12),
    paddingVertical: sh(6),
    paddingHorizontal: sw(6),
    borderWidth: 1,
    borderColor: '#E8F5E9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(2),
  },
  arrowBtn: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(10),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: { fontSize: sf(22), fontFamily: 'Nunito-Bold', color: '#388E3C', lineHeight: sf(24) },
  periodLabelBtn: { flex: 1, alignItems: 'center', paddingVertical: sh(4) },
  periodLabel: { fontSize: sf(14), fontFamily: 'Nunito-Bold', color: '#1F2937' },

  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: sh(10), gap: sw(4) },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sh(8),
    borderRadius: sw(10),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  dayChipActive: {
    backgroundColor: '#388E3C',
    borderColor: '#388E3C',
    elevation: 2,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(2),
  },
  dayChipToday: { borderColor: '#388E3C', borderWidth: 1.5 },
  dayChipLabel: { fontSize: sf(10), fontFamily: 'Nunito-Medium', color: '#6B7280', marginBottom: sh(2) },
  dayChipLabelActive: { color: '#fff' },
  dayChipDate: { fontSize: sf(15), fontFamily: 'Nunito-Bold', color: '#1F2937' },
  dayChipDateActive: { color: '#fff' },

  weekOfMonthRow: { flexDirection: 'row', marginTop: sh(10), gap: sw(6) },
  weekChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sh(8),
    borderRadius: sw(8),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  weekChipActive: {
    backgroundColor: '#388E3C',
    borderColor: '#388E3C',
    elevation: 2,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(2),
  },
  weekChipText: { fontSize: sf(13), fontFamily: 'Nunito-Bold', color: '#1B5E20' },
  weekChipTextActive: { color: '#ffffff' },
  activityDot: {
    width: sw(4),
    height: sw(4),
    borderRadius: sw(2),
    backgroundColor: '#388E3C',
    position: 'absolute',
    bottom: sh(4),
  },
});

export default DateRangeFilter;

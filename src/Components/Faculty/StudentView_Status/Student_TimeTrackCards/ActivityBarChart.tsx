import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { sw, sh, sf } from '../../../../Utils/responsive';

// ─── Tokens ───────────────────────────────────────────────────────────────────

const C = {
  teal:      '#57b8b3',
  tealLight: '#EAF6F6',
  tealDark:  '#2C6975',
  text:      '#1C1917',
  textSub:   '#6B7280',
  textMuted: '#A8A29E',
  track:     '#F0F4F8',
  border:    '#E4EAF0',
  grid:      '#F1F5F9',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNiceMax(value: number, unit: 'hr' | 'min'): number {
  if (value <= 0) return unit === 'min' ? 60 : 1;
  const step = unit === 'min' ? 15 : 0.5;
  return Math.max(Math.ceil(value / step) * step, step);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityBarChartProps {
  data: { label: string; value: number }[];
  maxValue: number;
  unit: 'hr' | 'min';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({
  data,
  maxValue,
  unit,
}) => {
  const CHART_H   = 160;
  const Y_STEPS   = 3; // fewer lines = less clutter
  const niceMax   = getNiceMax(maxValue, unit);
  const needsScroll = data.length > 10;

  // Peak bar gets the solid teal; rest get the light wash
  const peakIndex = data.reduce(
    (maxIdx, item, i, arr) => (item.value > arr[maxIdx].value ? i : maxIdx),
    0,
  );

  const yLabels = Array.from({ length: Y_STEPS + 1 }, (_, i) =>
    (niceMax / Y_STEPS) * (Y_STEPS - i),
  );

  const formatVal = (v: number) =>
    v === 0 ? '0' : v % 1 === 0 ? String(v) : v.toFixed(1);

  const renderBars = () => (
    <View style={s.chartArea}>
      {/* Y-axis */}
      <View style={s.yAxis}>
        {yLabels.map((label, i) => (
          <Text key={i} style={s.yLabel}>
            {formatVal(label)}
          </Text>
        ))}
      </View>

      {/* Grid + bars */}
      <View style={s.chartBody}>
        {/* Horizontal grid lines */}
        <View style={[StyleSheet.absoluteFill, s.grid]}>
          {yLabels.map((_, i) => (
            <View key={i} style={s.gridLine} />
          ))}
        </View>

        {/* Bars */}
        <View style={s.barsRow}>
          {data.map((item, i) => {
            const isPeak   = i === peakIndex && item.value > 0;
            const fillH    = item.value > 0
              ? Math.max((item.value / niceMax) * CHART_H, 6)
              : 0;

            return (
              <View key={i} style={s.barCol}>
                {/* Value above bar */}
                <Text style={[s.barTopVal, isPeak && s.barTopValPeak]}>
                  {item.value > 0 ? formatVal(item.value) : ''}
                </Text>

                {/* Bar */}
                <View style={[s.barTrack, { height: CHART_H }]}>
                  <View
                    style={[
                      s.barFill,
                      {
                        height: fillH,
                        backgroundColor: isPeak ? C.teal : C.tealLight,
                        borderColor:     isPeak ? C.teal : C.border,
                      },
                    ]}
                  />
                </View>

                {/* X label */}
                <Text
                  style={[s.xLabel, isPeak && s.xLabelPeak]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      {/* Unit label */}
      <Text style={s.unitLabel}>{unit === 'hr' ? 'Hours' : 'Minutes'}</Text>

      {needsScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
        >
          {renderBars()}
        </ScrollView>
      ) : (
        renderBars()
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    marginTop: sh(4),
  },
  unitLabel: {
    fontSize: sf(11),
    fontFamily: 'Satoshi-Medium',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: sf(0.5),
    marginBottom: sh(12),
  },
  scrollContent: {
    paddingRight: sw(8),
  },

  // Chart area
  chartArea: {
    flexDirection: 'row',
    gap: sw(8),
  },

  // Y-axis
  yAxis: {
    width: sw(28),
    height: 160 + 32, // CHART_H + label height below
    justifyContent: 'space-between',
    paddingBottom: sh(32),
    alignItems: 'flex-end',
  },
  yLabel: {
    fontSize: sf(10),
    fontFamily: 'Satoshi-Medium',
    color: C.textMuted,
    textAlign: 'right',
  },

  // Body
  chartBody: {
    flex: 1,
    position: 'relative',
  },
  grid: {
    justifyContent: 'space-between',
    paddingBottom: sh(32), // leave room for x labels
    pointerEvents: 'none',
  },
  gridLine: {
    height: sw(1),
    backgroundColor: C.grid,
  },

  // Bars
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: sw(5),
    minWidth: sw(280),
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTopVal: {
    fontSize: sf(9),
    fontFamily: 'Satoshi-Medium',
    color: C.textMuted,
    height: sw(12),
    marginBottom: sh(2),
  },
  barTopValPeak: {
    color: C.tealDark,
    fontFamily: 'Satoshi-Bold',
  },
  barTrack: {
    width: '100%',
    backgroundColor: C.track,
    borderRadius: sw(6),
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: sw(6),
    borderWidth: 1,
  },
  xLabel: {
    marginTop: sh(6),
    fontSize: sf(10),
    fontFamily: 'Satoshi-Medium',
    color: C.textSub,
    textAlign: 'center',
  },
  xLabelPeak: {
    color: C.teal,
    fontFamily: 'Satoshi-Bold',
  },
});

export default ActivityBarChart;
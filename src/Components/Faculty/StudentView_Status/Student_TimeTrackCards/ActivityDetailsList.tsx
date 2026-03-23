import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ─── Tokens ───────────────────────────────────────────────────────────────────

const C = {
  teal:      '#57b8b3',
  tealLight: '#EAF6F6',
  tealDark:  '#2C6975',
  text:      '#1C1917',
  textSub:   '#6B7280',
  textMuted: '#A8A29E',
  surface:   '#FFFFFF',
  border:    '#E4EAF0',
  track:     '#F0F4F8',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityDetailsListProps {
  data: { label: string; value: number }[];
  unit: 'hr' | 'min';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ActivityDetailsList: React.FC<ActivityDetailsListProps> = ({
  data,
  unit,
}) => {
  const maxValue  = Math.max(...data.map((d) => d.value), 1);
  const peakIndex = data.reduce(
    (maxIdx, item, i, arr) => (item.value > arr[maxIdx].value ? i : maxIdx),
    0,
  );

  const formatVal = (v: number) =>
    v === 0 ? `0 ${unit}` : `${v % 1 === 0 ? v : v.toFixed(1)} ${unit}`;

  return (
    <View style={s.card}>
      <Text style={s.title}>Detailed Activity</Text>

      {data.map((item, index) => {
        const isPeak  = index === peakIndex && item.value > 0;
        const fillPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const isLast  = index === data.length - 1;

        return (
          <View key={index} style={[s.row, isLast && s.rowLast]}>
            {/* Label */}
            <Text style={[s.label, isPeak && s.labelPeak]} numberOfLines={1}>
              {item.label}
            </Text>

            {/* Progress bar + value */}
            <View style={s.right}>
              <View style={s.progressTrack}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width:           `${fillPct}%` as any,
                      backgroundColor: isPeak ? C.teal : C.tealLight,
                    },
                  ]}
                />
              </View>
              <Text style={[s.value, isPeak && s.valuePeak]}>
                {formatVal(item.value)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    color: C.text,
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },

  label: {
    width: 60,
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: C.textSub,
  },
  labelPeak: {
    fontFamily: 'Satoshi-Bold',
    color: C.text,
  },

  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: C.track,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  value: {
    minWidth: 52,
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
    color: C.textMuted,
    textAlign: 'right',
  },
  valuePeak: {
    color: C.tealDark,
  },
});
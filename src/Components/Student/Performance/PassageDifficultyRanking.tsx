import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StudentColors as C, Radii } from '../../../Utilities/Theme';
import { MiscueReportDocument } from '../../../Interfaces/dataInterfaces';

interface PassageDifficultyRankingProps {
  reports: MiscueReportDocument[];
  maxItems?: number;
}

type PassageRank = {
  title: string;
  averageAccuracy: number;
  attempts: number;
  totalMiscues: number;
};

export default function PassageDifficultyRanking({ reports, maxItems = 5 }: PassageDifficultyRankingProps) {
  const ranking = useMemo(() => {
    const map = new Map<string, { accSum: number; attempts: number; totalMiscues: number }>();

    reports.forEach(r => {
      const title = r.passageTitle;
      if (!title) return;
      if (typeof r.totalWords === 'number' && r.totalWords <= 1) return;

      const current = map.get(title) || { accSum: 0, attempts: 0, totalMiscues: 0 };
      current.accSum += r.accuracyRate || 0;
      current.attempts += 1;
      current.totalMiscues += r.totalMiscues || 0;
      map.set(title, current);
    });

    return Array.from(map.entries())
      .map(([title, data]) => ({
        title,
        averageAccuracy: data.attempts > 0 ? data.accSum / data.attempts : 0,
        attempts: data.attempts,
        totalMiscues: data.totalMiscues,
      }))
      .sort((a, b) => a.averageAccuracy - b.averageAccuracy)
      .slice(0, maxItems);
  }, [reports, maxItems]);

  if (ranking.length === 0) {
    return (
      <View style={S.emptyBox}>
        <Text style={S.emptyText}>Wala pang sapat na datos ng talata.</Text>
      </View>
    );
  }

  return (
    <View>
      {ranking.map((item, idx) => (
        <View key={`${item.title}-${idx}`} style={[S.row, idx === ranking.length - 1 && S.rowLast]}>
          <View style={S.rankBadge}>
            <Text style={S.rankText}>{idx + 1}</Text>
          </View>
          <View style={S.info}>
            <Text style={S.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={S.subText}>
              {item.attempts} attempt{item.attempts === 1 ? '' : 's'} · {item.totalMiscues} miscues
            </Text>
          </View>
          <View style={S.metric}>
            <Text style={S.metricValue}>{item.averageAccuracy.toFixed(1)}%</Text>
            <Text style={S.metricLabel}>Accuracy</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.greenPale,
    gap: 10,
  },
  rowLast: { borderBottomWidth: 0 },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.greenLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '800', color: C.green },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '800', color: C.ink },
  subText: { fontSize: 11, fontWeight: '600', color: C.slate, marginTop: 2 },
  metric: { alignItems: 'flex-end' },
  metricValue: { fontSize: 14, fontWeight: '900', color: C.orange },
  metricLabel: { fontSize: 10, fontWeight: '700', color: C.slate, marginTop: 2 },
  emptyBox: { paddingVertical: 16, alignItems: 'center' },
  emptyText: { fontSize: 12, fontWeight: '600', color: C.slate },
});

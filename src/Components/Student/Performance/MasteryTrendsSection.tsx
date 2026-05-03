import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../../Utilities/Theme';
import { MiscueReportController } from '../../../Controller/MiscueReportController';

interface MasteryTrendsSectionProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
}

interface TrendSlot {
  label: string;
  count: number;
  items: string[]; // List of letters/words mastered in this slot
}

export default function MasteryTrendsSection({ studentId, timeFilter }: MasteryTrendsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [masteryData, setMasteryData] = useState<{
    masteredLetters: Array<{ letter: string; timestamp: Date }>;
    masteredWords: Array<{ word: string; letter: string; timestamp: Date }>;
  }>({ masteredLetters: [], masteredWords: [] });

  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await MiscueReportController.getWordMasteryData(studentId);
      setMasteryData(data);
      setLoading(false);
    };
    if (studentId) fetch();
  }, [studentId]);

  const slots = useMemo(() => {
    const now = new Date();
    const result: TrendSlot[] = [];
    const allItems = [
      ...masteryData.masteredLetters.map(l => ({ id: l.letter, date: l.timestamp })),
      ...masteryData.masteredWords.map(w => ({ id: w.word, date: w.timestamp }))
    ];

    if (timeFilter === 'week') {
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() - i);
        const dayLabel = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        const slotItems = allItems.filter(item => {
          const d = new Date(item.date);
          return d.toDateString() === targetDate.toDateString();
        }).map(i => i.id);

        result.push({ label: dayLabel, count: slotItems.length, items: slotItems });
      }
    } else if (timeFilter === 'month') {
      for (let i = 3; i >= 0; i--) {
        const start = new Date();
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(now.getDate() - i * 7);
        
        const weekLabel = i === 0 ? 'Ngayon' : `Wk ${4-i}`;
        
        const slotItems = allItems.filter(item => {
          const d = new Date(item.date);
          return d >= start && d < end;
        }).map(i => i.id);

        result.push({ label: weekLabel, count: slotItems.length, items: slotItems });
      }
    } else {
      const months = ['Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis', 'Ene', 'Peb', 'Mar'];
      let currentYear = now.getFullYear();
      if (now.getMonth() < 5) currentYear--;

      months.forEach((m, idx) => {
        const monthIdx = (idx + 5) % 12;
        const year = monthIdx >= 5 ? currentYear : currentYear + 1;
        
        const slotItems = allItems.filter(item => {
          const d = new Date(item.date);
          return d.getMonth() === monthIdx && d.getFullYear() === year;
        }).map(i => i.id);

        result.push({ label: m, count: slotItems.length, items: slotItems });
      });
    }

    return result;
  }, [masteryData, timeFilter]);

  // Max count for scaling bars
  const maxCount = Math.max(...slots.map(s => s.count), 5);

  if (loading) return null;

  const selectedSlot = selectedSlotIdx !== null ? slots[selectedSlotIdx] : null;

  return (
    <View style={S.container}>
      <View style={S.headerRow}>
        <View>
          <Text style={S.cardTitle}>
            Pag-unlad Bawat {timeFilter === 'week' ? 'Araw' : timeFilter === 'month' ? 'Linggo' : 'Buwan'}
          </Text>
        </View>
        <View style={S.tapHintBadge}>
          <Text style={S.tapHintText}>👆 Pindutin ang bar para sa detalye</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.chartScroll}>
        <View style={S.chartRow}>
          {slots.map((slot, idx) => (
            <TouchableOpacity 
              key={idx} 
              onPress={() => setSelectedSlotIdx(idx)}
              activeOpacity={0.7}
            >
              <BarItem 
                slot={slot} 
                maxCount={maxCount} 
                isActive={selectedSlotIdx === idx}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Details for selected slot */}
      {selectedSlot && selectedSlot.count > 0 && (
        <View style={S.detailBox}>
          <Text style={S.detailTitle}>Natutuhan noong {selectedSlot.label}:</Text>
          <View style={S.itemGrid}>
            {selectedSlot.items.map((item, i) => (
              <View key={i} style={S.itemPill}>
                <Text style={S.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {selectedSlot && selectedSlot.count === 0 && (
        <View style={S.detailBox}>
          <Text style={S.emptyDetailText}>Walang natutuhang bago sa panahong ito.</Text>
        </View>
      )}
    </View>
  );
}

function BarItem({ slot, maxCount, isActive }: { slot: TrendSlot; maxCount: number; isActive: boolean }) {
  const barHeight = (slot.count / maxCount) * 100;
  const color = isActive ? C.green : C.greenLight;

  return (
    <View style={S.barColumn}>
      <Text style={[S.barCount, { color: isActive ? C.green : C.slate }]}>
        {slot.count > 0 ? slot.count : ''}
      </Text>
      <View style={[S.barBg, isActive && S.barBgActive]}>
        <View style={[S.barFill, { height: `${barHeight}%`, backgroundColor: color }]} />
      </View>
      <Text style={[S.barLabel, isActive && S.barLabelActive]}>{slot.label}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.ink,
  },
  tapHintBadge: {
    backgroundColor: C.green + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  tapHintText: {
    fontSize: 9,
    fontWeight: '700',
    color: C.greenDeep,
  },
  chartScroll: {
    paddingVertical: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 4,
  },
  barColumn: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  barCount: {
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 4,
  },
  barBg: {
    width: 22,
    height: 90,
    backgroundColor: C.bg,
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barBgActive: {
    backgroundColor: C.greenPale,
    borderWidth: 1,
    borderColor: C.greenLight,
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.slate,
  },
  barLabelActive: {
    color: C.ink,
    fontWeight: '900',
  },
  detailBox: {
    marginTop: 20,
    backgroundColor: C.bg,
    padding: 15,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: C.greenPale,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.slate,
    marginBottom: 10,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemPill: {
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.greenPale,
  },
  itemText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.greenDeep,
  },
  emptyDetailText: {
    fontSize: 12,
    color: C.slate,
    fontStyle: 'italic',
    textAlign: 'center',
  }
});

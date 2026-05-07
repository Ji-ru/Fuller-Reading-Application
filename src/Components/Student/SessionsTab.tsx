import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { BounceIn } from '../GlobalUse/Animations';
import WordMasterySection from './Performance/WordMasterySection';
import AlphabetMasterySection from './Performance/AlphabetMasterySection';
import { StarIcon } from '../GlobalUse/Icons';
import DateFilter, { TimeFilterType, SubPeriodFilter } from './DateFilter';

interface SessionsTabProps {
  studentId: string;
}

export default function SessionsTab({ studentId }: SessionsTabProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubPeriodFilter | null>(null);

  const handleSetTimeFilter = (filter: TimeFilterType) => {
    setTimeFilter(filter);
    setPeriodOffset(0); // reset to current period on tab change
    setSelectedSubFilter(null);
  };

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

      {/* ── HEADER ── */}
      <BounceIn delay={80}>
        <View style={S.header}>
          <Text style={S.headerTitle}>Mga Serye ng Pag-aaral</Text>
          <Text style={S.headerSub}>Suriin ang iyong pag-unlad sa mga salita</Text>
        </View>
      </BounceIn>

      {/* ── DATE FILTER ── */}
      <BounceIn delay={140}>
        <DateFilter
          timeFilter={timeFilter}
          setTimeFilter={handleSetTimeFilter}
          periodOffset={periodOffset}
          onOffsetChange={(o) => { setPeriodOffset(o); setSelectedSubFilter(null); }}
          selectedSubFilter={selectedSubFilter}
          onSubFilterChange={setSelectedSubFilter}
        />
      </BounceIn>

      {/* ── ALPHABET MASTERY ── */}
      <BounceIn delay={280}>
        <View style={S.sectionCard}>
          <View style={S.sectionHeaderRow}>
            <View style={[S.iconDot, { backgroundColor: '#1abc9c18' }]}>
              <StarIcon size={16} color="#1abc9c" />
            </View>
            <Text style={S.sectionTitle}>Mastery ng mga Titik</Text>
          </View>

          <AlphabetMasterySection
            studentId={studentId}
            timeFilter={timeFilter}
            periodOffset={periodOffset}
            selectedSubFilter={selectedSubFilter}
          />
        </View>
      </BounceIn>

      {/* ── WORD MASTERY ── */}
      <BounceIn delay={200}>
        <View style={S.sectionCard}>
          <View style={S.sectionHeaderRow}>
            <View style={[S.iconDot, { backgroundColor: C.green + '18' }]}>
              <StarIcon size={16} color={C.green} />
            </View>
            <Text style={S.sectionTitle}>Mastery ng mga Salita</Text>
          </View>

          <WordMasterySection
            studentId={studentId}
            timeFilter={timeFilter}
            periodOffset={periodOffset}
            selectedSubFilter={selectedSubFilter}
          />
        </View>
      </BounceIn>


      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
    paddingLeft: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: C.slate,
    fontWeight: '600',
    marginTop: 3,
  },
  sectionCard: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 18,
    marginBottom: 16,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: C.greenPale,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },
});

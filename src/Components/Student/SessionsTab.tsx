import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { BounceIn } from '../GlobalUse/Animations';
import WordMasterySection from './Performance/WordMasterySection';
import AlphabetMasterySection from './Performance/AlphabetMasterySection';
import PassageMasterySection from './Performance/PassageMasterySection';
import { StarIcon, BookOpenIcon, ZapIcon, TrophyIcon } from '../GlobalUse/Icons';
import DateFilter, { TimeFilterType, SubPeriodFilter } from './DateFilter';

interface SessionsTabProps {
  studentId: string;
}

export default function MasteryHub({ studentId }: SessionsTabProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubPeriodFilter | null>(null);

  const handleSetTimeFilter = (filter: TimeFilterType) => {
    setTimeFilter(filter);
    setPeriodOffset(0);
    setSelectedSubFilter(null);
  };

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

      {/* ── DATE FILTER ── */}
      <BounceIn delay={160}>
        <DateFilter
          timeFilter={timeFilter}
          setTimeFilter={handleSetTimeFilter}
          periodOffset={periodOffset}
          onOffsetChange={(o) => { setPeriodOffset(o); setSelectedSubFilter(null); }}
          selectedSubFilter={selectedSubFilter}
          onSubFilterChange={setSelectedSubFilter}
        />
      </BounceIn>

      {/* ── MASTERY SECTIONS (COLLAPSIBLE-STYLE LIST) ── */}
      <View style={S.sectionsContainer}>
        
        {/* Alphabet */}
        <BounceIn delay={200}>
          <View style={S.unifiedSection}>
            <View style={S.unifiedHeader}>
              <StarIcon size={18} color={C.teal} />
              <Text style={S.unifiedTitle}>Titik (Alphabet)</Text>
            </View>
            <AlphabetMasterySection
              studentId={studentId}
              timeFilter={timeFilter}
              periodOffset={periodOffset}
              selectedSubFilter={selectedSubFilter}
            />
          </View>
        </BounceIn>

        {/* Words */}
        <BounceIn delay={240}>
          <View style={S.unifiedSection}>
            <View style={S.unifiedHeader}>
              <ZapIcon size={18} color={C.green} />
              <Text style={S.unifiedTitle}>Salita (Words)</Text>
            </View>
            <WordMasterySection
              studentId={studentId}
              timeFilter={timeFilter}
              periodOffset={periodOffset}
              selectedSubFilter={selectedSubFilter}
            />
          </View>
        </BounceIn>

        {/* Passages */}
        <BounceIn delay={280}>
          <View style={S.unifiedSection}>
            <View style={S.unifiedHeader}>
              <BookOpenIcon size={18} color="#f97316" />
              <Text style={S.unifiedTitle}>Talata (Passages)</Text>
            </View>
            <PassageMasterySection
              studentId={studentId}
              timeFilter={timeFilter}
              periodOffset={periodOffset}
              selectedSubFilter={selectedSubFilter}
            />
          </View>
        </BounceIn>

      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },

  // Unified Sections
  sectionsContainer: { gap: 16 },
  unifiedSection: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Shadows.subtle,
  },
  unifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 12,
  },
  unifiedTitle: { fontSize: 16, fontWeight: '800', color: C.ink },
});

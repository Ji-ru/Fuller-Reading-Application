import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { BounceIn } from '../GlobalUse/Animations';
import WordMasterySection from './Performance/WordMasterySection';
import MasteryTrendsSection from './Performance/MasteryTrendsSection';
import { TrendUpIcon, TrophyIcon, StarIcon } from '../GlobalUse/Icons';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';

interface PerformanceTabProps {
  studentId: string;
  reports: MiscueReportDocument[];
}

export default function PerformanceTab({ studentId, reports }: PerformanceTabProps) {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('week');
  const [isWordMasteryExpanded, setIsWordMasteryExpanded] = useState(true); // Default to expanded for better visibility in redo

  return (
    <ScrollView style={S.container} contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
      {/* Header Info */}
      <BounceIn delay={100}>
        <View style={S.headerSection}>
          <Text style={S.headerTitle}>Dashboard ng Pagganap</Text>
          <Text style={S.headerSubtitle}>Subaybayan ang iyong galing sa pagbabasa</Text>
        </View>
      </BounceIn>

      {/* Main Dashboard Card */}
      <BounceIn delay={200}>
        <View style={S.dashboardCard}>
          {/* Time Filter inside the card */}
            <View style={S.filterWrapper}>
              <View style={S.filterContainer}>
                {(['week', 'month', 'year'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setTimeFilter(filter)}
                    style={[S.filterPill, timeFilter === filter && S.filterPillActive]}
                  >
                    <Text style={[S.filterText, timeFilter === filter && S.filterTextActive]}>
                      {filter === 'week' ? 'Linggo' : filter === 'month' ? 'Buwan' : 'Taon'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          {/* Mastery Trends Section (Moved to top) */}
          <View style={S.sectionContainer}>
            <View style={S.sectionHeader}>
              <View style={S.sectionTitleRow}>
                <View style={[S.iconCircle, { backgroundColor: C.teal + '15' }]}>
                  <TrendUpIcon size={18} color={C.teal} />
                </View>
                <Text style={S.sectionTitle}>Mastery ng mga Talata</Text>
              </View>
            </View>

            <MasteryTrendsSection 
              studentId={studentId} 
              timeFilter={timeFilter} 
            />
          </View>

          <View style={S.divider} />

          {/* Word Mastery Section */}
          <View style={S.sectionContainer}>
            <View style={S.sectionHeader}>
              <View style={S.sectionTitleRow}>
                <View style={[S.iconCircle, { backgroundColor: C.green + '15' }]}>
                  <StarIcon size={18} color={C.green} />
                </View>
                <Text style={S.sectionTitle}>Mastery ng mga Salita</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsWordMasteryExpanded(!isWordMasteryExpanded)}
                style={S.expandButton}
              >
                <Text style={S.expandButtonText}>
                  {isWordMasteryExpanded ? 'I-collapse' : 'Tingnan Lahat'}
                </Text>
              </TouchableOpacity>
            </View>

            <WordMasterySection
              studentId={studentId}
              timeFilter={timeFilter}
              expanded={isWordMasteryExpanded}
            />
          </View>
        </View>
      </BounceIn>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 20,
    paddingLeft: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.ink,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.slate,
    fontWeight: '600',
  },
  dashboardCard: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: C.greenPale,
  },
  filterWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    padding: 4,
    borderRadius: Radii.pill,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: Radii.pill,
  },
  filterPillActive: {
    backgroundColor: C.white,
    ...Shadows.subtle,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.slate,
  },
  filterTextActive: {
    color: C.green,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.ink,
  },
  expandButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.green,
  },
  divider: {
    height: 1,
    backgroundColor: C.bg,
    marginVertical: 20,
  },
  placeholderBox: {
    backgroundColor: C.bg + '50',
    padding: 30,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.bg,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 13,
    color: C.slate,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
    fontWeight: '600',
  }
});

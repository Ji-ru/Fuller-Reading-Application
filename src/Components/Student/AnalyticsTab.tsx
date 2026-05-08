import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { BounceIn } from '../GlobalUse/Animations';
import WordMasterySection from './Performance/WordMasterySection';
import ReadingTimeChart from './Performance/ReadingTimeChart';
import AccuracySpeedChart from './Performance/AccuracySpeedChart';
import MiscueInsightsChart from './Performance/MiscueInsightsChart';
import { BookOpenIcon, ZapIcon, AlertTriangleIcon } from '../GlobalUse/Icons';
import DateFilter, { TimeFilterType } from './DateFilter';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';

import { SubPeriodFilter } from './DateFilter';

interface PerformanceTabProps {
  studentId: string;
  reports: MiscueReportDocument[];
  gradeLevel?: number;
}

export default function PerformanceTab({ studentId, reports: realReports, gradeLevel = 1 }: PerformanceTabProps) {
  const reports = realReports || [];
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubPeriodFilter | null>(null);

  const handleTimeFilterChange = (f: TimeFilterType) => {
    setTimeFilter(f);
    setPeriodOffset(0);
    setSelectedSubFilter(null);
  };

  const handleOffsetChange = (offset: number) => {
    setPeriodOffset(offset);
    setSelectedSubFilter(null);
  };

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

      {/* ── HEADER ── */}
      <BounceIn delay={80}>
        <View style={S.header}>
          <Text style={S.headerTitle}>Dashboard ng Pagganap</Text>
          <Text style={S.headerSub}>Subaybayan ang iyong galing sa pagbabasa</Text>
        </View>
      </BounceIn>

      {/* ── DATE FILTER ── */}
      <BounceIn delay={140}>
        <DateFilter 
          timeFilter={timeFilter} 
          setTimeFilter={handleTimeFilterChange} 
          periodOffset={periodOffset}
          onOffsetChange={handleOffsetChange}
          selectedSubFilter={selectedSubFilter}
          onSubFilterChange={setSelectedSubFilter}
        />
      </BounceIn>

      {/* ══════════════════════════════════════════════════════
           SECTION 2 — PASSAGE ANALYTICS
         ══════════════════════════════════════════════════════ */}

      {/* Subsection 2A: Reading Time Activity */}
      {/* <BounceIn delay={300}>
        <View style={S.sectionCard}>
          <View style={S.sectionHeaderRow}>
            <View style={[S.iconDot, { backgroundColor: C.teal + '18' }]}>
              <BookOpenIcon size={16} color={C.teal} />
            </View>
            <Text style={S.sectionTitle}>Pagbasa ng Mga Talata</Text>
          </View>

          <ReadingTimeChart
            studentId={studentId}
            timeFilter={timeFilter}
            reports={reports}
          />
        </View>
      </BounceIn> */}

      {/* Subsection 2B: Speed & Accuracy */}
      <BounceIn delay={320}>
        <View style={S.sectionCard}>
          <View style={S.sectionHeaderRow}>
            <View style={[S.iconDot, { backgroundColor: C.orange + '18' }]}>
              <ZapIcon size={16} color={C.orange} />
            </View>
            <Text style={S.sectionTitle}>Accuracy at Bilis</Text>
          </View>

          <AccuracySpeedChart
            studentId={studentId}
            timeFilter={timeFilter}
            periodOffset={periodOffset}
            selectedSubFilter={selectedSubFilter}
            reports={reports}
            gradeLevel={gradeLevel}
          />
        </View>
      </BounceIn>

      {/* Subsection 2C: Miscue Insights */}
      <BounceIn delay={440}>
        <View style={S.sectionCard}>
          <View style={S.sectionHeaderRow}>
            <View style={[S.iconDot, { backgroundColor: '#eb5c6c18' }]}>
              <AlertTriangleIcon size={16} color="#eb5c6c" />
            </View>
            <Text style={S.sectionTitle}>Miscue Insights</Text>
          </View>

          <MiscueInsightsChart
            studentId={studentId}
            timeFilter={timeFilter}
            periodOffset={periodOffset}
            selectedSubFilter={selectedSubFilter}
            reports={reports}
          />
        </View>
      </BounceIn>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },

  /* Header */
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

  /* Section Card (each section is its own card) */
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

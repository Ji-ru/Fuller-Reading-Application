import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { BounceIn } from '../GlobalUse/Animations';
import AccuracySpeedChart from './Performance/AccuracySpeedChart';
import MiscueInsightsChart from './Performance/MiscueInsightsChart';
import { ZapIcon, AlertTriangleIcon, TrophyIcon, StarIcon } from '../GlobalUse/Icons';
import DateFilter, { TimeFilterType, SubPeriodFilter } from './DateFilter';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';

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

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

      {/* ── DATE FILTER ── */}
      <BounceIn delay={160}>
        <DateFilter 
          timeFilter={timeFilter} 
          setTimeFilter={handleTimeFilterChange} 
          periodOffset={periodOffset}
          onOffsetChange={setPeriodOffset}
          selectedSubFilter={selectedSubFilter}
          onSubFilterChange={setSelectedSubFilter}
        />
      </BounceIn>

      {/* ── CHARTS ── */}
      <View style={S.chartsContainer}>
        
        {/* Speed & Accuracy */}
        <BounceIn delay={200}>
          <View style={S.chartSection}>
            <View style={S.chartHeader}>
              <ZapIcon size={18} color={C.orange} />
              <Text style={S.chartTitle}>Accuracy at Bilis</Text>
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

        {/* Miscue Insights */}
        <BounceIn delay={240}>
          <View style={S.chartSection}>
            <View style={S.chartHeader}>
              <Text style={S.chartTitle}>Mga Maling Nagagawa (Miscues)</Text>
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

      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const S = StyleSheet.create({
   root: { flex: 1 },
   content: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 20 },

   // Charts Container
   chartsContainer: { gap: 8 },
  chartSection: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Shadows.subtle,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  chartTitle: { fontSize: 16, fontWeight: '800', color: C.ink },
});

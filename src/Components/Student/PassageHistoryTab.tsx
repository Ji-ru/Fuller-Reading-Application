import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import { getDateRange } from '../../Utilities/analyticsDateHelpers';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { BounceIn } from '../GlobalUse/Animations';
import {
  BookOpenIcon,
  HistoryIcon,
  PartyIcon,
  StarIcon,
  ZapIcon
} from '../GlobalUse/Icons';
import DateFilter, { SubPeriodFilter, TimeFilterType } from './DateFilter';

interface PassageHistoryTabProps {
  reports: MiscueReportDocument[];
  onStartReading: () => void;
}

export default function ReadingTimeline({ reports: realReports, onStartReading }: PassageHistoryTabProps) {
  const reports = realReports || [];
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week');
  const [periodOffset, setPeriodOffset] = useState<number>(0);
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubPeriodFilter | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // ── FILTER & SORT ──
  const timelineData = useMemo(() => {
    const range = selectedSubFilter ?? getDateRange(timeFilter, periodOffset);

    return reports.filter(r => {
      const d = r.timestamp?.toDate?.() || new Date(r.timestamp || 0);
      return d.getTime() >= range.start.getTime() && d.getTime() <= range.end.getTime();
    }).sort((a, b) => {
      const timeA = a.timestamp?.toDate?.()?.getTime() || new Date(a.timestamp || 0).getTime();
      const timeB = b.timestamp?.toDate?.()?.getTime() || new Date(b.timestamp || 0).getTime();
      return timeB - timeA; // Newest first
    });
  }, [reports, timeFilter, periodOffset, selectedSubFilter]);

  // ── HELPERS ──
  const getTypeInfo = (title: string) => {
    if (title.startsWith('Alphabet -')) return { label: 'Titik', color: C.teal, icon: StarIcon };
    if (title.startsWith('Words for')) return { label: 'Salita', color: C.green, icon: ZapIcon };
    return { label: 'Talata', color: '#f97316', icon: BookOpenIcon };
  };

  const formatDisplayTitle = (title: string) => {
    return title
      .replace('Alphabet - ', '')
      .replace('Words for ', '')
      .trim();
  };

  const formatDate = (timestamp: any) => {
    const d = timestamp?.toDate?.() || new Date(timestamp || 0);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={S.container}>

      {/* ── DATE FILTER ── */}
      <BounceIn delay={80}>
        <DateFilter
          timeFilter={timeFilter}
          setTimeFilter={(f) => { setTimeFilter(f); setPeriodOffset(0); setSelectedSubFilter(null); }}
          periodOffset={periodOffset}
          onOffsetChange={setPeriodOffset}
          selectedSubFilter={selectedSubFilter}
          onSubFilterChange={setSelectedSubFilter}
        />
      </BounceIn>

      {timelineData.length === 0 ? (
        <View style={S.emptyBox}>
          <HistoryIcon size={40} color={C.slate} />
          <Text style={S.emptyText}>Walang nakitang kasaysayan sa panahong ito.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.timelineContainer}>
          {timelineData.map((report, idx) => {
            const info = getTypeInfo(report.passageTitle || '');
            const isExpanded = expandedReportId === report.reportId;
            const Icon = info.icon;

            return (
              <BounceIn key={report.reportId || idx} delay={100 + idx * 30}>
                <View style={S.timelineRow}>
                  {/* Left Line */}
                  <View style={S.lineCol}>
                    <View style={[S.dot, { backgroundColor: info.color }]} />
                    {idx !== timelineData.length - 1 && <View style={S.verticalLine} />}
                  </View>

                  {/* Right Content */}
                  <TouchableOpacity
                    style={[S.eventCard, isExpanded && S.eventCardExpanded]}
                    onPress={() => setExpandedReportId(isExpanded ? null : report.reportId)}
                    activeOpacity={0.8}
                  >
                    <View style={S.eventHeader}>
                      <View style={S.eventMain}>
                        <Text style={S.eventDate}>{formatDate(report.timestamp)}</Text>
                        <Text style={S.eventTitle} numberOfLines={1}>
                          {formatDisplayTitle(report.passageTitle || 'Unknown')}
                        </Text>
                      </View>
                      <View style={[S.accuracyPill, { backgroundColor: info.color + '15' }]}>
                        <Text style={[S.accuracyText, { color: info.color }]}>{report.accuracyRate}%</Text>
                      </View>
                    </View>

                    {isExpanded && (
                      <View style={S.eventDetails}>
                        <View style={S.detailRow}>
                          <Text style={S.detailLabel}>Bilis (WPM):</Text>
                          <Text style={S.detailValue}>{report.wordPerMin || 0}</Text>
                        </View>
                        {report.miscues && report.miscues.length > 0 && (
                          <View style={S.miscueSummary}>
                            <Text style={S.miscueSummaryTitle}>Mga naging mali:</Text>
                            <Text style={S.miscueSummaryText}>
                              {report.miscues.map(m => m.expectedWord).slice(0, 5).join(', ')}
                              {report.miscues.length > 5 ? '...' : ''}
                            </Text>
                          </View>
                        )}
                        {report.accuracyRate === 100 && (
                          <View style={S.perfectTag}>
                            <PartyIcon size={14} color={C.green} />
                            <Text style={S.perfectTagText}>Perpektong Pagbasa!</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </BounceIn>
            );
          })}
          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },

  timelineContainer: { paddingTop: 10 },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: C.slate, fontWeight: '600', fontSize: 14 },

  timelineRow: { flexDirection: 'row', gap: 16 },

  // Left side
  lineCol: { width: 20, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  verticalLine: { width: 2, flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginTop: -2 },

  // Right side
  eventCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 16,
    marginBottom: 20,
    ...Shadows.subtle,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  eventCardExpanded: { ...Shadows.card, borderColor: 'rgba(0,0,0,0.1)' },

  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventMain: { flex: 1, marginRight: 10 },
  eventDate: { fontSize: 10, fontWeight: '800', color: C.slate, textTransform: 'uppercase', marginBottom: 2 },
  eventTitle: { fontSize: 15, fontWeight: '800', color: C.ink },

  accuracyPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  accuracyText: { fontSize: 13, fontWeight: '900' },

  eventDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, fontWeight: '600', color: C.slate },
  detailValue: { fontSize: 12, fontWeight: '800', color: C.ink },

  miscueSummary: { backgroundColor: C.bg, padding: 8, borderRadius: 8 },
  miscueSummaryTitle: { fontSize: 11, fontWeight: '800', color: C.slate, marginBottom: 2 },
  miscueSummaryText: { fontSize: 12, color: C.ink, fontStyle: 'italic' },

  perfectTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  perfectTagText: { fontSize: 12, fontWeight: '800', color: C.green },
});

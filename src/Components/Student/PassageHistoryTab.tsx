import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { StudentColors as C, Radii, Shadows, ACCENT_COLORS } from '../../Utilities/Theme';
import DateFilter, { TimeFilterType, SubPeriodFilter } from './DateFilter';
import { getDateRange } from '../../Utilities/analyticsDateHelpers';
import { BounceIn } from '../GlobalUse/Animations';
import { 
  BookOpenIcon, 
  HistoryIcon, 
  TimerIcon, 
  ZapIcon, 
  StarIcon, 
  TrophyIcon, 
  ChevronRightIcon,
  FlexIcon,
  PartyIcon
} from '../GlobalUse/Icons';

interface PassageHistoryTabProps {
  reports: MiscueReportDocument[];
  onStartReading: () => void;
}

interface PassageGroup {
  passageTitle: string;
  reports: MiscueReportDocument[];
}

export default function PassageHistoryTab({ reports: realReports, onStartReading }: PassageHistoryTabProps) {
  const reports = realReports || [];
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week');
  const [periodOffset, setPeriodOffset] = useState<number>(0);
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubPeriodFilter | null>(null);
  const [expandedPassages, setExpandedPassages] = useState<Set<number>>(new Set());

  // Filter only passages (Talata) and group by passageTitle
  const groupedReports = useMemo(() => {
    // Apply Date Range filter
    const activeRange = selectedSubFilter ?? getDateRange(timeFilter, periodOffset);

    // Collect all valid passage titles (case-insensitive mapping for safety)
    const validPassages = new Map(
      readingMaterialData.Passages.map(p => [p.title.toLowerCase(), p.title])
    );

    const groupsMap = new Map<string, MiscueReportDocument[]>();

    reports.forEach(r => {
      const d = r.timestamp?.toDate?.() || new Date(r.timestamp || 0);

      // Skip if outside active date boundary
      if (d.getTime() < activeRange.start.getTime() || d.getTime() > activeRange.end.getTime()) {
        return;
      }

      const titleLower = (r.passageTitle || '').toLowerCase();
      if (validPassages.has(titleLower)) {
        const correctTitle = validPassages.get(titleLower)!;
        if (!groupsMap.has(correctTitle)) {
          groupsMap.set(correctTitle, []);
        }
        groupsMap.get(correctTitle)!.push(r);
      }
    });

    const groups: PassageGroup[] = [];
    groupsMap.forEach((reportList, title) => {
      // Sort reports by oldest first so Attempt # is chronological
      reportList.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || new Date(a.timestamp || 0).getTime();
        const timeB = b.timestamp?.toDate?.()?.getTime() || new Date(b.timestamp || 0).getTime();
        return timeA - timeB; // ascending
      });

      groups.push({
        passageTitle: title,
        reports: reportList
      });
    });

    // Sort passages by the most recently attempted overall
    groups.sort((a, b) => {
      const lastA = a.reports[a.reports.length - 1];
      const lastB = b.reports[b.reports.length - 1];
      const timeA = lastA.timestamp?.toDate?.()?.getTime() || new Date(lastA.timestamp || 0).getTime();
      const timeB = lastB.timestamp?.toDate?.()?.getTime() || new Date(lastB.timestamp || 0).getTime();
      return timeB - timeA;
    });

    return groups;
  }, [reports, timeFilter, periodOffset, selectedSubFilter]);

  const togglePassageExpansion = (index: number) => {
    setExpandedPassages(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Stats generators
  const getTotalAttempts = () => {
    return groupedReports.reduce((sum, g) => sum + g.reports.length, 0);
  };

  const getAverageAccuracy = () => {
    const total = getTotalAttempts();
    if (total === 0) return 0;
    const sum = groupedReports.reduce((accSum, g) => {
      return accSum + g.reports.reduce((rSum, r) => rSum + (r.accuracyRate || 0), 0);
    }, 0);
    return (sum / total).toFixed(1);
  };

  const getBestWPM = () => {
    let best = 0;
    groupedReports.forEach(g => {
      g.reports.forEach(r => {
        if ((r.wordPerMin || 0) > best) best = r.wordPerMin || 0;
      });
    });
    return best;
  };

  const formatDate = (timestamp: any) => {
    const d = timestamp?.toDate?.() || new Date(timestamp || 0);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (val?: number | string) => {
    if (!val) return '0:00';
    if (typeof val === 'string' && val.includes(':')) return val;
    const s = typeof val === 'string' ? parseInt(val) : val;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  };

  const getTotalMiscues = (report: MiscueReportDocument) => {
    // If it has explicitly defined counts (from controller)
    if (report.hasOwnProperty('totalMiscues')) {
        return report.totalMiscues || 0;
    }
    // Fallback recalculation
    return (report.substitutionCount || 0) + 
           (report.omissionCount || 0) + 
           (report.insertionCount || 0) + 
           (report.repetitionCount || 0);
  };

  return (
    <View style={S.container}>
      <BounceIn delay={80}>
        <DateFilter 
          timeFilter={timeFilter} 
          setTimeFilter={(f) => { setTimeFilter(f); setPeriodOffset(0); setSelectedSubFilter(null); }}
          periodOffset={periodOffset}
          onOffsetChange={(o) => { setPeriodOffset(o); setSelectedSubFilter(null); }}
          selectedSubFilter={selectedSubFilter}
          onSubFilterChange={setSelectedSubFilter}
        />
      </BounceIn>

      {groupedReports.length === 0 ? (
        <BounceIn delay={120}>
          <View style={S.emptyContainer}>
            <View style={S.emptyIconContainer}>
              <HistoryIcon size={48} color={C.green} />
            </View>
            <Text style={S.emptyTitle}>No Reading History Yet</Text>
            <Text style={S.emptyMessage}>
              You haven't completed any reading activities yet. Start reading
              passages to track your progress and see your improvement over time!
            </Text>
            <TouchableOpacity
              style={S.emptyButton}
              onPress={onStartReading}
              activeOpacity={0.8}
            >
              <Text style={S.emptyButtonText}>Start Reading</Text>
            </TouchableOpacity>
          </View>
        </BounceIn>
      ) : (
        <>
          <BounceIn delay={120}>
            <View style={S.statsBar}>
              <View style={S.statItem}>
                <Text style={S.statValue}>{groupedReports.length}</Text>
                <Text style={S.statLabel}>Mga Talata</Text>
              </View>
              <View style={S.statDivider} />
              <View style={S.statItem}>
                <Text style={S.statValue}>{getTotalAttempts()}</Text>
                <Text style={S.statLabel}>Attempts</Text>
              </View>
              <View style={S.statDivider} />
              <View style={S.statItem}>
                <Text style={S.statValue}>{getAverageAccuracy()}%</Text>
                <Text style={S.statLabel}>Avg. Acc</Text>
              </View>
              <View style={S.statDivider} />
              <View style={S.statItem}>
                <Text style={S.statValue}>{getBestWPM()}</Text>
                <Text style={S.statLabel}>Best WPM</Text>
              </View>
            </View>
          </BounceIn>

          <View style={S.contentContainer}>
            <BounceIn delay={180}>
              <Text style={S.sectionLabel}>Iyong Mga Reading Sessions</Text>
            </BounceIn>

            {groupedReports.map((group, passageIndex) => {
              const isExpanded = expandedPassages.has(passageIndex);
              return (
                <BounceIn key={passageIndex} delay={220 + passageIndex * 60}>
                  <View style={[S.passageCard, isExpanded && S.passageCardExpanded]}>
                    <TouchableOpacity
                      onPress={() => togglePassageExpansion(passageIndex)}
                      style={S.passageHeader}
                      activeOpacity={0.7}
                    >
                      <View style={S.passageIconContainer}>
                        <BookOpenIcon size={24} color={C.greenDeep} />
                      </View>
                      <View style={S.passageInfo}>
                        <Text style={S.passageTitle} numberOfLines={2}>
                          {group.passageTitle}
                        </Text>
                        <Text style={S.passageAttempts}>
                          {group.reports.length} attempt{group.reports.length > 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={[S.passageArrowContainer, isExpanded && { transform: [{ rotate: '90deg' }] }]}>
                        <ChevronRightIcon size={16} color={C.slate} />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={S.reportsContainer}>
                        {/* Reverse to show latest attempt at the top within the expansion! */}
                        {group.reports.slice().reverse().map((report, idx) => {
                          const chronologicalIndex = group.reports.length - idx; // so oldest is #1
                          const totalMiscues = getTotalMiscues(report);
                          const subLabel = report.substitution || 'None';
                          const omitLabel = report.omission || 'None';
                          const insLabel = report.insertion || 'None';
                          const repLabel = report.repetition || 'None';

                          return (
                            <View key={report.reportId || idx.toString()} style={S.reportCard}>
                              <View style={S.reportDateRow}>
                                <Text style={S.reportDate}>
                                  {formatDate(report.timestamp)}
                                </Text>
                                <View style={S.reportAttemptBadge}>
                                  <Text style={S.reportAttemptText}>
                                    #{chronologicalIndex}
                                  </Text>
                                </View>
                              </View>

                              <View style={S.metricsGrid}>
                                <View style={S.metricCard}>
                                  <Text style={S.metricValue}>{(report.accuracyRate || 0).toFixed(1)}%</Text>
                                  <Text style={S.metricLabel}>Accuracy</Text>
                                </View>
                                <View style={S.metricCard}>
                                  <Text style={S.metricValue}>{report.wordPerMin || 0}</Text>
                                  <Text style={S.metricLabel}>WPM</Text>
                                </View>
                                <View style={S.metricCard}>
                                  <Text style={S.metricValue}>{formatDuration(report.recordingDuration)}</Text>
                                  <Text style={S.metricLabel}>Duration</Text>
                                </View>
                                <View style={S.metricCard}>
                                  <Text style={S.metricValue}>{totalMiscues}</Text>
                                  <Text style={S.metricLabel}>Miscues</Text>
                                </View>
                              </View>

                              {totalMiscues > 0 && (
                                <View style={S.miscueSection}>
                                  <Text style={S.miscueSectionTitle}>Miscue Breakdown</Text>
                                  {subLabel !== 'None' && (
                                    <View style={S.miscueRow}>
                                      <View style={[S.miscueTag, S.miscueTagSubstitution]}>
                                        <Text style={[S.miscueTagText, { color: C.red }]}>✎ Pagpapalit</Text>
                                      </View>
                                      <Text style={S.miscueDetail} numberOfLines={2}>{subLabel}</Text>
                                    </View>
                                  )}
                                  {omitLabel !== 'None' && (
                                    <View style={S.miscueRow}>
                                      <View style={[S.miscueTag, S.miscueTagOmission]}>
                                        <Text style={[S.miscueTagText, { color: C.orange }]}>- Pagkakaltas</Text>
                                      </View>
                                      <Text style={S.miscueDetail} numberOfLines={2}>{omitLabel}</Text>
                                    </View>
                                  )}
                                  {insLabel !== 'None' && (
                                    <View style={S.miscueRow}>
                                      <View style={[S.miscueTag, S.miscueTagInsertion]}>
                                        <Text style={[S.miscueTagText, { color: C.teal }]}>+ Pagdaragdag</Text>
                                      </View>
                                      <Text style={S.miscueDetail} numberOfLines={2}>{insLabel}</Text>
                                    </View>
                                  )}
                                  {repLabel !== 'None' && (
                                    <View style={S.miscueRow}>
                                      <View style={[S.miscueTag, S.miscueTagRepetition]}>
                                        <Text style={[S.miscueTagText, { color: C.purple }]}>↺ Pag-uulit</Text>
                                      </View>
                                      <Text style={S.miscueDetail} numberOfLines={2}>{repLabel}</Text>
                                    </View>
                                  )}
                                </View>
                              )}

                              {totalMiscues === 0 && (
                                <View style={S.perfectBadge}>
                                  <PartyIcon size={20} color={C.green} />
                                  <Text style={S.perfectText}>
                                    Walang mali! Ang galing!
                                  </Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </BounceIn>
              );
            })}
            <View style={{height: 40}} />
          </View>
        </>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flex: 1,
  },
  emptyContainer: {
    backgroundColor: C.white,
    borderRadius: Radii.xl,
    padding: 32,
    alignItems: 'center',
    ...Shadows.cardLift,
    marginTop: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.green + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 15,
    color: C.slate,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: C.green,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radii.pill,
    ...Shadows.subtle,
  },
  emptyButtonText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 16,
  },

  // ── Stats Bar ──
  statsBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
    ...Shadows.card,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: C.greenDeep,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: C.slate,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.slate + '40',
  },

  // ── Content List ──
  contentContainer: {
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 16,
    marginLeft: 4,
  },
  passageCard: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    marginBottom: 12,
    overflow: 'hidden',
    ...Shadows.card,
  },
  passageCardExpanded: {
    ...Shadows.cardLift,
  },
  passageHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  passageIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  passageIconText: {
    fontSize: 22,
  },
  passageInfo: {
    flex: 1,
  },
  passageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 4,
  },
  passageAttempts: {
    fontSize: 13,
    fontWeight: '600',
    color: C.slate,
  },
  passageArrowContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  passageArrow: {
    fontSize: 14,
    color: C.slate,
  },

  // ── Expanded Reports ──
  reportsContainer: {
    backgroundColor: C.bg,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.slate + '20',
  },
  reportCard: {
    backgroundColor: C.white,
    borderRadius: Radii.md,
    padding: 16,
    marginBottom: 12,
    ...Shadows.subtle,
  },
  reportDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportDate: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  reportAttemptBadge: {
    backgroundColor: C.green + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportAttemptText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.greenDeep,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: C.bg,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Radii.sm,
    alignItems: 'center',
    width: '23%',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.slate,
    textAlign: 'center',
  },

  // ── Miscues ──
  miscueSection: {
    backgroundColor: C.bg + '50',
    borderRadius: Radii.sm,
    padding: 12,
  },
  miscueSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.slate,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  miscueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  miscueTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  miscueTagSubstitution: { backgroundColor: C.red + '15' },
  miscueTagOmission: { backgroundColor: C.orange + '15' },
  miscueTagInsertion: { backgroundColor: C.teal + '15' },
  miscueTagRepetition: { backgroundColor: C.purple + '15' },
  miscueTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  miscueDetail: {
    flex: 1,
    fontSize: 13,
    color: C.slate,
    fontWeight: '600',
  },

  // ── Perfect Badge ──
  perfectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.green + '15',
    padding: 12,
    borderRadius: Radii.sm,
  },
  perfectIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  perfectText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.greenDeep,
    flex: 1,
  },
});

// Components/Faculty/Dashboard/ClassReadingStatus.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { useFetchClassReadingHealth } from '../../../Hooks/use_ReadingStudentStats';
import { ClassReadingHealth, StudentReadingStatus } from '../../../Interfaces/miscue';
import { sw, sh, sf } from '../../../Utils/responsive';
import { FacultyColors, Radii, Shadows } from '../../../Utilities/Theme';
import { DateRangeFilter, DateBounds } from '../../GlobalUse/DateRangeFilter';

// ─── Color Tokens ─────────────────────────────────────────────────────────────

const C = {
  primary:      FacultyColors.primary,
  primaryLight: FacultyColors.primaryLight,
  primaryPale:  FacultyColors.primaryPale,
  ink:          FacultyColors.ink,
  inkLight:     FacultyColors.inkLight,
  slate:        FacultyColors.slate,
  white:        FacultyColors.white,
  bg:           FacultyColors.bg,

  fluent:       '#2CA96A',
  developing:   '#F9C74F',
  emerging:     '#F39C12',
  atRisk:       '#EB5C6C',
  insufficient: '#9CA3AF',

  fluentBg:       '#E8F5E9',
  developingBg:   '#FFFDE7',
  emergingBg:     '#FFF3E0',
  atRiskBg:       '#FFEBEE',
  insufficientBg: '#F3F4F6',

  surface:      '#FAFAFA',
  border:       '#F0F0F0',
  borderLight:  '#F3F4F6',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  fluent:           { label: 'Fluent',            color: C.fluent,       bg: C.fluentBg },
  developing:       { label: 'Developing',        color: C.developing,   bg: C.developingBg },
  emerging:         { label: 'Emerging',          color: C.emerging,     bg: C.emergingBg },
  atRisk:           { label: 'At Risk',           color: C.atRisk,       bg: C.atRiskBg },
  insufficientData: { label: 'Insufficient Data', color: C.insufficient, bg: C.insufficientBg },
};

const getColor = (key: string) => STATUS_CONFIG[key]?.color ?? C.slate;
const getLabel = (key: string) => STATUS_CONFIG[key]?.label ?? key;

const CONFIDENCE_MAP: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: C.fluent,       bg: C.fluentBg,       label: 'High Confidence' },
  medium: { color: C.emerging,     bg: C.emergingBg,     label: 'Medium Confidence' },
  low:    { color: C.atRisk,       bg: C.atRiskBg,       label: 'Low Confidence' },
};

// ─── Reading Health Bar ───────────────────────────────────────────────────────

const HealthBar: React.FC<{ health: ClassReadingHealth['readingHealth'] }> = ({ health }) => {
  if (!health) return null;
  const order = ['fluent', 'developing', 'emerging', 'atRisk', 'insufficientData'];
  return (
    <View style={S.bar}>
      {order.map(key => {
        const pct = health[key as keyof typeof health]?.percentage ?? 0;
        if (pct === 0) return null;
        return (
          <View
            key={key}
            style={[S.barSegment, { width: `${pct}%`, backgroundColor: getColor(key) }]}
          />
        );
      })}
    </View>
  );
};

// ─── At Risk Highlight (Primary Focus Banner) ─────────────────────────────────

const AtRiskHighlight: React.FC<{
  count: number;
  percentage: number;
  onPress: () => void;
}> = ({ count, percentage, onPress }) => {
  if (count === 0) {
    return (
      <View style={[S.focusBanner, S.focusBannerSafe]}>
        <View style={S.focusContent}>
          <Text style={S.focusLabelSafe}>All Clear</Text>
          <Text style={S.focusSubtextSafe}>
            No students are currently at risk
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={S.focusBanner} onPress={onPress} activeOpacity={0.85}>
      <View style={S.focusContent}>
        <Text style={S.focusLabel}>Needs Your Attention</Text>
        <View style={S.focusValueRow}>
          <Text style={S.focusValue}>{count}</Text>
          <Text style={S.focusValueUnit}>
            student{count !== 1 ? 's' : ''} at risk
          </Text>
        </View>
        <Text style={S.focusSubtext}>
          {percentage.toFixed(0)}% of class — Tap to review
        </Text>
      </View>
      <View style={S.focusArrow}>
        <Text style={S.focusArrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Stat Tile (Grid Item) ────────────────────────────────────────────────────

const StatTile: React.FC<{
  statusKey: string;
  count: number;
  percentage: number;
  onPress: () => void;
  disabled?: boolean;
}> = ({ statusKey, count, percentage, onPress, disabled }) => {
  const cfg = STATUS_CONFIG[statusKey];

  return (
    <TouchableOpacity
      style={[S.tile, disabled && S.tileDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[S.tileIndicator, { backgroundColor: cfg.color }]} />
      <Text style={S.tileLabel}>{cfg.label}</Text>
      <View style={S.tileValueRow}>
        <Text style={S.tileCount}>{count}</Text>
        <Text style={S.tilePercent}>{percentage.toFixed(0)}%</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Class Card ───────────────────────────────────────────────────────────────

const ClassCard: React.FC<{
  classItem: ClassReadingHealth;
  onViewCategory: (status: string, students: StudentReadingStatus[]) => void;
}> = ({ classItem, onViewCategory }) => {
  const rate = classItem.participationRate ?? 0;
  const rateColor =
    rate >= 80 ? C.fluent : rate >= 60 ? C.developing : C.atRisk;

  const confidenceKey = classItem.dataQuality?.confidence ?? 'low';
  const conf = CONFIDENCE_MAP[confidenceKey] ?? CONFIDENCE_MAP.low;

  const atRisk = classItem.readingHealth?.atRisk;
  const atRiskCount = atRisk?.count ?? 0;
  const atRiskPct = atRisk?.percentage ?? 0;

  const tileOrder: Array<keyof typeof classItem.readingHealth> = [
    'fluent',
    'developing',
    'emerging',
    'atRisk',
  ];

  return (
    <View style={S.card}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={S.cardHeader}>
        <Text style={S.cardTitle} numberOfLines={1}>
          {classItem.className}
        </Text>
        <View style={S.metaRow}>
          <Text style={S.metaText}>
            {classItem.totalStudents} student{classItem.totalStudents !== 1 ? 's' : ''}
          </Text>
          <View style={S.metaDot} />
          <Text style={[S.metaText, { color: rateColor, fontFamily: 'Poppins-SemiBold' }]}>
            {rate.toFixed(0)}% participation
          </Text>
        </View>
      </View>

      {/* ── PRIMARY FOCUS: At Risk Banner ──────────────────────────────── */}
      <AtRiskHighlight
        count={atRiskCount}
        percentage={atRiskPct}
        onPress={() => onViewCategory('atRisk', atRisk?.students ?? [])}
      />

      {/* ── Health Bar (slim, secondary) ───────────────────────────────── */}
      <View style={S.healthSection}>
        <View style={S.healthHeader}>
          <Text style={S.sectionLabel}>Class Health</Text>
        </View>
        <HealthBar health={classItem.readingHealth} />
      </View>

      {/* ── Stat Tiles Grid (2x2) ──────────────────────────────────────── */}
      <View style={S.gridContainer}>
        {tileOrder.map(key => {
          const data = classItem.readingHealth?.[key];
          const count = data?.count ?? 0;
          const pct = data?.percentage ?? 0;
          return (
            <StatTile
              key={key}
              statusKey={key}
              count={count}
              percentage={pct}
              onPress={() => onViewCategory(key, data?.students ?? [])}
              disabled={count === 0}
            />
          );
        })}
      </View>

      {/* ── Insufficient Data Row (separate, secondary) ────────────────── */}
      {(() => {
        const insufficient = classItem.readingHealth?.insufficientData;
        const insufficientCount = insufficient?.count ?? 0;
        if (insufficientCount === 0) return null;

        return (
          <TouchableOpacity
            style={S.insufficientRow}
            onPress={() =>
              onViewCategory('insufficientData', insufficient?.students ?? [])
            }
            activeOpacity={0.7}
          >
            <View style={S.insufficientIcon}>
              <Text style={S.insufficientIconText}>?</Text>
            </View>
            <View style={S.insufficientContent}>
              <Text style={S.insufficientLabel}>Insufficient Data</Text>
              <Text style={S.insufficientSubtext}>
                {insufficientCount} student
                {insufficientCount !== 1 ? 's' : ''} need more reading sessions
              </Text>
            </View>
            <Text style={S.insufficientArrow}>›</Text>
          </TouchableOpacity>
        );
      })()}

      {/* ── Required Actions Alert ─────────────────────────────────────── */}
      {classItem.requiredActions ? (
        <View style={S.alertBanner}>
          <View style={S.alertIndicator} />
          <View style={S.alertContent}>
            <Text style={S.alertTitle}>Action Required</Text>
            <Text style={S.alertText}>{classItem.requiredActions}</Text>
          </View>
        </View>
      ) : null}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <View style={S.footer}>
        <View style={[S.confBadge, { backgroundColor: conf.bg }]}>
          <View style={[S.confDot, { backgroundColor: conf.color }]} />
          <Text style={[S.confText, { color: conf.color }]}>{conf.label}</Text>
        </View>
        <Text style={S.updatedText}>
          Updated{' '}
          {classItem.lastUpdated
            ? new Date(classItem.lastUpdated).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : 'N/A'}
        </Text>
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  facultyId: string;
  filter: { academicYear: string; selectedView: string };
  onFilterChange: (filter: { academicYear: string; selectedView: string }) => void;
}

const ClassReadingStatus: React.FC<Props> = ({ facultyId, filter }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    status: string;
    students: StudentReadingStatus[];
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateBounds, setDateBounds] = useState<DateBounds | null>(null);

  const { academicYear, selectedView } = filter;
  const { loading, classHealthData, error } = useFetchClassReadingHealth(facultyId);

  const filteredData = useMemo(() => {
    if (!classHealthData) return [];
    let data = academicYear
      ? classHealthData.filter(item => item?.acadYear === academicYear)
      : classHealthData;

    // Client-side filter by lastUpdated falling within selected date range
    if (dateBounds) {
      data = data.filter(item => {
        if (!item?.lastUpdated) return false;
        const ts = new Date(item.lastUpdated).getTime();
        return ts >= dateBounds.start.getTime() && ts <= dateBounds.end.getTime();
      });
    }
    return data;
  }, [classHealthData, academicYear, dateBounds]);

  const overallData = useMemo<ClassReadingHealth | null>(() => {
    if (selectedView !== 'overall' || filteredData.length === 0) return null;

    const agg: ClassReadingHealth = {
      classId: 'overall',
      className: 'All Classes',
      acadYear: academicYear || 'All Years',
      totalStudents: 0,
      participationRate: 0,
      dataQuality: { confidence: 'low', recommendation: '' },
      lastUpdated: new Date(),
      readingHealth: {
        fluent:           { count: 0, percentage: 0, students: [] },
        developing:       { count: 0, percentage: 0, students: [] },
        emerging:         { count: 0, percentage: 0, students: [] },
        atRisk:           { count: 0, percentage: 0, students: [] },
        insufficientData: { count: 0, percentage: 0, students: [] },
      },
    };

    filteredData.forEach(c => {
      if (!c) return;
      agg.totalStudents += c.totalStudents ?? 0;
      (['fluent', 'developing', 'emerging', 'atRisk', 'insufficientData'] as const).forEach(k => {
        if (c.readingHealth?.[k]) {
          agg.readingHealth[k].count += c.readingHealth[k].count ?? 0;
          agg.readingHealth[k].students.push(...(c.readingHealth[k].students ?? []));
        }
      });
    });

    (['fluent', 'developing', 'emerging', 'atRisk', 'insufficientData'] as const).forEach(k => {
      agg.readingHealth[k].percentage =
        agg.totalStudents > 0
          ? parseFloat(((agg.readingHealth[k].count / agg.totalStudents) * 100).toFixed(1))
          : 0;
    });

    return agg;
  }, [filteredData, selectedView, academicYear]);

  const displayData =
    selectedView === 'overall'
      ? overallData
      : filteredData.find(c => c?.classId === selectedView);

  const filteredStudents = useMemo(() => {
    if (!modalData?.students) return [];
    const q = searchQuery.trim().toLowerCase();
    return q
      ? modalData.students.filter(s => s?.name?.toLowerCase().includes(q))
      : modalData.students;
  }, [modalData, searchQuery]);

  const openModal = (status: string, students: StudentReadingStatus[]) => {
    if (students.length === 0) return; // Prevent empty modals
    setModalData({ status, students });
    setSearchQuery('');
    setModalVisible(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={S.container}>
      {/* ── Date Filter ──────────────────────────────────────────────── */}
      <View style={S.filterCard}>
        <DateRangeFilter simple onRangeChange={setDateBounds} />
      </View>

      {loading ? (
        <View style={S.centerBox}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={S.centerText}>Loading class data…</Text>
        </View>
      ) : error ? (
        <View style={S.centerBox}>
          <Text style={[S.centerText, { color: C.atRisk }]}>{error}</Text>
        </View>
      ) : !filteredData.length ? (
        <View style={S.centerBox}>
          <Text style={S.centerText}>No data for this academic year.</Text>
        </View>
      ) : displayData ? (
        <ClassCard classItem={displayData} onViewCategory={openModal} />
      ) : null}

      {/* ── Student List Modal ─────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={S.overlay}>
          <View style={S.modalCard}>
            {/* Modal Header */}
            <View style={S.modalHeader}>
              <View style={S.modalHeaderLeft}>
                <View
                  style={[
                    S.modalStatusDot,
                    { backgroundColor: getColor(modalData?.status ?? '') },
                  ]}
                />
                <View>
                  <Text style={S.modalTitle}>{getLabel(modalData?.status ?? '')}</Text>
                  <Text style={S.modalSub}>
                    {filteredStudents.length} student
                    {filteredStudents.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={S.closeBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={S.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={S.searchRow}>
              <Image
                source={require('../../../../assets/icons/Search-icon.png')}
                style={S.searchIcon}
              />
              <TextInput
                style={S.searchInput}
                placeholder="Search student…"
                placeholderTextColor={C.slate}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* List */}
            <FlatList
              data={filteredStudents}
              keyExtractor={item => item.studentId}
              contentContainerStyle={S.listContent}
              ItemSeparatorComponent={() => <View style={S.studentSep} />}
              renderItem={({ item, index }) => {
                const trendColor =
                  item.trend === 'improving'
                    ? C.fluent
                    : item.trend === 'declining'
                    ? C.atRisk
                    : C.slate;

                const trendSymbol =
                  item.trend === 'improving'
                    ? '↑'
                    : item.trend === 'declining'
                    ? '↓'
                    : '→';

                return (
                  <View style={S.studentRow}>
                    <View style={S.rankBubble}>
                      <Text style={S.rankText}>{index + 1}</Text>
                    </View>
                    <View style={S.studentInfo}>
                      <Text style={S.studentName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={S.studentStats}>
                        <View style={S.statBlock}>
                          <Text style={S.statValue}>{item.averageAccuracy}%</Text>
                          <Text style={S.statLabel}>Accuracy</Text>
                        </View>
                        <View style={S.statBlock}>
                          <Text style={S.statValue}>{item.averageWPM}</Text>
                          <Text style={S.statLabel}>WPM</Text>
                        </View>
                        <View style={S.statBlock}>
                          <Text style={[S.statValue, { color: trendColor }]}>
                            {trendSymbol}
                          </Text>
                          <Text style={S.statLabel}>{item.trend ?? 'stable'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={S.emptyList}>
                  <Text style={S.emptyText}>No students match your search.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  // ── Wrapper ───────────────────────────────────────────────────────────────
  container: { marginBottom: sh(8) },

  filterCard: {
    backgroundColor: C.white,
    borderRadius: sw(14),
    padding: sw(14),
    marginBottom: sh(12),
    ...Shadows.card,
  },
  filterTitle: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Bold',
    color: '#1B5E20',
    marginBottom: sh(8),
  },

  centerBox:  { paddingVertical: sh(32), alignItems: 'center' },
  centerText: {
    marginTop: sh(10),
    fontSize: sf(13),
    fontFamily: 'Poppins-Medium',
    color: C.slate,
    textAlign: 'center',
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.white,
    borderRadius: sw(16),
    padding: sw(18),
    ...Shadows.card,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  cardHeader: { marginBottom: sh(16) },
  cardTitle: {
    fontSize: sf(18),
    fontFamily: 'Poppins-Bold',
    color: C.ink,
    marginBottom: sh(4),
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: sf(12),
    fontFamily: 'Poppins-Medium',
    color: C.slate,
  },
  metaDot: {
    width: sw(3),
    height: sw(3),
    borderRadius: sw(1.5),
    backgroundColor: C.slate,
    marginHorizontal: sw(8),
    opacity: 0.5,
  },

  // ── Focus Banner (Primary CTA) ────────────────────────────────────────────
  focusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.atRiskBg,
    borderRadius: sw(12),
    padding: sw(14),
    marginBottom: sh(16),
    borderLeftWidth: sw(3),
    borderLeftColor: C.atRisk,
  },
  focusBannerSafe: {
    backgroundColor: C.fluentBg,
    borderLeftColor: C.fluent,
  },
  focusContent: { flex: 1 },
  focusLabel: {
    fontSize: sf(11),
    fontFamily: 'Poppins-SemiBold',
    color: C.atRisk,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: sh(4),
  },
  focusLabelSafe: {
    fontSize: sf(11),
    fontFamily: 'Poppins-SemiBold',
    color: C.fluent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: sh(4),
  },
  focusValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: sh(2),
  },
  focusValue: {
    fontSize: sf(28),
    fontFamily: 'Poppins-Bold',
    color: C.ink,
    letterSpacing: -0.8,
    marginRight: sw(6),
  },
  focusValueUnit: {
    fontSize: sf(13),
    fontFamily: 'Poppins-Medium',
    color: C.ink,
  },
  focusSubtext: {
    fontSize: sf(11),
    fontFamily: 'Poppins-Medium',
    color: C.inkLight,
  },
  focusSubtextSafe: {
    fontSize: sf(13),
    fontFamily: 'Poppins-Medium',
    color: C.ink,
    marginTop: sh(2),
  },
  focusArrow: {
    width: sw(28),
    height: sw(28),
    borderRadius: sw(14),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: sw(8),
  },
  focusArrowText: {
    fontSize: sf(20),
    fontFamily: 'Poppins-SemiBold',
    color: C.atRisk,
    lineHeight: sf(22),
  },

  // ── Health Section ────────────────────────────────────────────────────────
  healthSection: { marginBottom: sh(14) },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(8),
  },
  sectionLabel: {
    fontSize: sf(11),
    fontFamily: 'Poppins-SemiBold',
    color: C.inkLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bar: {
    flexDirection: 'row',
    height: sh(6),
    borderRadius: Radii.pill,
    overflow: 'hidden',
    backgroundColor: C.borderLight,
  },
  barSegment: { height: '100%' },

  // ── Stat Tiles Grid ───────────────────────────────────────────────────────
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: sh(14),
  },
  tile: {
    width: '48.5%',
    backgroundColor: C.surface,
    borderRadius: sw(12),
    padding: sw(12),
    marginBottom: sh(8),
    borderWidth: 1,
    borderColor: C.border,
  },
  tileDisabled: {
    opacity: 0.5,
  },
  tileIndicator: {
    width: sw(24),
    height: sh(3),
    borderRadius: sw(2),
    marginBottom: sh(8),
  },
  tileLabel: {
    fontSize: sf(11),
    fontFamily: 'Poppins-Medium',
    color: C.inkLight,
    marginBottom: sh(6),
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  tileCount: {
    fontSize: sf(22),
    fontFamily: 'Poppins-Bold',
    color: C.ink,
    letterSpacing: -0.5,
  },
  tilePercent: {
    fontSize: sf(11),
    fontFamily: 'Poppins-SemiBold',
    color: C.slate,
  },

  // ── Insufficient Data Row (secondary, full-width) ─────────────────────────
  insufficientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.insufficientBg,
    borderRadius: sw(10),
    paddingHorizontal: sw(12),
    paddingVertical: sh(10),
    marginBottom: sh(14),
    borderWidth: 1,
    borderColor: C.border,
  },
  insufficientIcon: {
    width: sw(28),
    height: sw(28),
    borderRadius: sw(14),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sw(10),
    borderWidth: 1,
    borderColor: C.border,
  },
  insufficientIconText: {
    fontSize: sf(14),
    fontFamily: 'Poppins-Bold',
    color: C.insufficient,
    lineHeight: sf(16),
  },
  insufficientContent: { flex: 1 },
  insufficientLabel: {
    fontSize: sf(12),
    fontFamily: 'Poppins-SemiBold',
    color: C.ink,
    marginBottom: sh(1),
  },
  insufficientSubtext: {
    fontSize: sf(11),
    fontFamily: 'Poppins-Medium',
    color: C.slate,
  },
  insufficientArrow: {
    fontSize: sf(20),
    fontFamily: 'Poppins-SemiBold',
    color: C.slate,
    marginLeft: sw(8),
    lineHeight: sf(22),
  },

  // ── Alert Banner (Required Actions) ───────────────────────────────────────
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: sw(10),
    padding: sw(12),
    marginBottom: sh(14),
    borderWidth: 1,
    borderColor: '#FCE8B2',
  },
  alertIndicator: {
    width: sw(3),
    backgroundColor: C.emerging,
    borderRadius: sw(2),
    marginRight: sw(10),
  },
  alertContent: { flex: 1 },
  alertTitle: {
    fontSize: sf(11),
    fontFamily: 'Poppins-SemiBold',
    color: C.emerging,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: sh(2),
  },
  alertText: {
    fontSize: sf(12),
    fontFamily: 'Poppins-Medium',
    color: C.ink,
    lineHeight: sf(18),
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: sh(12),
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  confBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.pill,
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    gap: sw(6),
  },
  confDot: {
    width: sw(6),
    height: sw(6),
    borderRadius: sw(3),
  },
  confText: {
    fontSize: sf(10),
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.2,
  },
  updatedText: {
    fontSize: sf(11),
    fontFamily: 'Poppins-Medium',
    color: C.slate,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: sw(20),
  },
  modalCard: {
    backgroundColor: C.white,
    borderRadius: sw(20),
    maxHeight: '80%',
    overflow: 'hidden',
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: sw(16),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalStatusDot: {
    width: sw(10),
    height: sw(10),
    borderRadius: sw(5),
    marginRight: sw(10),
  },
  modalTitle: {
    fontSize: sf(17),
    fontFamily: 'Poppins-Bold',
    color: C.ink,
    letterSpacing: -0.2,
  },
  modalSub: {
    fontSize: sf(11),
    fontFamily: 'Poppins-Medium',
    color: C.slate,
    marginTop: sh(1),
  },
  closeBtn: {
    width: sw(30),
    height: sw(30),
    borderRadius: sw(15),
    backgroundColor: C.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: sf(13), color: C.slate, fontFamily: 'Poppins-SemiBold' },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: sw(12),
    paddingHorizontal: sw(12),
    backgroundColor: C.borderLight,
    borderRadius: Radii.md,
  },
  searchIcon: {
    width: sw(15),
    height: sw(15),
    tintColor: C.slate,
    marginRight: sw(8),
  },
  searchInput: {
    flex: 1,
    height: sh(40),
    fontSize: sf(13),
    fontFamily: 'Poppins-Medium',
    color: C.ink,
  },

  // Student list
  listContent: { paddingHorizontal: sw(12), paddingBottom: sh(16) },
  studentSep: { height: 1, backgroundColor: C.border, marginLeft: sw(40) },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(12),
  },
  rankBubble: {
    width: sw(28),
    height: sw(28),
    borderRadius: sw(14),
    backgroundColor: C.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sw(12),
  },
  rankText: {
    fontSize: sf(11),
    fontFamily: 'Poppins-Bold',
    color: C.primary,
  },
  studentInfo: { flex: 1 },
  studentName: {
    fontSize: sf(13),
    fontFamily: 'Poppins-SemiBold',
    color: C.ink,
    marginBottom: sh(6),
  },
  studentStats: {
    flexDirection: 'row',
    gap: sw(16),
  },
  statBlock: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: sf(13),
    fontFamily: 'Poppins-Bold',
    color: C.ink,
    lineHeight: sf(16),
  },
  statLabel: {
    fontSize: sf(10),
    fontFamily: 'Poppins-Medium',
    color: C.slate,
    textTransform: 'capitalize',
    marginTop: sh(1),
  },

  emptyList: { paddingVertical: sh(40), alignItems: 'center' },
  emptyText: {
    fontSize: sf(12),
    fontFamily: 'Poppins-Medium',
    color: C.slate,
  },
});

export default ClassReadingStatus;
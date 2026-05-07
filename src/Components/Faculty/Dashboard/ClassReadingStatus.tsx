// Components/Faculty/Dashboard/ClassReadingStatus.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { useFetchClassReadingHealth } from '../../../Hooks/use_ReadingStudentStats';
import { ClassReadingHealth, StudentReadingStatus } from '../../../Interfaces/miscue';
import { sw, sh, sf } from '../../../Utils/responsive';
import { FacultyColors, Radii, Shadows } from '../../../Utilities/Theme';

// --- Palette ---
const C = {
  primary: FacultyColors.primary,
  primaryLight: FacultyColors.primaryLight,
  primaryPale: FacultyColors.primaryPale,
  ink: FacultyColors.ink,
  inkLight: FacultyColors.inkLight,
  slate: FacultyColors.slate,
  white: FacultyColors.white,
  bg: FacultyColors.bg,
  
  fluent: '#2CA96A',
  developing: '#F9E04B',
  emerging: '#F39C12',
  atRisk: '#EB5C6C',
  insufficient: '#9CA3AF',
  
  fluentBg: '#E8F5E9',
  developingBg: '#FFFDE7',
  emergingBg: '#FFF3E0',
  atRiskBg: '#FFEBEE',
  insufficientBg: '#F3F4F6',
};

// --- Helper Components (Defined Outside to avoid Hook errors) ---

const FadeSlideIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, tension: 50, friction: 8, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

const TrendIcon = ({ trend }: { trend: 'improving' | 'stable' | 'declining' }) => {
  switch (trend) {
    case 'improving': return <Text style={{ color: C.fluent, fontSize: sf(14) }}>▲</Text>;
    case 'declining': return <Text style={{ color: C.atRisk, fontSize: sf(14) }}>▼</Text>;
    default: return <Text style={{ color: C.slate, fontSize: sf(14) }}>▶</Text>;
  }
};

const ConfidenceBadge = ({ confidence }: { confidence: 'high' | 'medium' | 'low' }) => {
  const config = {
    high: { color: C.fluent, bg: C.fluentBg, label: 'HIGH CONFIDENCE' },
    medium: { color: C.emerging, bg: C.emergingBg, label: 'MED CONFIDENCE' },
    low: { color: C.atRisk, bg: C.atRiskBg, label: 'LOW CONFIDENCE' },
  }[confidence] || { color: C.slate, bg: C.insufficientBg, label: 'N/A' };

  return (
    <View style={[styles.confidenceBadge, { backgroundColor: config.bg }]}>
      <View style={[styles.confidenceDot, { backgroundColor: config.color }]} />
      <Text style={[styles.confidenceText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    fluent: C.fluent,
    developing: C.developing,
    emerging: C.emerging,
    atRisk: C.atRisk,
    insufficientData: C.insufficient,
  };
  return colors[status] || C.slate;
};

const getStatusLabel = (status: string): string => {
  if (status === 'insufficientData') return 'Insufficient Data';
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1');
};

const StatusBar: React.FC<{ health: ClassReadingHealth['readingHealth'] }> = ({ health }) => {
  if (!health) return null;
  const statuses = ['fluent', 'developing', 'emerging', 'atRisk', 'insufficientData'];
  return (
    <View style={styles.statusBarContainer}>
      {statuses.map(status => {
        const percentage = health[status as keyof typeof health]?.percentage ?? 0;
        if (percentage === 0) return null;
        return (
          <View
            key={status}
            style={[
              styles.statusSegment,
              { width: `${percentage}%`, backgroundColor: getStatusColor(status) },
            ]}
          />
        );
      })}
    </View>
  );
};

// --- Sub-Component: ClassCard ---
const ClassCard: React.FC<{
  classItem: ClassReadingHealth;
  isExpanded: boolean;
  onToggle: () => void;
  onViewCategory: (status: string, students: StudentReadingStatus[]) => void;
}> = ({ classItem, isExpanded, onToggle, onViewCategory }) => {
  const participationRate = classItem.participationRate || 0;
  const pColor = participationRate >= 80 ? C.fluent : participationRate >= 60 ? C.developing : C.atRisk;

  return (
    <View style={styles.classCard}>
      <TouchableOpacity style={styles.classHeader} onPress={onToggle} activeOpacity={0.8}>
        <View style={styles.classHeaderLeft}>
          <Text style={styles.className}>{classItem.className}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Total Students</Text>
              <Text style={styles.metaValue}>{classItem.totalStudents}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Participation</Text>
              <Text style={[styles.metaValue, { color: pColor }]}>{participationRate.toFixed(0)}%</Text>
            </View>
          </View>
        </View>
        <View style={styles.expandBtn}>
          <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {classItem.requiredActions && (
        <View style={styles.actionBanner}>
          <Text style={styles.actionTitle}>⚠️ Attention Required</Text>
          <Text style={styles.actionText}>{classItem.requiredActions}</Text>
        </View>
      )}

      <View style={styles.statusSection}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Reading Health Distribution</Text>
          <Text style={styles.statusSubtitle}>Based on most recent assessments</Text>
        </View>
        <StatusBar health={classItem.readingHealth} />
        
        <View style={styles.legendGrid}>
          {['fluent', 'developing', 'emerging', 'atRisk'].map(key => {
            const data = classItem.readingHealth?.[key as keyof typeof classItem.readingHealth];
            return (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getStatusColor(key) }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>{getStatusLabel(key)}</Text>
                <Text style={styles.legendPct}>{(data?.percentage || 0).toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.footerRow}>
        <ConfidenceBadge confidence={classItem.dataQuality?.confidence || 'low'} />
        <Text style={styles.updatedText}>
          Updated: {classItem.lastUpdated ? new Date(classItem.lastUpdated).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      {isExpanded && (
        <FadeSlideIn delay={100}>
          <View style={styles.expandedContent}>
            <Text style={styles.expandedTitle}>Performance Categories</Text>
            <View style={styles.categoryGrid}>
              {['fluent', 'developing', 'emerging', 'atRisk', 'insufficientData'].map(key => {
                const data = classItem.readingHealth?.[key as keyof typeof classItem.readingHealth];
                if (!data || data.count === 0) return null;
                const color = getStatusColor(key);
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.categoryCard, { borderLeftColor: color }]}
                    onPress={() => onViewCategory(key, data.students || [])}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryLabel, { color }]}>{getStatusLabel(key)}</Text>
                      <Text style={styles.categoryCount}>{data.count}</Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryPct}>{(data.percentage).toFixed(0)}%</Text>
                      <View style={styles.viewBadge}>
                        <Text style={styles.viewBadgeText}>View</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </FadeSlideIn>
      )}
    </View>
  );
};

interface Props {
  facultyId: string;
  filter: {
    academicYear: string;
    selectedView: string;
  };
  onFilterChange: (filter: {
    academicYear: string;
    selectedView: string;
  }) => void;
}

// --- Main Component ---
const ClassReadingStatus: React.FC<Props> = ({ facultyId, filter }) => {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{ status: string; students: StudentReadingStatus[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { academicYear, selectedView } = filter;
  const { loading, classHealthData, error } = useFetchClassReadingHealth(facultyId);

  const filteredClassHealthData = useMemo(() => {
    if (!classHealthData) return [];
    return academicYear 
      ? classHealthData.filter(item => item?.acadYear === academicYear) 
      : classHealthData;
  }, [classHealthData, academicYear]);

  const overallData = useMemo(() => {
    if (selectedView !== 'overall' || filteredClassHealthData.length === 0) return null;
    const overall: ClassReadingHealth = {
      classId: 'overall',
      className: 'Overall Reading Health',
      acadYear: academicYear || 'All Years',
      totalStudents: 0,
      participationRate: 0,
      dataQuality: { confidence: 'low', recommendation: 'N/A' },
      lastUpdated: new Date(),
      readingHealth: {
        fluent: { count: 0, percentage: 0, students: [] },
        developing: { count: 0, percentage: 0, students: [] },
        emerging: { count: 0, percentage: 0, students: [] },
        atRisk: { count: 0, percentage: 0, students: [] },
        insufficientData: { count: 0, percentage: 0, students: [] },
      },
    };
    filteredClassHealthData.forEach(classItem => {
      if (!classItem) return;
      overall.totalStudents += classItem.totalStudents || 0;
      ['fluent', 'developing', 'emerging', 'atRisk', 'insufficientData'].forEach(key => {
        const k = key as keyof typeof overall.readingHealth;
        if (classItem.readingHealth?.[k]) {
          overall.readingHealth[k].count += classItem.readingHealth[k].count || 0;
          overall.readingHealth[k].students.push(...(classItem.readingHealth[k].students || []));
        }
      });
    });
    ['fluent', 'developing', 'emerging', 'atRisk', 'insufficientData'].forEach(key => {
      const k = key as keyof typeof overall.readingHealth;
      overall.readingHealth[k].percentage = overall.totalStudents > 0 
        ? parseFloat(((overall.readingHealth[k].count / overall.totalStudents) * 100).toFixed(1))
        : 0;
    });
    return overall;
  }, [filteredClassHealthData, selectedView, academicYear]);

  const displayData = selectedView === 'overall' ? overallData : filteredClassHealthData.find(c => c?.classId === selectedView);

  const filteredStudents = useMemo(() => {
    if (!modalData?.students) return [];
    if (!searchQuery.trim()) return modalData.students;
    return modalData.students.filter(student => 
      student?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modalData, searchQuery]);

  const handleViewCategory = (status: string, students: StudentReadingStatus[]) => {
    setModalData({ status, students });
    setSearchQuery('');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Class Reading Health</Text>
          <Text style={styles.subtitle}>Oversight & Monitoring Dashboard</Text>
        </View>
        {academicYear && (
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>SY {academicYear}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Fetching class metrics...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : !filteredClassHealthData.length ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>No data available for this year.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {displayData && (
            <ClassCard
              classItem={displayData}
              isExpanded={expandedClass === displayData.classId}
              onToggle={() => setExpandedClass(expandedClass === displayData.classId ? null : displayData.classId)}
              onViewCategory={handleViewCategory}
            />
          )}
        </ScrollView>
      )}

      {/* Student List Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: modalData ? getStatusColor(modalData.status) : C.ink }]}>
                  {modalData ? getStatusLabel(modalData.status) : 'Students'}
                </Text>
                <Text style={styles.modalSubtitle}>{filteredStudents.length} Students Listed</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Image source={require('../../../../assets/icons/Search-icon.png')} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor={C.slate}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.studentId}
              contentContainerStyle={styles.studentList}
              renderItem={({ item, index }) => (
                <View style={styles.studentCard}>
                  <View style={styles.studentRank}><Text style={styles.rankText}>{index + 1}</Text></View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <Text style={styles.mValue}>{item.averageAccuracy}%</Text>
                        <Text style={styles.mLabel}>Accuracy</Text>
                      </View>
                      <View style={styles.mDivider} />
                      <View style={styles.metricItem}>
                        <Text style={styles.mValue}>{item.averageWPM}</Text>
                        <Text style={styles.mLabel}>Avg WPM</Text>
                      </View>
                      <View style={styles.mDivider} />
                      <View style={styles.metricItem}>
                        <TrendIcon trend={item.trend || 'stable'} />
                        <Text style={styles.mLabel}>Trend</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: sw(16) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sh(20) },
  title: { fontSize: sf(20), fontFamily: 'Nunito-Bold', color: C.ink },
  subtitle: { fontSize: sf(13), fontFamily: 'Nunito-Medium', color: C.slate },
  yearBadge: { backgroundColor: C.primaryPale, paddingHorizontal: sw(12), paddingVertical: sh(6), borderRadius: Radii.pill },
  yearText: { fontSize: sf(12), fontFamily: 'Nunito-Bold' },
  centerBox: { padding: sw(40), alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: sh(12), fontSize: sf(14), fontFamily: 'Nunito-Medium', color: C.slate },
  errorText: { fontSize: sf(14), fontFamily: 'Nunito-Bold', color: C.atRisk, textAlign: 'center' },
  emptyText: { fontSize: sf(14), fontFamily: 'Nunito-Medium', color: C.slate },
  content: { flex: 1 },
  classCard: { backgroundColor: C.white, borderRadius: Radii.lg, padding: sw(16), marginBottom: sh(16), ...Shadows.card },
  classHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sh(16) },
  classHeaderLeft: { flex: 1 },
  className: { fontSize: sf(18), fontFamily: 'Nunito-Bold', color: C.ink, marginBottom: sh(6) },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { alignItems: 'flex-start' },
  metaLabel: { fontSize: sf(10), fontFamily: 'Nunito-Medium', color: C.slate, marginBottom: sh(2) },
  metaValue: { fontSize: sf(14), fontFamily: 'Nunito-Bold', color: C.ink },
  metaDivider: { width: 1, height: sh(20), backgroundColor: '#EEE', marginHorizontal: sw(15) },
  expandBtn: { width: sw(32), height: sw(32), alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA', borderRadius: Radii.sm },
  expandIcon: { fontSize: sf(12), color: C.primary },
  actionBanner: { backgroundColor: C.atRiskBg, padding: sw(12), borderRadius: Radii.md, marginBottom: sh(16), borderWidth: 1, borderColor: '#FECACA' },
  actionTitle: { fontSize: sf(12), fontFamily: 'Nunito-Bold', color: C.atRisk, marginBottom: sh(4) },
  actionText: { fontSize: sf(13), fontFamily: 'Nunito-Medium', color: '#8B3A3A' },
  statusSection: { marginBottom: sh(16) },
  statusHeader: { marginBottom: sh(12) },
  statusTitle: { fontSize: sf(14), fontFamily: 'Nunito-Bold', color: C.ink },
  statusSubtitle: { fontSize: sf(11), fontFamily: 'Nunito-Medium', color: C.slate },
  statusBarContainer: { flexDirection: 'row', height: sh(12), borderRadius: Radii.pill, overflow: 'hidden', marginBottom: sh(12), backgroundColor: '#F3F4F6' },
  statusSegment: { height: '100%' },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sw(8) },
  legendItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', paddingHorizontal: sw(8), paddingVertical: sh(4), borderRadius: Radii.sm, minWidth: '48%' },
  legendDot: { width: sw(8), height: sw(8), borderRadius: sw(4), marginRight: sw(6) },
  legendLabel: { fontSize: sf(11), fontFamily: 'Nunito-Medium', color: C.inkLight, flex: 1 },
  legendPct: { fontSize: sf(11), fontFamily: 'Nunito-Bold', color: C.ink },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: sh(12), borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  updatedText: { fontSize: sf(10), fontFamily: 'Nunito-Medium', color: C.slate },
  confidenceBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sw(8), paddingVertical: sh(4), borderRadius: Radii.pill },
  confidenceDot: { width: sw(6), height: sw(6), borderRadius: sw(3), marginRight: sw(6) },
  confidenceText: { fontSize: sf(9), fontFamily: 'Nunito-Bold' },
  expandedContent: { marginTop: sh(16), paddingTop: sh(16), borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  expandedTitle: { fontSize: sf(15), fontFamily: 'Nunito-Bold', color: C.ink, marginBottom: sh(12) },
  categoryGrid: { gap: sh(10) },
  categoryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: sw(12), backgroundColor: '#FDFDFD', borderRadius: Radii.md, borderWidth: 1, borderColor: '#F3F4F6', ...Shadows.subtle },
  categoryInfo: { flex: 1 },
  categoryLabel: { fontSize: sf(12), fontFamily: 'Nunito-Bold', marginBottom: sh(2) },
  categoryCount: { fontSize: sf(22), fontFamily: 'Nunito-Bold', color: C.ink },
  categoryRight: { alignItems: 'flex-end' },
  categoryPct: { fontSize: sf(14), fontFamily: 'Nunito-Bold', color: C.slate, marginBottom: sh(4) },
  viewBadge: { backgroundColor: C.primaryLight, paddingHorizontal: sw(8), paddingVertical: sh(2), borderRadius: Radii.sm },
  viewBadgeText: { fontSize: sf(10), fontFamily: 'Nunito-Bold', color: C.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: sw(20) },
  modalContent: { backgroundColor: C.white, borderRadius: Radii.lg, maxHeight: '80%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: sw(20), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: sf(18), fontFamily: 'Nunito-Bold' },
  modalSubtitle: { fontSize: sf(12), fontFamily: 'Nunito-Medium', color: C.slate },
  modalCloseBtn: { width: sw(32), height: sw(32), alignItems: 'center', justifyContent: 'center' },
  modalCloseIcon: { fontSize: sf(16), color: C.slate },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: sw(16), paddingHorizontal: sw(12), backgroundColor: '#F3F4F6', borderRadius: Radii.md },
  searchIcon: { width: sw(16), height: sw(16), tintColor: C.slate, marginRight: sw(8) },
  searchInput: { flex: 1, height: sh(44), fontSize: sf(14), fontFamily: 'Nunito-Medium', color: C.ink },
  studentList: { padding: sw(16) },
  studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: Radii.md, padding: sw(12), marginBottom: sh(10), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  studentRank: { width: sw(24), height: sw(24), borderRadius: Radii.sm, backgroundColor: C.primaryPale, alignItems: 'center', justifyContent: 'center', marginRight: sw(12) },
  rankText: { fontSize: sf(11), fontFamily: 'Nunito-Bold', color: C.primary },
  studentInfo: { flex: 1 },
  studentName: { fontSize: sf(14), fontFamily: 'Nunito-Bold', color: C.ink, marginBottom: sh(6) },
  metricsRow: { flexDirection: 'row', alignItems: 'center' },
  metricItem: { alignItems: 'flex-start' },
  mValue: { fontSize: sf(13), fontFamily: 'Nunito-Bold', color: C.ink },
  mLabel: { fontSize: sf(10), fontFamily: 'Nunito-Medium', color: C.slate },
  mDivider: { width: 1, height: sh(14), backgroundColor: '#EEE', marginHorizontal: sw(12) },
});

export default ClassReadingStatus;
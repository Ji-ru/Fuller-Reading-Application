// Components/Faculty/Dashboard/ClassReadingStatus.tsx

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFetchClassReadingHealth } from '../../../Hooks/use_ReadingStudentStats';
import {
  ClassReadingHealth,
  StudentReadingStatus,
} from '../../../Interfaces/miscue';

import { FacultyColors as F, Radii, Shadows } from '../../../Utilities/Theme';

interface Props {
  facultyId: string;
  selectedAcademicYear: string;
  selectedClassId: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  fluent: {
    label: 'Fluent',
    color: '#2CA96A',
    bg: '#E8F5E9',
  },
  developing: {
    label: 'Developing',
    color: '#F9C74F',
    bg: '#FFFDE7',
  },
  emerging: {
    label: 'Emerging',
    color: '#F39C12',
    bg: '#FFF3E0',
  },
  atRisk: {
    label: 'At Risk',
    color: '#EB5C6C',
    bg: '#FFEBEE',
  },
  insufficientData: {
    label: 'Insufficient Data',
    color: '#9CA3AF',
    bg: '#F3F4F6',
  },
};

const CONFIDENCE_MAP: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  high: {
    color: '#2CA96A',
    bg: '#E8F5E9',
    label: 'High Confidence',
  },
  medium: {
    color: '#F39C12',
    bg: '#FFF3E0',
    label: 'Medium Confidence',
  },
  low: {
    color: '#EB5C6C',
    bg: '#FFEBEE',
    label: 'Low Confidence',
  },
};

const getColor = (key: string) =>
  STATUS_CONFIG[key]?.color || '#94A3B8';

const getLabel = (key: string) =>
  STATUS_CONFIG[key]?.label || key;

const HealthBar = ({
  health,
}: {
  health: ClassReadingHealth['readingHealth'];
}) => {
  if (!health) return null;

  const order = [
    'fluent',
    'developing',
    'emerging',
    'atRisk',
    'insufficientData',
  ];

  return (
    <View style={styles.bar}>
      {order.map(key => {
        const pct =
          health[key as keyof typeof health]?.percentage || 0;

        if (pct === 0) return null;

        return (
          <View
            key={key}
            style={[
              styles.barSegment,
              {
                width: `${pct}%`,
                backgroundColor: getColor(key),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const StatTile = ({
  statusKey,
  count,
  percentage,
  onPress,
  disabled,
}: {
  statusKey: string;
  count: number;
  percentage: number;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const cfg = STATUS_CONFIG[statusKey];

  return (
    <TouchableOpacity
      style={[styles.tile, disabled && styles.tileDisabled]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.tileIndicator,
          { backgroundColor: cfg.color },
        ]}
      />

      <Text style={styles.tileLabel}>{cfg.label}</Text>

      <View style={styles.tileValueRow}>
        <Text style={styles.tileCount}>{count}</Text>
        <Text style={styles.tilePercent}>
          {percentage.toFixed(0)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const AtRiskHighlight = ({
  count,
  percentage,
  onPress,
}: {
  count: number;
  percentage: number;
  onPress: () => void;
}) => {
  if (count === 0) {
    return (
      <View
        style={[
          styles.focusBanner,
          styles.focusBannerSafe,
        ]}
      >
        <View style={styles.focusContent}>
          <Text style={styles.focusLabelSafe}>
            All Clear
          </Text>

          <Text style={styles.focusSubtextSafe}>
            No students are currently at risk
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.focusBanner}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.focusContent}>
        <Text style={styles.focusLabel}>
          Needs Your Attention
        </Text>

        <View style={styles.focusValueRow}>
          <Text style={styles.focusValue}>{count}</Text>

          <Text style={styles.focusValueUnit}>
            student{count !== 1 ? 's' : ''} at risk
          </Text>
        </View>

        <Text style={styles.focusSubtext}>
          {percentage.toFixed(0)}% of class — Tap to review
        </Text>
      </View>

      <View style={styles.focusArrow}>
        <Text style={styles.focusArrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const ClassCard = ({
  classItem,
  onViewCategory,
}: {
  classItem: ClassReadingHealth;
  onViewCategory: (
    status: string,
    students: StudentReadingStatus[],
  ) => void;
}) => {
  const rate = classItem.participationRate || 0;

  const rateColor =
    rate >= 80
      ? '#2CA96A'
      : rate >= 60
        ? '#F9C74F'
        : '#EB5C6C';

  const confidenceKey =
    classItem.dataQuality?.confidence || 'low';

  const conf =
    CONFIDENCE_MAP[confidenceKey] ||
    CONFIDENCE_MAP.low;

  const atRisk = classItem.readingHealth?.atRisk;

  const tileOrder: Array<
    keyof typeof classItem.readingHealth
  > = ['fluent', 'developing', 'emerging', 'atRisk'];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {classItem.className}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {classItem.totalStudents} students
          </Text>

          <View style={styles.metaDot} />

          <Text
            style={[
              styles.metaText,
              {
                color: rateColor,
                fontWeight: '800',
              },
            ]}
          >
            {rate.toFixed(0)}% participation
          </Text>
        </View>
      </View>

      <AtRiskHighlight
        count={atRisk?.count || 0}
        percentage={atRisk?.percentage || 0}
        onPress={() =>
          onViewCategory(
            'atRisk',
            atRisk?.students || [],
          )
        }
      />

      <View style={styles.healthSection}>
        <Text style={styles.sectionMini}>
          Class Health
        </Text>

        <HealthBar
          health={classItem.readingHealth}
        />
      </View>

      <View style={styles.gridContainer}>
        {tileOrder.map(key => {
          const data = classItem.readingHealth?.[key];

          return (
            <StatTile
              key={key}
              statusKey={key}
              count={data?.count || 0}
              percentage={data?.percentage || 0}
              disabled={(data?.count || 0) === 0}
              onPress={() =>
                onViewCategory(
                  key,
                  data?.students || [],
                )
              }
            />
          );
        })}
      </View>

      {classItem.readingHealth?.insufficientData
        ?.count > 0 && (
          <TouchableOpacity
            style={styles.insufficientRow}
            activeOpacity={0.7}
            onPress={() =>
              onViewCategory(
                'insufficientData',
                classItem.readingHealth
                  ?.insufficientData?.students || [],
              )
            }
          >
            <View style={styles.insufficientIcon}>
              <Text
                style={styles.insufficientIconText}
              >
                ?
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.insufficientLabel}>
                Insufficient Data
              </Text>

              <Text
                style={styles.insufficientSubtext}
              >
                {
                  classItem.readingHealth
                    ?.insufficientData?.count
                }{' '}
                students need more reading sessions
              </Text>
            </View>

            <Text style={styles.insufficientArrow}>
              ›
            </Text>
          </TouchableOpacity>
        )}

      {classItem.requiredActions ? (
        <View style={styles.alertBanner}>
          <View style={styles.alertIndicator} />

          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>
              Action Required
            </Text>

            <Text style={styles.alertText}>
              {classItem.requiredActions}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View
          style={[
            styles.confBadge,
            { backgroundColor: conf.bg },
          ]}
        >
          <View
            style={[
              styles.confDot,
              { backgroundColor: conf.color },
            ]}
          />

          <Text
            style={[
              styles.confText,
              { color: conf.color },
            ]}
          >
            {conf.label}
          </Text>
        </View>

        <Text style={styles.updatedText}>
          Updated{' '}
          {classItem.lastUpdated
            ? new Date(
              classItem.lastUpdated,
            ).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
            : 'N/A'}
        </Text>
      </View>
    </View>
  );
};

const ClassReadingStatus: React.FC<Props> = ({
  facultyId,
  selectedAcademicYear,
  selectedClassId,
}) => {
  const [modalVisible, setModalVisible] =
    useState(false);

  const [modalData, setModalData] = useState<{
    status: string;
    students: StudentReadingStatus[];
  } | null>(null);

  const [searchQuery, setSearchQuery] =
    useState('');

  const {
    loading,
    classHealthData,
    error,
  } = useFetchClassReadingHealth(facultyId);

  const filteredData = useMemo(() => {
    if (!classHealthData) return [];

    let data = selectedAcademicYear
      ? classHealthData.filter(
        item =>
          item?.acadYear ===
          selectedAcademicYear,
      )
      : classHealthData;

    if (selectedClassId) {
      data = data.filter(
        item => item.classId === selectedClassId,
      );
    }

    return data;
  }, [
    classHealthData,
    selectedAcademicYear,
    selectedClassId,
  ]);

  const displayData = filteredData[0];

  const filteredStudents = useMemo(() => {
    if (!modalData?.students) return [];

    const q = searchQuery
      .trim()
      .toLowerCase();

    return q
      ? modalData.students.filter(s =>
        s?.name
          ?.toLowerCase()
          .includes(q),
      )
      : modalData.students;
  }, [modalData, searchQuery]);

  const openModal = (
    status: string,
    students: StudentReadingStatus[],
  ) => {
    if (students.length === 0) return;

    setModalData({
      status,
      students,
    });

    setSearchQuery('');
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator
          size="large"
          color={F.primary}
        />

        <Text style={styles.centerText}>
          Loading class data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text
          style={[
            styles.centerText,
            { color: '#EB5C6C' },
          ]}
        >
          {error}
        </Text>
      </View>
    );
  }

  if (!displayData) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.centerText}>
          No class data available.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <ClassCard
        classItem={displayData}
        onViewCategory={openModal}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View
                style={styles.modalHeaderLeft}
              >
                <View
                  style={[
                    styles.modalStatusDot,
                    {
                      backgroundColor: getColor(
                        modalData?.status || '',
                      ),
                    },
                  ]}
                />

                <View>
                  <Text style={styles.modalTitle}>
                    {getLabel(
                      modalData?.status || '',
                    )}
                  </Text>

                  <Text style={styles.modalSub}>
                    {
                      filteredStudents.length
                    }{' '}
                    students
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() =>
                  setModalVisible(false)
                }
              >
                <Text
                  style={styles.closeBtnText}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
              <Image
                source={require('../../../../assets/icons/Search-icon.png')}
                style={styles.searchIcon}
              />

              <TextInput
                style={styles.searchInput}
                placeholder="Search student..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={F.slate}
              />
            </View>

            <FlatList
              data={filteredStudents}
              keyExtractor={item =>
                item.studentId
              }
              contentContainerStyle={{
                paddingHorizontal: 14,
                paddingBottom: 20,
              }}
              renderItem={({
                item,
                index,
              }) => {
                const trendColor =
                  item.trend ===
                    'improving'
                    ? '#2CA96A'
                    : item.trend ===
                      'declining'
                      ? '#EB5C6C'
                      : F.slate;

                const trendSymbol =
                  item.trend ===
                    'improving'
                    ? '↑'
                    : item.trend ===
                      'declining'
                      ? '↓'
                      : '→';

                return (
                  <View
                    style={styles.studentRow}
                  >
                    <View
                      style={styles.rankBubble}
                    >
                      <Text
                        style={
                          styles.rankText
                        }
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={
                          styles.studentName
                        }
                      >
                        {item.name}
                      </Text>

                      <View
                        style={
                          styles.studentStats
                        }
                      >
                        <View>
                          <Text
                            style={
                              styles.statValue
                            }
                          >
                            {
                              item.averageAccuracy
                            }
                            %
                          </Text>

                          <Text
                            style={
                              styles.statLabel
                            }
                          >
                            Accuracy
                          </Text>
                        </View>

                        <View>
                          <Text
                            style={
                              styles.statValue
                            }
                          >
                            {
                              item.averageWPM
                            }
                          </Text>

                          <Text
                            style={
                              styles.statLabel
                            }
                          >
                            WPM
                          </Text>
                        </View>

                        <View>
                          <Text
                            style={[
                              styles.statValue,
                              {
                                color:
                                  trendColor,
                              },
                            ]}
                          >
                            {
                              trendSymbol
                            }
                          </Text>

                          <Text
                            style={
                              styles.statLabel
                            }
                          >
                            {item.trend ||
                              'stable'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  centerText: {
    marginTop: 10,
    fontSize: 13,
    color: F.slate,
    fontWeight: '600',
  },

  card: {
    backgroundColor: F.white,
    borderRadius: 20,
    padding: 18,
    ...Shadows.card,
  },

  cardHeader: {
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: F.ink,
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontSize: 12,
    color: F.slate,
    fontWeight: '600',
  },

  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: F.slate,
    marginHorizontal: 8,
  },

  focusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EB5C6C',
  },

  focusBannerSafe: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#2CA96A',
  },

  focusContent: {
    flex: 1,
  },

  focusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EB5C6C',
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  focusLabelSafe: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2CA96A',
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  focusValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 2,
  },

  focusValue: {
    fontSize: 30,
    fontWeight: '900',
    color: F.ink,
    marginRight: 6,
  },

  focusValueUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: F.ink,
    marginBottom: 4,
  },

  focusSubtext: {
    fontSize: 11,
    color: F.slate,
    fontWeight: '600',
  },

  focusSubtextSafe: {
    fontSize: 13,
    color: F.ink,
    fontWeight: '600',
  },

  focusArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: F.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  focusArrowText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EB5C6C',
  },

  healthSection: {
    marginBottom: 14,
  },

  sectionMini: {
    fontSize: 11,
    fontWeight: '800',
    color: F.slate,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  bar: {
    flexDirection: 'row',
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },

  barSegment: {
    height: '100%',
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  tile: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  tileDisabled: {
    opacity: 0.5,
  },

  tileIndicator: {
    width: 26,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },

  tileLabel: {
    fontSize: 11,
    color: F.slate,
    fontWeight: '700',
    marginBottom: 6,
  },

  tileValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  tileCount: {
    fontSize: 24,
    fontWeight: '900',
    color: F.ink,
  },

  tilePercent: {
    fontSize: 11,
    fontWeight: '800',
    color: F.slate,
  },

  insufficientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  insufficientIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: F.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  insufficientIconText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#9CA3AF',
  },

  insufficientLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: F.ink,
  },

  insufficientSubtext: {
    fontSize: 11,
    color: F.slate,
    fontWeight: '600',
    marginTop: 2,
  },

  insufficientArrow: {
    fontSize: 22,
    fontWeight: '800',
    color: F.slate,
  },

  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  alertIndicator: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#F39C12',
    marginRight: 10,
  },

  alertTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F39C12',
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  alertText: {
    fontSize: 12,
    color: F.ink,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  confBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  confDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  confText: {
    fontSize: 10,
    fontWeight: '800',
  },

  updatedText: {
    fontSize: 11,
    color: F.slate,
    fontWeight: '600',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: F.white,
    borderRadius: 22,
    maxHeight: '80%',
    overflow: 'hidden',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: F.ink,
  },

  modalSub: {
    fontSize: 11,
    color: F.slate,
    fontWeight: '600',
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: F.slate,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  searchIcon: {
    width: 15,
    height: 15,
    tintColor: F.slate,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: 42,
    color: F.ink,
    fontSize: 13,
    fontWeight: '600',
  },

  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  rankBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: F.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  rankText: {
    fontSize: 11,
    fontWeight: '900',
    color: F.primary,
  },

  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: F.ink,
    marginBottom: 6,
  },

  studentStats: {
    flexDirection: 'row',
    gap: 18,
  },

  statValue: {
    fontSize: 13,
    fontWeight: '900',
    color: F.ink,
  },

  statLabel: {
    fontSize: 10,
    color: F.slate,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'capitalize',
  },
});

export default ClassReadingStatus;

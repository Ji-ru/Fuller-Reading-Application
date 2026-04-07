// Components/Faculty/ClassReadingStatus.tsx
import React, { useState, useMemo } from 'react';
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
  Image
} from 'react-native';
import { useFetchClassReadingHealth } from '../../../Hooks/use_ReadingStudentStats';
import { ClassReadingHealth, StudentReadingStatus } from '../../../Interfaces/miscue';
import { sw, sh, sf } from '../../../Utils/responsive';

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

type StatusType = 'fluent' | 'developing' | 'emerging' | 'atRisk' | 'insufficientData';

const TrendIcon = ({ trend }: { trend: 'improving' | 'stable' | 'declining' }) => {
  switch (trend) {
    case 'improving': return <Text style={{ color: '#4CAF50' }}>▲</Text>;
    case 'declining': return <Text style={{ color: '#F44336' }}>▼</Text>;
    default: return <Text style={{ color: '#9E9E9E' }}>▶</Text>;
  }
};

const ConfidenceBadge = ({ confidence }: { confidence: 'high' | 'medium' | 'low' }) => {
  const getConfig = () => {
    switch (confidence) {
      case 'high': return { color: '#4CAF50', bg: '#E8F5E9', label: 'HIGH' };
      case 'medium': return { color: '#FF9800', bg: '#FFF3E0', label: 'MED' };
      case 'low': return { color: '#F44336', bg: '#FFEBEE', label: 'LOW' };
      default: return { color: '#9E9E9E', bg: '#F5F5F5', label: 'N/A' };
    }
  };
  const config = getConfig();
  return (
    <View style={[styles.confidenceBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.confidenceText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const ClassReadingStatus: React.FC<Props> = ({ facultyId, filter }) => {
  // All hooks at the top level, unconditionally
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{ status: StatusType; students: StudentReadingStatus[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { academicYear, selectedView } = filter;
  
  // Always call the hook
  const { loading, classHealthData, error } = useFetchClassReadingHealth(facultyId);

  const getStatusColor = (status: StatusType): string => {
    switch (status) {
      case 'fluent': return '#4CAF50';
      case 'developing': return '#FFC107';
      case 'emerging': return '#FF9800';
      case 'atRisk': return '#F44336';
      case 'insufficientData': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: StatusType): string => {
    if (status === 'insufficientData') return 'Insufficient Data';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Memoized values
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
      (Object.keys(overall.readingHealth) as StatusType[]).forEach(key => {
        if (classItem.readingHealth?.[key]) {
          overall.readingHealth[key].count += classItem.readingHealth[key].count || 0;
          overall.readingHealth[key].students.push(...(classItem.readingHealth[key].students || []));
        }
      });
    });

    (Object.keys(overall.readingHealth) as StatusType[]).forEach(key => {
      overall.readingHealth[key].percentage = overall.totalStudents > 0 
        ? parseFloat(((overall.readingHealth[key].count / overall.totalStudents) * 100).toFixed(1))
        : 0;
    });

    return overall;
  }, [filteredClassHealthData, selectedView, academicYear]);

  const selectedClass = useMemo(() => {
    if (selectedView === 'overall' || !selectedView) return null;
    return filteredClassHealthData.find(c => c?.classId === selectedView) || null;
  }, [filteredClassHealthData, selectedView]);

  const displayData = useMemo(() => {
    if (selectedView === 'overall') return overallData;
    return selectedClass;
  }, [selectedView, overallData, selectedClass]);

  const filteredStudents = useMemo(() => {
    if (!modalData?.students) return [];
    if (!searchQuery.trim()) return modalData.students;
    
    return modalData.students.filter(student => 
      student?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modalData, searchQuery]);

  const renderStatusBar = (health: ClassReadingHealth['readingHealth']) => {
    if (!health) return null;
    
    const statuses: Array<{ key: StatusType }> = [
      { key: 'fluent' }, { key: 'developing' }, { key: 'emerging' }, { key: 'atRisk' }
    ];

    return (
      <View style={styles.statusBarContainer}>
        {statuses.map(status => {
          const percentage = health[status.key]?.percentage ?? 0;
          return (
            <View
              key={status.key}
              style={[
                styles.statusSegment,
                {
                  width: `${percentage}%`,
                  backgroundColor: getStatusColor(status.key),
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderClassCard = (classItem: ClassReadingHealth | null) => {
    if (!classItem) return null;
    
    const participationRate = classItem.participationRate || 0;
    const participationColor = participationRate >= 80 ? '#4CAF50' : participationRate >= 60 ? '#FFC107' : '#F44336';
    
    return (
      <View key={classItem.classId} style={styles.classCard}>
        <TouchableOpacity
          style={styles.classHeader}
          onPress={() => setExpandedClass(expandedClass === classItem.classId ? null : classItem.classId)}
          activeOpacity={0.8}
        >
          <View style={styles.classHeaderLeft}>
            <Text style={styles.className}>{classItem.className || 'Unknown Class'}</Text>
            <View style={styles.classMetaRow}>
              <Text style={styles.classStats}>
                {classItem.totalStudents || 0} students
              </Text>
              <View style={[styles.participationBadge, { backgroundColor: `${participationColor}20` }]}>
                <Text style={[styles.participationText, { color: participationColor }]}>
                  {participationRate.toFixed(0)}% Participation
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.expandIcon}>
            {expandedClass === classItem.classId ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {classItem.requiredActions && (
          <View style={styles.actionBanner}>
            <Text style={styles.actionLabel}>⚠️ ACTION REQUIRED</Text>
            <Text style={styles.actionText}>{classItem.requiredActions}</Text>
          </View>
        )}

        {renderStatusBar(classItem.readingHealth)}

        <View style={styles.percentagesContainer}>
          {Object.entries(classItem.readingHealth || {})
            .filter(([key]) => key !== 'insufficientData')
            .map(([key, value]) => {
              if (!value) return null;
              return (
                <View key={key} style={styles.percentageItem}>
                  <View style={styles.statusLegendsContainer}>
                    <View style={styles.statusLegends}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(key as StatusType) },
                        ]}
                      />
                      <Text style={styles.statusLabel}>
                        {getStatusLabel(key as StatusType)}
                      </Text>
                    </View>
                    <View style={styles.statusLegends2}>
                      <Text style={styles.percentageValue}>{value.percentage || 0}%</Text>
                      <Text style={styles.countValue}>({value.count || 0})</Text>
                    </View>
                  </View>
                </View>
              );
            })}
        </View>

        <View style={styles.dataQualityRow}>
          <ConfidenceBadge confidence={classItem.dataQuality?.confidence || 'low'} />
          <Text style={styles.lastUpdated}>
            Updated: {classItem.lastUpdated ? new Date(classItem.lastUpdated).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        {expandedClass === classItem.classId && (
          <View style={styles.expandedDetails}>
            <Text style={styles.expandedSectionTitle}>Student Categories</Text>
            
            <View style={styles.categoriesGrid}>
              {(['atRisk', 'emerging', 'developing', 'fluent', 'insufficientData'] as StatusType[]).map(key => {
                const data = classItem.readingHealth?.[key];
                if (!data || data.count === 0) return null;
                
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.categoryCard, { borderLeftColor: getStatusColor(key) }]}
                    onPress={() => {
                      setModalData({ 
                        status: key, 
                        students: data.students || [] 
                      });
                      setSearchQuery('');
                      setModalVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryHeader}>
                      <View style={[styles.categoryDot, { backgroundColor: getStatusColor(key) }]} />
                      <Text style={[styles.categoryTitle, { color: getStatusColor(key) }]}>
                        {getStatusLabel(key)}
                      </Text>
                    </View>
                    
                    <View style={styles.categoryStats}>
                      <Text style={styles.categoryCount}>{data.count || 0}</Text>
                      <Text style={styles.categoryPercentage}>{data.percentage || 0}%</Text>
                    </View>
                    
                    <View style={styles.viewAllRow}>
                      <Text style={styles.viewAllCategoryText}>View Students</Text>
                      <Text style={styles.viewAllCategoryIcon}>→</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading reading health data...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Text style={styles.errorSubtext}>
            Please check your connection and try again
          </Text>
        </View>
      );
    }

    if (!filteredClassHealthData || filteredClassHealthData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No reading health data available
          </Text>
          <Text style={styles.noDataSubtext}>
            {academicYear
              ? `No classes found for academic year ${academicYear}`
              : 'Students need to complete reading assessments first'}
          </Text>
        </View>
      );
    }

    return displayData ? (
      <ScrollView 
        style={styles.classesContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderClassCard(displayData)}
      </ScrollView>
    ) : null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Reading Status</Text>
        <Text style={styles.subtitle}>Status Distribution by Class</Text>
      </View>

      {academicYear && filteredClassHealthData.length > 0 && (
        <View style={styles.filterStatusContainer}>
          <Text style={styles.filterStatusText}>
            Showing{' '}
            <Text style={styles.filterStatusYear}>{academicYear}</Text> •{' '}
            {selectedView === 'overall' 
              ? 'Overall Health' 
              : selectedClass?.className || 'Class Data'
            }
          </Text>
        </View>
      )}

      {renderContent()}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: modalData
                        ? getStatusColor(modalData.status)
                        : '#2C3E50',
                    },
                  ]}
                >
                  {modalData ? getStatusLabel(modalData.status) : 'Students'}
                </Text>
                <Text style={styles.modalStudentCount}>
                  {filteredStudents.length} of {modalData?.students?.length || 0} student
                  {modalData?.students?.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchIconContainer}>
                <Image 
                style={styles.searchIcon}
                source={require('../../../../assets/icons/Search-icon.png')}/>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search students by name..."
                placeholderTextColor="#95A5A6"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item?.studentId || Math.random().toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptySearchContainer}>
                  <Text style={styles.emptySearchText}>No students found</Text>
                  <Text style={styles.emptySearchSubtext}>
                    Try adjusting your search criteria
                  </Text>
                </View>
              }
              renderItem={({ item, index }) => {
                if (!item) return null;
                return (
                  <View style={styles.modalStudentItem}>
                    <Text style={styles.modalStudentNumber}>{index + 1}.</Text>
                    <View style={styles.modalStudentInfo}>
                      <Text style={styles.modalStudentName}>{item.name || 'Unknown Student'}</Text>
                      <View style={styles.modalMetricsGrid}>
                        <View style={styles.modalMetric}>
                          <Text style={styles.modalMetricLabel}>Average Accuracy</Text>
                          <Text style={styles.modalMetricValue}>{item.averageAccuracy || 0}%</Text>
                        </View>
                        <View style={styles.modalMetric}>
                          <Text style={styles.modalMetricLabel}>Average WPM</Text>
                          <Text style={styles.modalMetricValue}>{item.averageWPM || 0}</Text>
                        </View>
                        <View style={styles.modalMetric}>
                          <Text style={styles.modalMetricLabel}>Miscue Density</Text>
                          <Text style={styles.modalMetricValue}>{item.miscueDensity || 0}%</Text>
                        </View>
                      </View>
                      <View style={styles.modalFooter}>
                        <View style={styles.modalTrend}>
                          <TrendIcon trend={item.trend || 'stable'} />
                          <Text style={styles.modalTrendText}>{item.trend || 'stable'}</Text>
                        </View>
                        <ConfidenceBadge confidence={item.confidence || 'low'} />
                      </View>
                    </View>
                  </View>
                );
              }}
              style={styles.modalStudentList}
              contentContainerStyle={styles.modalStudentListContent}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: sw(15),
    padding: sw(20),
    elevation: 3,
    marginBottom: sh(20),
  },
  header: {
    marginBottom: sh(16),
  },
  title: {
    fontSize: sf(20),
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
    marginBottom: sh(4),
  },
  subtitle: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  filterStatusContainer: {
    backgroundColor: '#E8F5F5',
    borderRadius: sw(8),
    paddingVertical: sh(8),
    paddingHorizontal: sw(12),
    marginBottom: sh(16),
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  filterStatusText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: '#2C3E50',
  },
  filterStatusYear: {
    fontFamily: 'Satoshi-Bold',
    color: '#4ECDC4',
  },
  loadingContainer: {
    padding: sw(40),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: sh(10),
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  errorContainer: {
    padding: sw(40),
    alignItems: 'center',
  },
  errorText: {
    fontSize: sf(16),
    color: '#F44336',
    marginBottom: sh(8),
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: sf(14),
    color: '#BDC3C7',
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },
  noDataContainer: {
    padding: sw(40),
    alignItems: 'center',
  },
  noDataText: {
    fontSize: sf(16),
    color: '#7F8C8D',
    fontFamily: 'Satoshi-Medium',
    marginBottom: sh(8),
  },
  noDataSubtext: {
    fontSize: sf(14),
    color: '#BDC3C7',
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },
  classesContainer: {
    maxHeight: sw(500),
  },
  classCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: sw(12),
    padding: sw(16),
    marginBottom: sh(10),
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sh(12),
  },
  classHeaderLeft: {
    flex: 1,
    marginRight: sw(12),
  },
  className: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
    marginBottom: sh(4),
  },
  classMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(8),
  },
  classStats: {
    fontSize: sf(12),
    color: '#7F8C8D',
    fontFamily: 'Satoshi-Medium',
  },
  participationBadge: {
    paddingHorizontal: sw(8),
    paddingVertical: sh(2),
    borderRadius: sw(12),
  },
  participationText: {
    fontSize: sf(10),
    fontFamily: 'Satoshi-Bold',
  },
  expandIcon: {
    fontSize: sf(16),
    color: '#4ECDC4',
    fontFamily: 'Satoshi-Medium',
    fontWeight: 'bold',
  },
  statusBarContainer: {
    flexDirection: 'row',
    height: sw(20),
    borderRadius: sw(10),
    overflow: 'hidden',
    marginBottom: sh(16),
  },
  statusSegment: {
    height: '100%',
  },
  percentagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: sh(12),
  },
  percentageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: sh(8),
  },
  statusLegendsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLegends: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusLegends2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: sw(10),
    height: sw(10),
    borderRadius: sw(5),
    marginRight: sw(8),
  },
  statusLabel: {
    fontSize: sf(12),
    color: '#2C3E50',
    fontFamily: 'Satoshi-Medium',
    marginRight: sw(4),
  },
  percentageValue: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
    marginRight: sw(4),
  },
  countValue: {
    fontSize: sf(10),
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  dataQualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: sh(8),
  },
  lastUpdated: {
    fontSize: sf(11),
    color: '#95A5A6',
    fontFamily: 'Satoshi-Medium',
  },
  confidenceBadge: {
    paddingHorizontal: sw(8),
    paddingVertical: sh(2),
    borderRadius: sw(12),
  },
  confidenceText: {
    fontSize: sf(10),
    fontFamily: 'Satoshi-Bold',
    letterSpacing: sf(0.5),
  },
  actionBanner: {
    backgroundColor: '#FFEBEE',
    padding: sw(12),
    marginBottom: sh(16),
    borderRadius: sw(8),
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  actionLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(11),
    color: '#C62828',
    marginBottom: sh(4),
    letterSpacing: sf(0.5),
  },
  actionText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(13),
    color: '#8B3A3A',
  },
  expandedDetails: {
    marginTop: sh(16),
    paddingTop: sh(16),
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  expandedSectionTitle: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
    marginBottom: sh(16),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: sw(12),
    padding: sw(10),
    marginBottom: sh(12),
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(2),
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(12),
  },
  categoryDot: {
    width: sw(12),
    height: sw(12),
    borderRadius: sw(6),
    marginRight: sw(8),
  },
  categoryTitle: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: sh(12),
  },
  categoryCount: {
    fontSize: sf(24),
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
  },
  categoryPercentage: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  viewAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: sh(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F3F4',
  },
  viewAllCategoryText: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: '#4ECDC4',
  },
  viewAllCategoryIcon: {
    fontSize: sf(14),
    color: '#4ECDC4',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: sw(15),
    padding: sw(20),
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sh(16),
  },
  modalTitle: {
    fontSize: sf(20),
    fontFamily: 'Satoshi-Bold',
    marginBottom: sh(4),
  },
  modalStudentCount: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  closeButton: {
    width: sw(30),
    height: sw(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: sf(24),
    fontFamily: 'Satoshi-Bold',
    color: '#7F8C8D',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: sw(10),
    marginBottom: sh(16),
    paddingHorizontal: sw(12),
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIconContainer: {
    marginRight: sw(8),
  },
  searchIcon: {
    width: sw(16),
    height: sw(16),
  },
  searchInput: {
    flex: 1,
    height: sw(44),
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(14),
    color: '#2C3E50',
    paddingVertical: sh(8),
  },
  clearButton: {
    padding: sw(8),
  },
  clearButtonText: {
    fontSize: sf(16),
    color: '#95A5A6',
    fontFamily: 'Satoshi-Medium',
  },
  emptySearchContainer: {
    padding: sw(32),
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
    color: '#2C3E50',
    marginBottom: sh(8),
  },
  emptySearchSubtext: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#95A5A6',
  },
  modalStudentList: {
    maxHeight: sw(400),
  },
  modalStudentListContent: {
    paddingBottom: sh(10),
  },
  modalStudentItem: {
    flexDirection: 'row',
    paddingVertical: sh(12),
    paddingHorizontal: sw(5),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  modalStudentNumber: {
    fontSize: sf(14),
    color: '#7F8C8D',
    marginRight: sw(10),
    fontFamily: 'Satoshi-Medium',
    width: sw(30),
  },
  modalStudentInfo: {
    flex: 1,
  },
  modalStudentName: {
    fontSize: sf(15),
    color: '#2C3E50',
    fontFamily: 'Satoshi-Bold',
    marginBottom: sh(8),
  },
  modalMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(8),
  },
  modalMetric: {
    alignItems: 'center',
    flex: 1,
  },
  modalMetricLabel: {
    fontSize: sf(10),
    color: '#7F8C8D',
    fontFamily: 'Satoshi-Medium',
    marginBottom: sh(2),
  },
  modalMetricValue: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(4),
  },
  modalTrendText: {
    fontSize: sf(12),
    color: '#7F8C8D',
    fontFamily: 'Satoshi-Medium',
    textTransform: 'capitalize',
  },
  modalCloseButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: sw(10),
    padding: sw(12),
    alignItems: 'center',
    marginTop: sh(15),
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
  },
});

export default ClassReadingStatus;
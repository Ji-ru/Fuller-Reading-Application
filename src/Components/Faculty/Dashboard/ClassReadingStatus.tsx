// Components/Faculty/ClassReadingStatus.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useFetchClassReadingHealth } from '../../../Hooks/use_ReadingStudentStats';
import { ClassReadingHealth } from '../../../Interfaces/miscue';
import { getAcademicYearOptions } from '../../../Utilities/acadYearUtils';

interface Props {
  facultyId?: string;
}

type StatusType = 'fluent' | 'developing' | 'emerging' | 'atRisk';

interface StudentModalData {
  status: StatusType;
  students: string[];
  statusLabel: string;
}

const ClassReadingStatus: React.FC<Props> = ({ facultyId = null }) => {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<string>('overall');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<StudentModalData | null>(null);
  const [academicYear, setAcademicYear] = useState<string>('');
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Fetch data using the hook
  const { loading, classHealthData, error } =
    useFetchClassReadingHealth(facultyId);

  const toggleExpand = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  // Get unique academic years from the data
  useEffect(() => {
    if (classHealthData.length > 0) {
      const years = Array.from(
        new Set(classHealthData.map(item => item.acadYear).filter(Boolean)),
      );
      setAcademicYears(years);

      if (years.length > 0 && !academicYear) {
        setAcademicYear(years[0]);
      }
    } else {
      const defaultYears = getAcademicYearOptions();
      setAcademicYears(defaultYears);
      if (defaultYears.length > 0 && !academicYear) {
        setAcademicYear(defaultYears[0]);
      }
    }
  }, [classHealthData]);

  // Filter data by academic year
  const filteredClassHealthData = academicYear
    ? classHealthData.filter(item => item.acadYear === academicYear)
    : classHealthData;

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'fluent':
        return '#4CAF50';
      case 'developing':
        return '#FFC107';
      case 'emerging':
        return '#FF9800';
      case 'atRisk':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: StatusType) => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).replace(/([A-Z])/g, ' $1')
    );
  };

  const openStudentModal = (status: StatusType, students: string[]) => {
    setModalData({
      status,
      students,
      statusLabel: getStatusLabel(status),
    });
    setModalVisible(true);
  };

  const closeStudentModal = () => {
    setModalVisible(false);
    setModalData(null);
  };

  // Calculate overall reading health from all classes
  const getOverallReadingHealth = (): ClassReadingHealth | null => {
    if (filteredClassHealthData.length === 0) return null;

    const overall: ClassReadingHealth = {
      classId: 'overall',
      className: `Overall Reading Health`,
      acadYear: academicYear || 'All Years',
      totalStudents: 0,
      lastUpdated: new Date(),
      readingHealth: {
        fluent: { count: 0, percentage: 0, students: [] },
        developing: { count: 0, percentage: 0, students: [] },
        emerging: { count: 0, percentage: 0, students: [] },
        atRisk: { count: 0, percentage: 0, students: [] },
      },
    };

    filteredClassHealthData.forEach(classItem => {
      overall.totalStudents += classItem.totalStudents;
      Object.keys(overall.readingHealth).forEach(key => {
        const statusKey = key as StatusType;
        overall.readingHealth[statusKey].count +=
          classItem.readingHealth[statusKey].count;
        overall.readingHealth[statusKey].students.push(
          ...classItem.readingHealth[statusKey].students,
        );
      });
    });

    Object.keys(overall.readingHealth).forEach(key => {
      const statusKey = key as StatusType;
      overall.readingHealth[statusKey].percentage = parseFloat(
        (
          (overall.readingHealth[statusKey].count / overall.totalStudents) *
          100
        ).toFixed(1),
      );
    });

    return overall;
  };

  const handleAcademicYearSelect = (year: string) => {
    setAcademicYear(year);
    setShowYearDropdown(false);
    setSelectedView('overall');
    setExpandedClass(null);
  };

  const renderStatusBar = (health: ClassReadingHealth['readingHealth']) => {
    const statuses: Array<{ key: StatusType; label: string }> = [
      { key: 'fluent', label: 'Fluent' },
      { key: 'developing', label: 'Developing' },
      { key: 'emerging', label: 'Emerging' },
      { key: 'atRisk', label: 'At Risk' },
    ];

    return (
      <View style={styles.statusBarContainer}>
        {statuses.map(status => (
          <View
            key={status.key}
            style={[
              styles.statusSegment,
              {
                width: `${health[status.key].percentage}%`,
                backgroundColor: getStatusColor(status.key),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderClassCard = (classItem: ClassReadingHealth) => (
    <TouchableOpacity
      key={classItem.classId}
      style={styles.classCard}
      onPress={() => toggleExpand(classItem.classId)}
      activeOpacity={0.8}
    >
      <View style={styles.classHeader}>
        <View style={styles.classHeaderLeft}>
          <Text style={styles.className}>{classItem.className}</Text>
          <Text style={styles.classStats}>
            {classItem.totalStudents} students • Updated{' '}
            {classItem.lastUpdated.toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.expandIcon}>
          {expandedClass === classItem.classId ? '▲' : '▼'}
        </Text>
      </View>

      {renderStatusBar(classItem.readingHealth)}

      <View style={styles.percentagesContainer}>
        {Object.entries(classItem.readingHealth).map(([key, value]) => (
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
                <Text style={styles.percentageValue}>{value.percentage}%</Text>
                <Text style={styles.countValue}>({value.count} students)</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {expandedClass === classItem.classId && (
        <View style={styles.expandedDetails}>
          {Object.entries(classItem.readingHealth).map(([key, value]) => (
            <View key={key}>
              <View style={styles.detailHeader}>
                <Text
                  style={[
                    styles.detailTitle,
                    { color: getStatusColor(key as StatusType) },
                  ]}
                >
                  {getStatusLabel(key as StatusType)} Students ({value.count})
                </Text>
                {value.students.length > 0 && (
                  <TouchableOpacity
                    onPress={() =>
                      openStudentModal(key as StatusType, value.students)
                    }
                    style={styles.viewButton}
                  >
                    <Text style={styles.viewButtonText}>View All</Text>
                  </TouchableOpacity>
                )}
              </View>
              {value.students.length > 0 ? (
                <View style={styles.studentList}>
                  {value.students.slice(0, 3).map((student, index) => (
                    <Text key={index} style={styles.studentName}>
                      • {student}
                    </Text>
                  ))}
                  {value.students.length > 3 && (
                    <Text style={styles.moreStudentsText}>
                      and {value.students.length - 3} more...
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={styles.noStudentsText}>
                  No students in this category
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

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

    if (filteredClassHealthData.length === 0) {
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

    if (selectedView === 'overall') {
      const overallData = getOverallReadingHealth();
      if (!overallData) return null;

      return (
        <ScrollView style={styles.classesContainer}>
          {renderClassCard(overallData)}
        </ScrollView>
      );
    }

    const selectedClass = filteredClassHealthData.find(
      c => c.classId === selectedView,
    );
    if (selectedClass) {
      return (
        <ScrollView style={styles.classesContainer}>
          {renderClassCard(selectedClass)}
        </ScrollView>
      );
    }

    return null;
  };

  const dropdownOptions = [
    { label: 'Overall Reading Health', value: 'overall' },
    ...filteredClassHealthData.map(classItem => ({
      label: classItem.className,
      value: classItem.classId,
    })),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Reading Status</Text>
        <Text style={styles.subtitle}>Status Distribution by Class</Text>
      </View>

      {/* Filters Row: Academic Year + Class Selector */}
      <View style={styles.filtersRow}>
        {/* Academic Year Filter */}
        {academicYears.length > 0 && (
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Academic Year</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setShowYearDropdown(!showYearDropdown);
                setDropdownOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText} numberOfLines={1}>
                {academicYear || 'All Years'}
              </Text>
              <Text style={styles.filterArrow}>
                {showYearDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showYearDropdown && (
              <View style={styles.filterDropdownMenu}>
                <ScrollView style={styles.filterDropdownScroll}>
                  <TouchableOpacity
                    style={[
                      styles.filterDropdownOption,
                      !academicYear && styles.filterDropdownOptionSelected,
                    ]}
                    onPress={() => handleAcademicYearSelect('')}
                  >
                    <Text
                      style={[
                        styles.filterDropdownOptionText,
                        !academicYear &&
                          styles.filterDropdownOptionTextSelected,
                      ]}
                    >
                      All Years
                    </Text>
                  </TouchableOpacity>
                  {academicYears.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.filterDropdownOption,
                        academicYear === year &&
                          styles.filterDropdownOptionSelected,
                      ]}
                      onPress={() => handleAcademicYearSelect(year)}
                    >
                      <Text
                        style={[
                          styles.filterDropdownOptionText,
                          academicYear === year &&
                            styles.filterDropdownOptionTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Class Selector Dropdown */}
        {filteredClassHealthData.length > 0 && (
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Classes</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setDropdownOpen(!dropdownOpen);
                setShowYearDropdown(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText} numberOfLines={1}>
                {dropdownOptions.find(opt => opt.value === selectedView)
                  ?.label || 'Select View'}
              </Text>
              <Text style={styles.filterArrow}>
                {dropdownOpen ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.filterDropdownMenu}>
                <ScrollView style={styles.filterDropdownScroll}>
                  {dropdownOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterDropdownOption,
                        selectedView === option.value &&
                          styles.filterDropdownOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedView(option.value);
                        setDropdownOpen(false);
                        setExpandedClass(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterDropdownOptionText,
                          selectedView === option.value &&
                            styles.filterDropdownOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Filter Status Info */}
      {academicYear && filteredClassHealthData.length > 0 && (
        <View style={styles.filterStatusContainer}>
          <Text style={styles.filterStatusText}>
            Showing{' '}
            <Text style={styles.filterStatusYear}>{academicYear}</Text> •{' '}
            {filteredClassHealthData.length} class
            {filteredClassHealthData.length !== 1 ? 'es' : ''}
          </Text>
        </View>
      )}

      {renderContent()}

      {/* Student List Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeStudentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
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
                {modalData?.statusLabel} Students
              </Text>
              <TouchableOpacity
                onPress={closeStudentModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSubheader}>
              <Text style={styles.modalStudentCount}>
                {modalData?.students.length || 0} student
                {modalData?.students.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <FlatList
              data={modalData?.students || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.modalStudentItem}>
                  <Text style={styles.modalStudentNumber}>{index + 1}.</Text>
                  <Text style={styles.modalStudentName}>{item}</Text>
                </View>
              )}
              style={styles.modalStudentList}
              contentContainerStyle={styles.modalStudentListContent}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeStudentModal}
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
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  // New Filters Row Layout
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    zIndex: 1000,
  },
  filterItem: {
    flex: 1,
    zIndex: 1000,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
    marginBottom: 6,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: 'Satoshi-Medium',
    flex: 1,
    marginRight: 8,
  },
  filterArrow: {
    fontSize: 12,
    color: '#4ECDC4',
    fontFamily: 'Satoshi-Bold',
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: 62,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    maxHeight: 200,
    elevation: 5,
    zIndex: 2000,
  },
  filterDropdownScroll: {
    maxHeight: 200,
  },
  filterDropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  filterDropdownOptionSelected: {
    backgroundColor: '#E8F5F5',
  },
  filterDropdownOptionText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#2C3E50',
  },
  filterDropdownOptionTextSelected: {
    color: '#4ECDC4',
    fontFamily: 'Satoshi-Bold',
  },
  filterStatusContainer: {
    backgroundColor: '#E8F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  filterStatusText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#2C3E50',
  },
  filterStatusYear: {
    fontFamily: 'Satoshi-Bold',
    color: '#4ECDC4',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 8,
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontFamily: 'Satoshi-Medium',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },
  classesContainer: {
    maxHeight: 500,
  },
  classCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  classHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  className: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
  },
  classStats: {
    fontSize: 12,
    color: '#7F8C8D',
    fontFamily: 'Satoshi-Medium',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 16,
    color: '#4ECDC4',
    fontFamily: 'Satoshi-Medium',
    fontWeight: 'bold',
  },
  statusBarContainer: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  statusSegment: {
    height: '100%',
  },
  percentagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  percentageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statusLegendsContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 20,
  },
  statusLegends: {
    flex: 1,
    flexDirection: 'row',
  },
  statusLegends2: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: 'Satoshi-Medium',
    marginRight: 4,
    flex: 1,
  },
  percentageValue: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#2C3E50',
    marginRight: 4,
  },
  countValue: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  viewButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
  },
  studentList: {
    marginLeft: 8,
  },
  studentName: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: 'Satoshi-Medium',
    marginBottom: 2,
  },
  moreStudentsText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontStyle: 'italic',
    marginTop: 4,
  },
  noStudentsText: {
    fontSize: 12,
    color: '#BDC3C7',
    fontFamily: 'Satoshi-MediumItalic',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    color: '#7F8C8D',
  },
  modalSubheader: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalStudentCount: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#7F8C8D',
  },
  modalStudentList: {
    maxHeight: 300,
  },
  modalStudentListContent: {
    paddingBottom: 10,
  },
  modalStudentItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  modalStudentNumber: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 10,
    fontFamily: 'Satoshi-Medium',
  },
  modalStudentName: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: 'Satoshi-Medium',
    flex: 1,
  },
  modalCloseButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
  },
});

export default ClassReadingStatus;
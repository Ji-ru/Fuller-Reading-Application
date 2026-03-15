// FacultyDashboard.tsx (Updated with TypeScript)
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import upperNav from '../../UI_Designs/UpperNavigation';
import { getForStudentsMiscueStats } from '../../Hooks/use_ForStudentMiscueStats';
import { getAuth } from '@react-native-firebase/auth';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import ActiveHoursChart from '../../Components/Faculty/Dashboard/ActiveHoursChart';
import MiscueAnalytics from '../../Components/Faculty/Dashboard/MiscueChart';
import ClassReadingStatus from '../../Components/Faculty/Dashboard/ClassReadingStatus';
import AccuracyTrendsChart from '../../Components/Faculty/Dashboard/AccuracyTrends';
import NumberOfClassesAndStudents from '../../Components/Faculty/Dashboard/NumberOFClassesAndStudents';
import { HeaderMenu } from '../../Components/GlobalUse/HeaderMenu';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { useFetchClassReadingHealth } from '../../Hooks/use_ReadingStudentStats';

export type ClassViewFilter = 'overall' | string;

export interface ReadingStatusFilter {
  academicYear: string;
  selectedView: ClassViewFilter;
}

export default function FacultyDashboard() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<{
    classCount: number;
    studentCount: number;
  }>({ classCount: 0, studentCount: 0 });
  const [readingStatusFilter, setReadingStatusFilter] =
    useState<ReadingStatusFilter>({
      academicYear: '',
      selectedView: 'overall',
    });
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleLogout } = useNavigationHelper();
  const auth = getAuth();
  const { getNumberOfClasses, getNumbersOfAllStudents } =
    getForStudentsMiscueStats();
  const handleReadingFilterChange = React.useCallback(
    (filter: ReadingStatusFilter) => {
      setReadingStatusFilter(filter);
    },
    [],
  );
  const { classHealthData } = useFetchClassReadingHealth(
    auth.currentUser?.uid || '',
  );
  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchStats = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Fetch both counts in parallel for better performance
      const [classCount, studentCount] = await Promise.all([
        getNumberOfClasses(currentUser.uid),
        getNumbersOfAllStudents(currentUser.uid),
      ]);

      setStats({
        classCount: classCount,
        studentCount: studentCount,
      });
    } catch (error: any) {
      throw new Error('Failed to fetch stats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // ========================================================================
  // EVENT HANDLER
  // ========================================================================

  const academicYears = React.useMemo(() => {
    return Array.from(
      new Set(classHealthData.map(item => item.acadYear).filter(Boolean)),
    );
  }, [classHealthData]);

  // Filter classes based on selected academic year
  const filteredClassData = React.useMemo(() => {
    if (!readingStatusFilter.academicYear) {
      return classHealthData;
    }
    return classHealthData.filter(
      c => c.acadYear === readingStatusFilter.academicYear,
    );
  }, [classHealthData, readingStatusFilter.academicYear]);

  const classOptions = React.useMemo(() => {
    return [
      { label: 'Overall Reading Health', value: 'overall' },
      ...filteredClassData.map(c => ({
        label: c.className,
        value: c.classId,
      })),
    ];
  }, [filteredClassData]);

  return (
    <SafeAreaView style={facultyDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={facultyDashboard.container}>
          {/* BUBBLE DECORATIONS */}
          <BubbleBackground />

          {/* HEADER */}
          <View style={upperNav.header}>
            <Image
              style={upperNav.ciscLogo}
              source={require('../../../assets/images/cisckids.png')}
            />
            <HeaderMenu onLogout={handleLogout} />
          </View>

          {/* MAIN CONTENT */}
          <View style={facultyDashboard.content}>
            <Text style={facultyDashboard.dashboardTitle}>
              Faculty Dashboard
            </Text>
            <Text style={facultyDashboard.dashboardSubtitle}>
              Reading Analytics Overview
            </Text>
            {/* READING STATUS FILTERS */}
            <View style={facultyDashboard.filtersRow}>
              {/* Academic Year */}
              <View style={facultyDashboard.filterItem}>
                <Text style={facultyDashboard.filterLabel}>Academic Year</Text>
                <TouchableOpacity
                  style={facultyDashboard.filterButton}
                  onPress={() => setShowYearDropdown(v => !v)}
                  activeOpacity={0.7}
                >
                  <Text style={facultyDashboard.filterButtonText}>
                    {readingStatusFilter.academicYear || 'All Years'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#7F8C8D' }}>
                    {showYearDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showYearDropdown && (
                  <View style={facultyDashboard.filterDropdownMenu}>
                    <ScrollView>
                      <TouchableOpacity
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          borderBottomWidth: 0.5,
                          borderBottomColor: '#F0F0F0',
                          backgroundColor: !readingStatusFilter.academicYear
                            ? '#E8F8F7'
                            : 'white',
                        }}
                        onPress={() => {
                          setReadingStatusFilter({
                            academicYear: '',
                            selectedView: 'overall',
                          });
                          setShowYearDropdown(false);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: !readingStatusFilter.academicYear
                              ? '#4ECDC4'
                              : '#555',
                            fontFamily: !readingStatusFilter.academicYear
                              ? 'Satoshi-Medium'
                              : 'Satoshi-Regular',
                          }}
                        >
                          All Years
                        </Text>
                      </TouchableOpacity>

                      {academicYears.map(year => (
                        <TouchableOpacity
                          key={year}
                          style={{
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            borderBottomWidth: 0.5,
                            borderBottomColor: '#F0F0F0',
                            backgroundColor:
                              readingStatusFilter.academicYear === year
                                ? '#E8F8F7'
                                : 'white',
                          }}
                          onPress={() => {
                            setReadingStatusFilter({
                              academicYear: year,
                              selectedView: 'overall',
                            });
                            setShowYearDropdown(false);
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              color:
                                readingStatusFilter.academicYear === year
                                  ? '#4ECDC4'
                                  : '#555',
                              fontFamily:
                                readingStatusFilter.academicYear === year
                                  ? 'Satoshi-Medium'
                                  : 'Satoshi-Regular',
                            }}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Class Selector */}
              <View style={facultyDashboard.filterItem}>
                <Text style={facultyDashboard.filterLabel}>Classes</Text>
                <TouchableOpacity
                  style={facultyDashboard.filterButton}
                  onPress={() => {
                    setShowClassDropdown(v => !v);
                    setShowYearDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={facultyDashboard.filterButtonText}>
                    {classOptions.find(
                      o => o.value === readingStatusFilter.selectedView,
                    )?.label || 'Select Class'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#7F8C8D' }}>
                    {showClassDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showClassDropdown && (
                  <View style={facultyDashboard.filterDropdownMenu}>
                    <ScrollView>
                      {classOptions.map(opt => (
                        <TouchableOpacity
                          key={opt.value}
                          style={{
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            borderBottomWidth: 0.5,
                            borderBottomColor: '#F0F0F0',
                            backgroundColor:
                              readingStatusFilter.selectedView === opt.value
                                ? '#E8F8F7'
                                : 'white',
                          }}
                          onPress={() => {
                            setReadingStatusFilter(prev => ({
                              ...prev,
                              selectedView: opt.value,
                            }));
                            setShowClassDropdown(false);
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              color:
                                readingStatusFilter.selectedView === opt.value
                                  ? '#4ECDC4'
                                  : '#555',
                              fontFamily:
                                readingStatusFilter.selectedView === opt.value
                                  ? 'Satoshi-Medium'
                                  : 'Satoshi-Regular',
                            }}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
            {/* STATS SUMMARY */}
            <NumberOfClassesAndStudents
              loading={loading}
              classCount={stats.classCount}
              studentCount={stats.studentCount}
            />
            <ClassReadingStatus
              facultyId={auth.currentUser?.uid || ''}
              filter={readingStatusFilter}
              onFilterChange={handleReadingFilterChange}
            />
            <AccuracyTrendsChart
              facultyId={auth.currentUser?.uid}
              filter={readingStatusFilter}
              onFilterChange={handleReadingFilterChange}
              academicYears={academicYears}
            />
            <ActiveHoursChart
              facultyId={auth.currentUser?.uid}
              filter={readingStatusFilter}
            />
            <MiscueAnalytics
              facultyId={auth.currentUser?.uid}
              filter={readingStatusFilter}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

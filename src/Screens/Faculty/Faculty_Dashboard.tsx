import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { Icon } from '../../Components/GlobalUse/Icon';
import { sw } from '../../Utils/responsive';
import { getForStudentsMiscueStats } from '../../Hooks/use_ForStudentMiscueStats';
import { getAuth } from '@react-native-firebase/auth';
import { getUserProfile } from '../../Controller/AuthenticationController';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import MiscueAnalytics from '../../Components/Faculty/Dashboard/MiscueChart';
import ClassReadingStatus from '../../Components/Faculty/Dashboard/ClassReadingStatus';
import AccuracyTrendsChart from '../../Components/Faculty/Dashboard/AccuracyTrends';
import NumberOfClassesAndStudents from '../../Components/Faculty/Dashboard/NumberOFClassesAndStudents';
import ClassParticipationRate from '../../Components/Faculty/Dashboard/ClassParticipationRate';
import ReadingCalendarHeatmap from '../../Components/Faculty/Dashboard/ReadingCalendarHeatmap';
import PassageDifficultyRanking from '../../Components/Faculty/Dashboard/PassageDifficultyRanking';
import GenderDistributionChart from '../../Components/GlobalUse/GenderDistributionChart';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { useFetchClassReadingHealth } from '../../Hooks/use_ReadingStudentStats';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { FacultyColors } from '../../Utilities/Theme';

export type ClassViewFilter = 'overall' | string;

export interface ReadingStatusFilter {
  academicYear: string;
  selectedView: ClassViewFilter;
}

export default function FacultyDashboard() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<{ classCount: number; studentCount: number }>({
    classCount: 0,
    studentCount: 0,
  });
  const [readingStatusFilter, setReadingStatusFilter] = useState<ReadingStatusFilter>({
    academicYear: '',
    selectedView: 'overall',
  });
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [firstName, setFirstName] = useState<string>('Faculty');

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { handleLogout, handleNextStep } = useNavigationHelper();
  const auth = getAuth();
  const { getNumberOfClasses, getNumbersOfAllStudents } = getForStudentsMiscueStats();

  const handleReadingFilterChange = React.useCallback((filter: ReadingStatusFilter) => {
    setReadingStatusFilter(filter);
  }, []);

  const { classHealthData } = useFetchClassReadingHealth(auth.currentUser?.uid || '');

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
      const [classCount, studentCount] = await Promise.all([
        getNumberOfClasses(currentUser.uid),
        getNumbersOfAllStudents(currentUser.uid),
      ]);
      setStats({ classCount, studentCount });
    } catch (error: any) {
      throw new Error('Failed to fetch stats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const loadName = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const profile = await getUserProfile(uid);
        if (profile?.firstName) setFirstName(profile.firstName);
      } catch (err) {
        console.warn('Failed to load faculty profile name', err);
      }
    };
    loadName();
  }, [auth.currentUser?.uid]);

  // ── Derived / Memos ────────────────────────────────────────────────────────
  const academicYears = React.useMemo(
    () => Array.from(new Set(classHealthData.map(item => item.acadYear).filter(Boolean))),
    [classHealthData],
  );

  const filteredClassData = React.useMemo(() => {
    if (!readingStatusFilter.academicYear) return classHealthData;
    return classHealthData.filter(c => c.acadYear === readingStatusFilter.academicYear);
  }, [classHealthData, readingStatusFilter.academicYear]);

  const classOptions = React.useMemo(
    () => filteredClassData.map(c => ({ label: c.className, value: c.classId })),
    [filteredClassData],
  );

  const getFirstClassIdInYear = React.useCallback(
    (year: string): string => {
      const first = classHealthData.find(c => c.acadYear === year);
      return first?.classId || '';
    },
    [classHealthData],
  );

  useEffect(() => {
    if (classHealthData.length === 0) return;
    if (readingStatusFilter.academicYear !== '' && readingStatusFilter.selectedView !== 'overall') return;
    const firstYear = academicYears[0] || '';
    if (!firstYear) return;
    const firstClassId = getFirstClassIdInYear(firstYear);
    if (firstClassId) {
      setReadingStatusFilter({ academicYear: firstYear, selectedView: firstClassId });
    }
  }, [classHealthData, academicYears, readingStatusFilter, getFirstClassIdInYear]);

  const selectedClassLabel = React.useMemo(
    () => classOptions.find(o => o.value === readingStatusFilter.selectedView)?.label,
    [classOptions, readingStatusFilter.selectedView],
  );

  const selectedGradeLevel = React.useMemo<number | undefined>(() => {
    const cls = classHealthData.find(c => c.classId === readingStatusFilter.selectedView);
    if (!cls) return undefined;
    const allStudents = [
      ...(cls.readingHealth?.fluent?.students ?? []),
      ...(cls.readingHealth?.developing?.students ?? []),
      ...(cls.readingHealth?.emerging?.students ?? []),
      ...(cls.readingHealth?.atRisk?.students ?? []),
      ...(cls.readingHealth?.insufficientData?.students ?? []),
    ];
    if (allStudents.length === 0) return undefined;
    const counts: Record<number, number> = {};
    for (const s of allStudents) {
      if (typeof s.gradeLevel === 'number') counts[s.gradeLevel] = (counts[s.gradeLevel] || 0) + 1;
    }
    const entries = Object.entries(counts);
    if (entries.length === 0) return undefined;
    entries.sort((a, b) => b[1] - a[1]);
    return Number(entries[0][0]);
  }, [classHealthData, readingStatusFilter.selectedView]);

  const selectedClassStudentCount = React.useMemo(() => {
    const cls = classHealthData.find(c => c.classId === readingStatusFilter.selectedView);
    if (cls?.totalStudents) return cls.totalStudents;
    return stats.studentCount;
  }, [classHealthData, readingStatusFilter.selectedView, stats.studentCount]);

  // The filter's selectedView is a classId once data loads ('overall' before).
  const selectedClassId = React.useMemo(
    () => (readingStatusFilter.selectedView !== 'overall' ? readingStatusFilter.selectedView : undefined),
    [readingStatusFilter.selectedView],
  );

  const displayName = firstName;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={facultyDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BubbleBackground />

        {/* ── Top bar: menu button ── */}
        <View style={facultyDashboard.topBar}>
          <TouchableOpacity
            style={facultyDashboard.menuBtn}
            onPress={() => setMenuVisible(v => !v)}
            activeOpacity={0.7}
          >
            <MenuBars />
          </TouchableOpacity>
        </View>

        {/* Dropdown menu */}
        {menuVisible && (
          <>
            <TouchableOpacity
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
            <View style={facultyDashboard.dropdown}>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); handleNextStep('About'); }}
                style={facultyDashboard.dropdownItem}
                activeOpacity={0.75}
              >
                <Icon name="info" size={sw(20)} color={FacultyColors.slate} filled />
                <Text style={facultyDashboard.dropdownTextAbout}>About</Text>
              </TouchableOpacity>
              <View style={facultyDashboard.dropdownDivider} />
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
                style={facultyDashboard.dropdownItem}
                activeOpacity={0.75}
              >
                <Image
                  source={require('../../../assets/icons/Logout-icon.png')}
                  style={facultyDashboard.dropdownIcon}
                />
                <Text style={facultyDashboard.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Hero Header Card ── */}
        <View style={facultyDashboard.heroCard}>
          <View style={facultyDashboard.heroCardLeft}>
            <Text style={facultyDashboard.heroGreeting}>Good Day, {displayName}!</Text>
            <Text style={facultyDashboard.heroTitle}>Faculty Dashboard</Text>
          </View>
          <View style={facultyDashboard.heroIconWrap}>
            <Text style={facultyDashboard.heroIcon}>🏆</Text>
          </View>
        </View>

        {/* ── Main Content ── */}
        <View style={facultyDashboard.content}>

          {/* 1. OVERVIEW — classes & students count */}
          <SectionLabel label="Dashboard Overview" />
          <NumberOfClassesAndStudents
            loading={loading}
            classCount={stats.classCount}
            studentCount={stats.studentCount}
          />

          {/* 2. ACADEMIC FILTERS */}
          <SectionLabel label="Academic Filters" />
          <View style={facultyDashboard.filtersCard}>
            <View style={facultyDashboard.filtersRow}>

              {/* Academic Year */}
              <View style={facultyDashboard.filterItem}>
                <Text style={facultyDashboard.filterLabel}>Academic Year</Text>
                <TouchableOpacity
                  style={[
                    facultyDashboard.filterButton,
                    showYearDropdown && facultyDashboard.filterButtonActive,
                  ]}
                  onPress={() => { setShowYearDropdown(v => !v); setShowClassDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={facultyDashboard.filterButtonText}>
                    {readingStatusFilter.academicYear || 'Select Year'}
                  </Text>
                  <Text style={facultyDashboard.filterButtonIcon}>
                    {showYearDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showYearDropdown && (
                  <View style={facultyDashboard.filterDropdownMenu}>
                    <ScrollView>
                      {academicYears.map((year, idx) => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            facultyDashboard.filterDropdownOption,
                            idx === academicYears.length - 1 && facultyDashboard.filterDropdownOptionLast,
                            readingStatusFilter.academicYear === year && facultyDashboard.filterDropdownOptionActive,
                          ]}
                          onPress={() => {
                            setReadingStatusFilter({
                              academicYear: year,
                              selectedView: getFirstClassIdInYear(year),
                            });
                            setShowYearDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              facultyDashboard.filterDropdownOptionText,
                              readingStatusFilter.academicYear === year && facultyDashboard.filterDropdownOptionTextActive,
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

              {/* Section / Class */}
              <View style={facultyDashboard.filterItem}>
                <Text style={facultyDashboard.filterLabel}>Section</Text>
                <TouchableOpacity
                  style={[
                    facultyDashboard.filterButton,
                    showClassDropdown && facultyDashboard.filterButtonActive,
                  ]}
                  onPress={() => { setShowClassDropdown(v => !v); setShowYearDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={facultyDashboard.filterButtonText}>
                    {classOptions.find(o => o.value === readingStatusFilter.selectedView)?.label || 'Select Class'}
                  </Text>
                  <Text style={facultyDashboard.filterButtonIcon}>
                    {showClassDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showClassDropdown && (
                  <View style={facultyDashboard.filterDropdownMenu}>
                    <ScrollView>
                      {classOptions.map((opt, idx) => (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            facultyDashboard.filterDropdownOption,
                            idx === classOptions.length - 1 && facultyDashboard.filterDropdownOptionLast,
                            readingStatusFilter.selectedView === opt.value && facultyDashboard.filterDropdownOptionActive,
                          ]}
                          onPress={() => {
                            setReadingStatusFilter(prev => ({ ...prev, selectedView: opt.value }));
                            setShowClassDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              facultyDashboard.filterDropdownOptionText,
                              readingStatusFilter.selectedView === opt.value && facultyDashboard.filterDropdownOptionTextActive,
                            ]}
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
          </View>

          {/* 3. READING HEALTH — broad snapshot of who is fluent / at-risk */}
          {/* <SectionLabel label="Reading Health" /> */}
          {/* <ClassReadingStatus
            facultyId={auth.currentUser?.uid || ''}
            filter={readingStatusFilter}
            onFilterChange={handleReadingFilterChange}
          /> */}

          {/* 3.5 GENDER DISTRIBUTION — students enrolled in the selected class */}
          {selectedClassId && (
            <>
              <SectionLabel label="Gender Distribution" />
              <GenderDistributionChart classId={selectedClassId} />
            </>
          )}

          {/* 4. CLASS PARTICIPATION — are students actually reading this week? */}
          <SectionLabel label="Class Participation" />
          <ClassParticipationRate
            facultyId={auth.currentUser?.uid}
            filter={readingStatusFilter}
            className={selectedClassLabel}
          />

          {/* 5. ACCURACY & SPEED TRENDS — how performance is moving over time */}
          <SectionLabel label="Accuracy Trends" />
          <AccuracyTrendsChart
            facultyId={auth.currentUser?.uid}
            filter={readingStatusFilter}
            className={selectedClassLabel}
            gradeLevel={selectedGradeLevel}
          />

          {/* 6. ACTIVITY CALENDAR — when students read (pattern / consistency) */}
          <SectionLabel label="Reading Activity Calendar" />
          <ReadingCalendarHeatmap
            facultyId={auth.currentUser?.uid}
            filter={readingStatusFilter}
            className={selectedClassLabel}
          />

          {/* 7. PASSAGE DIFFICULTY — which passages are causing the most trouble */}
          {/* <SectionLabel label="Passage Difficulty Ranking" />
          <PassageDifficultyRanking
            facultyId={auth.currentUser?.uid}
            filter={readingStatusFilter}
            className={selectedClassLabel}
          /> */}

          {/* 8. MISCUE ANALYSIS — deepest diagnostic: error types and problem words */}
          <SectionLabel label="Miscue Analysis" />
          <MiscueAnalytics
            facultyId={auth.currentUser?.uid}
            filter={readingStatusFilter}
            className={selectedClassLabel}
            totalStudentsInClass={selectedClassStudentCount}
          />

        </View>
      </ScrollView>

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => { setLogoutVisible(false); await handleLogout(); }}
      />
    </SafeAreaView>
  );
}

// ─── Section label with decorative dot ────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <View style={facultyDashboard.sectionRow}>
      <Text style={facultyDashboard.sectionLabel}>{label}</Text>
      <View style={facultyDashboard.sectionDot} />
    </View>
  );
}

// ─── Hamburger icon ────────────────────────────────────────────────────────────
function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
      <View style={{ width: 12, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
      <View style={{ width: 18, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
    </View>
  );
}

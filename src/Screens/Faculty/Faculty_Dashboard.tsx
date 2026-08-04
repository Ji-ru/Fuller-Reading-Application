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
import AccuracyTrendsChart from '../../Components/Faculty/Dashboard/AccuracyTrends';
import NumberOfClassesAndStudents from '../../Components/Faculty/Dashboard/NumberOFClassesAndStudents';
import ClassParticipationRate from '../../Components/Faculty/Dashboard/ClassParticipationRate';
import ReadingCalendarHeatmap from '../../Components/Faculty/Dashboard/ReadingCalendarHeatmap';
import PassageDifficultyRanking from '../../Components/Faculty/Dashboard/PassageDifficultyRanking';
import GenderDistributionChart from '../../Components/GlobalUse/GenderDistributionChart';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { useFacultyClassesFilter } from '../../Hooks/use_ReadingStudentStats';
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

  const { classes: facultyClasses } = useFacultyClassesFilter(auth.currentUser?.uid || '');

  // ── Data Fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (facultyClasses) {
      const classCount = facultyClasses.length;
      const studentCount = facultyClasses.reduce((acc, c) => acc + (c.totalStudents || 0), 0);
      setStats({ classCount, studentCount });
      setLoading(false);
    }
  }, [facultyClasses]);

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
    () => Array.from(new Set(facultyClasses.map((item: any) => item.acadYear).filter(Boolean))),
    [facultyClasses],
  );

  const filteredClassData = React.useMemo(() => {
    if (!readingStatusFilter.academicYear) return facultyClasses;
    return facultyClasses.filter((c: any) => c.acadYear === readingStatusFilter.academicYear);
  }, [facultyClasses, readingStatusFilter.academicYear]);

  const classOptions = React.useMemo(
    () => filteredClassData.map((c: any) => ({ label: c.className, value: c.classId })),
    [filteredClassData],
  );

  const getFirstClassIdInYear = React.useCallback(
    (year: string): string => {
      const first: any = facultyClasses.find((c: any) => c.acadYear === year);
      return first?.classId || '';
    },
    [facultyClasses],
  );

  useEffect(() => {
    if (facultyClasses.length === 0) return;
    if (readingStatusFilter.academicYear !== '' && readingStatusFilter.selectedView !== 'overall') return;
    const firstYear = academicYears[0] as string || '';
    if (!firstYear) return;
    const firstClassId = getFirstClassIdInYear(firstYear);
    if (firstClassId) {
      setReadingStatusFilter({ academicYear: firstYear, selectedView: firstClassId });
    }
  }, [facultyClasses, academicYears, readingStatusFilter, getFirstClassIdInYear]);

  const selectedClassLabel = React.useMemo(
    () => classOptions.find((o: any) => o.value === readingStatusFilter.selectedView)?.label,
    [classOptions, readingStatusFilter.selectedView],
  );

  const selectedGradeLevel = React.useMemo<number | undefined>(() => {
    const cls: any = facultyClasses.find((c: any) => c.classId === readingStatusFilter.selectedView);
    return cls?.gradeLevel;
  }, [facultyClasses, readingStatusFilter.selectedView]);

  const selectedClassStudentCount = React.useMemo(() => {
    const cls: any = facultyClasses.find((c: any) => c.classId === readingStatusFilter.selectedView);
    if (cls?.totalStudents !== undefined) return cls.totalStudents;
    return stats.studentCount;
  }, [facultyClasses, readingStatusFilter.selectedView, stats.studentCount]);

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
                      {academicYears.map((year: any, idx: number) => (
                        <TouchableOpacity
                          key={year as string}
                          style={[
                            facultyDashboard.filterDropdownOption,
                            idx === academicYears.length - 1 && facultyDashboard.filterDropdownOptionLast,
                            readingStatusFilter.academicYear === year && facultyDashboard.filterDropdownOptionActive,
                          ]}
                          onPress={() => {
                            setReadingStatusFilter({
                              academicYear: year as string,
                              selectedView: getFirstClassIdInYear(year as string),
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
                            {year as string}
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
                    {classOptions.find((o: any) => o.value === readingStatusFilter.selectedView)?.label || 'Select Class'}
                  </Text>
                  <Text style={facultyDashboard.filterButtonIcon}>
                    {showClassDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showClassDropdown && (
                  <View style={facultyDashboard.filterDropdownMenu}>
                    <ScrollView>
                      {classOptions.map((opt: any, idx: number) => (
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

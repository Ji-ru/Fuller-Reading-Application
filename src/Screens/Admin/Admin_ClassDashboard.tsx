import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  RootStackParamList,
  useNavigationHelper,
} from '../../Controller/NavigationController';
import { getUserProfile } from '../../Controller/AuthenticationController';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import NumberOfClassesAndStudents from '../../Components/Faculty/Dashboard/NumberOFClassesAndStudents';
import ClassParticipationRate from '../../Components/Faculty/Dashboard/ClassParticipationRate';
import AccuracyTrendsChart from '../../Components/Faculty/Dashboard/AccuracyTrends';
import ReadingCalendarHeatmap from '../../Components/Faculty/Dashboard/ReadingCalendarHeatmap';
import MiscueAnalytics from '../../Components/Faculty/Dashboard/MiscueChart';
import GenderDistributionChart from '../../Components/GlobalUse/GenderDistributionChart';
import { sf, sh } from '../../Utils/responsive';

type AdminClassDashboardRouteProp = RouteProp<
  RootStackParamList,
  'AdminClassDashboard'
>;

export default function AdminClassDashboard() {
  const route = useRoute<AdminClassDashboardRouteProp>();
  const { classId, className, acadYear, facultyId, gradeLevel, studentCount } =
    route.params;

  const { handleBackStep } = useNavigationHelper();

  // ── State ──────────────────────────────────────────────────────────────────
  const [teacher, setTeacher] = useState<UserDocument | null>(null);

  // ── Load the class teacher for the hero card ─────────────────────────────────
  useEffect(() => {
    const loadTeacher = async () => {
      try {
        const profile = await getUserProfile(facultyId);
        if (profile) setTeacher(profile);
      } catch (err) {
        console.warn('Failed to load class teacher profile', err);
      }
    };
    loadTeacher();
  }, [facultyId]);

  // ── Fixed filter — this screen is scoped to a single class / acad year ───────
  const filter = useMemo(
    () => ({ academicYear: acadYear, selectedView: classId }),
    [acadYear, classId],
  );

  const teacherName = teacher
    ? `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim()
    : 'Loading…';

  const teacherAvatar = teacher?.profileImageUrl
    ? { uri: teacher.profileImageUrl }
    : teacher?.sex === 'male'
    ? require('../../../assets/images/Male-profile.png')
    : require('../../../assets/images/Female-profile.png');

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={facultyDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BubbleBackground />

        {/* ── Top bar: back button ── */}
        <View style={upperNav.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBackStep}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrowText}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero Header Card — class teacher ── */}
        <View style={facultyDashboard.heroCard}>
          <View style={facultyDashboard.heroCardLeft}>
            <Text style={facultyDashboard.heroGreeting}>Class Teacher</Text>
            <Text style={facultyDashboard.heroTitle}>{teacherName}</Text>
            <Text style={styles.heroSubtitle}>
              {(className || 'Untitled Class') + `  (${acadYear})`}
            </Text>
          </View>
          <View style={facultyDashboard.heroIconWrap}>
            <Image source={teacherAvatar} style={styles.heroAvatar} />
          </View>
        </View>

        {/* ── Main Content ── */}
        <View style={facultyDashboard.content}>
          {/* 1. OVERVIEW — this class only */}
          <SectionLabel label="Class Overview" />
          <NumberOfClassesAndStudents
            loading={false}
            classCount={1}
            studentCount={studentCount}
          />

          {/* 2. GENDER DISTRIBUTION — students enrolled in this class */}
          <SectionLabel label="Gender Distribution" />
          <GenderDistributionChart classId={classId} />

          {/* 3. CLASS PARTICIPATION */}
          <SectionLabel label="Class Participation" />
          <ClassParticipationRate
            facultyId={facultyId}
            filter={filter}
            className={className}
          />

          {/* 3. ACCURACY & SPEED TRENDS */}
          <SectionLabel label="Accuracy Trends" />
          <AccuracyTrendsChart
            facultyId={facultyId}
            filter={filter}
            className={className}
            gradeLevel={gradeLevel}
          />

          {/* 4. READING ACTIVITY CALENDAR */}
          <SectionLabel label="Reading Activity Calendar" />
          <ReadingCalendarHeatmap
            facultyId={facultyId}
            filter={filter}
            className={className}
          />

          {/* 5. MISCUE ANALYSIS */}
          <SectionLabel label="Miscue Analysis" />
          <MiscueAnalytics
            facultyId={facultyId}
            filter={filter}
            className={className}
            totalStudentsInClass={studentCount}
          />
        </View>
      </ScrollView>
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

const styles = StyleSheet.create({
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40,
    fontFamily: 'Nunito-Bold',
    color: '#ffffff',
    lineHeight: 28,
    marginLeft: -2,
    paddingBottom: 2,
  },
  heroSubtitle: {
    fontSize: sf(13),
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Satoshi-Medium',
    marginTop: sh(6),
  },
  heroAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
});

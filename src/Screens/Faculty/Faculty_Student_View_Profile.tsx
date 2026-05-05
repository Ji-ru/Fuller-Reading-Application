import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import upperNav from '../../UI_Designs/UpperNavigation';
import { useNavigationHelper } from '../../Controller/NavigationController';
import StudentAccuracyTrendsChart from '../../Components/Faculty/StudentView_Status/Student_Accuracy_Chart';
import StudentMiscueInsights from '../../Components/Faculty/StudentView_Status/Student_MiscueInsights';
import StudentMiscueAnalytics from '../../Components/Faculty/StudentView_Status/Student_MiscueChart';
import StudentTopMiscuePassageAndWords from '../../Components/Faculty/StudentView_Status/Student_TopPassage&TopWords';
import StudentActivityTrackingCard from '../../Components/Faculty/StudentView_Status/Student_TimeTrack';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import StudentAlphabetMastery from '../../Components/Faculty/StudentView_Status/StudentAlphabetMastery';
import StudentWordMastery from '../../Components/Faculty/StudentView_Status/StudentWordMastery';
import StudentTotalActivityToday from '../../Components/Faculty/StudentView_Status/StudentTotalActivityToday';
import facultyStudentView from '../../UI_Designs/FacultyStudentViewStyles';
import Svg, { Text as SvgText } from 'react-native-svg';

const C = {
  ink: '#1b2e23',
  white: '#ffffff',
  coral: '#e74c3c',
  green: '#2ca96a',
  darkBlue: '#163F6C',
  slate: '#9CA3AF',
  inkLight: '#6B7280',
};

const headerStyles = StyleSheet.create({
  backBtn: {
    width: 45, height: 45, borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40, fontFamily: 'Nunito-Bold',
    color: C.white, lineHeight: 28, marginLeft: -2, paddingBottom: 2
  },
});

/**
 * BASIC INFORMATION
 *  - First Name
 *  - Middle Name
 *  - Last Name
 *  - Sex
 *  - Birthdate
 * 
 * ACADEMIC INFORMATION
 *  - Class 
 *  - Grade Level
 *  - Reading Level
 * 
 * READING STATUS
 *  - Accuracy Trends (Weekly, Monthly, Yearly)
 *      - Average, Highest, Trend (Improving, Declining, Stagnant)
 *  - Activity Tracking (Weekly, Monthly, Yearly)
 *      - Total Mins, Average Mins
 *  - Top and Common Miscue Type
 *      - Top Miscued Passage (Accuracy, Attempts, Miscues)
 *      - Most Common Miscue Words (Word, Miscue Type, Attempt) 
 *  - Performance Summary
 *      - Best Accuracy (Add Lowest), Average WPM (Add best and lowest), Total Readings (Last 7 days Total Readings)
 *  - Overall Progress
 *      - Insights
 * 
 */



/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type RouteParams = {
  StudentViewProfile: {
    studentId: string;
    studentName: string;
    readingLevel: string;
    gradeLevel?: number;
  };
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function StudentViewProfile() {
  const route = useRoute<RouteProp<RouteParams, 'StudentViewProfile'>>();
  const { studentId, studentName, readingLevel, gradeLevel } = route.params;

  const { handleBackStep } = useNavigationHelper();

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <SafeAreaView style={facultyStudentView.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={facultyStudentView.innerContainer}>
          {/* BUBBLES */}
          <BubbleBackground />

          {/* HEADER */}
          <View style={{ zIndex: 100 }}>
            <View style={upperNav.header}>
              <TouchableOpacity style={headerStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
                <Text style={headerStyles.backArrowText}>‹</Text>
              </TouchableOpacity>
              <Svg height={60} width={240}>
                <SvgText
                  x={120}                 // center X
                  y={35}                  // baseline Y
                  fontSize={22}
                  fontFamily="Nunito-Black"
                  textAnchor="middle"     // center align
                  fill="none"          // inside color
                  stroke="#E8F5E9"        // outline color
                  strokeWidth={8}         // outline thickness
                  strokeLinejoin='round'
                >
                  Student Profile
                </SvgText>
                <SvgText
                  x={120}
                  y={35}
                  fontSize={22}
                  fontFamily="Nunito-Black"
                  textAnchor="middle"
                  fill="#1B5E20"
                >
                  Student Profile
                </SvgText>
              </Svg>
              <View style={{ width: 45 }} />
            </View>
          </View>

          {/* STUDENT SUMMARY */}
          <View style={facultyStudentView.profileHeader}>
            {/* Avatar circle with initials */}
            <View style={facultyStudentView.profileAvatarCircle}>
              <Text style={facultyStudentView.profileAvatarText}>
                {studentName
                  .split(' ')
                  .map((n: string) => n.charAt(0))
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>

            {/* Name + Reading Level */}
            <View style={facultyStudentView.profileInfoColumn}>
              <Text style={facultyStudentView.studentName}>{studentName}</Text>
              {/* <View style={facultyStudentView.readingLevelBadge}>
                <View style={facultyStudentView.readingLevelDot} />
                <Text style={facultyStudentView.readingLevelText}>
                  Level {readingLevel}
                </Text>
              </View> */}
            </View>
          </View>

          {/* TOTAL ACTIVITY TODAY */}
          <View style={facultyStudentView.section}>
            <StudentTotalActivityToday studentId={studentId} />
          </View>

          {/* ALPHABET MASTERY AND ACCURACY */}
          <View style={facultyStudentView.section}>
            <StudentAlphabetMastery studentId={studentId} />
          </View>

          {/* WORD MASTERY AND ACCURACY */}
          <View style={facultyStudentView.section}>
            <StudentWordMastery studentId={studentId} />
          </View>

          {/* MISCUE STATISTICS */}
          <View style={facultyStudentView.section}>
            <StudentMiscueInsights studentId={studentId} />
          </View>

          {/* ACCURACY AND SPEED */}
          <View style={facultyStudentView.section}>
            <StudentAccuracyTrendsChart studentId={studentId} gradeLevel={gradeLevel} />
          </View>

          {/* TOTAL TIME SPENT ON READING */}
          <View style={facultyStudentView.section}>
            <Text style={facultyStudentView.sectionTitle}>Activity Tracking</Text>
            <StudentActivityTrackingCard studentId={studentId} />
          </View>

          {/* REFRESH */}
          {/* <TouchableOpacity style={facultyStudentView.refreshButton} onPress={refresh}>
            <Text style={facultyStudentView.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

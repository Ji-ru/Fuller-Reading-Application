import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import upperNav from '../../UI_Designs/UpperNavigation';
import { useNavigationHelper } from '../../Controller/NavigationController';
import StudentAccuracyTrendsChart from '../../Components/Faculty/StudentView_Status/Student_Accuracy_Chart';
import StudentMiscueAnalytics from '../../Components/Faculty/StudentView_Status/Student_MiscueChart';
import StudentTopMiscuePassageAndWords from '../../Components/Faculty/StudentView_Status/Student_TopPassage&TopWords';
import StudentActivityTrackingCard from '../../Components/Faculty/StudentView_Status/Student_TimeTrack';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import StudentAlphabetMastery from '../../Components/Faculty/StudentView_Status/StudentAlphabetMastery';
import StudentWordMastery from '../../Components/Faculty/StudentView_Status/StudentWordMastery';
import StudentTotalActivityToday from '../../Components/Faculty/StudentView_Status/StudentTotalActivityToday';
import facultyStudentView from '../../UI_Designs/FacultyStudentViewStyles';

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
  };
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function StudentViewProfile() {
  const route = useRoute<RouteProp<RouteParams, 'StudentViewProfile'>>();
  const { studentId, studentName, readingLevel } = route.params;

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
          <View style={upperNav.header}>
            <TouchableOpacity
              style={upperNav.touchable}
              onPress={handleBackStep}
            >
              <Image
                style={upperNav.backButtonIcon}
                source={require('../../../assets/icons/BackButton-icon.png')}
              />
            </TouchableOpacity>

            <Text style={facultyStudentView.headerTitle}>Student Reading Profile</Text>

            <View style={{ width: 40 }} />
          </View>

          {/* STUDENT SUMMARY */}
          <View style={facultyStudentView.profileHeader}>
            <Text style={facultyStudentView.studentName}>{studentName}</Text>
            <Text style={facultyStudentView.studentMeta}>
              Reading Level: {readingLevel}
            </Text>
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

          {/* READING STATISTICS */}
          <View style={facultyStudentView.section}>
            <Text style={facultyStudentView.sectionTitle}>Reading Statistics</Text>
            <StudentMiscueAnalytics studentId={studentId} />
            <StudentTopMiscuePassageAndWords studentId={studentId} />
          </View>

          {/* PROGRESS */}
          <View style={facultyStudentView.section}>
            <Text style={facultyStudentView.sectionTitle}>Reading Progress</Text>
            <StudentAccuracyTrendsChart studentId={studentId} />
            {/* <WPMChart data={progress} />
            <PerformanceSummary data={progress} /> */}
          </View>

          <StudentActivityTrackingCard studentId={studentId} />

          {/* REFRESH */}
          {/* <TouchableOpacity style={facultyStudentView.refreshButton} onPress={refresh}>
            <Text style={facultyStudentView.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

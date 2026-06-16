import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, useNavigationHelper } from '../../Controller/NavigationController';
import upperNav from '../../UI_Designs/UpperNavigation';
import Sidebar from '../../Components/GlobalUse/Sidebar';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import adminViewFacultyAdmin from '../../UI_Designs/AdminViewFaculty_AdminStyles';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getForStudentsMiscueStats } from '../../Hooks/use_ForStudentMiscueStats';
import ActiveHoursChart from '../../Components/Faculty/Dashboard/ActiveHoursChart';
import MiscueAnalytics from '../../Components/Faculty/Dashboard/MiscueChart';
import AccuracyTrendsChart from '../../Components/Faculty/Dashboard/AccuracyTrends';
import NumberOfClassesAndStudents from '../../Components/Faculty/Dashboard/NumberOFClassesAndStudents';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
// import ClassAlphabetMastery from '../../Components/Faculty/Dashboard/ClassAlphabetMastery';
import ClassWordMastery from '../../Components/Faculty/Dashboard/ClassWordMastery';
import { buildAdminMenuItems } from '../../Utilities/adminMenuItems';

/**
 * BASIC INFORMATION
 *  - First Name
 *  - Middle Name
 *  - Last Name
 *  - Email
 *  - Sex
 *  - Birthdate
 * 
 * ACADEMIC INFORMATION BASED ON FACULTY DASHBOARD  
 *  - Total Classes
 *  - Total Students
 *  - Class Reading Status
 *  - Alphabet Mastery
 *  - Word Mastery
 *  - Activity Tracking
 *  - Common Miscue Type
 *  - Overall Reading Statistics
 *  - Top Miscue Passage
 *  - Most Common Miscue Words
 * 
 */

type ReadingActivityScreenRouteProp = RouteProp<
    RootStackParamList,
    'AdminViewFacultyData'
>;

export default function AdminViewFacultyData() {
    // Ref: Store a retry timeout id for feedback modal
    const route = useRoute<ReadingActivityScreenRouteProp>();
    const { facultyId, facultyName } = route.params;

    console.log('facultyId', facultyId);
    // STATE MANAGEMENT
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
    const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState<{
        classCount: number;
        studentCount: number;
    }>({ classCount: 0, studentCount: 0 });
    const [filter, setFilter] = useState({
        academicYear: '2023-2024', // Set a default
        selectedView: 'overall'
    });
    const handleFilterChange = (newFilter: { academicYear: string; selectedView: string }) => {
        setFilter(newFilter);
    };
    // HOOKS
    const { handleLogout, handleBackStep, handleReplaceStep } = useNavigationHelper();
    const { getNumberOfClasses, getNumbersOfAllStudents } = getForStudentsMiscueStats();

    const menuItems = buildAdminMenuItems(handleReplaceStep);

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    /**
     * Counts the number of current classes and students of the faculty
     */
    const fetchStats = async () => {
        try {
            const slectedFacultyId = facultyId;

            if (!slectedFacultyId) {
                throw new Error('No authenticated user found');
            }

            // Fetch both counts in parallel for better performance
            const [classCount, studentCount] = await Promise.all([
                getNumberOfClasses(slectedFacultyId),
                getNumbersOfAllStudents(slectedFacultyId),
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

    // EVENT HANDLERS
    const toggleMenu = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const handleLogoutPress = () => {
        setSidebarVisible(false);
        setLogoutVisible(true);
    };

    const confirmLogout = async () => {
        setLogoutVisible(false);
        await handleLogout();
    };

    const cancelLogout = () => {
        setLogoutVisible(false);
    };
    return (
        <SafeAreaView>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    {/* BUBBLE BACKGROUND DECORATION */}
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
                        {/* <Image
                            style={upperNav.ciscLogo}
                            source={require('../../../assets/images/cisckids.png')}
                        /> */}
                        <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
                            <Image
                                style={upperNav.menuIcon}
                                source={require('../../../assets/icons/Menu-icon.png')}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* SIDEBAR */}
                    <Sidebar
                        visible={sidebarVisible}
                        onClose={() => setSidebarVisible(false)}
                        onLogout={handleLogoutPress}
                        currentRoute="user-management"
                        menuItems={menuItems}
                    />

                    {/* LOGOUT MODAL */}
                    <LogoutModal
                        visible={logoutVisible}
                        onCancel={cancelLogout}
                        onConfirm={confirmLogout}
                    />

                    {/* MAIN CONTENT */}
                    <View style={adminViewFacultyAdmin.content}>
                        <NumberOfClassesAndStudents
                            loading={loading}
                            classCount={stats.classCount}
                            studentCount={stats.studentCount}
                        />

                        {/* <ClassAlphabetMastery facultyId={facultyId} filter={filter} /> */}

                        <ClassWordMastery facultyId={facultyId} filter={filter} />


                        <AccuracyTrendsChart facultyId={facultyId} filter={filter} />

                        <ActiveHoursChart facultyId={facultyId} filter={filter} />

                        <MiscueAnalytics facultyId={facultyId} filter={filter} />

                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import myStudents from '../../UI_Designs/MyStudentsStyle';
import upperNav from '../../UI_Designs/UpperNavigation';
import { RootStackParamList } from '../../Controller/NavigationController';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  UserDocument,
  // ─── Added for student acceptance or rejection to a class by faculty ───
  EnrollmentRequestDocument,
  // ─── End ──────────────────────────────────────────────────────────────
} from '../../Interfaces/dataInterfaces';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';
import { FacultyColors } from '../../Utilities/Theme';
import { Icon } from '../../Components/GlobalUse/Icon';
// ─── Added for student acceptance or rejection to a class by faculty ───────
import { getAuth } from '@react-native-firebase/auth';
import {
  getPendingRequestsForClass,
  acceptEnrollmentRequest,
  rejectEnrollmentRequest,
} from '../../Controller/AuthenticationController';
// ─── End ──────────────────────────────────────────────────────────────────

const ACCENT_COLORS_FACULTY = [
  FacultyColors.primary,
  FacultyColors.teal,
  FacultyColors.orange,
  FacultyColors.purple,
];

const C = {
  ink: '#1b2e23',
  white: '#ffffff',
  coral: '#e74c3c',
  green: '#2ca96a',
  darkBlue: '#163F6C',
  slate: '#9CA3AF',
  inkLight: '#6B7280',
};

function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  menuBtn: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  backBtn: {
    width: 45, height: 45, borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40, fontFamily: 'Nunito-Bold',
    color: C.white, lineHeight: 28, marginLeft: -2, paddingBottom: 2
  },
  dropdown: {
    position: 'absolute', top: 72, right: 20,
    backgroundColor: C.white, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 12, elevation: 10,
    minWidth: 160, zIndex: 1000, paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownIcon: { width: 20, height: 20, marginRight: 12, tintColor: C.coral },
  dropdownText: { fontSize: 15, fontFamily: 'Nunito-Bold', color: C.coral },
  dropdownTextAbout: { fontSize: 15, fontFamily: 'Nunito-Bold', color: C.slate, marginLeft: 12 },
  dropdownDivider: { height: 1, marginHorizontal: 12, backgroundColor: '#E3F0E7' },
});

// ─── Added for student acceptance or rejection to a class by faculty ─────────
const pendingStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito-ExtraBold',
    color: '#1B2B22',
    marginLeft: 8,
  },
  badge: {
    minWidth: 24,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeText: { fontSize: 12, fontFamily: 'Nunito-ExtraBold', color: '#FFFFFF' },
  chevron: { fontSize: 18, color: '#91A89B' },
  divider: { height: 1, backgroundColor: '#F1F5F2', marginVertical: 8 },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 14, fontFamily: 'Nunito-ExtraBold', color: '#008443' },
  requestName: { flex: 1, fontSize: 14, fontFamily: 'Nunito-Bold', color: '#1B2B22' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  acceptBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#008443',
  },
  acceptText: { fontSize: 13, fontFamily: 'Nunito-Bold', color: '#FFFFFF' },
  rejectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FDECEE',
    borderWidth: 1,
    borderColor: '#F8D7DA',
  },
  rejectText: { fontSize: 13, fontFamily: 'Nunito-Bold', color: '#D64550' },
  busyBtn: { opacity: 0.6 },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Nunito-Medium',
    color: '#91A89B',
    paddingVertical: 8,
    textAlign: 'center',
  },
});
// ─── End ────────────────────────────────────────────────────────────────────

type MyStudentsRouteProp = RouteProp<RootStackParamList, 'MyStudents'>;

export default function MyStudents() {
  // ========================================================================
  // GET NAVIGATION PARAMETERS
  // ========================================================================
  const route = useRoute<MyStudentsRouteProp>();
  const { classId, className, classCode, acadYear } = route.params;

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<UserDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<UserDocument[]>([]);

  // ─── Added for student acceptance or rejection to a class by faculty ───────
  const facultyId = getAuth().currentUser?.uid || '';
  const [pendingRequests, setPendingRequests] = useState<EnrollmentRequestDocument[]>([]);
  const [pendingExpanded, setPendingExpanded] = useState(true);
  const [actingOnRequestId, setActingOnRequestId] = useState<string | null>(null);
  // ─── End ──────────────────────────────────────────────────────────────────

  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleBackStep, handleLogout, handleStudentViewStats, handleNextStep } = useNavigationHelper();

  // ========================================================================
  // FETCH STUDENTS
  // ========================================================================
  const fetchFacultyStudents = useCallback(async () => {
    try {
      setLoading(true);
      const studentList = await getFacultyClasses_Student.getStudentsInClass(
        classCode
      );
      setStudents(studentList);
      setFilteredStudents(studentList);
    } catch (error: any) {
      throw new Error('Failed to fetch students. ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [classCode]);

  useEffect(() => {
    fetchFacultyStudents();
  }, [fetchFacultyStudents]);

  // ─── Added for student acceptance or rejection to a class by faculty ───────
  const fetchPendingRequests = useCallback(async () => {
    if (!classId) return;
    try {
      const reqs = await getPendingRequestsForClass(classId);
      setPendingRequests(reqs);
    } catch (error: any) {
      console.error('Failed to fetch pending requests:', error);
    }
  }, [classId]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleAcceptRequest = useCallback(
    async (request: EnrollmentRequestDocument) => {
      if (actingOnRequestId) return;
      setActingOnRequestId(request.requestId);
      try {
        await acceptEnrollmentRequest(request.requestId, facultyId);
        // Refresh both pending list and the enrolled-students roster.
        await Promise.all([fetchPendingRequests(), fetchFacultyStudents()]);
      } catch (error: any) {
        console.error('Accept request failed:', error);
      } finally {
        setActingOnRequestId(null);
      }
    },
    [actingOnRequestId, facultyId, fetchPendingRequests, fetchFacultyStudents],
  );

  const handleRejectRequest = useCallback(
    async (request: EnrollmentRequestDocument) => {
      if (actingOnRequestId) return;
      setActingOnRequestId(request.requestId);
      try {
        // Reason is optional — left blank for now; a confirm dialog could prompt later.
        await rejectEnrollmentRequest(request.requestId, facultyId);
        await fetchPendingRequests();
      } catch (error: any) {
        console.error('Reject request failed:', error);
      } finally {
        setActingOnRequestId(null);
      }
    },
    [actingOnRequestId, facultyId, fetchPendingRequests],
  );
  // ─── End ──────────────────────────────────────────────────────────────────

  // ========================================================================
  // SEARCH FILTER
  // ========================================================================
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => {
        const fullName = `${student.firstName} ${student.middleName ?? ''} ${student.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  // ========================================================================
  // RENDER STUDENT ITEM
  // ========================================================================
  const renderStudentItem = ({ item, index }: { item: UserDocument; index: number }) => (
    <TouchableOpacity
      style={myStudents.studentCard}
      onPress={() =>
        handleStudentViewStats({
          studentId: item.uid,
          studentName: `${item.firstName} ${item.middleName ?? ''} ${
            item.lastName
          }`.trim(),
          readingLevel: item.studentData?.reading_Level || 'N/A',
          gradeLevel: item.studentData?.gradeLevel ?? 1,
        })
      }
      activeOpacity={0.7}
    >
      <View style={myStudents.studentCardContent}>
        {/* Profile Image/Initial */}
        {item.profileImageUrl ? (
          <Image
            source={{ uri: item.profileImageUrl }}
            style={myStudents.profileImage}
          />
        ) : (
          <View style={[myStudents.defaultProfile, { backgroundColor: ACCENT_COLORS_FACULTY[index % ACCENT_COLORS_FACULTY.length] }]}>
            <Text style={myStudents.defaultProfileText}>
              {item.firstName?.charAt(0)}
              {item.lastName?.charAt(0)}
            </Text>
          </View>
        )}

        {/* Student Info */}
        <View style={myStudents.studentInfo}>
          <Text style={myStudents.studentName} numberOfLines={1}>
            {item.firstName} {item.middleName} {item.lastName}
          </Text>
          <View style={myStudents.detailsRow}>
            <View style={myStudents.detailChip}>
              <Text style={myStudents.detailLabel}>Grade</Text>
              <Text style={myStudents.detailValue}>
                {item.studentData?.gradeLevel || 'N/A'}
              </Text>
            </View>
            <View style={myStudents.detailChip}>
              <Text style={myStudents.detailLabel}>Reading Level</Text>
              <Text style={myStudents.detailValue}>
                {item.studentData?.reading_Level || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Arrow Icon */}
        <View style={myStudents.arrowContainer}>
          <Text style={myStudents.arrowIcon}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setLogoutVisible(false);
  };

  // ========================================================================
  // RENDER LOADING STATES
  // ========================================================================
  if (loading) {
    return (
      <SafeAreaView style={myStudents.container}>
        <View style={myStudents.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={myStudents.loadingText}>Loading students...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={myStudents.container}>
      <View style={myStudents.insideContainer}>
        {/* BUBBLE DECORATIONS */}
        <BubbleBackground />

        {/* HEADER */}
        <View style={{ zIndex: 100 }}>
          <View style={upperNav.header}>
            <TouchableOpacity style={headerStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
              <Text style={headerStyles.backArrowText}>‹</Text>
            </TouchableOpacity>
            <Svg height={60} width={220}>
              <SvgText
                x={110}                 // center X
                y={35}                  // baseline Y
                fontSize={23}
                fontFamily="Nunito-Black"
                textAnchor="middle"     // center align
                fill="none"          // inside color
                stroke="#E8F5E9"        // outline color
                strokeWidth={8}         // outline thickness
                strokeLinejoin='round'
              >
                {className || 'My Students'}
              </SvgText>
              <SvgText
                x={110}
                y={35}
                fontSize={23}
                fontFamily="Nunito-Black"
                textAnchor="middle"
                fill="#1B5E20"
              >
                {className || 'My Students'}
              </SvgText>
            </Svg>
            <TouchableOpacity style={headerStyles.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
              <MenuBars />
            </TouchableOpacity>
          </View>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <View style={headerStyles.dropdown}>
            <TouchableOpacity
              onPress={() => { setMenuVisible(false); handleNextStep('About'); }}
              style={headerStyles.dropdownItem}
              activeOpacity={0.75}
            >
              <Icon name="info" size={20} color={C.slate} filled />
              <Text style={headerStyles.dropdownTextAbout}>About</Text>
            </TouchableOpacity>
            <View style={headerStyles.dropdownDivider} />
            <TouchableOpacity onPress={handleLogoutPress} style={headerStyles.dropdownItem} activeOpacity={0.75}>
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={headerStyles.dropdownIcon}
              />
              <Text style={headerStyles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}


        {/* LOGOUT MODAL */}
        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        {/* MAIN CONTENT */}
        <View style={myStudents.content}>
          {/* CLASS INFO HEADER */}
          <View style={myStudents.classInfoHeader}>
            <View style={myStudents.classInfoColorStrip} />
            <View style={myStudents.classInfoBody}>
              <Text style={myStudents.className} numberOfLines={2}>
                {className || 'Class Details'}
              </Text>
              <View style={myStudents.classMetaRow}>
                <View style={myStudents.classMetaChip}>
                  <Text style={myStudents.classMetaLabel}>SY</Text>
                  <Text style={myStudents.classMetaValue}>{acadYear}</Text>
                </View>
                {classCode && (
                  <View style={myStudents.classMetaChip}>
                    <Text style={myStudents.classMetaLabel}>Code</Text>
                    <Text style={myStudents.classMetaValue}>{classCode}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ─── Added for student acceptance or rejection to a class by faculty ─── */}
          {pendingRequests.length > 0 && (
            <View style={pendingStyles.card}>
              <TouchableOpacity
                style={pendingStyles.headerRow}
                onPress={() => setPendingExpanded(prev => !prev)}
                activeOpacity={0.7}
              >
                <Icon name="inbox" size={20} color="#C77700" filled />
                <Text style={pendingStyles.headerTitle}>Pending Requests</Text>
                <View style={pendingStyles.badge}>
                  <Text style={pendingStyles.badgeText}>{pendingRequests.length}</Text>
                </View>
                <Text style={pendingStyles.chevron}>{pendingExpanded ? '▾' : '▸'}</Text>
              </TouchableOpacity>

              {pendingExpanded && (
                <>
                  <View style={pendingStyles.divider} />
                  {pendingRequests.map(req => {
                    const isBusy = actingOnRequestId === req.requestId;
                    const initials = req.studentName
                      .split(' ')
                      .filter(Boolean)
                      .map(p => p.charAt(0).toUpperCase())
                      .slice(0, 2)
                      .join('');
                    return (
                      <View key={req.requestId} style={pendingStyles.requestRow}>
                        <View style={pendingStyles.avatar}>
                          <Text style={pendingStyles.avatarText}>{initials || '?'}</Text>
                        </View>
                        <Text style={pendingStyles.requestName} numberOfLines={1}>
                          {req.studentName}
                        </Text>
                        <View style={pendingStyles.actions}>
                          <TouchableOpacity
                            style={[pendingStyles.rejectBtn, isBusy && pendingStyles.busyBtn]}
                            disabled={isBusy}
                            onPress={() => handleRejectRequest(req)}
                            activeOpacity={0.8}
                          >
                            <Text style={pendingStyles.rejectText}>Reject</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[pendingStyles.acceptBtn, isBusy && pendingStyles.busyBtn]}
                            disabled={isBusy}
                            onPress={() => handleAcceptRequest(req)}
                            activeOpacity={0.8}
                          >
                            {isBusy ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={pendingStyles.acceptText}>Accept</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          )}
          {/* ─── End ──────────────────────────────────────────────────────────── */}

          {/* SEARCH BAR */}
          <View style={myStudents.searchContainer}>
            <Image
              source={require('../../../assets/icons/Search-icon.png')}
              style={myStudents.searchIcon}
            />
            <TextInput
              style={myStudents.searchInput}
              placeholder="Search students..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={myStudents.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* STUDENT COUNT */}
          <View style={myStudents.studentCountContainer}>
            <Text style={myStudents.studentCount}>
              {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''}
            </Text>
            {searchQuery.length > 0 && filteredStudents.length !== students.length && (
              <Text style={myStudents.studentCountSubtext}>
                of {students.length} total
              </Text>
            )}
          </View>

          {/* STUDENTS LIST */}
          <View style={myStudents.studentListWrapper}>
            {filteredStudents.length > 0 ? (
              <FlatList
                data={filteredStudents}
                renderItem={renderStudentItem}
                keyExtractor={item => item.uid}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={myStudents.listContent}
              />
            ) : (
              <View style={myStudents.emptyContainer}>
                <Text style={myStudents.emptyIcon}>🔍</Text>
                <Text style={myStudents.emptyTitle}>
                  {searchQuery ? 'No students found' : 'No students enrolled'}
                </Text>
                <Text style={myStudents.emptyText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Students will appear here once they join this class'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
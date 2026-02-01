import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import myStudents from '../../UI_Designs/MyStudentsStyle';
import bubbles from '../../UI_Designs/BubblesDesign';
import upperNav from '../../UI_Designs/UpperNavigation';
import { RootStackParamList } from '../../Controller/NavigationController';
import { useRoute, RouteProp } from '@react-navigation/native';
import { UserDocument } from '../../Interfaces/dataInterfaces';

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

  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleBackStep, handleLogout, handleStudentViewStats } = useNavigationHelper();

  // ========================================================================
  // FETCH STUDENTS
  // ========================================================================
  const fetchFacultyStudents = useCallback(async () => {
    try {
      setLoading(true);
      const studentList = await getFacultyClasses_Student.getStudentsInClass(
        classCode,
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
      style={[myStudents.studentCard, { marginTop: index === 0 ? 0 : 12 }]}
      onPress={() =>
        handleStudentViewStats({
          studentId: item.uid,
          studentName: `${item.firstName} ${item.middleName ?? ''} ${
            item.lastName
          }`.trim(),
          readingLevel: item.studentData?.reading_Level || 'N/A',
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
          <View style={myStudents.defaultProfile}>
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
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>

        {/* HEADER */}
        <View style={upperNav.header}>
          <TouchableOpacity
            style={upperNav.touchable}
            onPress={handleBackStep}
          >
            <Image
              source={require('../../../assets/icons/BackButton-icon.png')}
            />
          </TouchableOpacity>
          <Image
            style={upperNav.ciscLogo}
            source={require('../../../assets/images/cisckids.png')}
          />
          <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
            <Image
              style={upperNav.menuIcon}
              source={require('../../../assets/icons/Menu-icon.png')}
            />
          </TouchableOpacity>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity
              onPress={handleLogoutPress}
              style={upperNav.logoutButton}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={upperNav.logoutIcon}
              />
              <Text style={upperNav.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OVERLAY TO CLOSE MENU */}
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
            <View style={myStudents.classInfoMain}>
              <Text style={myStudents.className} numberOfLines={2}>
                {className || 'Class Details'}
              </Text>
              <View style={myStudents.classMetaRow}>
                <View style={myStudents.classMetaItem}>
                  <Text style={myStudents.classMetaLabel}>Academic Year</Text>
                  <Text style={myStudents.classMetaValue}>{acadYear}</Text>
                </View>
                {classCode && (
                  <View style={myStudents.classMetaItem}>
                    <Text style={myStudents.classMetaLabel}>Class Code</Text>
                    <Text style={myStudents.classMetaValue}>{classCode}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

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
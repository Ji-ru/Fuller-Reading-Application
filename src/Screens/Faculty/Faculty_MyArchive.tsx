import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { getAuth } from '@react-native-firebase/auth';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { useFocusEffect } from '@react-navigation/native';
// ─── Added for studentIds/assignedClassIds source-of-truth refactor ────────
// Archive view now fetched via getAssignedClasses (filtered by status='archived')
// rather than the previous facultyId-only realtime listener.
import { unarchiveClass, getAssignedClasses, deleteClassByFaculty } from '../../Controller/AuthenticationController';
// ─── End ──────────────────────────────────────────────────────────────────
import myClass from '../../UI_Designs/MyClassStyles';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';
import { Icon } from '../../Components/GlobalUse/Icon';
import { sw } from '../../Utils/responsive';
import { FacultyColors } from '../../Utilities/Theme';

export default function MyArchive() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [ellipsisVisible, setEllipsisVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDocument | null>(null);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { handleLogout, handleClassStudents, handleNextStep } = useNavigationHelper();
  const ignoreNextTouchRef = useRef(false);
  const currentUser = getAuth().currentUser;

  // ========================================================================
  // FETCH CLASSES
  // ─── Modified for studentIds/assignedClassIds source-of-truth refactor ──
  // One-shot fetch via assignedClassIds, then filter to archived. Manual
  // refresh after unarchive to keep the list in sync.
  // ─── End ────────────────────────────────────────────────────────────────
  // ========================================================================
  const fetchClasses = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const all = await getAssignedClasses(currentUser.uid);
      setClasses(all.filter(c => c.status === 'archived'));
    } catch (error: any) {
      console.error('Failed to fetch archived classes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      fetchClasses();
    }, [fetchClasses])
  );

  // ========================================================================
  // EVENT HANDLER
  // ========================================================================
  useEffect(() => {
    if (ellipsisVisible) {
      ignoreNextTouchRef.current = false;
    }
  }, [ellipsisVisible]);
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

  const handleContentTouch = () => {
    if (ellipsisVisible) {
      setEllipsisVisible(false);
      setSelectedClass(null);
    }
  };

  const handleEllipsisPress = (event: any, item: ClassDocument) => {
    event.target.measure(
      (
        fx: number,
        fy: number,
        width: number,
        height: number,
        px: number,
        py: number,
      ) => {
        const screenWidth = Dimensions.get('window').width;
        setMenuPosition({
          // Anchor right edge of menu to right edge of ellipsis button
          x: screenWidth - (px + width),
          y: py + height,
        });
        setSelectedClass(item);
        setEllipsisVisible(true);
      },
    );
  };

  const handleEllipsisClose = () => {
    setEllipsisVisible(false);
    setSelectedClass(null);
    setMenuPosition({ x: 0, y: 0 });
  };

  const handleUnarchivePress = async (classItem: ClassDocument) => {
    Alert.alert(
      'Unarchive Class',
      `Are you sure you want to unarchive "${classItem.className}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unarchive',
          style: 'destructive',
          onPress: async () => {
            try {
              await unarchiveClass(classItem.classId);
              Alert.alert('Success', 'Class unarchived successfully');
              // ─── Added for studentIds/assignedClassIds source-of-truth refactor ──
              await fetchClasses();
              // ─── End ─────────────────────────────────────────────────────────────
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to unarchive class');
            } finally {
              setIsUnarchiving(false);
            }
          },
        },
      ],
    );
  };

  const renderClassItem = ({
    item,
    index,
  }: {
    item: ClassDocument;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        myClass.classCard,
        myClass.archivedClassCard, // Add archived card style
      ]}
      onPress={() => {
        if (ellipsisVisible) {
          setEllipsisVisible(false);
          setSelectedClass(null);
        }
        handleClassStudents({
          classId: item.classId,
          className: item.className,
          classCode: item.classCode,
          acadYear: item.acadYear,
        });
      }}
      activeOpacity={0.7}
    >
      <View style={[myClass.classCardContent, myClass.archivedClassCardContent]}>
        {/* Class Icon */}
        <View style={[myClass.classIconContainer, myClass.archivedClassIconContainer]}>
          <Text style={[myClass.classIcon, myClass.archivedClassIcon]}>📚</Text>
        </View>

        {/* Class Info */}
        <View style={myClass.classInfo}>
          <Text style={[myClass.className, myClass.archivedClassName]} numberOfLines={1}>
            {item.className}
            <Text style={myClass.classMetaValue}> ({item.acadYear})</Text>
          </Text>

          <View style={myClass.classMetaRow}>
            <View style={[myClass.classMetaChip, myClass.archivedMetaChip]}>
              <Text style={[myClass.classMetaLabel, myClass.archivedMetaLabel]}>Grade</Text>
              <Text style={[myClass.classMetaValue, myClass.archivedMetaValue]}>{item.gradeLevel}</Text>
            </View>
            <View style={[myClass.classMetaChip, myClass.archivedMetaChip]}>
              <Text style={[myClass.classMetaLabel, myClass.archivedMetaLabel]}>Code</Text>
              <Text style={[myClass.classMetaValue, myClass.archivedMetaValue]}>{item.classCode}</Text>
            </View>
          </View>
        </View>

        {/* Ellipsis Button */}
        <TouchableOpacity
          style={[myClass.ellipsisButton, myClass.archivedEllipsisButton]}
          onPress={event => handleEllipsisPress(event, item)}
        >
          <Image
            style={myClass.ellipsisIcon}
            source={require('../../../assets/icons/Ellipsis-icon.png')}
          />
        </TouchableOpacity>
      </View>

      {/* Archived Overlay Effect */}
      <View style={myClass.archivedOverlay} />
    </TouchableOpacity>
  );

  const handleDeletePress = async (classItem: ClassDocument) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classItem.className}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // ─── Modified for studentIds/assignedClassIds source-of-truth refactor ──
              // Uses deleteClassByFaculty (atomic batch: assignedClassIds + class doc).
              // ─── End ───────────────────────────────────────────────────────────────
              await deleteClassByFaculty(
                classItem.classId,
                currentUser?.uid || '',
              );
              Alert.alert(
                'Success',
                `Class "${classItem.className || classItem.classId}" deleted successfully.`,
              );
              await fetchClasses();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete class');
            }
            setEllipsisVisible(false);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={myClass.container}>
      {ellipsisVisible && (
        <TouchableOpacity
          style={myClass.fullScreenOverlay}
          onPress={handleEllipsisClose}
          activeOpacity={1}
        />
      )}
      <View style={myClass.insideContainer}>
        {/* BUBBLE DECORATIONS */}
        <BubbleBackground />

        {/* UNIFIED HEADER ROW: spacer | SVG title | menu button */}
        <View style={facultyDashboard.header}>
          {/* Left spacer balances the menu button so title is truly centered */}
          <View style={{ width: 44 }} />

          {/* SVG outlined title */}
          <Svg height={56} width={220}>
            {/* Stroke layer — outline effect */}
            <SvgText
              x={110} y={38} fontSize={24}
              fontFamily="Satoshi-Black" textAnchor="middle"
              fill="none"
              stroke="#E8F5EE"
              strokeWidth={8}
              strokeLinejoin="round"
            >
              My Archive
            </SvgText>
            {/* Fill layer — drawn on top */}
            <SvgText
              x={110} y={38} fontSize={24}
              fontFamily="Satoshi-Black" textAnchor="middle"
              fill="#1B2B22"
            >
              My Archive
            </SvgText>
          </Svg>

          {/* Right: hamburger menu button */}
          <TouchableOpacity
            style={facultyDashboard.menuBtn}
            onPress={() => setMenuVisible(v => !v)}
            activeOpacity={0.7}
          >
            <MenuBars />
          </TouchableOpacity>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject as any}
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

        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        <View style={myClass.content}>
          {/* ELLIPSIS CONTEXT MENU */}
          {ellipsisVisible && selectedClass && (
            <>
              <TouchableOpacity
                style={myClass.overlay}
                onPress={handleEllipsisClose}
                activeOpacity={1}
              />
              <View
                style={[
                  myClass.contextMenu,
                  { top: menuPosition.y, right: menuPosition.x },
                ]}
                pointerEvents="box-none"
              >
                {/* UNARCHIVE CLASS */}
                <TouchableOpacity
                  style={[myClass.contextMenuItem, myClass.archiveMenuItem]}
                  onPress={() => handleUnarchivePress(selectedClass)}
                >
                  <Image
                    source={require('../../../assets/icons/Archive-icon.png')}
                    style={myClass.contextMenuIcon}
                  />
                  <Text
                    style={myClass.contextMenuText}
                  >
                    Unarchive Class
                  </Text>
                </TouchableOpacity>

                {/* DELETE CLASS */}
                <TouchableOpacity
                  style={[myClass.contextMenuItem, myClass.deleteMenuItem]}
                  onPress={() => handleDeletePress(selectedClass)}
                >
                  <Image
                    source={require('../../../assets/icons/Delete-icon.png')}
                    style={myClass.contextMenuIcon}
                  />
                  <Text
                    style={[myClass.contextMenuText, myClass.deleteMenuText]}
                  >
                    Delete Class
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* CLASS COUNT */}
          {classes.length > 0 && (
            <Text style={myClass.classCount}>
              {classes.length} Class{classes.length !== 1 ? 'es' : ''}
            </Text>
          )}

          {/* CLASSES LIST */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleContentTouch}
            style={myClass.listWrapper}
          >
            <View style={myClass.classListContainer}>
              {loading ? (
                <View style={myClass.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={myClass.loadingText}>Loading classes...</Text>
                </View>
              ) : classes.length > 0 ? (
                <FlatList
                  data={classes}
                  renderItem={renderClassItem}
                  keyExtractor={item => item.classId}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={myClass.listContent}
                />
              ) : (
                <View style={myClass.emptyContainer}>
                  <Text style={myClass.emptyIcon}>📖</Text>
                  <Text style={myClass.emptyTitle}>Empty</Text>
                  <Text style={myClass.emptyText}>
                    No Archived Classes
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Hamburger icon ───────────────────────────────────────────────────────────
function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
    </View>
  );
}

import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { getAuth } from '@react-native-firebase/auth';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { unarchiveClass } from '../../Controller/AuthenticationController';
import myClass from '../../UI_Designs/MyClassStyles';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';

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
  const { handleLogout, handleClassStudents } = useNavigationHelper();
  const ignoreNextTouchRef = useRef(false);
  const currentUser = getAuth().currentUser;

  // ========================================================================
  // FETCH CLASSES
  // ========================================================================
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe =
      getFacultyClasses_Student.getToFacultyClassesRealTime(
        currentUser.uid,
        classes => {
          setClasses(classes.filter(c => c.status === 'archived'));
          setLoading(false);
        },
      );

    return unsubscribe;
  }, [currentUser]);

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
        setMenuPosition({
          x: px - 100,
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
        { marginTop: index === 0 ? 0 : 12 }
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
              const result = await getFacultyClasses_Student.deleteClass(
                classItem.classId,
              );
              if (result.success) {
                Alert.alert('Success', result.message);
              }
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


        {/* HEADER */}
        <View style={upperNav.header}>
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

        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
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
                  { top: menuPosition.y, left: menuPosition.x },
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

          {/* HEADER SECTION */}
          <View style={myClass.headerSection}>
            <Text style={myClass.pageTitle}>My Archive</Text>
            <Text style={myClass.pageSubtitle}>
              Manage and organize your archived classes
            </Text>
          </View>

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

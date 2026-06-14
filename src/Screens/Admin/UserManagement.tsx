import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, TextInput, ActivityIndicator, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminSideMenu from '../../Components/Admin/AdminSideMenu';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { updateUserProfile, deleteUserDocument } from '../../Controller/AuthenticationController';
import { useGetUsers } from '../../Hooks/Admin_use_getAllUsers';
import { UserDocument, UserRole } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import adminUserManagment from '../../UI_Designs/AdminUserManagementStyles';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { BurgerIcon, SearchIcon, PencilIcon, TrashIcon, MoreVerticalIcon } from '../../Components/GlobalUse/Icons';

const PAGE_SIZE = 20;

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return F.primary;
    case 'faculty': return F.red;
    case 'student': return F.sky;
    default: return F.slate;
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'student': return '🎓';
    case 'faculty': return '👨‍🏫';
    case 'admin': return '👤';
    default: return '👤';
  }
};

export default function UserManagement() {
  const { users, loading, error, hasMore, fetchUsers, resetUsers, loadMore } = useGetUsers();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDocument | null>(null);
  const [optionsMenuUid, setOptionsMenuUid] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editMiddleName, setEditMiddleName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSex, setEditSex] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editGradeLevel, setEditGradeLevel] = useState(1);
  const [editAssignedGradeLevels, setEditAssignedGradeLevels] = useState<number[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const { handleLogout, handleNavigateStep } = useNavigationHelper();

  const toggleMenu = () => setSidebarVisible(!sidebarVisible);
  const handleLogoutPress = () => { setSidebarVisible(false); setLogoutVisible(true); };
  const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    resetUsers();
    fetchUsers(selectedRole, searchDebounce || undefined);
  }, [selectedRole, searchDebounce]);

  const handleRoleFilter = (role?: UserRole) => {
    setSelectedRole(role);
  };

  const handleLoadMore = () => {
    if (!searchDebounce && hasMore) {
      loadMore();
    }
  };

  const handleRefresh = async () => {
    resetUsers();
    await fetchUsers(selectedRole, searchDebounce || undefined);
  };

  const handleUserPress = () => {
    setOptionsMenuUid(null);
  };

  const handleOptionsPress = (user: UserDocument) => {
    setOptionsMenuUid(optionsMenuUid === user.uid ? null : user.uid);
  };

  const handleEditPress = (user: UserDocument) => {
    setSelectedUser(user);
    setEditFirstName(user.firstName || '');
    setEditMiddleName(user.middleName || '');
    setEditLastName(user.lastName || '');
    setEditEmail(user.email || '');
    const normalizedSex = (user.sex || '').toLowerCase() === 'male' ? 'male' : (user.sex || '').toLowerCase() === 'female' ? 'female' : '';
    setEditSex(normalizedSex);
    setEditBirthdate(
      (user.role === 'student' && user.studentData?.dateOfBirth) ||
      (user.role === 'faculty' && user.facultyData?.dateOfBirth) ||
      ''
    );
    if (user.role === 'student' && user.studentData) {
      setEditGradeLevel(user.studentData.gradeLevel || 1);
    }
    if (user.role === 'faculty' && user.facultyData) {
      setEditAssignedGradeLevels(user.facultyData.assignedGradeLevels || []);
    }
    setEditModalVisible(true);
  };

  const handleDeletePress = (user: UserDocument) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      Alert.alert('Maling Input', 'Punan ang lahat ng field.');
      return;
    }

    try {
      setEditLoading(true);
      const updateData: any = {
        firstName: editFirstName,
        middleName: editMiddleName,
        lastName: editLastName,
        email: editEmail,
        sex: editSex,
      };

      if (selectedUser?.role === 'student') {
        if (editGradeLevel !== undefined) {
          updateData['studentData.gradeLevel'] = editGradeLevel;
        }
        if (editBirthdate.trim()) {
          updateData['studentData.dateOfBirth'] = editBirthdate;
        }
      }

      if (selectedUser?.role === 'faculty') {
        if (editAssignedGradeLevels !== undefined) {
          updateData['facultyData.assignedGradeLevels'] = editAssignedGradeLevels;
        }
        if (editBirthdate.trim()) {
          updateData['facultyData.dateOfBirth'] = editBirthdate;
        }
      }

      await updateUserProfile(selectedUser!.uid, updateData);
      setEditModalVisible(false);
      handleRefresh();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUserDocument(selectedUser!.uid);
      setDeleteModalVisible(false);
      handleRefresh();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const renderUserItem = ({ item }: { item: UserDocument }) => {
    const roleColor = getRoleColor(item.role || 'user');
    const roleIcon = getRoleIcon(item.role || 'user');
    const initials = (item.firstName?.charAt(0) || 'U').toUpperCase();
    const isMenuOpen = optionsMenuUid === item.uid;

    return (
      <View style={adminUserManagment.userCard}>
        <View style={adminUserManagment.userCardContent}>
          <View style={adminUserManagment.avatarContainer}>
            {item.profileImageUrl ? (
              <Image
                source={{ uri: item.profileImageUrl }}
                style={adminUserManagment.userAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[
                adminUserManagment.userAvatar,
                { backgroundColor: roleColor + '22' }
              ]}>
                <Text style={[
                  { fontSize: 20, fontWeight: '900', color: roleColor }
                ]}>
                  {item.sex === 'male' ? '♂' : item.sex === 'female' ? '♀' : initials}
                </Text>
              </View>
            )}
            <View style={adminUserManagment.roleIconBadge}>
              <Text style={adminUserManagment.roleIconText}>{roleIcon}</Text>
            </View>
          </View>
          <View style={adminUserManagment.userInfo}>
            <Text style={adminUserManagment.userName}>
              {item.firstName || 'Sinuman'} {item.lastName || ''}
            </Text>
            <Text style={adminUserManagment.userEmail}>{item.email || 'Walang Email'}</Text>
            <View style={adminUserManagment.userMetaRow}>
              <View style={[adminUserManagment.userMetaChip, { backgroundColor: roleColor + '18' }]}>
                <Text style={[adminUserManagment.userMetaValue, { color: roleColor }]}>
                  {(item.role || 'user').toUpperCase()}
                </Text>
              </View>
              {item.role === 'student' && item.studentData?.gradeLevel ? (
                <View style={[adminUserManagment.userMetaChip, { backgroundColor: F.primaryPale }]}>
                  <Text style={[adminUserManagment.userMetaValue, { color: F.primary }]}>
                    Baitang {item.studentData.gradeLevel}
                  </Text>
                </View>
              ) : null}
              {item.role === 'faculty' && item.facultyData?.assignedGradeLevels && item.facultyData.assignedGradeLevels.length > 0 ? (
                <View style={[adminUserManagment.userMetaChip, { backgroundColor: F.primaryPale }]}>
                  <Text style={[adminUserManagment.userMetaValue, { color: F.primary }]}>
                    {item.facultyData.assignedGradeLevels.length} Baitang
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={adminUserManagment.arrowContainer}>
            <TouchableOpacity
              style={adminUserManagment.optionsButton}
              onPress={() => handleOptionsPress(item)}
              activeOpacity={0.7}
            >
              <MoreVerticalIcon size={18} color={F.slate} />
            </TouchableOpacity>
            {isMenuOpen && (
              <View style={adminUserManagment.optionsMenu}>
                <TouchableOpacity
                  style={adminUserManagment.optionsMenuItem}
                  onPress={() => handleEditPress(item)}
                >
                  <PencilIcon size={16} color={F.primary} />
                  <Text style={adminUserManagment.optionsMenuText}>Ayusin</Text>
                </TouchableOpacity>
                <View style={adminUserManagment.optionsMenuDivider} />
                <TouchableOpacity
                  style={adminUserManagment.optionsMenuItem}
                  onPress={() => handleDeletePress(item)}
                >
                  <TrashIcon size={16} color={F.red} />
                  <Text style={[adminUserManagment.optionsMenuText, { color: F.red }]}>Burahin</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const roles = [
    { id: undefined as UserRole | undefined, label: 'Lahat' },
    { id: 'admin' as UserRole, label: 'Admin' },
    { id: 'faculty' as UserRole, label: 'Guro' },
    { id: 'student' as UserRole, label: 'Estudyante' },
  ];

  const displayCount = searchDebounce ? users.length : users.length;

  return (
    <SafeAreaView style={adminUserManagment.safeArea}>
      <BubbleBackground />

      <AdminSideMenu
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onLogout={handleLogoutPress}
        currentRoute="UserManagement"
      />

      <LogoutModal
        visible={logoutVisible}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />

      <View style={adminUserManagment.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
          <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: F.white, justifyContent: 'center', alignItems: 'center', ...Shadows.subtle }} onPress={toggleMenu} activeOpacity={0.7}>
            <BurgerIcon size={22} color={F.ink} />
          </TouchableOpacity>
          <Image
            style={{ width: 100, height: 90 }}
            source={require('../../../assets/images/cisckids copy.png')}
            resizeMode="contain"
          />
          <View style={{ width: 44 }} />
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={adminUserManagment.searchContainer}>
            <SearchIcon size={20} color={F.slate} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: F.ink, padding: 0 }}
              placeholder="Maghanap ng user..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={F.slate}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ fontSize: 18, color: F.slate, padding: 4 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={adminUserManagment.filterTabs}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id ?? 'all'}
                style={[
                  adminUserManagment.filterTab,
                  selectedRole === role.id && adminUserManagment.filterTabActive,
                ]}
                onPress={() => handleRoleFilter(role.id)}
              >
                <Text
                  style={[
                    adminUserManagment.filterTabText,
                    selectedRole === role.id && adminUserManagment.filterTabTextActive,
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={adminUserManagment.userCount}>
            {displayCount} user/s ang nahanap
          </Text>
        </View>

        {error ? (
          <View style={adminUserManagment.errorContainer}>
            <Text style={adminUserManagment.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={{ marginTop: 12 }}>
              <Text style={{ color: F.primary, fontWeight: '700' }}>Subukan ulit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={adminUserManagment.listWrapper}>
            <FlatList
              data={users}
              keyExtractor={(item) => item.uid}
              renderItem={renderUserItem}
              contentContainerStyle={adminUserManagment.listContainer}
              showsVerticalScrollIndicator={true}
              refreshControl={
                <RefreshControl
                  refreshing={loading && users.length > 0}
                  onRefresh={handleRefresh}
                  tintColor={F.primary}
                  colors={[F.primary]}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                hasMore && !searchDebounce ? (
                  <TouchableOpacity style={adminUserManagment.loadMoreButton} onPress={handleLoadMore} disabled={loading}>
                    <Text style={adminUserManagment.loadMoreText}>
                      {loading ? 'Ini-load...' : 'Mag-load pa ng karagdagang'}
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
              ListEmptyComponent={
                !loading ? (
                  <View style={adminUserManagment.emptyContainer}>
                    <Text style={adminUserManagment.emptyIcon}>🔍</Text>
                    <Text style={adminUserManagment.emptyTitle}>Walang nahanap</Text>
                    <Text style={adminUserManagment.emptyText}>
                      {searchDebounce ? 'Walang tumugon na user sa iyong paghahanap.' : 'Wala pang nairehistrong user.'}
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        )}

        {loading && users.length === 0 ? (
          <View style={adminUserManagment.loader}>
            <ActivityIndicator size="large" color={F.primary} />
          </View>
        ) : null}
      </View>

      <ConfirmationModal
          visible={deleteModalVisible}
          type="danger"
          title="Burahin ang User?"
          message={selectedUser ? `Sigurado ka ba na gusto mong burahin si ${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}? Hindi na ito mababalik.` : 'Sigurado ka ba na gusto mong burahin? Hindi na ito mababalik.'}
          confirmText="Burahin"
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={handleConfirmDelete}
        />

        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={adminUserManagment.fullScreenModal}>
            <View style={adminUserManagment.fullScreenContainer}>
              <View style={adminUserManagment.modalHeader}>
                <Text style={adminUserManagment.modalTitle}>Ayusin ang Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Text style={adminUserManagment.closeTxt}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 30, paddingBottom: 50 }}>
                <View style={adminUserManagment.field}>
                  <Text style={adminUserManagment.fieldLabel}>Pangalan (First Name)</Text>
                  <TextInput
                    style={adminUserManagment.modalInput}
                    value={editFirstName}
                    onChangeText={setEditFirstName}
                  />
                </View>

                <View style={adminUserManagment.field}>
                  <Text style={adminUserManagment.fieldLabel}>Gitnang Pangalan (Middle Name)</Text>
                  <TextInput
                    style={adminUserManagment.modalInput}
                    value={editMiddleName}
                    onChangeText={setEditMiddleName}
                  />
                </View>

                <View style={adminUserManagment.field}>
                  <Text style={adminUserManagment.fieldLabel}>Apelyido (Last Name)</Text>
                  <TextInput
                    style={adminUserManagment.modalInput}
                    value={editLastName}
                    onChangeText={setEditLastName}
                  />
                </View>

                <View style={adminUserManagment.field}>
                  <Text style={adminUserManagment.fieldLabel}>Email Address</Text>
                  <TextInput
                    style={adminUserManagment.modalInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    placeholderTextColor={F.slate + '80'}
                  />
                </View>

                <View style={adminUserManagment.field}>
                  <Text style={adminUserManagment.fieldLabel}>Birthdate</Text>
                  <TextInput
                    style={adminUserManagment.modalInput}
                    value={editBirthdate}
                    onChangeText={setEditBirthdate}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor={F.slate + '80'}
                    keyboardType="default"
                  />
                </View>

                <View style={adminUserManagment.field}>
                  <Text style={adminUserManagment.fieldLabel}>Kasarian (Sex)</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={[
                        adminUserManagment.modalInput,
                        editSex === 'male' ? { backgroundColor: F.primaryLight } : { backgroundColor: F.bg },
                        { padding: 14, marginRight: 8, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }
                      ]}
                      onPress={() => setEditSex('male')}
                    >
                      <Text style={{ color: editSex === 'male' ? F.primaryDeep : F.ink, fontFamily: 'Andika-Regular' }}>
                        Male
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        adminUserManagment.modalInput,
                        editSex === 'female' ? { backgroundColor: F.primaryLight } : { backgroundColor: F.bg },
                        { padding: 14, marginLeft: 8, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }
                      ]}
                      onPress={() => setEditSex('female')}
                    >
                      <Text style={{ color: editSex === 'female' ? F.primaryDeep : F.ink, fontFamily: 'Andika-Regular' }}>
                        Female
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedUser?.role === 'student' && (
                  <View style={adminUserManagment.field}>
                    <Text style={adminUserManagment.fieldLabel}>Antas ng Baitang (Grade Level)</Text>
                    <View style={{ width: '100%' }}>
                      {['Baitang 1', 'Baitang 2', 'Baitang 3'].map((level, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            adminUserManagment.modalInput,
                            {
                              backgroundColor: editGradeLevel === index + 1 ? F.primaryLight : F.bg,
                              marginBottom: 8,
                            }
                          ]}
                          onPress={() => setEditGradeLevel(index + 1)}
                        >
                          <Text style={{ 
                            color: editGradeLevel === index + 1 ? F.primaryDeep : F.ink,
                            fontFamily: 'Andika-Regular',
                          }}>
                            {level}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {selectedUser?.role === 'faculty' && (
                  <View style={adminUserManagment.field}>
                    <Text style={adminUserManagment.fieldLabel}>Itinalagang Baitang (Assigned Grade Levels)</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {[1, 2, 3].map((level) => (
                        <TouchableOpacity
                          key={level}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 12,
                            backgroundColor: editAssignedGradeLevels.includes(level) ? F.primaryDeep : F.bg,
                            borderWidth: 1,
                            borderColor: F.primaryDeep,
                          }}
                          onPress={() => {
                            if (editAssignedGradeLevels.includes(level)) {
                              setEditAssignedGradeLevels(editAssignedGradeLevels.filter(l => l !== level));
                            } else {
                              setEditAssignedGradeLevels([...editAssignedGradeLevels, level]);
                            }
                          }}
                        >
                          <Text style={{ 
                            color: editAssignedGradeLevels.includes(level) ? F.white : F.primaryDeep,
                            fontFamily: 'Andika-Bold',
                            fontSize: 14,
                          }}>
                            Baitang {level}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[adminUserManagment.saveActionBtn, editLoading && { opacity: 0.7 }]}
                  onPress={handleSaveEdit}
                  disabled={editLoading}
                >
                  {editLoading ? <ActivityIndicator color={F.white} /> : <Text style={adminUserManagment.saveActionTxt}>I-update ang User</Text>}
                </TouchableOpacity>
               </ScrollView>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}

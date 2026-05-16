import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { useAdminStats } from '../../Hooks/use_AdminStats';
import { BurgerIcon, SearchIcon, FilterIcon, UsersIcon, TrashIcon, PencilIcon } from '../../Components/GlobalUse/Icons';
import { useNavigationHelper } from '../../Controller/NavigationController';
import AdminSideMenu from '../../Components/Admin/AdminSideMenu';
import bubbles from '../../UI_Designs/BubblesDesign';
import { updateUserProfile, deleteUserDocument } from '../../Controller/AuthenticationController';
import { Modal, Alert } from 'react-native';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { useRoute } from '@react-navigation/native';

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return '#3d71d9'; // Brand Blue
    case 'faculty': return '#eb5c6c'; // Brand Coral
    case 'student': return '#5c7eb5'; // Muted Blue
    default: return '#8ca69a';
  }
};

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'all' | 'student' | 'faculty' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  
  // EDIT & DELETE STATE
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const { getAllUsers } = useAdminStats();
  const { handleLogout, handleNavigateStep } = useNavigationHelper();
  const route = useRoute();

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = (user: any) => {
    setSelectedUser(user);
    setEditFirstName(user.firstName || '');
    setEditLastName(user.lastName || '');
    setEditEmail(user.email || '');
    setEditModalVisible(true);
  };

  const handleDeletePress = (user: any) => {
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
      await updateUserProfile(selectedUser.uid, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail
      } as any);
      setEditModalVisible(false);
      fetchUsers();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteUserDocument(selectedUser.uid);
      setDeleteModalVisible(false);
      fetchUsers();
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = users;
    
    // Filter by Role
    if (activeRole !== 'all') {
      result = result.filter(u => u.role === activeRole);
    }
    
    // Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        (u.firstName || '').toLowerCase().includes(query) ||
        (u.lastName || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [activeRole, searchQuery, users]);

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={S.userCard}>
      <View style={S.userAvatar}>
        <Text style={S.avatarText}>{item.firstName?.charAt(0) || 'U'}</Text>
      </View>
      <View style={S.userInfo}>
        <Text style={S.userName}>
          {item.firstName || 'Sinuman'} {item.lastName || ''}
        </Text>
        <Text style={S.userEmail}>{item.email || 'Walang Email'}</Text>
        <View style={[S.roleBadge, { backgroundColor: getRoleColor(item.role || 'user') + '20' }]}>
          <Text style={[S.roleText, { color: getRoleColor(item.role || 'user') }]}>
            {(item.role || 'user').toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={S.actionGroup}>
        <TouchableOpacity style={S.actionIcon} onPress={() => handleEditPress(item)}>
          <PencilIcon size={18} color={F.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={S.actionIcon} onPress={() => handleDeletePress(item)}>
          <TrashIcon size={18} color={F.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const roles = [
    { id: 'all', label: 'Lahat' },
    { id: 'faculty', label: 'Mga Guro' },
    { id: 'student', label: 'Mga Estudyante' },
  ];

  return (
    <SafeAreaView style={S.container}>
      <View style={bubbles.bubblesContainer}>
        <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
      </View>

      <View style={S.header}>
        <TouchableOpacity style={S.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
          <BurgerIcon size={24} color={F.ink} />
        </TouchableOpacity>
        <Image
          style={S.logo}
          source={require('../../../assets/images/cisckids copy.png')}
          resizeMode="contain"
        />
        <View style={{ width: 44 }} />
      </View>

      <View style={S.searchSection}>
        <View style={S.searchBar}>
          <SearchIcon size={20} color={F.slate} />
          <TextInput
            style={S.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={F.slate}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={S.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={S.filterSection}>
        <View style={S.filterBar}>
          {roles.map(role => (
            <TouchableOpacity
              key={role.id}
              style={[S.filterChip, activeRole === role.id && S.filterChipActive]}
              onPress={() => setActiveRole(role.id as any)}
            >
              <Text style={[S.filterText, activeRole === role.id && S.filterTextActive]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={S.loadingCenter}>
          <ActivityIndicator size="large" color={F.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.uid}
          renderItem={renderUserItem}
          contentContainerStyle={S.userList}
          ListEmptyComponent={
            <View style={S.emptyState}>
              <Text style={S.emptyText}>No users found</Text>
            </View>
          }
        />
      )}

      <AdminSideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogoutPress}
        currentRoute={route.name}
      />

      <LogoutModal
        visible={logoutVisible}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />

      {/* DELETE CONFIRMATION */}
      <ConfirmationModal 
        visible={deleteModalVisible}
        type="danger"
        title="Burahin ang User?"
        message={
          <Text>
            Sigurado ka ba na gusto mong burahin si{" "}
            <Text style={{ fontWeight: "900", color: F.ink }}>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </Text>
            ? Hindi na ito mababalik.
          </Text>
        }
        confirmText="Burahin"
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={S.modalOverlay}>
          <View style={S.editContainer}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Ayusin ang Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={S.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={S.field}>
              <Text style={S.fieldLabel}>Pangalan (First Name)</Text>
              <TextInput 
                style={S.modalInput}
                value={editFirstName}
                onChangeText={setEditFirstName}
              />
            </View>

            <View style={S.field}>
              <Text style={S.fieldLabel}>Apelyido (Last Name)</Text>
              <TextInput 
                style={S.modalInput}
                value={editLastName}
                onChangeText={setEditLastName}
              />
            </View>

            <View style={S.field}>
              <Text style={S.fieldLabel}>Email Address</Text>
              <TextInput 
                style={S.modalInput}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity 
              style={[S.saveActionBtn, editLoading && { opacity: 0.7 }]} 
              onPress={handleSaveEdit}
              disabled={editLoading}
            >
              {editLoading ? <ActivityIndicator color={F.white} /> : <Text style={S.saveActionTxt}>I-update ang User</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: F.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16
  },
  menuBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: F.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  logo: { width: 100, height: 90 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: F.ink },

  searchSection: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: F.white,
    borderRadius: Radii.md, paddingHorizontal: 16, height: 50, ...Shadows.subtle
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: F.ink, padding: 0 },
  clearText: { fontSize: 18, color: F.slate, padding: 4 },

  filterSection: { paddingHorizontal: 20, marginBottom: 16 },
  filterBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: F.white + '80', padding: 4, borderRadius: 16 },
  filterChip: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginHorizontal: 2 },
  filterChipActive: { backgroundColor: F.primaryDeep, ...Shadows.card },
  filterText: { fontSize: 12, fontWeight: '800', color: F.slate },
  filterTextActive: { color: F.white },

  userList: { paddingHorizontal: 20, paddingBottom: 40 },
  userCard: {
    flexDirection: 'row', backgroundColor: F.white, borderRadius: Radii.lg,
    padding: 16, marginBottom: 12, alignItems: 'center', ...Shadows.card
  },
  userAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: F.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: F.primaryDeep },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '800', color: F.ink },
  userEmail: { fontSize: 13, color: F.slate, marginBottom: 6 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '900' },

  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: F.slate, fontWeight: '600' },
  actionGroup: { flexDirection: 'row', gap: 10 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: F.bg, justifyContent: 'center', alignItems: 'center' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  editContainer: { backgroundColor: F.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 30, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: F.ink },
  closeTxt: { fontSize: 22, color: F.slate, fontWeight: '700' },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: F.slate, marginBottom: 8 },
  modalInput: { backgroundColor: F.bg, borderRadius: 12, padding: 14, fontSize: 16, color: F.ink, fontWeight: '600', borderWidth: 1, borderColor: '#eee' },
  saveActionBtn: { backgroundColor: F.primaryDeep, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 10, ...Shadows.button },
  saveActionTxt: { color: F.white, fontSize: 16, fontWeight: '800' }
});

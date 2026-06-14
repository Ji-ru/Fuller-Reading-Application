import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import {
  GetAllPassages,
  AddPassage,
  UpdatePassage,
  DeletePassage,
} from '../../Controller/AuthenticationController';
import { PassageDocument } from '../../Interfaces/dataInterfaces';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import Sidebar from '../../Components/GlobalUse/Sidebar';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { Icon } from '../../Components/GlobalUse/Icon';
import { buildAdminMenuItems } from '../../Utilities/adminMenuItems';
import { FacultyColors, Radii, Shadows } from '../../Utilities/Theme';
import adminUserManagment from '../../UI_Designs/AdminUserManagementStyles';
import adminDashboard from '../../UI_Designs/AdminDashboardStyles';

import { sw, sh, sf } from '../../Utils/responsive';

function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
      <View style={{ width: 12, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
      <View style={{ width: 18, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
    </View>
  );
}

export default function AdminPassageList() {
  const { handleLogout, handleReplaceStep } = useNavigationHelper();
  const menuItems = buildAdminMenuItems(handleReplaceStep);

  // States
  const [passages, setPassages] = useState<PassageDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedPassage, setSelectedPassage] = useState<PassageDocument | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [passageText, setPassageText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPassages();
  }, []);

  const fetchPassages = async () => {
    setLoading(true);
    const data = await GetAllPassages();
    setPassages(data);
    setLoading(false);
  };

  const handleLogoutPress = () => {
    setSidebarVisible(false);
    setLogoutVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setPassageText('');
    setSelectedPassage(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalVisible(true);
  };

  const openEditModal = (passage: PassageDocument) => {
    setSelectedPassage(passage);
    setTitle(passage.title);
    setAuthor(passage.author || '');
    setPassageText(passage.passageText);
    setModalMode('edit');
    setIsModalVisible(true);
  };

  const openViewModal = (passage: PassageDocument) => {
    setSelectedPassage(passage);
    setIsViewModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !passageText.trim()) {
      Alert.alert('Validation Error', 'Title and Passage Text are required.');
      return;
    }

    setIsSaving(true);
    if (modalMode === 'add') {
      const result = await AddPassage({
        title: title.trim(),
        author: author.trim() || null,
        passageText: passageText.trim(),
      });
      if (result.success) {
        setIsModalVisible(false);
        fetchPassages();
      } else {
        Alert.alert('Error', result.error || 'Failed to add passage');
      }
    } else if (modalMode === 'edit' && selectedPassage) {
      const result = await UpdatePassage(selectedPassage.pid, {
        title: title.trim(),
        author: author.trim() || null,
        passageText: passageText.trim(),
      });
      if (result.success) {
        setIsModalVisible(false);
        fetchPassages();
      } else {
        Alert.alert('Error', result.error || 'Failed to update passage');
      }
    }
    setIsSaving(false);
  };

  const handleDelete = (passage: PassageDocument) => {
    Alert.alert(
      'Delete Passage',
      `Are you sure you want to delete "${passage.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await DeletePassage(passage.pid);
            if (result.success) {
              fetchPassages();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete passage');
            }
          },
        },
      ]
    );
  };

  const renderPassageItem = ({ item }: { item: PassageDocument }) => (
    <View style={adminUserManagment.userCard}>
      <TouchableOpacity
        style={[adminUserManagment.userInfo, { flex: 1 }]}
        onPress={() => openViewModal(item)}
      >
        <View style={adminUserManagment.nameRow}>
          <Text style={adminUserManagment.userName} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={adminUserManagment.userEmail} numberOfLines={1}>
          {item.author ? `By ${item.author}` : 'Unknown Author'}
        </Text>
      </TouchableOpacity>

      <View style={adminUserManagment.rowActions}>
        <TouchableOpacity
          style={adminUserManagment.rowActionBtn}
          onPress={() => openEditModal(item)}
        >
          <Icon name="edit" size={16} color={FacultyColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[adminUserManagment.rowActionBtn, adminUserManagment.rowActionBtnDanger]}
          onPress={() => handleDelete(item)}
        >
          <Icon name="trash" size={16} color={FacultyColors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={adminUserManagment.safeArea}>
      <View style={adminUserManagment.container}>
        <BubbleBackground />

        {/* HEADER */}
        <View style={adminUserManagment.headerRow}>
          <View style={{ width: 44 }} />
          <Text style={adminUserManagment.title}>Passage Management</Text>
          <TouchableOpacity
            style={adminDashboard.menuBtn}
            onPress={() => setSidebarVisible(true)}
            activeOpacity={0.7}
          >
            <MenuBars />
          </TouchableOpacity>
        </View>

        {/* SIDEBAR */}
        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onLogout={handleLogoutPress}
          currentRoute="passage-list"
          menuItems={menuItems}
        />

        <LogoutModal
          visible={logoutVisible}
          onCancel={() => setLogoutVisible(false)}
          onConfirm={confirmLogout}
        />

        {/* CONTENT */}
        <View style={adminUserManagment.content}>
          <View style={adminUserManagment.userCountContainer}>
            <Text style={adminUserManagment.userCount}>
              Total Passages: {passages.length}
            </Text>
          </View>

          <View style={adminUserManagment.listWrapper}>
            {loading ? (
              <ActivityIndicator size="large" color={FacultyColors.primary} style={adminUserManagment.loader} />
            ) : (
              <FlatList
                data={passages}
                keyExtractor={(item) => item.pid}
                renderItem={renderPassageItem}
                contentContainerStyle={adminUserManagment.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={adminUserManagment.emptyContainer}>
                    <Icon name="bookOpen" size={48} color={FacultyColors.slate} />
                    <Text style={adminUserManagment.emptyTitle}>No Passages Found</Text>
                    <Text style={adminUserManagment.emptyText}>
                      Tap the + button to add a new passage.
                    </Text>
                  </View>
                }
              />
            )}
          </View>

          {/* FLOATING ADD BUTTON */}
          <View style={{ position: 'absolute', bottom: 20, right: 0 }}>
            <TouchableOpacity
              style={[adminUserManagment.addBtn, { width: 56, height: 56, borderRadius: 28, elevation: 5 }]}
              onPress={openAddModal}
            >
              <Icon name="plus" size={24} color={FacultyColors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ADD / EDIT MODAL */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={adminUserManagment.modalBackdrop}>
            <View style={adminUserManagment.modalSheet}>
              <View style={adminUserManagment.sheetHandle} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={adminUserManagment.modalTitle}>
                  {modalMode === 'add' ? 'Add Passage' : 'Edit Passage'}
                </Text>

                <Text style={adminUserManagment.modalLabel}>Title</Text>
                <TextInput
                  style={adminUserManagment.modalInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. The Brave Little Fox"
                  placeholderTextColor={FacultyColors.slate}
                />

                <Text style={adminUserManagment.modalLabel}>Author (Optional)</Text>
                <TextInput
                  style={adminUserManagment.modalInput}
                  value={author}
                  onChangeText={setAuthor}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={FacultyColors.slate}
                />

                <Text style={adminUserManagment.modalLabel}>Passage Text</Text>
                <TextInput
                  style={[adminUserManagment.modalInput, { height: sh(150), textAlignVertical: 'top' }]}
                  value={passageText}
                  onChangeText={setPassageText}
                  placeholder="Enter the passage content here..."
                  placeholderTextColor={FacultyColors.slate}
                  multiline
                />

                <View style={adminUserManagment.modalActions}>
                  <TouchableOpacity
                    style={adminUserManagment.cancelBtn}
                    onPress={() => setIsModalVisible(false)}
                    disabled={isSaving}
                  >
                    <Text style={adminUserManagment.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={adminUserManagment.saveBtn}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={FacultyColors.white} />
                    ) : (
                      <Text style={adminUserManagment.saveText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* VIEW PASSAGE MODAL */}
        <Modal
          visible={isViewModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsViewModalVisible(false)}
        >
          <View style={[adminUserManagment.modalBackdrop, { justifyContent: 'center', paddingHorizontal: 20 }]}>
            <View style={[adminUserManagment.modalSheet, { borderRadius: Radii.md, paddingTop: 24, maxHeight: '80%' }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[adminUserManagment.modalTitle, { marginBottom: 8 }]}>
                  {selectedPassage?.title}
                </Text>
                <View style={[adminUserManagment.nameRow, { marginBottom: 20 }]}>
                  <Text style={adminUserManagment.userEmail}>
                    {selectedPassage?.author ? `By ${selectedPassage.author}` : 'Unknown Author'}
                  </Text>
                </View>
                
                <Text style={{ fontFamily: 'Satoshi-Medium', fontSize: sf(15), color: FacultyColors.ink, lineHeight: sf(22) }}>
                  {selectedPassage?.passageText}
                </Text>

                <View style={[adminUserManagment.modalActions, { marginTop: 32 }]}>
                  <TouchableOpacity
                    style={[adminUserManagment.saveBtn, { width: '100%' }]}
                    onPress={() => setIsViewModalVisible(false)}
                  >
                    <Text style={[adminUserManagment.saveText, { textAlign: 'center' }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

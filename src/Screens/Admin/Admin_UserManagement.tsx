import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { useGetUsers } from '../../Hooks/Admin/use_getAllUsers';
import { UserDocument, UserRole } from '../../Interfaces/dataInterfaces';
import adminUserManagment from '../../UI_Designs/AdminUserManagementStyles';
import { FacultyColors } from '../../Utilities/Theme';
import { Icon } from '../../Components/GlobalUse/Icon';
import {
    updateUserByAdmin,
    deleteUserByAdmin,
    createUserByAdmin,
    sendAdminPasswordResetEmail,
} from '../../Controller/AuthenticationController';
import Sidebar from '../../Components/GlobalUse/Sidebar';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { buildAdminMenuItems } from '../../Utilities/adminMenuItems';

export default function AdminUserManagement() {
    // STATE MANAGEMENT
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');
    const [editVisible, setEditVisible] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDocument | null>(null);
    const [editForm, setEditForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        sex: '',
        role: 'student' as UserRole,
        gradeLevel: '',
        assignedGradeLevels: '',
    });

    // ADD USER MODAL STATE
    const [addVisible, setAddVisible] = useState(false);
    const [savingAdd, setSavingAdd] = useState(false);
    const [showAddPassword, setShowAddPassword] = useState(false);
    const [showAddConfirm, setShowAddConfirm] = useState(false);
    const emptyAddForm = {
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' as UserRole,
        firstName: '',
        middleName: '',
        lastName: '',
        sex: '',
        dateOfBirth: '',
        gradeLevel: 0, // single grade for student
        assignedGradeLevels: [] as number[], // multi for faculty
    };
    const [addForm, setAddForm] = useState(emptyAddForm);
    const [addError, setAddError] = useState<string | null>(null);

    // HOOKS
    const { handleLogout, handleNavigateToUserDetail, handleReplaceStep } = useNavigationHelper();
    const menuItems = buildAdminMenuItems(handleReplaceStep);

    const { users, loading, error, hasMore, fetchUsers, resetUsers } = useGetUsers();

    // DEBOUNCE SEARCH INPUT
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // FETCH USERS WHEN FILTERS CHANGE
    useEffect(() => {
        resetUsers();
        fetchUsers(selectedRole, searchDebounce || undefined);
    }, [selectedRole, searchDebounce, resetUsers, fetchUsers]);

    // EVENT HANDLERS
    const toggleMenu = () => {
        setSidebarVisible(prev => !prev);
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

    const handleRoleFilter = (role: UserRole | undefined) => {
        setSelectedRole(role);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore && !searchDebounce) {
            fetchUsers(selectedRole, undefined, true);
        }
    };

    const handleRefresh = () => {
        resetUsers();
        fetchUsers(selectedRole, searchDebounce || undefined);
    };

    // ADMIN: open edit modal with selected user data
    const handleOpenEdit = (user: UserDocument) => {
        if (user.role === 'admin') {
            Alert.alert('Blocked', 'Admin accounts cannot be edited from this screen.');
            return;
        }
        setEditingUser(user);
        setEditForm({
            firstName: user.firstName || '',
            middleName: user.middleName || '',
            lastName: user.lastName || '',
            dateOfBirth: user.studentData?.dateOfBirth || '',
            email: user.email || '',
            sex: user.sex || '',
            role: user.role,
            gradeLevel: user.studentData?.gradeLevel?.toString() || '',
            assignedGradeLevels: user.facultyData?.assignedGradeLevels?.join(',') || '',
        });
        setEditVisible(true);
    };

    // ADMIN: save edited Firestore fields (password is handled separately via reset email)
    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setSavingEdit(true);
        try {
            const assignedGradeLevels = editForm.assignedGradeLevels
                ? editForm.assignedGradeLevels
                    .split(',')
                    .map(v => Number(v.trim()))
                    .filter(v => !Number.isNaN(v))
                : undefined;

            await updateUserByAdmin(editingUser.uid, {
                firstName: editForm.firstName.trim(),
                middleName: editForm.middleName.trim() || undefined,
                lastName: editForm.lastName.trim(),
                dateOfBirth: editForm.dateOfBirth.trim() || undefined,
                email: editForm.email.trim() || undefined,
                sex: editForm.sex.trim() || undefined,
                role: editForm.role,
                gradeLevel: editForm.gradeLevel ? Number(editForm.gradeLevel) : undefined,
                assignedGradeLevels,
            });

            setEditVisible(false);
            setEditingUser(null);
            handleRefresh();
        } catch (err: any) {
            Alert.alert('Update failed', err?.message || 'Unable to update user');
        } finally {
            setSavingEdit(false);
        }
    };

    // ADMIN: trigger a password reset email for the user being edited (Pattern A)
    const handleSendPasswordReset = () => {
        if (!editingUser?.email) {
            Alert.alert('No email', 'This user has no email on file.');
            return;
        }
        Alert.alert(
            'Send password reset',
            `Send a password reset email to ${editingUser.email}? They will set their own new password from the link.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: async () => {
                        try {
                            await sendAdminPasswordResetEmail(editingUser.email!);
                            Alert.alert('Sent', 'Password reset email sent successfully.');
                        } catch (err: any) {
                            Alert.alert('Failed', err?.message || 'Could not send reset email.');
                        }
                    },
                },
            ],
        );
    };

    // ADMIN: delete user with role-aware Firestore cascade
    const handleDeleteUser = (user: UserDocument) => {
        if (user.role === 'admin') {
            Alert.alert('Blocked', 'Admin accounts cannot be deleted.');
            return;
        }

        const cascadeWarning = user.role === 'faculty'
            ? 'All classes owned by this faculty will be deleted, and every student enrolled in those classes will be unenrolled.'
            : 'All of this student\'s reading, miscue, alphabet, and word session records will also be deleted.';

        Alert.alert(
            'Delete user',
            `Are you sure you want to delete ${user.firstName} ${user.lastName}?\n\n${cascadeWarning}\n\nNote: their sign-in credentials in Firebase Auth will remain and must be removed manually from the Firebase console.\n\nThis cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUserByAdmin(user.uid);
                            handleRefresh();
                        } catch (err: any) {
                            Alert.alert('Delete failed', err?.message || 'Unable to delete user');
                        }
                    },
                },
            ],
        );
    };

    // ADMIN: open the Add User modal with a clean form
    const handleOpenAdd = () => {
        setAddForm(emptyAddForm);
        setAddError(null);
        setShowAddPassword(false);
        setShowAddConfirm(false);
        setAddVisible(true);
    };

    // ADMIN: submit Add User via the secondary Firebase app (Pattern B — admin session preserved)
    const handleSubmitAdd = async () => {
        setAddError(null);

        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRx.test(addForm.email.trim())) {
            setAddError('Enter a valid email address.');
            return;
        }
        if (addForm.password.length < 6) {
            setAddError('Password must be at least 6 characters.');
            return;
        }
        if (addForm.password !== addForm.confirmPassword) {
            setAddError('Passwords do not match.');
            return;
        }
        if (!addForm.firstName.trim() || !addForm.lastName.trim()) {
            setAddError('First name and last name are required.');
            return;
        }
        if (!addForm.sex) {
            setAddError('Please select a sex.');
            return;
        }
        if (addForm.role === 'student' && !addForm.gradeLevel) {
            setAddError('Pick a grade level for the student.');
            return;
        }
        if (addForm.role === 'faculty' && addForm.assignedGradeLevels.length === 0) {
            setAddError('Pick at least one grade level for the faculty.');
            return;
        }

        setSavingAdd(true);
        try {
            await createUserByAdmin(
                addForm.email.trim(),
                addForm.password,
                {
                    role: addForm.role,
                    firstName: addForm.firstName.trim(),
                    middleName: addForm.middleName.trim() || undefined,
                    lastName: addForm.lastName.trim(),
                    sex: addForm.sex,
                    dateOfBirth: addForm.dateOfBirth.trim() || undefined,
                    gradeLevel: addForm.role === 'student' ? addForm.gradeLevel : undefined,
                    assignedGradeLevels: addForm.role === 'faculty' ? addForm.assignedGradeLevels : undefined,
                },
            );
            setAddVisible(false);
            handleRefresh();
        } catch (err: any) {
            setAddError(err?.message || 'Unable to create user.');
        } finally {
            setSavingAdd(false);
        }
    };

    const toggleAddGradeLevel = (g: number) => {
        setAddForm(prev => {
            const exists = prev.assignedGradeLevels.includes(g);
            return {
                ...prev,
                assignedGradeLevels: exists
                    ? prev.assignedGradeLevels.filter(x => x !== g)
                    : [...prev.assignedGradeLevels, g].sort((a, b) => a - b),
            };
        });
    };

    // HANDLE LONG PRESS - Show Edit/Delete options
    const handleLongPress = (user: UserDocument) => {
        Alert.alert(
            'User Actions',
            `Manage ${user.firstName} ${user.lastName}`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit User', onPress: () => handleOpenEdit(user) },
                { text: 'Delete User', style: 'destructive', onPress: () => handleDeleteUser(user) },
            ],
            { cancelable: true }
        );
    };

    // HANDLE USER CARD PRESS - Navigate to user detail view
    const handleUserPress = (user: UserDocument) => {
        if (user.role === 'student') {
            return handleNavigateToUserDetail({
                uid: user.uid,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                role: user.role,
                sex: user.sex,
                reading_Level: user.studentData?.reading_Level
            });
        }

        if (user.role === 'faculty') {
            return handleNavigateToUserDetail({
                uid: user.uid,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                sex: user.sex,
            });
        }

        return undefined;
    };

    const getRoleChipStyle = (role: UserRole) => {
        switch (role) {
            case 'student':
                return { backgroundColor: 'rgba(0, 132, 67, 0.12)' }; // Primary tinted
            case 'faculty':
                return { backgroundColor: 'rgba(87, 184, 179, 0.15)' }; // Teal tinted
            case 'admin':
                return { backgroundColor: 'rgba(199, 119, 0, 0.12)' }; // Orange tinted
            default:
                return { backgroundColor: FacultyColors.bg };
        }
    };

    const getRoleTextStyle = (role: UserRole) => {
        switch (role) {
            case 'student':
                return { color: FacultyColors.primary };
            case 'faculty':
                return { color: FacultyColors.teal };
            case 'admin':
                return { color: FacultyColors.orange };
            default:
                return { color: FacultyColors.ink };
        }
    };

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    // RENDER USER ITEM
    const renderUserItem = ({ item }: { item: UserDocument }) => {
        const isAdmin = item.role === 'admin';
        return (
            <TouchableOpacity
                style={adminUserManagment.userCard}
                onPress={() => handleUserPress(item)}
                onLongPress={() => !isAdmin && handleLongPress(item)}
                activeOpacity={0.7}
            >
                <Image
                    style={adminUserManagment.avatar}
                    source={
                        item.profileImageUrl
                            ? { uri: item.profileImageUrl }
                            : item.sex === 'male'
                                ? require('../../../assets/images/Male-profile.png')
                                : require('../../../assets/images/Female-profile.png')
                    }
                />

                <View style={adminUserManagment.userInfo}>
                    <View style={adminUserManagment.nameRow}>
                        <Text style={adminUserManagment.userName} numberOfLines={1}>
                            {item.firstName} {item.lastName}
                        </Text>
                        <View style={[adminUserManagment.roleChip, getRoleChipStyle(item.role)]}>
                            <Text style={[adminUserManagment.roleChipText, getRoleTextStyle(item.role)]}>
                                {capitalize(item.role)}
                            </Text>
                        </View>
                    </View>
                    <Text style={adminUserManagment.userEmail} numberOfLines={1}>
                        {item.email}
                    </Text>
                </View>

                {isAdmin ? (
                    <Icon name="chevron-right" size={20} color={FacultyColors.slate} />
                ) : (
                    <View style={adminUserManagment.rowActions}>
                        <TouchableOpacity
                            style={adminUserManagment.rowActionBtn}
                            onPress={() => handleOpenEdit(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Icon name="edit" size={18} color={FacultyColors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[adminUserManagment.rowActionBtn, adminUserManagment.rowActionBtnDanger]}
                            onPress={() => handleDeleteUser(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Icon name="trash" size={18} color={FacultyColors.red} />
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={adminUserManagment.safeArea}>
            <View style={adminUserManagment.container}>
                <BubbleBackground />
                {/* COMPACT HEADER */}
                <View style={adminUserManagment.headerRow}>
                    <TouchableOpacity onPress={toggleMenu} style={adminUserManagment.menuBtn}>
                        <Icon name="menu" size={24} color={FacultyColors.ink} />
                    </TouchableOpacity>
                    <Text style={adminUserManagment.title}>User Management</Text>
                    <View style={adminUserManagment.headerActions}>
                        {/* <TouchableOpacity onPress={() => Alert.alert('Export', 'Export functionality not implemented yet.')} style={adminUserManagment.exportBtn}>
                            <Icon name="download" size={18} color={FacultyColors.primary} />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={handleOpenAdd} style={adminUserManagment.addBtn}>
                            <Icon name="plus" size={20} color={FacultyColors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sidebar navigation */}
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
                <View style={adminUserManagment.content}>
                    {/* SEARCH BAR */}
                    <View style={adminUserManagment.searchContainer}>
                        <Icon name="search" size={18} color={FacultyColors.slate} />
                        <TextInput
                            style={adminUserManagment.searchInput}
                            placeholder="Search by name or email..."
                            placeholderTextColor={FacultyColors.slate}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="x" size={18} color={FacultyColors.slate} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* FILTER CHIPS */}
                    <View style={adminUserManagment.filterChipsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={adminUserManagment.filterChipsContent}>
                            {(['All', 'student', 'faculty', 'admin'] as const).map((role) => {
                                const isActive = role === 'All' ? selectedRole === undefined : selectedRole === role;
                                return (
                                    <TouchableOpacity
                                        key={role}
                                        style={[adminUserManagment.chip, isActive && adminUserManagment.chipActive]}
                                        onPress={() => handleRoleFilter(role === 'All' ? undefined : role as UserRole)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[adminUserManagment.chipText, isActive && adminUserManagment.chipTextActive]}>
                                            {role === 'All' ? 'All' : capitalize(role)}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>

                    {/* USER COUNT */}
                    <View style={adminUserManagment.userCountContainer}>
                        <Text style={adminUserManagment.userCount}>
                            Showing {users.length} {users.length === 1 ? 'user' : 'users'}
                        </Text>
                    </View>

                    {/* ERROR STATE */}
                    {error && (
                        <View style={adminUserManagment.errorContainer}>
                            <Text style={adminUserManagment.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* USER LIST */}
                    <View style={adminUserManagment.listWrapper}>

                        <FlatList
                            data={users}
                            renderItem={renderUserItem}
                            keyExtractor={(item) => item.uid}
                            contentContainerStyle={adminUserManagment.listContainer}
                            showsVerticalScrollIndicator={false}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            refreshControl={
                                <RefreshControl
                                    refreshing={loading && users.length === 0}
                                    onRefresh={handleRefresh}
                                />
                            }
                            ListEmptyComponent={
                                !loading ? (
                                    <View style={adminUserManagment.emptyContainer}>
                                        <Icon name="users" size={48} color={FacultyColors.slate} />
                                        <Text style={adminUserManagment.emptyTitle}>
                                            {searchDebounce ? 'No users found' : 'No users available'}
                                        </Text>
                                        <Text style={adminUserManagment.emptyText}>
                                            {searchDebounce
                                                ? 'Try adjusting your search or filters.'
                                                : 'There are no users to display at this time.'}
                                        </Text>
                                    </View>
                                ) : null
                            }
                            ListFooterComponent={
                                loading && users.length > 0 ? (
                                    <ActivityIndicator
                                        size="large"
                                        color={FacultyColors.primary}
                                        style={adminUserManagment.loader}
                                    />
                                ) : hasMore && !searchDebounce && users.length >= 60 ? (
                                    <TouchableOpacity
                                        style={adminUserManagment.loadMoreButton}
                                        onPress={handleLoadMore}
                                    >
                                        <Text style={adminUserManagment.loadMoreText}>Load More</Text>
                                    </TouchableOpacity>
                                ) : null
                            }
                        />
                    </View>
                </View>

                {/* ADMIN EDIT MODAL (BOTTOM SHEET) */}
                <Modal visible={editVisible} transparent animationType="slide">
                    <TouchableOpacity
                        style={adminUserManagment.modalBackdrop}
                        onPress={() => !savingEdit && setEditVisible(false)}
                        activeOpacity={1}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={adminUserManagment.modalSheet}
                        >
                            <TouchableOpacity activeOpacity={1} style={{ flexShrink: 1 }}>
                                <View style={adminUserManagment.sheetHandle} />
                                <Text style={adminUserManagment.modalTitle}>Edit User</Text>

                                <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
                                    <Text style={adminUserManagment.modalSectionTitle}>Personal Information</Text>

                                    <Text style={adminUserManagment.modalLabel}>First Name</Text>
                                    <TextInput
                                        style={adminUserManagment.modalInput}
                                        value={editForm.firstName}
                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, firstName: text }))}
                                    />

                                    <Text style={adminUserManagment.modalLabel}>Middle Name</Text>
                                    <TextInput
                                        style={adminUserManagment.modalInput}
                                        value={editForm.middleName}
                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, middleName: text }))}
                                    />

                                    <Text style={adminUserManagment.modalLabel}>Last Name</Text>
                                    <TextInput
                                        style={adminUserManagment.modalInput}
                                        value={editForm.lastName}
                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, lastName: text }))}
                                    />

                                    <View style={adminUserManagment.modalRow}>
                                        <View style={adminUserManagment.modalRowItem}>
                                            <Text style={adminUserManagment.modalLabel}>Birthdate</Text>
                                            <TextInput
                                                style={adminUserManagment.modalInput}
                                                placeholder="YYYY-MM-DD"
                                                placeholderTextColor={FacultyColors.slate}
                                                value={editForm.dateOfBirth}
                                                onChangeText={(text) => setEditForm(prev => ({ ...prev, dateOfBirth: text }))}
                                            />
                                        </View>
                                    </View>

                                    <Text style={adminUserManagment.modalLabel}>Sex</Text>
                                    <View style={adminUserManagment.pillRow}>
                                        {['male', 'female'].map(s => (
                                            <TouchableOpacity
                                                key={s}
                                                style={[adminUserManagment.selectorPill, editForm.sex === s && adminUserManagment.selectorPillActive]}
                                                onPress={() => setEditForm(prev => ({ ...prev, sex: s }))}
                                            >
                                                <Text style={[adminUserManagment.selectorText, editForm.sex === s && adminUserManagment.selectorTextActive]}>
                                                    {capitalize(s)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={adminUserManagment.modalSectionTitle}>Account Details</Text>

                                    <Text style={adminUserManagment.modalLabel}>Email</Text>
                                    <TextInput
                                        style={adminUserManagment.modalInput}
                                        value={editForm.email}
                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />

                                    <Text style={adminUserManagment.modalLabel}>Role</Text>
                                    <View style={adminUserManagment.pillRow}>
                                        {(['student', 'faculty', 'admin'] as UserRole[]).map(r => (
                                            <TouchableOpacity
                                                key={r}
                                                style={[adminUserManagment.selectorPill, editForm.role === r && adminUserManagment.selectorPillActive]}
                                                onPress={() => setEditForm(prev => ({ ...prev, role: r }))}
                                            >
                                                <Text style={[adminUserManagment.selectorText, editForm.role === r && adminUserManagment.selectorTextActive]}>
                                                    {capitalize(r)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {editForm.role === 'student' ? (
                                        <>
                                            <Text style={adminUserManagment.modalLabel}>Grade Level</Text>
                                            <TextInput
                                                style={adminUserManagment.modalInput}
                                                placeholder="e.g. 3"
                                                placeholderTextColor={FacultyColors.slate}
                                                value={editForm.gradeLevel}
                                                onChangeText={(text) => setEditForm(prev => ({ ...prev, gradeLevel: text }))}
                                                keyboardType="numeric"
                                            />
                                        </>
                                    ) : editForm.role === 'faculty' ? (
                                        <>
                                            <Text style={adminUserManagment.modalLabel}>Assigned Grade Levels</Text>
                                            <TextInput
                                                style={adminUserManagment.modalInput}
                                                placeholder="e.g. 1,2,3"
                                                placeholderTextColor={FacultyColors.slate}
                                                value={editForm.assignedGradeLevels}
                                                onChangeText={(text) => setEditForm(prev => ({ ...prev, assignedGradeLevels: text }))}
                                            />
                                        </>
                                    ) : null}

                                    <Text style={adminUserManagment.modalLabel}>Password</Text>
                                    <TouchableOpacity
                                        style={adminUserManagment.loadMoreButton}
                                        onPress={handleSendPasswordReset}
                                    >
                                        <Text style={adminUserManagment.loadMoreText}>
                                            Send Password Reset Email
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={[adminUserManagment.adminBannerText, { marginTop: 8, marginBottom: 16 }]}>
                                        The user will receive an email with a link to set a new password. Admins cannot set passwords directly without a backend.
                                    </Text>
                                </ScrollView>

                                <View style={adminUserManagment.modalActions}>
                                    <TouchableOpacity
                                        style={adminUserManagment.cancelBtn}
                                        onPress={() => setEditVisible(false)}
                                        disabled={savingEdit}
                                    >
                                        <Text style={adminUserManagment.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={adminUserManagment.saveBtn}
                                        onPress={handleSaveEdit}
                                        disabled={savingEdit}
                                    >
                                        <Text style={adminUserManagment.saveText}>
                                            {savingEdit ? 'Saving...' : 'Save Changes'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </TouchableOpacity>
                </Modal>

                {/* ADD USER MODAL (BOTTOM SHEET) */}
                <Modal visible={addVisible} transparent animationType="slide">
                    <TouchableOpacity
                        style={adminUserManagment.modalBackdrop}
                        onPress={() => !savingAdd && setAddVisible(false)}
                        activeOpacity={1}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={adminUserManagment.modalSheet}
                        >
                            <TouchableOpacity activeOpacity={1} style={{ flexShrink: 1 }}>
                                <View style={adminUserManagment.sheetHandle} />
                                <Text style={adminUserManagment.modalTitle}>Add New User</Text>

                                <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
                                    {addError && (
                                        <View style={adminUserManagment.errorContainer}>
                                            <Text style={adminUserManagment.errorText}>{addError}</Text>
                                        </View>
                                    )}

                                    <Text style={adminUserManagment.modalSectionTitle}>Account</Text>

                                    <Text style={adminUserManagment.modalLabel}>Email</Text>
                                    <TextInput
                                        style={adminUserManagment.modalInput}
                                        value={addForm.email}
                                        onChangeText={(text) => setAddForm(prev => ({ ...prev, email: text }))}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholder="user@example.com"
                                        placeholderTextColor={FacultyColors.slate}
                                    />

                                    <Text style={adminUserManagment.modalLabel}>Password</Text>
                                    <View style={adminUserManagment.passwordFieldWrapper}>
                                        <TextInput
                                            style={adminUserManagment.passwordInput}
                                            value={addForm.password}
                                            onChangeText={(text) => setAddForm(prev => ({ ...prev, password: text }))}
                                            secureTextEntry={!showAddPassword}
                                            autoCapitalize="none"
                                            placeholder="At least 6 characters"
                                            placeholderTextColor={FacultyColors.slate}
                                        />
                                        <TouchableOpacity
                                            style={adminUserManagment.eyeToggle}
                                            onPress={() => setShowAddPassword(prev => !prev)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Icon name={showAddPassword ? 'eye-off' : 'eye'} size={20} color={FacultyColors.slate} />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={adminUserManagment.modalLabel}>Confirm Password</Text>
                                    <View style={adminUserManagment.passwordFieldWrapper}>
                                        <TextInput
                                            style={adminUserManagment.passwordInput}
                                            value={addForm.confirmPassword}
                                            onChangeText={(text) => setAddForm(prev => ({ ...prev, confirmPassword: text }))}
                                            secureTextEntry={!showAddConfirm}
                                            autoCapitalize="none"
                                            placeholder="Re-enter password"
                                            placeholderTextColor={FacultyColors.slate}
                                        />
                                        <TouchableOpacity
                                            style={adminUserManagment.eyeToggle}
                                            onPress={() => setShowAddConfirm(prev => !prev)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Icon name={showAddConfirm ? 'eye-off' : 'eye'} size={20} color={FacultyColors.slate} />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={adminUserManagment.modalLabel}>Role</Text>
                                    <View style={adminUserManagment.pillRow}>
                                        {(['student', 'faculty', 'admin'] as UserRole[]).map(r => (
                                            <TouchableOpacity
                                                key={r}
                                                style={[adminUserManagment.selectorPill, addForm.role === r && adminUserManagment.selectorPillActive]}
                                                onPress={() => setAddForm(prev => ({ ...prev, role: r, gradeLevel: 0, assignedGradeLevels: [] }))}
                                            >
                                                <Text style={[adminUserManagment.selectorText, addForm.role === r && adminUserManagment.selectorTextActive]}>
                                                    {capitalize(r)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={adminUserManagment.modalSectionTitle}>Personal Information</Text>

                                    <Text style={adminUserManagment.modalLabel}>First Name</Text>
                                    <TextInput
                                        style={adminUserManagment.modalInput}
                                        value={addForm.firstName}
                                        onChangeText={(text) => setAddForm(prev => ({ ...prev, firstName: text }))}
                                    />

                                    <Text style={adminUserManagment.modalLabel}>Middle Name (optional)</Text>
                                    <TextInput
                                        style={adminUserManagment.modalInput}
                                        value={addForm.middleName}
                                        onChangeText={(text) => setAddForm(prev => ({ ...prev, middleName: text }))}
                                    />

                                    <Text style={adminUserManagment.modalLabel}>Last Name</Text>
                                    <TextInput
                                        style={adminUserManagment.modalInput}
                                        value={addForm.lastName}
                                        onChangeText={(text) => setAddForm(prev => ({ ...prev, lastName: text }))}
                                    />

                                    <Text style={adminUserManagment.modalLabel}>Sex</Text>
                                    <View style={adminUserManagment.pillRow}>
                                        {['male', 'female'].map(s => (
                                            <TouchableOpacity
                                                key={s}
                                                style={[adminUserManagment.selectorPill, addForm.sex === s && adminUserManagment.selectorPillActive]}
                                                onPress={() => setAddForm(prev => ({ ...prev, sex: s }))}
                                            >
                                                <Text style={[adminUserManagment.selectorText, addForm.sex === s && adminUserManagment.selectorTextActive]}>
                                                    {capitalize(s)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {addForm.role !== 'admin' && (
                                        <>
                                            <Text style={adminUserManagment.modalLabel}>Birthdate (optional)</Text>
                                            <TextInput
                                                style={adminUserManagment.modalInput}
                                                placeholder="YYYY-MM-DD"
                                                placeholderTextColor={FacultyColors.slate}
                                                value={addForm.dateOfBirth}
                                                onChangeText={(text) => setAddForm(prev => ({ ...prev, dateOfBirth: text }))}
                                            />
                                        </>
                                    )}

                                    {addForm.role === 'student' && (
                                        <>
                                            <Text style={adminUserManagment.modalLabel}>Grade Level</Text>
                                            <View style={adminUserManagment.gradeChipsRow}>
                                                {[1, 2, 3, 4, 5, 6].map(g => {
                                                    const active = addForm.gradeLevel === g;
                                                    return (
                                                        <TouchableOpacity
                                                            key={g}
                                                            style={[adminUserManagment.gradeChip, active && adminUserManagment.gradeChipActive]}
                                                            onPress={() => setAddForm(prev => ({ ...prev, gradeLevel: g }))}
                                                        >
                                                            <Text style={[adminUserManagment.gradeChipText, active && adminUserManagment.gradeChipTextActive]}>
                                                                {g}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </>
                                    )}

                                    {addForm.role === 'faculty' && (
                                        <>
                                            <Text style={adminUserManagment.modalLabel}>Assigned Grade Levels (tap to toggle)</Text>
                                            <View style={adminUserManagment.gradeChipsRow}>
                                                {[1, 2, 3, 4, 5, 6].map(g => {
                                                    const active = addForm.assignedGradeLevels.includes(g);
                                                    return (
                                                        <TouchableOpacity
                                                            key={g}
                                                            style={[adminUserManagment.gradeChip, active && adminUserManagment.gradeChipActive]}
                                                            onPress={() => toggleAddGradeLevel(g)}
                                                        >
                                                            <Text style={[adminUserManagment.gradeChipText, active && adminUserManagment.gradeChipTextActive]}>
                                                                {g}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </>
                                    )}
                                </ScrollView>

                                <View style={adminUserManagment.modalActions}>
                                    <TouchableOpacity
                                        style={adminUserManagment.cancelBtn}
                                        onPress={() => setAddVisible(false)}
                                        disabled={savingAdd}
                                    >
                                        <Text style={adminUserManagment.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={adminUserManagment.saveBtn}
                                        onPress={handleSubmitAdd}
                                        disabled={savingAdd}
                                    >
                                        <Text style={adminUserManagment.saveText}>
                                            {savingAdd ? 'Creating...' : 'Create User'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </TouchableOpacity>
                </Modal>
            </View>
        </SafeAreaView>
    );
}
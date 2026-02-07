import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../../Components/GlobalUse/Sidebar';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { useGetUsers } from '../../Hooks/Admin/use_getAllUsers';
import { UserDocument, UserRole } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import upperNav from '../../UI_Designs/UpperNavigation';
import adminUserManagment from '../../UI_Designs/AdminUserManagementStyles';

export default function AdminUserManagement() {
    // STATE MANAGEMENT
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    // HOOKS
    const { handleLogout, handleReplaceStep, handleNavigateToUserDetail } = useNavigationHelper();
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

    // MENU ITEMS
    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: require('../../../assets/icons/Dashboard-icon.png'),
            onPress: () => handleReplaceStep('AdminDashboard'),
        },
        {
            id: 'user-management',
            label: 'User Management',
            icon: require('../../../assets/icons/UserManagement-icon.png'),
            onPress: () => handleReplaceStep('AdminUserManagement'),
        },
        {
            id: 'activity-logs',
            label: 'Activity Logs',
            icon: require('../../../assets/icons/Logs-icon.png'),
            onPress: () => { },
        },
    ];

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

    // HANDLE USER CARD PRESS - Navigate to user detail view
    const handleUserPress = (user: UserDocument) => {
        // Pass user data to the detail screen
        if (user.role === 'student'){
            return handleNavigateToUserDetail({
              uid: user.uid,
              firstName: user.firstName,
              middleName: user.middleName,
              lastName: user.lastName,
              role: user.role,
              sex: user.sex,
              reading_Level: user.studentData?.reading_Level
            });
        }else if (user.role === 'faculty'){
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
    };

    // Get role icon based on user role
    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'student':
                return '🎓';
            case 'faculty':
                return '👨‍🏫';
            case 'admin':
                return '👤';
            default:
                return '👤';
        }
    };

    // RENDER USER ITEM
    const renderUserItem = ({ item, index }: { item: UserDocument; index: number }) => (
        <TouchableOpacity
            style={[adminUserManagment.userCard, { marginTop: index === 0 ? 0 : 12 }]}
            onPress={() => handleUserPress(item)}
            activeOpacity={0.7}
        >
            <View style={adminUserManagment.userCardContent}>
                {/* User Avatar with Role Icon */}
                <View style={adminUserManagment.avatarContainer}>
                    <Image
                        style={adminUserManagment.userAvatar}
                        source={
                            item.profileImageUrl
                                ? { uri: item.profileImageUrl }
                                : require('../../../assets/images/defaultProfile.png')
                        }
                    />
                    <View style={adminUserManagment.roleIconBadge}>
                        <Text style={adminUserManagment.roleIconText}>
                            {getRoleIcon(item.role)}
                        </Text>
                    </View>
                </View>

                {/* User Info */}
                <View style={adminUserManagment.userInfo}>
                    <Text style={adminUserManagment.userName} numberOfLines={1}>
                        {item.firstName} {item.lastName}
                    </Text>
                    <Text style={adminUserManagment.userEmail} numberOfLines={1}>
                        {item.email}
                    </Text>

                    <View style={adminUserManagment.userMetaRow}>
                        <View style={adminUserManagment.userMetaChip}>
                            <Text style={adminUserManagment.userMetaLabel}>Role</Text>
                            <Text style={adminUserManagment.userMetaValue}>
                                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                            </Text>
                        </View>
                        {item.studentData && (
                            <View style={adminUserManagment.userMetaChip}>
                                <Text style={adminUserManagment.userMetaLabel}>Grade</Text>
                                <Text style={adminUserManagment.userMetaValue}>
                                    {item.studentData.gradeLevel}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Arrow Icon */}
                <View style={adminUserManagment.arrowContainer}>
                    <Text style={adminUserManagment.arrowButton}>→</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={adminUserManagment.safeArea}>
            <View style={adminUserManagment.container}>
                {/* BUBBLE BACKGROUND DECORATION */}
                <View style={bubbles.bubblesContainer}>
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

                {/* SIDEBAR */}
                <Sidebar
                    visible={sidebarVisible}
                    onClose={() => setSidebarVisible(false)}
                    onLogout={handleLogoutPress}
                    currentRoute="dashboard"
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
                    {/* HEADER SECTION */}
                    <View style={adminUserManagment.headerSection}>
                        <Text style={adminUserManagment.title}>User Management</Text>
                        <Text style={adminUserManagment.subtitle}>
                            Manage students, faculty, and administrators
                        </Text>
                    </View>

                    {/* SEARCH BAR */}
                    <View style={adminUserManagment.searchContainer}>
                        <Image
                            style={adminUserManagment.searchIcon}
                            source={require('../../../assets/icons/Search-icon.png')}
                        />
                        <TextInput
                            style={adminUserManagment.searchInput}
                            placeholder="Search by name or email..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* ROLE FILTER TABS */}
                    <View style={adminUserManagment.filterTabs}>
                        <TouchableOpacity
                            style={[
                                adminUserManagment.filterTab,
                                selectedRole === undefined && adminUserManagment.filterTabActive,
                            ]}
                            onPress={() => handleRoleFilter(undefined)}
                        >
                            <Text
                                style={[
                                    adminUserManagment.filterTabText,
                                    selectedRole === undefined && adminUserManagment.filterTabTextActive,
                                ]}
                            >
                                All
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                adminUserManagment.filterTab,
                                selectedRole === 'student' && adminUserManagment.filterTabActive,
                            ]}
                            onPress={() => handleRoleFilter('student')}
                        >
                            <Text
                                style={[
                                    adminUserManagment.filterTabText,
                                    selectedRole === 'student' && adminUserManagment.filterTabTextActive,
                                ]}
                            >
                                Students
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                adminUserManagment.filterTab,
                                selectedRole === 'faculty' && adminUserManagment.filterTabActive,
                            ]}
                            onPress={() => handleRoleFilter('faculty')}
                        >
                            <Text
                                style={[
                                    adminUserManagment.filterTabText,
                                    selectedRole === 'faculty' && adminUserManagment.filterTabTextActive,
                                ]}
                            >
                                Faculty
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                adminUserManagment.filterTab,
                                selectedRole === 'admin' && adminUserManagment.filterTabActive,
                            ]}
                            onPress={() => handleRoleFilter('admin')}
                        >
                            <Text
                                style={[
                                    adminUserManagment.filterTabText,
                                    selectedRole === 'admin' && adminUserManagment.filterTabTextActive,
                                ]}
                            >
                                Admins
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* USER COUNT */}
                    <Text style={adminUserManagment.userCount}>
                        {users.length} {searchDebounce ? 'result(s)' : 'total users'}
                    </Text>

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
                                        <Text style={adminUserManagment.emptyIcon}>👥</Text>
                                        <Text style={adminUserManagment.emptyTitle}>
                                            {searchDebounce ? 'No users found' : 'No users available'}
                                        </Text>
                                        <Text style={adminUserManagment.emptyText}>
                                            {searchDebounce
                                                ? 'Try adjusting your search or filter'
                                                : 'Users will appear here once added'}
                                        </Text>
                                    </View>
                                ) : null
                            }
                            ListFooterComponent={
                                loading && users.length > 0 ? (
                                    <ActivityIndicator
                                        size="large"
                                        color="#3B82F6"
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
            </View>
        </SafeAreaView>
    );
}
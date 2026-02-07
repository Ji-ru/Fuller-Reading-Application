import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import bubbles from '../../UI_Designs/BubblesDesign';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import adminDashboard from '../../UI_Designs/AdminDashboardStyles';
import Sidebar from '../../Components/GlobalUse/Sidebar';

export default function AdminDashboard() {
    // STATE MANAGEMENT
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
    const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
    // HOOKS
    const { handleLogout, handleReplaceStep } = useNavigationHelper();

    // SIDEBAR MENU ITEMS
    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: require('../../../assets/icons/Dashboard-icon.png'), // Add your icon
            onPress: () => handleReplaceStep('AdminDashboard'),
        },
        {
            id: 'user-management',
            label: 'User Management',
            icon: require('../../../assets/icons/UserManagement-icon.png'), // Add your icon
            onPress: () => handleReplaceStep('AdminUserManagement'),
            // onPress: () => { }
        },
        {
            id: 'activity-logs',
            label: 'Activity Logs',
            icon: require('../../../assets/icons/Logs-icon.png'), // Add your icon
            // onPress: () => handleReplaceStep('ActivityLogs'),
            onPress: () => { }
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: require('../../../assets/icons/Settings-icon.png'), // Add your icon
            // onPress: () => handleReplaceStep('Settings'),
            onPress: () => { }
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

    return (
        <SafeAreaView style={adminDashboard.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={adminDashboard.container}>

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
                    <View style={adminDashboard.content}>
                        <Text>ADMIN DASHBOARD</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );


};

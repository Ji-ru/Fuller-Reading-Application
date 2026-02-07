import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
    ScrollView,
} from 'react-native';

interface SidebarItem {
    id: string;
    label: string;
    icon: any; // require() image source
    onPress: () => void;
}

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
    onLogout: () => void;
    currentRoute?: string;
    menuItems: SidebarItem[];
}

export default function Sidebar({
    visible,
    onClose,
    onLogout,
    currentRoute,
    menuItems,
}: SidebarProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Overlay */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                {/* Sidebar Container */}
                <View style={styles.sidebarContainer}>
                    <TouchableOpacity activeOpacity={1}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Image
                                    style={styles.logo}
                                    source={require('../../../assets/images/cisckids.png')}
                                />
                                <Text style={styles.headerText}>Admin Panel</Text>
                            </View>

                            {/* Menu Items */}
                            <View style={styles.menuSection}>
                                {menuItems.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.menuItem,
                                            currentRoute === item.id && styles.menuItemActive,
                                        ]}
                                        onPress={() => {
                                            item.onPress();
                                            onClose();
                                        }}
                                    >
                                        <Image source={item.icon} style={styles.menuIcon} />
                                        <Text
                                            style={[
                                                styles.menuText,
                                                currentRoute === item.id && styles.menuTextActive,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Logout Button */}
                            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                                <Image
                                    source={require('../../../assets/icons/Logout-icon.png')}
                                    style={styles.logoutIcon}
                                />
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
    },
    sidebarContainer: {
        width: '75%',
        maxWidth: 300,
        height: '100%',
        backgroundColor: '#FFFFFF',
        paddingTop: 50,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    menuSection: {
        paddingTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginHorizontal: 10,
        borderRadius: 8,
    },
    menuItemActive: {
        backgroundColor: '#E3F2FD',
    },
    menuIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 15,
        tintColor: '#666',
    },
    menuText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    menuTextActive: {
        color: '#1976D2',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 20,
        marginHorizontal: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        verticalAlign: 'bottom',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#FFEBEE',
    },
    logoutIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 15,
        tintColor: '#D32F2F',
    },
    logoutText: {
        fontSize: 16,
        color: '#D32F2F',
        fontWeight: '600',
    },
});
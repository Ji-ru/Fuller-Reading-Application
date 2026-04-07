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
import { sw, sh, sf } from '../../Utils/responsive';

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
          <View style={styles.overlay}>
      
            {/* Background overlay (click to close) */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={onClose}
            />
      
            {/* Sidebar */}
            <View style={styles.sidebarContainer}>
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
            </View>
      
          </View>
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
        maxWidth: sw(300),
        height: '100%',
        backgroundColor: '#FFFFFF',
        paddingTop: sh(50),
        paddingBottom: sh(20),
        shadowColor: '#000',
        shadowOffset: { width: sw(2), height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: sw(5),
        elevation: 10,
    },
    header: {
        paddingHorizontal: sw(20),
        paddingVertical: sh(20),
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    logo: {
        width: sw(80),
        height: sw(80),
        resizeMode: 'contain',
        marginBottom: sh(10),
    },
    headerText: {
        fontSize: sf(18),
        fontWeight: '700',
        color: '#333',
    },
    menuSection: {
        paddingTop: sh(20),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: sh(15),
        paddingHorizontal: sw(20),
        marginHorizontal: sw(10),
        borderRadius: sw(8),
    },
    menuItemActive: {
        backgroundColor: '#E3F2FD',
    },
    menuIcon: {
        width: sw(24),
        height: sw(24),
        resizeMode: 'contain',
        marginRight: sw(15),
        tintColor: '#666',
    },
    menuText: {
        fontSize: sf(16),
        color: '#666',
        fontWeight: '500',
    },
    menuTextActive: {
        color: '#1976D2',
        fontWeight: '700',
    },
    divider: {
        height: sw(1),
        backgroundColor: '#E0E0E0',
        marginVertical: sh(20),
        marginHorizontal: sw(20),
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        verticalAlign: 'bottom',
        paddingVertical: sh(15),
        paddingHorizontal: sw(20),
        marginHorizontal: sw(10),
        borderRadius: sw(8),
        backgroundColor: '#FFEBEE',
    },
    logoutIcon: {
        width: sw(24),
        height: sw(24),
        resizeMode: 'contain',
        marginRight: sw(15),
        tintColor: '#D32F2F',
    },
    logoutText: {
        fontSize: sf(16),
        color: '#D32F2F',
        fontWeight: '600',
    },
});
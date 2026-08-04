import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { sw, sh, sf } from '../../Utils/responsive';
import { Icon, IconName } from './Icon';
import { FacultyColors } from '../../Utilities/Theme';

interface SidebarItem {
  id: string;
  label: string;
  iconName: IconName;
  onPress: () => void;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentRoute?: string;
  menuItems: SidebarItem[];
}

const APP_VERSION = '1.0.0';

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
        {/* Tap-outside backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sidebar panel */}
        <View style={styles.sidebarContainer}>
          {/* ── Header (fixed) ─────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerAccentBar} />
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerLogo}>CISC KIDS</Text>
              <Text style={styles.headerSubtitle}>Admin Portal</Text>
            </View>
          </View>

          {/* ── Scrollable menu region ─────────────────────────────────── */}
          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => {
                    item.onPress();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  {/* Active indicator bar */}
                  <View
                    style={[
                      styles.activeIndicator,
                      isActive && styles.activeIndicatorVisible,
                    ]}
                  />
                  <View style={styles.menuIconWrap}>
                    <Icon
                      name={item.iconName}
                      size={sw(22)}
                      color={isActive ? FacultyColors.primary : '#5C7064'}
                      filled={isActive}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuText,
                      isActive && styles.menuTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Footer (pinned) ────────────────────────────────────────── */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <Icon name="x" size={sw(20)} color="#D64550" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
  },

  sidebarContainer: {
    width: '78%',
    maxWidth: sw(310),
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: sw(4), height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: sw(8),
    elevation: 12,
  },

  // ── Header ───────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: sh(56),
    paddingBottom: sh(22),
    paddingHorizontal: sw(20),
    backgroundColor: '#F4FBF6',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F0E7',
  },
  headerAccentBar: {
    width: sw(4),
    height: sh(34),
    borderRadius: sw(2),
    backgroundColor: FacultyColors.primary,
    marginRight: sw(12),
  },
  headerTextWrap: {
    flex: 1,
  },
  headerLogo: {
    fontSize: sf(20),
    fontFamily: 'Nunito-Black',
    color: FacultyColors.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: FacultyColors.inkLight,
    marginTop: sh(2),
    letterSpacing: 0.3,
  },

  // ── Menu region ──────────────────────────────────────────────────────
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingTop: sh(16),
    paddingBottom: sh(16),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(13),
    paddingRight: sw(16),
    marginHorizontal: sw(8),
    marginVertical: sh(2),
    borderRadius: sw(10),
  },
  menuItemActive: {
    backgroundColor: 'rgba(0, 132, 67, 0.10)',
  },
  activeIndicator: {
    width: sw(3),
    height: sh(22),
    borderRadius: sw(2),
    backgroundColor: 'transparent',
    marginRight: sw(12),
  },
  activeIndicatorVisible: {
    backgroundColor: FacultyColors.primary,
  },
  menuIconWrap: {
    width: sw(28),
    alignItems: 'center',
    marginRight: sw(12),
  },
  menuText: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: '#5C7064',
  },
  menuTextActive: {
    fontFamily: 'Nunito-ExtraBold',
    color: FacultyColors.primary,
  },

  // ── Footer ───────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: sw(16),
    paddingTop: sh(12),
    paddingBottom: sh(20),
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#E3F0E7',
    marginBottom: sh(12),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: sh(13),
    paddingHorizontal: sw(14),
    borderRadius: sw(10),
    backgroundColor: '#FDECEE',
    gap: sw(10),
  },
  logoutText: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: '#D64550',
  },
  versionText: {
    marginTop: sh(12),
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: '#9CB1A2',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

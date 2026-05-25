import { StyleSheet } from "react-native";
import { sw, sh, sf } from '../Utils/responsive';
import { FacultyColors } from '../Utilities/Theme';

const facultyDashboard = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: FacultyColors.bg,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: sw(16),
      paddingBottom: sh(32),
    },

    // ─── Hero Header Card ────────────────────────────────────────────────────────
    heroCard: {
      marginHorizontal: sw(16),
      marginTop: sh(12),
      marginBottom: sh(24),
      backgroundColor: FacultyColors.primaryDeep,
      borderRadius: sw(24),
      paddingVertical: sh(24),
      paddingHorizontal: sw(22),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: FacultyColors.primaryDeep,
      shadowOffset: { width: 0, height: sw(8) },
      shadowOpacity: 0.35,
      shadowRadius: sw(16),
      elevation: 10,
    },
    heroCardLeft: {
      flex: 1,
    },
    heroGreeting: {
      fontSize: sf(13),
      color: 'rgba(255,255,255,0.75)',
      fontFamily: 'Satoshi-Regular',
      marginBottom: sh(4),
    },
    heroTitle: {
      fontSize: sf(26),
      fontFamily: 'Satoshi-Black',
      color: '#FFFFFF',
    },
    heroIconWrap: {
      width: sw(52),
      height: sw(52),
      borderRadius: sw(16),
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroIcon: {
      fontSize: sf(26),
      color: '#FFFFFF',
    },

    // ─── Top bar (menu button row) ───────────────────────────────────────────────
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: sw(16),
      paddingTop: sh(8),
      paddingBottom: sh(4),
    },
    menuBtn: {
      width: sw(44),
      height: sw(44),
      borderRadius: sw(14),
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(2) },
      shadowOpacity: 0.08,
      shadowRadius: sw(6),
      elevation: 3,
    },
    dropdown: {
      position: 'absolute',
      top: sh(62),
      right: sw(16),
      backgroundColor: '#FFFFFF',
      borderRadius: sw(14),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(4) },
      shadowOpacity: 0.14,
      shadowRadius: sw(12),
      elevation: 10,
      minWidth: sw(160),
      zIndex: 1000,
      paddingVertical: sh(4),
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: sw(16),
      paddingVertical: sh(14),
    },
    dropdownIcon: {
      width: sw(20),
      height: sw(20),
      marginRight: sw(12),
      tintColor: FacultyColors.primary,
    },
    dropdownText: {
      fontSize: sf(15),
      fontFamily: 'Satoshi-Bold',
      color: FacultyColors.primary,
    },
    dropdownTextAbout: {
      fontSize: sf(15),
      fontFamily: 'Satoshi-Bold',
      color: FacultyColors.slate,
      marginLeft: sw(12),
    },
    dropdownDivider: {
      height: 1,
      marginHorizontal: sw(12),
      backgroundColor: '#E3F0E7',
    },

    // ─── Section Label ───────────────────────────────────────────────────────────
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: sh(10),
      marginTop: sh(4),
    },
    sectionLabel: {
      fontSize: sf(11),
      fontFamily: 'Satoshi-Bold',
      color: FacultyColors.inkLight,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    sectionDot: {
      width: sw(10),
      height: sw(10),
      borderRadius: sw(5),
      backgroundColor: FacultyColors.primaryLight,
      opacity: 0.5,
    },

    // ─── Stats Cards ─────────────────────────────────────────────────────────────
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: sh(24),
      gap: sw(12),
    },
    statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingVertical: sh(20),
      paddingHorizontal: sw(14),
      borderRadius: sw(18),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(2) },
      shadowOpacity: 0.06,
      shadowRadius: sw(8),
      elevation: 3,
    },
    statValue: {
      fontSize: sf(28),
      fontFamily: 'Satoshi-Black',
      color: FacultyColors.primary,
      marginTop: sh(6),
    },
    statLabel: {
      fontSize: sf(11),
      fontFamily: 'Satoshi-Bold',
      color: FacultyColors.slate,
      marginTop: sh(4),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    iconContainer: {
      width: sw(44),
      height: sw(44),
      borderRadius: sw(12),
      backgroundColor: '#e8f5ee',
      justifyContent: 'center',
      alignItems: 'center',
    },
    icons: {
      width: sw(26),
      height: sw(26),
      tintColor: FacultyColors.primary,
    },

    // ─── Loading / Error / No Data ────────────────────────────────────────────────
    loadingContainer: {
      padding: sw(40),
      alignItems: 'center',
    },
    loadingText: {
      marginTop: sh(10),
      color: FacultyColors.inkLight,
      fontFamily: 'Satoshi-Regular',
    },
    errorContainer: {
      padding: sw(40),
      backgroundColor: '#FFE5E5',
      borderRadius: sw(12),
      alignItems: 'center',
    },
    errorText: {
      color: FacultyColors.red,
      fontFamily: 'Satoshi-Bold',
      marginBottom: sh(8),
    },
    errorSubtext: {
      color: '#666',
      textAlign: 'center',
    },
    noDataContainer: {
      padding: sw(40),
      backgroundColor: '#F0F0F0',
      borderRadius: sw(12),
      alignItems: 'center',
    },
    noDataText: {
      fontSize: sf(18),
      fontFamily: 'Satoshi-Bold',
      color: '#666',
      marginBottom: sh(8),
    },
    noDataSubtext: {
      color: '#888',
      textAlign: 'center',
    },

    // ─── Filters Card ────────────────────────────────────────────────────────────
    filtersCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: sw(18),
      padding: sw(18),
      paddingBottom: sh(16),
      marginBottom: sh(24),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(1) },
      shadowOpacity: 0.05,
      shadowRadius: sw(8),
      elevation: 2,
      overflow: 'visible',
      zIndex: 1001,
    },
    filtersTitle: {
      fontSize: sf(16),
      fontFamily: 'Satoshi-Bold',
      color: FacultyColors.ink,
      marginBottom: sh(4),
    },
    filtersSubtitle: {
      fontSize: sf(12),
      fontFamily: 'Satoshi-Regular',
      color: FacultyColors.slate,
      marginBottom: sh(14),
    },
    filtersRow: {
      flexDirection: 'row',
      gap: sw(12),
      zIndex: 1000,
      overflow: 'visible',
    },
    filterItem: {
      flex: 1,
      zIndex: 1000,
      overflow: 'visible',
    },
    filterLabel: {
      fontSize: sf(10),
      fontFamily: 'Satoshi-Bold',
      color: FacultyColors.inkLight,
      marginBottom: sh(8),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    filterButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f2f8f4',
      borderRadius: sw(12),
      paddingVertical: sh(12),
      paddingHorizontal: sw(14),
      borderWidth: 1.5,
      borderColor: '#c5e3d0',
    },
    filterButtonActive: {
      borderColor: FacultyColors.primary,
      backgroundColor: '#e8f5ee',
    },
    filterButtonText: {
      fontSize: sf(13),
      color: FacultyColors.ink,
      fontFamily: 'Satoshi-Bold',
      flex: 1,
      marginRight: sw(8),
    },
    filterButtonIcon: {
      fontSize: sf(11),
      color: FacultyColors.slate,
    },
    filterDropdownMenu: {
      position: 'absolute',
      top: sh(70),
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: sw(12),
      borderWidth: 1,
      borderColor: '#c5e3d0',
      maxHeight: sh(280),
      elevation: 10,
      zIndex: 9999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(6) },
      shadowOpacity: 0.12,
      shadowRadius: sw(10),
      overflow: 'visible',
    },
    filterDropdownOption: {
      paddingVertical: sh(14),
      paddingHorizontal: sw(16),
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    filterDropdownOptionLast: {
      borderBottomWidth: 0,
    },
    filterDropdownOptionActive: {
      backgroundColor: '#e8f5ee',
    },
    filterDropdownOptionText: {
      fontSize: sf(14),
      color: FacultyColors.slate,
      fontFamily: 'Satoshi-Regular',
    },
    filterDropdownOptionTextActive: {
      color: FacultyColors.primary,
      fontFamily: 'Satoshi-Bold',
    },

    // ─── Legacy aliases (kept for sub-components that import these keys) ─────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sw(16),
      paddingTop: sh(12),
      paddingBottom: sh(8),
      zIndex: 100,
    },
    headerLogo: {
      fontSize: sf(18),
      fontFamily: 'Nunito-Black',
      color: FacultyColors.primary,
      letterSpacing: 0.5,
    },
  });

  export default facultyDashboard;

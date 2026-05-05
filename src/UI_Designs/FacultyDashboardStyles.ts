import { StyleSheet } from "react-native";
import { sw, sh, sf } from '../Utils/responsive';

const facultyDashboard = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    container: {
      padding: sw(5),
    },
    content: {
      padding: sw(10),
    },
    dashboardTitle: {
      fontSize: sf(28),
      fontFamily: 'Satoshi-Black',
      color: '#333',
      marginBottom: sh(8),
    },
    dashboardSubtitle: {
      fontSize: sf(16),
      color: '#666',
      marginBottom: sh(24),
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: sh(15),
    },
    statCard: {
      flex: 1,
      backgroundColor: 'white',
      padding: sw(15),
      borderRadius: sw(12),
      alignItems: 'center',
      marginHorizontal: sw(5),
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(1) },
      shadowOpacity: 0.22,
      shadowRadius: sw(2.22),
    },
    statValue: {
      fontSize: sf(24),
      fontWeight: 'bold',
      color: '#4ECDC4',
    },
    statLabel: {
      fontSize: sf(12),
      color: '#666',
      marginTop: sh(4),
    },
    loadingContainer: {
      padding: sw(40),
      alignItems: 'center',
    },
    loadingText: {
      marginTop: sh(10),
      color: '#666',
    },
    errorContainer: {
      padding: sw(40),
      backgroundColor: '#FFE5E5',
      borderRadius: sw(12),
      alignItems: 'center',
    },
    errorText: {
      color: '#FF6B6B',
      fontWeight: 'bold',
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
      fontWeight: 'bold',
      color: '#666',
      marginBottom: sh(8),
    },
    noDataSubtext: {
      color: '#888',
      textAlign: 'center',
    },
    iconContainer:{
      flexDirection: 'row',
      alignItems: 'center',
    },
    icons: {
      width: sw(32),
      height: sw(32),
    },

    // Filter
    filtersRow: {
      flexDirection: 'row',
      gap: sw(12),
      marginBottom: sh(16),
      zIndex: 1000,
    },
    filterItem: {
      flex: 1,
      zIndex: 1000,
    },
    filterLabel: {
      fontSize: sf(12),
      fontFamily: 'Satoshi-Medium',
      color: '#7F8C8D',
      marginBottom: sh(6),
    },
    filterButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#F8F9FA',
      borderRadius: sw(8),
      paddingVertical: sh(10),
      paddingHorizontal: sw(12),
      borderWidth: 1,
      borderColor: '#E9ECEF',
    },
    filterButtonText: {
      fontSize: sf(14),
      color: '#2C3E50',
      fontFamily: 'Satoshi-Medium',
      flex: 1,
      marginRight: sw(8),
    },
    filterDropdownMenu: {
      position: 'absolute',
      top: sh(62),
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: sw(8),
      borderWidth: 1,
      borderColor: '#E9ECEF',
      maxHeight: sh(240),
      elevation: 5,
      zIndex: 2000,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(4) },
      shadowOpacity: 0.15,
      shadowRadius: sw(8),
    },
    filterDropdownOption: {
      paddingVertical: sh(12),
      paddingHorizontal: sw(14),
      borderBottomWidth: 0.5,
      borderBottomColor: '#F0F0F0',
    },
    filterDropdownOptionActive: {
      backgroundColor: '#E8F8F7',
    },
    filterDropdownOptionText: {
      fontSize: sf(14),
      color: '#555',
      fontFamily: 'Satoshi-Regular',
    },
    filterDropdownOptionTextActive: {
      color: '#4ECDC4',
      fontFamily: 'Satoshi-Medium',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sw(20),
      paddingTop: sh(12),
      paddingBottom: sh(8),
      zIndex: 100,
    },
    headerLogo: {
      fontSize: sf(18),
      fontFamily: 'Nunito-Black',
      color: '#2ca96a',
      letterSpacing: 0.5,
    },
    menuBtn: {
      width: sw(48), height: sw(48),
      borderRadius: sw(14),
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(2) },
      shadowOpacity: 0.08, shadowRadius: sw(6), elevation: 3,
    },
    dropdown: {
      position: 'absolute', top: sh(72), right: sw(20),
      backgroundColor: '#ffffff', borderRadius: sw(14),
      shadowColor: '#000', shadowOffset: { width: 0, height: sw(4) },
      shadowOpacity: 0.14, shadowRadius: sw(12), elevation: 10,
      minWidth: sw(160), zIndex: 1000, paddingVertical: sh(4),
    },
    dropdownItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: sw(16), paddingVertical: sh(14),
    },
    dropdownIcon: { width: sw(20), height: sw(20), marginRight: sw(12), tintColor: '#FF7043' },
    dropdownText: { fontSize: sf(15), fontFamily: 'Nunito-Bold', color: '#FF7043' },
  });

  export default facultyDashboard;
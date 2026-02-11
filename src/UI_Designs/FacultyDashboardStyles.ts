import { StyleSheet } from "react-native";

const facultyDashboard = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    container: {
      padding: 5,
    },
    content: {
      padding: 10,
    },
    dashboardTitle: {
      fontSize: 28,
      fontFamily: 'Satoshi-Black',
      color: '#333',
      marginBottom: 8,
    },
    dashboardSubtitle: {
      fontSize: 16,
      color: '#666',
      marginBottom: 24,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    statCard: {
      flex: 1,
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 5,
      elevation: 3,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#4ECDC4',
    },
    statLabel: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: '#666',
    },
    errorContainer: {
      padding: 40,
      backgroundColor: '#FFE5E5',
      borderRadius: 12,
      alignItems: 'center',
    },
    errorText: {
      color: '#FF6B6B',
      fontWeight: 'bold',
      marginBottom: 8,
    },
    errorSubtext: {
      color: '#666',
      textAlign: 'center',
    },
    noDataContainer: {
      padding: 40,
      backgroundColor: '#F0F0F0',
      borderRadius: 12,
      alignItems: 'center',
    },
    noDataText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#666',
      marginBottom: 8,
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
      width: 32,
      height: 32,
    },

    // Filter
    filtersRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
      zIndex: 1000,
    },
    filterItem: {
      flex: 1,
      zIndex: 1000,
    },
    filterLabel: {
      fontSize: 12,
      fontFamily: 'Satoshi-Medium',
      color: '#7F8C8D',
      marginBottom: 6,
    },
    filterButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: '#E9ECEF',
    },
    filterButtonText: {
      fontSize: 14,
      color: '#2C3E50',
      fontFamily: 'Satoshi-Medium',
      flex: 1,
      marginRight: 8,
    },
    filterDropdownMenu: {
      position: 'absolute',
      top: 62,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E9ECEF',
      maxHeight: 240,
      elevation: 5,
      zIndex: 2000,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    filterDropdownOption: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: '#F0F0F0',
    },
    filterDropdownOptionActive: {
      backgroundColor: '#E8F8F7',
    },
    filterDropdownOptionText: {
      fontSize: 14,
      color: '#555',
      fontFamily: 'Satoshi-Regular',
    },
    filterDropdownOptionTextActive: {
      color: '#4ECDC4',
      fontFamily: 'Satoshi-Medium',
    },
  });

  export default facultyDashboard;
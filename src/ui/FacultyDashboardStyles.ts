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
  });

  export default facultyDashboard;
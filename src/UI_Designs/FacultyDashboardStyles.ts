import { StyleSheet } from "react-native";
import { FacultyColors as F, Radii, Shadows } from '../Utilities/Theme';

const facultyDashboard = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: F.bg,
    },
    container: {
      padding: 5,
    },
    content: {
      padding: 10,
    },
    dashboardTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: F.ink,
      marginBottom: 6,
    },
    dashboardSubtitle: {
      fontSize: 14,
      color: F.slate,
      fontWeight: '600',
      marginBottom: 24,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: F.white,
      padding: 18,
      borderRadius: Radii.lg,
      alignItems: 'center',
      ...Shadows.card,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '900',
      color: F.primary,
    },
    statLabel: {
      fontSize: 12,
      color: F.slate,
      fontWeight: '600',
      marginTop: 6,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: F.slate,
      fontWeight: '600',
    },
    errorContainer: {
      padding: 40,
      backgroundColor: '#FFF0F0',
      borderRadius: Radii.md,
      alignItems: 'center',
    },
    errorText: {
      color: F.red,
      fontWeight: '700',
      marginBottom: 8,
    },
    errorSubtext: {
      color: F.slate,
      textAlign: 'center',
    },
    noDataContainer: {
      padding: 40,
      backgroundColor: F.primaryPale,
      borderRadius: Radii.md,
      alignItems: 'center',
    },
    noDataText: {
      fontSize: 18,
      fontWeight: '800',
      color: F.ink,
      marginBottom: 8,
    },
    noDataSubtext: {
      color: F.slate,
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

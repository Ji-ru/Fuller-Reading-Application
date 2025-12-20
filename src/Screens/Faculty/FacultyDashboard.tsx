// FacultyDashboard.tsx (Updated with TypeScript)
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../ui/BubblesDesign';
import upperNav from '../../ui/UpperNavigation';
import LogoutModal from '../../Components/Buttons/LogoutModal';
import BottomNav from '../../Components/NavigationBar/BottomNav';
import PieChart from '../../Components/Faculty/PieChart';
import { useFacultyMiscueStats } from '../../Hooks/useFacultyMiscueStats';

export default function FacultyDashboard() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);

  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleBackStep, handleLogout } = useNavigationHelper();
  
  // Use the custom hook to get miscue statistics
  const { loading, error, stats } = useFacultyMiscueStats();

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* BUBBLE DECORATIONS */}
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
          <TouchableOpacity
            style={upperNav.touchable}
            onPress={() => handleBackStep()}
          >
            <Image
              source={require('../../../assets/icons/BackButton-icon.png')}
            />
          </TouchableOpacity>

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

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity
              onPress={handleLogoutPress}
              style={upperNav.logoutButton}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={upperNav.logoutIcon}
              />
              <Text style={upperNav.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OVERLAY TO CLOSE MENU */}
        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}

        {/* LOGOUT MODAL */}
        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        {/* MAIN CONTENT */}
        <View style={styles.content}>
          <Text style={styles.dashboardTitle}>Faculty Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>
            Reading Performance Overview
          </Text>

          {/* STATS SUMMARY */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalStudents}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.averageAccuracy}%</Text>
              <Text style={styles.statLabel}>Avg. Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalMiscues}</Text>
              <Text style={styles.statLabel}>Total Miscues</Text>
            </View>
          </View>

          {/* PIE CHART */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ECDC4" />
              <Text style={styles.loadingText}>Loading miscue data...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <Text style={styles.errorSubtext}>
                Please check your connection and try again.
              </Text>
            </View>
          ) : stats.miscuePercentages.length > 0 ? (
            <PieChart
              data={stats.miscuePercentages}
              title="Average Reading Accuracy per Miscue Type"
              centerText={`${stats.averageAccuracy}%\nAvg. Accuracy`}
              showLegend={true}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No miscue data available</Text>
              <Text style={styles.noDataSubtext}>
                Start tracking student readings to see statistics here.
              </Text>
            </View>
          )}

          {/* INSTRUCTIONS */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Understanding the Chart</Text>
            <Text style={styles.instructionsText}>
              • Each slice represents the percentage of total miscues by type
              {"\n"}• The center shows the average reading accuracy of all students
              {"\n"}• Colors correspond to different miscue types
            </Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
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
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  instructionsContainer: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
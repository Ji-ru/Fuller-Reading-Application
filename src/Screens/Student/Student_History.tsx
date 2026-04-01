import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import bubbles from '../../UI_Designs/BubblesDesign';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';

interface GroupedReport {
  passageTitle: string;
  reports: ReportData[];
}

interface ReportData {
  id: string;
  timestamp: any;
  accuracyRate: number;
  wordPerMin: number;
  recordingDuration?: string;
  totalMiscues?: number;
  substitution: string;
  omission: string;
  insertion: string;
  repetition: string;
  substitutionCount?: number;
  omissionCount?: number;
  insertionCount?: number;
  repetitionCount?: number;
  miscues?: any[];
}

export default function ReadingHistoryScreen() {
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPassages, setExpandedPassages] = useState<Set<number>>(new Set());

  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const { handleLogout, handleBackStep } = useNavigationHelper();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth().currentUser;

      if (!user) {
        Alert.alert('Error', 'No authenticated user found');
        return;
      }

      const reports = await MiscueReportController.getStudentReports(user.uid);
      setGroupedReports(groupReportsByPassage(reports));
    } catch (error) {
      Alert.alert('Error', 'Failed to load reading history');
    } finally {
      setIsLoading(false);
    }
  };

  const groupReportsByPassage = (
    reports: MiscueReportDocument[],
  ): GroupedReport[] => {
    const map = new Map<string, ReportData[]>();

    reports.forEach(report => {
      const title = report.passageTitle || 'Unknown Passage';

      if (!map.has(title)) map.set(title, []);

      map.get(title)?.push({
        id: report.reportId,
        timestamp: report.timestamp,
        accuracyRate: report.accuracyRate || 0,
        wordPerMin: report.wordPerMin || 0,
        recordingDuration: report.recordingDuration,
        substitution: report.substitution || 'None',
        omission: report.omission || 'None',
        insertion: report.insertion || 'None',
        repetition: report.repetition || 'None',
        miscues: report.miscues || [],
        totalMiscues: (report as any).totalMiscues,
        substitutionCount: (report as any).substitutionCount,
        omissionCount: (report as any).omissionCount,
        insertionCount: (report as any).insertionCount,
        repetitionCount: (report as any).repetitionCount,
      });
    });

    return Array.from(map.entries()).map(([passageTitle, reports]) => ({
      passageTitle,
      reports: reports.sort((a, b) => {
        const A = a.timestamp?.toDate?.() || new Date(0);
        const B = b.timestamp?.toDate?.() || new Date(0);
        return B.getTime() - A.getTime();
      }),
    }));
  };

  const togglePassageExpansion = (index: number) => {
    setExpandedPassages(prev => {
      const set = new Set(prev);
      set.has(index) ? set.delete(index) : set.add(index);
      return set;
    });
  };

  const formatDate = (timestamp: any) => {
    try {
      const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown Date';
    }
  };

  const formatDuration = (duration?: string | number) => {
    if (!duration && duration !== 0) return 'N/A';

    if (typeof duration === 'string') return duration;

    const mins = Math.floor((duration as number) / 60);
    const secs = Math.floor((duration as number) % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalMiscues = (r: ReportData) =>
    r.totalMiscues ?? r.miscues?.length ?? 0;

  const getAccuracyColor = (a: number) => {
    if (a >= 90) return '#4CAF50';
    if (a >= 75) return '#FFC107';
    return '#F44336';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Loading reading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (groupedReports.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#211C52' }}>
            Walang nakaraang pagbabasa
          </Text>
          <Text style={{ marginTop: 10, color: '#666' }}>
            Simulan ang pagbasa para makita ang iyong pag-unlad
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>

        {/* BUBBLES */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
        </View>

        {/* HEADER */}
        <View style={upperNav.header}>
          <TouchableOpacity onPress={handleBackStep}>
            <Image source={require('../../../assets/icons/BackButton-icon.png')} />
          </TouchableOpacity>

          <Image
            style={upperNav.ciscLogo}
            source={require('../../../assets/images/cisckids.png')}
          />

          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Image source={require('../../../assets/icons/Menu-icon.png')} />
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Nakaraang Pagbabasa
          </Text>
        </View>

        {groupedReports.map((group, i) => {
          const expanded = expandedPassages.has(i);

          return (
            <View key={i} style={{ marginBottom: 16, paddingHorizontal: 16 }}>

              {/* PASSAGE */}
              <TouchableOpacity
                onPress={() => togglePassageExpansion(i)}
                style={{
                  padding: 16,
                  backgroundColor: '#cde8f5',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#211C52' }}>
                    {group.passageTitle}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    {group.reports.length} attempts
                  </Text>
                </View>

                <Text style={{ fontSize: 18 }}>
                  {expanded ? '−' : '+'}
                </Text>
              </TouchableOpacity>

              {/* REPORTS */}
              {expanded && group.reports.map(report => {
                const totalMiscues = getTotalMiscues(report);

                return (
                  <View
                    key={report.id}
                    style={{
                      marginTop: 10,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: getAccuracyColor(report.accuracyRate),
                      backgroundColor: '#fff',
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
                      {formatDate(report.timestamp)}
                    </Text>

                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: getAccuracyColor(report.accuracyRate),
                        marginBottom: 4,
                      }}
                    >
                      Katumpakan: {report.accuracyRate.toFixed(2)}%
                    </Text>

                    <Text style={{ fontSize: 14, color: '#444' }}>
                      Bilis: {report.wordPerMin} WPM
                    </Text>

                    <Text style={{ fontSize: 14, color: '#444' }}>
                      Tagal: {formatDuration(report.recordingDuration)}
                    </Text>

                    <Text style={{ fontSize: 14, color: '#444' }}>
                      Kabuuang Mali: {totalMiscues}
                    </Text>

                    {totalMiscues === 0 && (
                      <Text style={{ marginTop: 8, color: '#4CAF50', fontWeight: '500' }}>
                        Mahusay! Walang natukoy na pagkakamali.
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        <LogoutModal
          visible={logoutVisible}
          onCancel={() => setLogoutVisible(false)}
          onConfirm={handleLogout}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
import { getAuth } from '@react-native-firebase/auth';
import { useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView,
  StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FacultySideMenu from '../../Components/Faculty/NavigationBar/FacultySideMenu';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import {
  BarChartIcon, BurgerIcon, ChevronRightIcon, SearchIcon,
  TrendUpIcon, TrophyIcon, UsersIcon, AlertTriangleIcon,
  CheckCircleIcon, BookOpenIcon, TargetIcon,
} from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { ReportController, ClassSummary, StudentReport, StudentSummary } from '../../Controller/ReportController';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';

const { width: SW } = Dimensions.get('window');
type TabKey = 'class' | 'student';

export default function FacultyReports() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('class');
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassDocument | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Report data
  const [classSummary, setClassSummary] = useState<ClassSummary | null>(null);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const { handleLogout } = useNavigationHelper();
  const route = useRoute();

  const fetchClasses = useCallback(async () => {
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;
      const c = await getFacultyClasses_Student.getFacultyClasses(uid);
      setClasses(c);
      if (c.length > 0) setSelectedClass(c[0]);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  // Load report when class or tab changes
  useEffect(() => {
    if (!selectedClass) return;
    const load = async () => {
      setReportLoading(true);
      try {
        if (activeTab === 'class') {
          const s = await ReportController.getClassSummary(selectedClass);
          setClassSummary(s);
        }
      } catch (e) { console.warn('Report load error:', e); }
      finally { setReportLoading(false); }
    };
    load();
  }, [selectedClass, activeTab]);

  const loadStudentReport = async (s: StudentSummary) => {
    setActiveTab('student');
    setReportLoading(true);
    try {
      if (!selectedClass) return;
      const r = await ReportController.getStudentReport(s.uid, s.name, selectedClass.classCode);
      setStudentReport(r);
    } catch (e) { console.warn(e); }
    finally { setReportLoading(false); }
  };

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };

  const getTrendLabel = (t: string) => {
    if (t === 'improving') return { text: 'Umuunlad', color: '#1a9985' };
    if (t === 'needs_practice') return { text: 'Kailangan Magsanay', color: F.red };
    return { text: 'Matatag', color: F.primary };
  };

  // ─── CLASS SELECTOR (DROPDOWN) ─────────────────────────────────────
  const renderClassSelector = () => (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        style={S.dropdownBtn}
        onPress={() => setDropdownVisible(true)}
        activeOpacity={0.7}
      >
        <View style={S.dropdownLeft}>
          <View style={S.dropdownIcon}>
            <BookOpenIcon size={18} color={F.primary} />
          </View>
          <View>
            <Text style={S.dropdownLabel}>Klase</Text>
            <Text style={S.dropdownValue}>{selectedClass?.className || selectedClass?.classCode || 'Pumili ng klase'}</Text>
          </View>
        </View>
        <ChevronRightIcon size={18} color={F.slate} />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal visible={dropdownVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={S.dropdownOverlay}>
            <TouchableWithoutFeedback>
              <View style={S.dropdownModal}>
                <View style={S.dropdownModalHeader}>
                  <Text style={S.dropdownModalTitle}>Pumili ng Klase</Text>
                  <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                    <Text style={S.dropdownCloseText}>Isara</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                  {classes.map(c => {
                    const isSelected = selectedClass?.classId === c.classId;
                    return (
                      <TouchableOpacity
                        key={c.classId}
                        style={[S.dropdownItem, isSelected && S.dropdownItemActive]}
                        onPress={() => { setSelectedClass(c); setDropdownVisible(false); }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[S.dropdownItemText, isSelected && S.dropdownItemTextActive]}>
                            {c.className || c.classCode}
                          </Text>
                          <Text style={S.dropdownItemMeta}>Grade {c.gradeLevel} • {c.classCode}</Text>
                        </View>
                        {isSelected && <CheckCircleIcon size={20} color={F.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );

  // ─── CLASS REPORT TAB ────────────────────────────────────────────────
  const renderClassReport = () => {
    if (!classSummary) return null;
    return (
      <View>
        {/* Hero: Class Average */}
        <View style={S.avgCard}>
          <View style={S.avgCircle}>
            <Text style={S.avgNum}>{classSummary.classAverage}%</Text>
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text style={S.avgLabel}>Average ng Klase</Text>
            <Text style={S.avgSub}>{classSummary.studentCount} mag-aaral • {classSummary.className}</Text>
          </View>
        </View>

        {/* Common Mistakes */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <AlertTriangleIcon size={18} color={F.orange} />
            <Text style={S.sectionTitle}>Kadalasang Mali</Text>
          </View>
          {classSummary.commonMistakes.length === 0 ? (
            <Text style={S.emptyText}>Wala pang datos</Text>
          ) : (
            classSummary.commonMistakes.map((m, i) => (
              <View key={i} style={S.mistakeRow}>
                <Text style={S.mistakeWord}>"{m.word}"</Text>
                <Text style={S.mistakeCount}>{m.count}x</Text>
              </View>
            ))
          )}
        </View>

        {/* Needs Help */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <AlertTriangleIcon size={18} color={F.red} />
            <Text style={S.sectionTitle}>Nangangailangan ng Tulong</Text>
          </View>
          {classSummary.needsHelp.length === 0 ? (
            <Text style={S.emptyText}>Lahat ay magaling! 🎉</Text>
          ) : (
            classSummary.needsHelp.map(s => {
              const trend = getTrendLabel(s.trend);
              return (
                <TouchableOpacity key={s.uid} style={S.studentRow} onPress={() => loadStudentReport(s)}>
                  <View style={[S.rankBadge, { backgroundColor: F.red + '15' }]}>
                    <AlertTriangleIcon size={14} color={F.red} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={S.studentName}>{s.name}</Text>
                    <Text style={[S.trendBadgeText, { color: trend.color }]}>{trend.text}</Text>
                  </View>
                  <View style={[S.scorePill, { backgroundColor: F.red + '15' }]}>
                    <Text style={[S.scoreText, { color: F.red }]}>{s.averageScore}%</Text>
                  </View>
                  <ChevronRightIcon size={16} color={F.slate} />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>
    );
  };

  // ─── STUDENT REPORT TAB ──────────────────────────────────────────────
  const renderStudentReport = () => {
    if (!studentReport) {
      if (!classSummary || classSummary.allStudents.length === 0) {
        return <Text style={S.emptyText}>Walang mag-aaral sa klaseng ito.</Text>;
      }
      return (
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <UsersIcon size={18} color={F.primary} />
            <Text style={S.sectionTitle}>Pumili ng Mag-aaral</Text>
          </View>
          {classSummary.allStudents.map((s, i) => {
            const trend = getTrendLabel(s.trend);
            return (
              <TouchableOpacity key={s.uid} style={S.studentRow} onPress={() => loadStudentReport(s)}>
                <View style={S.avatarBoxSmall}>
                  <Text style={S.avatarTextSmall}>{s.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={S.studentName}>{s.name}</Text>
                  <Text style={[S.trendBadgeText, { color: trend.color }]}>{trend.text}</Text>
                </View>
                <View style={[S.scorePill, { backgroundColor: F.primary + '15' }]}>
                  <Text style={[S.scoreText, { color: F.primary }]}>{s.averageScore}%</Text>
                </View>
                <ChevronRightIcon size={16} color={F.slate} />
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    const trend = getTrendLabel(studentReport.trend);
    return (
      <View>
        {/* Back Button */}
        <TouchableOpacity style={S.backToListBtn} onPress={() => setStudentReport(null)}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ChevronRightIcon size={20} color={F.primaryDeep} />
          </View>
          <Text style={S.backToListText}>Bumalik sa Listahan</Text>
        </TouchableOpacity>

        {/* Student Header */}
        <View style={S.studentHeader}>
          <View style={S.studentAvatar}>
            <Text style={S.avatarText}>{studentReport.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={S.studentHeaderName}>{studentReport.name}</Text>
            <Text style={S.studentHeaderMeta}>Baitang {studentReport.gradeLevel}</Text>
          </View>
          <View style={[S.trendPill, { backgroundColor: trend.color + '18' }]}>
            <Text style={[S.trendPillText, { color: trend.color }]}>{trend.text}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={S.statsGrid}>
          <View style={S.statBox}>
            <TargetIcon size={20} color={F.primary} />
            <Text style={S.statVal}>{studentReport.averageScore}%</Text>
            <Text style={S.statLabel}>Avg Iskor</Text>
          </View>
          <View style={S.statBox}>
            <BookOpenIcon size={20} color={F.primary} />
            <Text style={S.statVal}>{studentReport.aralinCompleted}/25</Text>
            <Text style={S.statLabel}>Aralin</Text>
          </View>
          <View style={S.statBox}>
            <TrendUpIcon size={20} color={F.primary} />
            <Text style={S.statVal}>{studentReport.lessonsCompleted}/{studentReport.totalLessons}</Text>
            <Text style={S.statLabel}>Pagsusulit</Text>
          </View>
        </View>

        {/* Score History */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <BarChartIcon size={18} color={F.primary} />
            <Text style={S.sectionTitle}>Kasaysayan ng Iskor</Text>
          </View>
          {studentReport.assessmentHistory.length === 0 ? (
            <Text style={S.emptyText}>Wala pang pagsusulit</Text>
          ) : (
            studentReport.assessmentHistory.slice(-10).map((h, i) => (
              <View key={i} style={S.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.historyTitle}>{h.title}</Text>
                  <Text style={S.historyMeta}>Aralin {h.aralinIndex} • {h.score}/{h.totalItems}</Text>
                </View>
                <View style={S.historyBar}>
                  <View style={[S.historyFill, { width: `${Math.min(h.percentage, 100)}%`, backgroundColor: h.percentage >= 75 ? '#1a9985' : h.percentage >= 50 ? F.orange : F.red }]} />
                </View>
                <Text style={S.historyPct}>{h.percentage}%</Text>
              </View>
            ))
          )}
        </View>

        {/* Common Mistakes */}
        {studentReport.commonMistakes.length > 0 && (
          <View style={S.section}>
            <View style={S.sectionHeader}>
              <AlertTriangleIcon size={18} color={F.orange} />
              <Text style={S.sectionTitle}>Karaniwang Pagkakamali</Text>
            </View>
            {studentReport.commonMistakes.map((m, i) => (
              <View key={i} style={S.mistakeRow}>
                <Text style={S.mistakeWord}>"{m.word}"</Text>
                <Text style={S.mistakeCount}>{m.count}x</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };



  // ─── TABS ────────────────────────────────────────────────────────────
  const TABS: { key: TabKey; label: string }[] = [
    { key: 'class', label: 'Klase' },
    { key: 'student', label: 'Mag-aaral' },
  ];

  return (
    <SafeAreaView style={S.safe}>
      <View style={S.container}>
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        </View>

        {/* Header */}
        <View style={S.headerRow}>
          <TouchableOpacity style={S.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
            <BurgerIcon size={24} color={F.ink} />
          </TouchableOpacity>
          <Image style={S.logo} source={require('../../../assets/images/cisckids copy.png')} resizeMode="contain" />
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <BounceIn delay={100}>
            <View style={S.heroCard}>
              <View>
                <Text style={S.heroSub}>Ulat at Pagsusuri</Text>
                <Text style={S.heroTitle}>Mga Ulat</Text>
              </View>
              <BarChartIcon size={48} color={F.primaryLight} />
            </View>
          </BounceIn>

          {/* Class Selector */}
          {loading ? (
            <ActivityIndicator size="large" color={F.primary} />
          ) : (
            <>
              {renderClassSelector()}

              {/* Tab Bar */}
              <View style={S.tabBar}>
                {TABS.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[S.tab, activeTab === t.key && S.tabActive]}
                    onPress={() => setActiveTab(t.key)}
                  >
                    <Text style={[S.tabText, activeTab === t.key && S.tabTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Content */}
              {reportLoading ? (
                <View style={S.loadingBox}>
                  <ActivityIndicator size="large" color={F.primary} />
                  <Text style={S.loadingText}>Nilo-load ang ulat...</Text>
                </View>
              ) : (
                <>
                  {activeTab === 'class' && renderClassReport()}
                  {activeTab === 'student' && renderStudentReport()}
                </>
              )}
            </>
          )}
        </ScrollView>

        <FacultySideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} onLogout={handleLogoutPress} currentRoute={route.name} />
        <LogoutModal visible={logoutVisible} onCancel={() => setLogoutVisible(false)} onConfirm={async () => { setLogoutVisible(false); await handleLogout(); }} />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: F.bg },
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
  logo: { width: 100, height: 90 },
  menuBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: F.white, justifyContent: 'center', alignItems: 'center', ...Shadows.subtle },

  heroCard: { backgroundColor: F.primaryDeep, borderRadius: Radii.xl, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, ...Shadows.cardLift },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: F.white },

  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: F.white, borderRadius: Radii.lg, padding: 16, ...Shadows.card },
  dropdownLeft: { flexDirection: 'row', alignItems: 'center' },
  dropdownIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  dropdownLabel: { fontSize: 10, fontWeight: '700', color: F.slate, textTransform: 'uppercase', letterSpacing: 0.5 },
  dropdownValue: { fontSize: 15, fontWeight: '800', color: F.ink, marginTop: 2 },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 28 },
  dropdownModal: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, ...Shadows.cardLift },
  dropdownModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f3f6' },
  dropdownModalTitle: { fontSize: 18, fontWeight: '900', color: F.ink },
  dropdownCloseText: { fontSize: 14, fontWeight: '700', color: F.primary },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 4 },
  dropdownItemActive: { backgroundColor: F.primary + '10' },
  dropdownItemText: { fontSize: 15, fontWeight: '700', color: F.ink },
  dropdownItemTextActive: { color: F.primaryDeep, fontWeight: '800' },
  dropdownItemMeta: { fontSize: 11, color: F.slate, marginTop: 2 },

  tabBar: { flexDirection: 'row', backgroundColor: F.white + '90', borderRadius: 16, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: F.primaryDeep, ...Shadows.card },
  tabText: { fontSize: 13, fontWeight: '800', color: F.slate },
  tabTextActive: { color: F.white },

  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, color: F.slate, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: F.slate, fontWeight: '600', paddingVertical: 20 },

  // Class Report
  avgCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 20, ...Shadows.card },
  avgCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: F.primary },
  avgNum: { fontSize: 22, fontWeight: '900', color: F.primaryDeep },
  avgLabel: { fontSize: 16, fontWeight: '900', color: F.ink },
  avgSub: { fontSize: 12, color: F.slate, fontWeight: '600', marginTop: 4 },

  section: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 16, ...Shadows.card },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: F.ink, marginLeft: 10 },

  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  rankBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 14, fontWeight: '900', color: F.white },
  studentName: { fontSize: 14, fontWeight: '700', color: F.ink },
  studentMeta: { fontSize: 11, color: F.slate, marginTop: 2 },
  scorePill: { backgroundColor: F.primary + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  scoreText: { fontSize: 13, fontWeight: '800', color: F.primary },
  trendBadgeText: { fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Student Report
  avatarBoxSmall: { width: 36, height: 36, borderRadius: 12, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center' },
  avatarTextSmall: { fontSize: 16, fontWeight: '900', color: F.primaryDeep },
  backToListBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  backToListText: { fontSize: 14, fontWeight: '800', color: F.primaryDeep, marginLeft: 4 },

  studentHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 16, ...Shadows.card },
  studentAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: F.primaryDeep, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '900', color: F.white },
  studentHeaderName: { fontSize: 18, fontWeight: '900', color: F.ink },
  studentHeaderMeta: { fontSize: 12, color: F.slate, fontWeight: '600', marginTop: 2 },
  trendPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  trendPillText: { fontSize: 11, fontWeight: '800' },

  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: F.white, borderRadius: Radii.lg, padding: 16, alignItems: 'center', ...Shadows.card },
  statVal: { fontSize: 18, fontWeight: '900', color: F.ink, marginVertical: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', color: F.slate, textTransform: 'uppercase' },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  historyTitle: { fontSize: 13, fontWeight: '700', color: F.ink },
  historyMeta: { fontSize: 10, color: F.slate, marginTop: 2 },
  historyBar: { width: 60, height: 8, backgroundColor: '#f0f3f6', borderRadius: 4, marginHorizontal: 10, overflow: 'hidden' },
  historyFill: { height: '100%', borderRadius: 4 },
  historyPct: { fontSize: 13, fontWeight: '800', color: F.ink, width: 40, textAlign: 'right' },

  mistakeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  mistakeWord: { fontSize: 14, fontWeight: '700', color: F.ink },
  mistakeCount: { fontSize: 13, fontWeight: '800', color: F.red },

});

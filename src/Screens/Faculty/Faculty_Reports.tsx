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
  BarChartIcon, BurgerIcon, ChevronRightIcon,
  CheckCircleIcon, BookOpenIcon, TargetIcon, UsersIcon
} from '../../Components/GlobalUse/Icons';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { ReportController, StudentReport, StudentSummary } from '../../Controller/ReportController';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';

const { width: SW } = Dimensions.get('window');

export default function FacultyReports() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassDocument | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'progress' | 'mistakes'>('progress');

  const { handleLogout } = useNavigationHelper();
  const route = useRoute();
  
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const uid = getAuth().currentUser?.uid;
        if (!uid) return;
        const facultyClasses = await getFacultyClasses_Student.getFacultyClasses(uid);
        setClasses(facultyClasses);
        if (facultyClasses.length > 0) setSelectedClass(facultyClasses[0]);
      } catch (e) { console.warn(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const loadClass = async () => {
      setReportLoading(true);
      try {
        const summary = await ReportController.getClassSummary(selectedClass);
        setStudents(summary.allStudents);
      } catch (e) { console.warn(e); }
      finally { setReportLoading(false); }
    };
    loadClass();
  }, [selectedClass]);

  const loadStudentReport = async (s: StudentSummary) => {
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

  // ─── CLASS SELECTOR ──────────────────────────────────────────────────
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

  // ─── STUDENT LIST (MAIN VIEW) ──────────────────────────────────────────
  const renderStudentList = () => {
    if (students.length === 0) {
      return <Text style={S.emptyText}>Walang mga mag-aaral sa klaseng ito.</Text>;
    }
    return (
      <View style={S.section}>
        <View style={S.sectionHeader}>
          <UsersIcon size={18} color={F.primary} />
          <Text style={S.sectionTitle}>Mga Mag-aaral</Text>
        </View>
        {students.map((s, i) => (
          <TouchableOpacity key={s.uid} style={S.studentRow} onPress={() => loadStudentReport(s)}>
            <View style={S.avatarBoxSmall}>
              <Text style={S.avatarTextSmall}>{s.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={S.studentName}>{s.name}</Text>
              <Text style={S.studentMeta}>Natapos na Aralin</Text>
            </View>
            <View style={[S.scorePill, { backgroundColor: F.primary + '15' }]}>
              <Text style={[S.scoreText, { color: F.primary }]}>{s.aralinCompleted}/25</Text>
            </View>
            <ChevronRightIcon size={16} color={F.slate} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ─── STUDENT DETAIL VIEW ─────────────────────────────────────────────
  const renderStudentDetail = () => {
    if (!studentReport) return null;
    return (
      <View>
        <TouchableOpacity style={S.backToListBtn} onPress={() => setStudentReport(null)}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ChevronRightIcon size={20} color={F.primaryDeep} />
          </View>
          <Text style={S.backToListText}>Bumalik sa Listahan</Text>
        </TouchableOpacity>

        {/* Detail Tabs */}
        <View style={S.tabBar}>
          <TouchableOpacity 
            style={[S.tab, detailTab === 'progress' && S.tabActive]} 
            onPress={() => setDetailTab('progress')}
          >
            <Text style={[S.tabText, detailTab === 'progress' && S.tabTextActive]}>Mga Aralin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[S.tab, detailTab === 'mistakes' && S.tabActive]} 
            onPress={() => setDetailTab('mistakes')}
          >
            <Text style={[S.tabText, detailTab === 'mistakes' && S.tabTextActive]}>Pagkakamali</Text>
          </TouchableOpacity>
        </View>

        <View style={S.section}>
          <View style={S.sectionHeader}>
            <BarChartIcon size={18} color={F.primary} />
            <Text style={S.sectionTitle}>
              {detailTab === 'progress' ? 'Mastery bawat Aralin' : 'Mga Karaniwang Pagkakamali'}
            </Text>
          </View>
          
          <View style={S.aralinList}>
            {detailTab === 'progress' ? (
              studentReport.aralinProgressList.map((a, i) => (
                <View key={i} style={S.aralinRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={S.aralinLabel}>Aralin {a.index}: {a.label}</Text>
                    <View style={S.progressBar}>
                      <View style={[S.progressFill, { width: `${a.percentage}%`, backgroundColor: a.percentage === 100 ? F.primary : a.percentage >= 50 ? F.orange : F.red }]} />
                    </View>
                  </View>
                  <Text style={[S.aralinPct, { color: a.percentage === 100 ? F.primary : a.percentage >= 50 ? F.orange : F.red }]}>
                    {a.percentage}%
                  </Text>
                </View>
              ))
            ) : (
              studentReport.commonMistakes.length > 0 ? (
                studentReport.commonMistakes.map((m, i) => (
                  <View key={i} style={S.mistakeRow}>
                    <View style={S.avatarBoxSmall}>
                      <Text style={S.avatarTextSmall}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={S.mistakeWord}>{m.word}</Text>
                      <Text style={S.studentMeta}>{m.type === 'omission' ? 'Nalampasan' : m.type === 'substitution' ? 'Napalitan' : 'Pagkakamali'}</Text>
                    </View>
                    <View style={[S.scorePill, { backgroundColor: F.red + '15' }]}>
                      <Text style={[S.scoreText, { color: F.red }]}>{m.count} beses</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={S.emptyText}>Walang mga naitalang pagkakamali.</Text>
              )
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={S.safe}>
      <View style={S.container}>
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        </View>

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
                <Text style={S.heroSub}>Pagsubaybay sa Galing</Text>
                <Text style={S.heroTitle}>Mga Ulat</Text>
              </View>
              <BarChartIcon size={48} color={F.primaryLight} />
            </View>
          </BounceIn>

          {loading ? (
            <View style={S.mainLoading}>
              <LoadingDots />
            </View>
          ) : (
            <>
              {!studentReport && renderClassSelector()}
              {reportLoading ? (
                <View style={S.loadingBox}>
                  <LoadingDots />
                  <Text style={S.loadingText}>Nilo-load ang mga ulat...</Text>
                </View>
              ) : (
                <>
                  {studentReport ? renderStudentDetail() : renderStudentList()}
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

  mainLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, color: F.slate, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: F.slate, fontWeight: '600', paddingVertical: 20 },

  section: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 16, ...Shadows.card },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: F.ink, marginLeft: 10 },

  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  studentName: { fontSize: 14, fontWeight: '700', color: F.ink },
  studentMeta: { fontSize: 11, color: F.slate, marginTop: 2 },
  scorePill: { backgroundColor: F.primary + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  scoreText: { fontSize: 13, fontWeight: '800', color: F.primary },

  avatarBoxSmall: { width: 36, height: 36, borderRadius: 12, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center' },
  avatarTextSmall: { fontSize: 16, fontWeight: '900', color: F.primaryDeep },
  backToListBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  backToListText: { fontSize: 14, fontWeight: '800', color: F.primaryDeep, marginLeft: 4 },

  mistakeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  mistakeWord: { fontSize: 14, fontWeight: '700', color: F.ink },

  aralinList: { marginTop: 8 },
  aralinRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  aralinLabel: { fontSize: 13, fontWeight: '700', color: F.ink, marginBottom: 4 },
  progressBar: { height: 6, backgroundColor: '#f0f3f6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  aralinPct: { fontSize: 14, fontWeight: '800', marginLeft: 16, width: 45, textAlign: 'right' },
});

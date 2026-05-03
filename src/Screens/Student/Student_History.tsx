import auth from '@react-native-firebase/auth';
import React, { useEffect, useState, useRef } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { BookOpenIcon, CheckCircleIcon, ClipboardListIcon, FlexIcon, HistoryIcon, PartyIcon, StarIcon, ThumbsUpIcon, TimerIcon, TrophyIcon, ZapIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { AssessmentController } from '../../Controller/AssessmentController';
import { getUserProfile } from '../../Controller/AuthenticationController';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import PassageHistoryTab from '../../Components/Student/PassageHistoryTab';
import PerformanceTab from '../../Components/Student/PerformanceTab';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import { ACCENT_COLORS, StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';

const alphabetData = readingMaterialData?.Alphabet || [];
const wordsData = readingMaterialData?.Words || [];

const { width: SW } = Dimensions.get('window');

// ─── Jumping Dots Loading ───────────────────────────────────────────────────
function DotsLoading() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -10, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,   duration: 400, useNativeDriver: true }),
          Animated.delay(800 - delay),
        ])
      );
    };
    Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 200),
      animate(dot3, 400),
    ]).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 20 }}>
      <Animated.View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.greenDeep, transform: [{ translateY: dot1 }] }} />
      <Animated.View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.green, transform: [{ translateY: dot2 }] }} />
      <Animated.View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.green + '40', transform: [{ translateY: dot3 }] }} />
    </View>
  );
}

// ─── Header Icons ────────────────────────────────────────────────────────────
// No local BackArrow needed, using standardized View style in render

// ─── Types ────────────────────────────────────────────────────────────────────
interface AralinGroupedData {
  aralinIndex: number;
  aralinLabel: string;
  letter: string;
  accent: string;
  activities: ActivityGroup[];
  aralinProgress: number;
  latestTime?: number;
}

interface ActivityGroup {
  type: 'Titik' | 'Salita' | 'Talata';
  title: string;
  reports: ReportData[];
}

interface ReportData {
  id: string;
  timestamp: any;
  accuracyRate: number;
  wordPerMin: number;
  totalWords: number;
  recordingDuration?: string;
  totalMiscues: number;
  substitution: string;
  omission: string;
  insertion: string;
  repetition: string;
  substitutionCount: number;
  omissionCount: number;
  insertionCount: number;
  repetitionCount: number;
  miscues?: any[];
}

// Palette and accent colors imported from Theme

// ─── Helpers ──────────────────────────────────────────────────────────────────
const accColor = (a: number) => a >= 90 ? C.green : a >= 75 ? C.orange : C.red;
const accLabel = (a: number) => a >= 90 ? 'Mahusay!' : a >= 75 ? 'Magaling!' : 'Kaya mo!';

const AccuracyFeedbackIcon = ({ accuracy, size = 18 }: { accuracy: number; size?: number }) => {
  if (accuracy >= 90) return <TrophyIcon size={size} color={C.white} />;
  if (accuracy >= 75) return <ThumbsUpIcon size={size} color={C.white} />;
  return <FlexIcon size={size} color={C.white} />;
};

const MasteryStar = ({ accuracy, size = 14 }: { accuracy: number; size?: number }) => {
  if (accuracy >= 100) return <TrophyIcon size={size} color="#f1c40f" />;
  if (accuracy >= 90) return <StarIcon size={size} color="#f1c40f" />;
  if (accuracy >= 75) return <StarIcon size={size} color="#bdc3c7" />;
  return null;
};

// Skeleton and BounceIn imported from Animations

// (Deleted MiscuePill - superseded by MiscueIcons)

// ─── Miscue Icons (Mini) ────────────────────────────────────────────────────
function MiscueIcons({ report }: { report: ReportData }) {
  const s = Number(report.substitutionCount || 0);
  const o = Number(report.omissionCount || 0);
  const i = Number(report.insertionCount || 0);
  const r = Number(report.repetitionCount || 0);

  if (s + o + i + r === 0) return (
    <View style={[S.perfectBadge, { backgroundColor: C.green + '15' }]}>
      <PartyIcon size={14} color={C.green} />
      <Text style={[S.perfectText, { color: C.green }]}>Walang mali! Ang galing!</Text>
    </View>
  );

  return (
    <View style={S.miscueIconRow}>
      {s > 0 && <View style={[S.miscueBadge, { backgroundColor: C.red + '12' }]}><Text style={[S.miscueBadgeLabel, { color: C.red }]}>✎ {s} Palit</Text></View>}
      {o > 0 && <View style={[S.miscueBadge, { backgroundColor: C.orange + '12' }]}><Text style={[S.miscueBadgeLabel, { color: C.orange }]}>- {o} Kulang</Text></View>}
      {i > 0 && <View style={[S.miscueBadge, { backgroundColor: C.teal + '12' }]}><Text style={[S.miscueBadgeLabel, { color: C.teal }]}>+ {i} Singit</Text></View>}
      {r > 0 && <View style={[S.miscueBadge, { backgroundColor: C.purple + '12' }]}><Text style={[S.miscueBadgeLabel, { color: C.purple }]}>↺ {r} Ulit</Text></View>}
    </View>
  );
}

// ─── Talata Detail Item ──────────────────────────────────────────────────────
function TalataDetailItem({ report, index, accent }: { report: ReportData; index: number; accent: string }) {
  const acc = report.accuracyRate;
  const color = accColor(acc);
  const totalMiscues = report.totalMiscues ?? report.miscues?.length ?? 0;

  const formatDate = (ts: any) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };

  const getStatus = (a: number) => {
    if (a >= 95) return 'Kamangha-mangha!';
    if (a >= 85) return 'Magaling!';
    return 'Kaya mo yan!';
  };

  const stars = acc >= 90 ? 3 : acc >= 75 ? 2 : 1;

  return (
    <View style={[S.talataItem, { borderLeftColor: color }]}>
      <View style={S.talataTopInfo}>
        <View style={S.talataTimeBox}>
          <TimerIcon size={12} color={C.slate} />
          <Text style={S.talataDate}>{formatDate(report.timestamp)}</Text>
        </View>
        <View style={[S.statusBadge, { backgroundColor: color + '12' }]}>
          <Text style={[S.statusBadgeText, { color }]}>{getStatus(acc)}</Text>
        </View>
      </View>

      <View style={S.talataStatsRow}>
        <View style={S.statBox}>
          <View style={{ flexDirection: 'row', gap: 2, marginBottom: 4 }}>
            {[...Array(3)].map((_, i) => (
              <StarIcon key={i} size={10} color={i < stars ? '#f1c40f' : '#bdc3c7'} />
            ))}
          </View>
          <Text style={[S.statVal, { color }]}>{acc.toFixed(0)}%</Text>
          <Text style={S.statLab}>Galing</Text>
        </View>
        <View style={S.statDivider} />
        <View style={S.statBox}>
          <TimerIcon size={14} color={C.slate} />
          <Text style={S.statVal}>{report.recordingDuration || '0:00'}</Text>
          <Text style={S.statLab}>Tagal</Text>
        </View>
        <View style={S.statDivider} />
        <View style={S.statBox}>
          <ZapIcon size={14} color={C.slate} />
          <Text style={S.statVal}>{report.wordPerMin}</Text>
          <Text style={S.statLab}>Bilis</Text>
        </View>
      </View>

      <View style={S.miscueZone}>
        <MiscueIcons report={report} />
      </View>
    </View>
  );
}

// ─── Aralin Mastery Card ─────────────────────────────────────────────────────
function AralinMasteryCard({ group }: { group: AralinGroupedData }) {
  const accent = group.accent;

  // Calculate aggregate stats for this Aralin
  const titikAttempts = group.activities.find(a => a.type === 'Titik')?.reports.length || 0;
  const salitaAttempts = group.activities.find(a => a.type === 'Salita')?.reports.length || 0;
  const talataActivities = group.activities.filter(a => a.type === 'Talata');

  return (
    <BounceIn delay={group.aralinIndex * 50}>
      <View style={[S.aralinCard, { borderTopColor: accent, opacity: group.aralinProgress === 0 ? 0.6 : 1 }]}>
        <View style={S.aralinHeader}>
          <View style={[S.aralinIconCircle, { backgroundColor: group.aralinProgress === 100 ? C.green + '12' : accent + '12' }]}>
            <Text style={[S.aralinLetter, { color: group.aralinProgress === 100 ? C.green : accent }]}>{group.letter}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[S.aralinLabelText, { color: accent }]}>{group.aralinLabel}</Text>
            <Text style={S.aralinTitleText}>Titik {group.letter.toUpperCase()}</Text>



            {/* Progress Bar */}
            <View style={S.aralinProgressWrapper}>
              <View style={S.progMeta}>
                <Text style={[S.progLabel, { color: accent }]}>Progress ng Aralin</Text>
                <Text style={[S.progVal, { color: accent }]}>{group.aralinProgress}%</Text>
              </View>
              <View style={S.progTrack}>
                <View style={[S.progFill, { width: `${group.aralinProgress}%`, backgroundColor: accent }]} />
              </View>
              {group.aralinProgress === 100 && (
                <View style={S.masteryBadge}>
                  <CheckCircleIcon size={12} color={C.white} />
                  <Text style={S.masteryBadgeText}>Tapos Na!</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </BounceIn>
  );
}

// (Deleted old AralinGroup component since we use AralinMasteryCard now)

// Assessment cards omitted from history tab per requirement

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReadingHistoryScreen() {
  const [groupedReports, setGroupedReports] = useState<AralinGroupedData[]>([]);
  const [allReports, setAllReports] = useState<MiscueReportDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<'history' | 'passage' | 'performance'>('history');
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const [aralinDone, setAralinDone] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [studentName, setStudentName] = useState('Mag-aaral');

  const { handleLogout, handleBackStep, handleNextStep } = useNavigationHelper();

  // Tab Slide Animation
  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: activeTab === 'performance' ? 2 : activeTab === 'passage' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth().currentUser;
      if (!user) return;

      const profile = await getUserProfile(user.uid);
      if (profile?.firstName) {
        setStudentName(profile.firstName);
      }

      const [reports, mastered, detailedMastery] = await Promise.all([
        MiscueReportController.getStudentReports(user.uid),
        MiscueReportController.getStudentMasteredLessons(user.uid),
        MiscueReportController.getStudentDetailedCompletion(user.uid)
      ]);

      const grouped = groupReportsByAralin(reports, detailedMastery);
      setGroupedReports(grouped);
      setAllReports(reports as MiscueReportDocument[]);
      setTotalAttempts(reports.length);
      setAralinDone(grouped.length);

    } catch (e) {
      console.log("Error fetching history:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const groupReportsByAralin = (
    reports: MiscueReportDocument[],
    mastery?: { completedAlpha: Set<string>, completedWords: Record<string, Set<string>>, completedPassages: Set<string> }
  ): AralinGroupedData[] => {
    const aralinMap = new Map<number, AralinGroupedData>();

    const getReportAralin = (title: string) => {
      const t = title.toLowerCase();

      // 1. Exact Passage Title Check
      const p = readingMaterialData.Passages.find(p => p.title.toLowerCase() === t);
      if (p) return { idx: (p.aralin ?? 1) - 1, type: 'Talata' as const, letter: '', title: p.title };

      // 2. Format Detection (Alphabet - M, Words for M)
      let letter = '';
      let type: 'Titik' | 'Salita' = 'Titik';

      if (t.includes('alphabet')) {
        letter = t.split('-')[1]?.trim() || '';
        type = 'Titik';
      } else if (t.includes('words for')) {
        letter = t.split('for')[1]?.trim() || '';
        type = 'Salita';
      } else if (t.length <= 3) {
        // Fallback for plain letters
        letter = t.replace(/[^a-z]/g, '').trim().toUpperCase();
        const exists = alphabetData.some(a => a.letter.toUpperCase() === letter);
        if (exists) type = 'Titik';
        else letter = '';
      }

      if (letter) {
        const aIdx = alphabetData.findIndex(a => a.letter.toUpperCase() === letter.toUpperCase());
        if (aIdx !== -1) {
          return {
            idx: aIdx,
            type,
            letter,
            title: type === 'Titik' ? `Titik ${letter.toUpperCase()}` : `Mga Salita (${letter.toUpperCase()})`
          };
        }
      }
      return { idx: 0, type: 'Talata' as const, letter: '', title };
    };

    const getTotalWordsForLetter = (letter: string) => {
      const subset = readingMaterialData.Words.filter(w => w.letter === letter);
      const allWords = subset.flatMap(w => w.contrasts.flatMap(c => c.words));
      const letterLower = letter.toLowerCase();
      const uniqueWords = Array.from(new Set(allWords)).filter(
        word => word.trim().toLowerCase() !== letterLower
      );
      return uniqueWords.length;
    };


    // 1. Initialize with ALL 30 Aralins
    alphabetData.forEach((alpha, idx) => {
      aralinMap.set(idx, {
        aralinIndex: idx,
        aralinLabel: `Aralin ${idx + 1}`,
        letter: alpha.letter,
        activities: [],
        accent: ACCENT_COLORS[idx % ACCENT_COLORS.length],
        aralinProgress: 0,
      });
    });

    // 2. Map existing reports
    reports.forEach(r => {
      const info = getReportAralin(r.passageTitle || '');
      if (info.idx === -1) return;

      const group = aralinMap.get(info.idx);
      if (group) {
        let act = group.activities.find(a => a.title === info.title);
        if (!act) {
          act = { type: info.type, title: info.title, reports: [] };
          group.activities.push(act);
        }
        act.reports.push({
          id: r.reportId,
          timestamp: r.timestamp,
          accuracyRate: r.accuracyRate ?? 0,
          wordPerMin: r.wordPerMin ?? 0,
          totalWords: r.totalWords ?? 0,
          recordingDuration: r.recordingDuration,
          substitution: r.substitution ?? 'None',
          omission: r.omission ?? 'None',
          insertion: r.insertion ?? 'None',
          repetition: r.repetition ?? 'None',
          miscues: r.miscues ?? [],
          totalMiscues: r.totalMiscues ?? (r.miscues?.length || 0),
          substitutionCount: r.substitutionCount || 0,
          omissionCount: r.omissionCount || 0,
          insertionCount: r.insertionCount || 0,
          repetitionCount: r.repetitionCount || 0,
        });
      }
    });

    // 3. Finalize and calculate progress
    return Array.from(aralinMap.values())
      .map(aralin => {
        const allReports = aralin.activities.flatMap(a => a.reports);
        const latestTime = allReports.length > 0
          ? Math.max(...allReports.map(r => {
            const d = r.timestamp?.toDate?.() || new Date(r.timestamp || 0);
            return d.getTime();
          }))
          : 0;

        aralin.activities.sort((a, b) => {
          const order = { 'Titik': 0, 'Salita': 1, 'Talata': 2 };
          return order[a.type] - order[b.type];
        });

        aralin.activities.forEach(act => {
          act.reports.sort((a, b) => {
            const A = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
            const B = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
            return B.getTime() - A.getTime();
          });
        });

        // ── Calculate Granular Progress (Sync with Selection Screen Logic) ──
        let aralinProgress = 0;
        if (mastery) {
          const letter = aralin.letter;
          const isAlphaDone = mastery.completedAlpha.has(letter) ? 1 : 0;
          const wordCount = mastery.completedWords[letter]?.size || 0;
          const totalWords = getTotalWordsForLetter(letter);

          const currentPassages = readingMaterialData.Passages.filter(p => p.aralin === aralin.aralinIndex + 1);
          const passageCount = currentPassages.filter(p => mastery.completedPassages.has(p.title)).length;
          const totalPassages = currentPassages.length;

          const totalPossible = 1 + totalWords + totalPassages;
          const masteredCount = isAlphaDone + Math.min(wordCount, totalWords) + Math.min(passageCount, totalPassages);

          aralinProgress = totalPossible > 0 ? Math.round((masteredCount / totalPossible) * 100) : 0;
        }

        return { ...aralin, latestTime, aralinProgress };
      })
      .sort((a, b) => {
        if (a.latestTime > 0 && b.latestTime > 0) return b.latestTime - a.latestTime;
        if (a.latestTime > 0) return -1;
        if (b.latestTime > 0) return 1;
        return a.aralinIndex - b.aralinIndex;
      });
  };

  // Helper for old toggle logic
  const toggle = (i: number) => { }; // Stub for compat

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={S.bg}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <DotsLoading />
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.slate, marginTop: 10 }}>Kinukuha ang iyong kasaysayan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.bg}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Bubbles */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
        </View>

        {/* Nav */}
        <View style={{ zIndex: 100 }}>
          <View style={S.headerBar}>
            <TouchableOpacity style={S.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
              <View style={S.backArrow} />
            </TouchableOpacity>
            <Image style={S.headerLogo} source={require('../../../assets/images/cisckids copy.png')} resizeMode="contain" />
            <View style={{ width: 44 }} />
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={S.tabContainer}>
          <View style={S.tabBackground}>
            <Animated.View
              style={[
                S.activeTabIndicator,
                {
                  transform: [{
                    translateX: slideAnimation.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [0, (SW - 32 - 8) / 3, (2 * (SW - 32 - 8)) / 3]
                    })
                  }]
                }
              ]}
            />
            <TouchableOpacity 
              style={S.tabButton} 
              onPress={() => setActiveTab('history')}
              activeOpacity={0.8}
            >
              <Text style={[S.tabText, activeTab === 'history' && S.tabTextActive]}>Kasaysayan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={S.tabButton} 
              onPress={() => setActiveTab('passage')}
              activeOpacity={0.8}
            >
              <Text style={[S.tabText, activeTab === 'passage' && S.tabTextActive]}>Mga Talata</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={S.tabButton} 
              onPress={() => setActiveTab('performance')}
              activeOpacity={0.8}
            >
              <Text style={[S.tabText, activeTab === 'performance' && S.tabTextActive]}>Pagganap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'history' ? (
          <View>
            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <BounceIn delay={24}>
              <View style={[S.heroBanner, { backgroundColor: C.greenDeep }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[S.heroSub, { color: 'rgba(255,255,255,0.7)' }]}>Magandang araw, {studentName}!</Text>
                  <Text style={[S.heroTitle, { color: C.white }]}>Kasaysayan ng{'\n'}Iyong Pagbabasa</Text>
                </View>
                <View style={S.heroStatsBoxWrapper}>
                  <View style={S.heroStatBox}>
                    <Text style={S.heroStatLabel}>Aralins Done:</Text>
                    <Text style={S.heroStatVal}>{aralinDone}</Text>
                  </View>
                  <View style={S.heroStatBox}>
                    <Text style={S.heroStatLabel}>Total Attempts:</Text>
                    <Text style={S.heroStatVal}>{totalAttempts}</Text>
                  </View>
                </View>
              </View>
            </BounceIn>

            {/* ── Aralin Mastary Roadmap ────────────────────────────────────────── */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 40, marginTop: 20 }}>
              {groupedReports.map((aralinGroup, i) => (
                <AralinMasteryCard key={aralinGroup.aralinIndex} group={aralinGroup} />
              ))}

              {groupedReports.length === 0 && !isLoading && (
                <View style={S.emptyState}>
                  <HistoryIcon size={64} color={C.greenLight} />
                  <Text style={S.emptyTitle}>Wala pang kasaysayan</Text>
                  <Text style={S.emptyHint}>
                    Simulan ang iyong paglalakbay sa pagbabasa para makita ang iyong pag-unlad dito!
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : activeTab === 'passage' ? (
          <PassageHistoryTab 
            reports={allReports} 
            onStartReading={() => handleNextStep('PassageSelection')} 
          />
        ) : (
          <PerformanceTab studentId={auth().currentUser?.uid || ''} reports={allReports} />
        )}

        <LogoutModal
          visible={logoutVisible}
          onCancel={() => setLogoutVisible(false)}
          onConfirm={async () => { setLogoutVisible(false); await handleLogout(); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },

  // ── Header ──────────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 100,
  },
  headerLogo: { width: 100, height: 90 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  backArrow: {
    width: 12, height: 12, borderLeftWidth: 3, borderTopWidth: 3,
    borderColor: C.greenDeep, transform: [{ rotate: '-45deg' }],
    marginLeft: 4
  },
  menuIcon: { width: 22, height: 22, tintColor: C.ink },

  // Tab Switcher
  tabContainer: { paddingHorizontal: 16, marginTop: 10, marginBottom: 5 },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    padding: 4,
    position: 'relative'
  },
  activeTabIndicator: {
    position: 'absolute',
    width: '33.33%',
    height: '100%',
    backgroundColor: C.white,
    borderRadius: 16,
    top: 4,
    left: 4,
    ...Shadows.subtle
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', zIndex: 1 },
  tabText: { fontSize: 14, fontWeight: '700', color: C.slate },
  tabTextActive: { color: C.greenDeep, fontWeight: '900' },

  // Hero
  heroBanner: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.white, borderRadius: Radii.xl,
    paddingHorizontal: 20, paddingVertical: 18,
    ...Shadows.cardLift,
  },
  heroSub: { fontSize: 13, color: C.slate, fontWeight: '600' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: C.greenDeep, lineHeight: 28, marginTop: 2, marginBottom: 12 },
  heroStars: { alignItems: 'center', gap: 4 },
  heroStatsBoxWrapper: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8
  },
  heroStatBox: { alignItems: 'center' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '700', textTransform: 'uppercase' },
  heroStatVal: { fontSize: 20, fontWeight: '900', color: C.white, marginTop: 2 },

  activeFilterChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.white, marginHorizontal: 16, paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 12, marginBottom: 10, ...Shadows.subtle
  },
  filterChipText: { fontSize: 12, fontWeight: '800', color: C.slate },
  clearFilterText: { fontSize: 14, fontWeight: '900', color: C.coral, paddingHorizontal: 5 },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: -4 },

  latestBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
  latestBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.green + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendText: { fontSize: 10, fontWeight: '800', color: C.green },
  summaryPillLabel: { fontSize: 11, color: C.white, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  // Aralin Mastery Card
  aralinCard: {
    backgroundColor: C.white, borderRadius: 28,
    marginBottom: 20, borderTopWidth: 6,
    ...Shadows.cardLift, overflow: 'hidden', padding: 20,
  },
  aralinHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  aralinIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  aralinLetter: { fontSize: 28, fontWeight: '900', textTransform: 'uppercase' },
  aralinLabelText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  aralinTitleText: { fontSize: 22, fontWeight: '900', color: C.ink },
  aralinSummaryPills: { flexDirection: 'row', gap: 6 },
  miniPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  miniPillText: { fontSize: 12, fontWeight: '800' },

  aralinProgressWrapper: { marginTop: 18, backgroundColor: C.bg, padding: 12, borderRadius: 16 },
  progMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  progVal: { fontSize: 13, fontWeight: '900' },
  progTrack: { height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 4 },

  masteryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.green,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, marginTop: 12
  },
  masteryBadgeText: { fontSize: 10, fontWeight: '900', color: C.white, textTransform: 'uppercase' },

  // Assessment Results view
  assessCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.white,
    borderRadius: 20, padding: 18, marginBottom: 16, ...Shadows.cardLift
  },
  assessIconBox: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: C.green,
    justifyContent: 'center', alignItems: 'center'
  },
  assessMeta: { fontSize: 11, fontWeight: '800', color: C.slate, textTransform: 'uppercase' },
  assessTitle: { fontSize: 18, fontWeight: '900', color: C.greenDeep, marginVertical: 4 },
  assessScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  scorePill: { backgroundColor: C.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scorePillVal: { fontSize: 13, fontWeight: '900', color: C.greenDeep },
  assessDate: { fontSize: 12, fontWeight: '700', color: C.slate },

  // Galing View
  galingCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.white,
    borderRadius: 20, padding: 20, marginBottom: 16, ...Shadows.cardLift,
    borderLeftWidth: 5, borderLeftColor: C.purple
  },
  percBadge: {
    width: 65, height: 65, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2
  },
  percText: { fontSize: 18, fontWeight: '900' },

  // Talata Section
  talataSection: { marginTop: 4, borderTopWidth: 1, borderTopColor: C.bg, paddingTop: 16 },
  talataActivityGroup: { marginBottom: 16 },
  talataHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  talataTitle: { fontSize: 14, fontWeight: '800', color: C.slate },

  talataItem: {
    marginBottom: 20,
    paddingLeft: 14,
    borderLeftWidth: 4,
    borderRadius: 8,
    backgroundColor: C.bg + '10',
    paddingVertical: 12,
    marginRight: 4,
  },
  talataTopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 8,
  },
  talataTimeBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  talataStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    padding: 12,
    borderRadius: 16,
    ...Shadows.subtle,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 24, backgroundColor: C.bg },
  statVal: { fontSize: 14, fontWeight: '900', color: C.ink },
  statLab: { fontSize: 10, fontWeight: '700', color: C.slate, textTransform: 'uppercase', marginTop: 3 },

  miscueZone: { marginTop: 12 },
  perfectBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  perfectText: { fontSize: 12, fontWeight: '800' },

  miscueIconRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  miscueBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  miscueBadgeLabel: { fontSize: 11, fontWeight: '800' },

  talataDate: { fontSize: 11, fontWeight: '700', color: C.slate },
  talataAttemptCount: { fontSize: 12, fontWeight: '700', color: C.slate },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.slate + '40', marginHorizontal: 4 },

  miniMiscue: { fontSize: 11, fontWeight: '700' },
  olderAttemptsText: { fontSize: 10, color: C.slate, textAlign: 'right', marginTop: 4, fontStyle: 'italic' },

  // Empty
  emptyState: {
    alignItems: 'center', paddingTop: 60, paddingHorizontal: 32,
  },

  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'center', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: C.slate, textAlign: 'center', lineHeight: 21 },

  // Skeleton
  skeletonCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 12,
  },
});
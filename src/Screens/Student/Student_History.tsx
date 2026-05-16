import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import {
  HistoryIcon,
  TimerIcon,
  TrophyIcon,
  ZapIcon
} from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import AnalyticsTab from '../../Components/Student/AnalyticsTab';
import OverviewTab from '../../Components/Student/OverviewTab';
import PassageHistoryTab from '../../Components/Student/PassageHistoryTab';
import SessionsTab from '../../Components/Student/SessionsTab';
import { getUserProfile } from '../../Controller/AuthenticationController';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import { ACCENT_COLORS, StudentColors as C, Shadows } from '../../Utilities/Theme';


const alphabetData = readingMaterialData?.Alphabet || [];

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
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTotalWordsForLetter(letter: string) {
  const subset = readingMaterialData.Words.filter(w => w.letter === letter);
  const allWords = subset.flatMap(w => w.contrasts.flatMap(c => c.words));
  const letterLower = letter.toLowerCase();
  const uniqueWords = Array.from(new Set(allWords)).filter(
    word => word.trim().toLowerCase() !== letterLower
  );
  return uniqueWords.length;
}

// ─── Tab config ───────────────────────────────────────────────────────────────
type TabKey = 'overview' | 'mastery' | 'insights' | 'history';

const TABS: { key: TabKey; label: string; Icon: any }[] = [
  { key: 'overview', label: 'Overview', Icon: TrophyIcon },
  { key: 'mastery', label: 'Session', Icon: TimerIcon },
  { key: 'insights', label: 'Insights', Icon: ZapIcon },
  { key: 'history', label: 'History', Icon: HistoryIcon },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReadingHistoryScreen() {
  const [aralinSummaries, setAralinSummaries] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<MiscueReportDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const [aralinDone, setAralinDone] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [studentName, setStudentName] = useState('Mag-aaral');

  const { handleLogout, handleBackStep, handleNextStep } = useNavigationHelper();

  // Tab slide animation
  useEffect(() => {
    const idx = TABS.findIndex(t => t.key === activeTab);
    Animated.timing(slideAnimation, {
      toValue: idx,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth().currentUser;
      if (!user) return;

      const profile = await getUserProfile(user.uid);
      if (profile?.firstName) {
        setStudentName(profile.firstName);
      }

      const [reports, detailedMastery] = await Promise.all([
        MiscueReportController.getStudentReports(user.uid),
        MiscueReportController.getStudentDetailedCompletion(user.uid)
      ]);

      // Build compact aralin summaries
      const summaries = alphabetData.map((alpha, idx) => {
        const letter = alpha.letter;

        let progress = 0;
        if (detailedMastery) {
          const isAlphaDone = detailedMastery.completedAlpha.has(letter) ? 1 : 0;
          const wordCount = detailedMastery.completedWords[letter]?.size || 0;
          const totalWords = getTotalWordsForLetter(letter);

          const currentPassages = readingMaterialData.Passages.filter(p => p.aralin === idx + 1);
          const passageCount = currentPassages.filter(p => detailedMastery.completedPassages.has(p.title)).length;
          const totalPassages = currentPassages.length;

          const totalPossible = 1 + totalWords + totalPassages;
          const masteredCount = isAlphaDone + Math.min(wordCount, totalWords) + Math.min(passageCount, totalPassages);
          progress = totalPossible > 0 ? Math.round((masteredCount / totalPossible) * 100) : 0;
        }

        return {
          index: idx,
          letter,
          label: `Aralin ${idx + 1} — ${letter}`,
          progress,
          accent: ACCENT_COLORS[idx % ACCENT_COLORS.length],
          hasActivity: progress > 0,
        };
      });

      setAralinSummaries(summaries);
      setAllReports(reports as MiscueReportDocument[]);
      setTotalAttempts(reports.length);
      setAralinDone(summaries.filter(a => a.progress === 100).length);

    } catch (e) {
      console.log("Error fetching history:", e);
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Header */}
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
                      inputRange: TABS.map((_, i) => i),
                      outputRange: TABS.map((_, i) => i * ((SW - 32 - 8) / TABS.length))
                    })
                  }]
                }
              ]}
            />
            {TABS.map(({ key, label, Icon }) => (
              <TouchableOpacity
                key={key}
                style={S.tabButton}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.8}
              >
                <Icon size={12} color={activeTab === key ? C.greenDeep : C.slate} />
                <Text style={[S.tabText, activeTab === key && S.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <OverviewTab
            groupedReports={aralinSummaries}
            aralinDone={aralinDone}
            totalAttempts={totalAttempts}
            studentName={studentName}
          />
        ) : activeTab === 'mastery' ? (
          <SessionsTab studentId={auth().currentUser?.uid || ''} />
        ) : activeTab === 'insights' ? (
          <AnalyticsTab studentId={auth().currentUser?.uid || ''} reports={allReports} />

        ) : (
          <PassageHistoryTab
            reports={allReports}
            onStartReading={() => handleNextStep('PassageSelection')}
          />
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

  // Header
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8, zIndex: 100,
  },
  headerLogo: { width: 100, height: 90 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  backArrow: {
    width: 12, height: 12, borderLeftWidth: 3, borderTopWidth: 3,
    borderColor: C.greenDeep, transform: [{ rotate: '-45deg' }], marginLeft: 4
  },

  // Tab Switcher
  tabContainer: { paddingHorizontal: 16, marginTop: 5, marginBottom: 5 },
  tabBackground: {
    flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20, padding: 4, position: 'relative'
  },
  activeTabIndicator: {
    position: 'absolute', width: `${100 / TABS.length}%`, height: '100%',
    backgroundColor: C.white, borderRadius: 16, top: 4, left: 4, ...Shadows.subtle
  },
  tabButton: {
    flex: 1, paddingVertical: 12, alignItems: 'center', zIndex: 1,
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  tabText: { fontSize: 11, fontWeight: '700', color: C.slate },
  tabTextActive: { color: C.greenDeep, fontWeight: '900' },
});

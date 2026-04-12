import auth from '@react-native-firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
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
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { AlertTriangleIcon, BarChartIcon, BookOpenIcon, FileTextIcon, FlexIcon, HistoryIcon, LockIcon, PartyIcon, StarIcon, ThumbsUpIcon, TimerIcon, TrendUpIcon, TrophyIcon, TypeIcon, ZapIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import { ACCENT_COLORS, StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';

const alphabetData = readingMaterialData?.Alphabet || [];
const wordsData = readingMaterialData?.Words || [];

const { width: SW } = Dimensions.get('window');

// ─── Header Icons ────────────────────────────────────────────────────────────
function BackArrow({ color = C.ink }: { color?: string }) {
  return (
    <View style={{ width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface AralinGroupedData {
  aralinIndex: number;
  aralinLabel: string;
  letter: string;
  accent: string;
  activities: ActivityGroup[];
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
      {r > 0 && <View style={[S.miscueBadge, { backgroundColor: '#9b59b612' }]}><Text style={[S.miscueBadgeLabel, { color: '#9b59b6' }]}>↺ {r} Ulit</Text></View>}
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
           <TimerIcon size={14} color={C.slate} style={{ marginBottom: 4 }} />
           <Text style={S.statVal}>{report.recordingDuration || '0:00'}</Text>
           <Text style={S.statLab}>Tagal</Text>
         </View>
         <View style={S.statDivider} />
         <View style={S.statBox}>
           <ZapIcon size={14} color={C.slate} style={{ marginBottom: 4 }} />
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
      <View style={[S.aralinCard, { borderTopColor: accent }]}>
        <View style={S.aralinHeader}>
           <View style={[S.aralinIconCircle, { backgroundColor: accent + '12' }]}>
             <Text style={[S.aralinLetter, { color: accent }]}>{group.letter}</Text>
           </View>
           <View style={{ flex: 1, marginLeft: 16 }}>
             <Text style={[S.aralinLabelText, { color: accent }]}>{group.aralinLabel}</Text>
             <Text style={S.aralinTitleText}>Titik {group.letter.toUpperCase()}</Text>
             
             <View style={[S.aralinSummaryPills, { marginTop: 8 }]}>
               {titikAttempts > 0 && (
                 <View style={[S.miniPill, { backgroundColor: accent + '10' }]}>
                   <BookOpenIcon size={12} color={accent} />
                   <Text style={[S.miniPillText, { color: accent }]}>{titikAttempts} Subok</Text>
                 </View>
               )}
               {salitaAttempts > 0 && (
                 <View style={[S.miniPill, { backgroundColor: accent + '10' }]}>
                   <ZapIcon size={12} color={accent} />
                   <Text style={[S.miniPillText, { color: accent }]}>{salitaAttempts} Subok</Text>
                 </View>
               )}
             </View>
           </View>
        </View>

        {talataActivities.length > 0 && (
          <View style={S.talataSection}>
            {talataActivities.map((act, ai) => (
              <View key={`act-${ai}`} style={S.talataActivityGroup}>
                <View style={S.talataHeader}>
                  <BookOpenIcon size={14} color={C.slate} />
                  <Text style={S.talataTitle}>{act.title}</Text>
                  <View style={S.dot} />
                  <Text style={S.talataAttemptCount}>{act.reports.length} subok</Text>
                </View>
                {act.reports.map((rep, ri) => (
                  <TalataDetailItem 
                    key={rep.id} 
                    report={rep} 
                    index={ri} 
                    accent={accent} 
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </BounceIn>
  );
}

// (Deleted old AralinGroup component since we use AralinMasteryCard now)

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReadingHistoryScreen() {
  const [groupedReports, setGroupedReports] = useState<AralinGroupedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Progression tracking
  const [lastPassage, setLastPassage] = useState<string>('—');
  const [talataCount, setTalataCount] = useState<number>(0);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const { handleLogout, handleBackStep } = useNavigationHelper();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const user = auth().currentUser;
      if (!user) return;

      const reports = await MiscueReportController.getStudentReports(user.uid);
      const grouped = groupReportsByAralin(reports);
      setGroupedReports(grouped);
      setTotalAttempts(reports.length);

      // Calculate talata specific stats
      const allPassages = reports.filter(r => {
        const t = r.passageTitle?.toLowerCase() || '';
        // Heuristic: Not an alphabet sound or word list, and exists in material or is long enough
        return !t.includes('alphabet') && !t.includes('words for') && (t.length > 3);
      });
      
      const uniquePassages = new Set(allPassages.map(p => p.passageTitle));
      setTalataCount(uniquePassages.size);
      
      if (allPassages.length > 0) {
        setLastPassage(allPassages[0].passageTitle || '—');
      }

      // Progression for unlocked count (internal use or future badge)
      const mastered = await MiscueReportController.getStudentMasteredLessons(user.uid);
      setUnlockedCount(mastered.length + 1);

    } catch (e) {
      console.log("Error fetching history:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const groupReportsByAralin = (reports: MiscueReportDocument[]): AralinGroupedData[] => {
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
        // Fallback for plain letters or common legacy formats (e.g. "M", "M-")
        letter = t.replace(/[^a-z]/g, '').trim().toUpperCase();
        // Check if this letter exists in our alphabet
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

      const cleanLetter = t.replace(/[^a-z]/g, '').trim().toUpperCase();
      const alphaIdx = alphabetData.findIndex(a => a.letter.toUpperCase() === cleanLetter);
      if (alphaIdx !== -1) {
        return { 
          idx: alphaIdx, 
          type: t.length <= 2 ? 'Titik' : 'Talata', // Heuristic
          letter: cleanLetter,
          title: t.length <= 2 ? `Titik ${cleanLetter}` : title
        };
      }

      // 4. Catch-all for unknown passages (Put in Aralin 1 or find any aralin index)
      return { idx: 0, type: 'Talata' as const, letter: '', title };
    };

    reports.forEach(r => {
      const info = getReportAralin(r.passageTitle || '');
      if (info.idx === -1) return;

      if (!aralinMap.has(info.idx)) {
        aralinMap.set(info.idx, {
          aralinIndex: info.idx,
          aralinLabel: `Aralin ${info.idx + 1}`,
          letter: alphabetData[info.idx]?.letter || '?',
          accent: ACCENT_COLORS[info.idx % ACCENT_COLORS.length],
          activities: []
        });
      }

      const aralin = aralinMap.get(info.idx)!;
      let actGroup = aralin.activities.find(a => a.title === info.title);
      if (!actGroup) {
        actGroup = { type: info.type, title: info.title, reports: [] };
        aralin.activities.push(actGroup);
      }

      actGroup.reports.push({
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
    });

    // Sort aralin by newest activity first, then activities by type order
    return Array.from(aralinMap.values())
      .map(aralin => {
        // Calculate latest timestamp for this Aralin
        const allActs = aralin.activities.flatMap(a => a.reports);
        const latestTime = Math.max(...allActs.map(r => {
          const d = r.timestamp?.toDate?.() || new Date(r.timestamp || 0);
          return d.getTime();
        }));

        aralin.activities.sort((a, b) => {
          const order = { 'Titik': 0, 'Salita': 1, 'Talata': 2 };
          return order[a.type] - order[b.type];
        });

        // Sort reports by date descending inside each activity
        aralin.activities.forEach(act => {
          act.reports.sort((a, b) => {
             const A = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
             const B = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
             return B.getTime() - A.getTime();
          });
        });

        return { ...aralin, latestTime };
      })
      .sort((a, b) => b.latestTime - a.latestTime);
  };

  // Helper for old toggle logic
  const toggle = (i: number) => { } ; // Stub for compat

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={S.bg}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.green }} />
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.teal }} />
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.orange }} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.slate }}>Kinukuha ang iyong kasaysayan...</Text>
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
            <TouchableOpacity style={S.headerMenuBtn} onPress={handleBackStep} activeOpacity={0.7}>
              <BackArrow />
            </TouchableOpacity>
            <Image style={S.headerLogo} source={require('../../../assets/images/cisckids.png')} resizeMode="contain" />
            <View style={{ width: 44 }} />
          </View>
        </View>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <BounceIn delay={40}>
          <View style={[S.heroBanner, { backgroundColor: C.greenDeep }]}>
            <View>
              <Text style={[S.heroSub, { color: 'rgba(255,255,255,0.7)' }]}>Kamusta, Mag-aaral!</Text>
              <Text style={[S.heroTitle, { color: C.white }]}>Ang iyong{'\n'}Kasaysayan</Text>
            </View>
            <View style={S.heroStars}>
               <TrophyIcon size={48} color={C.yellow} />
               <View style={S.starsRow}>
                 <StarIcon size={16} color={C.yellow} />
                 <StarIcon size={24} color={C.yellow} />
                 <StarIcon size={16} color={C.yellow} />
               </View>
            </View>
          </View>
        </BounceIn>

        {/* ── Summary statistics (4 Columns) ─────────────────────────────────── */}
        {!isLoading && groupedReports.length > 0 && (
          <BounceIn delay={80}>
            <View style={S.summaryGrid}>
              <View style={[S.sumCard, { backgroundColor: '#1a7a45' }]}>
                <BookOpenIcon size={18} color={C.white} />
                <Text style={[S.sumVal, { color: C.white }]}>{talataCount}</Text>
                <Text style={[S.sumLabel, { color: 'rgba(255,255,255,0.8)' }]}>Talata</Text>
              </View>

              <View style={[S.sumCard, { backgroundColor: '#2ecc71' }]}>
                <HistoryIcon size={18} color={C.white} />
                <Text style={[S.sumVal, { color: C.white, fontSize: lastPassage.length > 8 ? 13 : 15 }]} numberOfLines={1}>{lastPassage}</Text>
                <Text style={[S.sumLabel, { color: 'rgba(255,255,255,0.8)' }]}>Huling Binasa</Text>
              </View>
              
              <View style={[S.sumCard, { backgroundColor: '#e67e22' }]}>
                <ZapIcon size={18} color={C.white} />
                <Text style={[S.sumVal, { color: C.white }]}>{totalAttempts}</Text>
                <Text style={[S.sumLabel, { color: 'rgba(255,255,255,0.8)' }]}>Subok</Text>
              </View>

              <View style={[S.sumCard, { backgroundColor: '#9b59b6' }]}>
                <StarIcon size={18} color={C.white} />
                <Text style={[S.sumVal, { color: C.white }]}>
                  {(() => {
                    const all = groupedReports.flatMap(g => 
                      g.activities.flatMap(a => a.reports.map(r => r.accuracyRate))
                    );
                    if (all.length === 0) return '—';
                    const avg = all.reduce((s, v) => s + v, 0) / all.length;
                    return avg.toFixed(0) + '%';
                  })()}
                </Text>
                <Text style={[S.sumLabel, { color: 'rgba(255,255,255,0.8)' }]}>Galing</Text>
              </View>
            </View>
          </BounceIn>
        )}

        {/* ── Aralin Mastary Roadmap ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 40, marginTop: 4 }}>
          {groupedReports.map((aralinGroup, i) => (
             <AralinMasteryCard key={aralinGroup.aralinIndex} group={aralinGroup} />
          ))}
          {groupedReports.length === 0 && !isLoading && (
            <View style={S.emptyState}>
              <HistoryIcon size={64} color={C.greenLight} />
              <Text style={S.emptyTitle}>Wala pang kasaysayan</Text>
              <Text style={S.emptyHint}>Simulan ang iyong paglalakbay sa pagbabasa para makita ang iyong pag-unlad dito!</Text>
            </View>
          )}
        </View>

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
  headerMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },
  menuIcon: { width: 22, height: 22, tintColor: C.ink },

  // Hero
  heroBanner: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.white, borderRadius: Radii.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 18,
    ...Shadows.cardLift,
  },
  heroSub: { fontSize: 13, color: C.slate, fontWeight: '600' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: C.greenDeep, lineHeight: 28, marginTop: 2 },
  heroStars: { alignItems: 'center', gap: 4 },


  // Summary pills
  // Summary pills
  summaryGrid: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16, marginTop: 12,
  },
  sumCard: {
    flex: 1, borderRadius: 20, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', ...Shadows.card,
  },
  sumVal: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  sumLabel: { fontSize: 10, fontWeight: '700', marginTop: 1, textTransform: 'uppercase' },

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
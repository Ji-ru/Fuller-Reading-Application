import React, { useEffect, useState, useRef } from 'react';
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
import { useRoute, RouteProp } from '@react-navigation/native';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import {
    ChevronRightIcon,
    CheckCircleIcon,
    HistoryIcon,
    TimerIcon,
    TrophyIcon,
    ZapIcon,
} from '../../Components/GlobalUse/Icons';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { useNavigationHelper, RootStackParamList } from '../../Controller/NavigationController';
import PassageHistoryTab from '../../Components/Student/PassageHistoryTab';
import AnalyticsTab from '../../Components/Student/AnalyticsTab';
import SessionsTab from '../../Components/Student/SessionsTab';
import PdfExportButton from '../../Components/Faculty/PdfExportButton';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import { ACCENT_COLORS, StudentColors as C, FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';

const alphabetData = readingMaterialData?.Alphabet || [];

const { width: SW } = Dimensions.get('window');

type StudentViewProfileRouteProp = RouteProp<RootStackParamList, 'FacultyStudentMonitor'>;

// ─── Types ─────────────────────────────────────────────────────────────────────
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

// ─── Reading Level Badge ──────────────────────────────────────────────────────
const READING_LEVEL_COLORS: Record<string, string> = {
    beginner: '#e67e22',
    intermediate: '#2980b9',
    advanced: '#27ae60',
};

function ReadingLevelBadge({ level }: { level: string }) {
    const color = READING_LEVEL_COLORS[level?.toLowerCase()] || F.primary;
    const label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Beginner';
    return (
        <View style={[SB.badge, { backgroundColor: color + '18', borderColor: color + '40', borderWidth: 1 }]}>
            <View style={[SB.dot, { backgroundColor: color }]} />
            <Text style={[SB.label, { color }]}>{label}</Text>
        </View>
    );
}
const SB = StyleSheet.create({
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    label: { fontSize: 11, fontWeight: '800', textTransform: 'capitalize', fontFamily: 'Andika-Bold' },
});

// ─── Aralin Mastery Card ─────────────────────────────────────────────────────
function AralinMasteryCard({ group }: { group: AralinGroupedData }) {
    const accent = group.accent;
    return (
        <BounceIn delay={group.aralinIndex * 50}>
            <View style={[S.aralinCard, { borderTopColor: accent, opacity: group.aralinProgress === 0 ? 0.6 : 1 }]}>
                <View style={S.aralinHeader}>
                    <View style={[S.aralinIconCircle, { backgroundColor: group.aralinProgress === 100 ? C.green + '12' : accent + '12' }]}>
                        <Text style={[S.aralinLetter, { color: group.aralinProgress === 100 ? C.green : accent }]}>
                            {group.letter}
                        </Text>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FacultyStudentMonitor() {
    const route = useRoute<StudentViewProfileRouteProp>();
    const { studentId, studentName, readingLevel } = route.params;

    const [groupedReports, setGroupedReports] = useState<AralinGroupedData[]>([]);
    const [allReports, setAllReports] = useState<MiscueReportDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'progress' | 'sessions' | 'analytics' | 'history'>('progress');
    const slideAnimation = useRef(new Animated.Value(0)).current;

    const [aralinDone, setAralinDone] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);

    const { handleBackStep } = useNavigationHelper();

    // Tab Slide Animation
    useEffect(() => {
        Animated.timing(slideAnimation, {
            toValue:
                activeTab === 'history' ? 3
                    : activeTab === 'analytics' ? 2
                        : activeTab === 'sessions' ? 1
                            : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [activeTab]);

    useEffect(() => {
        fetchStudentData();
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            setIsLoading(true);

            const [reports, mastered, detailedMastery] = await Promise.all([
                MiscueReportController.getStudentReports(studentId),
                MiscueReportController.getStudentMasteredLessons(studentId),
                MiscueReportController.getStudentDetailedCompletion(studentId),
            ]);

            const grouped = groupReportsByAralin(reports, detailedMastery);
            setGroupedReports(grouped);
            setAllReports(reports as MiscueReportDocument[]);
            setTotalAttempts(reports.length);
            setAralinDone(grouped.filter(g => g.aralinProgress > 0).length);
        } catch (e) {
            console.log('FacultyStudentMonitor: Error fetching data:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const groupReportsByAralin = (
        reports: MiscueReportDocument[],
        mastery?: {
            completedAlpha: Set<string>;
            completedWords: Record<string, Set<string>>;
            completedPassages: Set<string>;
        },
    ): AralinGroupedData[] => {
        const aralinMap = new Map<number, AralinGroupedData>();

        const getReportAralin = (title: string) => {
            const t = title.toLowerCase();
            const p = readingMaterialData.Passages.find(p => p.title.toLowerCase() === t);
            if (p) return { idx: (p.aralin ?? 1) - 1, type: 'Talata' as const, letter: '', title: p.title };

            let letter = '';
            let type: 'Titik' | 'Salita' = 'Titik';

            if (t.includes('alphabet')) {
                letter = t.split('-')[1]?.trim() || '';
                type = 'Titik';
            } else if (t.includes('words for')) {
                letter = t.split('for')[1]?.trim() || '';
                type = 'Salita';
            } else if (t.length <= 3) {
                letter = t.replace(/[^a-z]/g, '').trim().toUpperCase();
                const exists = alphabetData.some((a: any) => a.letter.toUpperCase() === letter);
                if (exists) type = 'Titik';
                else letter = '';
            }

            if (letter) {
                const aIdx = alphabetData.findIndex((a: any) => a.letter.toUpperCase() === letter.toUpperCase());
                if (aIdx !== -1) {
                    return {
                        idx: aIdx,
                        type,
                        letter,
                        title: type === 'Titik' ? `Titik ${letter.toUpperCase()}` : `Mga Salita (${letter.toUpperCase()})`,
                    };
                }
            }
            return { idx: 0, type: 'Talata' as const, letter: '', title };
        };

        const getTotalWordsForLetter = (letter: string) => {
            const subset = (readingMaterialData.Words as any[]).filter((w: any) => w.letter === letter);
            const allWords = subset.flatMap((w: any) => w.contrasts.flatMap((c: any) => c.words));
            const letterLower = letter.toLowerCase();
            return Array.from(new Set(allWords)).filter((word: any) => word.trim().toLowerCase() !== letterLower).length;
        };

        // Initialize all 30 Aralins
        alphabetData.forEach((alpha: any, idx: number) => {
            aralinMap.set(idx, {
                aralinIndex: idx,
                aralinLabel: `Aralin ${idx + 1}`,
                letter: alpha.letter,
                activities: [],
                accent: ACCENT_COLORS[idx % ACCENT_COLORS.length],
                aralinProgress: 0,
            });
        });

        // Map existing reports
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

        // Finalize and calculate progress
        return Array.from(aralinMap.values())
            .map(aralin => {
                const allR = aralin.activities.flatMap(a => a.reports);
                const latestTime =
                    allR.length > 0
                        ? Math.max(...allR.map(r => {
                            const d = r.timestamp?.toDate?.() || new Date(r.timestamp || 0);
                            return d.getTime();
                        }))
                        : 0;

                aralin.activities.sort((a, b) => {
                    const order: Record<string, number> = { Titik: 0, Salita: 1, Talata: 2 };
                    return order[a.type] - order[b.type];
                });
                aralin.activities.forEach(act => {
                    act.reports.sort((a, b) => {
                        const A = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
                        const B = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
                        return B.getTime() - A.getTime();
                    });
                });

                let aralinProgress = 0;
                if (mastery) {
                    const letter = aralin.letter;
                    const isAlphaDone = mastery.completedAlpha.has(letter) ? 1 : 0;
                    const wordCount = mastery.completedWords[letter]?.size || 0;
                    const totalWords = getTotalWordsForLetter(letter);
                    const currentPassages = (readingMaterialData.Passages as any[]).filter(
                        (p: any) => p.aralin === aralin.aralinIndex + 1,
                    );
                    const passageCount = currentPassages.filter((p: any) =>
                        mastery.completedPassages.has(p.title),
                    ).length;
                    const totalPassages = currentPassages.length;
                    const totalPossible = 1 + totalWords + totalPassages;
                    const masteredCount =
                        isAlphaDone + Math.min(wordCount, totalWords) + Math.min(passageCount, totalPassages);
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

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={S.bg}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingDots />
<Text style={{ fontSize: 15, fontWeight: '700', color: F.slate, marginTop: 12, fontFamily: 'Andika-Regular' }}>
                                 Kinukuha ang datos ng mag-aaral...
                             </Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={S.bg}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Bubbles */}
                <View style={bubbles.bubblesContainer} pointerEvents="none">
                    <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
                    <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
                    <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
                    <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
                </View>

                {/* ── HEADER ─────────────────────────────────────────────────────────── */}
                <View style={{ zIndex: 100 }}>
                    <View style={S.headerBar}>
                        <TouchableOpacity style={S.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
                            <View style={S.backArrow} />
                        </TouchableOpacity>
                        <Image
                            style={S.headerLogo}
                            source={require('../../../assets/images/cisckids copy.png')}
                            resizeMode="contain"
                        />
                        <PdfExportButton
                            studentName={studentName}
                            readingLevel={readingLevel}
                            aralinDone={aralinDone}
                            totalAttempts={totalAttempts}
                            groupedReports={groupedReports}
                            allReports={allReports}
                        />
                    </View>
                </View>

                {/* ── STUDENT INFO BANNER ──────────────────────────────────────────────── */}
                <BounceIn delay={60}>
                    <View style={S.studentBanner}>
                        <View style={S.studentAvatarBox}>
                            <Text style={S.studentAvatarText}>
                                {studentName?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                        </View>
                        <View style={S.studentBannerInfo}>
                            <Text style={S.monitoringLabel}>Sinusubaybayan</Text>
                            <Text style={S.studentBannerName} numberOfLines={1}>{studentName}</Text>
                            {/* <ReadingLevelBadge level={readingLevel} /> */}
                        </View>
                        <View style={S.bannerStats}>
                            <View style={S.bannerStatBox}>
                                <Text style={S.bannerStatVal}>{aralinDone}</Text>
                                <Text style={S.bannerStatLabel}>Aralin</Text>
                            </View>
                            <View style={S.bannerStatDivider} />
                            <View style={S.bannerStatBox}>
                                <Text style={S.bannerStatVal}>{totalAttempts}</Text>
                                <Text style={S.bannerStatLabel}>Pagsubok</Text>
                            </View>
                        </View>
                    </View>
                </BounceIn>

                {/* ── TAB SWITCHER ─────────────────────────────────────────────────────── */}
                <View style={S.tabContainer}>
                    <View style={S.tabBackground}>
                        <Animated.View
                            style={[
                                S.activeTabIndicator,
                                {
                                    transform: [{
                                        translateX: slideAnimation.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [
                                                0,
                                                (SW - 32 - 8) / 4,
                                                (2 * (SW - 32 - 8)) / 4,
                                                (3 * (SW - 32 - 8)) / 4,
                                            ],
                                        }),
                                    }],
                                },
                            ]}
                        />

                        <TouchableOpacity
                            style={[S.tabButton, { flexDirection: 'row', justifyContent: 'center', gap: 4 }]}
                            onPress={() => setActiveTab('progress')}
                            activeOpacity={0.8}
                        >
                            <TrophyIcon size={12} color={activeTab === 'progress' ? F.primaryDeep : F.slate} />
                            <Text style={[S.tabText, activeTab === 'progress' && S.tabTextActive, { fontSize: 11 }]}>
                                Pag-unlad
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[S.tabButton, { flexDirection: 'row', justifyContent: 'center', gap: 4 }]}
                            onPress={() => setActiveTab('sessions')}
                            activeOpacity={0.8}
                        >
                            <TimerIcon size={12} color={activeTab === 'sessions' ? F.primaryDeep : F.slate} />
                            <Text style={[S.tabText, activeTab === 'sessions' && S.tabTextActive, { fontSize: 11 }]}>
                                Serye
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[S.tabButton, { flexDirection: 'row', justifyContent: 'center', gap: 4 }]}
                            onPress={() => setActiveTab('analytics')}
                            activeOpacity={0.8}
                        >
                            <ZapIcon size={12} color={activeTab === 'analytics' ? F.primaryDeep : F.slate} />
                            <Text style={[S.tabText, activeTab === 'analytics' && S.tabTextActive, { fontSize: 11 }]}>
                                Pagsusuri
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[S.tabButton, { flexDirection: 'row', justifyContent: 'center', gap: 4 }]}
                            onPress={() => setActiveTab('history')}
                            activeOpacity={0.8}
                        >
                            <HistoryIcon size={12} color={activeTab === 'history' ? F.primaryDeep : F.slate} />
                            <Text style={[S.tabText, activeTab === 'history' && S.tabTextActive, { fontSize: 11 }]}>
                                Kasaysayan
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── TAB CONTENT ──────────────────────────────────────────────────────── */}
                {activeTab === 'progress' ? (
                    <View>
                        {/* Hero Banner */}
                        <BounceIn delay={24}>
                            <View style={[S.heroBanner, { backgroundColor: F.primaryDeep }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[S.heroSub, { color: 'rgba(255,255,255,0.7)' }]}>
                                        Progress ni {studentName}
                                    </Text>
                                    <Text style={[S.heroTitle, { color: F.white }]}>
                                        Kasaysayan ng{'\n'}Pagbabasa
                                    </Text>
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

                        {/* Aralin Mastery Roadmap */}
                        <View style={{ paddingHorizontal: 16, paddingBottom: 40, marginTop: 20 }}>
                            {groupedReports.map(aralinGroup => (
                                <AralinMasteryCard key={aralinGroup.aralinIndex} group={aralinGroup} />
                            ))}

                            {groupedReports.length === 0 && !isLoading && (
                                <View style={S.emptyState}>
                                    <HistoryIcon size={64} color={F.primary + '60'} />
                                    <Text style={S.emptyTitle}>Wala pang kasaysayan</Text>
                                    <Text style={S.emptyHint}>
                                        Ang mag-aaral na ito ay hindi pa nagsisimula ng kanilang paglalakbay sa pagbabasa.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                ) : activeTab === 'sessions' ? (
                    <SessionsTab studentId={studentId} />

                ) : activeTab === 'analytics' ? (
                    <AnalyticsTab
                        studentId={studentId}
                        reports={allReports}
                    />

                ) : (
                    // Passage History Tab — "onStartReading" is disabled for faculty view
                    <PassageHistoryTab
                        reports={allReports}
                        onStartReading={() => { /* Faculty cannot start reading for a student */ }}
                    />
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    bg: { flex: 1, backgroundColor: F.bg },

    // ── Header ──────────────────────────────────────────────────────────────────
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
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: F.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.subtle,
    },
    backArrow: {
        width: 12,
        height: 12,
        borderLeftWidth: 3,
        borderTopWidth: 3,
        borderColor: F.primaryDeep,
        transform: [{ rotate: '-45deg' }],
        marginLeft: 4,
    },

    // ── Student Banner ───────────────────────────────────────────────────────────
    studentBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: F.white,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: Radii.xl,
        padding: 16,
        ...Shadows.cardLift,
    },
    studentAvatarBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: F.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    studentAvatarText: {
        fontSize: 22,
        fontWeight: '900',
        color: F.primaryDeep,
        fontFamily: 'Andika-Bold',
    },
    studentBannerInfo: {
        flex: 1,
        gap: 4,
    },
    monitoringLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: F.slate,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: 'Andika-Regular',
    },
    studentBannerName: {
        fontSize: 17,
        fontWeight: '900',
        color: F.ink,
        marginBottom: 4,
        fontFamily: 'Andika-Bold',
    },
    bannerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    bannerStatBox: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    bannerStatVal: {
        fontSize: 18,
        fontWeight: '900',
        color: F.primaryDeep,
        fontFamily: 'Andika-Bold',
    },
    bannerStatLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: F.slate,
        textTransform: 'uppercase',
        marginTop: 2,
        fontFamily: 'Andika-Regular',
    },
    bannerStatDivider: {
        width: 1,
        height: 28,
        backgroundColor: F.slate + '30',
    },

    // ── Tab Switcher ─────────────────────────────────────────────────────────────
    tabContainer: { paddingHorizontal: 16, marginTop: 5, marginBottom: 5 },
    tabBackground: {
        flexDirection: 'row',
        backgroundColor: F.primary + '18',
        borderRadius: 20,
        padding: 4,
        position: 'relative',
    },
    activeTabIndicator: {
        position: 'absolute',
        width: '25%',
        height: '100%',
        backgroundColor: F.white,
        borderRadius: 16,
        top: 4,
        left: 4,
        ...Shadows.subtle,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        zIndex: 1,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: F.slate,
        fontFamily: 'Andika-Regular',
    },
    tabTextActive: {
        color: F.primaryDeep,
        fontWeight: '900',
        fontFamily: 'Andika-Bold',
    },

    // ── Hero Banner ──────────────────────────────────────────────────────────────
    heroBanner: {
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: Radii.xl,
        paddingHorizontal: 20,
        paddingVertical: 18,
        ...Shadows.cardLift,
    },
    heroSub: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Andika-Regular',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '900',
        lineHeight: 28,
        marginTop: 2,
        marginBottom: 12,
        fontFamily: 'Andika-Bold',
    },
    heroStatsBoxWrapper: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    heroStatBox: { alignItems: 'center' },
    heroStatLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '700',
        textTransform: 'uppercase',
        fontFamily: 'Andika-Bold',
    },
    heroStatVal: {
        fontSize: 20,
        fontWeight: '900',
        color: F.white,
        marginTop: 2,
        fontFamily: 'Andika-Bold',
    },

    // ── Aralin Mastery Card ──────────────────────────────────────────────────────
    aralinCard: {
        backgroundColor: C.white,
        borderRadius: 28,
        marginBottom: 20,
        borderTopWidth: 6,
        ...Shadows.cardLift,
        overflow: 'hidden',
        padding: 20,
    },
    aralinHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    aralinIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aralinLetter: { fontSize: 28, fontWeight: '900', textTransform: 'uppercase', fontFamily: 'Andika-Bold' },
    aralinLabelText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'Andika-Bold' },
    aralinTitleText: { fontSize: 22, fontWeight: '900', color: C.ink, fontFamily: 'Andika-Bold' },

    aralinProgressWrapper: {
        marginTop: 18,
        backgroundColor: C.bg,
        padding: 12,
        borderRadius: 16,
    },
    progMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Andika-Bold' },
    progVal: { fontSize: 13, fontWeight: '900', fontFamily: 'Andika-Bold' },
    progTrack: { height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' },
    progFill: { height: '100%', borderRadius: 4 },

    masteryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: C.green,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginTop: 12,
    },
    masteryBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: C.white,
        textTransform: 'uppercase',
        fontFamily: 'Andika-Bold',
    },

    // ── Empty State ──────────────────────────────────────────────────────────────
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: F.ink,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 8,
        fontFamily: 'Andika-Bold',
    },
    emptyHint: {
        fontSize: 14,
        color: F.slate,
        textAlign: 'center',
        lineHeight: 21,
        fontFamily: 'Andika-Regular',
    },
});

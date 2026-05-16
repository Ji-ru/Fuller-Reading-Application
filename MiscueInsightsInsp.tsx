import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useStudentMiscueStats } from '../../../Hooks/Faculty/use_StudentView_Progress';
import { useStudentTopMiscuePassageAndWords } from '../../../Hooks/Faculty/use_StudentView_Progress';
import { sw, sh, sf } from '../../../Utils/responsive';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
    primary: '#3B7FC9',
    primaryLight: '#D7E9FF',
    tabBg: '#c0e8f2',
    accent: '#38B6FF',
    card: '#FFFFFF',
    ink: '#1F2937',
    inkLight: '#6B7280',
    slate: '#9CA3AF',
    border: '#E5E7EB',
    inputBg: '#F3F8FF',
    green: '#2CA96A',
    greenBg: '#D4F1E8',
    coral: '#EF4444',
    coralBg: '#FEE2E2',
    track: '#EEF2FF',
    // Miscue type colors (softened for bars)
    substitution: '#FF5252',
    substitutionBg: '#FFEBEE',
    omission: '#FF9800',
    omissionBg: '#FFF3E0',
    insertion: '#42A5F5',
    insertionBg: '#E3F2FD',
    repetition: '#AB47BC',
    repetitionBg: '#F3E5F5',
};

type TimeRange = 'week' | 'month' | 'year';

interface MiscueInsightsProps {
    studentId: string;
}

const MISCUE_COLORS: Record<string, { bar: string; bg: string }> = {
    Substitution: { bar: C.substitution, bg: C.substitutionBg },
    Omission: { bar: C.omission, bg: C.omissionBg },
    Insertion: { bar: C.insertion, bg: C.insertionBg },
    Repetition: { bar: C.repetition, bg: C.repetitionBg },
};

const StudentMiscueInsights: React.FC<MiscueInsightsProps> = ({ studentId }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('week');

    const {
        miscueData,
        total,
        loading: miscueLoading,
        error: miscueError,
    } = useStudentMiscueStats(studentId, timeRange);

    const {
        topPassage,
        topWords,
        loading: topLoading,
        error: topError,
    } = useStudentTopMiscuePassageAndWords(studentId, timeRange);

    const loading = miscueLoading || topLoading;
    const error = miscueError || topError;

    const rangeLabel = timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year';

    if (loading) {
        return (
            <View style={S.centered}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={S.loadingText}>Loading miscue insights…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={S.errorCard}>
                <Text style={S.errorText}>⚠️ {error}</Text>
                <Text style={S.errorSub}>Failed to load miscue data</Text>
            </View>
        );
    }

    const maxMiscueCount = miscueData.length > 0
        ? Math.max(...miscueData.map(d => d.count), 1)
        : 1;

    return (
        <View>
            {/* Title */}
            <Text style={S.title}>Miscue Insights</Text>

            {/* Time range tabs */}
            <View style={S.rangeBar}>
                {(['week', 'month', 'year'] as const).map(r => (
                    <TouchableOpacity
                        key={r}
                        style={[S.rangeBtn, timeRange === r && S.rangeBtnActive]}
                        onPress={() => setTimeRange(r)}
                        activeOpacity={0.8}
                    >
                        <Text style={[S.rangeBtnText, timeRange === r && S.rangeBtnTextActive]}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Section 1: Miscue Type Breakdown ────────────────────── */}
            <View style={S.sectionCard}>
                <Text style={S.sectionTitle}>Common Miscue Types</Text>
                <Text style={S.sectionSubtitle}>{rangeLabel} · {total} total miscues</Text>

                {total === 0 ? (
                    <View style={S.emptyBox}>
                        <Text style={S.emptyText}>No miscues recorded for this period 🎉</Text>
                    </View>
                ) : (
                    <View style={S.barsContainer}>
                        {miscueData.map((item, index) => {
                            const pct = maxMiscueCount > 0 ? (item.count / maxMiscueCount) * 100 : 0;
                            const colors = MISCUE_COLORS[item.type] || { bar: C.slate, bg: C.track };
                            return (
                                <View key={index} style={S.miscueRow}>
                                    <View style={S.miscueHeader}>
                                        <View style={[S.miscueDot, { backgroundColor: colors.bar }]} />
                                        <Text style={S.miscueType}>{item.type}</Text>
                                        <Text style={S.miscuePct}>{item.percentage.toFixed(0)}%</Text>
                                    </View>
                                    <View style={S.barRow}>
                                        <View style={[S.barTrack, { backgroundColor: colors.bg }]}>
                                            <View
                                                style={[
                                                    S.barFill,
                                                    { width: `${pct}%` as any, backgroundColor: colors.bar },
                                                ]}
                                            />
                                        </View>
                                        <Text style={[S.barCount, { color: colors.bar }]}>{item.count}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* ── Section 2: Top Miscued Passage ───────────────────────── */}
            <View style={S.sectionCard}>
                <Text style={S.sectionTitle}>Top Miscued Passage</Text>

                {!topPassage ? (
                    <View style={S.emptyBox}>
                        <Text style={S.emptyText}>No passage data for this period</Text>
                    </View>
                ) : (
                    <View>
                        <Text style={S.passageName} numberOfLines={2}>
                            "{topPassage.title}"
                        </Text>
                        <View style={S.passageStatsRow}>
                            <View style={S.passageStat}>
                                <Text style={S.passageStatValue}>{topPassage.averageAccuracy.toFixed(1)}%</Text>
                                <Text style={S.passageStatLabel}>Accuracy</Text>
                            </View>
                            <View style={S.passageStatDivider} />
                            <View style={S.passageStat}>
                                <Text style={S.passageStatValue}>{topPassage.attempts}</Text>
                                <Text style={S.passageStatLabel}>Attempts</Text>
                            </View>
                            <View style={S.passageStatDivider} />
                            <View style={S.passageStat}>
                                <Text style={[S.passageStatValue, { color: C.coral }]}>{topPassage.totalMiscues}</Text>
                                <Text style={S.passageStatLabel}>Miscues</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* ── Section 3: Most Miscued Words ────────────────────────── */}
            <View style={S.sectionCard}>
                <Text style={S.sectionTitle}>Most Miscued Words</Text>

                {!topWords || topWords.length === 0 ? (
                    <View style={S.emptyBox}>
                        <Text style={S.emptyText}>No word data for this period</Text>
                    </View>
                ) : (
                    <View>
                        {topWords.map((item, index) => {
                            const colors = MISCUE_COLORS[item.dominantMiscueType || ''] || { bar: C.slate, bg: C.track };
                            return (
                                <View key={index} style={[S.wordRow, index === topWords.length - 1 && S.wordRowLast]}>
                                    <View style={S.wordRank}>
                                        <Text style={S.wordRankText}>{index + 1}</Text>
                                    </View>
                                    <View style={S.wordInfo}>
                                        <Text style={S.wordText}>"{item.word}"</Text>
                                        <View style={[S.wordBadge, { backgroundColor: colors.bg }]}>
                                            <Text style={[S.wordBadgeText, { color: colors.bar }]}>
                                                {item.dominantMiscueType || 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={S.wordCount}>×{item.errorCount}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: sw(40),
    },
    loadingText: {
        marginTop: sh(12),
        fontSize: sf(14),
        fontFamily: 'Nunito-Medium',
        color: C.inkLight,
    },
    errorCard: {
        backgroundColor: C.coralBg,
        borderRadius: sw(14),
        padding: sw(16),
        borderWidth: 1,
        borderColor: '#FECACA',
        alignItems: 'center',
    },
    errorText: {
        fontSize: sf(14),
        fontFamily: 'Nunito-Bold',
        color: C.coral,
        marginBottom: sh(4),
    },
    errorSub: {
        fontSize: sf(12),
        fontFamily: 'Nunito-Medium',
        color: C.slate,
    },

    title: {
        fontSize: sf(16),
        fontFamily: 'Nunito-Bold',
        color: C.ink,
        marginBottom: sh(12),
    },

    // Time range
    rangeBar: {
        flexDirection: 'row',
        backgroundColor: C.tabBg,
        borderRadius: sw(10),
        padding: sw(3),
        marginBottom: sh(14),
    },
    rangeBtn: {
        flex: 1,
        paddingVertical: sh(8),
        alignItems: 'center',
        borderRadius: sw(8),
    },
    rangeBtnActive: {
        backgroundColor: C.primary,
        elevation: 2,
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: sw(1) },
        shadowOpacity: 0.2,
        shadowRadius: sw(2),
    },
    rangeBtnText: {
        fontSize: sf(13),
        fontFamily: 'Nunito-Bold',
        color: C.primary,
    },
    rangeBtnTextActive: {
        color: '#FFFFFF',
    },

    // Section card
    sectionCard: {
        backgroundColor: C.card,
        borderRadius: sw(14),
        padding: sw(16),
        borderWidth: 1,
        borderColor: C.primaryLight,
        marginBottom: sh(12),
    },
    sectionTitle: {
        fontSize: sf(15),
        fontFamily: 'Nunito-Bold',
        color: C.ink,
        marginBottom: sh(2),
    },
    sectionSubtitle: {
        fontSize: sf(12),
        fontFamily: 'Nunito-Medium',
        color: C.slate,
        marginBottom: sh(12),
    },

    // Empty state
    emptyBox: {
        paddingVertical: sh(20),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: sf(13),
        fontFamily: 'Nunito-Medium',
        color: C.slate,
    },

    // Miscue bars
    barsContainer: {
        gap: sh(10),
    },
    miscueRow: {
        gap: sh(4),
    },
    miscueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sw(6),
    },
    miscueDot: {
        width: sw(8),
        height: sw(8),
        borderRadius: sw(4),
    },
    miscueType: {
        flex: 1,
        fontSize: sf(13),
        fontFamily: 'Nunito-Medium',
        color: C.ink,
    },
    miscuePct: {
        fontSize: sf(13),
        fontFamily: 'Nunito-Bold',
        color: C.inkLight,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sw(8),
        paddingLeft: sw(14),
    },
    barTrack: {
        flex: 1,
        height: sw(8),
        borderRadius: sw(4),
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: sw(4),
    },
    barCount: {
        minWidth: sw(28),
        fontSize: sf(13),
        fontFamily: 'Nunito-Bold',
        textAlign: 'right',
    },

    // Top passage
    passageName: {
        fontSize: sf(15),
        fontFamily: 'Nunito-Bold',
        color: C.primary,
        fontStyle: 'italic',
        marginBottom: sh(12),
        marginTop: sh(6),
    },
    passageStatsRow: {
        flexDirection: 'row',
        backgroundColor: C.inputBg,
        borderRadius: sw(12),
        paddingVertical: sh(12),
        paddingHorizontal: sw(8),
        alignItems: 'center',
    },
    passageStat: {
        flex: 1,
        alignItems: 'center',
    },
    passageStatValue: {
        fontSize: sf(18),
        fontFamily: 'Nunito-Bold',
        color: C.primary,
        marginBottom: sh(2),
    },
    passageStatLabel: {
        fontSize: sf(11),
        fontFamily: 'Nunito-Medium',
        color: C.inkLight,
    },
    passageStatDivider: {
        width: 1,
        height: sh(28),
        backgroundColor: C.border,
    },

    // Word list
    wordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: sh(10),
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        gap: sw(10),
    },
    wordRowLast: {
        borderBottomWidth: 0,
    },
    wordRank: {
        width: sw(26),
        height: sw(26),
        borderRadius: sw(13),
        backgroundColor: C.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wordRankText: {
        fontSize: sf(12),
        fontFamily: 'Nunito-Bold',
        color: C.primary,
    },
    wordInfo: {
        flex: 1,
        gap: sh(3),
    },
    wordText: {
        fontSize: sf(14),
        fontFamily: 'Nunito-Bold',
        color: C.ink,
        fontStyle: 'italic',
    },
    wordBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: sw(10),
        paddingVertical: sh(2),
        borderRadius: sw(8),
    },
    wordBadgeText: {
        fontSize: sf(11),
        fontFamily: 'Nunito-Bold',
    },
    wordCount: {
        fontSize: sf(16),
        fontFamily: 'Nunito-Bold',
        color: C.inkLight,
    },
});

export default StudentMiscueInsights;

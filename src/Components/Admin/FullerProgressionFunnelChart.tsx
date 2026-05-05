// =============================================================================
// FullerProgressionFunnelChart.tsx
// =============================================================================
// Purpose: Renders the Fuller Curriculum Progression Funnel for the Admin
//          Dashboard using a StackedBarChart. Shows, per grade level, the
//          percentage of students at each stage:
//          Alphabet → Word Blending → Passage Reading.
//
// Design intent:
//   - All three grades are displayed side-by-side in a single chart so the
//     principal can immediately compare which grade has the worst bottleneck.
//   - Bars use percentage values (always sum to 100%) so different class sizes
//     don't distort the visual — a grade with 10 students looks comparable to
//     a grade with 80 students.
//   - Tapping a grade column in the detail section highlights that grade's
//     specific breakdown and bottleneck warning.
//
// Chart library: react-native-chart-kit → StackedBarChart
// =============================================================================

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import {
    useFullerProgressionFunnel,
    GradeFunnelData,
    FunnelStage,
    STAGE_LABELS,
    STAGE_DESCRIPTIONS,
    STAGE_COLORS,
} from '../../Hooks/Admin/useFullerProgressionFunnel';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Account for card padding (16px each side) + outer margin (16px each side)
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 220;

const FUNNEL_STAGE_ORDER: FunnelStage[] = ['alphabet', 'wordBlending', 'passage'];

const BOTTLENECK_MESSAGES: Record<FunnelStage, string> = {
    alphabet:
        'Most students are still building letter-sound foundations. Teachers may benefit from additional phonics training and structured literacy support.',
    wordBlending:
        'Students can recognize letters but struggle to blend them into words. Focus on word-level decoding strategies and phonemic blending exercises.',
    passage: '',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Builds the StackedBarChart data object from per-grade funnel data.
 *
 * Uses percentage values so that grades with different enrollment numbers
 * are visually comparable — the bar heights are always normalized to 100%.
 *
 * Grades with 0 students are represented as [0, 0, 0] so the chart label
 * still appears without distorting the other bars.
 */
const buildChartData = (byGrade: GradeFunnelData[]) => {
    const data = byGrade.map(gradeData => {
        if (gradeData.totalStudents === 0) return [0, 0, 0];
        return FUNNEL_STAGE_ORDER.map(
            stage => gradeData.stages[stage].percentage,
        );
    });

    return {
        labels: byGrade.map(g => `Grade ${g.gradeLevel}`),
        legend: FUNNEL_STAGE_ORDER.map(s => STAGE_LABELS[s]),
        data,
        barColors: FUNNEL_STAGE_ORDER.map(s => STAGE_COLORS[s]),
    };
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Detail card for a single grade's stage breakdown. */
const GradeDetailCard: React.FC<{
    gradeData: GradeFunnelData;
    isSelected: boolean;
    onPress: () => void;
}> = ({ gradeData, isSelected, onPress }) => (
    <TouchableOpacity
        style={[styles.gradeCard, isSelected && styles.gradeCardSelected]}
        onPress={onPress}
        activeOpacity={0.75}
    >
        {/* Card Header */}
        <View style={styles.gradeCardHeader}>
            <Text style={styles.gradeCardTitle}>Grade {gradeData.gradeLevel}</Text>
            <Text style={styles.gradeCardCount}>
                {gradeData.totalStudents} students
            </Text>
        </View>

        {/* Stage rows */}
        {gradeData.totalStudents === 0 ? (
            <Text style={styles.gradeCardEmpty}>No students enrolled</Text>
        ) : (
            FUNNEL_STAGE_ORDER.map(stage => {
                const { count, percentage } = gradeData.stages[stage];
                const isBottleneck = gradeData.bottleneck === stage;
                return (
                    <View
                        key={stage}
                        style={[
                            styles.stageRow,
                            isBottleneck && styles.stageRowBottleneck,
                        ]}
                    >
                        <View style={styles.stageRowLeft}>
                            <View
                                style={[
                                    styles.stageDot,
                                    { backgroundColor: STAGE_COLORS[stage] },
                                ]}
                            />
                            <Text style={styles.stageName}>
                                {STAGE_LABELS[stage]}
                                {isBottleneck ? '  🔴' : ''}
                            </Text>
                        </View>
                        <View style={styles.stageRowRight}>
                            <Text style={styles.stageCount}>{count}</Text>
                            <Text style={styles.stagePercentage}>{percentage}%</Text>
                        </View>
                    </View>
                );
            })
        )}

        {/* Bottleneck badge */}
        {gradeData.bottleneck ? (
            <View
                style={[
                    styles.bottleneckBadge,
                    { borderColor: STAGE_COLORS[gradeData.bottleneck] },
                ]}
            >
                <Text
                    style={[
                        styles.bottleneckBadgeText,
                        { color: STAGE_COLORS[gradeData.bottleneck] },
                    ]}
                >
                    {STAGE_LABELS[gradeData.bottleneck]} bottleneck
                </Text>
            </View>
        ) : gradeData.totalStudents > 0 ? (
            <View style={styles.onTrackBadge}>
                <Text style={styles.onTrackBadgeText}>✓ No bottleneck</Text>
            </View>
        ) : null}
    </TouchableOpacity>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface FullerProgressionFunnelChartProps {
    /** Academic year filter passed down from the Admin Dashboard. */
    acadYear?: string;
}

export const FullerProgressionFunnelChart: React.FC<
    FullerProgressionFunnelChartProps
> = ({ acadYear }) => {
    const { data, isLoading, error, refetch } = useFullerProgressionFunnel(acadYear);

    // Which grade card is expanded/highlighted — null means none selected yet
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

    // Build the StackedBarChart data whenever byGrade changes
    const chartData = useMemo(() => {
        if (!data) return null;
        return buildChartData(data.byGrade);
    }, [data]);

    // The grade card to highlight (the one with the worst bottleneck by default)
    const defaultSelectedGrade = useMemo(() => {
        if (!data) return null;
        // Auto-select the grade with the highest alphabet % (worst bottleneck)
        const withStudents = data.byGrade.filter(g => g.totalStudents > 0);
        if (withStudents.length === 0) return null;
        return withStudents.reduce((worst, current) =>
            current.stages.alphabet.percentage > worst.stages.alphabet.percentage
                ? current
                : worst,
        ).gradeLevel;
    }, [data]);

    const activeGrade = selectedGrade ?? defaultSelectedGrade;

    const activeGradeData = useMemo(
        () => data?.byGrade.find(g => g.gradeLevel === activeGrade) ?? null,
        [data, activeGrade],
    );

    // ==========================================================================
    // LOADING
    // ==========================================================================
    if (isLoading) {
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Fuller Curriculum Progression</Text>
                <View style={styles.stateContainer}>
                    <ActivityIndicator size="large" color="#45B7D1" />
                    <Text style={styles.stateText}>Loading progression data…</Text>
                </View>
            </View>
        );
    }

    // ==========================================================================
    // ERROR
    // ==========================================================================
    if (error) {
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Fuller Curriculum Progression</Text>
                <View style={styles.stateContainer}>
                    <Text style={styles.errorText}>Unable to load data.</Text>
                    <Text style={styles.errorSubText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ==========================================================================
    // EMPTY
    // ==========================================================================
    if (!data || data.totalStudents === 0 || !chartData) {
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Fuller Curriculum Progression</Text>
                <View style={styles.stateContainer}>
                    <Text style={styles.stateText}>No student data available.</Text>
                    {acadYear && (
                        <Text style={styles.stateSubText}>
                            No students found for {acadYear}.
                        </Text>
                    )}
                </View>
            </View>
        );
    }

    // ==========================================================================
    // MAIN RENDER
    // ==========================================================================
    return (
        <View style={styles.card}>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Fuller Curriculum Progression</Text>
                <Text style={styles.cardSubtitle}>
                    Where are students in the reading journey? · {data.totalStudents} students total
                </Text>
            </View>

            {/* ── Legend ─────────────────────────────────────────────────────── */}
            <View style={styles.legendRow}>
                {FUNNEL_STAGE_ORDER.map(stage => (
                    <View key={stage} style={styles.legendItem}>
                        <View
                            style={[styles.legendDot, { backgroundColor: STAGE_COLORS[stage] }]}
                        />
                        <Text style={styles.legendLabel}>{STAGE_LABELS[stage]}</Text>
                    </View>
                ))}
            </View>

            {/* ── Stacked Bar Chart ───────────────────────────────────────────── */}
            <StackedBarChart
                data={chartData}
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                hideLegend // We render our own legend above for style consistency
                chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(69, 183, 209, ${opacity})`,
                    labelColor: () => '#555',
                    style: { borderRadius: 12 },
                    propsForLabels: {
                        fontSize: 11,
                        fontWeight: '600',
                    },
                    barPercentage: 0.6,
                }}
                style={styles.chart}
            />

            {/* Y-axis hint */}
            <Text style={styles.yAxisHint}>% of students per stage</Text>

            <View style={styles.divider} />

            {/* ── Per-Grade Detail Cards ──────────────────────────────────────── */}
            <Text style={styles.sectionLabel}>Tap a grade for details</Text>
            <View style={styles.gradeCardsRow}>
                {data.byGrade.map(gradeData => (
                    <GradeDetailCard
                        key={gradeData.gradeLevel}
                        gradeData={gradeData}
                        isSelected={activeGrade === gradeData.gradeLevel}
                        onPress={() =>
                            setSelectedGrade(
                                activeGrade === gradeData.gradeLevel
                                    ? null
                                    : gradeData.gradeLevel,
                            )
                        }
                    />
                ))}
            </View>

            {/* ── Bottleneck Insight (shown for selected grade) ───────────────── */}
            {activeGradeData?.bottleneck && (
                <View style={styles.insightBanner}>
                    <View style={styles.insightBannerHeader}>
                        <Text style={styles.insightBannerTitle}>
                            Grade {activeGradeData.gradeLevel} — Insight
                        </Text>
                    </View>
                    <Text style={styles.insightBannerText}>
                        {BOTTLENECK_MESSAGES[activeGradeData.bottleneck]}
                    </Text>
                </View>
            )}
        </View>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },

    // ── Header ─────────────────────────────────────────────────────────────────
    cardHeader: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 3,
    },

    // ── Legend ─────────────────────────────────────────────────────────────────
    legendRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    legendDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
    },
    legendLabel: {
        fontSize: 11,
        color: '#555',
        fontWeight: '500',
    },

    // ── Chart ──────────────────────────────────────────────────────────────────
    chart: {
        borderRadius: 12,
        marginLeft: -10, // compensate for chart-kit's built-in left padding
    },
    yAxisHint: {
        fontSize: 10,
        color: '#AAA',
        textAlign: 'right',
        marginTop: -4,
        marginBottom: 4,
    },

    // ── Divider ────────────────────────────────────────────────────────────────
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 14,
    },

    // ── Grade Cards ────────────────────────────────────────────────────────────
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    gradeCardsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    gradeCard: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1.5,
        borderColor: '#EFEFEF',
    },
    gradeCardSelected: {
        borderColor: '#45B7D1',
        backgroundColor: '#F0FAFD',
    },
    gradeCardHeader: {
        marginBottom: 8,
    },
    gradeCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    gradeCardCount: {
        fontSize: 10,
        color: '#888',
        marginTop: 1,
    },
    gradeCardEmpty: {
        fontSize: 11,
        color: '#AAA',
        fontStyle: 'italic',
        marginBottom: 6,
    },

    // ── Stage Row (inside grade card) ──────────────────────────────────────────
    stageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderRadius: 6,
        marginBottom: 2,
    },
    stageRowBottleneck: {
        backgroundColor: '#FFF3F3',
    },
    stageRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flex: 1,
    },
    stageDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    stageName: {
        fontSize: 10,
        color: '#444',
        fontWeight: '500',
        flexShrink: 1,
    },
    stageRowRight: {
        alignItems: 'flex-end',
    },
    stageCount: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    stagePercentage: {
        fontSize: 9,
        color: '#888',
    },

    // ── Bottleneck / On-track badges ───────────────────────────────────────────
    bottleneckBadge: {
        marginTop: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    bottleneckBadgeText: {
        fontSize: 9,
        fontWeight: '700',
    },
    onTrackBadge: {
        marginTop: 8,
    },
    onTrackBadgeText: {
        fontSize: 9,
        color: '#4ECDC4',
        fontWeight: '700',
    },

    // ── Insight Banner ─────────────────────────────────────────────────────────
    insightBanner: {
        marginTop: 14,
        backgroundColor: '#FFF8F0',
        borderRadius: 10,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FFB347',
    },
    insightBannerHeader: {
        marginBottom: 4,
    },
    insightBannerTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B7570A',
    },
    insightBannerText: {
        fontSize: 12,
        color: '#7A5000',
        lineHeight: 18,
    },

    // ── State containers (loading / error / empty) ─────────────────────────────
    stateContainer: {
        paddingVertical: 32,
        alignItems: 'center',
        gap: 8,
    },
    stateText: {
        fontSize: 13,
        color: '#888',
    },
    stateSubText: {
        fontSize: 12,
        color: '#AAA',
    },
    errorText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#C0392B',
    },
    errorSubText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 4,
        backgroundColor: '#45B7D1',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
});
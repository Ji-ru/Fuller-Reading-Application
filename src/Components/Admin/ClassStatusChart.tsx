// components/Admin/ClassStatusChart.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useClassMetrics } from '../../Hooks/Admin/useClassMetrics';
import { sw, sh, sf } from '../../Utils/responsive';

interface ClassStatusChartProps {
  acadYear?: string;
}

// ─── Palette (aligned with the faculty UI theme) ─────────────────────────────
const C = {
  card: '#FFFFFF',
  ink: '#1F2937',
  inkLight: '#6B7280',
  slate: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FAFAFA',
  track: '#F3F4F6',

  active: '#2CA96A',
  activeBg: '#E8F5E9',
  archived: '#94A3B8',
  archivedBg: '#F1F5F9',

  insightBg: '#E8F5E9',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  errorBorder: '#FECACA',
};

const ClassStatusChart: React.FC<ClassStatusChartProps> = ({ acadYear }) => {
  const {
    activeClassCount,
    archivedClassCount,
    totalClasses,
    isLoading,
    errorMessage,
    fetchMetrics,
  } = useClassMetrics(acadYear);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={S.card}>
        <Header acadYear={acadYear} total={null} />
        <View style={S.centered}>
          <ActivityIndicator size="large" color={C.active} />
          <Text style={S.loadingText}>Loading class activity…</Text>
        </View>
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (errorMessage) {
    return (
      <View style={S.card}>
        <Header acadYear={acadYear} total={null} />
        <View style={S.errorBox}>
          <Text style={S.errorIcon}>⚠️</Text>
          <Text style={S.errorText}>Failed to load class data</Text>
          <Text style={S.errorSub}>{errorMessage}</Text>
        </View>
      </View>
    );
  }

  const total = totalClasses || activeClassCount + archivedClassCount || 0;
  const activePct = total > 0 ? (activeClassCount / total) * 100 : 0;
  const archivedPct = total > 0 ? (archivedClassCount / total) * 100 : 0;

  // ── Empty state ────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <View style={S.card}>
        <Header acadYear={acadYear} total={0} />
        <View style={S.emptyBox}>
          <Text style={S.emptyIcon}>📚</Text>
          <Text style={S.emptyTitle}>No classes yet</Text>
          <Text style={S.emptyText}>
            Your classes will appear here once they are created.
          </Text>
        </View>
      </View>
    );
  }

  // ── Insight copy (varies by ratio so the card always has a takeaway) ────
  const insightText =
    activePct >= 75
      ? 'Most of your classes are currently active.'
      : activePct >= 50
        ? 'A majority of your classes are still active.'
        : activePct > 0
          ? 'More classes have been archived than active. Review whether any should be reactivated.'
          : 'All classes are archived.';

  return (
    <View style={S.card}>
      <Header acadYear={acadYear} total={total} />

      {/* ── Proportion bar (visual ratio at a glance) ──────────────────── */}
      <View style={S.proportionBar}>
        {activePct > 0 && (
          <View
            style={[
              S.proportionSegment,
              { width: `${activePct}%`, backgroundColor: C.active },
            ]}
          />
        )}
        {archivedPct > 0 && (
          <View
            style={[
              S.proportionSegment,
              { width: `${archivedPct}%`, backgroundColor: C.archived },
            ]}
          />
        )}
      </View>

      {/* ── Stat cards (Active / Archived) ─────────────────────────────── */}
      <View style={S.statRow}>
        <View style={[S.statCard, { borderTopColor: C.active }]}>
          <View style={[S.statIconRing, { backgroundColor: C.activeBg }]}>
            <Text style={[S.statIconText, { color: C.active }]}>✓</Text>
          </View>
          <Text style={S.statLabel}>Active</Text>
          <Text style={[S.statValue, { color: C.active }]}>{activeClassCount}</Text>
          <Text style={S.statPct}>{activePct.toFixed(0)}% of total</Text>
        </View>

        <View style={[S.statCard, { borderTopColor: C.archived }]}>
          <View style={[S.statIconRing, { backgroundColor: C.archivedBg }]}>
            <Text style={[S.statIconText, { color: C.archived }]}>📦</Text>
          </View>
          <Text style={S.statLabel}>Archived</Text>
          <Text style={[S.statValue, { color: C.archived }]}>{archivedClassCount}</Text>
          <Text style={S.statPct}>{archivedPct.toFixed(0)}% of total</Text>
        </View>
      </View>

      {/* ── Insight bar ────────────────────────────────────────────────── */}
      <View style={S.insightBar}>
        <Text style={S.insightIcon}>📊</Text>
        <Text style={S.insightText}>{insightText}</Text>
      </View>
    </View>
  );
};

// ─── Header sub-component (shared across loading / error / data states) ─────
const Header: React.FC<{ acadYear?: string; total: number | null }> = ({
  acadYear,
  total,
}) => (
  <View style={S.header}>
    <View style={S.accentBar} />
    <View style={S.headerText}>
      <Text style={S.title}>Class Activity Overview</Text>
      <Text style={S.subtitle}>
        {total === null
          ? 'Active and archived classes'
          : `${total} ${total === 1 ? 'class' : 'classes'}${acadYear ? ` · SY ${acadYear}` : ''}`}
      </Text>
      <Text style={S.description}>
        See how many of your classes are currently in use vs. archived.
      </Text>
    </View>
  </View>
);

// ─── Styles ────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: sw(16),
    padding: sw(20),
    marginBottom: sh(16),
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(2) },
    shadowOpacity: 0.06,
    shadowRadius: sw(10),
    elevation: 3,
  },

  // ── Header ─────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sh(16),
  },
  accentBar: {
    width: sw(4),
    height: sh(48),
    backgroundColor: C.active,
    borderRadius: sw(2),
    marginRight: sw(12),
    marginTop: sh(2),
  },
  headerText: { flex: 1 },
  title: {
    fontSize: sf(17),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(2),
  },
  subtitle: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.active,
    marginBottom: sh(4),
  },
  description: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    lineHeight: sf(16),
  },

  // ── Proportion bar ─────────────────────────────────────────────────────
  proportionBar: {
    flexDirection: 'row',
    height: sh(14),
    borderRadius: sw(99),
    overflow: 'hidden',
    backgroundColor: C.track,
    marginBottom: sh(16),
  },
  proportionSegment: {
    height: '100%',
  },

  // ── Stat cards ─────────────────────────────────────────────────────────
  statRow: {
    flexDirection: 'row',
    gap: sw(12),
    marginBottom: sh(14),
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: sw(12),
    padding: sw(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderTopWidth: 3,
  },
  statIconRing: {
    width: sw(40),
    height: sw(40),
    borderRadius: sw(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(8),
  },
  statIconText: {
    fontSize: sf(18),
    fontFamily: 'Nunito-Bold',
  },
  statLabel: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Bold',
    color: C.inkLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: sh(4),
  },
  statValue: {
    fontSize: sf(28),
    fontFamily: 'Nunito-Bold',
    marginBottom: sh(2),
  },
  statPct: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },

  // ── Insight ────────────────────────────────────────────────────────────
  insightBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.insightBg,
    borderRadius: sw(10),
    paddingVertical: sh(10),
    paddingHorizontal: sw(12),
    gap: sw(8),
  },
  insightIcon: {
    fontSize: sf(16),
  },
  insightText: {
    flex: 1,
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.ink,
    lineHeight: sf(18),
  },

  // ── Loading ────────────────────────────────────────────────────────────
  centered: {
    paddingVertical: sh(30),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: sh(10),
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },

  // ── Error ──────────────────────────────────────────────────────────────
  errorBox: {
    backgroundColor: C.errorBg,
    borderRadius: sw(10),
    padding: sw(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.errorBorder,
  },
  errorIcon: {
    fontSize: sf(24),
    marginBottom: sh(6),
  },
  errorText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.error,
    marginBottom: sh(2),
  },
  errorSub: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
    textAlign: 'center',
  },

  // ── Empty ──────────────────────────────────────────────────────────────
  emptyBox: {
    paddingVertical: sh(30),
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: sf(36),
    marginBottom: sh(8),
  },
  emptyTitle: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(4),
  },
  emptyText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
    textAlign: 'center',
  },
});

export default ClassStatusChart;

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { BounceIn } from '../GlobalUse/Animations';
import {
  CheckCircleIcon,
  StarIcon,
  TrophyIcon,
  BookOpenIcon,
  ZapIcon,
  ChevronRightIcon,
} from '../GlobalUse/Icons';
import { StudentColors as C, Radii, Shadows, ACCENT_COLORS } from '../../Utilities/Theme';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AralinSummary {
  index: number;
  letter: string;
  label: string;
  progress: number; // 0-100
  accent: string;
  hasActivity: boolean;
}

interface OverviewTabProps {
  groupedReports: AralinSummary[];
  aralinDone: number;
  totalAttempts: number;
  studentName: string;
}

// ── Helper: status label ──────────────────────────────────────────────────────
const statusOf = (p: number) => {
  if (p >= 100) return { label: 'Tapos Na', color: '#22c55e', bg: '#22c55e14' };
  if (p > 0)    return { label: `${p}%`, color: C.orange, bg: C.orange + '14' };
  return         { label: 'Hindi pa', color: C.slate, bg: C.bg };
};

// ── Single compact row ────────────────────────────────────────────────────────
function AralinRow({ item, delay }: { item: AralinSummary; delay: number }) {
  const s = statusOf(item.progress);

  return (
    <BounceIn delay={delay}>
      <View style={[S.row, item.progress >= 100 && S.rowDone]}>
        {/* Left: Letter circle */}
        <View style={[S.letterCircle, { backgroundColor: item.progress >= 100 ? '#22c55e18' : item.accent + '14' }]}>
          <Text style={[S.letterText, { color: item.progress >= 100 ? '#22c55e' : item.accent }]}>
            {item.letter}
          </Text>
        </View>

        {/* Center: Info */}
        <View style={S.rowInfo}>
          <Text style={S.rowLabel}>{item.label}</Text>
          <View style={S.progressTrack}>
            <View style={[S.progressFill, { width: `${item.progress}%`, backgroundColor: item.progress >= 100 ? '#22c55e' : item.accent }]} />
          </View>
        </View>

        {/* Right: Status */}
        <View style={[S.statusBadge, { backgroundColor: s.bg }]}>
          {item.progress >= 100 ? (
            <CheckCircleIcon size={12} color={s.color} />
          ) : null}
          <Text style={[S.statusText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>
    </BounceIn>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function OverviewTab({ groupedReports, aralinDone, totalAttempts, studentName }: OverviewTabProps) {
  const [showAll, setShowAll] = useState(false);

  // Sort: completed at bottom, in-progress at top, then unseen
  const sorted = useMemo(() => {
    return [...groupedReports].sort((a, b) => {
      // Active first (has progress but not complete)
      const aActive = a.progress > 0 && a.progress < 100 ? 1 : 0;
      const bActive = b.progress > 0 && b.progress < 100 ? 1 : 0;
      if (bActive !== aActive) return bActive - aActive;
      // Then completed
      if (a.progress >= 100 && b.progress < 100) return 1;
      if (b.progress >= 100 && a.progress < 100) return -1;
      // Then by index
      return a.index - b.index;
    });
  }, [groupedReports]);

  const totalAralins = readingMaterialData.Alphabet.length;
  const overallProgress = totalAralins > 0 ? Math.round((aralinDone / totalAralins) * 100) : 0;

  // Show first 8 items unless "show all"
  const displayed = showAll ? sorted : sorted.slice(0, 8);
  const hasMore = sorted.length > 8;

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero Card ── */}
      <BounceIn delay={40}>
        <View style={S.hero}>
          <Text style={S.heroTitle}>Iyong Lakbay sa Pagbabasa</Text>

          {/* Overall progress ring */}
          <View style={S.heroStats}>
            <View style={S.heroStatBlock}>
              <View style={S.ringOuter}>
                <Text style={S.ringText}>{overallProgress}%</Text>
              </View>
              <Text style={S.heroStatCaption}>Kabuuang{'\n'}Pag-unlad</Text>
            </View>
            <View style={S.heroDivider} />
            <View style={S.heroStatBlock}>
              <Text style={S.heroStatNum}>{aralinDone}</Text>
              <Text style={S.heroStatCaption}>Aralin{'\n'}Natapos</Text>
            </View>
            <View style={S.heroDivider} />
            <View style={S.heroStatBlock}>
              <Text style={S.heroStatNum}>{totalAttempts}</Text>
              <Text style={S.heroStatCaption}>Kabuuang{'\n'}Pagsubok</Text>
            </View>
          </View>

          {/* Overall progress bar */}
          <View style={S.heroBarTrack}>
            <View style={[S.heroBarFill, { width: `${overallProgress}%` }]} />
          </View>
          <Text style={S.heroBarCaption}>
            {aralinDone} sa {totalAralins} na aralin ang ganap na natapos
          </Text>
        </View>
      </BounceIn>

      {/* ── Section Header ── */}
      <BounceIn delay={100}>
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Mga Aralin</Text>
          <Text style={S.sectionSub}>{aralinDone} natapos • {totalAralins - aralinDone} natitira</Text>
        </View>
      </BounceIn>

      {/* ── Aralin Roadmap (compact rows) ── */}
      {displayed.map((item, i) => (
        <AralinRow key={item.index} item={item} delay={120 + i * 30} />
      ))}

      {/* Show all / collapse */}
      {hasMore && (
        <BounceIn delay={380}>
          <TouchableOpacity style={S.showAllBtn} onPress={() => setShowAll(!showAll)} activeOpacity={0.7}>
            <Text style={S.showAllText}>
              {showAll ? 'Itago ang iba' : `Ipakita lahat (${sorted.length})`}
            </Text>
            <ChevronRightIcon size={14} color={C.green} />
          </TouchableOpacity>
        </BounceIn>
      )}

      {/* ── Empty State ── */}
      {groupedReports.length === 0 && (
        <BounceIn delay={160}>
          <View style={S.emptyState}>
            <BookOpenIcon size={48} color={C.green} />
            <Text style={S.emptyTitle}>Wala pang kasaysayan</Text>
            <Text style={S.emptyHint}>
              Simulan ang iyong paglalakbay sa pagbabasa para makita ang iyong pag-unlad dito!
            </Text>
          </View>
        </BounceIn>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: C.greenDeep,
    borderRadius: Radii.xl,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: 20,
    ...Shadows.cardLift,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.white,
    lineHeight: 28,
    marginBottom: 18,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  heroStatBlock: { alignItems: 'center', flex: 1 },
  heroDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  ringOuter: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  ringText: { fontSize: 14, fontWeight: '900', color: C.white },
  heroStatNum: { fontSize: 26, fontWeight: '900', color: C.white, marginBottom: 4 },
  heroStatCaption: {
    fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase', textAlign: 'center', lineHeight: 14,
  },
  heroBarTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  heroBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#22c55e' },
  heroBarCaption: {
    fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textAlign: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: 12, paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: C.ink },
  sectionSub: { fontSize: 12, fontWeight: '700', color: C.slate },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: Radii.md,
    padding: 14, marginBottom: 10,
    ...Shadows.subtle,
  },
  rowDone: { opacity: 0.7 },
  letterCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  letterText: { fontSize: 18, fontWeight: '900' },
  rowInfo: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 14, fontWeight: '800', color: C.ink, marginBottom: 6 },
  progressTrack: {
    height: 6, backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radii.pill,
  },
  statusText: { fontSize: 11, fontWeight: '800' },

  // Show all
  showAllBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
    paddingVertical: 14, marginTop: 4,
  },
  showAllText: { fontSize: 14, fontWeight: '800', color: C.green },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'center', marginTop: 16, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: C.slate, textAlign: 'center', lineHeight: 21 },
});

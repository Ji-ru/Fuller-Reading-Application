import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../Controller/NavigationController';
import BubbleBackground from '../Components/GlobalUse/BubbleBackground';
import { sw, sh, sf } from '../Utils/responsive';
import upperNav from '../UI_Designs/UpperNavigation';
import Svg, { Text as SvgText } from 'react-native-svg';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  green: '#2ca96a',
  greenDark: '#008443',
  greenDeep: '#005028',
  greenLight: '#c0e8f2',
  greenPale: '#E8F5E9',
  bg: '#F1FBF4',
  white: '#ffffff',
  ink: '#1B2B22',
  inkLight: '#6B8E6B',
  slate: '#A5B8A7',
  border: '#C8E6C9',
};

// ─── Team members ─────────────────────────────────────────────────────────────
const TEAM = [
  {
    name: 'Jibril Leander Paul M. Rubi',
    role: 'Lead Developer',
    image: require('../../assets/developers/jibril.jpg'),
  },
  {
    name: 'Arth Luije S. Bancat',
    role: 'Software Developer',
    image: require('../../assets/developers/arth.jpg'),
  },
  {
    name: 'Erwin Leonardia',
    role: 'AI/ML Developer',
    image: require('../../assets/developers/erwin.jpg'),
  },
];

// ─── STT model (currently active) ────────────────────────────────────────────
const STT_MODEL = {
  name: 'Nova-3',
  fullName: 'Deepgram Nova-3',
  origin: 'Deepgram',
  description:
    'Nova-3 is an advanced speech-to-text model designed for highly accurate, ' +
    'fast, and reliable transcription. It is optimized for real-time speech ' +
    'recognition and can capture spoken words with strong contextual awareness, ' +
    'making it well suited for evaluating young learners’ reading fluency, ' +
    'pronunciation, and oral reading accuracy.',
  badges: ['Real-time', 'High accuracy', 'Context-aware'],
  color: '#2ca96a',
};

// ─── Fade-slide animation ─────────────────────────────────────────────────────
function FadeSlideIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const translateY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 55, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      {children}
    </Animated.View>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ emoji, title }: { emoji: string; title: string }) {
  return (
    <View style={S.sectionHeading}>
      <Text style={S.sectionEmoji}>{emoji}</Text>
      <Text style={S.sectionTitle}>{title}</Text>
      <View style={S.sectionLine} />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AboutScreen() {
  const { handleBackStep } = useNavigationHelper();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<any>(null);
  const [previewName, setPreviewName] = useState('');

  const openPreview = (image: any, name: string) => {
    setPreviewImage(image);
    setPreviewName(name);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewImage(null);
    setPreviewName('');
  };

  return (
    <SafeAreaView style={S.bg}>
      <BubbleBackground />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={{ zIndex: 100, elevation: 100 }}>
        <View style={upperNav.header}>
          <TouchableOpacity style={S.backBtn} onPress={() => handleBackStep()} activeOpacity={0.7}>
            <Text style={S.backArrowText}>‹</Text>
          </TouchableOpacity>
          <Svg height={60} width={220} pointerEvents="none">
            <SvgText
              x={110}
              y={35}
              fontSize={23}
              fontFamily="Nunito-Black"
              textAnchor="middle"
              fill="none"
              stroke="#E8F5E9"
              strokeWidth={8}
              strokeLinejoin="round"
            >
              About
            </SvgText>
            <SvgText
              x={110}
              y={35}
              fontSize={23}
              fontFamily="Nunito-Black"
              textAnchor="middle"
              fill="#1B5E20"
            >
              About
            </SvgText>
          </Svg>
          {/* Spacer to balance the layout (matches back button width) */}
          <View style={S.headerSpacer} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scroll}
      >
        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <FadeSlideIn delay={0}>
          <View style={S.heroBanner}>
            <View style={S.heroTextWrap}>
              <Text style={S.heroEyebrow}>CISC KIDS</Text>
              <Text style={S.heroTitle}>Reading{'\n'}Assessment App</Text>
              <Text style={S.heroVersion}>Version 1.0.0</Text>
            </View>
            <View style={S.heroIconWrap}>
              <Text style={{ fontSize: sf(52) }}>📚</Text>
            </View>
          </View>
        </FadeSlideIn>

        {/* ── App Description ─────────────────────────────────────────────── */}
        <FadeSlideIn delay={80}>
          <View style={S.card}>
            <SectionHeading emoji="✨" title="About the App" />
            <Text style={S.bodyText}>
              CISC Kids is a mobile reading assessment platform designed for
              Grade 1–3 students. It uses speech recognition to evaluate oral
              reading fluency, detect miscues, and track reading progress over
              time — giving teachers and students actionable insights in real
              time.
            </Text>
            <Text style={[S.bodyText, { marginTop: sh(10) }]}>
              The app supports two reading modes — word
              pronunciation and passage reading — each with automatic accuracy
              scoring and miscue analysis (substitution, omission, insertion,
              and repetition).
            </Text>

            {/* Feature chips */}
            <View style={S.chipRow}>
              {['Oral Fluency', 'Miscue Analysis', 'Progress Tracking', 'Grade 1–3', 'English Language'].map(f => (
                <View key={f} style={S.chip}>
                  <Text style={S.chipText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeSlideIn>

        {/* ── STT Model ───────────────────────────────────────────────────── */}
        <FadeSlideIn delay={140}>
          <View style={S.card}>
            <SectionHeading emoji="🎙" title="Speech Recognition Model" />

            <View style={[S.modelCard, { borderColor: STT_MODEL.color + '55' }]}>
              {/* Header row */}
              <View style={S.modelHeaderRow}>
                <View style={[S.modelIconCircle, { backgroundColor: STT_MODEL.color + '18' }]}>
                  <Text style={{ fontSize: sf(26) }}>🤖</Text>
                </View>
                <View style={{ flex: 1, marginLeft: sw(14) }}>
                  <Text style={[S.modelName, { color: STT_MODEL.color }]}>{STT_MODEL.name}</Text>
                  <Text style={S.modelFullName}>{STT_MODEL.fullName}</Text>
                  <Text style={S.modelOrigin}>by {STT_MODEL.origin}</Text>
                </View>
                <View style={[S.activePill, { backgroundColor: STT_MODEL.color }]}>
                  <Text style={S.activePillText}>Active</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={S.modelDesc}>{STT_MODEL.description}</Text>

              {/* Badges */}
              <View style={S.chipRow}>
                {STT_MODEL.badges.map(b => (
                  <View key={b} style={[S.chip, { backgroundColor: STT_MODEL.color + '18', borderColor: STT_MODEL.color + '44' }]}>
                    <Text style={[S.chipText, { color: STT_MODEL.color }]}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </FadeSlideIn>

        {/* ── Team ────────────────────────────────────────────────────────── */}
        <FadeSlideIn delay={200}>
          <View style={S.card}>
            <SectionHeading emoji="👥" title="The Team" />

            <View style={S.teamGrid}>
              {TEAM.map((member, i) => (
                <Animated.View key={i} style={S.memberCard}>
                  <TouchableOpacity
                    style={S.memberAvatarCircle}
                    onPress={() => openPreview(member.image, member.name)}
                    activeOpacity={0.85}
                  >
                    <Image source={member.image} style={S.memberAvatarImage} />
                  </TouchableOpacity>
                  <Text style={S.memberName}>{member.name}</Text>
                  <Text style={S.memberRole}>{member.role}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        </FadeSlideIn>

        {/* ── Built with ──────────────────────────────────────────────────── */}
        <FadeSlideIn delay={260}>
          <View style={S.card}>
            <SectionHeading emoji="🔧" title="Built With" />
            <View style={S.techRow}>
              {[
                { label: 'React Native', emoji: '⚛️' },
                { label: 'Firebase', emoji: '🔥' },
                { label: 'Deepgram Nova3', emoji: '🎙' },
                { label: 'TypeScript', emoji: '📘' },
              ].map(t => (
                <View key={t.label} style={S.techChip}>
                  <Text style={S.techEmoji}>{t.emoji}</Text>
                  <Text style={S.techLabel}>{t.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeSlideIn>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <FadeSlideIn delay={320}>
          <View style={S.footer}>
            <Text style={S.footerText}>Made with ❤️ for Filipino learners</Text>
            <Text style={S.footerSub}>© 2026 CISC Kids. All rights reserved.</Text>
          </View>
        </FadeSlideIn>

        <View style={{ height: sh(32) }} />
      </ScrollView>

      <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={closePreview}>
        <View style={S.previewOverlay}>
          <TouchableOpacity style={S.previewBackdrop} onPress={closePreview} activeOpacity={1} />
          <View style={S.previewCard}>
            <Image source={previewImage} style={S.previewImage} resizeMode="contain" />
            {!!previewName && <Text style={S.previewName}>{previewName}</Text>}
            <TouchableOpacity style={S.previewCloseButton} onPress={closePreview} activeOpacity={0.85}>
              <Text style={S.previewCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },

  // Header
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40,
    fontFamily: 'Nunito-Bold',
    color: C.white,
    lineHeight: 28,
    marginLeft: -2,
    paddingBottom: 2,
  },
  headerSpacer: {
    width: 45,
    height: 45,
  },

  scroll: {
    paddingHorizontal: sw(16),
    paddingTop: sh(4),
  },

  // Hero banner
  heroBanner: {
    backgroundColor: C.greenDark,
    borderRadius: sw(24),
    paddingVertical: sh(28),
    paddingHorizontal: sw(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sh(16),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: C.greenDeep,
    shadowOffset: { width: 0, height: sw(6) },
    shadowOpacity: 0.3,
    shadowRadius: sw(12),
  },
  heroTextWrap: { flex: 1 },
  heroEyebrow: {
    fontSize: sf(11),
    fontFamily: 'Nunito-ExtraBold',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: sh(4),
  },
  heroTitle: {
    fontSize: sf(30),
    fontFamily: 'Nunito-Black',
    color: C.white,
    lineHeight: sf(36),
    marginBottom: sh(10),
  },
  heroVersion: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: sw(10),
    paddingVertical: sh(3),
    borderRadius: sw(12),
    alignSelf: 'flex-start',
  },
  heroIconWrap: {
    width: sw(80),
    height: sw(80),
    borderRadius: sw(20),
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sw(16),
  },

  // Cards
  card: {
    backgroundColor: C.white,
    borderRadius: sw(20),
    padding: sw(20),
    marginBottom: sh(16),
    elevation: 2,
    shadowColor: C.greenDeep,
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.07,
    shadowRadius: sw(8),
  },

  // Section heading
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(16),
    gap: sw(8),
  },
  sectionEmoji: { fontSize: sf(20) },
  sectionTitle: {
    fontSize: sf(17),
    fontFamily: 'Nunito-ExtraBold',
    color: C.ink,
  },
  sectionLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: C.border,
    marginLeft: sw(4),
  },

  // Body text
  bodyText: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    lineHeight: sf(22),
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(8),
    marginTop: sh(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: C.greenPale,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: sw(20),
    paddingHorizontal: sw(12),
    paddingVertical: sh(5),
  },
  chipText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.greenDark,
  },

  // Model card
  modelCard: {
    borderWidth: 1.5,
    borderRadius: sw(16),
    padding: sw(16),
    backgroundColor: '#FAFFFE',
  },
  modelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(14),
  },
  modelIconCircle: {
    width: sw(56),
    height: sw(56),
    borderRadius: sw(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelName: {
    fontSize: sf(20),
    fontFamily: 'Nunito-Black',
    marginBottom: sh(2),
  },
  modelFullName: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(2),
  },
  modelOrigin: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },
  activePill: {
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: sw(20),
    alignSelf: 'flex-start',
  },
  activePillText: {
    fontSize: sf(11),
    fontFamily: 'Nunito-ExtraBold',
    color: C.white,
    letterSpacing: 0.5,
  },
  modelDesc: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    lineHeight: sf(20),
    marginBottom: sh(4),
  },

  // Team grid
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: sw(12),
  },
  memberCard: {
    width: '46%',
    backgroundColor: C.greenPale,
    borderRadius: sw(16),
    padding: sw(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  memberAvatarCircle: {
    width: sw(54),
    height: sw(54),
    borderRadius: sw(27),
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(10),
    borderWidth: 2,
    borderColor: C.border,
    elevation: 2,
    shadowColor: C.greenDeep,
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.1,
    shadowRadius: sw(4),
  },
  memberAvatarImage: {
    width: sw(48),
    height: sw(48),
    borderRadius: sw(24),
    borderWidth: 1,
    borderColor: C.border,
  },
  memberName: {
    fontSize: sf(13),
    fontFamily: 'Nunito-ExtraBold',
    color: C.ink,
    textAlign: 'center',
    marginBottom: sh(3),
  },
  memberRole: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    textAlign: 'center',
  },

  // Preview modal
  previewOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  previewCard: {
    width: sw(260),
    borderRadius: sw(18),
    backgroundColor: C.white,
    padding: sw(16),
    alignItems: 'center',
    elevation: 6,
    shadowColor: C.greenDeep,
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.2,
    shadowRadius: sw(10),
  },
  previewImage: {
    width: sw(200),
    height: sw(200),
    borderRadius: sw(12),
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.greenPale,
  },
  previewName: {
    marginTop: sh(10),
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    textAlign: 'center',
  },
  previewCloseButton: {
    marginTop: sh(10),
    paddingHorizontal: sw(16),
    paddingVertical: sh(8),
    borderRadius: sw(14),
    backgroundColor: C.green,
  },
  previewCloseText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.white,
  },

  // Built with
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(10),
    marginTop: sh(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenPale,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: sw(12),
    paddingHorizontal: sw(12),
    paddingVertical: sh(8),
    gap: sw(6),
  },
  techEmoji: { fontSize: sf(16) },
  techLabel: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.greenDark,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: sh(20),
    gap: sh(6),
  },
  footerText: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: C.inkLight,
  },
  footerSub: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.slate,
  },
});
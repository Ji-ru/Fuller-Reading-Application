import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SectionList,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { Alphabet, Contrasts, Passage, Word } from '../../Interfaces/passage';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import upperNav from '../../UI_Designs/UpperNavigation';

const { width: SW } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────
const alphabetData: Alphabet[] = readingMaterialData?.Alphabet || [];
const passages: Passage[]      = readingMaterialData?.Passages || [];
const wordsData: Word[]        = readingMaterialData?.Words    || [];

// ─── Palette (same green system as Profile) ───────────────────────────────────
const C = {
  green:      '#2ecc71',
  greenDark:  '#27ae60',
  greenDeep:  '#1a7a45',
  greenLight: '#d4f5e2',
  greenPale:  '#f0faf4',
  mint:       '#a8edce',
  teal:       '#1abc9c',
  yellow:     '#f9e04b',
  yellowDark: '#e6c820',
  orange:     '#f39c12',
  coral:      '#e74c3c',
  sky:        '#3498db',
  white:      '#ffffff',
  ink:        '#1b2e23',
  inkLight:   '#4a6358',
  slate:      '#8fafa0',
  bg:         '#f0faf4',
};

// Letter background colours — cycle through for rainbow effect
const LETTER_COLORS = [
  C.green, C.teal, C.sky, C.yellow, C.orange, C.coral,
  '#9b59b6', '#e91e63', '#00bcd4', '#8bc34a',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── Bounce-in wrapper (reused from Profile) ──────────────────────────────────
function BounceIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const scale   = useRef(new Animated.Value(0.75)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 65, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  return <Animated.View style={{ transform: [{ scale }], opacity }}>{children}</Animated.View>;
}

// ─── Alphabet Tile ────────────────────────────────────────────────────────────
function AlphabetTile({
  item,
  index,
  onPress,
}: {
  item: Alphabet;
  index: number;
  onPress: (a: Alphabet) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const bg    = LETTER_COLORS[index % LETTER_COLORS.length];

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80 }),
    ]).start();
    onPress(item);
  };

  return (
    <BounceIn delay={index * 28}>
      <TouchableOpacity onPress={press} activeOpacity={0.85}>
        <Animated.View style={[S.alphaTile, { backgroundColor: bg, transform: [{ scale }] }]}>
          {/* shine dot */}
          <View style={S.alphaTileShine} />
          <Text style={S.alphaTileLetter}>{item.letter}</Text>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
}

// ─── Word Row ─────────────────────────────────────────────────────────────────
function WordRow({ item, onPress }: { item: string; onPress: (w: string) => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress(item);
  };
  return (
    <TouchableOpacity onPress={press} activeOpacity={0.85}>
      <Animated.View style={[S.wordRow, { transform: [{ scale }] }]}>
        <View style={S.wordDot} />
        <Text style={S.wordText}>{item}</Text>
        <View style={S.wordArrow}>
          <Text style={S.wordArrowText}>→</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Passage Card ─────────────────────────────────────────────────────────────
function PassageCard({
  item,
  index,
  onPress,
}: {
  item: Passage;
  index: number;
  onPress: (p: Passage) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const accent = LETTER_COLORS[index % LETTER_COLORS.length];

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress(item);
  };

  return (
    <BounceIn delay={index * 60}>
      <TouchableOpacity onPress={press} activeOpacity={0.85}>
        <Animated.View style={[S.passageCard, { borderLeftColor: accent, transform: [{ scale }] }]}>
          <View style={[S.passageAccentBar, { backgroundColor: accent }]} />
          <View style={S.passageCardInner}>
            <View style={[S.passageEmojiBubble, { backgroundColor: accent + '22' }]}>
              <Text style={S.passageEmoji}>📖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.passageCardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={S.passageCardAuthor}>ni {item.author}</Text>
            </View>
            <View style={[S.passageGoBtn, { backgroundColor: accent }]}>
              <Text style={S.passageGoBtnText}>→</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({
  label,
  emoji,
  active,
  onPress,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(active ? 1 : 0.95)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1 : 0.95,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [active]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1 }}>
      <Animated.View
        style={[
          S.tabBtn,
          active && S.tabBtnActive,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={S.tabEmoji}>{emoji}</Text>
        <Text style={[S.tabLabel, active && S.tabLabelActive]}>{label}</Text>
        {active && <View style={S.tabDot} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Section Header for Words ─────────────────────────────────────────────────
function WordSectionHeader({ letter, index }: { letter: string; index: number }) {
  const bg = LETTER_COLORS[index % LETTER_COLORS.length];
  return (
    <View style={[S.sectionHeader, { backgroundColor: bg }]}>
      <Text style={S.sectionHeaderText}>{letter}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PageSelectionScreen() {
  const { handleLogout, handleBackStep, handleReadingNext } = useNavigationHelper();

  const [menuVisible,   setMenuVisible]   = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'alphabet' | 'passage' | 'word'>('alphabet');

  // Section-header index map so each letter keeps its colour
  const letterIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    wordsData.forEach((w, i) => { map[w.letter] = i; });
    return map;
  }, []);

  const handleAlphabetSelect = (alphabet: Alphabet) =>
    handleReadingNext(alphabet, 'alphabet');

  const handleWordSelect = (wordText: string) => {
    const wordData = wordsData.find((w: Word) =>
      w.contrasts.some((c: Contrasts) => c.words.includes(wordText)),
    );
    if (!wordData) return;
    const filteredWord: Word = {
      letter: wordData.letter,
      contrasts: wordData.contrasts
        .map(c => ({
          ...c,
          words: c.words.filter(
            w => w.trim().toLowerCase() === wordText.trim().toLowerCase(),
          ),
        }))
        .filter(c => c.words.length > 0),
    };
    handleReadingNext(filteredWord, 'word');
  };

  const handlePassageSelect = (passage: Passage) =>
    handleReadingNext(passage, 'passage');

  const prepareWordsData = useMemo(() =>
    wordsData.map((wordData: Word) => {
      const allWords: string[] = [];
      wordData.contrasts.forEach((c: Contrasts) => {
        allWords.push(...shuffleArray(c.words).slice(0, 5));
      });
      return { letter: wordData.letter, data: allWords };
    }), []);

  // ── Renderers ────────────────────────────────────────────────────────────────

  const renderAlphabetItem = ({ item, index }: { item: Alphabet; index: number }) => (
    <AlphabetTile item={item} index={index} onPress={handleAlphabetSelect} />
  );

  const renderWordItem = ({ item }: { item: string }) => (
    <WordRow item={item} onPress={handleWordSelect} />
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: { letter: string; data: string[] };
  }) => (
    <WordSectionHeader
      letter={section.letter}
      index={letterIndexMap[section.letter] ?? 0}
    />
  );

  const renderPassageItem = ({ item, index }: { item: Passage; index: number }) => (
    <PassageCard item={item} index={index} onPress={handlePassageSelect} />
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.bg}>
      <View style={S.root}>

        {/* Bubbles */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>

        {/* Nav */}
        <View style={{ zIndex: 100 }}>
          <View style={upperNav.header}>
            <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
              <Image source={require('../../../assets/icons/BackButton-icon.png')} />
            </TouchableOpacity>
            <Image style={upperNav.ciscLogo} source={require('../../../assets/images/cisckids.png')} />
            <TouchableOpacity style={upperNav.touchable} onPress={() => setMenuVisible(v => !v)}>
              <Image style={upperNav.menuIcon} source={require('../../../assets/icons/Menu-icon.png')} />
            </TouchableOpacity>
          </View>

          {menuVisible && (
            <View style={upperNav.dropdownMenu}>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
                style={upperNav.logoutButton}
              >
                <Image source={require('../../../assets/icons/Logout-icon.png')} style={upperNav.logoutIcon} />
                <Text style={upperNav.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
          {menuVisible && (
            <TouchableOpacity
              style={upperNav.closeMenu}
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
          )}
        </View>

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <BounceIn delay={40}>
          <View style={S.heroBanner}>
            <View style={S.heroText}>
              <Text style={S.heroSub}>Piliin ang iyong</Text>
              <Text style={S.heroTitle}>BABASAHIN! 📚</Text>
              <Text style={S.heroHint}>I-tap ang gusto mong basahin</Text>
            </View>
            <Image
              style={S.heroImage}
              source={require('../../../assets/images/Abc-Reading.png')}
            />
          </View>
        </BounceIn>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <BounceIn delay={100}>
          <View style={S.tabRow}>
            <TabBtn
              emoji="🔤"
              label="Alpabeto"
              active={activeTab === 'alphabet'}
              onPress={() => setActiveTab('alphabet')}
            />
            <TabBtn
              emoji="💬"
              label="Salita"
              active={activeTab === 'word'}
              onPress={() => setActiveTab('word')}
            />
            <TabBtn
              emoji="📖"
              label="Talata"
              active={activeTab === 'passage'}
              onPress={() => setActiveTab('passage')}
            />
          </View>
        </BounceIn>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <View style={S.contentArea}>

          {/* ALPHABET */}
          {activeTab === 'alphabet' && (
            <>
              <BounceIn delay={140}>
                <View style={S.sublabelRow}>
                  <Text style={S.sublabelEmoji}>✏️</Text>
                  <Text style={S.sublabel}>Pumili ng letra na pagsasanayan:</Text>
                </View>
              </BounceIn>
              <FlatList
                data={alphabetData}
                renderItem={renderAlphabetItem}
                keyExtractor={item => item.letter}
                numColumns={4}
                columnWrapperStyle={S.alphaRow}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={S.alphaListPad}
              />
            </>
          )}

          {/* WORDS */}
          {activeTab === 'word' && (
            <>
              <BounceIn delay={140}>
                <View style={S.sublabelRow}>
                  <Text style={S.sublabelEmoji}>💬</Text>
                  <Text style={S.sublabel}>Pumili ng salita na pagsasanayan:</Text>
                </View>
              </BounceIn>
              {prepareWordsData.length > 0 ? (
                <SectionList
                  sections={prepareWordsData}
                  renderItem={renderWordItem}
                  renderSectionHeader={renderSectionHeader}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 32 }}
                  stickySectionHeadersEnabled
                />
              ) : (
                <View style={S.emptyState}>
                  <Text style={S.emptyEmoji}>🔍</Text>
                  <Text style={S.emptyText}>Walang salita ang nahanap</Text>
                </View>
              )}
            </>
          )}

          {/* PASSAGES */}
          {activeTab === 'passage' && (
            <>
              <BounceIn delay={140}>
                <View style={S.sublabelRow}>
                  <Text style={S.sublabelEmoji}>📖</Text>
                  <Text style={S.sublabel}>Pumili ng talata na pagsasanayan:</Text>
                </View>
              </BounceIn>
              {passages.length > 0 ? (
                <FlatList
                  data={passages}
                  renderItem={renderPassageItem}
                  keyExtractor={(_, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 32 }}
                />
              ) : (
                <View style={S.emptyState}>
                  <Text style={S.emptyEmoji}>🔍</Text>
                  <Text style={S.emptyText}>Walang talata ang nahanap</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => { setLogoutVisible(false); await handleLogout(); }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  bg:   { flex: 1, backgroundColor: C.bg },
  root: { flex: 1 },

  // Hero
  heroBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: C.white,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 5,
    borderTopColor: C.green,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  heroText:  { flex: 1 },
  heroSub:   { fontSize: 13, color: C.slate, fontWeight: '600', marginBottom: 2 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: C.greenDeep, lineHeight: 30 },
  heroHint:  { fontSize: 12, color: C.slate, marginTop: 6 },
  heroImage: { width: 90, height: 90, resizeMode: 'contain' },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  tabBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.greenLight,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 4,
    position: 'relative',
  },
  tabBtnActive: {
    backgroundColor: C.green,
    borderColor: C.greenDark,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  tabEmoji:      { fontSize: 20 },
  tabLabel:      { fontSize: 12, fontWeight: '700', color: C.inkLight, textAlign: 'center' },
  tabLabelActive:{ color: C.white },
  tabDot: {
    position: 'absolute',
    bottom: 6,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.white,
    opacity: 0.7,
  },

  // Sublabel
  sublabelRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingHorizontal: 4 },
  sublabelEmoji:{ fontSize: 16 },
  sublabel:     { fontSize: 14, fontWeight: '700', color: C.inkLight },

  // Content area
  contentArea: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 14,
  },

  // Alphabet grid
  alphaRow:     { justifyContent: 'space-between', marginBottom: 10 },
  alphaListPad: { paddingBottom: 32 },
  alphaTile: {
    width: (SW - 60) / 4,
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  alphaTileShine: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  alphaTileLetter: {
    fontSize: 30,
    fontWeight: '900',
    color: C.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Words
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 6,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '900',
    color: C.white,
    letterSpacing: 1,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
    gap: 12,
  },
  wordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.green,
  },
  wordText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: C.ink,
  },
  wordArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.greenLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordArrowText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.greenDeep,
  },

  // Passages
  passageCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  passageAccentBar: {
    height: 4,
    width: '100%',
    opacity: 0.4,
  },
  passageCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  passageEmojiBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passageEmoji: { fontSize: 22 },
  passageCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 4,
    lineHeight: 20,
  },
  passageCardAuthor: {
    fontSize: 12,
    color: C.slate,
    fontStyle: 'italic',
  },
  passageGoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passageGoBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText:  { fontSize: 16, color: C.slate, fontWeight: '600' },
});
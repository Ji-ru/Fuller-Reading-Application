
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { ActivityResultDocument } from '../../Interfaces/dataInterfaces';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import {
  BackArrowIcon,
  TrophyIcon,
  ClipboardListIcon,
} from '../../Components/GlobalUse/Icons';
import bubbles from '../../UI_Designs/BubblesDesign';
import { BounceIn } from '../../Components/GlobalUse/Animations';

export default function StudentAssessmentReview() {
  const route = useRoute();
  const { handleBackStep } = useNavigationHelper();
  const { result } = route.params as { result: ActivityResultDocument };

  const renderResponseItem = (response: any, index: number) => {
    const isCorrect = response.isCorrect;
    return (
      <BounceIn 
        key={index} 
        delay={index * 24} 
        style={[
          S.gridItemWrapper, 
          S.itemCard, 
          { borderColor: isCorrect ? C.green : C.coral, borderWidth: 3 }
        ]}
      >
        <Text style={S.itemContentMini} numberOfLines={1}>{response.contentId || 'Item'}</Text>
        <Text style={[S.itemLabelMini, { color: isCorrect ? C.green : C.coral }]}>
          {response.type === 'alphabet' ? 'Tunog' : response.type === 'word' ? 'Salita' : 'Talata'}
        </Text>
      </BounceIn>

    );

  };


  return (
    <SafeAreaView style={S.root}>
      {/* Bubbles Background */}
      <View style={bubbles.bubblesContainer} pointerEvents="none">
        <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
      </View>

      <View style={S.header}>
        <TouchableOpacity onPress={handleBackStep} style={S.backBtn} activeOpacity={0.7}>
          <BackArrowIcon color={C.ink} />
        </TouchableOpacity>
        <Image
          style={S.headerLogo}
          source={require('../../../assets/images/cisckids copy.png')}
          resizeMode="contain"
        />
        <View style={{ width: 44 }} />
      </View>

      <View style={S.fixedHeaderContainer}>
        <BounceIn delay={60}>
          <View style={S.summaryCard}>
            <View style={S.summaryLeft}>
              <Text style={S.summarySubtitle}>Assessment Mastery</Text>
              <Text style={S.summaryTitle}>{result.percentage >= 90 ? 'Eksperto!' : result.percentage >= 75 ? 'Magaling!' : 'Ipagpatuloy!'}</Text>
              
              <View style={S.scoreRow}>
                <View style={S.scoreBox}>
                  <Text style={S.scoreVal}>{result.score}</Text>
                  <View style={S.scoreDiv} />
                  <Text style={S.scoreTotal}>{result.totalItems}</Text>
                </View>
              </View>
            </View>
            <View style={S.summaryRight}>
               <View style={[S.medalCircle, { borderColor: result.percentage >= 90 ? C.yellow : result.percentage >= 75 ? C.teal : C.slate }]}>
                  <TrophyIcon size={40} color={result.percentage >= 90 ? C.yellow : C.slate} />
               </View>
            </View>
          </View>
        </BounceIn>

        <View style={S.sectionHeader}>
          <ClipboardListIcon size={20} color={C.ink} />
          <Text style={S.sectionTitle}>Review ng mga Sagot</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        {!result.responses || result.responses.length === 0 ? (
          <View style={S.emptyBox}>
            <Text style={S.emptyText}>Walang detalyadong records para sa assessment na ito.</Text>
          </View>
        ) : (
          <View style={S.itemsGrid}>
            {result.responses.map((resp, i) => renderResponseItem(resp, i))}
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, zIndex: 10
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  headerLogo: {
    width: 100,
    height: 90,
  },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 90 },
  fixedHeaderContainer: { paddingHorizontal: 20, paddingTop: 1 },
  
  summaryCard: {
    backgroundColor: C.white, borderRadius: Radii.lg, padding: 18,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20, ...Shadows.cardLift
  },
  summaryLeft: { flex: 1 },
  summarySubtitle: { fontSize: 11, color: C.slate, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  summaryTitle: { fontSize: 22, fontWeight: '900', color: C.ink, marginBottom: 12 },

  
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreVal: { fontSize: 24, fontWeight: '900', color: C.teal },
  scoreDiv: { width: 1, height: 16, backgroundColor: C.slate + '30', marginHorizontal: 8 },
  scoreTotal: { fontSize: 18, fontWeight: '700', color: C.slate },
  
  percBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  percTxt: { fontSize: 15, fontWeight: '900' },
  
  summaryRight: { marginLeft: 12 },
  medalCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 3.5, justifyContent: 'center', alignItems: 'center', backgroundColor: C.white },


  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginLeft: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: C.ink, marginLeft: 10 },

  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start'
  },
  gridItemWrapper: {
    width: '31.5%',
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: C.white,
    borderRadius: Radii.md,
    padding: 12,
    alignItems: 'center',
    ...Shadows.subtle,
    height: 80,
    justifyContent: 'center'
  },


  statusIconMini: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 8
  },

  itemContentMini: {
    fontSize: 15,
    fontWeight: '900',
    color: C.ink,
    textAlign: 'center',
    marginBottom: 2
  },
  itemLabelMini: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8
  },




  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14, color: C.slate, textAlign: 'center', opacity: 0.8 },
});

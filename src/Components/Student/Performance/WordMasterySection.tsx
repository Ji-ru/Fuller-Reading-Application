import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StudentColors as C, Radii, Shadows } from '../../../Utilities/Theme';
import { use_StudentWordMastery, AralinWordInfo } from '../../../Hooks/use_StudentWordMastery';
import readingMaterialData from '../../../../assets/ReadingMaterial/ReadingMaterial.json';
import { CheckCircleIcon, XCircleIcon, BookOpenIcon, StarIcon, TrophyIcon, ChevronRightIcon } from '../../GlobalUse/Icons';

interface WordMasterySectionProps {
  studentId: string;
  timeFilter: 'week' | 'month' | 'year';
  expanded: boolean;
}

export default function WordMasterySection({ studentId, timeFilter, expanded }: WordMasterySectionProps) {
  const { loading, stats, cumulativeStats, cumulativeLetters, getAralinWords } = use_StudentWordMastery(studentId, timeFilter);
  const [selectedLetter, setSelectedLetter] = useState<string>('M');

  const aralinWords = getAralinWords(selectedLetter);

  if (loading) {
    return (
      <View style={S.loadingContainer}>
        <Text style={S.loadingText}>Loading mastery data...</Text>
      </View>
    );
  }

  const progressPercent = Math.round((cumulativeStats.mastered / cumulativeStats.total) * 100) || 0;

  return (
    <View style={S.container}>
      {/* Layer 1: Overall Status */}
      <View style={S.statusRow}>
        <View style={[S.statusCard, { backgroundColor: C.green + '15' }]}>
          <Text style={[S.statusValue, { color: C.greenDeep }]}>{cumulativeStats.mastered}</Text>
          <Text style={S.statusLabel}>Natutuhan</Text>
        </View>
        <View style={[S.statusCard, { backgroundColor: C.orange + '15' }]}>
          <Text style={[S.statusValue, { color: C.orange }]}>{cumulativeStats.inProgress}</Text>
          <Text style={S.statusLabel}>Sinusubukan</Text>
        </View>
        <View style={[S.statusCard, { backgroundColor: C.mint + '30' }]}>
          <Text style={[S.statusValue, { color: C.slate }]}>{cumulativeStats.new}</Text>
          <Text style={S.statusLabel}>Bagong</Text>
        </View>
      </View>

      {/* Layer 2: Progress Bar */}
      <View style={S.progressSection}>
        <View style={S.progressHeader}>
          <Text style={S.progressTitle}>Kabuuan ng Pag-unlad</Text>
          <Text style={S.progressValue}>{progressPercent}%</Text>
        </View>
        <View style={S.progressBarBg}>
          <View style={[S.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={S.progressSub}>
          Nakamit mo na ang {cumulativeStats.mastered} sa {cumulativeStats.total} na salita!
        </Text>
      </View>

      {expanded && (
        <>
          {/* Layer 3: Letter Selector */}
          <View style={S.letterSelectorContainer}>
            <View style={S.letterHeader}>
              <Text style={S.sectionSubtitle}>Piliin ang Titik para sa Detalye</Text>
              <View style={S.selectedLetterIndicator}>
                <Text style={S.selectedLetterIndicatorText}>Aralin: {selectedLetter}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={S.letterList}
            >
              {readingMaterialData.Alphabet.map((item, idx) => {
                const isSelected = selectedLetter === item.letter;
                const isMastered = cumulativeLetters.has(item.letter);
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedLetter(item.letter)}
                    style={[
                      S.letterPill,
                      isSelected && S.letterPillSelected,
                      !isSelected && isMastered && S.letterPillMastered
                    ]}
                  >
                    <Text style={[
                      S.letterText,
                      isSelected && S.letterTextSelected,
                      !isSelected && isMastered && { color: C.greenDeep }
                    ]}>
                      {item.letter}
                    </Text>
                    {isMastered && !isSelected && (
                      <View style={S.masteredDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Layer 4: Word Grid */}
          <View style={S.wordGrid}>
            {aralinWords.length > 0 ? aralinWords.map((item, idx) => (
              <View key={idx} style={S.wordCard}>
                <View style={S.wordInfo}>
                  <Text style={S.wordText}>{item.word}</Text>
                </View>
                <View style={S.wordStatusContainer}>
                  {item.status === 'mastered' ? (
                    <View style={[S.statusIcon, { backgroundColor: C.green + '20' }]}>
                      <CheckCircleIcon size={14} color={C.green} />
                    </View>
                  ) : item.status === 'tried' ? (
                    <View style={[S.statusIcon, { backgroundColor: C.orange + '20' }]}>
                      <XCircleIcon size={14} color={C.orange} />
                    </View>
                  ) : (
                    <View style={S.unseenDot} />
                  )}
                </View>
              </View>
            )) : (
              <View style={S.emptyWords}>
                <Text style={S.emptyWordsText}>Walang salita sa araling ito.</Text>
              </View>
            )}
          </View>

          <View style={S.legend}>
            <View style={S.legendItem}>
              <View style={[S.statusIcon, { backgroundColor: C.green + '20', marginRight: 4 }]}>
                <CheckCircleIcon size={10} color={C.green} />
              </View>
              <Text style={S.legendText}>Mastered</Text>
            </View>
            <View style={S.legendItem}>
              <View style={[S.statusIcon, { backgroundColor: C.orange + '20', marginRight: 4 }]}>
                <XCircleIcon size={10} color={C.orange} />
              </View>
              <Text style={S.legendText}>Sanayin pa</Text>
            </View>
            <View style={S.legendItem}>
              <View style={[S.unseenDot, { marginHorizontal: 4 }]} />
              <Text style={S.legendText}>Bagong</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: C.slate,
    fontSize: 14,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusCard: {
    width: '31%',
    paddingVertical: 16,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.slate,
    textTransform: 'uppercase',
  },
  progressSection: {
    backgroundColor: C.white,
    padding: 20,
    borderRadius: Radii.lg,
    marginBottom: 24,
    ...Shadows.card,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '900',
    color: C.green,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: C.bg,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.green,
    borderRadius: 6,
  },
  progressSub: {
    fontSize: 13,
    color: C.slate,
    fontWeight: '600',
    textAlign: 'center',
  },
  letterSelectorContainer: {
    marginBottom: 20,
    backgroundColor: C.bg + '30',
    padding: 12,
    borderRadius: Radii.md,
  },
  letterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.slate,
  },
  selectedLetterIndicator: {
    backgroundColor: C.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  selectedLetterIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.white,
  },
  letterList: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  letterPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    ...Shadows.subtle,
  },
  letterPillSelected: {
    backgroundColor: C.green,
    transform: [{ scale: 1.1 }],
  },
  letterPillMastered: {
    backgroundColor: C.greenLight + '40',
    borderWidth: 1,
    borderColor: C.greenLight,
  },
  letterText: {
    fontSize: 15,
    fontWeight: '900',
    color: C.slate,
  },
  letterTextSelected: {
    color: C.white,
  },
  masteredDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.green,
    position: 'absolute',
    bottom: 4,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  wordCard: {
    width: '48%',
    backgroundColor: C.white,
    padding: 12,
    borderRadius: Radii.md,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.bg,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  wordStatusContainer: {
    marginLeft: 8,
  },
  statusIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unseenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.mint,
  },
  emptyWords: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  emptyWordsText: {
    fontSize: 13,
    color: C.slate,
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    backgroundColor: C.bg + '20',
    padding: 8,
    borderRadius: Radii.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 4,
  },
  legendText: {
    fontSize: 10,
    color: C.slate,
    fontWeight: '700',
  },
});

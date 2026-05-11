import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Miscue } from '../../../Interfaces/miscue';
import { MiscueAnalysisService } from '../../../Controller/MiscueAnalysisServiceController';
import Svg, { Text as SvgText } from 'react-native-svg';
import { sw, sh, sf } from '../../../Utils/responsive';

interface ReadingFeedbackProps {
  targetText: string;
  spokenText: string;
  miscues: Miscue[];
  onTryAgain: () => void;
  type: 'alphabet' | 'passage' | 'word';
  accuracy?: string;
  feedback?: string;
  isTextCorrect: boolean;
  onNextItem?: () => void;
  hasNextItem?: boolean;
}

const C = {
  white: '#FFFFFF',
  primary: '#008443',
  primaryLight: '#c0e8f2',
  accent: '#2ca96a',
  card: '#FFFFFF',
  ink: '#1F2937',
  inkLight: '#6B7280',
  border: '#E5E7EB',
  inputBg: '#F3F8FF',
  success: '#2CA96A',
  successBg: '#F1FBF4',
  warning: '#F08C3A',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FDE2E2',
  info: '#57b8b3',
  infoBg: '#E0F2F1',
};

const S = StyleSheet.create({
  container: {
    padding: sw(10),
  },
  card: {
    backgroundColor: C.card,
    borderRadius: sw(20),
    padding: sw(20),
    marginBottom: sh(16),
    elevation: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: sh(4) },
    shadowOpacity: 0.12,
    shadowRadius: sw(10),
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: sh(16),
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: sh(20),
  },
  scoreCircle: {
    width: sw(120),
    height: sw(120),
    borderRadius: sw(60),
    backgroundColor: C.inputBg,
    borderWidth: 6,
    borderColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(12),
  },
  scoreCircleSuccess: {
    borderColor: C.success,
    backgroundColor: C.successBg,
  },
  scoreCircleWarning: {
    borderColor: C.warning,
    backgroundColor: C.warningBg,
  },
  scoreValue: {
    fontSize: sf(32),
    fontFamily: 'Nunito-Black',
    color: C.primary,
  },
  scoreLabel: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: C.inkLight,
    marginTop: -sh(4),
  },
  feedbackText: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    textAlign: 'center',
    lineHeight: sf(22),
    paddingHorizontal: sw(10),
  },

  // Miscue List
  sectionTitle: {
    fontSize: sf(16),
    fontFamily: 'Nunito-ExtraBold',
    color: C.primary,
    marginBottom: sh(12),
  },
  miscueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sh(8),
    borderRadius: sw(12),
    padding: sw(10),
    borderWidth: 1,
  },
  miscueRowSubstitution: { backgroundColor: '#FFEBEB', borderColor: '#FFBABA' },
  miscueRowOmission: { backgroundColor: '#FFF3E0', borderColor: '#FFD9AA' },
  miscueRowInsertion: { backgroundColor: '#E0F2F1', borderColor: '#B2DFDB' },
  miscueRowRepetition: { backgroundColor: '#F8EBFF', borderColor: '#EAC2FF' },
  miscueTag: {
    borderRadius: sw(8),
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    marginRight: sw(10),
    minWidth: sw(90),
    alignItems: 'center',
  },
  miscueTagSubstitution: { backgroundColor: '#FF2726' },
  miscueTagOmission: { backgroundColor: '#FF941A' },
  miscueTagInsertion: { backgroundColor: '#26A69A' },
  miscueTagRepetition: { backgroundColor: '#BF00DD' },
  miscueTagText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  miscueValue: {
    flex: 1,
    fontSize: sf(20),
    fontFamily: 'Nunito-Medium',
    color: C.ink,
    lineHeight: sf(18),
  },

  // Alphabet / Word specifics
  largeText: {
    fontSize: sf(60),
    fontFamily: 'Andika-Black',
    color: C.primary,
    marginBottom: sh(8),
  },
  statusBadge: {
    paddingHorizontal: sw(16),
    paddingVertical: sh(6),
    borderRadius: sw(20),
    marginBottom: sh(10),
  },
  statusText: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Black',
    color: C.white,
  },

  // Buttons
  buttonContainer: {
    gap: sh(12),
  },
  btnPrimary: {
    backgroundColor: "#ffd45a",
    borderRadius: sw(16),
    paddingVertical: sh(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#ffd45a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  btnError: {
    backgroundColor: '#E53935',
    borderRadius: sw(16),
    paddingVertical: sh(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  btnSecondary: {
    backgroundColor: C.warning,
    borderRadius: sw(16),
    paddingVertical: sh(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: C.warning,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  btnSuccess: {
    backgroundColor: C.success,
    borderRadius: sw(16),
    paddingVertical: sh(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  btnIcon: {
    width: sw(24),
    height: sw(24),
    marginRight: sw(10),
    tintColor: C.white,
  },
  btnText: {
    fontSize: sf(20),
    fontFamily: 'Nunito-Bold',
    color: C.white,
  },
});

export const FeedbackResult: React.FC<ReadingFeedbackProps> = ({
  targetText,
  spokenText,
  miscues,
  onTryAgain,
  type,
  accuracy: passedAccuracy,
  feedback: passedFeedback,
  isTextCorrect,
  onNextItem,
  hasNextItem,
}) => {

  const hasNoTranscription = !spokenText || spokenText.trim() === '';

  const renderButtons = () => (
    <View style={S.buttonContainer}>
      <TouchableOpacity
        style={hasNoTranscription ? S.btnError : S.btnPrimary}
        onPress={onTryAgain}
        activeOpacity={0.8}
      >
        <Image
          style={S.btnIcon}
          source={require('../../../../assets/icons/Retry-icon.png')}
        />
        <Text style={S.btnText}>Try Again</Text>
      </TouchableOpacity>

      {hasNextItem && onNextItem ? (
        <TouchableOpacity
          style={S.btnSuccess}
          onPress={onNextItem}
          activeOpacity={0.8}
        >
          <Text style={S.btnText}> {/* type === 'alphabet' ? 'Next Letter' : */ type === 'word' ? 'Next Word' : 'Next Passage'} </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={S.btnSecondary}
          onPress={onNextItem}
          activeOpacity={0.8}
        >
          <Text style={S.btnText}>Return to Menu</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ─── ALPHABET & WORD ───────────────────────────────────────────────────────
  if (/* type === 'alphabet' || */ type === 'word') {
    const accuracy = passedAccuracy || (
      // type === 'alphabet'
      //   ? MiscueAnalysisService.checkAlphabetPhonemeAccuracy(targetText, spokenText).accuracy
      //   :
      (isTextCorrect ? '100' : '0')
    );
    const isCorrect = accuracy === '100';

    return (
      <View style={S.container}>
        <View style={S.card}>
          <View style={S.titleWrapper}>
            <Svg height={50} width={250}>
              <SvgText
                x={125} y={35} fontSize={30}
                fontFamily="Nunito-Black" textAnchor="middle"
                fill="none" stroke={C.primaryLight}
                strokeWidth={6} strokeLinejoin='round'
              >
                {isCorrect ? 'GOOD JOB!' : 'TRY AGAIN'}
              </SvgText>
              <SvgText
                x={125} y={35} fontSize={30}
                fontFamily="Nunito-Black" textAnchor="middle"
                fill={isCorrect ? C.primary : C.warning}
              >
                {isCorrect ? 'GOOD JOB!' : 'TRY AGAIN'}
              </SvgText>
            </Svg>
          </View>

          <View style={S.scoreSection}>
            <Text style={S.largeText}>
              {/* type === 'alphabet' ? targetText.toUpperCase() : */ targetText}
            </Text>
            <View style={[S.statusBadge, { backgroundColor: isCorrect ? C.success : C.warning }]}>
              <Text style={S.statusText}>
                {isCorrect ? 'CORRECT' : 'INCORRECT'}
              </Text>
            </View>
            <Text style={S.feedbackText}>
              {isCorrect
                ? 'Wow! You did it!'
                : 'Oops! Let\'s try one more time!'}
            </Text>
          </View>
        </View>

        {renderButtons()}
      </View>
    );
  }

  // ─── PASSAGE ───────────────────────────────────────────────────────────────
  const accuracyNum = parseFloat(MiscueAnalysisService.calculateAccuracy(targetText, spokenText));
  const feedback = passedFeedback || MiscueAnalysisService.getAccuracyFeedback(accuracyNum.toString());

  const categorizedMiscues = {
    substitution: miscues.filter(m => m.type === 'substitution'),
    omission: miscues.filter(m => m.type === 'omission'),
    insertion: miscues.filter(m => m.type === 'insertion'),
    repetition: miscues.filter(m => m.type === 'repetition'),
  };

  const getScoreColorStyle = () => {
    if (accuracyNum >= 90) return S.scoreCircleSuccess;
    if (accuracyNum >= 75) return S.scoreCircle;
    return S.scoreCircleWarning;
  };

  return (
    <View style={S.container}>
      <View style={S.card}>
        <View style={S.titleWrapper}>
          <Svg height={25} width={300}>
            <SvgText
              x={150} y={20} fontSize={24}
              fontFamily="Nunito-Black" textAnchor="middle"
              fill="none" stroke={C.primaryLight}
              strokeWidth={6} strokeLinejoin='round'
            >
              READING SUMMARY
            </SvgText>
            <SvgText
              x={150} y={20} fontSize={24}
              fontFamily="Nunito-Black" textAnchor="middle"
              fill={C.primary}
            >
              READING SUMMARY
            </SvgText>
          </Svg>
        </View>
        <View>
          {/* SUBSTITUTION */}
          {categorizedMiscues.substitution.length > 0 && (
            <View style={[S.miscueRow, S.miscueRowSubstitution]}>
              <View style={[S.miscueTag, S.miscueTagSubstitution]}>
                <Text style={S.miscueTagText}>Substitution</Text>
              </View>
              <Text style={S.miscueValue}>
                {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.substitution)}
              </Text>
            </View>
          )}

          {/* OMISSION */}
          {categorizedMiscues.omission.length > 0 && (
            <View style={[S.miscueRow, S.miscueRowOmission]}>
              <View style={[S.miscueTag, S.miscueTagOmission]}>
                <Text style={S.miscueTagText}>Omission</Text>
              </View>
              <Text style={S.miscueValue}>
                {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.omission)}
              </Text>
            </View>
          )}

          {/* INSERTION */}
          {categorizedMiscues.insertion.length > 0 && (
            <View style={[S.miscueRow, S.miscueRowInsertion]}>
              <View style={[S.miscueTag, S.miscueTagInsertion]}>
                <Text style={S.miscueTagText}>Insertion</Text>
              </View>
              <Text style={S.miscueValue}>
                {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.insertion)}
              </Text>
            </View>
          )}

          {/* REPETITION */}
          {categorizedMiscues.repetition.length > 0 && (
            <View style={[S.miscueRow, S.miscueRowRepetition]}>
              <View style={[S.miscueTag, S.miscueTagRepetition]}>
                <Text style={S.miscueTagText}>Repetition</Text>
              </View>
              <Text style={S.miscueValue}>
                {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.repetition)}
              </Text>
            </View>
          )}

          {hasNoTranscription ? (
            <View style={[S.miscueRow, { backgroundColor: '#FDE8E8', borderColor: '#E53935' }]}>
              <Text style={[S.miscueValue, { textAlign: 'center', color: '#E53935', fontFamily: 'Nunito-Bold' }]}>
                Network Problem. Please try again.
              </Text>
            </View>
          ) : miscues.length === 0 && (
            <View style={[S.miscueRow, { backgroundColor: C.successBg, borderColor: C.success }]}>
              <Text style={[S.miscueValue, { textAlign: 'center', color: C.success, fontFamily: 'Nunito-Bold' }]}>
                🌟 Perfect Reading! No miscues detected.
              </Text>
            </View>
          )}
        </View>
      </View>

      {renderButtons()}
    </View>
  );
};
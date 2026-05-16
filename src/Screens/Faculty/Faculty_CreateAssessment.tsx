
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { AssessmentController } from '../../Controller/AssessmentController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { FacultyColors as F, Radii, Shadows, ACCENT_COLORS } from '../../Utilities/Theme';
import { BackArrowIcon, CheckCircleIcon, BookOpenIcon, QuoteIcon, TypeIcon } from '../../Components/GlobalUse/Icons';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';
import bubbles from '../../UI_Designs/BubblesDesign';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import auth from '@react-native-firebase/auth';

const alphabetData = readingMaterialData?.Alphabet || [];
const passagesData = readingMaterialData?.Passages || [];
const wordsData = readingMaterialData?.Words || [];

export default function FacultyCreateAssessment() {
  const { handleBackStep } = useNavigationHelper();
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const assignedGrades = [1, 2, 3];
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number | null>(null);
  const [selectedAralin, setSelectedAralin] = useState(0);
  const [cardLimit, setCardLimit] = useState('10');
  const [selectedItems, setSelectedItems] = useState<{type: 'alphabet' | 'word' | 'passage', contentId: string}[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{title: string, message: string, type: 'danger' | 'info' | 'primary', onConfirm?: () => void}>({
    title: '', message: '', type: 'info'
  });

  const showAlert = (title: string, message: string, type: 'danger' | 'info' | 'primary' = 'info', onConfirm?: () => void) => {
    setAlertConfig({ title, message, type, onConfirm });
    setAlertVisible(true);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        const classList = await getFacultyClasses_Student.getFacultyClasses(user.uid);
        setClasses(classList);
        setSelectedGradeLevel(1);
        if (classList.length > 0) {
          const firstClassInGrade1 = classList.find(c => c.gradeLevel === 1);
          if (firstClassInGrade1) setSelectedClass(firstClassInGrade1.classCode);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getAralinMaterials = () => {
    const currentAralin = alphabetData[selectedAralin];
    if (!currentAralin) return { alphabet: [], words: [], passages: [] };

    const letter = currentAralin.letter;
    const aralinNum = selectedAralin + 1;

    // 1. Alphabet Sound
    const alphaItems = [{ type: 'alphabet', contentId: letter }];

    // 2. Words
    const wordItems = wordsData
      .filter(w => w.letter === letter)
      .flatMap(w => w.contrasts.flatMap(c => c.words))
      .filter((word, index, self) => 
        word.trim().toLowerCase() !== letter.toLowerCase() && self.indexOf(word) === index
      )
      .map(word => ({ type: 'word', contentId: word }));
    
    // 3. Passages
    const passageItems = passagesData
      .filter(p => p.aralin === aralinNum)
      .map(p => ({ type: 'passage', contentId: p.title }));

    return { alphabet: alphaItems, words: wordItems, passages: passageItems };
  };

  const materials = getAralinMaterials();

  const toggleItem = (type: any, id: string) => {
    const exists = selectedItems.find(i => i.type === type && i.contentId === id);
    if (exists) {
      setSelectedItems(prev => prev.filter(i => !(i.type === type && i.contentId === id)));
    } else {
      setSelectedItems(prev => [...prev, { type, contentId: id }]);
    }
  };

  const isSelected = (type: any, id: string) => {
    return selectedItems.some(i => i.type === type && i.contentId === id);
  };

  const selectedCount = selectedItems.length;

  const handleSave = async () => {
    if (!title.trim()) return showAlert('Maling Input', 'Mangyaring maglagay ng pamagat.', 'danger');
    if (!selectedClass) return showAlert('Maling Input', 'Mangyaring pumili ng klase.', 'danger');
    if (selectedItems.length === 0) return showAlert('Maling Input', 'Mangyaring pumili ng kahit isang materyal.', 'danger');
    
    const limitNum = parseInt(cardLimit);
    if (isNaN(limitNum) || limitNum <= 0) return showAlert('Maling Input', 'Hindi wasto ang card limit.', 'danger');

    try {
      await AssessmentController.createActivity({
        title,
        aralinIndex: selectedAralin,
        classCode: selectedClass,
        cardLimit: limitNum,
        items: selectedItems as any
      });
      showAlert('Tagumpay! 🎉', 'Matagumpay na nagawa ang assessment!', 'info', () => handleBackStep());
    } catch (e) {
      showAlert('Error', 'Hindi nagawa ang assessment.', 'danger');
    }
  };

  return (
    <SafeAreaView style={S.root}>
      <View style={S.header}>
        <TouchableOpacity 
          onPress={currentStep === 1 ? handleBackStep : () => setCurrentStep(prev => prev - 1)} 
          style={S.backBtn}
        >
          <View style={S.backArrow} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>
          {currentStep === 1 ? 'Bagong Pagsusulit' : 
           currentStep === 2 ? 'Pumili ng Aralin' : 
           'Pumili ng mga Kagamitan'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        {currentStep === 1 ? (
          <BounceIn delay={100}>
            <View style={S.section}>
              <Text style={S.sectionLabel}>Hakbang 1: General Info</Text>
              
              <View style={S.formGroup}>
                <Text style={S.subLabel}>Pamagat ng Pagsusulit</Text>
                <TextInput 
                  style={S.input}
                  placeholder="hal. Pagsusulit 1: Titik M"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor={F.slate + '80'}
                />
              </View>
              
              <View style={S.formGroup}>
                 <Text style={S.subLabel}>Antas ng Baitang</Text>
                 <View style={S.pickerContainer}>
                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                     {assignedGrades.map(grade => (
                       <TouchableOpacity 
                         key={grade}
                         style={[S.chip, selectedGradeLevel === grade && S.chipActive]}
                         onPress={() => {
                           setSelectedGradeLevel(grade);
                           const firstClassInGrade = classes.find(c => c.gradeLevel === grade);
                           if (firstClassInGrade) setSelectedClass(firstClassInGrade.classCode);
                           else setSelectedClass('');
                         }}
                       >
                         <Text style={[S.chipText, selectedGradeLevel === grade && S.chipTextActive]}>Baitang {grade}</Text>
                       </TouchableOpacity>
                     ))}
                   </ScrollView>
                 </View>
              </View>

              <View style={S.formGroup}>
                 <Text style={S.subLabel}>Target na Klase</Text>
                 <View style={S.pickerContainer}>
                   {loading ? <LoadingDots size={6} /> : (
                     <View>
                       {classes.filter(cl => cl.gradeLevel === selectedGradeLevel).length > 0 ? (
                         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                           {classes.filter(cl => cl.gradeLevel === selectedGradeLevel).map(cl => (
                              <TouchableOpacity 
                                key={cl.classId}
                                style={[S.chip, selectedClass === cl.classCode && S.chipActive]}
                                onPress={() => setSelectedClass(cl.classCode)}
                              >
                                <Text style={[S.chipText, selectedClass === cl.classCode && S.chipTextActive]}>{cl.className}</Text>
                              </TouchableOpacity>
                           ))}
                         </ScrollView>
                       ) : (
                         <Text style={S.emptyInfoText}>Walang nahanap na klase sa baitang na ito.</Text>
                       )}
                     </View>
                   )}
                 </View>
              </View>

              <View style={S.formGroup}>
                <Text style={S.subLabel}>Card Limit (Max items to display)</Text>
                <TextInput 
                  style={S.input}
                  keyboardType="numeric"
                  value={cardLimit}
                  onChangeText={setCardLimit}
                />
              </View>

              <TouchableOpacity 
                style={[S.nextBtn, { backgroundColor: F.primaryDeep }]}
                onPress={() => {
                  if (!title.trim()) return showAlert('Maling Input', 'Mangyaring maglagay ng pamagat.', 'danger');
                  if (!selectedClass) return showAlert('Maling Input', 'Mangyaring pumili ng klase.', 'danger');
                  setCurrentStep(2);
                }}
              >
                <Text style={S.nextBtnText}>Magpatuloy sa Aralin</Text>
                <Text style={{ color: F.white, fontSize: 18, fontWeight: 'bold' }}>→</Text>
              </TouchableOpacity>
            </View>
          </BounceIn>
        ) : currentStep === 2 ? (
          <BounceIn delay={100}>
            <View style={S.section}>
              <Text style={S.sectionLabel}>Hakbang 2: Piliin ang Aralin</Text>
              <View style={S.aralinGridContainer}>
                {alphabetData.map((a, i) => {
                  const bg = ACCENT_COLORS[i % ACCENT_COLORS.length];
                  return (
                    <TouchableOpacity 
                      key={a.letter}
                      style={[S.lessonTile, { backgroundColor: bg, borderWidth: selectedAralin === i ? 3 : 0, borderColor: F.ink }]}
                      onPress={() => {
                        setSelectedAralin(i);
                        setSelectedItems([]);
                        setCurrentStep(3);
                      }}
                    >
                      <View style={S.tileShine} />
                      <Text style={S.tileLetter}>{a.letter}</Text>
                      <View style={S.tileRibbon}>
                         <Text style={S.tileRibbonText}>L{i + 1}</Text>
                      </View>
                      {selectedAralin === i && (
                        <View style={S.selectionOverlay}>
                          <CheckCircleIcon size={14} color={F.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={S.footerActions}>
                <TouchableOpacity style={S.secondaryBtn} onPress={() => setCurrentStep(1)}>
                  <Text style={S.secondaryBtnText}>← Bumalik</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={S.primaryBtn} onPress={() => setCurrentStep(3)}>
                  <Text style={S.primaryBtnText}>Pumili ng Materials →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BounceIn>
        ) : (
          <BounceIn delay={100}>
            <View style={S.section}>
              <View style={S.stepHeader}>
                <Text style={S.sectionLabel}>Hakbang 3: Pumili ng mga Kagamitan</Text>
                <View style={[S.countBadge, { backgroundColor: F.primaryDeep }]}>
                  <Text style={S.countBadgeText}>{selectedCount} Napili</Text>
                </View>
              </View>

              {/* Alphabet Section */}
              <View style={S.materialSection}>
                <View style={S.materialHeader}>
                  <TypeIcon size={20} color={F.primary} />
                  <Text style={S.materialTitle}>Tunog ng Alpabeto</Text>
                </View>
                {materials.alphabet.map((item, idx) => (
                  <TouchableOpacity 
                    key={`alpha-${idx}`}
                    activeOpacity={0.8}
                    style={[S.itemCard, isSelected('alphabet', item.contentId) && S.itemCardActive]}
                    onPress={() => toggleItem('alphabet', item.contentId)}
                  >
                    <View style={[S.iconBox, { backgroundColor: isSelected('alphabet', item.contentId) ? 'rgba(255,255,255,0.2)' : F.primary + '15' }]}>
                      <Text style={[S.iconText, isSelected('alphabet', item.contentId) && { color: F.white }]}>{item.contentId}</Text>
                    </View>
                    <Text style={[S.itemText, isSelected('alphabet', item.contentId) && S.itemTextActive]}>Tunog ng "{item.contentId}"</Text>
                    {isSelected('alphabet', item.contentId) && <CheckCircleIcon size={20} color={F.white} />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Words Section */}
              <View style={S.materialSection}>
                <View style={S.materialHeader}>
                  <QuoteIcon size={20} color={F.primary} />
                  <Text style={S.materialTitle}>Mga Salita</Text>
                </View>
                <View style={S.wordGrid}>
                  {materials.words.map((item, idx) => (
                    <TouchableOpacity 
                      key={`word-${idx}`}
                      activeOpacity={0.8}
                      style={[S.wordChip, isSelected('word', item.contentId) && S.wordChipActive]}
                      onPress={() => toggleItem('word', item.contentId)}
                    >
                      <Text style={[S.wordChipText, isSelected('word', item.contentId) && S.wordChipTextActive]}>{item.contentId}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Passages Section */}
              <View style={S.materialSection}>
                <View style={S.materialHeader}>
                  <BookOpenIcon size={20} color={F.primary} />
                  <Text style={S.materialTitle}>Mga Talata (Passages)</Text>
                </View>
                {materials.passages.map((item, idx) => (
                  <TouchableOpacity 
                    key={`passage-${idx}`}
                    activeOpacity={0.8}
                    style={[S.itemCard, isSelected('passage', item.contentId) && S.itemCardActive]}
                    onPress={() => toggleItem('passage', item.contentId)}
                  >
                    <View style={[S.iconBox, { backgroundColor: isSelected('passage', item.contentId) ? 'rgba(255,255,255,0.2)' : F.primary + '15' }]}>
                      <BookOpenIcon size={16} color={isSelected('passage', item.contentId) ? F.white : F.primary} />
                    </View>
                    <Text style={[S.itemText, isSelected('passage', item.contentId) && S.itemTextActive]}>{item.contentId}</Text>
                    {isSelected('passage', item.contentId) && <CheckCircleIcon size={20} color={F.white} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={S.footerActions}>
              <TouchableOpacity style={S.secondaryBtn} onPress={() => setCurrentStep(2)}>
                <Text style={S.secondaryBtnText}>← Bumalik</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[S.primaryBtn, { backgroundColor: F.primary }]} onPress={handleSave}>
                <Text style={S.primaryBtnText}>I-save ang Pagsusulit</Text>
              </TouchableOpacity>
            </View>
          </BounceIn>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText="OK"
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => {
          setAlertVisible(false);
          if (alertConfig.onConfirm) alertConfig.onConfirm();
        }}
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: F.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: F.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  backArrow: { 
    width: 12, height: 12, borderLeftWidth: 3, borderTopWidth: 3, 
    borderColor: F.primaryDeep, transform: [{ rotate: '-45deg' }],
    marginLeft: 4
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: F.ink, flex: 1, textAlign: 'center' },
  saveBtn: { backgroundColor: F.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, ...Shadows.subtle },
  saveBtnText: { color: F.white, fontWeight: '800', fontSize: 13 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: F.slate, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  subLabel: { fontSize: 12, color: F.slate, marginBottom: 8, fontWeight: '700' },
  
  input: {
    backgroundColor: F.white, borderRadius: 12, padding: 14, fontSize: 15, 
    color: F.ink, ...Shadows.subtle, fontWeight: '600'
  },
  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-end' },

  pickerContainer: { flexDirection: 'row', marginBottom: 12 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: F.white,
    marginRight: 8, borderWidth: 1, borderColor: '#eee'
  },
  chipActive: { backgroundColor: F.primary, borderColor: F.primary },
  chipText: { fontSize: 14, color: F.slate, fontWeight: '700' },
  chipTextActive: { color: F.white },

  aralinRow: { marginBottom: 10 },
  aralinChip: {
    width: 60, height: 74, borderRadius: 16, backgroundColor: F.white,
    marginRight: 10, justifyContent: 'center', alignItems: 'center', ...Shadows.subtle,
    borderWidth: 2, borderColor: 'transparent'
  },
  aralinChipActive: { borderColor: F.primary, backgroundColor: F.primary + '05' },
  aralinChipText: { fontSize: 22, fontWeight: '900', color: F.ink },
  aralinChipTextActive: { color: F.primary },
  aralinChipSub: { fontSize: 10, fontWeight: '800', color: F.slate },
  aralinChipSubActive: { color: F.primary },

  groupLabel: { fontSize: 14, fontWeight: '800', color: F.ink, marginBottom: 12 },
  itemCard: {
    backgroundColor: F.white, borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', ...Shadows.subtle
  },
  itemCardActive: { backgroundColor: F.primary },
  itemText: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700', color: F.ink },
  itemTextActive: { color: F.white },

  wordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: F.white,
    borderWidth: 1, borderColor: '#eee', ...Shadows.subtle
  },
  wordChipActive: { backgroundColor: F.primary, borderColor: F.primary },
  wordChipText: { fontSize: 14, fontWeight: '700', color: F.slate },
  wordChipTextActive: { color: F.white },

  nextBtn: {
    backgroundColor: F.primaryDeep, borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 20, ...Shadows.card
  },
  nextBtnText: { color: F.white, fontSize: 16, fontWeight: '800' },

  prevStepBtn: { padding: 20, alignItems: 'center' },
  prevStepText: { color: F.slate, fontWeight: '700', textDecorationLine: 'underline' },
  emptyInfoText: { fontSize: 13, color: F.slate, fontStyle: 'italic', paddingVertical: 10 },

  aralinGridContainer: { 
    flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'space-between' 
  },
  lessonTile: {
    width: '23.5%', aspectRatio: 0.9, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.card, position: 'relative', overflow: 'hidden',
    marginBottom: 6
  },
  tileShine: {
    position: 'absolute', top: 4, right: 6, width: 8, height: 8,
    borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.28)'
  },
  tileLetter: {
    fontSize: 22, fontWeight: '900', color: F.white,
    textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  tileRibbon: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.12)', paddingVertical: 2, alignItems: 'center'
  },
  tileRibbonText: {
    fontSize: 7, fontWeight: '800', color: F.white, letterSpacing: 0.3
  },
  selectionOverlay: {
    position: 'absolute', top: 2, left: 2,
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 1
  },

  selectedAralinInfo: {
    backgroundColor: F.primary + '10', padding: 16, borderRadius: 12, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: F.primary
  },
  selectedAralinText: { fontSize: 16, fontWeight: '800', color: F.primary },

  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  countBadge: { backgroundColor: F.primaryDeep, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  countBadgeText: { color: F.white, fontSize: 11, fontWeight: '800' },

  selectedAralinHero: {
    backgroundColor: F.primary, borderRadius: 16, padding: 20, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...Shadows.cardLift, overflow: 'hidden', position: 'relative'
  },
  heroCircle: { position: 'absolute', borderRadius: 999 },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase' },
  heroValue: { fontSize: 18, fontWeight: '900', color: F.white, marginTop: 2 },

  materialSection: { marginBottom: 24 },
  materialHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f1f1', paddingBottom: 8 },
  materialTitle: { fontSize: 15, fontWeight: '800', color: F.ink },

  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 18, fontWeight: '900', color: F.primary },

  footerActions: { flexDirection: 'row', gap: 12, marginTop: 2, paddingBottom: 20 },
  primaryBtn: { flex: 2, backgroundColor: F.primary, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', ...Shadows.card },
  primaryBtnText: { color: F.white, fontSize: 14, fontWeight: '800' },
  secondaryBtn: { flex: 1, backgroundColor: F.white, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', ...Shadows.subtle, borderWidth: 1, borderColor: '#eee' },
  secondaryBtnText: { color: F.slate, fontSize: 14, fontWeight: '700' },
});

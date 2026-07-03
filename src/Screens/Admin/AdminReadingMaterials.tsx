import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminSideMenu from '../../Components/Admin/AdminSideMenu';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { BurgerIcon, PlusIcon, EditIcon, TrashIcon, XIcon, BookOpenIcon, QuoteIcon } from '../../Components/GlobalUse/Icons';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { Alphabet } from '../../Interfaces/passage';
import { CustomReadingMaterial } from '../../Interfaces/dataInterfaces';
import {
  getCustomReadingMaterials,
  deleteCustomReadingMaterial,
  UnauthorizedError,
  ValidationError,
  saveWord,
  savePassage,
} from '../../Controller/ReadingMaterialController';

const alphabetData: Alphabet[] = readingMaterialData?.Alphabet || [];

type MaterialType = 'word' | 'passage';
type ScopeType = 'student' | 'class' | 'all';

export default function AdminReadingMaterials() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<CustomReadingMaterial[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formVisible, setFormVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CustomReadingMaterial | null>(null);

  const [materialType, setMaterialType] = useState<MaterialType>('word');
  const [scopeType, setScopeType] = useState<ScopeType>('all');
  const [selectedAralin, setSelectedAralin] = useState<number>(0);
  const [studentIdsInput, setStudentIdsInput] = useState('');
  const [classCodesInput, setClassCodesInput] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null);

  const { handleLogout, handleBackStep } = useNavigationHelper();

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomReadingMaterials();
      setMaterials(data);
    } catch (e: any) {
      if (e instanceof UnauthorizedError) {
        setError('Unauthorized access. Admin privileges required.');
      } else {
        setError(e.message || 'Failed to fetch materials');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };
  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const handleAddNew = () => {
    setEditingMaterial(null);
    setMaterialType('word');
    setScopeType('all');
    setSelectedAralin(0);
    setStudentIdsInput('');
    setClassCodesInput('');
    setWordInput('');
    setTitleInput('');
    setTextInput('');
    setAuthorInput('');
    setFormVisible(true);
  };

  const handleEdit = (material: CustomReadingMaterial) => {
    setEditingMaterial(material);
    setMaterialType(material.type);
    setScopeType(material.scopeType);
    setSelectedAralin(material.aralinIndex);
    setStudentIdsInput((material.studentIds || []).join(', '));
    setClassCodesInput((material.classCodes || []).join(', '));
    setWordInput(material.word || '');
    setTitleInput(material.title || '');
    setTextInput(material.text || '');
    setAuthorInput(material.author || '');
    setFormVisible(true);
  };

  const handleDelete = (materialId: string) => {
    setDeleteMaterialId(materialId);
  };

  const confirmDelete = async () => {
    if (!deleteMaterialId) return;
    try {
      await deleteCustomReadingMaterial(deleteMaterialId);
      setDeleteMaterialId(null);
      fetchMaterials();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const canAddPassage = selectedAralin >= 3;
  const canAddWord = selectedAralin >= 2;

  const handleSave = async () => {
    setSaving(true);
    try {
      const studentIds = studentIdsInput.trim()
        ? studentIdsInput.split(',').map(s => s.trim()).filter(s => s)
        : undefined;
      const classCodes = classCodesInput.trim()
        ? classCodesInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
        : undefined;

      if (materialType === 'word') {
        if (!canAddWord) {
          throw new ValidationError('Words cannot be added to Aralin 1 and Aralin 2');
        }
        await saveWord({
          materialId: editingMaterial?.materialId,
          aralinIndex: selectedAralin,
          letter: alphabetData[selectedAralin]?.letter || '',
          word: wordInput,
          scopeType,
          studentIds,
          classCodes,
        });
      } else {
        if (!canAddPassage) {
          throw new ValidationError('Passages can only be added to Aralin 4 and later');
        }
        await savePassage({
          materialId: editingMaterial?.materialId,
          aralinIndex: selectedAralin,
          letter: alphabetData[selectedAralin]?.letter || '',
          title: titleInput,
          text: textInput,
          author: authorInput,
          scopeType,
          studentIds,
          classCodes,
        });
      }

      setFormVisible(false);
      fetchMaterials();
    } catch (e: any) {
      if (e instanceof ValidationError) {
        Alert.alert('Validation Error', e.message);
      } else {
        Alert.alert('Error', e.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const groupedMaterials = useMemo(() => {
    const groups: Record<string, { words: CustomReadingMaterial[]; passages: CustomReadingMaterial[] }> = {};

    materials.forEach(m => {
      const key = `Aralin ${m.aralinIndex + 1}`;
      if (!groups[key]) {
        groups[key] = { words: [], passages: [] };
      }
      if (m.type === 'word') {
        groups[key].words.push(m);
      } else {
        groups[key].passages.push(m);
      }
    });

    return groups;
  }, [materials]);

  const renderMaterialItem = ({ item }: { item: CustomReadingMaterial }) => {
    const material = item;
    return (
      <View style={S.materialCard}>
        <View style={S.materialInfo}>
          {item.type === 'word' ? (
            <QuoteIcon size={16} color={F.primary} />
          ) : (
            <BookOpenIcon size={16} color={F.primary} />
          )}
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={S.materialTitle}>
              {item.type === 'word' ? item.word : item.title}
            </Text>
            <Text style={S.materialSubtitle}>
              Aralin {item.aralinIndex + 1} • {item.scopeType === 'all' ? 'Lahat' : item.scopeType === 'student' ? `${item.studentIds?.length || 0} mag-aaral` : `${item.classCodes?.length || 0} klase`}
            </Text>
          </View>
        </View>
        <View style={S.materialActions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={S.actionBtn}>
            <EditIcon size={18} color={F.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.materialId)} style={S.actionBtn}>
            <TrashIcon size={18} color={F.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={S.safeArea}>
      <BubbleBackground />

      <AdminSideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogoutPress}
        currentRoute="AdminReadingMaterials"
      />

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={confirmLogout}
      />

      <ConfirmationModal
        visible={!!deleteMaterialId}
        type="danger"
        title="Burahin ang Material?"
        message="Sigurado ka ba na gusto mong burahin ito? Hindi na ito mababalik."
        confirmText="Burahin"
        onCancel={() => setDeleteMaterialId(null)}
        onConfirm={confirmDelete}
      />

      <View style={S.container}>
        <View style={S.headerRow}>
          <TouchableOpacity style={S.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
            <BurgerIcon size={22} color={F.ink} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Pamamahala ng Pagbasa</Text>
          <TouchableOpacity style={S.addBtn} onPress={handleAddNew} activeOpacity={0.7}>
            <PlusIcon size={20} color={F.white} />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={S.errorBox}>
            <Text style={S.errorText}>{error}</Text>
          </View>
        ) : loading ? (
          <View style={S.loaderBox}>
            <ActivityIndicator size="large" color={F.primary} />
          </View>
        ) : Object.keys(groupedMaterials).length === 0 ? (
          <View style={S.emptyBox}>
            <Text style={S.emptyIcon}>📚</Text>
            <Text style={S.emptyTitle}>Walang Custom na Material</Text>
            <Text style={S.emptyText}>
              Pindotin ang "+" button para magdagdag ng salita o talata.
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(groupedMaterials).map(([aralin, items]) => (
              <View key={aralin} style={S.aralinGroup}>
                <Text style={S.aralinHeader}>{aralin}</Text>

                {items.words.length > 0 && (
                  <View style={S.typeGroup}>
                    <Text style={S.typeLabel}>Mga Salita</Text>
<FlatList
                      data={items.words}
                      keyExtractor={item => item.materialId}
                      renderItem={renderMaterialItem}
                      scrollEnabled={false}
                    />
                  </View>
                )}

                {items.passages.length > 0 && (
                  <View style={S.typeGroup}>
                    <Text style={S.typeLabel}>Mga Talata</Text>
                    <FlatList
                      data={items.passages}
                      keyExtractor={item => item.materialId}
                      renderItem={renderMaterialItem}
                      scrollEnabled={false}
                    />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
          <View style={S.modalOverlay}>
            <View style={S.modalSheet}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>
                  {editingMaterial ? 'Ayusin' : 'Magdagdag'} ng Material
                </Text>
                <TouchableOpacity onPress={() => setFormVisible(false)} style={S.closeBtn}>
                  <XIcon size={22} color={F.slate} />
                </TouchableOpacity>
              </View>

              <ScrollView style={S.modalContent} showsVerticalScrollIndicator={false}>
                <View style={S.fieldRow}>
                  <Text style={S.fieldLabel}>Uri ng Material</Text>
                  <View style={S.typeSelector}>
                    {(['word', 'passage'] as MaterialType[]).map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          S.typeOption,
                          materialType === type && S.typeOptionActive,
                        ]}
                        onPress={() => setMaterialType(type)}
                      >
                        <Text style={[
                          S.typeOptionText,
                          materialType === type && S.typeOptionTextActive,
                        ]}>
                          {type === 'word' ? 'Salita' : 'Talata'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={S.fieldRow}>
                  <Text style={S.fieldLabel}>Target Scope</Text>
                  <View style={S.scopeSelector}>
                    {(['student', 'class', 'all'] as ScopeType[]).map(scope => (
                      <TouchableOpacity
                        key={scope}
                        style={[
                          S.scopeOption,
                          scopeType === scope && S.scopeOptionActive,
                        ]}
                        onPress={() => setScopeType(scope)}
                      >
                        <Text style={[
                          S.scopeOptionText,
                          scopeType === scope && S.scopeOptionTextActive,
                        ]}>
                          {scope === 'student' ? 'Mag-aaral' : scope === 'class' ? 'Klase' : 'Lahat'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {scopeType === 'student' && (
                  <View style={S.fieldRow}>
                    <Text style={S.fieldLabel}>Student IDs (pahiwatig na comma)</Text>
                    <TextInput
                      style={S.modalInput}
                      placeholder="Hal: student1, student2, student3"
                      value={studentIdsInput}
                      onChangeText={setStudentIdsInput}
                      placeholderTextColor={F.slate}
                    />
                  </View>
                )}

                {scopeType === 'class' && (
                  <View style={S.fieldRow}>
                    <Text style={S.fieldLabel}>Class Codes (pahiwatig na comma)</Text>
                    <TextInput
                      style={S.modalInput}
                      placeholder="Hal: GR1-A, GR2-B"
                      value={classCodesInput}
                      onChangeText={setClassCodesInput}
                      placeholderTextColor={F.slate}
                      autoCapitalize="characters"
                    />
                  </View>
                )}

                <View style={S.fieldRow}>
                  <Text style={S.fieldLabel}>Aralin</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {alphabetData.map((item, index) => (
                      <TouchableOpacity
                        key={item.letter}
                        style={[
                          S.aralinOption,
                          selectedAralin === index && S.aralinOptionActive,
                          index < 2 && { opacity: 0.5 },
                          materialType === 'passage' && index < 3 && { opacity: 0.5 },
                        ]}
                        onPress={() => {
                          if (index >= 2 && materialType === 'word' || index >= 3 && materialType === 'passage') {
                            setSelectedAralin(index);
                          }
                        }}
                      >
                        <Text style={[
                          S.aralinOptionText,
                          selectedAralin === index && S.aralinOptionTextActive,
                        ]}>
                          {index + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={S.fieldRow}>
                  <Text style={S.fieldLabel}>Letter</Text>
                  <View style={S.letterDisplay}>
                    <Text style={S.letterDisplayText}>
                      {alphabetData[selectedAralin]?.letter || '-'}
                    </Text>
                  </View>
                </View>

                {materialType === 'word' && canAddWord && (
                  <View style={S.fieldRow}>
                    <Text style={S.fieldLabel}>Salita</Text>
                    <TextInput
                      style={S.modalInput}
                      placeholder="Ilagay ang salita"
                      value={wordInput}
                      onChangeText={setWordInput}
                      placeholderTextColor={F.slate}
                    />
                  </View>
                )}

                {materialType === 'passage' && canAddPassage && (
                  <>
                    <View style={S.fieldRow}>
                      <Text style={S.fieldLabel}>Titulo</Text>
                      <TextInput
                        style={S.modalInput}
                        placeholder="Ilagay ang titulo"
                        value={titleInput}
                        onChangeText={setTitleInput}
                        placeholderTextColor={F.slate}
                      />
                    </View>

                    <View style={S.fieldRow}>
                      <Text style={S.fieldLabel}>Teksto</Text>
                      <TextInput
                        style={[S.modalInput, S.textArea]}
                        placeholder="Ilagay ang teksto ng talata"
                        value={textInput}
                        onChangeText={setTextInput}
                        placeholderTextColor={F.slate}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={S.fieldRow}>
                      <Text style={S.fieldLabel}>Author (Optional)</Text>
                      <TextInput
                        style={S.modalInput}
                        placeholder="Ilagay ang pangalan ng author"
                        value={authorInput}
                        onChangeText={setAuthorInput}
                        placeholderTextColor={F.slate}
                      />
                    </View>
                  </>
                )}

                {(materialType === 'word' && !canAddWord) || (materialType === 'passage' && !canAddPassage) ? (
                  <View style={S.warningBox}>
                    <Text style={S.warningText}>
                      {materialType === 'word'
                        ? 'Hindi posible ang salita sa Aralin 1 at Aralin 2.'
                        : 'Hindi posible ang talata sa Aralin 1, 2, at 3.'}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={S.modalFooter}>
                <TouchableOpacity
                  style={[S.saveBtn, (saving || (!canAddWord && materialType === 'word') || (!canAddPassage && materialType === 'passage')) && S.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={saving || (!canAddWord && materialType === 'word') || (!canAddPassage && materialType === 'passage')}
                >
                  {saving ? (
                    <ActivityIndicator color={F.white} />
                  ) : (
                    <Text style={S.saveBtnText}>
                      {editingMaterial ? 'I-update' : 'Idagdag'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: F.bg },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: F.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: F.ink,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: F.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },

  errorBox: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  errorText: { fontSize: 14, fontWeight: '600', color: F.red, textAlign: 'center' },

  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyBox: { alignItems: 'center', marginTop: 100, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: F.ink, marginBottom: 6 },
  emptyText: { fontSize: 14, color: F.slate, fontWeight: '600', textAlign: 'center' },

  aralinGroup: { marginBottom: 24 },
  aralinHeader: { fontSize: 16, fontWeight: '900', color: F.ink, marginBottom: 12, textTransform: 'uppercase' },

  typeGroup: { marginBottom: 16 },
  typeLabel: { fontSize: 13, fontWeight: '700', color: F.slate, marginBottom: 8 },

  materialCard: {
    backgroundColor: F.white,
    borderRadius: Radii.lg,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  materialInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  materialTitle: { fontSize: 15, fontWeight: '700', color: F.ink },
  materialSubtitle: { fontSize: 11, color: F.slate, marginTop: 2 },
  materialActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: F.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: F.ink },
  closeBtn: { padding: 4 },

  modalContent: { padding: 24, paddingBottom: 0 },
  fieldRow: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: F.slate, marginBottom: 8 },
  modalInput: {
    backgroundColor: F.bg,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: F.ink,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: { height: 100, paddingTop: 12 },

  typeSelector: { flexDirection: 'row', gap: 10 },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: F.bg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  typeOptionActive: { backgroundColor: F.primary, borderColor: F.primary },
  typeOptionText: { fontSize: 14, fontWeight: '700', color: F.ink },
  typeOptionTextActive: { color: F.white },

  scopeSelector: { flexDirection: 'row', gap: 8 },
  scopeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: F.bg,
    alignItems: 'center',
  },
  scopeOptionActive: { backgroundColor: F.primaryDeep },
  scopeOptionText: { fontSize: 12, fontWeight: '700', color: F.slate },
  scopeOptionTextActive: { color: F.white },

  aralinOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: F.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  aralinOptionActive: { backgroundColor: F.primary, borderColor: F.primary },
  aralinOptionText: { fontSize: 13, fontWeight: '700', color: F.ink },
  aralinOptionTextActive: { color: F.white },

  letterDisplay: { backgroundColor: F.primaryLight, borderRadius: 12, padding: 14, alignItems: 'center' },
  letterDisplayText: { fontSize: 18, fontWeight: '900', color: F.primaryDeep },

  warningBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 16,
  },
  warningText: { fontSize: 12, fontWeight: '600', color: '#856404' },

  modalFooter: { padding: 24, paddingTop: 16 },
  saveBtn: {
    backgroundColor: F.primaryDeep,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Shadows.button,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: F.white, fontSize: 16, fontWeight: '800' },
});
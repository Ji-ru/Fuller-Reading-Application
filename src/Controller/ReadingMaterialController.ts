import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import readingMaterialData from '../../assets/ReadingMaterial/ReadingMaterial.json';
import { Alphabet, Contrasts, Passage, Word, ReadingMaterialData } from '../Interfaces/passage';
import { CustomReadingMaterial, UserDocument } from '../Interfaces/dataInterfaces';
import { getUserProfile } from './AuthenticationController';

const db = getFirestore();
const auth = getAuth();

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized: Admin access required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const ensureAdminUser = async (): Promise<UserDocument> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new UnauthorizedError('No authenticated user found');
  }

  const profile = await getUserProfile(currentUser.uid);
  if (!profile || profile.role !== 'admin') {
    throw new UnauthorizedError('Admin access required');
  }

  return profile;
};

const getBaseAlphabetData = (): Alphabet[] => {
  return readingMaterialData?.Alphabet || [];
};

const getBaseWordsData = (): Word[] => {
  return readingMaterialData?.Words || [];
};

const getBasePassagesData = (): Passage[] => {
  return readingMaterialData?.Passages || [];
};

export const getCustomReadingMaterials = async (): Promise<CustomReadingMaterial[]> => {
  await ensureAdminUser();

  const materialsRef = collection(db, 'customReadingMaterials');
  const snapshot = await getDocs(materialsRef);

  const materials = snapshot.docs.map((doc: any) => ({
    materialId: doc.id,
    ...doc.data(),
  })) as CustomReadingMaterial[];

  return materials.sort((a, b) => {
    if (a.aralinIndex !== b.aralinIndex) return a.aralinIndex - b.aralinIndex;
    if (a.letter !== b.letter) return a.letter.localeCompare(b.letter);
    if (a.type !== b.type) return a.type === 'word' ? -1 : 1;
    const aTitle = a.word || a.title || '';
    const bTitle = b.word || b.title || '';
    return aTitle.localeCompare(bTitle);
  });
};

export const getMergedReadingMaterials = async (
  studentId: string,
  classCodes: string[]
): Promise<ReadingMaterialData> => {
  const alphabet = getBaseAlphabetData();
  const words = getBaseWordsData();
  const passages = getBasePassagesData();

  const materialsRef = collection(db, 'customReadingMaterials');
  const snapshot = await getDocs(materialsRef);

  const customMaterials = snapshot.docs
    .map((doc: any) => ({ materialId: doc.id, ...doc.data() })) as CustomReadingMaterial[];

  const visibleCustomWords: CustomReadingMaterial[] = [];
  const visibleCustomPassages: CustomReadingMaterial[] = [];

  for (const material of customMaterials) {
    const isVisible = material.scopeType === 'all' ||
      (material.scopeType === 'student' && material.studentIds?.includes(studentId)) ||
      (material.scopeType === 'class' && material.classCodes?.some(code => classCodes.includes(code)));

    if (isVisible) {
      if (material.type === 'word') {
        visibleCustomWords.push(material);
      } else {
        visibleCustomPassages.push(material);
      }
    }
  }

  const mergedWords = mergeCustomWordsIntoWords(words, visibleCustomWords);
  const mergedPassages = [...passages, ...visibleCustomPassages.map(m => ({
    title: m.title || '',
    author: m.author || '',
    category: m.category || 'custom',
    letter: m.letter,
    aralin: m.aralinIndex + 1,
    image: '',
    text: m.text || '',
  } as Passage))];

  return {
    Alphabet: alphabet,
    Words: mergedWords,
    Passages: mergedPassages,
  };
};

const mergeCustomWordsIntoWords = (baseWords: Word[], customWords: CustomReadingMaterial[]): Word[] => {
  const wordsMap = new Map<string, Word>();

  baseWords.forEach(w => {
    wordsMap.set(w.letter, { ...w });
  });

  customWords.forEach(cw => {
    const letter = cw.letter;
    const word = cw.word!;

    if (!wordsMap.has(letter)) {
      wordsMap.set(letter, {
        letter,
        contrasts: [{
          phoneme: 'custom',
          ipa: '',
          words: [word],
        }],
      });
    } else {
      const existing = wordsMap.get(letter)!;
      const hasCustomContrast = existing.contrasts.some(
        c => c.phoneme === 'custom' || c.phoneme === 'custom_default'
      );

      if (hasCustomContrast) {
        const customContrast = existing.contrasts.find(
          c => c.phoneme === 'custom' || c.phoneme === 'custom_default'
        );
        if (customContrast && !customContrast.words.includes(word)) {
          customContrast.words.push(word);
        }
      } else {
        existing.contrasts.push({
          phoneme: 'custom',
          ipa: '',
          words: [word],
        });
      }
    }
  });

  return Array.from(wordsMap.values()).sort((a, b) => {
    const alphaIndex = (readingMaterialData?.Alphabet || []).findIndex(
      al => al.letter === a.letter
    );
    const betaIndex = (readingMaterialData?.Alphabet || []).findIndex(
      al => al.letter === b.letter
    );
    return alphaIndex - betaIndex;
  });
};

export const saveWord = async (data: {
  materialId?: string;
  aralinIndex: number;
  letter: string;
  word: string;
  scopeType: 'student' | 'class' | 'all';
  studentIds?: string[];
  classCodes?: string[];
}): Promise<string> => {
  const admin = await ensureAdminUser();

  const trimmedWord = data.word.trim();
  const trimmedLetter = data.letter.trim();

  if (!trimmedWord) {
    throw new ValidationError('Word cannot be empty');
  }

  if (!trimmedLetter) {
    throw new ValidationError('Letter cannot be empty');
  }

  const alphabet = getBaseAlphabetData();
  const letterExists = alphabet.some(a => a.letter === trimmedLetter);
  if (!letterExists) {
    throw new ValidationError(`Letter "${trimmedLetter}" not found in reading materials`);
  }

  if (data.aralinIndex < 0) {
    throw new ValidationError('Invalid Aralin index');
  }

  const aralinNum = data.aralinIndex + 1;
  // Aralin 1 and Aralin 2 must reject both word and passage writes
  // Aralin 3 can add words only (student index is 2, aralinNum is 3)
  // Aralin 4 and later can add both words and passages
  if (aralinNum <= 2) {
    throw new ValidationError('Words cannot be added to Aralin 1 and Aralin 2');
  }

  if (!data.scopeType || !['student', 'class', 'all'].includes(data.scopeType)) {
    throw new ValidationError('Invalid scope type');
  }

  if (data.scopeType === 'student' && (!data.studentIds || data.studentIds.length === 0)) {
    throw new ValidationError('At least one student ID required for student scope');
  }

  if (data.scopeType === 'class' && (!data.classCodes || data.classCodes.length === 0)) {
    throw new ValidationError('At least one class code required for class scope');
  }

  const materialsRef = collection(db, 'customReadingMaterials');

  // Case-insensitive duplicate check
  const wordLower = trimmedWord.toLowerCase();
  if (!data.materialId) {
    if (data.scopeType === 'student' && data.studentIds) {
      for (const sid of data.studentIds) {
        const q = query(
          materialsRef,
          where('type', '==', 'word'),
          where('letter', '==', trimmedLetter),
          where('scopeType', '==', 'student'),
          where('studentIds', 'array-contains', sid)
        );
        const snap = await getDocs(q);
        const duplicate = snap.docs.find((d: any) => d.data().word?.toLowerCase() === wordLower);
        if (duplicate) {
          throw new ValidationError(`Word "${trimmedWord}" already exists for this student under letter "${trimmedLetter}"`);
        }
      }
    }

    if (data.scopeType === 'class' && data.classCodes) {
      for (const code of data.classCodes) {
        const q = query(
          materialsRef,
          where('type', '==', 'word'),
          where('letter', '==', trimmedLetter),
          where('scopeType', '==', 'class'),
          where('classCodes', 'array-contains', code)
        );
        const snap = await getDocs(q);
        const duplicate = snap.docs.find((d: any) => d.data().word?.toLowerCase() === wordLower);
        if (duplicate) {
          throw new ValidationError(`Word "${trimmedWord}" already exists for this class under letter "${trimmedLetter}"`);
        }
      }
    }

    if (data.scopeType === 'all') {
      const q = query(
        materialsRef,
        where('type', '==', 'word'),
        where('letter', '==', trimmedLetter),
        where('scopeType', '==', 'all')
      );
      const snap = await getDocs(q);
      const duplicate = snap.docs.find((d: any) => d.data().word?.toLowerCase() === wordLower);
      if (duplicate) {
        throw new ValidationError(`Word "${trimmedWord}" already exists for all students under letter "${trimmedLetter}"`);
      }
    }
  }

  const materialId = data.materialId || `word_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const materialData: Record<string, any> = {
    materialId,
    type: 'word',
    aralinIndex: data.aralinIndex,
    letter: trimmedLetter,
    word: trimmedWord,
    phoneme: 'custom',
    ipa: '',
    updatedBy: admin.uid,
    updatedAt: serverTimestamp(),
    scopeType: data.scopeType,
    ...(data.studentIds && { studentIds: data.studentIds }),
    ...(data.classCodes && { classCodes: data.classCodes }),
  };
  
  if (!data.materialId) {
    materialData.createdBy = admin.uid;
    materialData.createdAt = serverTimestamp();
  }

  const materialRef = doc(db, 'customReadingMaterials', materialId);
  await setDoc(materialRef, materialData, { merge: true });

  return materialId;
};

export const savePassage = async (data: {
  materialId?: string;
  aralinIndex: number;
  letter: string;
  title: string;
  text: string;
  author?: string;
  scopeType: 'student' | 'class' | 'all';
  studentIds?: string[];
  classCodes?: string[];
}): Promise<string> => {
  const admin = await ensureAdminUser();

  const trimmedTitle = data.title.trim();
  const trimmedText = data.text.trim();
  const trimmedLetter = data.letter.trim();
  const trimmedAuthor = (data.author || '').trim();

  if (!trimmedTitle) {
    throw new ValidationError('Passage title cannot be empty');
  }

  if (!trimmedText) {
    throw new ValidationError('Passage text cannot be empty');
  }

  if (!trimmedLetter) {
    throw new ValidationError('Letter cannot be empty');
  }

  const alphabet = getBaseAlphabetData();
  const letterExists = alphabet.some(a => a.letter === trimmedLetter);
  if (!letterExists) {
    throw new ValidationError(`Letter "${trimmedLetter}" not found in reading materials`);
  }

  // Passages can only be added to Aralin 4 and later (index >= 3)
  if (data.aralinIndex < 3) {
    throw new ValidationError('Passages can only be added to Aralin 4 and later');
  }

  if (!data.scopeType || !['student', 'class', 'all'].includes(data.scopeType)) {
    throw new ValidationError('Invalid scope type');
  }

  if (data.scopeType === 'student' && (!data.studentIds || data.studentIds.length === 0)) {
    throw new ValidationError('At least one student ID required for student scope');
  }

  if (data.scopeType === 'class' && (!data.classCodes || data.classCodes.length === 0)) {
    throw new ValidationError('At least one class code required for class scope');
  }

  const materialsRef = collection(db, 'customReadingMaterials');

  // Case-insensitive duplicate check
  const titleLower = trimmedTitle.toLowerCase();
  if (!data.materialId) {
    if (data.scopeType === 'student' && data.studentIds) {
      for (const sid of data.studentIds) {
        const q = query(
          materialsRef,
          where('type', '==', 'passage'),
          where('aralinIndex', '==', data.aralinIndex),
          where('scopeType', '==', 'student'),
          where('studentIds', 'array-contains', sid)
        );
        const snap = await getDocs(q);
        const duplicate = snap.docs.find((d: any) => d.data().title?.toLowerCase() === titleLower);
        if (duplicate) {
          throw new ValidationError(`Passage "${trimmedTitle}" already exists for this student under this Aralin`);
        }
      }
    }

    if (data.scopeType === 'class' && data.classCodes) {
      for (const code of data.classCodes) {
        const q = query(
          materialsRef,
          where('type', '==', 'passage'),
          where('aralinIndex', '==', data.aralinIndex),
          where('scopeType', '==', 'class'),
          where('classCodes', 'array-contains', code)
        );
        const snap = await getDocs(q);
        const duplicate = snap.docs.find((d: any) => d.data().title?.toLowerCase() === titleLower);
        if (duplicate) {
          throw new ValidationError(`Passage "${trimmedTitle}" already exists for this class under this Aralin`);
        }
      }
    }

    if (data.scopeType === 'all') {
      const q = query(
        materialsRef,
        where('type', '==', 'passage'),
        where('aralinIndex', '==', data.aralinIndex),
        where('scopeType', '==', 'all')
      );
      const snap = await getDocs(q);
      const duplicate = snap.docs.find((d: any) => d.data().title?.toLowerCase() === titleLower);
      if (duplicate) {
        throw new ValidationError(`Passage "${trimmedTitle}" already exists for all students under this Aralin`);
      }
    }
  }

  const materialId = data.materialId || `passage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const materialData: Record<string, any> = {
    materialId,
    type: 'passage',
    aralinIndex: data.aralinIndex,
    letter: trimmedLetter,
    title: trimmedTitle,
    text: trimmedText,
    author: trimmedAuthor,
    category: 'custom',
    updatedBy: admin.uid,
    updatedAt: serverTimestamp(),
    scopeType: data.scopeType,
    ...(data.studentIds && { studentIds: data.studentIds }),
    ...(data.classCodes && { classCodes: data.classCodes }),
  };
  
  if (!data.materialId) {
    materialData.createdBy = admin.uid;
    materialData.createdAt = serverTimestamp();
  }

  const materialRef = doc(db, 'customReadingMaterials', materialId);
  await setDoc(materialRef, materialData, { merge: true });

  return materialId;
};

export const deleteCustomReadingMaterial = async (materialId: string): Promise<void> => {
  await ensureAdminUser();

  const materialRef = doc(db, 'customReadingMaterials', materialId);
  const snap = await getDoc(materialRef);

  if (!snap.exists()) {
    throw new ValidationError('Material not found');
  }

  await deleteDoc(materialRef);
};

export const mergeCustomReadingMaterials = (
  baseData: ReadingMaterialData,
  customMaterials: CustomReadingMaterial[]
): ReadingMaterialData => {
  const wordsMap = new Map<string, Word>();

  baseData.Words.forEach(w => {
    wordsMap.set(w.letter, { ...w });
  });

  const customWords = customMaterials.filter(m => m.type === 'word');
  customWords.forEach(cw => {
    const letter = cw.letter;
    const word = cw.word!;

    if (!wordsMap.has(letter)) {
      wordsMap.set(letter, {
        letter,
        contrasts: [{
          phoneme: 'custom',
          ipa: '',
          words: [word],
        }],
      });
    } else {
      const existing = wordsMap.get(letter)!;
      const hasCustomContrast = existing.contrasts.some(
        c => c.phoneme === 'custom' || c.phoneme === 'custom_default'
      );

      if (hasCustomContrast) {
        const customContrast = existing.contrasts.find(
          c => c.phoneme === 'custom' || c.phoneme === 'custom_default'
        );
        if (customContrast && !customContrast.words.includes(word)) {
          customContrast.words.push(word);
        }
      } else {
        existing.contrasts.push({
          phoneme: 'custom',
          ipa: '',
          words: [word],
        });
      }
    }
  });

  const mergedPassages = [
    ...baseData.Passages,
    ...customMaterials
      .filter(m => m.type === 'passage')
      .map(m => ({
        title: m.title || '',
        author: m.author || '',
        category: m.category || 'custom',
        letter: m.letter,
        aralin: m.aralinIndex + 1,
        image: '',
        text: m.text || '',
      } as Passage)),
  ];

  return {
    Alphabet: baseData.Alphabet,
    Words: Array.from(wordsMap.values()),
    Passages: mergedPassages,
  };
};

export const getStudentClassCodes = async (studentId: string): Promise<string[]> => {
  const studentProfile = await getUserProfile(studentId);
  if (!studentProfile) return [];

  const codes: string[] = [];
  if (studentProfile.studentData?.classCode) {
    codes.push(studentProfile.studentData.classCode.toUpperCase());
  }
  return codes;
};
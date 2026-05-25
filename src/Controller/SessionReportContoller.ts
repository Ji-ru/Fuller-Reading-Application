import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  orderBy,
} from '@react-native-firebase/firestore';

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { getDateRangeForTimeFilter } from '../Utilities/dateRange';
import { displayDateFromKey } from '../Utilities/dateKeyUtils';
import { getPeriodLabels, getLabelForDate } from '../Utilities/activityGroupingDate';
import {
  AlphabetSessionData,
  WordSessionData,
  WordPeriodSlot,
  WordAccuracySummary,
  WordMasterySummary,
  ChapterKey,
  LessonKey,
  WordReportDocument,
} from '../Interfaces/dataInterfaces';

export type TimeRange = 'week' | 'month' | 'year';
// ==========================================================================================
// ALPHABET SESSION
// ==========================================================================================

type Options = {
  timeRange: TimeRange;

  /**
   * If provided, the function becomes realtime and returns an unsubscribe.
   * If not provided, the function does one-shot fetch and returns the data.
   */
  onData?: (rows: AlphabetSessionData[]) => void;
  onError?: (err: Error) => void;

  /** Safety cap. School year can be ~365 docs; 400 is safe. */
  maxDocs?: number;
};

/**
 * normalizeLetters()
 *
 * Flow:
 * 1) Takes unknown Firestore field (could be missing / wrong type / legacy values).
 * 2) Returns a clean string[] of uppercase A–Z letters.
 * 3) Ensures UI + aggregation doesn't get duplicates like "a" vs "A".
 */
function normalizeLetters(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map(x => String(x).replace(/[^A-Za-z]/g, '').toUpperCase())
    .filter(Boolean);
}

/**
 * deriveDateKeyFromDocId()
 *
 * Flow:
 * 1) Alphabet sessions are stored as docId: `${uid}_${YYYYMMDD}`
 * 2) If `dateKey` field is missing (legacy docs), extract the trailing YYYYMMDD from id.
 * 3) Returns null if format doesn't match.
 */
function deriveDateKeyFromDocId(id: string): string | null {
  const idx = id.lastIndexOf('_');
  if (idx === -1) return null;
  const key = id.slice(idx + 1);
  return /^\d{8}$/.test(key) ? key : null;
}

/**
 * mapDocToUI()
 *
 * Flow:
 * 1) Validates required fields (studentId).
 * 2) Determines `dateKey`:
 *    - Prefer `data.dateKey` (new schema)
 *    - Fallback to parsing docId (legacy)
 * 3) Builds the UI object your component expects:
 *    - date = YYYYMMDD
 *    - displayDate = "Feb 19"
 *    - normalized letters arrays
 */
function mapDocToUI(id: string, data: any): AlphabetSessionData | null {
  const studentId = String(data?.studentId ?? '');
  if (!studentId) return null;

  const dateKey =
    (typeof data?.dateKey === 'string' && /^\d{8}$/.test(data.dateKey))
      ? data.dateKey
      : deriveDateKeyFromDocId(id);

  if (!dateKey) return null;

  return {
    alphabetSessionId: String(data?.alphabetSessionId ?? id),
    studentId,
    date: dateKey,
    displayDate: displayDateFromKey(dateKey),
    attemptedCount: Number(data?.attemptedCount ?? 0),
    correctCount: Number(data?.correctCount ?? 0),
    correctLetters: normalizeLetters(data?.correctLetters),
    incorrectLetters: normalizeLetters(data?.incorrectLetters),
  };
}
function toKey(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
/**
 * buildRangeQuery()
 *
 * Flow:
 * 1) Use your helper to compute the exact start/end window for week/month/year.
 * 2) Convert those dates into YYYYMMDD strings (lexicographic ordering works).
 * 3) Build Firestore query:
 *    - filter by studentId
 *    - filter dateKey between startKey & endKey
 *    - orderBy dateKey (required for range)
 *    - limit maxDocs (safety)
 */
function buildRangeQuery(
  studentId: string,
  timeRange: TimeRange,
  maxDocs: number,
): FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> {
  const db = getFirestore();
  const { start, end } = getDateRangeForTimeFilter(timeRange);


  const startKey = typeof start === 'string' ? start : toKey(start);
  const endKey = typeof end === 'string' ? end : toKey(end);

  return query(
    collection(db, 'alphabetSessions'),
    where('studentId', '==', studentId),
    where('dateKey', '>=', startKey),
    where('dateKey', '<=', endKey),
    
    orderBy('dateKey', 'asc'),
    limit(maxDocs),
  );
}

/**
 * alphabetSessionsByRange()
 *
 * Single entry point, two modes:
 *
 * Mode A: Realtime (subscribe)
 * - Provide `opts.onData`
 * - Returns unsubscribe() function
 * - Flow: onSnapshot(query) -> map each doc -> onData(rows)
 *
 * Mode B: One-shot (fetch)
 * - Omit `opts.onData`
 * - Returns AlphabetSessionData[]
 * - Flow: getDocs(query) -> map each doc -> return rows
 */
export async function alphabetSessionsByRange(
  studentId: string,
  opts: Options,
): Promise<AlphabetSessionData[] | (() => void)> {
  const { timeRange, onData, onError, maxDocs = 400 } = opts;

  if (!studentId) {
    const empty: AlphabetSessionData[] = [];
    onData?.(empty);
    return onData ? () => { } : empty;
  }

  const q = buildRangeQuery(studentId, timeRange, maxDocs);

  // Realtime mode
  if (onData) {
    const unsub = onSnapshot(
      q,
      (snap: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>) => {
        const rows: AlphabetSessionData[] = [];

        // ✅ Use snap.docs to avoid implicit-any callback params
        for (const docSnap of snap.docs) {
          const mapped = mapDocToUI(docSnap.id, docSnap.data());
          if (mapped) rows.push(mapped);
        }

        onData(rows);
      },
      err => {
        const e = err instanceof Error ? err : new Error(String(err));
        onError?.(e);
      },
    );

    return unsub;
  }

  // One-shot mode
  try {
    const snap = await getDocs(q);
    const rows: AlphabetSessionData[] = [];

    // Use snap.docs for consistent typing
    for (const docSnap of snap.docs) {
      const mapped = mapDocToUI(docSnap.id, docSnap.data());
      if (mapped) rows.push(mapped);
    }

    return rows;
  } catch (err: any) {
    const e = err instanceof Error ? err : new Error(String(err));
    onError?.(e);
    throw e;
  }
}

export interface AlphabetPeriodSlot {
  label: string;
  sessions: AlphabetSessionData[];

  // Performance
  accuracy: number | null;       // correct/attempted * 100 (weighted by counts)
  masteryPercent: number | null; // masteredLetters/26 * 100

  // Aggregates used by UI
  correctLetters: string[];
  incorrectLetters: string[];
  correctCount: number;
  attemptedCount: number;
}

export interface AlphabetMasterySummary {
  totalSessions: number;       // slots with data
  avgAccuracy: number | null;  // avg of slot.accuracy across slots with data
  avgMastery: number | null;   // avg of slot.masteryPercent across slots with data
  masteredLetters: number | null; // selected slot or overall depends on UI usage
}

/**
 * buildAlphabetPeriodSlots()
 *
 * Converts flat session docs into fixed chart slots for the given range.
 *
 * Flow:
 * 1) Pre-create empty slots using getPeriodLabels(range)
 * 2) Assign each session into its slot via getLabelForDate(session.date)
 * 3) Aggregate counts + union correct letters
 * 4) Compute:
 *    - slot.accuracy = correctCount / attemptedCount
 *    - slot.masteryPercent = unique(correctLetters) / 26
 */
export function buildAlphabetPeriodSlots(
  sessions: AlphabetSessionData[],
  timeRange: TimeRange,
): AlphabetPeriodSlot[] {
  const labels = getPeriodLabels(timeRange);

  // label -> slot
  const slotMap = new Map<string, AlphabetPeriodSlot>();
  for (const label of labels) {
    slotMap.set(label, {
      label,
      sessions: [],
      accuracy: null,
      masteryPercent: null,
      correctLetters: [],
      incorrectLetters: [],
      correctCount: 0,
      attemptedCount: 0,
    });
  }

  for (const sess of sessions) {
    // sess.date is YYYYMMDD
    const y = Number(sess.date.slice(0, 4));
    const m = Number(sess.date.slice(4, 6)) - 1;
    const d = Number(sess.date.slice(6, 8));
    const dateObj = new Date(y, m, d);

    const label = getLabelForDate(dateObj, timeRange);
    const slot = slotMap.get(label);
    if (!slot) continue; // outside the current range window

    slot.sessions.push(sess);
    slot.correctCount += sess.correctCount;
    slot.attemptedCount += sess.attemptedCount;

    // union correct letters
    for (const l of sess.correctLetters) {
      if (!slot.correctLetters.includes(l)) slot.correctLetters.push(l);
    }

    // incorrect letters that are NOT already correct in this slot
    for (const l of sess.incorrectLetters) {
      if (!slot.correctLetters.includes(l) && !slot.incorrectLetters.includes(l)) {
        slot.incorrectLetters.push(l);
      }
    }
  }

  for (const slot of slotMap.values()) {
    if (slot.sessions.length > 0) {
      const correctUnique = slot.correctLetters.length;

      // Accuracy based on correct / attempts
      if (slot.attemptedCount > 0) {
        slot.accuracy = Math.round((slot.correctCount / slot.attemptedCount) * 100);
      } else {
        slot.accuracy = 0;
      }
      // Mastery based on mastered letters / TOTAL (26)
      slot.masteryPercent = Math.round((correctUnique / 26) * 100);

      // Optional: force attemptedCount for alphabet to be TOTAL when there is data
      // (helps UI that shows /attemptedCount)
      if (slot.attemptedCount === 0) slot.attemptedCount = 26;
    }
  }

  return labels.map(l => slotMap.get(l)!);
}

/**
 * computeAlphabetMasterySummary()
 *
 * Flow:
 * 1) Compute totalSessions = number of slots with accuracy != null
 * 2) Compute avgAccuracy across non-empty slots
 * 3) Compute avgMastery across non-empty slots
 */
export function computeAlphabetMasterySummary(
  slots: AlphabetPeriodSlot[],
): AlphabetMasterySummary {
  const nonEmpty = slots.filter(s => s.accuracy !== null);

  if (nonEmpty.length === 0) {
    return {
      totalSessions: 0,
      avgAccuracy: null,
      avgMastery: null,
      masteredLetters: null,
    };
  }

  const avgAccuracy = Math.round(
    nonEmpty.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / nonEmpty.length,
  );

  const avgMastery = Math.round(
    nonEmpty.reduce((sum, s) => sum + (s.masteryPercent ?? 0), 0) / nonEmpty.length,
  );

  return {
    totalSessions: nonEmpty.length,
    avgAccuracy,
    avgMastery,
    masteredLetters: null, // UI can set this based on selected slot
  };
}

/**
 * getDefaultSlotIndex()
 *
 * Picks the most recent slot that has data.
 * Flow: scan backwards; if none, return last slot.
 */
export function getDefaultSlotIndex(slots: AlphabetPeriodSlot[]): number {
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i].accuracy !== null) return i;
  }
  return Math.max(0, slots.length - 1);
}


// ==========================================================================================
// WORD SESSION
// ==========================================================================================
function mapWordDocToUI(id: string, data: any): WordSessionData | null {
  const studentId = String(data?.studentId ?? '');
  if (!studentId) return null;

  const dateKey =
    (typeof data?.dateKey === 'string' && /^\d{8}$/.test(data.dateKey))
      ? data.dateKey
      : null;

  if (!dateKey) return null;

  const totalsAttempted = Number(data?.totals?.attempted ?? 0);
  const totalsCorrect = Number(data?.totals?.correct ?? 0);

  const chaptersRaw = data?.chapters;
  const chapters: WordSessionData['chapters'] =
    chaptersRaw && typeof chaptersRaw === 'object' ? chaptersRaw : {};

  return {
    wordSessionId: String(data?.wordSessionId ?? id),
    studentId,
    dateKey,
    displayDate: displayDateFromKey(dateKey),
    attemptedCount: totalsAttempted,
    correctCount: totalsCorrect,
    chapters,
  };
}

function buildDateKeyRangeQuery(
  collectionName: string,
  studentId: string,
  timeRange: TimeRange,
  maxDocs: number,
): FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> {
  const db = getFirestore();
  const { start, end } = getDateRangeForTimeFilter(timeRange);

  // Convert Date -> YYYYMMDD (lexicographic ordering works)
  const startKey =
    `${start.getFullYear()}${String(start.getMonth() + 1).padStart(2, '0')}${String(start.getDate()).padStart(2, '0')}`;
  const endKey =
    `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(end.getDate()).padStart(2, '0')}`;

  return query(
    collection(db, collectionName),
    where('studentId', '==', studentId),
    where('dateKey', '>=', startKey),
    where('dateKey', '<=', endKey),
    // IMPORTANT: Firestore requires orderBy on the same field when doing range filters
    // (and you’ll need a composite index with studentId + dateKey in console if prompted)
    orderBy('dateKey', 'asc'),
    limit(maxDocs),
  );
}

// ==========================================================================================
// WORD SESSION FETCH (similar pattern to alphabetSessionsByRange)
// ==========================================================================================

type WordOptions = {
  timeRange: TimeRange;
  onData?: (rows: WordSessionData[]) => void;
  onError?: (err: Error) => void;
  maxDocs?: number;
};

export async function wordSessionsByRange(
  studentId: string,
  opts: WordOptions,
): Promise<WordSessionData[] | (() => void)> {
  const { timeRange, onData, onError, maxDocs = 400 } = opts;

  if (!studentId) {
    const empty: WordSessionData[] = [];
    onData?.(empty);
    return onData ? () => {} : empty;
  }

  const q = buildDateKeyRangeQuery('wordSessions', studentId, timeRange, maxDocs);

  // Realtime mode
  if (onData) {
    const unsub = onSnapshot(
      q,
      (snap: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>) => {
        const rows: WordSessionData[] = [];
        for (const docSnap of snap.docs) {
          const mapped = mapWordDocToUI(docSnap.id, docSnap.data());
          if (mapped) rows.push(mapped);
        }
        onData(rows);
      },
      err => {
        const e = err instanceof Error ? err : new Error(String(err));
        onError?.(e);
      },
    );

    return unsub;
  }

  // One-shot mode
  try {
    const snap = await getDocs(q);
    const rows: WordSessionData[] = [];
    for (const docSnap of snap.docs) {
      const mapped = mapWordDocToUI(docSnap.id, docSnap.data());
      if (mapped) rows.push(mapped);
    }
    return rows;
  } catch (err: any) {
    const e = err instanceof Error ? err : new Error(String(err));
    onError?.(e);
    throw e;
  }
}

export function buildWordPeriodSlots(
  sessions: WordSessionData[],
  timeRange: TimeRange,
): WordPeriodSlot[] {
  const labels = getPeriodLabels(timeRange);

  const slotMap = new Map<string, WordPeriodSlot>();
  for (const label of labels) {
    slotMap.set(label, {
      label,
      sessions: [],
      accuracy: null,
      attemptedCount: 0,
      correctCount: 0,
      lessonAgg: {},
    });
  }

  for (const sess of sessions) {
    const y = Number(sess.dateKey.slice(0, 4));
    const m = Number(sess.dateKey.slice(4, 6)) - 1;
    const d = Number(sess.dateKey.slice(6, 8));
    const dateObj = new Date(y, m, d);

    const label = getLabelForDate(dateObj, timeRange);
    const slot = slotMap.get(label);
    if (!slot) continue;

    slot.sessions.push(sess);
    slot.attemptedCount += sess.attemptedCount;
    slot.correctCount += sess.correctCount;

    // Optional: build lesson aggregates for drilldown charts
    for (const chKey of Object.keys(sess.chapters || {})) {
      const ch = sess.chapters[chKey];
      if (!ch?.lessons) continue;

      for (const lsKey of Object.keys(ch.lessons)) {
        const ls = ch.lessons[lsKey];
        const aggKey = `${ch.chapterId}::${ls.lessonId}`;

        if (!slot.lessonAgg[aggKey]) {
          slot.lessonAgg[aggKey] = {
            chapterId: ch.chapterId,
            chapterTitle: ch.chapterTitle,
            lessonId: ls.lessonId,
            lessonTitle: ls.lessonTitle,
            attempted: 0,
            correct: 0,
            accuracy: null,
          };
        }

        slot.lessonAgg[aggKey].attempted += Number(ls.attempted ?? 0);
        slot.lessonAgg[aggKey].correct += Number(ls.correct ?? 0);
      }
    }
  }

  // Compute slot accuracy (weighted)
  for (const slot of slotMap.values()) {
    if (slot.attemptedCount > 0) {
      slot.accuracy = Math.round((slot.correctCount / slot.attemptedCount) * 100);
    }

    // compute lesson accuracies
    for (const k of Object.keys(slot.lessonAgg)) {
      const a = slot.lessonAgg[k];
      a.accuracy = a.attempted > 0 ? Math.round((a.correct / a.attempted) * 100) : null;
    }
  }

  return labels.map(l => slotMap.get(l)!);
}

export function computeWordAccuracySummary(
  slots: WordPeriodSlot[],
): WordAccuracySummary {
  const nonEmpty = slots.filter(s => s.accuracy !== null);

  if (nonEmpty.length === 0) {
    return { totalSessions: 0, avgAccuracy: null };
  }

  const avgAccuracy = Math.round(
    nonEmpty.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / nonEmpty.length,
  );

  return { totalSessions: nonEmpty.length, avgAccuracy };
}

type WordsJson = {
  Words?: Array<{
    chapters?: Array<{
      chapter_id: number;
      title: string;
      lessons?: Array<{
        lesson_id: number;
        title: string;
        words?: string[];
      }>;
    }>;
  }>;
};

function normWord(w: string) {
  return w.trim().toLowerCase();
}

export function buildWordCurriculumIndex(readingMaterialData: WordsJson) {
  const container = readingMaterialData?.Words?.[0];
  const chapters = container?.chapters ?? [];

  const perLessonTotals: Record<LessonKey, number> = {};
  const perChapterTotals: Record<ChapterKey, number> = {};

  const lessonMeta: Record<
    LessonKey,
    { chapterId: number; chapterTitle: string; lessonId: number; lessonTitle: string }
  > = {};

  const chapterMeta: Record<ChapterKey, { chapterId: number; chapterTitle: string }> = {};

  let totalWordsAll = 0;

  for (const ch of chapters) {
    const chKey: ChapterKey = `ch_${ch.chapter_id}`;
    chapterMeta[chKey] = { chapterId: ch.chapter_id, chapterTitle: ch.title };
    perChapterTotals[chKey] = 0;

    for (const ls of ch.lessons ?? []) {
      const lsKey: LessonKey = `ch_${ch.chapter_id}::ls_${ls.lesson_id}`;

      lessonMeta[lsKey] = {
        chapterId: ch.chapter_id,
        chapterTitle: ch.title,
        lessonId: ls.lesson_id,
        lessonTitle: ls.title,
      };

      // unique words per lesson (avoid duplicates inside the JSON)
      const uniq = new Set((ls.words ?? []).map(normWord).filter(Boolean));
      const count = uniq.size;

      perLessonTotals[lsKey] = count;
      perChapterTotals[chKey] += count;
      totalWordsAll += count;
    }
  }

  return { totalWordsAll, perLessonTotals, perChapterTotals, lessonMeta, chapterMeta };
}

export function computeWordMasteryFromSessions(
  sessions: WordSessionData[],
  totalWordsInCurriculum: number,
): WordMasterySummary {
  const perLessonSets: Record<string, Set<string>> = {};
  const globalSet = new Set<string>();

  for (const sess of sessions) {
    const chapters = sess.chapters ?? {};
    for (const chKey of Object.keys(chapters)) {
      const ch = chapters[chKey];
      const lessons = ch?.lessons ?? {};

      for (const lsKey of Object.keys(lessons)) {
        const ls = lessons[lsKey];
        const lessonKey = `${chKey}::${lsKey}`; // "ch_1::ls_2"

        const words = Array.isArray((ls as any).targetWords)
          ? (ls as any).targetWords
          : [];

        for (const w of words) {
          const nw = String(w).trim().toLowerCase();
          if (!nw) continue;

          if (!perLessonSets[lessonKey]) perLessonSets[lessonKey] = new Set();
          perLessonSets[lessonKey].add(nw);

          // global uniqueness should include lessonKey to avoid collisions
          globalSet.add(`${lessonKey}::${nw}`);
        }
      }
    }
  }

  const perLessonCompleted: Record<string, number> = {};
  for (const k of Object.keys(perLessonSets)) {
    perLessonCompleted[k] = perLessonSets[k].size;
  }

  const totalCompleted = globalSet.size;
  const masteryPercent =
    totalWordsInCurriculum > 0
      ? Math.round((totalCompleted / totalWordsInCurriculum) * 100)
      : null;

  return {
    totalCompleted,
    masteryPercent,
    perLessonCompleted,
  };
}

// ==========================================================================================
// WORD LESSON / CHAPTER PROGRESS (for StudentWordMastery visualization)
// ==========================================================================================

export interface WordLessonProgress {
  chapter: string;
  lesson: string;
  lessonIpa: string;
  lessonDisplayName: string;
  totalWords: number;

  masteredWords: string[];
  missedWords: string[];
  untriedWords: string[];

   // aggregated counts across all sessions for this lesson
   attempted: number;
   correct: number;

  latestAccuracy: number | null;
  sessionCount: number;
  lastPlayedDate: string;
}

export interface WordChapterProgress {
  chapter: string;
  chapterTitle: string;
  lessons: WordLessonProgress[];
  totalWords: number;
  masteredWords: number;
  completedLessons: number;
  overallAccuracy: number | null;
}

export function buildWordChapterProgress(
  readingMaterialData: WordsJson,
  sessions: WordSessionData[],
): WordChapterProgress[] {
  const container = readingMaterialData && Array.isArray(readingMaterialData.Words)
    ? readingMaterialData.Words[0]
    : undefined;
  const jsonChapters: any[] = Array.isArray(container && container.chapters)
    ? (container as any).chapters
    : [];

  // Map of `${chapterId}::${lessonId}` → metadata + canonical word list
  const lessonMeta = new Map<
    string,
    {
      chapterId: number;
      chapterTitle: string;
      lessonId: number;
      lessonTitle: string;
      letter?: string;
      words: string[];
    }
  >();

  for (const ch of jsonChapters) {
    const chapterId = Number(ch.chapter_id ?? 0);
    const chapterTitle = String(ch.title ?? '');

    for (const ls of ch.lessons ?? []) {
      const lessonId = Number(ls.lesson_id ?? 0);
      const lessonTitle = String(ls.title ?? '');
      const key = `${chapterId}::${lessonId}`;

      lessonMeta.set(key, {
        chapterId,
        chapterTitle,
        lessonId,
        lessonTitle,
        letter: typeof ls.letter === 'string' ? ls.letter : undefined,
        words: Array.isArray(ls.words) ? ls.words.map(String) : [],
      });
    }
  }

  type LessonAggregate = {
    chapterId: number;
    chapterTitle: string;
    lessonId: number;
    lessonTitle: string;
    letter?: string;
    words: string[];

    mastered: Set<string>;
    attempted: Set<string>;
    incorrect: Set<string>;

    sessionCount: number;
    latestAccuracy: number | null;
    lastDateKey: string | null;
    lastDisplayDate: string | null;

    // aggregated numeric totals across sessions
    totalAttempted: number;
    totalCorrect: number;
  };

  const agg = new Map<string, LessonAggregate>();

  for (const sess of sessions) {
    const dataChapters = sess.chapters ?? {};
    const dateKey = typeof sess.dateKey === 'string' ? sess.dateKey : null;
    const displayDate = sess.displayDate ?? null;

    for (const chKey of Object.keys(dataChapters)) {
      const ch = (dataChapters as any)[chKey];
      if (!ch?.lessons) continue;

      const chapterId = Number(ch.chapterId ?? 0);
      const chapterTitle = String(ch.chapterTitle ?? '');

      for (const lsKey of Object.keys(ch.lessons)) {
        const ls = (ch.lessons as any)[lsKey];
        if (!ls) continue;

        const lessonId = Number(ls.lessonId ?? 0);
        const lessonTitle = String(ls.lessonTitle ?? '');
        const metaKey = `${chapterId}::${lessonId}`;
        const meta = lessonMeta.get(metaKey);

        if (!meta) continue;

        let entry = agg.get(metaKey);
        if (!entry) {
          entry = {
            chapterId: meta.chapterId,
            chapterTitle: meta.chapterTitle,
            lessonId: meta.lessonId,
            lessonTitle: meta.lessonTitle,
            letter: meta.letter,
            words: meta.words,
            mastered: new Set<string>(),
            attempted: new Set<string>(),
            incorrect: new Set<string>(),
            sessionCount: 0,
            latestAccuracy: null,
            lastDateKey: null,
            lastDisplayDate: null,
            totalAttempted: 0,
            totalCorrect: 0,
          };
          agg.set(metaKey, entry);
        }

        entry.sessionCount += 1;

        const targetWords: string[] = Array.isArray((ls as any).targetWords)
          ? (ls as any).targetWords
          : [];
        const correctWordsArr: string[] = Array.isArray((ls as any).correctWords)
          ? (ls as any).correctWords
          : [];
        const incorrectWordsArr: string[] = Array.isArray(
          (ls as any).incorrectWords,
        )
          ? (ls as any).incorrectWords
          : [];

        for (const w of targetWords) {
          const nw = normWord(w);
          if (!nw) continue;
          entry.attempted.add(nw);
        }

        for (const w of correctWordsArr) {
          const nw = normWord(w);
          if (!nw) continue;
          entry.mastered.add(nw);
          entry.attempted.add(nw);
          entry.incorrect.delete(nw);
        }

        for (const w of incorrectWordsArr) {
          const nw = normWord(w);
          if (!nw || entry.mastered.has(nw)) continue;
          entry.incorrect.add(nw);
          entry.attempted.add(nw);
        }

        const attempted = Number(ls.attempted ?? 0);
        const correct = Number(ls.correct ?? 0);
        const lessonAcc =
          attempted > 0 ? Math.round((correct / attempted) * 100) : null;

        // aggregate numeric counts across all sessions
        entry.totalAttempted += attempted;
        entry.totalCorrect += correct;

        if (dateKey && lessonAcc !== null) {
          if (!entry.lastDateKey || dateKey > entry.lastDateKey) {
            entry.lastDateKey = dateKey;
            entry.lastDisplayDate = displayDate;
            entry.latestAccuracy = lessonAcc;
          }
        }
      }
    }
  }

  // Build WordLessonProgress grouped by chapter
  const chapterMap = new Map<
    number,
    { chapterId: number; chapterTitle: string; lessons: WordLessonProgress[] }
  >();

  for (const entry of agg.values()) {
    const normalizedList = entry.words.map(w => ({
      original: w,
      normalized: normWord(w),
    }));

    const masteredWords = normalizedList
      .filter(w => entry.mastered.has(w.normalized))
      .map(w => w.original);

    const missedWords = normalizedList
      .filter(
        w =>
          entry.attempted.has(w.normalized) &&
          !entry.mastered.has(w.normalized),
      )
      .map(w => w.original);

    const untriedWords = normalizedList
      .filter(w => !entry.attempted.has(w.normalized))
      .map(w => w.original);

    const lesson: WordLessonProgress = {
      chapter: String(entry.chapterId),
      lesson: `${entry.chapterId}-${entry.lessonId}`,
      lessonIpa: entry.letter ? `/${entry.letter.toLowerCase()}/` : '',
      lessonDisplayName: entry.lessonTitle,
      totalWords: entry.words.length,
      masteredWords,
      missedWords,
      untriedWords,
       // aggregated numeric counts
      attempted: entry.totalAttempted,
      correct: entry.totalCorrect,
      latestAccuracy: entry.latestAccuracy,
      sessionCount: entry.sessionCount,
      lastPlayedDate: entry.lastDisplayDate ?? '',
    };

    const chapterId = entry.chapterId;
    if (!chapterMap.has(chapterId)) {
      chapterMap.set(chapterId, { chapterId, chapterTitle: entry.chapterTitle, lessons: [] });
    }
    chapterMap.get(chapterId)!.lessons.push(lesson);
  }

  // Include every chapter/lesson from the curriculum JSON that had no sessions.
  // Without this, chapters the student has never attempted are invisible in the UI.
  for (const [metaKey, meta] of lessonMeta.entries()) {
    if (agg.has(metaKey)) continue;

    const untriedLesson: WordLessonProgress = {
      chapter: String(meta.chapterId),
      lesson: `${meta.chapterId}-${meta.lessonId}`,
      lessonIpa: meta.letter ? `/${meta.letter.toLowerCase()}/` : '',
      lessonDisplayName: meta.lessonTitle,
      totalWords: meta.words.length,
      masteredWords: [],
      missedWords: [],
      untriedWords: [...meta.words],
      attempted: 0,
      correct: 0,
      latestAccuracy: null,
      sessionCount: 0,
      lastPlayedDate: '',
    };

    if (!chapterMap.has(meta.chapterId)) {
      chapterMap.set(meta.chapterId, {
        chapterId: meta.chapterId,
        chapterTitle: meta.chapterTitle,
        lessons: [],
      });
    }
    chapterMap.get(meta.chapterId)!.lessons.push(untriedLesson);
  }

  return Array.from(chapterMap.values())
    .map(({ chapterId, chapterTitle, lessons }) => {
      lessons.sort((a, b) => {
        const aId = Number(a.lesson.split('-')[1] ?? 0);
        const bId = Number(b.lesson.split('-')[1] ?? 0);
        return aId - bId;
      });

      const totalWords = lessons.reduce((s, l) => s + l.totalWords, 0);
      const masteredWords = lessons.reduce(
        (s, l) => s + l.masteredWords.length,
        0,
      );
      const completedLessons = lessons.filter(l => {
        return l.totalWords > 0 && l.masteredWords.length >= l.totalWords;
      }).length;

      // chapter accuracy weighted by attempts across its lessons
      const chapterAttempted = lessons.reduce((s, l) => s + l.attempted, 0);
      const chapterCorrect = lessons.reduce((s, l) => s + l.correct, 0);
      const overallAccuracy =
        chapterAttempted > 0
          ? Math.round((chapterCorrect / chapterAttempted) * 100)
          : null;

      return {
        chapter: String(chapterId),
        chapterTitle,
        lessons,
        totalWords,
        masteredWords,
        completedLessons,
        overallAccuracy,
      };
    })
    .sort((a, b) => Number(a.chapter) - Number(b.chapter));
}
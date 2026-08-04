/**
 * StudentCompletionProgress.tsx
 *
 * Displays curriculum completion progress for Alphabet and Word categories.
 * - Alphabet: simple 26-letter progress bar
 * - Words: chapter → lesson breakdown with collapsible sections and lesson-level bars
 *
 * Data sources:
 *   - readingMaterialData (JSON) → total curriculum items
 *   - useStudentCompletedAlphabet / useStudentCompletedWord (hooks) → student completions
 *
 * Optimizations:
 *   - All progress calculations are memoized
 *   - Only expanded chapter lessons are rendered
 *   - Completed items are normalized to Set<string> for O(1) lookup
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { /* useStudentCompletedAlphabet, */ useStudentCompletedWord } from '../../../Hooks/Student/use_StudentCompletedReading';
import readingMaterialData from '../../../../assets/ReadingMaterial/ReadingMaterial_new.json';
import { sw, sh, sf } from '../../../Utils/responsive';
import { Icon } from '../../GlobalUse/Icon';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#ECFBFF',
  primary: '#3B7FC9',
  primaryLight: '#D7E9FF',
  tabBg: '#c0e8f2',
  card: '#FFFFFF',
  ink: '#1F2937',
  inkLight: '#6B7280',
  slate: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#F3F8FF',
  green: '#2CA96A',
  greenBg: '#D4F1E8',
  greenLight: '#ECFDF5',
  amber: '#F59E0B',
  amberBg: '#FEF3C7',
  coral: '#EF4444',
  coralBg: '#FEE2E2',
  track: '#EEF2FF',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  studentId: string;
}

interface LessonDef {
  lesson_id: number;
  title: string;
  words: string[];
}

interface ChapterDef {
  chapter_id: number;
  title: string;
  lessons: LessonDef[];
}

interface LessonProgress {
  lessonId: number;
  title: string;
  totalWords: number;
  completedWords: number;
  pct: number;
}

interface ChapterProgress {
  chapterId: number;
  title: string;
  totalWords: number;
  completedWords: number;
  pct: number;
  lessons: LessonProgress[];
}

// ─── Data extraction ──────────────────────────────────────────────────────────
// const ALPHABET_TOTAL = 26;
const WORD_CHAPTERS: ChapterDef[] =
  (readingMaterialData as any).Words?.[0]?.chapters ?? [];

// ─── Component ────────────────────────────────────────────────────────────────
const StudentCompletionProgress: React.FC<Props> = ({ studentId }) => {
  // const completedAlphabets = useStudentCompletedAlphabet(studentId);
  const completedWords = useStudentCompletedWord(studentId);

  // Loading state: hooks return empty arrays while loading, but we can
  // treat this as data-ready since the hooks set up real-time listeners
  const isReady = true; // hooks provide real-time data with initial empty arrays

  // ── Alphabet progress ─────────────────────────────────────────────────────
  // const alphabetProgress = useMemo(() => {
  //   const completedSet = new Set(
  //     completedAlphabets.map(a => a.letter?.toUpperCase()),
  //   );
  //   const completed = completedSet.size;
  //   const pct = ALPHABET_TOTAL > 0 ? (completed / ALPHABET_TOTAL) * 100 : 0;
  //   return { completed, total: ALPHABET_TOTAL, pct };
  // }, [completedAlphabets]);

  // ── Word progress — O(1) lookup set ───────────────────────────────────────
  const completedWordSet = useMemo(() => {
    return new Set(completedWords.map(w => w.word?.trim().toLowerCase()));
  }, [completedWords]);

  // ── Chapter/Lesson progress — memoized ────────────────────────────────────
  const chapterProgressList: ChapterProgress[] = useMemo(() => {
    return WORD_CHAPTERS.map(ch => {
      const lessons: LessonProgress[] = ch.lessons.map(ls => {
        const totalWords = ls.words?.length ?? 0;
        const completedCount = ls.words?.filter(
          w => completedWordSet.has(w.trim().toLowerCase()),
        ).length ?? 0;
        return {
          lessonId: ls.lesson_id,
          title: ls.title,
          totalWords,
          completedWords: completedCount,
          pct: totalWords > 0 ? (completedCount / totalWords) * 100 : 0,
        };
      });

      const totalWords = lessons.reduce((s, l) => s + l.totalWords, 0);
      const completedCount = lessons.reduce((s, l) => s + l.completedWords, 0);

      return {
        chapterId: ch.chapter_id,
        title: ch.title,
        totalWords,
        completedWords: completedCount,
        pct: totalWords > 0 ? (completedCount / totalWords) * 100 : 0,
        lessons,
      };
    });
  }, [completedWordSet]);

  // ── Overall word stats ────────────────────────────────────────────────────
  const wordOverall = useMemo(() => {
    const total = chapterProgressList.reduce((s, ch) => s + ch.totalWords, 0);
    const completed = chapterProgressList.reduce((s, ch) => s + ch.completedWords, 0);
    return {
      total,
      completed,
      pct: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [chapterProgressList]);

  // ── Expanded chapters state ───────────────────────────────────────────────
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(chapterId) ? next.delete(chapterId) : next.add(chapterId);
      return next;
    });
  };

  // ── Helper: status badge ──────────────────────────────────────────────────
  const getStatusConfig = (pct: number) => {
    if (pct >= 100) return { label: 'Complete', color: C.green, bg: C.greenLight };
    if (pct >= 50) return { label: 'In Progress', color: C.amber, bg: C.amberBg };
    if (pct > 0) return { label: 'Started', color: C.coral, bg: C.coralBg };
    return { label: 'Not Started', color: C.slate, bg: C.track };
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View>
      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1: ALPHABET COMPLETION
      ════════════════════════════════════════════════════════════════════ */}
      {/* <View style={S.sectionCard}>
        <View style={S.sectionHeader}>
          <Icon name="alphabet" size={sf(24)} color={C.primary} filled />
          <View style={{ flex: 1 }}>
            <Text style={S.sectionTitle}>Alphabet Completed</Text>
            <Text style={S.sectionSubtitle}>
              {alphabetProgress.completed} of {alphabetProgress.total} letters mastered
            </Text>
          </View>
          <View style={[S.pctBadge, { backgroundColor: getStatusConfig(alphabetProgress.pct).bg }]}>
            <Text style={[S.pctBadgeText, { color: getStatusConfig(alphabetProgress.pct).color }]}>
              {alphabetProgress.pct.toFixed(0)}%
            </Text>
          </View>
        </View>

        Progress bar
        <View style={S.progressTrack}>
          <View
            style={[
              S.progressFill,
              {
                width: `${Math.min(alphabetProgress.pct, 100)}%` as any,
                backgroundColor: getStatusConfig(alphabetProgress.pct).color,
              },
            ]}
          />
        </View>

        Letter grid
        <View style={S.letterGrid}>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
            const done = completedAlphabets.some(
              a => a.letter?.toUpperCase() === letter,
            );
            return (
              <View
                key={letter}
                style={[
                  S.letterCell,
                  done ? S.letterCellDone : S.letterCellPending,
                ]}
              >
                <Text
                  style={[
                    S.letterCellText,
                    done ? S.letterCellTextDone : S.letterCellTextPending,
                  ]}
                >
                  {letter}
                </Text>
              </View>
            );
          })}
        </View>
      </View> */}

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2: WORD COMPLETION BY CHAPTER
      ════════════════════════════════════════════════════════════════════ */}
      <View style={S.sectionCard}>
        <View style={S.sectionHeader}>
          <Icon name="bookOpen" size={sf(24)} color={C.primary} filled />
          <View style={{ flex: 1 }}>
            <Text style={S.sectionTitle}>Words Completed</Text>
            <Text style={S.sectionSubtitle}>
              {wordOverall.completed} of {wordOverall.total} words mastered
            </Text>
          </View>
          <View style={[S.pctBadge, { backgroundColor: getStatusConfig(wordOverall.pct).bg }]}>
            <Text style={[S.pctBadgeText, { color: getStatusConfig(wordOverall.pct).color }]}>
              {wordOverall.pct.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Overall progress bar */}
        <View style={S.progressTrack}>
          <View
            style={[
              S.progressFill,
              {
                width: `${Math.min(wordOverall.pct, 100)}%` as any,
                backgroundColor: getStatusConfig(wordOverall.pct).color,
              },
            ]}
          />
        </View>

        {/* Chapter cards */}
        {chapterProgressList.map(chapter => {
          const isExpanded = expandedChapters.has(chapter.chapterId);
          const statusCfg = getStatusConfig(chapter.pct);
          const completedLessons = chapter.lessons.filter(l => l.pct >= 100).length;

          return (
            <View key={chapter.chapterId} style={S.chapterCard}>
              {/* Chapter header (tappable) */}
              <TouchableOpacity
                style={S.chapterHeader}
                onPress={() => toggleChapter(chapter.chapterId)}
                activeOpacity={0.7}
              >
                <View style={S.chapterHeaderLeft}>
                  <Text style={S.chapterTitle} numberOfLines={2}>
                    {chapter.title}
                  </Text>
                  <Text style={S.chapterMeta}>
                    {completedLessons}/{chapter.lessons.length} lessons · {chapter.completedWords}/{chapter.totalWords} words
                  </Text>
                </View>

                <View style={S.chapterHeaderRight}>
                  <View style={[S.chapterPctPill, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[S.chapterPctText, { color: statusCfg.color }]}>
                      {chapter.pct.toFixed(0)}%
                    </Text>
                  </View>
                  <Text style={S.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {/* Chapter-level mini bar */}
              <View style={S.chapterBarTrack}>
                <View
                  style={[
                    S.chapterBarFill,
                    {
                      width: `${Math.min(chapter.pct, 100)}%` as any,
                      backgroundColor: statusCfg.color,
                    },
                  ]}
                />
              </View>

              {/* Expanded: lessons list */}
              {isExpanded && (
                <View style={S.lessonsContainer}>
                  {chapter.lessons.map((lesson, idx) => {
                    const lsCfg = getStatusConfig(lesson.pct);
                    const isLast = idx === chapter.lessons.length - 1;
                    return (
                      <View
                        key={lesson.lessonId}
                        style={[S.lessonRow, isLast && S.lessonRowLast]}
                      >
                        {/* Status dot */}
                        <View style={[S.lessonDot, { backgroundColor: lsCfg.color }]} />

                        {/* Lesson info + bar */}
                        <View style={S.lessonContent}>
                          <View style={S.lessonLabelRow}>
                            <Text style={S.lessonTitle} numberOfLines={1}>
                              {lesson.title}
                            </Text>
                            <Text style={[S.lessonCount, { color: lsCfg.color }]}>
                              {lesson.completedWords}/{lesson.totalWords}
                            </Text>
                          </View>

                          {/* Lesson bar */}
                          <View style={S.lessonBarTrack}>
                            <View
                              style={[
                                S.lessonBarFill,
                                {
                                  width: `${Math.min(lesson.pct, 100)}%` as any,
                                  backgroundColor: lsCfg.color,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Section card
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: sw(16),
    padding: sw(16),
    borderWidth: 1,
    borderColor: C.primaryLight,
    marginBottom: sh(14),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(12),
    gap: sw(10),
  },
  sectionIcon: {
    fontSize: sf(22),
  },
  sectionTitle: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },
  sectionSubtitle: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    marginTop: sh(2),
  },

  // Pct badge
  pctBadge: {
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: sw(20),
  },
  pctBadgeText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
  },

  // Main progress bar
  progressTrack: {
    height: sw(10),
    backgroundColor: C.track,
    borderRadius: sw(5),
    overflow: 'hidden',
    marginBottom: sh(14),
  },
  progressFill: {
    height: '100%',
    borderRadius: sw(5),
  },

  // Letter grid (alphabet)
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(6),
    justifyContent: 'center',
  },
  letterCell: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterCellDone: {
    backgroundColor: C.greenLight,
    borderWidth: 1,
    borderColor: C.green,
  },
  letterCellPending: {
    backgroundColor: C.track,
    borderWidth: 1,
    borderColor: C.border,
  },
  letterCellText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
  },
  letterCellTextDone: {
    color: C.green,
  },
  letterCellTextPending: {
    color: C.slate,
  },

  // Chapter card
  chapterCard: {
    backgroundColor: C.inputBg,
    borderRadius: sw(12),
    padding: sw(12),
    marginBottom: sh(8),
    borderWidth: 1,
    borderColor: C.border,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterHeaderLeft: {
    flex: 1,
    marginRight: sw(10),
  },
  chapterTitle: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },
  chapterMeta: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    marginTop: sh(2),
  },
  chapterHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(8),
  },
  chapterPctPill: {
    paddingHorizontal: sw(8),
    paddingVertical: sh(3),
    borderRadius: sw(12),
  },
  chapterPctText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
  },
  expandArrow: {
    fontSize: sf(11),
    color: C.slate,
  },

  // Chapter-level mini bar
  chapterBarTrack: {
    height: sw(6),
    backgroundColor: C.track,
    borderRadius: sw(3),
    overflow: 'hidden',
    marginTop: sh(10),
  },
  chapterBarFill: {
    height: '100%',
    borderRadius: sw(3),
  },

  // Lessons container
  lessonsContainer: {
    marginTop: sh(12),
    paddingTop: sh(10),
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  // Lesson row
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: sh(10),
    marginBottom: sh(8),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: sw(10),
  },
  lessonRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  lessonDot: {
    width: sw(8),
    height: sw(8),
    borderRadius: sw(4),
    marginTop: sh(5),
  },
  lessonContent: {
    flex: 1,
  },
  lessonLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(6),
  },
  lessonTitle: {
    flex: 1,
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.ink,
    marginRight: sw(8),
  },
  lessonCount: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
  },
  lessonBarTrack: {
    height: sw(6),
    backgroundColor: C.track,
    borderRadius: sw(3),
    overflow: 'hidden',
  },
  lessonBarFill: {
    height: '100%',
    borderRadius: sw(3),
  },
});

export default StudentCompletionProgress;

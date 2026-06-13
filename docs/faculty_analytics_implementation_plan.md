# Faculty Dashboard — New Analytics Implementation Plan

---

## Critical note before you start: studentId resolution

`miscueReports` does **not** store `classId` or `acadYear` (commented-out in the
interface as a future field). Every faculty-level query therefore follows this
two-step pattern:

1. **Resolve studentIds** — read the `ClassDocument` (or `ClassDocuments` for
   "overall") to get the `studentIds[]` for the selected scope.
2. **Batch query** — Firestore `in` is capped at **30 items per query**. Split
   `studentIds` into chunks of 30 and run parallel `getDocs` calls, then merge
   the results in JS.

This pattern is shared by all five features below. Extract it into a reusable
utility:

```ts
// Utils/batchInQuery.ts
import {
  getFirestore, collection, query, where, getDocs,
} from '@react-native-firebase/firestore';

export async function batchGetDocsByStudentIds(
  collectionName: string,
  studentIds: string[],
  extraConstraints: any[] = [],
): Promise<any[]> {
  if (studentIds.length === 0) return [];
  const db = getFirestore();
  const CHUNK = 30;
  const chunks: string[][] = [];
  for (let i = 0; i < studentIds.length; i += CHUNK) {
    chunks.push(studentIds.slice(i, i + CHUNK));
  }

  const results = await Promise.all(
    chunks.map(chunk =>
      getDocs(
        query(
          collection(db, collectionName),
          where('studentId', 'in', chunk),
          ...extraConstraints,
        ),
      ),
    ),
  );

  return results.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() })));
}
```

---

## Feature 1 — Passage Difficulty Ranking

### Purpose
Rank all passages by **average class accuracy** (lowest → highest). A passage
that consistently produces low accuracy across many students is either too hard
for this cohort or requires explicit preparation before assignment.

### Data source
`miscueReports` — fields: `passageTitle`, `accuracyRate`, `studentId`,
`createdAt`, `totalWords`, `substitutionCount + omissionCount +
insertionCount + repetitionCount`.

### Firestore query plan

```
Collection: miscueReports
Filter:  studentId in [classStudentIds]           ← batched, 30/chunk
Filter:  createdAt >= acadYearStart
Filter:  createdAt <= acadYearEnd
Fields:  passageTitle, accuracyRate, studentId, totalWords,
         substitutionCount, omissionCount, insertionCount, repetitionCount
```

> **Required composite index:**
> `miscueReports` — `studentId ASC, createdAt ASC`
> (Firestore will prompt for this on first run)

### Aggregation (client-side)

Group fetched docs by `passageTitle`. For each passage compute:
- `attempts` — total docs for this title
- `uniqueStudents` — distinct `studentId` values
- `avgAccuracy` — `sum(accuracyRate) / attempts`
- `avgTotalMiscues` — `sum(sub + omission + insertion + repetition) / attempts`

Sort ascending by `avgAccuracy` so the hardest passage appears first.

### Hook to create

**File:** `Hooks/Faculty/usePassageDifficultyRanking.ts`

```ts
import { useEffect, useState, useMemo } from 'react';
import { getFirestore, collection, query, where, getDocs, Timestamp }
  from '@react-native-firebase/firestore';
import { FilterOptions } from '../../Interfaces/miscue';
import { resolveDateRange } from '../../Utilities/activityGroupingDate';
import { batchGetDocsByStudentIds } from '../../Utils/batchInQuery';

export interface PassageDifficultyRow {
  title: string;
  attempts: number;
  uniqueStudents: number;
  avgAccuracy: number;        // 0–100
  avgTotalMiscues: number;    // per-attempt average
  difficultyLevel: 'hard' | 'moderate' | 'easy'; // <70 / 70–84 / ≥85
}

export function usePassageDifficultyRanking(
  studentIds: string[],
  filter: FilterOptions,
) {
  const [rows, setRows] = useState<PassageDifficultyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentIds.length === 0) { setRows([]); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const range = resolveDateRange(filter);

        const constraints: any[] = [];
        if (range) {
          constraints.push(where('createdAt', '>=', Timestamp.fromDate(range.start)));
          constraints.push(where('createdAt', '<=', Timestamp.fromDate(range.end)));
        }

        const docs = await batchGetDocsByStudentIds(
          'miscueReports', studentIds, constraints,
        );

        // Group by passageTitle
        const map = new Map<string, {
          accuracySum: number;
          miscueSum: number;
          count: number;
          studentSet: Set<string>;
        }>();

        for (const d of docs) {
          const title = String(d.passageTitle ?? '');
          if (!title) continue;

          const entry = map.get(title) ?? {
            accuracySum: 0, miscueSum: 0, count: 0, studentSet: new Set(),
          };

          entry.accuracySum += Number(d.accuracyRate ?? 0);
          entry.miscueSum += (
            Number(d.substitutionCount ?? 0) +
            Number(d.omissionCount ?? 0) +
            Number(d.insertionCount ?? 0) +
            Number(d.repetitionCount ?? 0)
          );
          entry.count += 1;
          entry.studentSet.add(String(d.studentId));
          map.set(title, entry);
        }

        const result: PassageDifficultyRow[] = Array.from(map.entries()).map(
          ([title, v]) => {
            const avgAccuracy = Math.round(v.accuracySum / v.count);
            return {
              title,
              attempts: v.count,
              uniqueStudents: v.studentSet.size,
              avgAccuracy,
              avgTotalMiscues: Math.round(v.miscueSum / v.count),
              difficultyLevel:
                avgAccuracy < 70 ? 'hard'
                : avgAccuracy < 85 ? 'moderate'
                : 'easy',
            };
          },
        );

        // Sort hardest first
        result.sort((a, b) => a.avgAccuracy - b.avgAccuracy);

        if (!cancelled) { setRows(result); setLoading(false); }
      } catch (e: any) {
        if (!cancelled) { setError(e.message ?? 'Failed'); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [JSON.stringify(studentIds), filter.acadYear, filter.classId]);

  return { rows, loading, error };
}
```

### UI component

**File:** `Components/Faculty/PassageDifficultyRanking.tsx`

**Layout (top to bottom):**

```
┌─────────────────────────────────────────────┐
│  SECTION HEADER                             │
│  "Passage Difficulty Ranking"               │
│  "3 passages below 70% — review required"  │  ← dynamic warning count
├──────┬──────────────────────┬───────┬───────┤
│  #   │  Passage Title       │  Avg  │  Tag  │
├──────┼──────────────────────┼───────┼───────┤
│  1   │  "The Brave Turtle"  │  63%  │ HARD  │  ← coral bar + chip
│  2   │  "A Rainy Day"       │  74%  │ MOD   │  ← amber
│  3   │  "My Dog Rex"        │  91%  │ EASY  │  ← green
└──────┴──────────────────────┴───────┴───────┘
```

**Per-row detail (expandable):**
When a row is tapped, expand inline to show:
- Horizontal accuracy bar (colored by difficulty level)
- `N attempts · N students · N avg miscues`
- Difficulty chip: `HARD` (coral) / `MOD` (amber) / `EASY` (green)

**Colors:** Use `FacultyColors` from `Theme.ts`.
- Hard: `FacultyColors.red` / `#FEE2E2` bg
- Moderate: `FacultyColors.orange` / `#FEF3C7` bg
- Easy: `FacultyColors.primary` / `FacultyColors.bg` bg

**Font:** Satoshi throughout. Title in `Satoshi-Bold`, values in `Satoshi-Black`.

**Empty state:** "No passage data available for this period." with a book icon.

---

## Feature 2 — Class-wide Problem Words Heatmap (enhancement of existing)

### What exists vs what's missing

`MiscueChart.tsx` **Section 4 "Most Common Miscue Words"** already shows the
top miscued words with error count and dominant type per word. The gap is:
- It currently shows `errorCount` (total miscue events), not how many **distinct
  students** made that error.
- A word miscued 20 times by 1 student is very different from a word miscued
  20 times by 14 different students. Only the latter warrants whole-class
  instruction.

### No new hook needed for the fetch — only the aggregation changes

In the existing `useTopMiscueIdentifier` hook (or wherever `commonMiscueWords`
is built), add a `studentCount` field. The fetch already retrieves the full
`miscues[]` arrays from reports. The change is purely in the aggregation
function:

```ts
// In your aggregation logic for commonMiscueWords:

// Old:
wordMap.set(word, { count: wordMap.get(word)?.count + 1, ... });

// New — also track unique studentIds:
const entry = wordMap.get(word) ?? {
  errorCount: 0,
  studentIds: new Set<string>(),
  miscueTypes: {} as Record<string, number>,
  errorExample: '',
};
entry.errorCount += 1;
entry.studentIds.add(report.studentId);  // ← add this line
wordMap.set(word, entry);

// When serializing to output:
return {
  word,
  errorCount: entry.errorCount,
  studentCount: entry.studentIds.size,   // ← new field
  dominantMiscueType: ...,
  errorExample: ...,
};
```

**Update the interface in `miscue.ts`:**
```ts
// In OverAllStudentTopMiscue.commonMiscueWords:
commonMiscueWords: Array<{
  word: string;
  errorExample: string;
  errorCount: number;
  studentCount: number;        // ← ADD THIS
  dominantMiscueType?: string;
  miscueTypes?: Record<string, number>;
}>;
```

### UI change in `MiscueChart.tsx` — Section 4

Replace the current word row layout with a two-line layout that surfaces
`studentCount` prominently:

**Current layout (single line):**
```
[rank]  "word"   [badge: SubstitutionType]   ×14
```

**New layout (two lines, same card width):**
```
[rank]  "word"                              ×14 errors
        [badge: Substitution]   👥 9 students
```

The `👥 N students` line is the critical addition. Color-code it:
- `> 50%` of class → `FacultyColors.red` with bg highlight (urgent)
- `25–50%` of class → `FacultyColors.orange`
- `< 25%` of class → `FacultyColors.inkLight` (informational)

To compute the threshold you need `totalStudentsInClass` passed as a prop:

```tsx
// MiscueChart.tsx — add to props:
interface MiscueAnalyticsProps {
  // ...existing...
  totalStudentsInClass?: number;   // ← new optional prop
}

// In word row render:
const studentPct = totalStudentsInClass
  ? item.studentCount / totalStudentsInClass
  : null;

const studentColor =
  studentPct === null ? C.inkLight
  : studentPct > 0.5 ? C.coral
  : studentPct > 0.25 ? C.omission  // amber
  : C.inkLight;
```

**Updated word row JSX (Section 4):**
```tsx
<View key={index} style={[S.wordRow, index === words.length - 1 && S.wordRowLast]}>
  <View style={S.wordRank}>
    <Text style={S.wordRankText}>{index + 1}</Text>
  </View>
  <View style={S.wordInfo}>
    <Text style={S.wordText}>"{item.word}"</Text>
    <View style={S.wordMetaRow}>
      <View style={[S.wordBadge, { backgroundColor: colors.bg }]}>
        <Text style={[S.wordBadgeText, { color: colors.bar }]}>
          {item.dominantMiscueType || 'N/A'}
        </Text>
      </View>
      {/* ── NEW: student count chip ── */}
      <View style={[S.studentCountChip, { backgroundColor: studentBg }]}>
        <Text style={[S.studentCountText, { color: studentColor }]}>
          👥 {item.studentCount} student{item.studentCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  </View>
  <Text style={S.wordCount}>×{item.errorCount}</Text>
</View>
```

**New styles to add to `S`:**
```ts
wordMetaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: sw(6),
  flexWrap: 'wrap',
  marginTop: sh(3),
},
studentCountChip: {
  paddingHorizontal: sw(8),
  paddingVertical: sh(2),
  borderRadius: sw(8),
},
studentCountText: {
  fontSize: sf(10),
  fontFamily: 'Nunito-Bold',
},
```

---

## Feature 3 — Class Participation Rate

### Purpose
Replace `ActiveHoursChart`. Answer: **"Did my students read this week?"** — not
how many total hours, but how many individual students completed at least one
session. Show week-over-week change so the teacher sees momentum, not just a
snapshot.

### Data source
`miscueReports` — fields: `studentId`, `createdAt`.

One document per passage reading session. One unique `studentId` in a given
week's docs = one participating student. No need for WPM or accuracy fields.

### Firestore query plan

Fetch two consecutive week windows in one hook:

```
thisWeek:  createdAt >= thisMonday 00:00  AND  createdAt <= thisSunday 23:59
lastWeek:  createdAt >= lastMonday 00:00  AND  createdAt <= lastSunday 23:59
Filter:    studentId in [classStudentIds]   ← batched
Fields:    studentId only (minimize read cost)
```

> **Optimization note:** You only need `studentId` and `createdAt` for this
> query. Firestore charges per document read regardless of field count, but
> keeping the intent explicit in comments avoids confusion for future developers.

### Hook to create

**File:** `Hooks/Faculty/useClassParticipationRate.ts`

```ts
import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, Timestamp }
  from '@react-native-firebase/firestore';
import { batchGetDocsByStudentIds } from '../../Utils/batchInQuery';

export interface ParticipationRateData {
  thisWeek: {
    participatingStudents: number;
    totalStudents: number;
    rate: number;                  // 0–100 percentage
    weekLabel: string;             // e.g. "May 5 – May 11"
  };
  lastWeek: {
    participatingStudents: number;
    totalStudents: number;
    rate: number;
    weekLabel: string;
  };
  change: number;                  // thisWeek.rate - lastWeek.rate (can be negative)
  trend: 'up' | 'down' | 'same';
}

function getMondayOfWeek(offset: number = 0): Date {
  const now = new Date();
  const day = now.getDay();                        // 0=Sun
  const daysSinceMon = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMon + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getSundayOfWeek(offset: number = 0): Date {
  const monday = getMondayOfWeek(offset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

function formatWeekLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function useClassParticipationRate(
  studentIds: string[],
  totalStudents: number,
) {
  const [data, setData] = useState<ParticipationRateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentIds.length === 0 || totalStudents === 0) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const thisStart = getMondayOfWeek(0);
        const thisEnd   = getSundayOfWeek(0);
        const lastStart = getMondayOfWeek(-1);
        const lastEnd   = getSundayOfWeek(-1);

        const [thisWeekDocs, lastWeekDocs] = await Promise.all([
          batchGetDocsByStudentIds('miscueReports', studentIds, [
            where('createdAt', '>=', Timestamp.fromDate(thisStart)),
            where('createdAt', '<=', Timestamp.fromDate(thisEnd)),
          ]),
          batchGetDocsByStudentIds('miscueReports', studentIds, [
            where('createdAt', '>=', Timestamp.fromDate(lastStart)),
            where('createdAt', '<=', Timestamp.fromDate(lastEnd)),
          ]),
        ]);

        const thisParticipants = new Set(thisWeekDocs.map(d => d.studentId)).size;
        const lastParticipants = new Set(lastWeekDocs.map(d => d.studentId)).size;

        const thisRate = Math.round((thisParticipants / totalStudents) * 100);
        const lastRate = Math.round((lastParticipants / totalStudents) * 100);
        const change = thisRate - lastRate;

        if (!cancelled) {
          setData({
            thisWeek: {
              participatingStudents: thisParticipants,
              totalStudents,
              rate: thisRate,
              weekLabel: formatWeekLabel(thisStart, thisEnd),
            },
            lastWeek: {
              participatingStudents: lastParticipants,
              totalStudents,
              rate: lastRate,
              weekLabel: formatWeekLabel(lastStart, lastEnd),
            },
            change,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
          });
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) { setError(e.message ?? 'Failed'); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [JSON.stringify(studentIds), totalStudents]);

  return { data, loading, error };
}
```

### UI component

**File:** `Components/Faculty/ClassParticipationRate.tsx`

**Layout:**

```
┌──────────────────────────────────────────────┐
│  CLASS PARTICIPATION                         │
│  May 5 – May 11                              │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │                                     │     │
│  │           72%              ▼ 16%   │     │  ← large % + trend badge
│  │   18 of 25 students                 │     │
│  │   read at least once this week      │     │
│  │                                     │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  LAST WEEK ─────────────────────────────     │
│  88% · 22 of 25 students                    │
│  May 28 – Jun 1                             │
└──────────────────────────────────────────────┘
```

**Specifics:**
- Large `72%` in `Satoshi-Black` at `sf(42)`, colored by threshold:
  - ≥ 80%: `FacultyColors.primary` (green)
  - 60–79%: `FacultyColors.orange`
  - < 60%: `FacultyColors.red`
- Trend badge next to the large number:
  - `▲ +16%` in green pill or `▼ −16%` in red pill
  - `→ No change` in gray pill
- Sub-label: `"N of N students read at least once this week"`
- Separator line then "LAST WEEK" section in muted smaller text
- `FacultyColors.bg` card background with `FacultyColors.primary` left border
  accent (4px)

---

## Feature 4 — Monthly Reading Activity Calendar Heatmap

### Purpose
Show a full month calendar where each day cell is shaded by the number of
student reading sessions recorded on that day. Reveals behavioral patterns
(weekend drop-off, post-test slumps, clustering at end of week) that a bar
chart cannot.

### Data source
`miscueReports` — fields: `studentId`, `createdAt`.

Count documents per calendar day for the selected month. One document = one
session. `createdAt` is a Firestore `Timestamp`, converted to local date.

### Firestore query plan

```
Collection: miscueReports
Filter:  studentId in [classStudentIds]          ← batched
Filter:  createdAt >= firstDayOfSelectedMonth
Filter:  createdAt <= lastDayOfSelectedMonth
Fields:  createdAt (to determine the day bucket)
```

The hook receives a `selectedMonth: Date` parameter (defaults to current month).
Include a month navigator (+/− month) in the UI.

> **Required composite index:**
> `miscueReports` — `studentId ASC, createdAt ASC`
> (same index as Feature 1 — no additional cost)

### Hook to create

**File:** `Hooks/Faculty/useReadingCalendarHeatmap.ts`

```ts
import { useEffect, useState } from 'react';
import { getFirestore, Timestamp } from '@react-native-firebase/firestore';
import { batchGetDocsByStudentIds } from '../../Utils/batchInQuery';
import { where } from '@react-native-firebase/firestore';

export interface CalendarDay {
  date: Date;
  dateKey: string;           // "YYYYMMDD"
  dayOfMonth: number;
  sessionCount: number;
  intensity: 0 | 1 | 2 | 3; // 0=none, 1=light(1-2), 2=medium(3-5), 3=high(6+)
  isWeekend: boolean;
  isFuture: boolean;
}

export interface CalendarHeatmapData {
  month: Date;
  monthLabel: string;        // "May 2026"
  weeks: CalendarDay[][];    // 4–6 rows of 7 days (Mon–Sun grid)
  totalSessions: number;
  activeDays: number;
  peakDay: CalendarDay | null;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export function useReadingCalendarHeatmap(
  studentIds: string[],
  selectedMonth: Date,
) {
  const [data, setData] = useState<CalendarHeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentIds.length === 0) { setData(null); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const year  = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();

        const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
        const lastDay  = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const docs = await batchGetDocsByStudentIds('miscueReports', studentIds, [
          where('createdAt', '>=', Timestamp.fromDate(firstDay)),
          where('createdAt', '<=', Timestamp.fromDate(lastDay)),
        ]);

        // Count sessions per day
        const countMap = new Map<string, number>();
        for (const d of docs) {
          try {
            const date: Date = d.createdAt?.toDate
              ? d.createdAt.toDate()
              : new Date(d.createdAt.seconds * 1000);
            const key = toDateKey(date);
            countMap.set(key, (countMap.get(key) ?? 0) + 1);
          } catch { /* skip malformed timestamps */ }
        }

        // Build calendar grid (Mon–Sun, ISO weeks)
        const today = new Date();
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6

        const allDays: CalendarDay[] = [];

        // Padding before first day
        for (let i = 0; i < firstDayOfWeek; i++) {
          const padDate = new Date(year, month, 1 - (firstDayOfWeek - i));
          allDays.push({
            date: padDate,
            dateKey: toDateKey(padDate),
            dayOfMonth: padDate.getDate(),
            sessionCount: 0,
            intensity: 0,
            isWeekend: [0, 6].includes(padDate.getDay()),
            isFuture: padDate > today,
          });
        }

        // Actual days of the month
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, month, d);
          const key  = toDateKey(date);
          const count = countMap.get(key) ?? 0;
          allDays.push({
            date,
            dateKey: key,
            dayOfMonth: d,
            sessionCount: count,
            intensity: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3,
            isWeekend: [0, 6].includes(date.getDay()),
            isFuture: date > today,
          });
        }

        // Pad to complete the last week
        while (allDays.length % 7 !== 0) {
          const padDate = new Date(
            year, month + 1, allDays.length - daysInMonth - firstDayOfWeek + 1,
          );
          allDays.push({
            date: padDate, dateKey: toDateKey(padDate),
            dayOfMonth: padDate.getDate(),
            sessionCount: 0, intensity: 0,
            isWeekend: [0, 6].includes(padDate.getDay()),
            isFuture: padDate > today,
          });
        }

        // Chunk into weeks
        const weeks: CalendarDay[][] = [];
        for (let i = 0; i < allDays.length; i += 7) {
          weeks.push(allDays.slice(i, i + 7));
        }

        const activeDays = Array.from(countMap.values()).filter(c => c > 0).length;
        const totalSessions = Array.from(countMap.values()).reduce((s, c) => s + c, 0);
        const peakEntry = Array.from(countMap.entries())
          .sort((a, b) => b[1] - a[1])[0];
        const peakDay = peakEntry
          ? allDays.find(d => d.dateKey === peakEntry[0]) ?? null
          : null;

        if (!cancelled) {
          setData({
            month: selectedMonth,
            monthLabel: selectedMonth.toLocaleDateString('en-US', {
              month: 'long', year: 'numeric',
            }),
            weeks,
            totalSessions,
            activeDays,
            peakDay,
          });
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) { setError(e.message ?? 'Failed'); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [JSON.stringify(studentIds), selectedMonth.getFullYear(), selectedMonth.getMonth()]);

  return { data, loading, error };
}
```

### UI component

**File:** `Components/Faculty/ReadingCalendarHeatmap.tsx`

**Layout:**

```
┌──────────────────────────────────────────────┐
│  READING ACTIVITY                            │
│  ← April 2026    May 2026    June 2026 →    │
│                                              │
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun          │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ░░  ░░           │
│  │  │ │▓▓│ │▓▓│ │░░│ │██│                   │
│  └──┘ └──┘ └──┘ └──┘ └──┘                   │
│  ...4–5 more rows...                        │
│                                              │
│  LEGEND:  □ No sessions  ▒ 1–2  ▓ 3–5  █ 6+│
│                                              │
│  24 active days · 187 total sessions        │
│  Peak: May 7 (14 sessions)                  │
└──────────────────────────────────────────────┘
```

**Cell design:**
- Cell size: `sw(38) × sw(38)`, `borderRadius: sw(8)`
- Intensity colors (use `FacultyColors`):
  - `0` (none): `#F3F4F6` (or weekend: `rgba(0,0,0,0.03)`)
  - `1` (1–2): `rgba(0, 132, 67, 0.25)` — FacultyColors.primary at 25% opacity
  - `2` (3–5): `rgba(0, 132, 67, 0.55)`
  - `3` (6+):  `FacultyColors.primary` solid
- Today's cell: `borderWidth: 2, borderColor: FacultyColors.primaryDark`
- Padding days (before/after month): opacity `0.3`, different shade
- Weekend cells: subtle gray tint to signal expected lower activity
- Day number text: `Satoshi-Medium`, `sf(11)`, white on intensity ≥ 2, dark on 0–1

**Month navigator:**
`←` / `→` arrows on either side of the month label. Limit navigation to within
the current academic year. Disable future months.

**Tap behavior:**
Tapping a day cell shows a `Tooltip` or bottom sheet: `"May 7 — 14 sessions by
N students"` — derive unique student count from the session docs for that day
(already fetched, no additional read needed).

---

## Feature 5 — Grade-level WPM Reference Bands

### Purpose
Context bands overlaid on the existing `AccuracyTrendsChart` WPM axis. Without
a reference, "82 WPM" is uninterpretable. With a band showing "Grade 2 expected:
89–124 WPM", the teacher immediately reads it as "below expected."

### No new Firebase query needed

This is entirely static data rendered on top of the existing `AccuracyTrendsChart`
component. No new hook, no new Firestore reads.

### Static constants file

**File:** `Constants/wpmBenchmarks.ts`

Based on DIBELS / ORF research norms (Hasbrouck & Tindal 2017):

```ts
// Words-per-minute oral reading fluency benchmarks
// Source: Hasbrouck & Tindal (2017) ORF norms
// Each grade has three benchmarks: fall, winter, spring (50th percentile)
// plus a min/max range spanning 25th–75th percentile

export interface WpmBenchmark {
  grade: number;
  label: string;               // "Grade 1", "Grade 2", "Grade 3"
  expectedMin: number;         // 25th percentile (developing)
  expectedMax: number;         // 75th percentile (fluent)
  targetWPM: number;           // 50th percentile (on-grade-level target)
}

export const WPM_BENCHMARKS: WpmBenchmark[] = [
  {
    grade: 1,
    label: 'Grade 1',
    expectedMin: 30,
    expectedMax: 82,
    targetWPM: 53,
  },
  {
    grade: 2,
    label: 'Grade 2',
    expectedMin: 72,
    expectedMax: 124,
    targetWPM: 89,
  },
  {
    grade: 3,
    label: 'Grade 3',
    expectedMin: 89,
    expectedMax: 142,
    targetWPM: 107,
  },
];

export function getBenchmarkForGrade(gradeLevel: number): WpmBenchmark | null {
  return WPM_BENCHMARKS.find(b => b.grade === gradeLevel) ?? null;
}

export function classifyWPM(
  wpm: number,
  grade: number,
): 'above' | 'on-track' | 'below' | 'unknown' {
  const benchmark = getBenchmarkForGrade(grade);
  if (!benchmark) return 'unknown';
  if (wpm >= benchmark.expectedMax) return 'above';
  if (wpm >= benchmark.expectedMin) return 'on-track';
  return 'below';
}
```

### Integration into AccuracyTrendsChart

The existing `AccuracyTrendsChart` renders a dual bar chart (Accuracy + WPM per
period). Add a **reference band** to the WPM bars. Two options depending on your
chart implementation:

**Option A — SVG reference line (if using react-native-svg for the chart):**

```tsx
// Inside your WPM chart SVG, after drawing bars:
import { getBenchmarkForGrade } from '../../Constants/wpmBenchmarks';

// Props addition
interface AccuracyTrendsChartProps {
  // ...existing...
  gradeLevel?: number;           // ← new optional prop
}

// Inside render, after computing bar scale:
const benchmark = gradeLevel ? getBenchmarkForGrade(gradeLevel) : null;

// Compute Y positions for the band lines
const minY = chartHeight - (benchmark.expectedMin / maxWPM) * chartHeight;
const maxY = chartHeight - (benchmark.expectedMax / maxWPM) * chartHeight;

// Render as SVG rectangle (semi-transparent green band)
{benchmark && (
  <>
    {/* Shaded band between expectedMin and expectedMax */}
    <Rect
      x={0}
      y={maxY}
      width={chartWidth}
      height={minY - maxY}
      fill="rgba(0, 132, 67, 0.08)"
    />
    {/* Target WPM dashed line */}
    <Line
      x1={0} y1={targetY}
      x2={chartWidth} y2={targetY}
      stroke={FacultyColors.primary}
      strokeWidth={1.5}
      strokeDasharray="4,4"
    />
    {/* Label */}
    <SvgText
      x={chartWidth - 4}
      y={targetY - 4}
      textAnchor="end"
      fontSize={8}
      fill={FacultyColors.primary}
    >
      Grade {gradeLevel} target ({benchmark.targetWPM} WPM)
    </SvgText>
  </>
)}
```

**Option B — View-based reference band (if using View bars, not SVG):**

Render an absolutely-positioned `View` band overlaid on the WPM bar area, using
percentage-based positioning from the chart's `maxWPM` scale:

```tsx
// Overlay absolutely positioned band over the WPM chart area
{benchmark && (
  <View
    pointerEvents="none"
    style={[
      StyleSheet.absoluteFillObject,
      {
        top: `${((maxWPM - benchmark.expectedMax) / maxWPM) * 100}%`,
        bottom: `${(benchmark.expectedMin / maxWPM) * 100}%`,
        backgroundColor: 'rgba(0, 132, 67, 0.08)',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: 'rgba(0, 132, 67, 0.3)',
        borderBottomColor: 'rgba(0, 132, 67, 0.3)',
        borderStyle: 'dashed',
      },
    ]}
  />
)}
```

### Additional UI: benchmark summary chip

Add a small chip **below** the WPM chart displaying the class verdict:

```tsx
// After AccuracyTrendsChart, when gradeLevel and avgWPM are available:
const verdict = classifyWPM(avgWPM, gradeLevel);

const chipConfig = {
  'above':    { label: `↑ Above Grade ${gradeLevel} norm`, color: FacultyColors.primary },
  'on-track': { label: `✓ On track for Grade ${gradeLevel}`, color: FacultyColors.teal },
  'below':    { label: `↓ Below Grade ${gradeLevel} norm`, color: FacultyColors.red },
  'unknown':  { label: 'Grade benchmark unavailable', color: FacultyColors.inkLight },
};

<View style={[S.benchmarkChip, { backgroundColor: chipConfig[verdict].color + '18' }]}>
  <View style={[S.benchmarkDot, { backgroundColor: chipConfig[verdict].color }]} />
  <Text style={[S.benchmarkText, { color: chipConfig[verdict].color }]}>
    {chipConfig[verdict].label} · Expected {benchmark.expectedMin}–{benchmark.expectedMax} WPM
  </Text>
</View>
```

**Chip styles:**
```ts
benchmarkChip: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: sw(6),
  paddingHorizontal: sw(12),
  paddingVertical: sh(6),
  borderRadius: sw(999),
  alignSelf: 'flex-start',
  marginTop: sh(8),
},
benchmarkDot: {
  width: sw(7),
  height: sw(7),
  borderRadius: sw(99),
},
benchmarkText: {
  fontFamily: 'Satoshi-Bold',
  fontSize: sf(11),
},
```

### Resolving gradeLevel for the AccuracyTrendsChart

When a specific class is selected, use `ClassDocument.gradeLevel` (already
available wherever you resolve the filter). When "All Classes" (overall view)
is selected, either:
- Show a grade-level picker (small dropdown: Grade 1 / 2 / 3) next to the chart
- Or hide the benchmark band with a note: "Select a specific class to see
  grade-level benchmarks"

The second option is cleaner because averaging WPM across mixed grades is
already a misleading number (as noted in the earlier analysis).

---

## Firestore indexes required (summary)

| Collection      | Fields indexed                           | Used by features     |
|-----------------|------------------------------------------|----------------------|
| miscueReports   | `studentId ASC` + `createdAt ASC`        | 1, 3, 4              |
| alphabetSessions| `studentId ASC` + `dateKey ASC`          | already exists       |
| wordSessions    | `studentId ASC` + `dateKey ASC`          | already exists       |

Feature 2 uses the same query as the existing `useMiscueAnalystics` hook — no
new index needed.

Feature 5 requires no Firebase reads at all.

---

## Build order recommendation

| Order | Feature                        | Reason                                      |
|-------|--------------------------------|---------------------------------------------|
| 1st   | Grade-level WPM bands (F5)    | Zero Firebase work, highest signal/effort   |
| 2nd   | Student count in words (F2)   | 1 field addition to existing aggregation    |
| 3rd   | Participation rate (F3)       | New hook but simple query + clean UI        |
| 4th   | Calendar heatmap (F4)         | Moderate UI complexity, same index as F3    |
| 5th   | Passage difficulty (F1)       | Deepest aggregation but self-contained      |

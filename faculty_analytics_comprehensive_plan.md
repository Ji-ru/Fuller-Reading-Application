# Comprehensive Faculty Analytics Modernization Plan

This plan outlines the steps to implement advanced analytics for the Faculty Dashboard, specifically optimized for the current codebase structure of the CISC Capstone project.

---

## Phase 0: Infrastructure & Utilities

Before building the features, we need to add the helper functions that the analytics logic relies on.

### 0.1 Responsive Scaling Utilities
Since the plan uses `sw`, `sh`, and `sf` for responsive design, we will add these to a new utility file.

**File:** `src/Utilities/Responsive.ts`
```ts
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on standard 375x812 iPhone screen
const widthBase = 375;
const heightBase = 812;

export const sw = (size: number) => (SCREEN_WIDTH / widthBase) * size;
export const sh = (size: number) => (SCREEN_HEIGHT / heightBase) * size;
export const sf = (size: number) => {
  const newSize = (SCREEN_WIDTH / widthBase) * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
```

### 0.2 Firestore Batching Utility
To handle classes with more than 30 students (Firestore's limit for `in` queries), we implement a chunking utility.

**File:** `src/Utils/batchInQuery.ts`
```ts
import firestore from '@react-native-firebase/firestore';

export async function batchGetDocsByStudentIds(
  collectionName: string,
  studentIds: string[],
  extraConstraints: any[] = [],
): Promise<any[]> {
  if (studentIds.length === 0) return [];
  const CHUNK = 30;
  const chunks: string[][] = [];
  for (let i = 0; i < studentIds.length; i += CHUNK) {
    chunks.push(studentIds.slice(i, i + CHUNK));
  }

  const results = await Promise.all(
    chunks.map(chunk => {
      let q = firestore().collection(collectionName).where('studentId', 'in', chunk);
      extraConstraints.forEach(c => {
        // Apply constraints based on the type (usually [field, op, val])
        q = q.where(c[0], c[1], c[2]);
      });
      return q.get();
    }),
  );

  return results.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() })));
}
```

---

## Phase 1: Core Analytics Features

### Feature 1 — Passage Difficulty Ranking
**Goal:** Identify which reading materials are consistently hard for the class.
*   **Data:** Aggregated from `miscueReports` grouped by `passageTitle`.
*   **Logic:** Sort by lowest average `accuracyRate`.
*   **Placement:** New component in the "Analytics" tab.

### Feature 2 — Enhanced Miscue Heatmap
**Goal:** Show how many *unique students* struggle with specific words.
*   **Modification:** Update `use_StudentMiscueInsights.ts` (or the faculty equivalent) to track a `Set` of `studentIds` per miscued word.
*   **UI:** Add the `👥 N students` chip to the word rows in the miscue list.

### Feature 3 — Class Participation Rate
**Goal:** Answer "What percentage of my class is actually using the app this week?"
*   **Logic:** Compare unique `studentId` counts in `miscueReports` between current week and last week.
*   **UI:** A large percentage card with a trend indicator (e.g., "↑ 12% from last week").

### Feature 4 — Monthly Activity Heatmap
**Goal:** Visual calendar showing reading density per day.
*   **Logic:** Bucket reports into days of the selected month.
*   **UI:** A 7-column grid with color intensity based on session counts.

---

## Phase 2: Integration Roadmap

| Step | Task | Target File |
| :--- | :--- | :--- |
| 1 | **Benchmarks** | Create `src/Constants/wpmBenchmarks.ts` with Grade 1-3 norms. |
| 2 | **WPM Bands** | Update `AccuracySpeedChart.tsx` to render the reference background band. |
| 3 | **Hook Prep** | Create `src/Hooks/Faculty/useClassAnalytics.ts` to aggregate multiple reports. |
| 4 | **UI Assembly** | Update `AnalyticsTab.tsx` to include the new Difficulty Ranking and Heatmap. |

---

## Phase 3: Data Migration / Cleanup (Optional)
*   **Timestamp Consistency:** Ensure all future reports use the `timestamp` field consistently to avoid query failures.
*   **Index Creation:** Once the first class-wide query runs, click the link in the console to generate the Firestore composite index: `miscueReports [studentId ASC, timestamp ASC]`.

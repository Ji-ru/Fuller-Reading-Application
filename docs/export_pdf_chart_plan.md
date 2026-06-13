# 📄 ExportPdf — Faculty Student Report: Chart & Graph Implementation Plan

> **Scope:** Add meaningful visual charts to each section of the PDF exported
> from `Faculty_Student_View_Profile.tsx` via `ExportPdf.tsx`. All charts are
> rendered as **inline SVG strings** (same pattern as the existing helpers) so
> `RNPrint` can render them without any native image capture.

---

## 1. What Is Currently Exported (Baseline)

The existing `buildPdfHtml()` assembles **4 tab sections** from the screen:

| Tab (Screen) | PDF Section function | Current visuals |
|---|---|---|
| **Progress** (`StudentCompletionProgress`) | `buildProgressSectionHtml` | Progress bars (HTML `div`) per chapter/lesson |
| **Sessions** (`StudentWordMastery` + `StudentTotalActivityToday`) | `buildWordMasterySectionHtml` | Accuracy bar chart (SVG) + progress bars |
| **Analytics** (`StudentAccuracyTrendsChart` + `StudentMiscueInsights`) | `buildAccuracyTrendsSectionHtml` + `buildMiscueInsightsSectionHtml` | Trend rows + miscue bar rows |
| **History** (`filteredHistoryReports`) | `buildHistorySectionHtml` | Report cards per passage/session |

There are also two **overview charts** at the top of the PDF:
- `buildPairedBarChartSvg` — Accuracy & WPM per passage (already exists ✅)
- `buildDonutSvg` — Miscue distribution donut (already exists ✅)

---

## 2. Gap Analysis — Charts Missing for Faculty

The faculty view shows more data than what is currently rendered in the PDF charts. The following visual enhancements are needed:

### 2.1 Progress Tab (`buildProgressSectionHtml`)
**Screen shows:** Chapter cards with per-lesson completion bars  
**Current PDF:** Only HTML progress bars — no chart  
**Missing:** A visual summary of chapter-level completion for quick overview

### 2.2 Sessions Tab (`buildWordMasterySectionHtml`)
**Screen shows:** Animated vertical bar chart (words completed per Day/Week/Month) + overall progress bar + per-chapter/lesson breakdown  
**Current PDF:** Single horizontal accuracy bar chart + progress bars  
**Missing:**
- A **vertical bar chart for word completion per period** (mirrors `BarColumn` in `StudentWordMastery`)
- A **chapter completion summary chart** (horizontal grouped bars: mastered vs total per chapter)

### 2.3 Analytics Tab
**Screen shows:**
- `StudentAccuracyTrendsChart` — line-style accuracy + WPM trend
- `StudentMiscueInsights` — miscue type breakdown bars + top passage + top miscued words  

**Current PDF:** Trend rows (text + bars) + miscue rows (text + bars)  
**Missing:**
- An **SVG line/area chart for accuracy & WPM over time** (the trend rows exist but a proper line chart would be much more readable for a teacher)
- A **stacked or grouped horizontal bar for miscue types** is already partially done — enhance to show percentage labels more clearly

### 2.4 History Tab (`buildHistorySectionHtml`)
**Screen shows:** Collapsible passage cards with accuracy/WPM/duration/miscue per session  
**Current PDF:** Report cards with metrics  
**Missing:**
- A **mini sparkline per passage** (accuracy trend across attempts for that passage)
- An **attempt-level accuracy line chart across all sessions** (teacher can see learning curve)

---

## 3. New SVG Chart Functions to Implement

### 3.1 `buildWordCompletionBarsSvg(slots)` — Vertical Bar Chart
**Used in:** Sessions / Word Mastery section  
**Data:** `wordSlots` from `useStudentWordMastery` — array of `{ label, correctCount, accuracy }`  
**Design:** Same layout as `buildAccuracyBarsSvg` but Y-axis = words completed count (not %)  

```ts
function buildWordCompletionBarsSvg(
  slots: { label: string; correctCount: number; totalWords: number }[]
): string
```

Color coding:
- Green (`#34d399`) ≥ 85% of slot words completed
- Amber (`#fbbf24`) ≥ 60%
- Red (`#f87171`) < 60%

---

### 3.2 `buildChapterProgressChartSvg(chapters)` — Horizontal Grouped Bar
**Used in:** Progress tab overview  
**Data:** Chapter progress from `completedWords` (already processed in `buildProgressSectionHtml`)  
**Design:** One row per chapter; two mini bars — **completed words** (colored) and **total words** (gray track)

```ts
function buildChapterProgressChartSvg(
  chapters: { title: string; done: number; total: number; pct: number }[]
): string
```

Width: 500px, Height: dynamic (28px per chapter row)

---

### 3.3 `buildAccuracyLineChartSvg(chartData)` — Line + Area Chart
**Used in:** Analytics tab, Accuracy & Speed section  
**Data:** `accuracyChart` from `useStudentAccuracyTrends` — `{ date, accuracy, wpm }[]`  
**Design:**
- X-axis: date labels
- Y-axis: 0–100
- Two data series: accuracy (blue line + light fill) and WPM (scaled to 0–100, amber line)
- Dots at each data point
- Peak point highlighted

```ts
function buildAccuracyLineChartSvg(
  data: { date: string; accuracy: number; wpm: number }[],
  maxWpm?: number
): string
```

SVG dimensions: 500 × 200

---

### 3.4 `buildPassageSparklineSvg(reports)` — Mini Accuracy Sparkline
**Used in:** History tab, per passage card header  
**Data:** `group.reports[]` — `{ accuracyRate }` per session  
**Design:** Small (120 × 40) line sparkline showing accuracy trend across attempts for one passage

```ts
function buildPassageSparklineSvg(
  accuracyValues: number[]
): string
```

---

### 3.5 (Enhancement) `buildMiscueDonutWithLabelsSvg` — Donut + % Labels
**Used in:** Overview (already exists — enhance existing `buildDonutSvg`)  
**Change:** Add percentage labels inside/near each arc segment, not just the legend

---

## 4. Section-by-Section Integration Plan

### Section A — Progress Tab

**In `buildProgressSectionHtml`:**

1. After computing `chapters` array (already done), call `buildChapterProgressChartSvg(chapters)`.
2. Insert the SVG in a `<div class="chart-box">` **above** the chapter cards:

```html
<div class="chart-box">
  <div class="chart-label">📊 Chapter Completion Overview</div>
  ${buildChapterProgressChartSvg(chapters)}
</div>
```

**Data already available:** `chapters` array with `{ title, done, total, pct }` — no new props needed.

---

### Section B — Sessions / Word Mastery Tab

**In `buildWordMasterySectionHtml`:**

1. Replace existing `buildAccuracyBarsSvg(slots...)` call with `buildWordCompletionBarsSvg(slots)`.
2. Add a **chapter completion grouped bar chart** below the overall progress bar using `buildChapterProgressChartSvg(chapters)`.

**Data already available:** `slots` (WordPeriodSlot[]) and `chapters` (WordChapterProgress[]) — both already passed as props.

---

### Section C — Analytics Tab

**In `buildAccuracyTrendsSectionHtml`:**

1. After the mini-stats strip, insert the **line chart** before the trend rows:

```html
<div class="chart-box">
  <div class="chart-label">📈 Accuracy & Speed Trend</div>
  ${buildAccuracyLineChartSvg(chartData)}
</div>
```

2. The existing trend rows remain below as a detail table — the line chart gives the visual overview.

**Data already available:** `chartData` is already the parameter of this function.

---

### Section D — History Tab

**In `buildHistorySectionHtml`:**

1. In each passage card (`passageCards`), after the passage header, add a sparkline if `group.reports.length > 1`:

```html
<div class="chart-box" style="padding:6px 10px">
  <div class="chart-label">Accuracy trend across attempts</div>
  ${group.reports.length > 1
    ? buildPassageSparklineSvg(group.reports.map(r => r.accuracyRate))
    : '<div class="empty-mini">Single attempt</div>'}
</div>
```

2. **New: Overall sessions accuracy line chart** — at the top of the History section (after the stats bar), add a line chart of all sessions' accuracy over time (chronological, all passages merged):

```ts
const allSessionsChronological = opts.groupedReports
  .flatMap(g => g.reports)
  .sort((a, b) => (a.timestamp?.toDate?.() ?? new Date(a.timestamp)).getTime()
                - (b.timestamp?.toDate?.() ?? new Date(b.timestamp)).getTime())
  .map(r => ({ date: formatDateShort(r.timestamp), accuracy: r.accuracyRate }));
```

---

## 5. Props & Data Flow — No New Props Needed

All charts use data **already flowing into `ExportPdf`**:

| Chart | Data Source (already in component) |
|---|---|
| Chapter Progress Chart | `completedWords` → `buildProgressSectionHtml` internal computation |
| Word Completion Bars | `wordSlots` prop of `buildWordMasterySectionHtml` |
| Accuracy Line Chart | `accuracyChart` from `useStudentAccuracyTrends` |
| Passage Sparklines | `groupedReports` from `buildHistorySectionHtml` |
| Overall Sessions Line | `groupedReports` (flattened, sorted by timestamp) |

> [!IMPORTANT]
> No new props need to be added to `ExportPdfButtonProps` or the `BuildOpts` interface.
> All required data is already fetched/passed.

---

## 6. Faculty-Specific Enhancements

The `role` field is already `'faculty'` when `ExportPdf` is used from `Faculty_Student_View_Profile`. Leverage this to:

1. **Show teacher-oriented labels** in chart titles (e.g. "Reading Progress Overview — For Teacher Review").
2. **Show grade benchmark comparison** in the Accuracy line chart (draw a horizontal dashed line at the expected grade-level accuracy min).
3. **Include student name prominently** in each section header of the PDF (already done in the report header — keep consistent).

---

## 7. Implementation Order

```
Phase 1 — New SVG builder functions (no existing code changes):
  ├── buildChapterProgressChartSvg()
  ├── buildWordCompletionBarsSvg()
  ├── buildAccuracyLineChartSvg()
  └── buildPassageSparklineSvg()

Phase 2 — Integrate into section builders:
  ├── buildProgressSectionHtml()     ← insert chapter chart
  ├── buildWordMasterySectionHtml()  ← replace accuracy bars, add chapter chart
  ├── buildAccuracyTrendsSectionHtml() ← prepend line chart
  └── buildHistorySectionHtml()      ← add sparklines + overall line chart

Phase 3 — Faculty-specific polish:
  ├── Grade benchmark dashed line in accuracy chart
  ├── Faculty-specific section labels
  └── Test with real student data
```

---

## 8. Visual Preview — PDF Structure After Implementation

```
┌─────────────────────────────────────────────────────┐
│  📚 Reading Assessment Report         [Student Name] │
│  Progress · Sessions · Analytics · History           │
├─────────────────────────────────────────────────────┤
│  [Summary: Passages | Sessions | Avg Acc | WPM | Miscues] │
│                                                     │
│  [Paired Bar Chart: Acc+WPM per passage] [Donut]    │
├─────────────────────────────────────────────────────┤
│  📈 Progress                                        │
│  ┌─ Chapter Completion Overview (NEW CHART) ───────┐ │
│  │  Horiz bars per chapter ████████░░ 75%          │ │
│  └─────────────────────────────────────────────────┘ │
│  [Chapter cards with lesson bars — existing]        │
├─────────────────────────────────────────────────────┤
│  📖 Word Mastery                                    │
│  [Sessions | Mastered words | Avg Accuracy stats]   │
│  ┌─ Words Completed Per Period (NEW VERT BARS) ────┐ │
│  │  Mon Tue Wed Thu Fri Sat Sun                    │ │
│  └─────────────────────────────────────────────────┘ │
│  Overall progress bar                               │
│  [Chapter breakdown cards — existing]               │
├─────────────────────────────────────────────────────┤
│  📊 Analytics                                       │
│  [Avg Acc | Avg WPM | Trend stats]                  │
│  ┌─ Accuracy & Speed Trend (NEW LINE CHART) ───────┐ │
│  │  ─── accuracy (blue)    ─── WPM (amber)         │ │
│  │  -- grade benchmark (dashed green)              │ │
│  └─────────────────────────────────────────────────┘ │
│  [Trend rows table — existing]                      │
│  [Miscue bars + passage + words — existing]         │
├─────────────────────────────────────────────────────┤
│  📋 Reading History                                 │
│  [Passages | Attempts | Avg Acc | Best WPM]         │
│  ┌─ Accuracy Over All Sessions (NEW LINE) ─────────┐ │
│  │  chronological accuracy of every attempt        │ │
│  └─────────────────────────────────────────────────┘ │
│  [Passage card] "The Lion and the Mouse"            │
│  ┌─ sparkline: ╱─╲─╱ (accuracy per attempt) ──────┐ │
│  └─────────────────────────────────────────────────┘ │
│  [Session cards — existing]                         │
└─────────────────────────────────────────────────────┘
```

---

> [!NOTE]
> All SVG charts use pure math (no canvas, no external libs) consistent with the
> existing `buildPairedBarChartSvg`, `buildAccuracyBarsSvg`, and `buildDonutSvg`
> helpers already in `ExportPdf.tsx`. `RNPrint` renders the HTML/SVG natively.

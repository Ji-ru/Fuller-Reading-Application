# Analytics Documentation — MiscueReading Application

Generated: 2026-05-12  
Covers: Student Reading History, Faculty Dashboard, Faculty Student View Profile

---

## Table of Contents

1. [Overview](#1-overview)
2. [Reading Accuracy Rate](#2-reading-accuracy-rate)
3. [Words Per Minute (WPM)](#3-words-per-minute-wpm)
4. [Accuracy & Speed Trends](#4-accuracy--speed-trends)
5. [Grade-Level Benchmarks](#5-grade-level-benchmarks)
6. [Miscue Analysis](#6-miscue-analysis)
7. [Miscue Insights Component](#7-miscue-insights-component)
8. [Completion Progress Tab](#8-completion-progress-tab)
9. [Word Mastery / Sessions Tab](#9-word-mastery--sessions-tab)
10. [Total Activity Today (Faculty Student View)](#10-total-activity-today-faculty-student-view)
11. [Reading History Tab](#11-reading-history-tab)
12. [Faculty Dashboard Analytics](#12-faculty-dashboard-analytics)
13. [PDF Export](#13-pdf-export)
14. [Research Basis Summary](#14-research-basis-summary)

---

## 1. Overview

The MiscueReading application collects oral reading session data from students and surfaces that data through four main analytical views, shared between the student self-view (`Student_History.tsx`) and the faculty student-view (`Faculty_Student_View_Profile.tsx`):

| Tab | Component | Purpose |
|-----|-----------|---------|
| **Progress** | `StudentCompletionProgress` | Curriculum completion tracking per chapter and lesson |
| **Sessions** | `StudentWordMastery` + `StudentTotalActivityToday` | Word-level mastery and daily activity breakdown |
| **Analytics** | `StudentAccuracyTrendsChart` + `StudentMiscueInsights` | Reading accuracy, speed trends, and error pattern analysis |
| **History** | Inline in both screens | Per-session log of every reading attempt, filterable by period |

The Faculty Dashboard (`Faculty_Dashboard.tsx`) adds class-level aggregations on top of individual student data.

All raw session data is stored in Firestore as `MiscueReportDocument` records and is retrieved using `MiscueReportController.getStudentReports()`.

---

## 2. Reading Accuracy Rate

### What It Is
The percentage of words in a passage that the student read **correctly** in a single oral reading session.

### How It Is Computed
```
Accuracy Rate (%) = (Correct Words / Total Words in Passage) × 100
```

- **Correct Words**: words read without any miscue (no substitution, omission, insertion, or unresolved repetition).
- **Total Words**: the full word count of the assigned passage.
- This value is computed and stored per session in the `accuracyRate` field of `MiscueReportDocument` at report creation time (during the reading activity in `Student_Reading_Activity.tsx`).

### Reading Level Thresholds
The application uses three internationally recognized accuracy-based reading levels derived from the work of **Emmett Betts (1946)** and later refined by **Marie Clay (2000)**:

| Level | Accuracy Range | Interpretation |
|-------|---------------|----------------|
| **Independent** | 95–100% | Student can read without teacher support |
| **Instructional** | 90–94% | Student benefits from guided reading with a teacher |
| **Frustration** | Below 90% | Text is too difficult; risk of comprehension breakdown |

These thresholds underpin the "Reading Health" classification used in the Faculty Dashboard's `ClassReadingStatus` component.

### Research Basis
- **Betts, E. A. (1946).** *Foundations of Reading Instruction.* American Book Company.  
- **Clay, M. M. (2000).** *Running Records for Classroom Teachers.* Heinemann.

---

## 3. Words Per Minute (WPM)

### What It Is
A measure of **oral reading fluency**: how many words per minute a student reads during a timed session.

### How It Is Computed
```
WPM = (Total Words Read / Recording Duration in Seconds) × 60
```

- **Total Words Read**: the full word count of the passage (all words, including miscued words, since the student read them — they were just read incorrectly).
- **Recording Duration**: the elapsed time in seconds captured during the reading session, stored in the `recordingDuration` field.
- Stored in the `wordPerMin` field of each `MiscueReportDocument`.

### Why WPM Matters
WPM is part of **Oral Reading Fluency (ORF)**, which is a strong predictor of reading comprehension. The National Reading Panel (2000) identified fluency as one of the five core components of effective reading instruction. A student who reads too slowly may be devoting cognitive resources to decoding each word, leaving fewer resources for comprehension.

### Research Basis
- **National Reading Panel. (2000).** *Teaching Children to Read: An Evidence-Based Assessment of the Scientific Research Literature on Reading and Its Implications for Reading Instruction.* National Institute of Child Health and Human Development (NICHD).

---

## 4. Accuracy & Speed Trends

**Components:** `Student_Accuracy_Chart.tsx` (student/faculty individual view) | `AccuracyTrends.tsx` (faculty dashboard class view)

Both components present the same metrics but at different scopes — one per student, one aggregated per class.

### Time Grouping
Data is grouped into periods based on the selected time range:
- **Week**: each day Monday–Sunday is one data point (label: Mon, Tue, …, Sun)
- **Month**: each week within the month is one data point (Week 1, Week 2, …)
- **Year**: each month is one data point (Jan, Feb, …, Dec)

Within each period bucket, all reports for that bucket are averaged to produce a single accuracy value and a single WPM value.

### Summary Statistics

| Metric | Computation |
|--------|-------------|
| **Avg Accuracy** | Mean of all non-zero accuracy values across all period buckets in view |
| **Avg WPM** | Mean of all non-zero WPM values across all period buckets in view |
| **Trend** | Percentage change in accuracy from the first period bucket to the last (or first-half average vs. second-half average when ≥4 data points exist) |

**Trend Direction Rules (class-level chart):**
```
accDelta > +1%  → "up"   (📈 Improving)
accDelta < -1%  → "down" (📉 Declining)
otherwise       → "same" (📊 Consistent)
```
The ±1% dead band prevents noisy micro-fluctuations from being labeled as directional trends.

**Trend Direction Rules (student-level chart):**
```
accDelta > 0  → "up"
accDelta < 0  → "down"
accDelta = 0  → "same"
```

### Bar Visualization
- Each period row contains **two stacked horizontal bars**:
  - **Blue bar**: Accuracy % (0–100 scale, directly maps to bar width)
  - **Amber bar**: WPM (scaled relative to the maximum WPM in the current dataset; `wpmWidth = (item.wpm / maxWpm) × 100`)
- The **peak period** (highest accuracy) is highlighted with a bolder label and a solid primary-color bar fill.

### WPM Band Overlay (Faculty Dashboard version only)
When a grade level is known, the faculty `AccuracyTrends` chart overlays a translucent green band on each WPM bar track showing the **expected WPM range** for that grade. This band is computed from the Hasbrouck & Tindal (2017) norms (see Section 5).

### Insight Text
The component generates a plain-language interpretation of the trend:
- "Accuracy improved by X% over this period." (upward trend)
- "Accuracy dropped by X%. Consider reviewing reading exercises." (downward trend)
- "Reading accuracy remained consistent over this period." (stable)

### Research Basis
- **Hasbrouck, J., & Tindal, G. A. (2017).** *An update to compiled ORF norms.* (Technical Report No. 1702). Behavioral Research and Teaching. University of Oregon.

---

## 5. Grade-Level Benchmarks

**Components:** `Student_Accuracy_Chart.tsx`, `AccuracyTrends.tsx`, `ExportPdf.tsx`

### Purpose
When a student's grade level is known (fetched from the `users/{uid}` Firestore document under `studentData.gradeLevel`), the application compares the student's average accuracy and average WPM against **grade-level norms** from Hasbrouck & Tindal (2017).

### Benchmark Table (Spring 50th Percentile)
| Grade | WPM Range | Accuracy Range |
|-------|-----------|----------------|
| Grade 1 | 53–82 WPM | 90–100% |
| Grade 2 | 89–120 WPM | 92–100% |
| Grade 3 | 107–140 WPM | 94–100% |

The WPM values come from the Hasbrouck & Tindal (2017) spring-norm table at the 50th percentile, representing the "typical on-grade" performance. The accuracy thresholds represent the **instructional-to-independent** reading range (≥90% / ≥92% / ≥94%) per grade, consistent with the Clay (2000) and Betts (1946) frameworks.

### Benchmark Status Classification
```
value in [min, max]  → "At Grade Level"   (amber ●)
value > max          → "Above Grade Level" (green ▲)
value < min          → "Below Grade Level" (red ▼)
```

Both **accuracy** and **WPM** are evaluated independently and each receives its own badge.

### Where It Appears
- **Analytics tab** (student self-view and faculty student view): beneath the summary stats strip.
- **Faculty Dashboard class-level chart**: WPM band overlay on each period bar track.
- **Exported PDF**: in the Analytics section of the report.

### Research Basis
- **Hasbrouck, J., & Tindal, G. A. (2017).** *An update to compiled ORF norms.* (Technical Report No. 1702). Behavioral Research and Teaching. University of Oregon.
- **Betts, E. A. (1946).** *Foundations of Reading Instruction.* American Book Company.
- **Clay, M. M. (2000).** *Running Records for Classroom Teachers.* Heinemann.

---

## 6. Miscue Analysis

### Theoretical Foundation
The term **"miscue"** was coined by **Kenneth S. Goodman** in his 1969 paper "Analysis of oral reading miscues: Applied psycholinguistics." Goodman's **Reading Miscue Inventory (RMI)** is the foundational framework behind all error-type classification in this application.

Goodman's theory posits that reading errors are not random mistakes — they are **windows into the reader's cognitive strategies**. By categorizing error types, teachers gain diagnostic insight into which cueing systems (graphophonic, syntactic, semantic) the student over- or under-relies on.

### The Four Miscue Types

| Type | Definition | What It Reveals |
|------|-----------|-----------------|
| **Substitution** | The student reads a different word than what is printed (e.g., reads "house" for "home"). | May indicate over-reliance on visual similarity or inadequate semantic checking. |
| **Omission** | The student skips a word entirely without self-correcting. | Often indicates the reader is skimming for meaning but missing function words, or has difficulty decoding the word. |
| **Insertion** | The student adds a word that is not in the text. | Often reveals over-reliance on syntactic prediction — the student guesses what "should" come next based on sentence structure. |
| **Repetition** | The student re-reads a word or phrase, usually to correct a previous miscue or to re-process a difficult passage. | Can be a positive self-correction strategy; high frequency may indicate decoding difficulty. |

### Miscue Labeling for Students
Because technical miscue terminology may not be accessible to young learners, the application applies **student-friendly labels** when `role === 'student'`:

| Technical Term | Student-Friendly Label |
|---------------|----------------------|
| Substitution | Wrong word |
| Omission | Skipped word |
| Insertion | Added word |
| Repetition | Repeated word |

Faculty always see the technical terms.

### Research Basis
- **Goodman, K. S. (1969).** Analysis of oral reading miscues: Applied psycholinguistics. *Reading Research Quarterly, 5*(1), 9–30.
- **Goodman, Y. M., Watson, D. J., & Burke, C. L. (1987).** *Reading Miscue Inventory: Alternative Procedures.* Richard C. Owen Publishers.
- **Afflerbach, P. (2007).** *Understanding and Using Reading Assessment, K–12.* International Reading Association.

---

## 7. Miscue Insights Component

**Component:** `Student_MiscueInsights.tsx`

This component surfaces three diagnostic sub-panels within the Analytics tab:

### 7.1 Common Miscue Types
**Purpose:** Show the distribution of error types across all reading sessions within the selected time window.

**Computation:**
- For each report in the period, the counts for each miscue type (`substitutionCount`, `omissionCount`, `insertionCount`, `repetitionCount`) are summed.
- Each type's **percentage** = `(typeCount / totalMiscues) × 100`.
- Each type's **bar width** = `(typeCount / maxTypeCount) × 100` (relative to the largest type — not absolute).
- The bar scale is relative (not absolute) so that even small counts are visually discernible.

**Color coding:**
| Type | Color |
|------|-------|
| Substitution | Red (#FF5252) |
| Omission | Orange (#FF9800) |
| Insertion | Blue (#42A5F5) |
| Repetition | Purple (#AB47BC) |

### 7.2 Top Miscued Passage
**Purpose:** Identify which passage in the period generated the most cumulative miscues.

**Computation:**
- All reports in the period are grouped by `passageTitle`.
- For each passage: `totalMiscues` = sum of all miscues across all attempts.
- `averageAccuracy` = mean of `accuracyRate` across all attempts on that passage.
- The passage with the highest `totalMiscues` is surfaced as the "top miscued" passage.

**Interpretation:** A passage ranked highest for miscues is the passage presenting the greatest decoding or comprehension challenge for the student in that period. This guides targeted re-teaching.

### 7.3 Most Miscued Words
**Purpose:** Identify the specific words that caused the most errors, ranked by error frequency.

**Computation:**
- Each miscue event stored in `report.miscues[]` contains the miscued word and the type of error.
- Words are aggregated across all reports in the period.
- For each unique word: `errorCount` = total occurrences; `dominantMiscueType` = the error type with the highest count for that word.
- Words are ranked by `errorCount` descending; the top N are displayed.

**Interpretation:** Repeated miscues on specific words indicate vocabulary gaps, letter-pattern difficulty, or phonological decoding challenges on those particular word forms. This list directly informs targeted word study.

---

## 8. Completion Progress Tab

**Component:** `StudentCompletionProgress.tsx`

### Purpose
Tracks the student's **curriculum-wide** progress through the structured reading material — independent of time filters. This represents the student's overall standing in the program, not a period snapshot.

### Data Sources
- **Curriculum definition**: `ReadingMaterial_new.json` (bundled asset) — defines the hierarchy of Words → Chapters → Lessons → individual words.
- **Student completions**: Firestore records fetched via `useStudentCompletedWord` hook — the set of words a student has successfully read at least once.

### How Progress Is Computed
```
Chapter Completion % = (Completed Words in Chapter / Total Words in Chapter) × 100
Lesson Completion %  = (Completed Words in Lesson  / Total Words in Lesson)  × 100
Overall Progress %   = (All Completed Words / All Curriculum Words) × 100
```

A word is marked **completed** when it appears in the student's Firestore completion records. Lookup is O(1) via a `Set<string>` of normalized (lowercased, trimmed) completed words.

### Visual Status Colors
| Progress | Color |
|----------|-------|
| 100% | Green (#2CA96A) — fully mastered |
| 50–99% | Amber (#F59E0B) — in progress |
| 1–49% | Red (#EF4444) — needs attention |
| 0% | Gray (#9CA3AF) — not started |

### Research Basis
The chapter/lesson structure reflects a **mastery learning** progression. Students must demonstrate exposure to words within each lesson before moving to the next, consistent with:
- **Bloom, B. S. (1968).** Learning for mastery. *Evaluation Comment, 1*(2), 1–12.
- **Bloom, B. S. (1976).** *Human Characteristics and School Learning.* McGraw-Hill.

---

## 9. Word Mastery / Sessions Tab

**Component:** `StudentWordMastery.tsx`

### Purpose
Provides a **time-filtered** view of word-level mastery — how well the student performed on individual words during reading sessions in the selected period (Week / Month / Year).

### Data Structure
Word reading attempts are organized as: **Chapter → Lesson → Word**.

For each lesson, the component tracks:
- `totalWords`: total words defined in that lesson from the curriculum JSON.
- `masteredWords`: words the student has read with sufficient accuracy (threshold set in the backend hook, typically ≥85% accuracy on that word).
- `latestAccuracy`: the most recent accuracy score on that lesson's words.
- `overallAccuracy`: the mean accuracy across all attempts on that lesson's words within the period.

### Period Slot Chart
A bar chart shows **accuracy per time slot** (e.g., Mon–Sun for weekly view). Each bar represents the mean word accuracy for all word-reading sessions that day or week. Colors:
- Green (≥85%): performing well
- Amber (60–84%): approaching mastery
- Red (<60%): needs support

### Mastery Definition
A lesson is considered **"Done"** when `masteredWords.length >= totalWords` (all words in the lesson have been mastered). This aligns with Bloom's (1968) mastery threshold, typically operationalized as ≥80–90% correctness sustained across attempts.

### Research Basis
- **Bloom, B. S. (1968).** Learning for mastery. *Evaluation Comment, 1*(2), 1–12.
- **Beck, I. L., McKeown, M. G., & Kucan, L. (2013).** *Bringing Words to Life: Robust Vocabulary Instruction* (2nd ed.). Guilford Press.

---

## 10. Total Activity Today (Faculty Student View)

**Component:** `StudentTotalActivityToday.tsx`  
**Location:** Sessions tab in `Faculty_Student_View_Profile.tsx` only (not shown to students in self-view).

### Purpose
Gives the faculty member an **at-a-glance daily summary** of a student's activity across three exercise categories for the current day.

### Categories and Computation

| Category | Description | Color |
|----------|-------------|-------|
| **Alphabet** | Letter sound recognition exercises | Purple (#A855F7) |
| **Words** | Single word pronunciation sessions | Amber (#F59E0B) |
| **Passage** | Full passage reading sessions | Orange (#F97316) |

Each category's **percentage** = the student's accuracy score on that category's exercises **today** (current calendar day), fetched via `useStudentTotalActivityToday`.

The animated progress bars provide a visual comparison of how the student is performing across the three modalities in real time.

### Why This Differs Between Student and Faculty Views
The student self-view omits `StudentTotalActivityToday` because:
- Students benefit from seeing cumulative progress (word mastery, history) rather than a live today snapshot that may cause anxiety or misinterpretation.
- Faculty need the today snapshot to assess engagement and guide in-session feedback.

---

## 11. Reading History Tab

**Location:** `Student_History.tsx` (student self-view) and `Faculty_Student_View_Profile.tsx` (faculty view)

### Purpose
A **raw log** of every reading session the student has completed, organized by passage title and filterable by time period.

### Filter System
The student self-view implements a custom three-level filter:
1. **Range selector**: Week / Month / Year
2. **Period navigator**: arrows to move forward/backward in time (week-by-week, month-by-month, academic-year-by-academic-year)
3. **Sub-filter chips**:
   - Week mode: day-of-week chips (Mon–Sun) with activity indicator dots
   - Month mode: week-of-month chips (Week 1–5)

The faculty view uses the simpler `DateRangeFilter` component (start/end bounds).

**Academic Year Definition:** June 1 to March 31 of the following year (Philippine school year calendar).

### Per-Session Data Shown

| Field | Source | Description |
|-------|--------|-------------|
| Date/Time | `report.createdAt` | Timestamp of the reading session |
| Accuracy | `report.accuracyRate` | % of correctly read words |
| Words/Min | `report.wordPerMin` | Reading speed |
| Duration | `report.recordingDuration` | Length of the session |
| Total Miscues | Computed (see below) | Sum of all error types |
| Miscue Breakdown | Per-type strings/counts | Which words were miscued and how |

**Total Miscues Computation (priority order):**
1. If `report.totalMiscues` is stored directly → use it.
2. Else if `report.miscues` array exists → use `miscues.length`.
3. Else → sum `substitutionCount + omissionCount + insertionCount + repetitionCount`.

### Summary Stats Bar
Four aggregate metrics computed from the **filtered** reports:
- **Passages**: count of distinct passage titles with ≥1 session in the period.
- **Attempts**: total number of individual sessions.
- **Avg. Accuracy**: mean `accuracyRate` across all sessions.
- **Best WPM**: maximum `wordPerMin` achieved in any single session.

---

## 12. Faculty Dashboard Analytics

**Screen:** `Faculty_Dashboard.tsx`

The Faculty Dashboard provides **class-level aggregations** across all students in a selected academic year and section.

### 12.1 Dashboard Overview
- **Class Count**: total number of class sections created by the faculty member.
- **Student Count**: total enrolled students across all classes.
- Source: `getNumberOfClasses()` and `getNumbersOfAllStudents()` from `getForStudentsMiscueStats`.

### 12.2 Reading Health — `ClassReadingStatus`
**Purpose:** Categorize each student in a class into a reading health tier.

**Tiers:**

| Tier | Criteria | Color |
|------|----------|-------|
| **Fluent** | Accuracy consistently ≥ 95% | Green |
| **Developing** | Accuracy 90–94% | Blue |
| **Emerging** | Accuracy 80–89% | Amber |
| **At Risk** | Accuracy < 80% | Red |
| **Insufficient Data** | Fewer than the minimum number of sessions recorded | Gray |

Thresholds correspond to Betts (1946) / Clay (2000) reading level ranges, ensuring research-grounded categorization.

### 12.3 Class Participation Rate — `ClassParticipationRate`
**Purpose:** Show the proportion of students who have had at least one reading session in the current week (default) or selected period.

**Computation:**
```
Participation Rate (%) = (Students with ≥1 session in period / Total enrolled students) × 100
```

This metric helps faculty identify disengaged students before academic problems compound — consistent with early-warning intervention research.

### 12.4 Accuracy & Speed Trends — `AccuracyTrends` (Faculty)
Same algorithmic basis as Section 4, but data is aggregated across all students in the selected class/year. Each period bucket's accuracy and WPM values are the **class mean** for that period.

The **WPM band overlay** (green shaded region on the WPM bars) shows the Hasbrouck & Tindal (2017) expected WPM range for the predominant grade level of the class. The predominant grade level is determined by majority vote among enrolled students' grade levels.

### 12.5 Reading Activity Calendar — `ReadingCalendarHeatmap`
**Purpose:** Visualize when students read — shows reading consistency and streak patterns.

**Computation:** For each calendar cell (day), counts the number of reading sessions logged by any student in the class. Higher counts produce darker heat-map colors.

**Basis:** Reading consistency and habit formation are linked to reading achievement gains (Cunningham & Stanovich, 1998).

**Research Basis:**
- **Cunningham, A. E., & Stanovich, K. E. (1998).** What reading does for the mind. *American Educator, 22*(1-2), 8–15.

### 12.6 Passage Difficulty Ranking — `PassageDifficultyRanking`
**Purpose:** Rank passages by the difficulty they present to the class.

**Computation:**
```
Passage Difficulty Score = Average Miscue Rate per attempt across all students who read that passage
Difficulty Rank = descending sort by Difficulty Score
```

This identifies which passages in the curriculum are systemically challenging — actionable for curriculum revision or targeted re-teaching.

### 12.7 Miscue Analysis — `MiscueChart` (Faculty)
**Purpose:** Show the distribution of miscue types across the entire class in the selected period.

**Computation:** Same as Section 7.1 (Miscue Insights), but summed across all students in the class rather than a single student.

---

## 13. PDF Export

**Component:** `ExportPdf.tsx`

### Purpose
Generates a printable HTML report capturing all four tabs' analytics for a student at the time of export.

### Data Assembled in the Report

| Section | Data Source | Notes |
|---------|-------------|-------|
| **Cover / Overview** | Aggregated from all `groupedReports` | Total passages, sessions, avg. accuracy, best WPM, total miscues |
| **Overview Chart** | `groupedReports` | Paired bar chart — accuracy & WPM per passage |
| **Miscue Donut** | `useStudentMiscueStats` | Distribution of 4 error types |
| **Progress Tab** | `useStudentCompletedWord` + curriculum JSON | Chapter/lesson completion bars |
| **Word Mastery Tab** | `useStudentWordMastery` | Per-period accuracy bars, chapter breakdown |
| **Analytics Tab** | `useStudentAccuracyTrends` + `useStudentMiscueStats` + `useStudentTopMiscuePassageAndWords` | Accuracy & speed trends, benchmark card, miscue insights |
| **History Tab** | `groupedReports` filtered by `historyFilter`/`historyAnchor` | Per-session log matching current screen filter |

### Report Generation
The HTML is built in-memory by `buildPdfHtml()` using pure SVG and HTML string templates. No external server is contacted. The final HTML string is passed to `RNPrint.print({ html })` which opens the system print dialog.

### When `groupedReports` Is Not Passed
In the Faculty Student View (`Faculty_Student_View_Profile.tsx`), `groupedReports` is not pre-loaded until the History tab is opened. The `ExportPdf` component handles this gracefully: if `groupedReports` is undefined, it **self-fetches** the student's reports from Firestore via `MiscueReportController.getStudentReports(studentId)` before generating the PDF.

### Props Reference
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `studentId` | `string` | Auth user's UID | Student whose data to export |
| `groupedReports` | `GroupedReport[]` | Fetched internally | Pre-grouped reports (optional) |
| `historyFilter` | `'week'│'month'│'year'` | `'week'` | History tab period filter |
| `historyAnchor` | `Date` | `new Date()` | History tab anchor date |
| `historySelectedDay` | `number │ null` | `null` | Day chip selection (0=Mon…6=Sun) |
| `historySelectedWeekOfMonth` | `number │ null` | `null` | Week chip selection (1–5) |
| `perfTimeRange` | `'week'│'month'│'year'` | `'week'` | Analytics tab period filter |
| `perfAnchor` | `Date` | `new Date()` | Analytics tab anchor date |
| `perfSelectedDay` | `number │ null` | `null` | Analytics day chip selection |
| `perfSelectedWeekOfMonth` | `number │ null` | `null` | Analytics week chip selection |
| `gradeLevel` | `number` | `undefined` | Grade level for benchmark card |

---

## 14. Research Basis Summary

| Research Area | Citation | Used In |
|---------------|----------|---------|
| **Reading Accuracy Thresholds** (Independent / Instructional / Frustration levels) | Betts, E. A. (1946). *Foundations of Reading Instruction.* American Book. | Accuracy Rate, Reading Health tier thresholds |
| **Running Records & Accuracy Levels** | Clay, M. M. (2000). *Running Records for Classroom Teachers.* Heinemann. | Accuracy Rate thresholds, Reading Health |
| **Oral Reading Fluency (ORF) Norms** (WPM by grade level) | Hasbrouck, J., & Tindal, G. A. (2017). *An update to compiled ORF norms.* Technical Report 1702. University of Oregon. | Grade-Level Benchmark Card (WPM and Accuracy), WPM Band Overlay |
| **Miscue Analysis Framework** (error type taxonomy) | Goodman, K. S. (1969). Analysis of oral reading miscues: Applied psycholinguistics. *Reading Research Quarterly, 5*(1), 9–30. | All four miscue types (Substitution, Omission, Insertion, Repetition) |
| **Reading Miscue Inventory** (assessment methodology) | Goodman, Y. M., Watson, D. J., & Burke, C. L. (1987). *Reading Miscue Inventory: Alternative Procedures.* Richard C. Owen. | Miscue Insights, Miscue type classification |
| **Five Components of Reading** (fluency as a core component) | National Reading Panel. (2000). *Teaching Children to Read.* NICHD. | WPM rationale, fluency as a predictor of comprehension |
| **Mastery Learning** (word mastery thresholds) | Bloom, B. S. (1968). Learning for mastery. *Evaluation Comment, 1*(2), 1–12. | Word Mastery, Completion Progress |
| **Reading Habit & Achievement** (consistency matters) | Cunningham, A. E., & Stanovich, K. E. (1998). What reading does for the mind. *American Educator, 22*(1-2), 8–15. | Reading Activity Calendar (engagement tracking) |
| **Vocabulary Instruction** (word-level learning progression) | Beck, I. L., McKeown, M. G., & Kucan, L. (2013). *Bringing Words to Life* (2nd ed.). Guilford Press. | Word Mastery chapter/lesson structure |

---

*Document maintained by the MiscueReading development team. Update this file whenever analytics logic in the codebase changes.*

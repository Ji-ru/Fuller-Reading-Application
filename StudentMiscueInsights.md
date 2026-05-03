CONTEXT:
You are building a React Native data display component for a
Faculty/Teacher module in an educational reading assessment app.
The component shows a breakdown of a student's reading miscues —
the types of errors made, which passage had the most errors, and
which specific words were most frequently mispronounced or skipped.
The audience is teachers and parents — not children.

FONT: Nunito (Bold, Medium) — faculty sub-component embedded
      inside a larger student profile scroll view.
STACK: React Native CLI, TypeScript, no third-party libraries.
       All visuals are built with View + StyleSheet only.

─────────────────────────────────────────────────────────────
WHAT IS A MISCUE?
─────────────────────────────────────────────────────────────

A miscue is a deviation from the printed text during oral reading.
There are exactly 4 types used in this system:

  Substitution → student said a different word than printed
                 e.g. said "dog" instead of "cat"
  Omission     → student skipped a word entirely
  Insertion    → student added a word that wasn't there
  Repetition   → student repeated a word or phrase

Each type has a fixed color throughout the entire component:
  Substitution → red    (#FF5252 bar / #FFEBEE background)
  Omission     → orange (#FF9800 bar / #FFF3E0 background)
  Insertion    → blue   (#42A5F5 bar / #E3F2FD background)
  Repetition   → purple (#AB47BC bar / #F3E5F5 background)

These colors must be consistent across ALL three sections.

─────────────────────────────────────────────────────────────
DATA SHAPE
─────────────────────────────────────────────────────────────

Two hooks are used. Both accept (studentId, timeRange).

Hook 1: useStudentMiscueStats(studentId, timeRange)
Returns: {
  miscueData: Array<{
    type: 'Substitution' | 'Omission' | 'Insertion' | 'Repetition',
    count: number,        // raw count of this miscue type
    percentage: number,  // share of total miscues (0–100)
  }>,
  total: number,          // total miscues across all types
  loading: boolean,
  error: string | null,
}

Hook 2: useStudentTopMiscuePassageAndWords(studentId, timeRange)
Returns: {
  topPassage: {
    title: string,
    averageAccuracy: number,   // 0–100
    attempts: number,
    totalMiscues: number,
  } | null,
  topWords: Array<{
    word: string,
    errorCount: number,
    dominantMiscueType: string | null,
  }>,
  loading: boolean,
  error: string | null,
}

Time ranges: 'week' | 'month' | 'year'

─────────────────────────────────────────────────────────────
LAYOUT — 4 layers in order
─────────────────────────────────────────────────────────────

Layer 1 → TITLE + TIME RANGE TABS
  Title: "Miscue Insights" — one line, plain text.
  Three pill tabs: Week | Month | Year
  Active tab = filled (primary blue bg, white text)
  Inactive tab = primary blue text, transparent bg
  Tabs sit in a light blue rounded track container.

Layer 2 → MISCUE TYPE BREAKDOWN (Section Card)
  Card title: "Common Miscue Types"
  Card subtitle: "[This Week/Month/Year] · [N] total miscues"

  One row per miscue type (up to 4 rows):
    Row layout:
      [colored dot]  [Type label]     [percentage %]   ← header line
          [horizontal fill bar]               [count]  ← bar line

    Bar fills left-to-right normalized against the highest count
    among all 4 types (not against 100%).
    Bar background = light color for that type.
    Bar fill = vivid color for that type.
    Count label on the right = vivid color for that type.
    Percentage label on the right of the header = gray.

  Empty state (total === 0):
    Centered text: "No miscues recorded for this period 🎉"

Layer 3 → TOP MISCUED PASSAGE (Section Card)
  Card title: "Top Miscued Passage"

  Content:
    Passage title in italic bold primary blue (quoted)
    Below it: a 3-metric strip (same pattern as Layer 3 in
    the Accuracy & Speed component):
      [Accuracy %]  |  [Attempts]  |  [Miscues]
      Miscues value = red color to signal it is a problem metric.

  Empty state:
    Centered text: "No passage data for this period"

Layer 4 → MOST MISCUED WORDS (Section Card)
  Card title: "Most Miscued Words"

  One row per word (ranked list, up to N words from the hook):
    Row layout:
      [rank circle]  [word in italic bold]       [×count]
                     [dominant miscue type badge]

    Rank circle = small circle with rank number (1, 2, 3…)
      Background = light primary blue
      Text = primary blue
    Word = italic bold, dark ink color, quoted ("word")
    Dominant miscue type badge = colored pill
      Background and text color = that miscue type's color pair
    Count = "×N" on the far right, gray
    Rows separated by a thin bottom border.
    Last row has no border.

  Empty state:
    Centered text: "No word data for this period"

─────────────────────────────────────────────────────────────
STATES
─────────────────────────────────────────────────────────────

Loading state (either hook is loading):
  Spinner (ActivityIndicator) centered
  + text below: "Loading miscue insights…"
  Both hooks must finish loading before any content renders.

Error state (either hook returns an error):
  Light red card with border
  ⚠️ error message + sub-label "Failed to load miscue data"
  First error found wins — only one error state shown.

Empty states per section:
  Each of the 3 sections (breakdown, passage, words) has its own
  inline empty state. Sections are always visible even when empty.
  Only the content inside the section changes to the empty message.

─────────────────────────────────────────────────────────────
SECTION CARD STRUCTURE
─────────────────────────────────────────────────────────────

All three content sections share the same card style:
  Background: white
  Border: 1px light blue (#D7E9FF)
  Border radius: rounded (14px)
  Padding: comfortable inner spacing
  Bottom margin between cards

Cards do NOT have shadows — the border is enough separation.

─────────────────────────────────────────────────────────────
WHAT NOT TO DO
─────────────────────────────────────────────────────────────

✗ Do not use a pie chart or donut chart for miscue types.
  The horizontal bar breakdown is intentional — bars are
  easier to compare at a glance than pie slices.

✗ Do not normalize bars against 100%.
  Normalize against the highest count among the 4 types.
  This makes the dominant miscue type visually clear.

✗ Do not mix miscue type colors. Each type has exactly one
  color pair (bar + background). Use them consistently across
  all 3 sections. A "Substitution" badge in Section 3 must
  be the same red as the "Substitution" bar in Section 1.

✗ Do not add a summary total number outside of Section 1.
  The total miscue count belongs only in the Section 1 subtitle.

✗ Do not sort the word list inside the component.
  The hook returns words already sorted by errorCount descending.
  Render them in the order received.

✗ Do not show dominantMiscueType as plain text.
  It must always appear as a colored pill badge using the
  correct color pair for that miscue type.

✗ Do not wrap the component in SafeAreaView.
  It is a sub-component embedded inside a parent scroll view.

─────────────────────────────────────────────────────────────
DESIGN PRINCIPLES (Faculty sub-component)
─────────────────────────────────────────────────────────────

  - The component has no background color of its own.
    The parent card or screen provides the background.
  - Three sections answer three distinct questions:
      Section 1 → "What kinds of errors is the student making?"
      Section 2 → "Which reading passage causes the most errors?"
      Section 3 → "Which specific words keep tripping them up?"
  - Each section is self-contained with its own empty state.
    A teacher should be able to read one section independently.
  - The ranked word list is the most actionable output —
    a teacher can use it directly to plan targeted practice.
  - Keep section titles short and instructional, not decorative.
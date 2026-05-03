CONTEXT:
You are building a React Native data display component for a
Faculty/Teacher module in an educational reading assessment app.
The component shows a student's reading accuracy and speed (WPM)
trends over a selected time period.
The audience is teachers and parents — not children.

FONT: Nunito (Bold, Medium) — this is a faculty sub-component
      that lives inside a larger student profile view.
STACK: React Native CLI, TypeScript, no third-party chart libraries.
       All visuals are built with View + StyleSheet only.

─────────────────────────────────────────────────────────────
DATA SHAPE
─────────────────────────────────────────────────────────────

Input props:
  studentId: string

Hook: useStudentAccuracyTrends(studentId, timeRange)
Returns: {
  chartData: Array<{ date: string, accuracy: number, wpm: number }>,
  loading: boolean,
  error: string | null,
}

Time ranges: 'week' | 'month' | 'year'
  - week  → data points per day (e.g. Mon, Tue, Wed…)
  - month → data points per week
  - year  → data points per month

Computed from chartData:
  - avgAccuracy  → average of all accuracy values > 0
  - avgWpm       → average of all wpm values > 0
  - maxWpm       → highest wpm value (used to normalize WPM bars)
  - accDelta     → last accuracy minus first accuracy
  - accPct       → percentage change in accuracy over the period
  - accDir       → 'up' | 'down' | 'same'
  - peakAccIdx   → index of the data point with highest accuracy

─────────────────────────────────────────────────────────────
LAYOUT — 5 layers in order
─────────────────────────────────────────────────────────────

Layer 1 → TITLE
  Plain text: "Accuracy & Speed"
  One line only. No subtitle needed.

Layer 2 → TIME RANGE TABS
  Three pill buttons: Week | Month | Year
  Active tab = filled (primary color background, white text)
  Inactive tab = text only (primary color text, transparent bg)
  Contained in a rounded background track.

Layer 3 → SUMMARY STRIP
  Three metrics separated by vertical dividers:
    [Avg Accuracy %]  |  [Avg WPM]  |  [Trend ▲/▼ %]
  Trend value color:
    ▲ = green   (accuracy improved)
    ▼ = red     (accuracy dropped)
    — = gray    (no change)
  This is the ONLY place these three numbers appear.

Layer 4 → BAR BREAKDOWN (one row per data point)
  Contained in a single card with border.
  Each row has:
    - Date label on the left (fixed width, e.g. "Mon", "Wk 1")
      Peak row: bold label
    - Two stacked horizontal bars:
        Bar 1 (Accuracy): fills left-to-right based on accuracy %
          Default color = light blue
          Peak row color = primary blue (highlight the best day)
          Value label on the right: "85.0%" or "—" if no data
        Bar 2 (WPM): fills left-to-right, normalized against maxWpm
          Color = amber/yellow
          Value label on the right: "42" or "—" if no data
    - Rows separated by a thin bottom border
      Last row has no border

  Legend above the breakdown card:
    ● Accuracy   ● Speed (WPM)
    Two colored dots with labels. Centered. One line only.

Layer 5 → INSIGHT BAR
  A colored pill at the bottom.
  Background color:
    up   → light green background
    down → light red background
    same → light gray background
  Content: emoji icon + one sentence of plain text
    up   → "Accuracy improved by X% over this period."
    down → "Accuracy dropped by X%. Consider reviewing exercises."
    same → "Reading accuracy remained consistent."
  Text color matches the trend direction color.

─────────────────────────────────────────────────────────────
STATES
─────────────────────────────────────────────────────────────

Loading state:
  ActivityIndicator (spinner) centered
  + text: "Loading accuracy data…" below it

Error state:
  Light red card with border
  ⚠️ error message + sub-label: "Failed to load accuracy data"

Empty state (no data for selected range):
  Centered emoji 📊
  + text: "No data recorded yet."
  Shown in place of Layers 3–5 only.
  Layers 1–2 (title + tabs) remain visible.

─────────────────────────────────────────────────────────────
COLOR LOGIC
─────────────────────────────────────────────────────────────

Accuracy bars (default):  light blue  (#c0e8f2)
Accuracy bars (peak):     primary     (#3B7FC9)
WPM bars:                 amber bg    (#FEF3C7)
WPM value text:           amber       (#F59E0B)
Trend up:                 green       (#2CA96A)
Trend down:               red         (#EF4444)
Trend same:               gray        (#6B7280)
Insight bg up:            light green (#D4F1E8)
Insight bg down:          light red   (#FEE2E2)
Insight bg same:          light gray  (#F3F8FF)

─────────────────────────────────────────────────────────────
WHAT NOT TO DO
─────────────────────────────────────────────────────────────

✗ Do not use any third-party charting libraries
  (no Victory, no Recharts, no SVG-based charts)
✗ Do not add animations — this component is purely static
  display. No spring, no Animated.Value needed.
✗ Do not repeat the trend direction in both the summary strip
  AND the insight bar with the same wording. Summary shows
  the number. Insight bar shows the sentence. Not both.
✗ Do not show a separate legend and also label the bar values.
  The legend explains the color. The value label (right side
  of each bar) shows the number. They serve different roles.
✗ Do not stack more than 2 bars per row. One for accuracy,
  one for WPM. No third bar.
✗ Do not show the peakAccIdx highlight on rows where
  accuracy = 0 (no data recorded for that period).

─────────────────────────────────────────────────────────────
DESIGN PRINCIPLES (Faculty sub-component)
─────────────────────────────────────────────────────────────

  - This component is embedded inside a larger scroll view
    (student profile page). Do not wrap in SafeAreaView.
  - Keep the outer container as a plain <View> with no
    background color set — the parent card provides the bg.
  - Clarity over decoration. No shadows on individual bars.
  - The peak row is the only visually emphasized row.
    Everything else is uniform and de-emphasized.
  - One insight sentence is enough. Do not add bullet points
    or multi-line analysis text below the chart.
CONTEXT:
You are simplifying a React Native data dashboard component
for a Faculty/Teacher module in an educational reading assessment app.
The component displays a student's word reading mastery progress.
The audience is teachers and parents — not children.

FONT: Satoshi (Black, Bold, Medium, Regular, Italic)
STACK: React Native CLI, TypeScript, no third-party UI libraries

─────────────────────────────────────────────────────────────
CORE RULE: One layer = One question
─────────────────────────────────────────────────────────────

The component must answer exactly 4 questions, in order:

  Layer 1 → "How is the student overall?"
             Title + one-line subtitle (avg accuracy + words mastered)

  Layer 2 → "What is the total progress?"
             A single animated fill bar with one percentage number.
             Nothing else. No caption sentence below it.

  Layer 3 → "Which chapter are we looking at?"
             A horizontal scrollable row of pill buttons.
             Active pill = dark fill. Completed chapter = small green dot.
             No stat blocks. No accuracy numbers per chapter here.

  Layer 4a → "How is each lesson in this chapter?"
              A vertical list of lesson cards.
              Each card contains ONLY:
                - Lesson name (left)
                - Status badge: ✓ Done / 85% / Not tried (right)
                - One animated fill bar (left-to-right)
                - One fraction: 3/10 (right of the bar)
              Nothing else on the card.

  Layer 4b → "Which specific words did the student get right or wrong?"
              Only shown when teacher taps a lesson card.
              Shows a word tile grid:
                - Green tile = mastered (✓ mark)
                - Red tile = missed (✗ mark)
                - Gray tile = not tried yet
              Header shows: Lesson name + count chips (✓3  ✗2  —5)

─────────────────────────────────────────────────────────────
WHAT TO REMOVE — do not include these in the output:
─────────────────────────────────────────────────────────────

  ✗ Global summary strip (the 4-metric row: Avg Acc / Chapters /
    Lessons / Words). This duplicates the header and progress bar.

  ✗ Chapter stat blocks (the 3 colored bordered blocks showing
    Accuracy / Lessons Done / Words per chapter). Redundant with
    the lesson list directly below.

  ✗ Word dot strip inside lesson cards (the row of 10 small dots).
    The fill bar + fraction already show the same data.

  ✗ Session count ("3× played") from lesson cards.
    Clutter. Not needed at this level of view.

  ✗ Last played date from lesson cards.
    Belongs in a session log, not a mastery summary.

  ✗ Session replay footnote in the detail panel
    ("Practiced 3 times · last on May 1"). Redundant.

  ✗ Caption sentence below the overall progress bar
    ("X of Y words mastered across N chapters").
    The number already says this.

  ✗ Status chip in the header (the floating "74% Done" badge).
    Merge into the subtitle line instead.

─────────────────────────────────────────────────────────────
LOADING AND ERROR STATES:
─────────────────────────────────────────────────────────────

  - Loading: show a single centered text line "Loading word mastery…"
  - Error: show the error message in red, centered
  - Empty (no chapters): show a dashed-border empty state card
    with emoji, title, and one-line body text

─────────────────────────────────────────────────────────────
ANIMATIONS — keep these, they are purposeful:
─────────────────────────────────────────────────────────────

  ✓ FillBar — spring animation from 0% to actual percent on mount
  ✓ LessonCard — slide-up + fade-in, staggered by index (45ms delay)
  ✓ WordGrid tiles — spring scale-in, staggered by index (25ms delay)
  ✓ ChapterPill auto-scroll — scrollTo active pill on chapter change

─────────────────────────────────────────────────────────────
COLOR LOGIC — accent color based on accuracy:
─────────────────────────────────────────────────────────────

  >= 85%  → green  (#34d399)
  >= 60%  → amber  (#fbbf24)
  <  60%  → red    (#f87171)
  null    → dim gray (#e2e8f0)

  Each color has a matching Dim (background) and Border variant
  for use in badges, tiles, and selected card states.

─────────────────────────────────────────────────────────────
DESIGN PRINCIPLES (Faculty module):
─────────────────────────────────────────────────────────────

  - Clarity over decoration
  - Every element must earn its place
  - No element should repeat information already shown elsewhere
  - Progressive disclosure: show summary first, detail on demand
  - Tap to expand (lesson → word grid), not always visible
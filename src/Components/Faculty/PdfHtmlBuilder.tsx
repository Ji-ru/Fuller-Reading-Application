import PDF_CSS from './PdfStyles';
import {
  buildChapterProgressChartSvg,
  buildWordCompletionBarsSvg,
  buildAccuracyLineChartSvg,
  buildPassageSparklineSvg,
  buildMiscueDonutWithLabelsSvg,
  buildPairedBarChartSvg,
  buildMiscueBreakdownBarsSvg,
} from './PdfChartHelpers';

function esc(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(ts: any): string {
  try {
    const d = ts?.toDate?.() || new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function mapReadingLevelToGrade(level?: string): number | undefined {
  if (!level) return undefined;
  const m: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
  return m[level.toLowerCase()];
}

export interface PdfBuildOptions {
  studentName: string;
  readingLevel?: string;
  aralinDone: number;
  totalAttempts: number;
  groupedReports: {
    letter: string;
    aralinLabel: string;
    aralinProgress: number;
    activities: {
      type: 'Titik' | 'Salita' | 'Talata';
      title: string;
      reports: {
        accuracyRate: number;
        wordPerMin: number;
      }[];
    }[];
  }[];
  allReports: {
    timestamp: any;
    accuracyRate: number;
    wordPerMin: number;
    substitutionCount?: number;
    omissionCount?: number;
    insertionCount?: number;
    repetitionCount?: number;
  }[];
}

export function buildFacultyPdfHtml(opts: PdfBuildOptions): string {
  const { studentName, readingLevel, aralinDone, totalAttempts, groupedReports, allReports } = opts;

  const grade = mapReadingLevelToGrade(readingLevel);
  const gradeLabel = readingLevel ? readingLevel.charAt(0).toUpperCase() + readingLevel.slice(1) : '';

  const chapters = groupedReports
    .filter(g => g.aralinProgress > 0)
    .map(g => ({
      title: `${g.letter} — ${g.aralinLabel}`,
      done: g.aralinProgress,
      total: 100,
      pct: g.aralinProgress,
    }));

  const chapterSvg = buildChapterProgressChartSvg(chapters);

  const paired = groupedReports
    .filter(g => g.aralinProgress > 0)
    .slice(0, 20)
    .map(g => {
      const reports = g.activities.flatMap((a) => a.reports);
      const avgAcc = reports.length ? reports.reduce((s, r) => s + (r.accuracyRate || 0), 0) / reports.length : 0;
      const avgWpm = reports.length ? reports.reduce((s, r) => s + (isFinite(r.wordPerMin) ? r.wordPerMin || 0 : 0), 0) / reports.length : 0;
      return { label: g.aralinLabel, accuracy: avgAcc, wpm: avgWpm };
    });

  const maxWpm = Math.max(...paired.map(p => p.wpm), 1);
  const pairedSvg = buildPairedBarChartSvg(paired, maxWpm);

  const wordSlots: { label: string; correctCount: number }[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(lbl => ({
    label: lbl,
    correctCount: allReports.filter(r => {
      try {
        const d = r.timestamp?.toDate?.() || new Date(r.timestamp);
        return d.toLocaleDateString('en-US', { weekday: 'short' }) === lbl;
      } catch {
        return false;
      }
    }).length,
  }));
  const wordSlotsSvg = buildWordCompletionBarsSvg(wordSlots);

  const sorted = [...allReports].sort((a, b) => {
    const ta = a.timestamp?.toDate?.() || new Date(a.timestamp);
    const tb = b.timestamp?.toDate?.() || new Date(b.timestamp);
    return ta.getTime() - tb.getTime();
  });

  const chartData = sorted.map(r => ({
    date: fmtDate(r.timestamp),
    accuracy: r.accuracyRate || 0,
    wpm: r.wordPerMin || 0,
  }));

  const benchmarkAcc = grade ? (grade === 1 ? 90 : grade === 2 ? 92 : grade === 3 ? 94 : undefined) : undefined;
  const lineSvg = buildAccuracyLineChartSvg(chartData, benchmarkAcc);

  const passages = groupedReports
    .filter(g => g.activities.some(a => a.type === 'Talata'))
    .flatMap(g => g.activities.filter(a => a.type === 'Talata'));

  const historyHtml = passages
    .slice(0, 20)
    .map(p => {
      const values = p.reports.map((r) => r.accuracyRate || 0);
      const sparkline = buildPassageSparklineSvg(values);
      const latest = p.reports[0];
      const acc = latest ? (latest.accuracyRate || 0).toFixed(1) + '%' : '—';
      const wpm = latest && isFinite(latest.wordPerMin) ? latest.wordPerMin.toFixed(0) : '—';
      return `
        <tr>
          <td>${esc(p.title)}</td>
          <td class="sparkline-cell">${sparkline}</td>
          <td style="text-align:center;font-weight:800;color:#154360">${acc}</td>
          <td style="text-align:center;font-weight:800;color:#154360">${wpm}</td>
          <td style="text-align:center">${p.reports.length}</td>
        </tr>`;
    })
    .join('');

  const miscueCounts = [
    { type: 'substitution', label: 'Substitution', count: 0, color: '#3d71d9' },
    { type: 'omission', label: 'Omission', count: 0, color: '#f59e0b' },
    { type: 'insertion', label: 'Insertion', count: 0, color: '#ef4444' },
    { type: 'repetition', label: 'Repetition', count: 0, color: '#7d4b9a' },
  ];

  allReports.forEach(r => {
    miscueCounts[0].count += r.substitutionCount || 0;
    miscueCounts[1].count += r.omissionCount || 0;
    miscueCounts[2].count += r.insertionCount || 0;
    miscueCounts[3].count += r.repetitionCount || 0;
  });

  const totalMiscues = miscueCounts.reduce((s, m) => s + m.count, 0);
  const donutSvg = buildMiscueDonutWithLabelsSvg(totalMiscues, miscueCounts.map(m => ({
    type: m.type,
    count: m.count,
    pct: totalMiscues > 0 ? m.count / totalMiscues : 0,
  })));

  const miscueBars = buildMiscueBreakdownBarsSvg(
    miscueCounts.filter(m => m.count > 0).map(m => ({
      label: m.label,
      count: m.count,
      color: m.color,
    })),
  );

  const insight =
    allReports.length > 0
      ? `This report covers ${allReports.length} attempt(s) across ${groupedReports.filter(g => g.aralinProgress > 0).length} active lesson(s).`
      : 'No data available for the selected period.';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>${PDF_CSS}</style>
</head>
<body>
  <div class="cover">
    <h1>Reading Progress Report</h1>
    <div class="student">${esc(studentName)}</div>
    ${gradeLabel ? `<div class="level">Level: ${esc(gradeLabel)}</div>` : ''}
  </div>

  <div class="summary-strip">
    <div class="stat-box"><div class="val">${aralinDone}</div><div class="lbl">Lessons Active</div></div>
    <div class="stat-box"><div class="val">${totalAttempts}</div><div class="lbl">Total Attempts</div></div>
    <div class="stat-box"><div class="val">${totalMiscues}</div><div class="lbl">Total Miscues</div></div>
  </div>

  <div class="section-title">Overview — Accuracy &amp; Speed</div>
  <div class="chart-box">
    <div class="chart-label">Per-Lesson Accuracy vs WPM</div>
    ${pairedSvg || '<div class="empty-placeholder">No overview data available.</div>'}
  </div>

  <div class="section-title">Chapter Progress</div>
  <div class="chart-box">
    ${chapterSvg || '<div class="empty-placeholder">No chapter progress data.</div>'}
  </div>

  <div class="section-title">Word Mastery — weekly completion</div>
  <div class="chart-box">
    ${wordSlotsSvg || '<div class="empty-placeholder">No word mastery data.</div>'}
  </div>

  <div class="section-title">Accuracy Trend</div>
  <div class="chart-box">
    ${lineSvg || '<div class="empty-placeholder">No trend data for this period.</div>'}
  </div>

  <div class="section-title">Miscue Analysis</div>
  <div class="chart-box" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
    <div style="flex:1;min-width:180px;">${donutSvg || '<div class="empty-placeholder">No miscue data.</div>'}</div>
    <div style="flex:1;min-width:220px;">${miscueBars || '<div class="empty-placeholder">No miscue breakdown.</div>'}</div>
  </div>

  <div class="section-title">Passage History</div>
  <div class="chart-box">
    ${historyHtml ? `
      <table class="table">
        <thead><tr><th>Passage</th><th>Trend</th><th>Accuracy</th><th>WPM</th><th>Sessions</th></tr></thead>
        <tbody>${historyHtml}</tbody>
      </table>
    ` : '<div class="empty-placeholder">No passage history yet.</div>'}
  </div>

  <div class="section-title">Per-Lesson Detail</div>
  <div class="chart-box">
    ${chapters.length === 0 ? '<div class="empty-placeholder">No active lessons.</div>' : chapters.map((ch, i) => `
      <div class="aralin-card">
        <div class="aralin-card-header">
          <div class="aralin-icon" style="background:#3d71d915;color:#154360">${esc(ch.title.charAt(0).toUpperCase())}</div>
          <div class="aralin-title">${esc(ch.title)}</div>
          <span class="badge badge-green">${ch.pct}%</span>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="insight-strip up">${esc(insight)}</div>

  <div class="footer">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} — Faculty Reading Report</div>
</body>
</html>`;
}

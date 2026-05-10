import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { sw, sh, sf } from '../../Utils/responsive';
import RNPrint from 'react-native-print';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

// ─── Hardcoded sample data (same shape as real reports) ───────────────────────
const HARDCODED_DATA = [
  {
    PassageTitle: 'The Little Red Hen',
    Date: 'May 1, 2025',
    AccuracyRate: 92.5,
    WordsPerMinute: 78,
    Duration: '2:14',
    TotalMiscues: 3,
    Substitutions: 'hen→him',
    Omissions: 'the',
    Insertions: 'None',
    Repetitions: 'little',
  },
  {
    PassageTitle: 'The Little Red Hen',
    Date: 'May 3, 2025',
    AccuracyRate: 95.0,
    WordsPerMinute: 85,
    Duration: '2:01',
    TotalMiscues: 1,
    Substitutions: 'None',
    Omissions: 'None',
    Insertions: 'None',
    Repetitions: 'red',
  },
  {
    PassageTitle: 'Jack and Jill',
    Date: 'May 5, 2025',
    AccuracyRate: 88.0,
    WordsPerMinute: 70,
    Duration: '1:45',
    TotalMiscues: 5,
    Substitutions: 'Jill→Gill',
    Omissions: 'and, up',
    Insertions: 'the',
    Repetitions: 'None',
  },
  {
    PassageTitle: 'Jack and Jill',
    Date: 'May 7, 2025',
    AccuracyRate: 91.0,
    WordsPerMinute: 76,
    Duration: '1:52',
    TotalMiscues: 2,
    Substitutions: 'None',
    Omissions: 'jack',
    Insertions: 'None',
    Repetitions: 'and',
  },
  {
    PassageTitle: 'The Sun and the Wind',
    Date: 'May 8, 2025',
    AccuracyRate: 97.5,
    WordsPerMinute: 90,
    Duration: '3:10',
    TotalMiscues: 0,
    Substitutions: 'None',
    Omissions: 'None',
    Insertions: 'None',
    Repetitions: 'None',
  },
];

// ─── SVG Chart Builders ────────────────────────────────────────────────────────

/** Converts polar coords → cartesian for SVG arcs */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Builds a single donut SVG arc path string */
function donutArc(
  cx: number, cy: number, outerR: number, innerR: number,
  startAngle: number, endAngle: number,
): string {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const os = polar(cx, cy, outerR, startAngle);
  const oe = polar(cx, cy, outerR, endAngle);
  const ie = polar(cx, cy, innerR, endAngle);
  const is_ = polar(cx, cy, innerR, startAngle);
  return [
    `M ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
    `L ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${is_.x.toFixed(2)} ${is_.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

/** Builds the inline SVG donut chart for miscue type distribution */
function buildDonutSvg(subCount: number, omCount: number, inCount: number, repCount: number): string {
  const total = subCount + omCount + inCount + repCount;
  if (total === 0) {
    return `<svg width="220" height="220" viewBox="0 0 220 220">
      <circle cx="110" cy="110" r="80" fill="none" stroke="#E5E7EB" stroke-width="35"/>
      <text x="110" y="115" text-anchor="middle" font-size="14" fill="#6B7280" font-family="Arial">No Miscues</text>
    </svg>`;
  }

  const segments = [
    { count: subCount, color: '#EF4444', label: 'Substitution' },
    { count: omCount,  color: '#F59E0B', label: 'Omission'     },
    { count: inCount,  color: '#3B82F6', label: 'Insertion'    },
    { count: repCount, color: '#10B981', label: 'Repetition'   },
  ].filter(s => s.count > 0);

  let currentAngle = 0;
  const cx = 110, cy = 110, outerR = 80, innerR = 48;

  const paths = segments.map(seg => {
    const sweep = (seg.count / total) * 360;
    const path = donutArc(cx, cy, outerR, innerR, currentAngle, currentAngle + sweep);
    currentAngle += sweep;
    return `<path d="${path}" fill="${seg.color}" stroke="white" stroke-width="2"/>`;
  });

  return `<svg width="220" height="220" viewBox="0 0 220 220">
    ${paths.join('\n    ')}
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="22" font-weight="bold" fill="#1F2937" font-family="Arial">${total}</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="#6B7280" font-family="Arial">total miscues</text>
  </svg>`;
}

/** Builds the inline SVG bar chart for accuracy & WPM per passage */
function buildBarChartSvg(
  passages: { label: string; accuracy: number; wpm: number }[],
): string {
  const W = 500, H = 220;
  const padL = 45, padR = 20, padT = 20, padB = 50;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const n = passages.length;
  const groupW = chartW / n;
  const barW = Math.min(30, groupW * 0.35);
  const gap = 6;

  // Y-axis: 0–100 for accuracy, scaled WPM to same axis (WPM/150*100)
  const yScale = (val: number) => padT + chartH - (val / 100) * chartH;

  // Gridlines at 0,25,50,75,100
  const gridLines = [0, 25, 50, 75, 100].map(v => {
    const y = yScale(v);
    return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#E5E7EB" stroke-width="1"/>
    <text x="${(padL - 6).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#9CA3AF" font-family="Arial">${v}</text>`;
  }).join('\n');

  const bars = passages.map((p, i) => {
    const cx = padL + i * groupW + groupW / 2;
    const accX = cx - barW - gap / 2;
    const wpmX = cx + gap / 2;

    const accH = (p.accuracy / 100) * chartH;
    const accY = yScale(p.accuracy);
    const wpmScaled = Math.min((p.wpm / 150) * 100, 100);
    const wpmH = (wpmScaled / 100) * chartH;
    const wpmY = yScale(wpmScaled);

    const labelY = H - padB + 16;
    // Truncate long labels
    const shortLabel = p.label.length > 14 ? p.label.slice(0, 13) + '…' : p.label;

    return `
    <rect x="${accX.toFixed(1)}" y="${accY.toFixed(1)}" width="${barW}" height="${accH.toFixed(1)}" fill="#388E3C" rx="3"/>
    <text x="${(accX + barW / 2).toFixed(1)}" y="${(accY - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="#388E3C" font-family="Arial" font-weight="bold">${p.accuracy.toFixed(0)}%</text>
    <rect x="${wpmX.toFixed(1)}" y="${wpmY.toFixed(1)}" width="${barW}" height="${wpmH.toFixed(1)}" fill="#3B82F6" rx="3"/>
    <text x="${(wpmX + barW / 2).toFixed(1)}" y="${(wpmY - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="#3B82F6" font-family="Arial" font-weight="bold">${p.wpm}</text>
    <text x="${cx.toFixed(1)}" y="${labelY}" text-anchor="middle" font-size="9" fill="#374151" font-family="Arial">${shortLabel}</text>`;
  }).join('\n');

  // Legend
  const legend = `
    <rect x="${padL}" y="${H - 12}" width="10" height="10" fill="#388E3C" rx="2"/>
    <text x="${padL + 14}" y="${H - 4}" font-size="9" fill="#374151" font-family="Arial">Accuracy (%)</text>
    <rect x="${padL + 110}" y="${H - 12}" width="10" height="10" fill="#3B82F6" rx="2"/>
    <text x="${padL + 124}" y="${H - 4}" font-size="9" fill="#374151" font-family="Arial">WPM (scaled)</text>`;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${gridLines}
  <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="#D1D5DB" stroke-width="1.5"/>
  <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="#D1D5DB" stroke-width="1.5"/>
  ${bars}
  ${legend}
</svg>`;
}

// ─── HTML Report Builder ───────────────────────────────────────────────────────
function buildPdfHtml(
  data: typeof HARDCODED_DATA,
  studentName: string,
  generatedAt: string,
): string {
  // ── Aggregate per passage ──────────────────────────────────────────────────
  const passageMap = new Map<string, { acc: number[]; wpm: number[] }>();
  for (const row of data) {
    if (!passageMap.has(row.PassageTitle)) passageMap.set(row.PassageTitle, { acc: [], wpm: [] });
    passageMap.get(row.PassageTitle)!.acc.push(row.AccuracyRate);
    passageMap.get(row.PassageTitle)!.wpm.push(row.WordsPerMinute);
  }
  const aggregated = Array.from(passageMap.entries()).map(([title, vals]) => ({
    label: title,
    accuracy: vals.acc.reduce((s, v) => s + v, 0) / vals.acc.length,
    wpm: Math.round(vals.wpm.reduce((s, v) => s + v, 0) / vals.wpm.length),
  }));

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalAttempts = data.length;
  const avgAccuracy = (data.reduce((s, r) => s + r.AccuracyRate, 0) / totalAttempts).toFixed(1);
  const bestWpm = Math.max(...data.map(r => r.WordsPerMinute));
  const totalMiscues = data.reduce((s, r) => s + r.TotalMiscues, 0);

  // ── Miscue totals ──────────────────────────────────────────────────────────
  const countMiscue = (field: string) =>
    data.filter(r => (r as any)[field] !== 'None')
      .reduce((s, r) => {
        const val = (r as any)[field] as string;
        return s + (val ? val.split(',').length : 0);
      }, 0);

  const subTotal = countMiscue('Substitutions');
  const omTotal  = countMiscue('Omissions');
  const inTotal  = countMiscue('Insertions');
  const repTotal = countMiscue('Repetitions');

  // ── SVG charts ─────────────────────────────────────────────────────────────
  const barChartSvg  = buildBarChartSvg(aggregated);
  const donutSvg     = buildDonutSvg(subTotal, omTotal, inTotal, repTotal);

  // ── Session rows ───────────────────────────────────────────────────────────
  const tableRows = data.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#F9FAFB' : '#FFFFFF'}">
      <td>${r.PassageTitle}</td>
      <td>${r.Date}</td>
      <td style="text-align:center;font-weight:bold;color:${r.AccuracyRate >= 90 ? '#16A34A' : r.AccuracyRate >= 80 ? '#D97706' : '#DC2626'}">${r.AccuracyRate}%</td>
      <td style="text-align:center">${r.WordsPerMinute}</td>
      <td style="text-align:center">${r.Duration}</td>
      <td style="text-align:center">${r.TotalMiscues === 0 ? '✓ None' : r.TotalMiscues}</td>
    </tr>`).join('');

  // ── Full HTML ──────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #1F2937;
    background: #ffffff;
    padding: 28px 32px;
    font-size: 13px;
  }

  /* ── Header ── */
  .report-header {
    background: linear-gradient(135deg, #1B5E20 0%, #388E3C 100%);
    border-radius: 12px;
    padding: 22px 28px;
    color: white;
    margin-bottom: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .report-header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
  .report-header p  { font-size: 12px; opacity: 0.85; margin-top: 4px; }
  .report-header .badge {
    background: rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 12px;
    text-align: right;
  }
  .report-header .badge strong { display: block; font-size: 16px; margin-bottom: 2px; }

  /* ── Summary cards ── */
  .summary-grid {
    display: flex;
    gap: 12px;
    margin-bottom: 22px;
  }
  .summary-card {
    flex: 1;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 10px;
    padding: 14px 10px;
    text-align: center;
  }
  .summary-card .val { font-size: 26px; font-weight: 800; color: #15803D; }
  .summary-card .lbl { font-size: 10px; color: #6B7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── Section titles ── */
  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #1F2937;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #D1FAE5;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ── Charts row ── */
  .charts-row {
    display: flex;
    gap: 20px;
    margin-bottom: 22px;
    align-items: flex-start;
  }
  .chart-box {
    background: #FAFAFA;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 16px;
  }
  .chart-box.bar  { flex: 1; }
  .chart-box.donut { width: 280px; }

  /* ── Donut legend ── */
  .donut-wrap { display: flex; align-items: center; gap: 16px; }
  .donut-legend { display: flex; flex-direction: column; gap: 8px; }
  .legend-item { display: flex; align-items: center; gap: 7px; font-size: 11px; color: #374151; }
  .legend-dot  { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }

  /* ── Table ── */
  .table-box {
    background: #FAFAFA;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 22px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  th {
    background: #1B5E20;
    color: white;
    padding: 9px 10px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  th:first-child { border-radius: 6px 0 0 0; }
  th:last-child  { border-radius: 0 6px 0 0; }
  td { padding: 8px 10px; border-bottom: 1px solid #F3F4F6; font-size: 11.5px; }

  /* ── Footer ── */
  .footer {
    text-align: center;
    font-size: 10px;
    color: #9CA3AF;
    padding-top: 14px;
    border-top: 1px solid #F3F4F6;
  }
  .footer strong { color: #388E3C; }
</style>
</head>
<body>

  <!-- ── HEADER ── -->
  <div class="report-header">
    <div>
      <h1>📚 Reading Assessment Report</h1>
      <p>Miscue Analysis &amp; Performance Overview</p>
    </div>
    <div class="badge">
      <strong>${studentName}</strong>
      Generated: ${generatedAt}
    </div>
  </div>

  <!-- ── SUMMARY STATS ── -->
  <div class="summary-grid">
    <div class="summary-card">
      <div class="val">${passageMap.size}</div>
      <div class="lbl">Passages</div>
    </div>
    <div class="summary-card">
      <div class="val">${totalAttempts}</div>
      <div class="lbl">Total Sessions</div>
    </div>
    <div class="summary-card">
      <div class="val">${avgAccuracy}%</div>
      <div class="lbl">Avg. Accuracy</div>
    </div>
    <div class="summary-card">
      <div class="val">${bestWpm}</div>
      <div class="lbl">Best WPM</div>
    </div>
    <div class="summary-card">
      <div class="val">${totalMiscues}</div>
      <div class="lbl">Total Miscues</div>
    </div>
  </div>

  <!-- ── CHARTS ROW ── -->
  <div class="charts-row">
    <!-- Bar chart -->
    <div class="chart-box bar">
      <div class="section-title">📊 Accuracy &amp; Speed per Passage</div>
      ${barChartSvg}
    </div>

    <!-- Donut chart -->
    <div class="chart-box donut">
      <div class="section-title">🔍 Miscue Distribution</div>
      <div class="donut-wrap">
        ${donutSvg}
        <div class="donut-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#EF4444"></div>Substitution (${subTotal})</div>
          <div class="legend-item"><div class="legend-dot" style="background:#F59E0B"></div>Omission (${omTotal})</div>
          <div class="legend-item"><div class="legend-dot" style="background:#3B82F6"></div>Insertion (${inTotal})</div>
          <div class="legend-item"><div class="legend-dot" style="background:#10B981"></div>Repetition (${repTotal})</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── SESSIONS TABLE ── -->
  <div class="table-box">
    <div class="section-title">📋 All Reading Sessions</div>
    <table>
      <thead>
        <tr>
          <th>Passage</th>
          <th>Date</th>
          <th style="text-align:center">Accuracy</th>
          <th style="text-align:center">WPM</th>
          <th style="text-align:center">Duration</th>
          <th style="text-align:center">Miscues</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>

  <!-- ── FOOTER ── -->
  <div class="footer">
    Generated by <strong>Reading Assessment System</strong> &nbsp;·&nbsp; ${generatedAt}
  </div>

</body>
</html>`;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface ExportPdfButtonProps {
  data?: typeof HARDCODED_DATA;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ExportPdf({
  data = HARDCODED_DATA,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    const fetchName = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;
        const snap = await getDoc(doc(getFirestore(), 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data() as any;
          const name =
            d?.studentData?.name ??
            d?.studentData?.fullName ??
            d?.displayName ??
            user.displayName ??
            'Student';
          setStudentName(name);
        }
      } catch {
        // silently fall back to 'Student'
      }
    };
    fetchName();
  }, []);
  
const handleExport = async () => {
  try {
    setIsExporting(true);

    const now = new Date();
    const generatedAt = now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const html = buildPdfHtml(data, studentName, generatedAt);

    await RNPrint.print({ html });

  } catch (error: any) {
    console.error('PDF export error:', error);
    Alert.alert('Export Failed', 'Could not generate the PDF. Please try again.');
  } finally {
    setIsExporting(false);
  }
};

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handleExport}
      activeOpacity={0.8}
      disabled={isExporting}
    >
      {isExporting ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.btnText}>📄 PDF</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B91C1C', // PDF red
    borderRadius: sw(8),
    paddingVertical: sh(6),
    paddingHorizontal: sw(12),
    elevation: 3,
    shadowColor: '#7F1D1D',
    shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3),
    minWidth: sw(80),
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
  },
});
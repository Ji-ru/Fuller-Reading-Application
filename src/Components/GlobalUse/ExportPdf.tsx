import React, { useState, useEffect, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { sw, sh, sf } from '../../Utils/responsive';
import RNPrint from 'react-native-print';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

import { useStudentCompletedWord } from '../../Hooks/Student/use_StudentCompletedReading';
import { useStudentWordMastery } from '../../Hooks/Student/useStudentWordMastery';
import {
  useStudentAccuracyTrends,
  useStudentMiscueStats,
  useStudentTopMiscuePassageAndWords,
} from '../../Hooks/Faculty/use_StudentView_Progress';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { MiscueReportDocument } from '../../Interfaces/dataInterfaces';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial_new.json';

// ═════════════════════════════════════════════════════════════════════════════
// Types
// ═════════════════════════════════════════════════════════════════════════════

type HistoryFilter = 'week' | 'month' | 'year';
type TimeRange = 'week' | 'month' | 'year';

interface ReportData {
  id: string;
  timestamp: any;
  accuracyRate: number;
  wordPerMin: number;
  recordingDuration?: string;
  totalMiscues?: number;
  substitution: string;
  omission: string;
  insertion: string;
  repetition: string;
  substitutionCount?: number;
  omissionCount?: number;
  insertionCount?: number;
  repetitionCount?: number;
  miscues?: any[];
}

interface GroupedReport {
  passageTitle: string;
  reports: ReportData[];
}

interface ExportPdfButtonProps {
  /** Student whose data to export. Falls back to currently authenticated user. */
  studentId?: string;
  /** Reports already grouped by passage (from Student_History). If omitted, ExportPdf fetches them. */
  groupedReports?: GroupedReport[];
  /** History tab filter — Week/Month/Year. */
  historyFilter?: HistoryFilter;
  historyAnchor?: Date;
  historySelectedDay?: number | null;
  historySelectedWeekOfMonth?: number | null;
  /** Analytics + Word Mastery tab filter (Word Mastery reuses this per user choice). */
  perfTimeRange?: TimeRange;
  perfAnchor?: Date;
  perfSelectedDay?: number | null;
  perfSelectedWeekOfMonth?: number | null;
  gradeLevel?: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// Date helpers — mirrored from Student_History so the PDF and screen agree
// ═════════════════════════════════════════════════════════════════════════════

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getWeekStart = (d: Date): Date => {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getWeekEnd = (d: Date): Date => {
  const start = getWeekStart(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getAcadYearStart = (d: Date): Date => {
  const year = d.getMonth() >= 5 ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(year, 5, 1, 0, 0, 0, 0);
};

const getAcadYearEnd = (d: Date): Date => {
  const start = getAcadYearStart(d);
  return new Date(start.getFullYear() + 1, 2, 31, 23, 59, 59, 999);
};

const getFilterRange = (filter: HistoryFilter, anchor: Date): [Date, Date] => {
  if (filter === 'week') return [getWeekStart(anchor), getWeekEnd(anchor)];
  if (filter === 'month') {
    const s = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0);
    const e = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
    return [s, e];
  }
  return [getAcadYearStart(anchor), getAcadYearEnd(anchor)];
};

const formatPeriodLabel = (filter: HistoryFilter, anchor: Date): string => {
  if (filter === 'week') {
    const s = getWeekStart(anchor);
    const e = getWeekEnd(anchor);
    const sameMonth = s.getMonth() === e.getMonth();
    return sameMonth
      ? `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`
      : `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  }
  if (filter === 'month') return `${MONTHS_SHORT[anchor.getMonth()]} ${anchor.getFullYear()}`;
  const start = getAcadYearStart(anchor);
  return `SY ${start.getFullYear()} – ${start.getFullYear() + 1}`;
};

// ═════════════════════════════════════════════════════════════════════════════
// Small utilities
// ═════════════════════════════════════════════════════════════════════════════

const esc = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDuration = (duration?: string | number): string => {
  if (duration === undefined || duration === null || duration === '') return 'N/A';
  if (typeof duration === 'string') {
    if (/^\d+:\d{2}$/.test(duration)) return duration;
    const s = parseInt(duration, 10);
    if (!isNaN(s) && s > 0) return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    return 'N/A';
  }
  if (duration <= 0) return 'N/A';
  return `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
};

const formatDateLong = (timestamp: any): string => {
  if (!timestamp) return 'Unknown Date';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

const getTotalMiscues = (r: ReportData): number => {
  if (r.totalMiscues !== undefined) return r.totalMiscues;
  if (r.miscues && Array.isArray(r.miscues)) return r.miscues.length;
  return (r.substitutionCount || 0) + (r.omissionCount || 0)
    + (r.insertionCount || 0) + (r.repetitionCount || 0);
};

const groupReportsByPassage = (reports: MiscueReportDocument[]): GroupedReport[] => {
  const groupMap = new Map<string, ReportData[]>();
  reports.forEach(report => {
    const passageTitle = report.passageTitle || 'Unknown Passage';
    if (!groupMap.has(passageTitle)) groupMap.set(passageTitle, []);
    groupMap.get(passageTitle)!.push({
      id: report.reportId,
      timestamp: report.createdAt,
      accuracyRate: report.accuracyRate || 0,
      wordPerMin: report.wordPerMin || 0,
      recordingDuration: report.recordingDuration,
      substitution: report.substitution || 'None',
      omission: report.omission || 'None',
      insertion: report.insertion || 'None',
      repetition: report.repetition || 'None',
      miscues: report.miscues || [],
      totalMiscues: (report as any).totalMiscues,
      substitutionCount: (report as any).substitutionCount,
      omissionCount: (report as any).omissionCount,
      insertionCount: (report as any).insertionCount,
      repetitionCount: (report as any).repetitionCount,
    });
  });
  return Array.from(groupMap.entries()).map(([passageTitle, reps]) => ({
    passageTitle,
    reports: reps.sort((a, b) => {
      const A = a.timestamp?.toDate?.() || new Date(0);
      const B = b.timestamp?.toDate?.() || new Date(0);
      return B.getTime() - A.getTime();
    }),
  }));
};

// ═════════════════════════════════════════════════════════════════════════════
// SVG chart helpers
// ═════════════════════════════════════════════════════════════════════════════

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

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

function buildDonutSvg(
  segments: { count: number; color: string; label: string }[],
  centerCaption = 'total',
): string {
  const total = segments.reduce((s, x) => s + x.count, 0);
  if (total === 0) {
    return `<svg width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="72" fill="none" stroke="#E5E7EB" stroke-width="32"/>
      <text x="100" y="105" text-anchor="middle" font-size="13" fill="#6B7280" font-family="Arial">No Data</text>
    </svg>`;
  }
  const filtered = segments.filter(s => s.count > 0);
  let angle = 0;
  const cx = 100, cy = 100, outerR = 72, innerR = 42;
  const paths = filtered.map(s => {
    const sweep = (s.count / total) * 360;
    const path = donutArc(cx, cy, outerR, innerR, angle, angle + sweep);
    angle += sweep;
    return `<path d="${path}" fill="${s.color}" stroke="white" stroke-width="2"/>`;
  });
  return `<svg width="200" height="200" viewBox="0 0 200 200">
    ${paths.join('\n    ')}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="20" font-weight="bold" fill="#1F2937" font-family="Arial">${total}</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" fill="#6B7280" font-family="Arial">${esc(centerCaption)}</text>
  </svg>`;
}

/** Grouped (paired) bar chart used by the original PDF — kept for Accuracy & WPM per passage. */
function buildPairedBarChartSvg(
  passages: { label: string; accuracy: number; wpm: number }[],
): string {
  const W = 500, H = 220;
  const padL = 45, padR = 20, padT = 20, padB = 50;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = Math.max(passages.length, 1);
  const groupW = chartW / n;
  const barW = Math.min(28, groupW * 0.35);
  const gap = 6;
  const yScale = (val: number) => padT + chartH - (val / 100) * chartH;

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
    const shortLabel = p.label.length > 14 ? p.label.slice(0, 13) + '…' : p.label;
    return `
    <rect x="${accX.toFixed(1)}" y="${accY.toFixed(1)}" width="${barW}" height="${accH.toFixed(1)}" fill="#388E3C" rx="3"/>
    <text x="${(accX + barW / 2).toFixed(1)}" y="${(accY - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="#388E3C" font-family="Arial" font-weight="bold">${p.accuracy.toFixed(0)}%</text>
    <rect x="${wpmX.toFixed(1)}" y="${wpmY.toFixed(1)}" width="${barW}" height="${wpmH.toFixed(1)}" fill="#3B82F6" rx="3"/>
    <text x="${(wpmX + barW / 2).toFixed(1)}" y="${(wpmY - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="#3B82F6" font-family="Arial" font-weight="bold">${p.wpm}</text>
    <text x="${cx.toFixed(1)}" y="${labelY}" text-anchor="middle" font-size="9" fill="#374151" font-family="Arial">${esc(shortLabel)}</text>`;
  }).join('\n');

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

/** Single-series vertical bar chart (0–100 accuracy, used for Sessions trend bars). */
function buildAccuracyBarsSvg(items: { label: string; value: number | null }[]): string {
  const W = 500, H = 180;
  const padL = 40, padR = 16, padT = 16, padB = 42;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = Math.max(items.length, 1);
  const groupW = chartW / n;
  const barW = Math.min(26, groupW * 0.6);
  const yScale = (v: number) => padT + chartH - (v / 100) * chartH;

  const colorFor = (v: number | null) =>
    v === null ? '#E5E7EB' : v >= 85 ? '#34d399' : v >= 60 ? '#fbbf24' : '#f87171';

  const gridLines = [0, 25, 50, 75, 100].map(v => {
    const y = yScale(v);
    return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#EEF2F7" stroke-width="1"/>
    <text x="${(padL - 6).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#9CA3AF" font-family="Arial">${v}</text>`;
  }).join('\n');

  const bars = items.map((it, i) => {
    const cx = padL + i * groupW + groupW / 2;
    const x = cx - barW / 2;
    const v = it.value;
    const labelY = H - padB + 16;
    const shortLabel = it.label.length > 8 ? it.label.slice(0, 7) + '…' : it.label;
    if (v === null) {
      return `<text x="${cx.toFixed(1)}" y="${(H - padB - 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#9CA3AF" font-family="Arial">—</text>
      <text x="${cx.toFixed(1)}" y="${labelY}" text-anchor="middle" font-size="9" fill="#9CA3AF" font-family="Arial">${esc(shortLabel)}</text>`;
    }
    const h = (v / 100) * chartH;
    const y = yScale(v);
    const color = colorFor(v);
    return `
    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" fill="${color}" rx="3"/>
    <text x="${cx.toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="middle" font-size="9" fill="${color}" font-family="Arial" font-weight="bold">${v}%</text>
    <text x="${cx.toFixed(1)}" y="${labelY}" text-anchor="middle" font-size="9" fill="#374151" font-family="Arial">${esc(shortLabel)}</text>`;
  }).join('\n');

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${gridLines}
  <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="#D1D5DB" stroke-width="1.5"/>
  <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="#D1D5DB" stroke-width="1.5"/>
  ${bars}
</svg>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Per-section HTML builders
// ═════════════════════════════════════════════════════════════════════════════

interface WordCompletion { word: string; }

function buildProgressSectionHtml(
  completedWords: WordCompletion[],
): string {

  const WORD_CHAPTERS: any[] = (readingMaterialData as any).Words?.[0]?.chapters ?? [];
  const wordSet = new Set(completedWords.map(w => (w as any).word?.trim().toLowerCase()).filter(Boolean));

  const chapters = WORD_CHAPTERS.map(ch => {
    const lessons = (ch.lessons || []).map((ls: any) => {
      const total = ls.words?.length ?? 0;
      const done = (ls.words || []).filter((w: string) => wordSet.has(w.trim().toLowerCase())).length;
      return { title: ls.title, total, done, pct: total > 0 ? (done / total) * 100 : 0 };
    });
    const total = lessons.reduce((s: number, l: any) => s + l.total, 0);
    const done = lessons.reduce((s: number, l: any) => s + l.done, 0);
    return {
      title: ch.title,
      lessons,
      total,
      done,
      pct: total > 0 ? (done / total) * 100 : 0,
      completedLessons: lessons.filter((l: any) => l.pct >= 100).length,
    };
  });

  const wordTotal = chapters.reduce((s, c) => s + c.total, 0);
  const wordDone = chapters.reduce((s, c) => s + c.done, 0);
  const wordPct = wordTotal > 0 ? (wordDone / wordTotal) * 100 : 0;

  const statusColor = (pct: number) =>
    pct >= 100 ? '#2CA96A' : pct >= 50 ? '#F59E0B' : pct > 0 ? '#EF4444' : '#9CA3AF';

  const chapterCards = chapters.map(ch => {
    const c = statusColor(ch.pct);
    const lessonRows = ch.lessons.map((ls: any) => {
      const lc = statusColor(ls.pct);
      return `
      <div class="lesson-row">
        <span class="lesson-dot" style="background:${lc}"></span>
        <div class="lesson-body">
          <div class="lesson-label-row">
            <span class="lesson-title">${esc(ls.title)}</span>
            <span class="lesson-frac" style="color:${lc}">${ls.done}/${ls.total}</span>
          </div>
          <div class="bar-track sm">
            <div class="bar-fill" style="width:${Math.min(ls.pct, 100).toFixed(1)}%;background:${lc}"></div>
          </div>
        </div>
      </div>`;
    }).join('');

    return `
    <div class="chapter-card">
      <div class="chapter-head">
        <div>
          <div class="chapter-title">${esc(ch.title)}</div>
          <div class="chapter-meta">${ch.completedLessons}/${ch.lessons.length} lessons · ${ch.done}/${ch.total} words</div>
        </div>
        <span class="pct-pill" style="background:${c}1f;color:${c}">${ch.pct.toFixed(0)}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.min(ch.pct, 100).toFixed(1)}%;background:${c}"></div>
      </div>
      <div class="lessons-wrap">${lessonRows}</div>
    </div>`;
  }).join('');

  return `
  <h2 class="tab-title">📈 Progress</h2>

  <div class="prog-card">
    <div class="card-head">
      <div>
        <div class="card-title">Words Completed</div>
        <div class="card-sub">${wordDone} of ${wordTotal} words mastered</div>
      </div>
      <span class="pct-pill" style="background:${statusColor(wordPct)}1f;color:${statusColor(wordPct)}">${wordPct.toFixed(0)}%</span>
    </div>
    <div class="bar-track">
      <div class="bar-fill" style="width:${wordPct.toFixed(1)}%;background:${statusColor(wordPct)}"></div>
    </div>
    ${chapterCards || '<div class="empty-mini">No chapter data available.</div>'}
  </div>`;
}


function buildWordMasterySectionHtml(
  chapters: any[],
  slots: any[],
  summary: any,
  rangeLabel: string,
): string {
  const masteredTotal = chapters.reduce((s, c) => s + (c.masteredWords ?? 0), 0);
  const totalWordSlots = chapters.reduce((s, c) => s + (c.totalWords ?? 0), 0);
  const overallPct = totalWordSlots > 0 ? Math.round((masteredTotal / totalWordSlots) * 100) : 0;
  const avgAcc: number | null = summary?.avgAccuracy ?? null;
  const totalSessions = summary?.totalSessions ?? 0;

  const colorFor = (acc: number | null) =>
    acc === null ? '#9CA3AF' : acc >= 85 ? '#34d399' : acc >= 60 ? '#fbbf24' : '#f87171';

  const bars = buildAccuracyBarsSvg(slots.map((s: any) => ({ label: s.label, value: s.accuracy })));

  const chapterRows = chapters.map((ch: any) => {
    const cPct = ch.totalWords > 0 ? Math.round((ch.masteredWords / ch.totalWords) * 100) : 0;
    const cColor = colorFor(ch.overallAccuracy ?? null);
    const lessonRows = (ch.lessons || []).map((ls: any) => {
      const lPct = ls.totalWords > 0 ? Math.round((ls.masteredWords.length / ls.totalWords) * 100) : 0;
      const complete = ls.totalWords > 0 && ls.masteredWords.length >= ls.totalWords;
      const barColor = complete ? '#34d399' : colorFor(ls.latestAccuracy ?? null);
      const badge = complete
        ? `<span class="badge" style="background:#ECFDF5;color:#10B981">✓ Done</span>`
        : ls.latestAccuracy !== null && ls.latestAccuracy !== undefined
          ? `<span class="badge" style="background:${barColor}1f;color:${barColor}">${ls.latestAccuracy}%</span>`
          : `<span class="badge" style="background:#F3F4F6;color:#9CA3AF">Not tried</span>`;
      return `
      <div class="word-lesson">
        <div class="word-lesson-head">
          <span class="word-lesson-name">${esc(ls.lessonDisplayName ?? ls.lesson ?? '')}</span>
          ${badge}
        </div>
        <div class="bar-track sm">
          <div class="bar-fill" style="width:${lPct}%;background:${barColor}"></div>
        </div>
        <div class="word-lesson-meta">${ls.masteredWords.length}/${ls.totalWords} words</div>
      </div>`;
    }).join('');

    return `
    <div class="word-chapter">
      <div class="word-chapter-head">
        <div>
          <div class="word-chapter-title">${esc(ch.chapterTitle ?? ch.chapter ?? '')}</div>
          <div class="word-chapter-meta">${ch.completedLessons}/${(ch.lessons || []).length} lessons · ${ch.masteredWords}/${ch.totalWords} words</div>
        </div>
        <span class="pct-pill" style="background:${cColor}1f;color:${cColor}">${cPct}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${cPct}%;background:${cColor}"></div>
      </div>
      <div class="lessons-wrap">${lessonRows}</div>
    </div>`;
  }).join('');

  return `
  <div class="sub-section">
    <div class="sub-head">
      <h3 class="sub-title">Word Mastery</h3>
      <span class="sub-period">${esc(rangeLabel)}</span>
    </div>

    <div class="mini-stats">
      <div class="mini-stat"><div class="mini-val acc">${avgAcc !== null ? `${avgAcc}%` : '—'}</div><div class="mini-lbl">Avg Accuracy</div></div>
      <div class="mini-stat"><div class="mini-val blue">${totalSessions}</div><div class="mini-lbl">Sessions</div></div>
      <div class="mini-stat"><div class="mini-val green">${masteredTotal}</div><div class="mini-lbl">Mastered</div></div>
    </div>

    <div class="chart-box">
      <div class="chart-label">Accuracy per period</div>
      ${bars}
    </div>

    <div class="chart-box">
      <div class="chart-label">Overall Progress — ${overallPct}%</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${overallPct}%;background:${colorFor(avgAcc)}"></div>
      </div>
    </div>

    ${chapters.length === 0
      ? '<div class="empty-mini">No chapter data for this period.</div>'
      : chapterRows}
  </div>`;
}

// Hasbrouck & Tindal (2017) grade-level benchmarks — mirrored from StudentAccuracyTrendsChart
const GRADE_BENCHMARKS = [
  { grade: 1, label: 'Grade 1', wpmMin: 53, wpmMax: 82, accMin: 90, accMax: 100 },
  { grade: 2, label: 'Grade 2', wpmMin: 89, wpmMax: 120, accMin: 92, accMax: 100 },
  { grade: 3, label: 'Grade 3', wpmMin: 107, wpmMax: 140, accMin: 94, accMax: 100 },
];

function getBenchmarkStatus(value: number, min: number, max: number): 'below' | 'at' | 'above' {
  if (value >= min && value <= max) return 'at';
  if (value > max) return 'above';
  return 'below';
}

const BENCHMARK_CFG: Record<'below' | 'at' | 'above', { label: string; color: string; bg: string; icon: string }> = {
  below: { label: 'Below Grade Level', color: '#EF4444', bg: '#FEE2E2', icon: '▼' },
  at:    { label: 'At Grade Level',    color: '#F59E0B', bg: '#FEF3C7', icon: '●' },
  above: { label: 'Above Grade Level', color: '#10B981', bg: '#D1FAE5', icon: '▲' },
};

function buildAccuracyTrendsSectionHtml(
  chartData: { date: string; accuracy: number; wpm: number }[],
  gradeLevel?: number,
): string {
  const acc = chartData.map(d => d.accuracy).filter(v => v > 0);
  const wpm = chartData.map(d => d.wpm).filter(v => v > 0);
  if (acc.length === 0) {
    return `<div class="sub-section">
      <h3 class="sub-title">Accuracy & Speed</h3>
      <div class="empty-mini">No data recorded for this period.</div>
    </div>`;
  }

  const avgAcc = acc.reduce((s, v) => s + v, 0) / acc.length;
  const avgWpm = wpm.length > 0 ? wpm.reduce((s, v) => s + v, 0) / wpm.length : 0;
  const maxWpm = Math.max(...wpm, 1);

  const validAcc = chartData.filter(d => d.accuracy > 0);
  const accDelta = (validAcc[validAcc.length - 1]?.accuracy ?? 0) - (validAcc[0]?.accuracy ?? 0);
  const accPct = validAcc[0]?.accuracy ? (accDelta / validAcc[0].accuracy) * 100 : 0;
  const dir = accDelta > 0 ? 'up' : accDelta < 0 ? 'down' : 'same';
  const trendColor = dir === 'up' ? '#2CA96A' : dir === 'down' ? '#EF4444' : '#6B7280';
  const trendIcon = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '—';
  const insight = dir === 'up'
    ? `Accuracy improved by ${Math.abs(accPct).toFixed(1)}% over this period.`
    : dir === 'down'
      ? `Accuracy dropped by ${Math.abs(accPct).toFixed(1)}%. Consider reviewing reading exercises.`
      : 'Reading accuracy remained consistent over this period.';

  const benchmark = gradeLevel
    ? GRADE_BENCHMARKS.find(b => b.grade === gradeLevel)
    : undefined;

  const benchmarkHtml = benchmark ? (() => {
    const accStatus = getBenchmarkStatus(avgAcc, benchmark.accMin, benchmark.accMax);
    const wpmStatus = getBenchmarkStatus(avgWpm, benchmark.wpmMin, benchmark.wpmMax);
    const a = BENCHMARK_CFG[accStatus];
    const w = BENCHMARK_CFG[wpmStatus];
    return `
    <div class="bench-card">
      <div class="bench-head">
        <span class="bench-title">Grade-Level Benchmark</span>
        <span class="bench-grade">${esc(benchmark.label)}</span>
      </div>
      <div class="bench-range">Expected — Accuracy: ${benchmark.accMin}–${benchmark.accMax}% · WPM: ${benchmark.wpmMin}–${benchmark.wpmMax}</div>
      <div class="bench-row" style="background:${a.bg}">
        <div>
          <div class="bench-metric">Accuracy</div>
          <div class="bench-value" style="color:#3B7FC9">${avgAcc.toFixed(1)}%</div>
        </div>
        <span class="bench-badge" style="background:${a.color}">${a.icon} ${a.label}</span>
      </div>
      <div class="bench-row" style="background:${w.bg};margin-top:6px">
        <div>
          <div class="bench-metric">Reading Speed</div>
          <div class="bench-value" style="color:#F59E0B">${avgWpm.toFixed(0)} wpm</div>
        </div>
        <span class="bench-badge" style="background:${w.color}">${w.icon} ${w.label}</span>
      </div>
    </div>`;
  })() : '';

  const peakIdx = chartData.reduce((mi, it, i, arr) => it.accuracy > arr[mi].accuracy ? i : mi, 0);
  const rows = chartData.map((item, idx) => {
    const isPeak = idx === peakIdx && item.accuracy > 0;
    const accW = item.accuracy;
    const wpmW = maxWpm > 0 ? (item.wpm / maxWpm) * 100 : 0;
    return `
    <div class="trend-row">
      <span class="trend-label ${isPeak ? 'peak' : ''}">${esc(item.date)}</span>
      <div class="trend-bars">
        <div class="trend-line">
          <div class="bar-track sm">
            <div class="bar-fill" style="width:${accW}%;background:${isPeak ? '#3B7FC9' : '#C0E8F2'}"></div>
          </div>
          <span class="trend-val" style="color:${isPeak ? '#3B7FC9' : '#9CA3AF'}">${item.accuracy > 0 ? `${item.accuracy.toFixed(1)}%` : '—'}</span>
        </div>
        <div class="trend-line">
          <div class="bar-track sm">
            <div class="bar-fill" style="width:${wpmW}%;background:#FEF3C7"></div>
          </div>
          <span class="trend-val" style="color:#F59E0B">${item.wpm > 0 ? item.wpm.toFixed(0) : '—'}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="sub-section">
    <h3 class="sub-title">Accuracy &amp; Speed</h3>

    <div class="mini-stats blue">
      <div class="mini-stat"><div class="mini-val">${avgAcc.toFixed(1)}%</div><div class="mini-lbl">Avg Accuracy</div></div>
      <div class="mini-stat"><div class="mini-val">${avgWpm.toFixed(0)}</div><div class="mini-lbl">Avg WPM</div></div>
      <div class="mini-stat"><div class="mini-val" style="color:${trendColor}">${trendIcon} ${Math.abs(accPct).toFixed(1)}%</div><div class="mini-lbl">Trend</div></div>
    </div>

    <div class="legend-row centered">
      <span><i class="dot" style="background:#3B7FC9"></i>Accuracy (%)</span>
      <span><i class="dot" style="background:#F59E0B"></i>Speed (WPM)</span>
    </div>

    ${benchmarkHtml}

    <div class="trend-card">${rows}</div>

    <div class="insight" style="background:${dir === 'up' ? '#D4F1E8' : dir === 'down' ? '#FEE2E2' : '#F3F8FF'};color:${trendColor}">
      ${dir === 'up' ? '📈' : dir === 'down' ? '📉' : '📊'} ${esc(insight)}
    </div>
  </div>`;
}

function buildMiscueInsightsSectionHtml(
  miscueData: { type: string; count: number; percentage: number; color: string }[],
  totalMiscues: number,
  topPassage: any,
  topWords: any[],
  rangeLabel: string,
  role: 'student' | 'faculty',
): string {
  const FRIENDLY: Record<string, string> = {
    Substitution: 'Wrong word',
    Omission: 'Skipped word',
    Insertion: 'Added word',
    Repetition: 'Repeated word',
  };
  const labelFor = (t: string) => role === 'student' ? (FRIENDLY[t] || t) : t;
  const MISCUE_BG: Record<string, string> = {
    Substitution: '#FFEBEE',
    Omission: '#FFF3E0',
    Insertion: '#E3F2FD',
    Repetition: '#F3E5F5',
  };

  const maxCount = miscueData.length > 0 ? Math.max(...miscueData.map(d => d.count), 1) : 1;
  const bars = totalMiscues === 0
    ? '<div class="empty-mini">No miscues recorded for this period 🎉</div>'
    : miscueData.map(it => {
        const pct = maxCount > 0 ? (it.count / maxCount) * 100 : 0;
        return `
        <div class="miscue-row">
          <div class="miscue-row-head">
            <span class="mini-dot" style="background:${it.color}"></span>
            <span class="miscue-type">${esc(labelFor(it.type))}</span>
            <span class="miscue-pct">${it.percentage.toFixed(0)}%</span>
          </div>
          <div class="miscue-bar-row">
            <div class="bar-track sm" style="background:${MISCUE_BG[it.type] || '#EEF2FF'}">
              <div class="bar-fill" style="width:${pct}%;background:${it.color}"></div>
            </div>
            <span class="miscue-count" style="color:${it.color}">${it.count}</span>
          </div>
        </div>`;
      }).join('');

  const passageBlock = !topPassage
    ? '<div class="empty-mini">No passage data for this period</div>'
    : `
    <div class="passage-name">"${esc(topPassage.title)}"</div>
    <div class="passage-stats">
      <div class="ps"><div class="ps-val">${topPassage.averageAccuracy.toFixed(1)}%</div><div class="ps-lbl">Accuracy</div></div>
      <div class="ps-sep"></div>
      <div class="ps"><div class="ps-val">${topPassage.attempts}</div><div class="ps-lbl">Attempts</div></div>
      <div class="ps-sep"></div>
      <div class="ps"><div class="ps-val coral">${topPassage.totalMiscues}</div><div class="ps-lbl">Miscues</div></div>
    </div>`;

  const wordsBlock = (!topWords || topWords.length === 0)
    ? '<div class="empty-mini">No word data for this period</div>'
    : topWords.map((item: any, idx: number) => {
        const c = (() => {
          const t = item.dominantMiscueType || '';
          const map: Record<string, string> = {
            Substitution: '#FF5252',
            Omission: '#FF9800',
            Insertion: '#42A5F5',
            Repetition: '#AB47BC',
          };
          return map[t] || '#9CA3AF';
        })();
        const bg = MISCUE_BG[item.dominantMiscueType || ''] || '#EEF2FF';
        return `
        <div class="word-row">
          <span class="word-rank">${idx + 1}</span>
          <div class="word-info">
            <div class="word-text">"${esc(item.word)}"</div>
            <span class="word-badge" style="background:${bg};color:${c}">${esc(labelFor(item.dominantMiscueType || 'N/A'))}</span>
          </div>
          <span class="word-count">×${item.errorCount}</span>
        </div>`;
      }).join('');

  return `
  <div class="sub-section">
    <h3 class="sub-title">Miscue Insights</h3>

    <div class="insight-card">
      <div class="card-title sm">Common Miscue Types</div>
      <div class="card-sub">${esc(rangeLabel)} · ${totalMiscues} total miscues</div>
      <div class="miscue-bars">${bars}</div>
    </div>

    <div class="insight-card">
      <div class="card-title sm">Top Miscued Passage</div>
      ${passageBlock}
    </div>

    <div class="insight-card">
      <div class="card-title sm">Most Miscued Words</div>
      ${wordsBlock}
    </div>
  </div>`;
}

function buildHistorySectionHtml(
  groupedReports: GroupedReport[],
  historyFilter: HistoryFilter,
  historyAnchor: Date,
  selectedDay: number | null,
  selectedWeekOfMonth: number | null,
): { html: string; stats: { passages: number; attempts: number; avgAcc: string; bestWpm: number } } {
  // Apply the same filter logic as Student_History
  const [rangeStart, rangeEnd] = getFilterRange(historyFilter, historyAnchor);

  const filtered: GroupedReport[] = [];
  for (const group of groupedReports) {
    const matching = group.reports.filter(r => {
      try {
        const d: Date = r.timestamp?.toDate?.() ?? new Date(r.timestamp);
        if (d < rangeStart || d > rangeEnd) return false;

        if (historyFilter === 'week' && selectedDay !== null) {
          const monday = getWeekStart(historyAnchor);
          const target = new Date(monday);
          target.setDate(monday.getDate() + selectedDay);
          return d.getFullYear() === target.getFullYear()
            && d.getMonth() === target.getMonth()
            && d.getDate() === target.getDate();
        }
        if (historyFilter === 'month' && selectedWeekOfMonth !== null) {
          const year = historyAnchor.getFullYear();
          const month = historyAnchor.getMonth();
          const totalDays = new Date(year, month + 1, 0).getDate();
          const i = selectedWeekOfMonth - 1;
          const ws = new Date(year, month, i * 7 + 1, 0, 0, 0, 0);
          const we = new Date(year, month, Math.min((i + 1) * 7, totalDays), 23, 59, 59, 999);
          return d >= ws && d <= we;
        }
        return true;
      } catch {
        return false;
      }
    });
    if (matching.length > 0) filtered.push({ passageTitle: group.passageTitle, reports: matching });
  }

  const allReports = filtered.flatMap(g => g.reports);
  const passages = filtered.length;
  const attempts = allReports.length;
  const avgAcc = attempts > 0
    ? (allReports.reduce((s, r) => s + r.accuracyRate, 0) / attempts).toFixed(1)
    : '0';
  const bestWpm = attempts > 0 ? Math.max(...allReports.map(r => r.wordPerMin || 0)) : 0;

  if (filtered.length === 0) {
    return {
      stats: { passages: 0, attempts: 0, avgAcc: '0', bestWpm: 0 },
      html: `
      <h2 class="tab-title">📋 Reading History</h2>
      <div class="history-period">${esc(formatPeriodLabel(historyFilter, historyAnchor))}${selectedDay !== null ? ' · Day filter active' : ''}${selectedWeekOfMonth !== null ? ` · Week ${selectedWeekOfMonth} filter active` : ''}</div>
      <div class="empty-card">
        <div class="empty-emoji">📚</div>
        <div class="empty-title">No Reading History</div>
        <div class="empty-body">No reading sessions found for this period.</div>
      </div>`,
    };
  }

  const passageCards = filtered.map(group => {
    const attemptsText = group.reports.length === 1 ? '1 attempt' : `${group.reports.length} attempts`;
    const sessionRows = group.reports.map((report, i) => {
      const totalMiscues = getTotalMiscues(report);
      const accColor = report.accuracyRate >= 90 ? '#16A34A' : report.accuracyRate >= 80 ? '#D97706' : '#DC2626';

      const miscueDetail = totalMiscues === 0
        ? `<div class="perfect-badge">⭐ Perfect reading! No miscues detected.</div>`
        : `
        <div class="miscue-section">
          <div class="miscue-section-title">Miscue Breakdown</div>
          ${report.substitution !== 'None' ? `
            <div class="miscue-detail-row">
              <span class="m-tag" style="background:#FEE2E2;color:#DC2626">Substitution</span>
              <span class="m-text">${esc(report.substitution)}</span>
            </div>` : ''}
          ${report.omission !== 'None' ? `
            <div class="miscue-detail-row">
              <span class="m-tag" style="background:#FEF3C7;color:#D97706">Omission</span>
              <span class="m-text">${esc(report.omission)}</span>
            </div>` : ''}
          ${report.insertion !== 'None' ? `
            <div class="miscue-detail-row">
              <span class="m-tag" style="background:#DBEAFE;color:#1D4ED8">Insertion</span>
              <span class="m-text">${esc(report.insertion)}</span>
            </div>` : ''}
          ${report.repetition !== 'None' ? `
            <div class="miscue-detail-row">
              <span class="m-tag" style="background:#EDE9FE;color:#7C3AED">Repetition</span>
              <span class="m-text">${esc(report.repetition)}</span>
            </div>` : ''}
        </div>`;

      return `
      <div class="report-card">
        <div class="report-card-head">
          <span class="report-date">${esc(formatDateLong(report.timestamp))}</span>
          <span class="report-attempt">#${i + 1}</span>
        </div>
        <div class="report-metrics">
          <div class="rm"><div class="rm-val" style="color:${accColor}">${report.accuracyRate.toFixed(1)}%</div><div class="rm-lbl">Accuracy</div></div>
          <div class="rm"><div class="rm-val">${report.wordPerMin}</div><div class="rm-lbl">Words / Min</div></div>
          <div class="rm"><div class="rm-val">${esc(formatDuration(report.recordingDuration))}</div><div class="rm-lbl">Duration</div></div>
          <div class="rm"><div class="rm-val">${totalMiscues}</div><div class="rm-lbl">Total Miscues</div></div>
        </div>
        ${miscueDetail}
      </div>`;
    }).join('');

    return `
    <div class="passage-card">
      <div class="passage-head">
        <div class="passage-icon">📖</div>
        <div class="passage-info">
          <div class="passage-title">${esc(group.passageTitle)}</div>
          <div class="passage-attempts">${attemptsText}</div>
        </div>
      </div>
      <div class="report-list">${sessionRows}</div>
    </div>`;
  }).join('');

  const filterNotes: string[] = [];
  if (selectedDay !== null) filterNotes.push('day filter active');
  if (selectedWeekOfMonth !== null) filterNotes.push(`Week ${selectedWeekOfMonth} filter active`);
  const filterSuffix = filterNotes.length > 0 ? ` · ${filterNotes.join(' · ')}` : '';

  return {
    stats: { passages, attempts, avgAcc, bestWpm },
    html: `
    <h2 class="tab-title">📋 Reading History</h2>
    <div class="history-period">${esc(formatPeriodLabel(historyFilter, historyAnchor))}${filterSuffix}</div>

    <div class="hist-stats">
      <div class="hs"><div class="hs-val">${passages}</div><div class="hs-lbl">Passages</div></div>
      <div class="hs-sep"></div>
      <div class="hs"><div class="hs-val">${attempts}</div><div class="hs-lbl">Attempts</div></div>
      <div class="hs-sep"></div>
      <div class="hs"><div class="hs-val">${avgAcc}%</div><div class="hs-lbl">Avg. Accuracy</div></div>
      <div class="hs-sep"></div>
      <div class="hs"><div class="hs-val">${bestWpm}</div><div class="hs-lbl">Best WPM</div></div>
    </div>

    ${passageCards}`,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Master HTML builder
// ═════════════════════════════════════════════════════════════════════════════

interface BuildOpts {
  studentName: string;
  generatedAt: string;
  role: 'student' | 'faculty';
  gradeLevel?: number;

  // Data inputs
  completedWords: WordCompletion[];

  wordChapters: any[];
  wordSlots: any[];
  wordSummary: any;
  wordRangeLabel: string;

  accuracyChart: { date: string; accuracy: number; wpm: number }[];
  miscueData: { type: string; count: number; percentage: number; color: string }[];
  miscueTotal: number;
  topPassage: any;
  topWords: any[];
  analyticsRangeLabel: string;

  groupedReports: GroupedReport[];
  historyFilter: HistoryFilter;
  historyAnchor: Date;
  historySelectedDay: number | null;
  historySelectedWeekOfMonth: number | null;
}

function buildPdfHtml(opts: BuildOpts): string {
  const progressHtml = buildProgressSectionHtml(opts.completedWords);
  const wordHtml = buildWordMasterySectionHtml(opts.wordChapters, opts.wordSlots, opts.wordSummary, opts.wordRangeLabel);
  const accuracyHtml = buildAccuracyTrendsSectionHtml(opts.accuracyChart, opts.gradeLevel);
  const miscueHtml = buildMiscueInsightsSectionHtml(
    opts.miscueData, opts.miscueTotal, opts.topPassage, opts.topWords, opts.analyticsRangeLabel, opts.role,
  );
  const history = buildHistorySectionHtml(
    opts.groupedReports,
    opts.historyFilter,
    opts.historyAnchor,
    opts.historySelectedDay,
    opts.historySelectedWeekOfMonth,
  );

  // Cross-tab overview (summary cards derived from filtered History reports + Analytics aggregation)
  const aggregated = (() => {
    const passageMap = new Map<string, { acc: number[]; wpm: number[] }>();
    for (const g of opts.groupedReports) {
      for (const r of g.reports) {
        if (!passageMap.has(g.passageTitle)) passageMap.set(g.passageTitle, { acc: [], wpm: [] });
        passageMap.get(g.passageTitle)!.acc.push(r.accuracyRate);
        passageMap.get(g.passageTitle)!.wpm.push(r.wordPerMin);
      }
    }
    return Array.from(passageMap.entries()).map(([title, v]) => ({
      label: title,
      accuracy: v.acc.length ? v.acc.reduce((s, x) => s + x, 0) / v.acc.length : 0,
      wpm: v.wpm.length ? Math.round(v.wpm.reduce((s, x) => s + x, 0) / v.wpm.length) : 0,
    }));
  })();

  const overallStats = (() => {
    const all = opts.groupedReports.flatMap(g => g.reports);
    const totalAttempts = all.length;
    const avgAcc = totalAttempts ? (all.reduce((s, r) => s + r.accuracyRate, 0) / totalAttempts).toFixed(1) : '0';
    const bestWpm = totalAttempts ? Math.max(...all.map(r => r.wordPerMin || 0)) : 0;
    const totalMiscues = all.reduce((s, r) => s + getTotalMiscues(r), 0);
    const passages = new Set(opts.groupedReports.map(g => g.passageTitle)).size;
    return { passages, totalAttempts, avgAcc, bestWpm, totalMiscues };
  })();

  const pairedBar = aggregated.length > 0
    ? buildPairedBarChartSvg(aggregated)
    : '<div class="empty-mini">No session data available.</div>';

  const miscueDonut = buildDonutSvg([
    { count: opts.miscueData.find(m => m.type === 'Substitution')?.count ?? 0, color: '#EF4444', label: 'Substitution' },
    { count: opts.miscueData.find(m => m.type === 'Omission')?.count ?? 0,     color: '#F59E0B', label: 'Omission' },
    { count: opts.miscueData.find(m => m.type === 'Insertion')?.count ?? 0,    color: '#3B82F6', label: 'Insertion' },
    { count: opts.miscueData.find(m => m.type === 'Repetition')?.count ?? 0,   color: '#10B981', label: 'Repetition' },
  ], 'total miscues');

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
    padding: 24px 28px;
    font-size: 12px;
  }

  /* ── Header ── */
  .report-header {
    background: linear-gradient(135deg, #1B5E20 0%, #388E3C 100%);
    border-radius: 12px;
    padding: 20px 26px;
    color: white;
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .report-header h1 { font-size: 21px; font-weight: 800; letter-spacing: -0.3px; }
  .report-header p  { font-size: 11px; opacity: 0.85; margin-top: 4px; }
  .report-header .badge {
    background: rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 11px;
    text-align: right;
  }
  .report-header .badge strong { display: block; font-size: 14px; margin-bottom: 2px; }

  /* ── Summary cards ── */
  .summary-grid {
    display: flex;
    gap: 10px;
    margin-bottom: 18px;
  }
  .summary-card {
    flex: 1;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 10px;
    padding: 12px 8px;
    text-align: center;
  }
  .summary-card .val { font-size: 22px; font-weight: 800; color: #15803D; }
  .summary-card .lbl { font-size: 9px; color: #6B7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── Tab section headings ── */
  .tab-title {
    font-size: 16px;
    font-weight: 800;
    color: #1B5E20;
    margin: 18px 0 8px;
    padding: 8px 12px;
    background: #E8F5E9;
    border-left: 4px solid #388E3C;
    border-radius: 4px;
  }
  .sub-title {
    font-size: 14px;
    font-weight: 700;
    color: #1F2937;
    margin-bottom: 8px;
  }

  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #1F2937;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #D1FAE5;
  }

  /* ── Charts row (overview) ── */
  .charts-row {
    display: flex;
    gap: 16px;
    margin-bottom: 18px;
    align-items: flex-start;
  }
  .chart-box {
    background: #FAFAFA;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
  }
  .chart-box.bar  { flex: 1; }
  .chart-box.donut { width: 260px; }
  .chart-label { font-size: 11px; font-weight: 700; color: #374151; margin-bottom: 8px; }

  .donut-wrap { display: flex; align-items: center; gap: 14px; }
  .donut-legend { display: flex; flex-direction: column; gap: 6px; }
  .legend-item { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #374151; }
  .legend-dot  { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }

  /* ── Generic sub-section ── */
  .sub-section {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 14px;
  }
  .sub-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .sub-period {
    font-size: 11px;
    color: #6B7280;
    font-style: italic;
  }

  /* ── Mini stats strip (per sub-section) ── */
  .mini-stats {
    display: flex;
    background: #F8FAFC;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 10px;
  }
  .mini-stats.blue { background: #F3F8FF; }
  .mini-stat { flex: 1; text-align: center; }
  .mini-val { font-size: 18px; font-weight: 800; color: #1F2937; }
  .mini-val.acc { color: #2CA96A; }
  .mini-val.blue { color: #60a5fa; }
  .mini-val.violet { color: #a78bfa; }
  .mini-val.green { color: #34d399; }
  .mini-lbl { font-size: 9px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 2px; }

  .legend-row { display: flex; gap: 14px; margin-top: 8px; font-size: 10px; color: #374151; flex-wrap: wrap; }
  .legend-row.centered { justify-content: center; margin-bottom: 8px; }
  .legend-row .dot { display: inline-block; width: 8px; height: 8px; border-radius: 999px; margin-right: 4px; vertical-align: middle; }

  /* ── Progress card ── */
  .prog-card {
    background: #FFFFFF;
    border: 1px solid #D7E9FF;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 12px;
  }
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .card-title { font-size: 13px; font-weight: 700; color: #1F2937; }
  .card-title.sm { font-size: 12px; }
  .card-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
  .pct-pill { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }

  /* ── Progress bars ── */
  .bar-track { height: 8px; background: #EEF2FF; border-radius: 5px; overflow: hidden; margin: 6px 0 10px; }
  .bar-track.sm { height: 5px; }
  .bar-fill { height: 100%; border-radius: 5px; }


  /* ── Chapter / lesson rows ── */
  .chapter-card {
    background: #F3F8FF;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 10px;
    margin-top: 8px;
  }
  .chapter-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .chapter-title { font-size: 12px; font-weight: 700; color: #1F2937; }
  .chapter-meta { font-size: 10px; color: #6B7280; margin-top: 2px; }
  .lessons-wrap { margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB; }
  .lesson-row { display: flex; align-items: flex-start; gap: 8px; padding-bottom: 6px; margin-bottom: 6px; border-bottom: 1px dashed #E5E7EB; }
  .lesson-row:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
  .lesson-dot { width: 7px; height: 7px; border-radius: 5px; margin-top: 4px; flex-shrink: 0; }
  .lesson-body { flex: 1; }
  .lesson-label-row { display: flex; justify-content: space-between; align-items: center; }
  .lesson-title { font-size: 11px; color: #1F2937; font-weight: 500; }
  .lesson-frac { font-size: 11px; font-weight: 700; }


  /* ── Word mastery sub-blocks ── */
  .word-chapter {
    background: #F8FAFC;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 10px;
    margin-top: 8px;
  }
  .word-chapter-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .word-chapter-title { font-size: 12px; font-weight: 800; color: #1F2937; }
  .word-chapter-meta { font-size: 10px; color: #64748b; }
  .word-lesson {
    background: #ffffff;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    padding: 8px;
    margin-top: 6px;
  }
  .word-lesson-head { display: flex; justify-content: space-between; align-items: center; }
  .word-lesson-name { font-size: 11px; font-weight: 700; color: #1F2937; }
  .badge { padding: 2px 7px; border-radius: 999px; font-size: 9px; font-weight: 700; }
  .word-lesson-meta { font-size: 10px; color: #64748b; margin-top: 4px; }

  /* ── Accuracy trend rows ── */
  .trend-card { background: #FFFFFF; border: 1px solid #D7E9FF; border-radius: 10px; padding: 10px; margin: 8px 0; }
  .trend-row { display: flex; gap: 10px; align-items: center; padding: 6px 0; border-bottom: 1px solid #EEF2FF; }
  .trend-row:last-child { border-bottom: 0; }
  .trend-label { width: 50px; font-size: 11px; color: #6B7280; font-weight: 500; }
  .trend-label.peak { color: #1F2937; font-weight: 700; }
  .trend-bars { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .trend-line { display: flex; align-items: center; gap: 6px; }
  .trend-val { min-width: 42px; text-align: right; font-size: 11px; font-weight: 700; }

  /* ── Benchmark card ── */
  .bench-card { background: #FFFFFF; border: 1px solid #D7E9FF; border-radius: 10px; padding: 10px; margin: 8px 0; }
  .bench-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .bench-title { font-size: 12px; font-weight: 700; color: #1F2937; }
  .bench-grade { background: #D7E9FF; color: #3B7FC9; font-size: 10px; font-weight: 700; padding: 2px 9px; border-radius: 999px; }
  .bench-range { font-size: 9px; color: #9CA3AF; margin-bottom: 8px; }
  .bench-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-radius: 8px; }
  .bench-metric { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.4px; }
  .bench-value { font-size: 17px; font-weight: 800; margin-top: 2px; }
  .bench-badge { color: #ffffff; padding: 5px 9px; border-radius: 7px; font-size: 10px; font-weight: 700; }

  /* ── Insight bar ── */
  .insight { display: flex; align-items: center; gap: 8px; padding: 9px 11px; border-radius: 8px; font-size: 11px; font-weight: 500; margin-top: 8px; }

  /* ── Miscue insights ── */
  .insight-card { background: #FFFFFF; border: 1px solid #D7E9FF; border-radius: 10px; padding: 12px; margin-bottom: 10px; }
  .miscue-bars { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
  .miscue-row-head { display: flex; align-items: center; gap: 6px; }
  .miscue-type { flex: 1; font-size: 11px; color: #1F2937; }
  .miscue-pct { font-size: 11px; font-weight: 700; color: #6B7280; }
  .miscue-bar-row { display: flex; align-items: center; gap: 8px; padding-left: 14px; margin-top: 3px; }
  .miscue-count { min-width: 28px; text-align: right; font-size: 11px; font-weight: 700; }
  .mini-dot { width: 8px; height: 8px; border-radius: 4px; }
  .passage-name { font-size: 13px; font-weight: 700; color: #3B7FC9; font-style: italic; margin: 6px 0 10px; }
  .passage-stats { display: flex; background: #F3F8FF; border-radius: 9px; padding: 10px; align-items: center; }
  .ps { flex: 1; text-align: center; }
  .ps-val { font-size: 16px; font-weight: 700; color: #3B7FC9; }
  .ps-val.coral { color: #EF4444; }
  .ps-lbl { font-size: 10px; color: #6B7280; margin-top: 2px; }
  .ps-sep { width: 1px; height: 26px; background: #E5E7EB; }
  .word-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
  .word-row:last-child { border-bottom: 0; }
  .word-rank {
    width: 22px; height: 22px; border-radius: 999px;
    background: #D7E9FF; color: #3B7FC9;
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .word-info { flex: 1; }
  .word-text { font-size: 12px; font-weight: 700; color: #1F2937; font-style: italic; }
  .word-badge { display: inline-block; margin-top: 3px; padding: 1px 8px; border-radius: 7px; font-size: 10px; font-weight: 700; }
  .word-count { font-size: 14px; font-weight: 700; color: #6B7280; }

  /* ── History section ── */
  .history-period { font-size: 11px; color: #6B7280; margin-bottom: 10px; font-style: italic; }
  .hist-stats { display: flex; background: #FFFFFF; border: 1px solid #BBF7D0; border-radius: 10px; padding: 10px; margin-bottom: 12px; }
  .hs { flex: 1; text-align: center; }
  .hs-val { font-size: 17px; font-weight: 800; color: #15803D; }
  .hs-lbl { font-size: 9px; color: #6B7280; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
  .hs-sep { width: 1px; height: 28px; background: #E5E7EB; }

  .passage-card { background: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px; margin-bottom: 10px; }
  .passage-head { display: flex; align-items: center; gap: 10px; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB; }
  .passage-icon { width: 30px; height: 30px; border-radius: 7px; background: #DCFCE7; display: flex; align-items: center; justify-content: center; font-size: 15px; }
  .passage-info { flex: 1; }
  .passage-title { font-size: 13px; font-weight: 700; color: #1F2937; }
  .passage-attempts { font-size: 10px; color: #6B7280; margin-top: 1px; }
  .report-list { margin-top: 8px; }
  .report-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px; margin-bottom: 8px; }
  .report-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .report-date { font-size: 11px; color: #6B7280; }
  .report-attempt { font-size: 10px; font-weight: 700; color: #15803D; background: #DCFCE7; padding: 2px 8px; border-radius: 999px; }
  .report-metrics { display: flex; gap: 6px; margin: 6px 0; }
  .rm { flex: 1; background: #F9FAFB; border-radius: 6px; padding: 6px; text-align: center; }
  .rm-val { font-size: 14px; font-weight: 800; color: #1F2937; }
  .rm-lbl { font-size: 9px; color: #6B7280; margin-top: 2px; }

  .miscue-section { background: #F9FAFB; border-radius: 6px; padding: 8px; margin-top: 6px; }
  .miscue-section-title { font-size: 11px; font-weight: 700; color: #1F2937; margin-bottom: 6px; }
  .miscue-detail-row { display: flex; align-items: center; gap: 8px; margin: 3px 0; }
  .m-tag { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
  .m-text { font-size: 11px; color: #374151; }
  .perfect-badge { background: #DCFCE7; color: #15803D; font-size: 11px; font-weight: 700; padding: 8px; border-radius: 7px; text-align: center; margin-top: 6px; }

  .empty-mini { font-size: 11px; color: #9CA3AF; text-align: center; padding: 16px; font-style: italic; }
  .empty-card { background: #F9FAFB; border: 1px dashed #E5E7EB; border-radius: 10px; padding: 24px; text-align: center; }
  .empty-emoji { font-size: 28px; margin-bottom: 6px; }
  .empty-title { font-size: 14px; font-weight: 700; color: #1F2937; }
  .empty-body { font-size: 11px; color: #6B7280; margin-top: 4px; }

  /* ── Footer ── */
  .footer {
    text-align: center;
    font-size: 10px;
    color: #9CA3AF;
    padding-top: 14px;
    margin-top: 18px;
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
      <p>Progress · Sessions · Analytics · History</p>
    </div>
    <div class="badge">
      <strong>${esc(opts.studentName)}</strong>
      Generated: ${esc(opts.generatedAt)}
    </div>
  </div>

  <!-- ── OVERVIEW SUMMARY ── -->
  <div class="summary-grid">
    <div class="summary-card"><div class="val">${overallStats.passages}</div><div class="lbl">Passages</div></div>
    <div class="summary-card"><div class="val">${overallStats.totalAttempts}</div><div class="lbl">Total Sessions</div></div>
    <div class="summary-card"><div class="val">${overallStats.avgAcc}%</div><div class="lbl">Avg. Accuracy</div></div>
    <div class="summary-card"><div class="val">${overallStats.bestWpm}</div><div class="lbl">Best WPM</div></div>
    <div class="summary-card"><div class="val">${overallStats.totalMiscues}</div><div class="lbl">Total Miscues</div></div>
  </div>

  <!-- ── OVERVIEW CHARTS ── -->
  <div class="charts-row">
    <div class="chart-box bar">
      <div class="section-title">📊 Accuracy &amp; Speed per Passage</div>
      ${pairedBar}
    </div>
    <div class="chart-box donut">
      <div class="section-title">🔍 Miscue Distribution</div>
      <div class="donut-wrap">
        ${miscueDonut}
        <div class="donut-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#EF4444"></div>Substitution (${opts.miscueData.find(m => m.type === 'Substitution')?.count ?? 0})</div>
          <div class="legend-item"><div class="legend-dot" style="background:#F59E0B"></div>Omission (${opts.miscueData.find(m => m.type === 'Omission')?.count ?? 0})</div>
          <div class="legend-item"><div class="legend-dot" style="background:#3B82F6"></div>Insertion (${opts.miscueData.find(m => m.type === 'Insertion')?.count ?? 0})</div>
          <div class="legend-item"><div class="legend-dot" style="background:#10B981"></div>Repetition (${opts.miscueData.find(m => m.type === 'Repetition')?.count ?? 0})</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════
       TAB 1 — PROGRESS
  ══════════════════════════════════════════════════════════════════ -->
  ${progressHtml}

  <!-- ══════════════════════════════════════════════════════════════════
       TAB 2 — WORD MASTERY
  ══════════════════════════════════════════════════════════════════ -->
  <h2 class="tab-title">📖 Word Mastery</h2>
  ${wordHtml}

  <!-- ══════════════════════════════════════════════════════════════════
       TAB 3 — ANALYTICS
  ══════════════════════════════════════════════════════════════════ -->
  <h2 class="tab-title">📊 Analytics</h2>
  <div class="history-period">${esc(opts.analyticsRangeLabel)}</div>
  ${accuracyHtml}
  ${miscueHtml}

  <!-- ══════════════════════════════════════════════════════════════════
       TAB 4 — HISTORY
  ══════════════════════════════════════════════════════════════════ -->
  ${history.html}

  <!-- ── FOOTER ── -->
  <div class="footer">
    Generated by <strong>Reading Assessment System</strong> &nbsp;·&nbsp; ${esc(opts.generatedAt)}
  </div>

</body>
</html>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

export default function ExportPdf({
  studentId: studentIdProp,
  groupedReports: groupedReportsProp,
  historyFilter = 'week',
  historyAnchor,
  historySelectedDay = null,
  historySelectedWeekOfMonth = null,
  perfTimeRange = 'week',
  perfAnchor,
  perfSelectedDay = null,
  perfSelectedWeekOfMonth = null,
  gradeLevel,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [studentName, setStudentName] = useState('Student');
  const [fallbackReports, setFallbackReports] = useState<GroupedReport[]>([]);

  const authUser = getAuth().currentUser;
  const studentId = studentIdProp || authUser?.uid || '';
  const role: 'student' | 'faculty' = studentIdProp && studentIdProp !== authUser?.uid ? 'faculty' : 'student';

  // Fallback: if no reports were passed in (e.g. Faculty view), fetch + group here.
  useEffect(() => {
    if (!studentId || groupedReportsProp) return;
    let alive = true;
    (async () => {
      try {
        const reports = await MiscueReportController.getStudentReports(studentId);
        if (alive) setFallbackReports(groupReportsByPassage(reports));
      } catch {
        // non-fatal — empty list will render an empty History section
      }
    })();
    return () => { alive = false; };
  }, [studentId, groupedReportsProp]);

  const groupedReports = groupedReportsProp ?? fallbackReports;

  // Resolve display name (best-effort)
  useEffect(() => {
    const fetchName = async () => {
      try {
        if (!studentId) return;
        const snap = await getDoc(doc(getFirestore(), 'users', studentId));
        if (snap.exists()) {
          const d = snap.data() as any;
          const name =
            d?.studentData?.name ??
            d?.studentData?.fullName ??
            d?.displayName ??
            'Student';
          setStudentName(name);
        }
      } catch {
        // fall back silently
      }
    };
    fetchName();
  }, [studentId]);

  // ── Hooks for each section's data ────────────────────────────────────────
  // Progress (no time filter — curriculum-wide)
  const completedWords = useStudentCompletedWord(studentId);

  // Word Mastery — uses Analytics filter (per user decision)
  const wordTimeRange: TimeRange = perfTimeRange;
  const { chapters: wordChapters, slots: wordSlots, summary: wordSummary } =
    useStudentWordMastery(studentId, wordTimeRange);

  // Analytics filter resolution — day/week chip overrides bound to explicit dates
  const perfAnchorResolved = perfAnchor ?? new Date();
  const perfBounds = useMemo<{ start?: Date; end?: Date }>(() => {
    if (perfTimeRange === 'week' && perfSelectedDay !== null) {
      const monday = getWeekStart(perfAnchorResolved);
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + perfSelectedDay);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      return { start: dayStart, end: dayEnd };
    }
    if (perfTimeRange === 'month' && perfSelectedWeekOfMonth !== null) {
      const year = perfAnchorResolved.getFullYear();
      const month = perfAnchorResolved.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const i = perfSelectedWeekOfMonth - 1;
      const ws = new Date(year, month, i * 7 + 1, 0, 0, 0, 0);
      const we = new Date(year, month, Math.min((i + 1) * 7, totalDays), 23, 59, 59, 999);
      return { start: ws, end: we };
    }
    return {};
  }, [perfTimeRange, perfAnchorResolved, perfSelectedDay, perfSelectedWeekOfMonth]);

  const { chartData: accuracyChart } =
    useStudentAccuracyTrends(studentId, perfTimeRange, perfAnchorResolved, perfBounds.start, perfBounds.end);
  const { miscueData, total: miscueTotal } =
    useStudentMiscueStats(studentId, perfTimeRange, perfAnchorResolved, perfBounds.start, perfBounds.end);
  const { topPassage, topWords } =
    useStudentTopMiscuePassageAndWords(studentId, perfTimeRange, perfAnchorResolved, perfBounds.start, perfBounds.end);

  const historyAnchorResolved = historyAnchor ?? new Date();

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const now = new Date();
      const generatedAt = now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

      const wordRangeLabel = formatPeriodLabel(perfTimeRange, perfAnchorResolved);
      const analyticsRangeLabel = perfBounds.start && perfBounds.end
        ? `${perfBounds.start.toLocaleDateString()} – ${perfBounds.end.toLocaleDateString()}`
        : formatPeriodLabel(perfTimeRange, perfAnchorResolved);

      const html = buildPdfHtml({
        studentName,
        generatedAt,
        role,
        gradeLevel,

        completedWords: completedWords as any,

        wordChapters,
        wordSlots,
        wordSummary,
        wordRangeLabel,

        accuracyChart,
        miscueData,
        miscueTotal,
        topPassage,
        topWords,
        analyticsRangeLabel,

        groupedReports,
        historyFilter,
        historyAnchor: historyAnchorResolved,
        historySelectedDay,
        historySelectedWeekOfMonth,
      });

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
    backgroundColor: '#B91C1C',
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

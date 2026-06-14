export interface ChapterProgressItem {
  title: string;
  done: number;
  total: number;
  pct: number;
}

export interface WordSlotItem {
  label: string;
  correctCount: number;
}

export interface TrendDataItem {
  date: string;
  accuracy: number;
  wpm: number;
}

export interface MiscueDonutItem {
  type: string;
  count: number;
  pct: number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const esc = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function buildChapterProgressChartSvg(chapters: ChapterProgressItem[]): string {
  if (!chapters.length) return '';

  const width = 500;
  const rowH = 28;
  const labelW = 140;
  const trackX = labelW + 8;
  const trackW = width - trackX - 40;
  const height = chapters.length * rowH + 24;

  let rows = '';
  chapters.forEach((ch, i) => {
    const y = 12 + i * rowH;
    const fillW = Math.max(0, (ch.pct / 100) * trackW);
    const color = ch.pct >= 85 ? '#22c55e' : ch.pct >= 60 ? '#f59e0b' : '#ef4444';
    rows += `
      <text x="4" y="${y + 17}" font-size="11" font-weight="600" fill="#1c2833">${esc(ch.title)}</text>
      <rect x="${trackX}" y="${y + 4}" width="${trackW}" height="14" rx="3" fill="#ebf5fb"/>
      <rect x="${trackX}" y="${y + 4}" width="${fillW}" height="14" rx="3" fill="${color}"/>
      <text x="${trackX + fillW + 4}" y="${y + 15}" font-size="10" font-weight="800" fill="#154360">${ch.pct}%</text>`;
  });

  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rows}</svg>`;
}

export function buildWordCompletionBarsSvg(slots: WordSlotItem[]): string {
  if (!slots.length) return '';

  const width = 500;
  const height = 180;
  const barAreaTop = 30;
  const barAreaH = 110;
  const barAreaLeft = 36;
  const barAreaRight = 20;
  const barAreaW = width - barAreaLeft - barAreaRight;
  const maxCount = Math.max(...slots.map(s => s.correctCount), 1);
  const barW = Math.max(4, Math.min(32, (barAreaW / slots.length) * 0.7));
  const gap = (barAreaW - barW * slots.length) / (slots.length + 1);

  let bars = '';
  slots.forEach((s, i) => {
    const x = barAreaLeft + gap + i * (barW + gap);
    const barH = (s.correctCount / maxCount) * barAreaH;
    const y = barAreaTop + barAreaH - barH;
    const hasData = s.correctCount > 0;
    bars += `
      <text x="${x + barW / 2}" y="${height - 8}" text-anchor="middle" font-size="10" font-weight="700" fill="#859dab">${esc(s.label)}</text>
      <text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="10" font-weight="800" fill="${hasData ? '#154360' : '#859dab'}">${hasData ? s.correctCount : '—'}</text>
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${hasData ? '#22c55e' : '#d6eaf8'}"/>`;
  });

  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <line x1="${barAreaLeft}" y1="${barAreaTop + barAreaH}" x2="${width - barAreaRight}" y2="${barAreaTop + barAreaH}" stroke="#d6eaf8" stroke-width="1"/>
    ${bars}
  </svg>`;
}

export function buildAccuracyLineChartSvg(data: TrendDataItem[], benchmarkLine?: number): string {
  if (!data.length) return '';

  const width = 500;
  const height = 200;
  const pad = { top: 30, right: 40, bottom: 36, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const yMax = 100;
  const yTicks = [0, 25, 50, 75, 100];

  const xStep = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + chartH - (d.accuracy / yMax) * chartH,
  }));

  let polyline = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');

  const areaPath = polyline +
    ` L${points[points.length - 1].x},${pad.top + chartH}` +
    ` L${points[0].x},${pad.top + chartH} Z`;

  const dots = points
    .map((p, i) => {
      const isPeak = i === data.reduce((maxI, item, idx, arr) => (item.accuracy > arr[maxI].accuracy ? idx : maxI), 0) && data[i].accuracy > 0;
      const r = isPeak ? 6 : 4;
      const stroke = isPeak ? '#ffffff' : '#3d71d9';
      const sw = isPeak ? 3 : 1.5;
      return `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${stroke}" stroke="#3d71d9" stroke-width="${sw}"/>`;
    })
    .join('\n');

  const gridLines = yTicks
    .map(v => {
      const y = pad.top + chartH - (v / yMax) * chartH;
      return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#d6eaf8" stroke-width="1" stroke-dasharray="4 2"/>`;
    })
    .join('\n');

  const yLabels = yTicks
    .map(v => {
      const y = pad.top + chartH - (v / yMax) * chartH;
      return `<text x="${pad.left - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#859dab">${v}</text>`;
    })
    .join('\n');

  const xLabels = data
    .map((d, i) => {
      const x = pad.left + i * xStep;
      const shortLabel = d.date.length > 6 ? d.date.substring(0, 6) : d.date;
      return `<text x="${x}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#859dab">${esc(shortLabel)}</text>`;
    })
    .join('\n');

  let benchmarkSvg = '';
  if (benchmarkLine !== undefined && benchmarkLine > 0) {
    const by = pad.top + chartH - (benchmarkLine / yMax) * chartH;
    benchmarkSvg = `<line x1="${pad.left}" y1="${by}" x2="${width - pad.right}" y2="${by}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 3"/>
      <text x="${width - pad.right + 2}" y="${by + 4}" font-size="9" fill="#f59e0b" font-weight="700">Benchmark</text>`;
  }

  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${gridLines}
    ${yLabels}
    ${xLabels}
    ${benchmarkSvg}
    <path d="${areaPath}" fill="#3d71d9" fill-opacity="0.12" stroke="none"/>
    <path d="${polyline}" fill="none" stroke="#3d71d9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}
  </svg>`;
}

export function buildPassageSparklineSvg(values: number[]): string {
  if (!values || values.length === 0) return '';

  const width = 120;
  const height = 40;
  const pad = 2;

  let normalized = values.map(v => Math.max(0, Math.min(100, v)));
  if (normalized.some(v => v > 1) && normalized.every(v => v <= 100)) {
    normalized = normalized.map(v => v / 100);
  }

  const maxVal = Math.max(...normalized, 0.1);
  const points = normalized.map((v, i) => {
    const x = pad + (i / Math.max(normalized.length - 1, 1)) * (width - 2 * pad);
    const y = pad + (1 - v / maxVal) * (height - 2 * pad);
    return `${x},${y}`;
  });

  if (normalized.length === 1) {
    const y = pad + (1 - normalized[0] / maxVal) * (height - 2 * pad);
    return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <line x1="${pad}" y1="${y}" x2="${width - pad}" y2="${y}" stroke="#3d71d9" stroke-width="2"/>
    </svg>`;
  }

  const polyline = `M${points.join(' L')}`;
  const firstX = pad;
  const lastX = pad + ((normalized.length - 1) / Math.max(normalized.length - 1, 1)) * (width - 2 * pad);
  const baseY = pad + (height - 2 * pad);

  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <path d="${polyline} L${lastX},${baseY} L${firstX},${baseY} Z" fill="#3d71d9" fill-opacity="0.1" stroke="none"/>
    <path d="${polyline}" fill="none" stroke="#3d71d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function buildDonutSvg(total: number, segments: { type: string; count: number; color: string }[]): string {
  if (!total || !segments.length) return '';

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const ir = 45;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const paths = segments.map(seg => {
    const pct = seg.count / total;
    const dashLen = pct * circumference;
    const gapLen = circumference - dashLen;
    const rotate = (offset / circumference) * 360 - 90;
    offset += dashLen;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${r - ir}" stroke-dasharray="${dashLen} ${gapLen}" stroke-dashoffset="0" transform="rotate(${rotate} ${cx} ${cy})" stroke-linecap="butt"/>`;
  }).join('\n');

  return `<svg xmlns="${SVG_NS}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${paths}
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="20" font-weight="900" fill="#154360">${total}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="9" font-weight="700" fill="#859dab">MISRUES</text>
    ${segments.map((seg, i) => {
      const angle = ((offset / circumference) * 360 - 90) - (seg.count / total) * 180;
      const lx = cx + 90 * Math.cos((angle * Math.PI) / 180);
      const ly = cy + 90 * Math.sin((angle * Math.PI) / 180);
      return `<circle cx="${lx}" cy="${ly}" r="5" fill="${seg.color}"/>`;
    }).join('\n')}
  </svg>`;
}

export function buildMiscueDonutWithLabelsSvg(total: number, segments: MiscueDonutItem[]): string {
  if (!total || !segments.length) return '';

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const ir = 45;
  const circumference = 2 * Math.PI * r;

  const COLORS: Record<string, string> = {
    substitution: '#3d71d9',
    omission: '#f59e0b',
    insertion: '#ef4444',
    repetition: '#7d4b9a',
  };

  let offset = 0;
  const paths: string[] = [];
  const labels: string[] = [];

  segments.forEach(seg => {
    const pct = seg.count / total;
    const dashLen = pct * circumference;
    const gapLen = circumference - dashLen;
    const rotate = (offset / circumference) * 360 - 90;
    const midAngle = rotate + (dashLen / circumference) * 360;
    const midRad = (midAngle * Math.PI) / 180;

    paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${COLORS[seg.type] || '#666'}" stroke-width="${r - ir}" stroke-dasharray="${dashLen} ${gapLen}" transform="rotate(${rotate} ${cx} ${cy})" stroke-linecap="butt"/>`);

    const labelR = r + 16;
    const lx = cx + labelR * Math.cos(midRad);
    const ly = cy + labelR * Math.sin(midRad);
    const pctStr = Math.round(pct * 100) + '%';
    labels.push(`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="800" fill="#154360">${pctStr}</text>`);

    offset += dashLen;
  });

  return `<svg xmlns="${SVG_NS}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${paths.join('\n')}
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="22" font-weight="900" fill="#154360">${total}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="9" font-weight="700" fill="#859dab">TOTAL</text>
    ${labels.join('\n')}
  </svg>`;
}

export function buildPairedBarChartSvg(
  aralins: { label: string; accuracy: number; wpm: number }[],
  maxWpm: number,
): string {
  if (!aralins.length) return '';

  const width = 500;
  const height = 160;
  const pad = { top: 20, right: 50, bottom: 30, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const yMax = 100;
  const groupW = chartW / aralins.length;
  const barW = Math.max(3, Math.min(10, groupW * 0.3));

  const gridLines = [0, 25, 50, 75, 100]
    .map(v => {
      const y = pad.top + chartH - (v / yMax) * chartH;
      return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#d6eaf8" stroke-width="1"/>`;
    })
    .join('\n');

  const yLabels = [0, 25, 50, 75, 100]
    .map(v => {
      const y = pad.top + chartH - (v / yMax) * chartH;
      return `<text x="${pad.left - 6}" y="${y + 4}" text-anchor="end" font-size="9" fill="#859dab">${v}</text>`;
    })
    .join('\n');

  const bars = aralins
    .map((a, i) => {
      const gx = pad.left + i * groupW + groupW / 2;
      const accH = (a.accuracy / yMax) * chartH;
      const accY = pad.top + chartH - accH;
      const wpmScaled = (a.wpm / Math.max(maxWpm, 1)) * yMax;
      const wpmH = (wpmScaled / yMax) * chartH;
      const wpmY = pad.top + chartH - wpmH;
      const showLabel = i % Math.ceil(aralins.length / 15) === 0;
      return `
        <rect x="${gx - barW - 1}" y="${accY}" width="${barW}" height="${accH}" rx="2" fill="#3d71d9"/>
        <rect x="${gx + 1}" y="${wpmY}" width="${barW}" height="${wpmH}" rx="2" fill="#f59e0b"/>
        ${showLabel ? `<text x="${gx}" y="${height - 6}" text-anchor="middle" font-size="9" fill="#859dab">${esc(a.label)}</text>` : ''}`;
    })
    .join('\n');

  const legend = `
    <rect x="${pad.left}" y="0" width="10" height="10" rx="2" fill="#3d71d9"/>
    <text x="${pad.left + 14}" y="9" font-size="10" fill="#1c2833" font-weight="700">Accuracy</text>
    <rect x="${pad.left + 80}" y="0" width="10" height="10" rx="2" fill="#f59e0b"/>
    <text x="${pad.left + 94}" y="9" font-size="10" fill="#1c2833" font-weight="700">WPM</text>`;

  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${legend}${gridLines}${yLabels}${bars}
    <text x="${pad.left}" y="20" text-anchor="start" font-size="9" fill="#859dab">%</text>
    <text x="${width - pad.right}" y="20" text-anchor="end" font-size="9" fill="#859dab">wpm</text>
  </svg>`;
}

export function buildMiscueBreakdownBarsSvg(items: { label: string; count: number; color: string }[]): string {
  if (!items.length) return '';

  const width = 500;
  const rowH = 24;
  const labelW = 140;
  const trackX = labelW + 8;
  const trackW = width - trackX - 50;
  const maxCount = Math.max(...items.map(i => i.count), 1);
  const height = items.length * rowH + 16;

  const rows = items
    .map((item, i) => {
      const y = 8 + i * rowH;
      const fillW = (item.count / maxCount) * trackW;
      return `
        <text x="4" y="${y + 15}" font-size="11" font-weight="600" fill="#1c2833">${esc(item.label)}</text>
        <text x="${trackX}" y="${y + 15}" font-size="10" font-weight="800" fill="#154360">${item.count}</text>
        <rect x="${trackX + 30}" y="${y + 4}" width="${trackW - 30}" height="14" rx="3" fill="#ebf5fb"/>
        <rect x="${trackX + 30}" y="${y + 4}" width="${fillW}" height="14" rx="3" fill="${item.color}"/>`;
    })
    .join('\n');

  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rows}</svg>`;
}

export const PDF_CSS = `
body {
  font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 16px;
  color: #1c2833;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.cover {
  text-align: center;
  padding: 24px 0;
  border-bottom: 2px solid #3d71d9;
  margin-bottom: 16px;
}
.cover h1 {
  font-size: 22px;
  margin: 0;
  color: #154360;
}
.cover .student {
  font-size: 18px;
  font-weight: 800;
  margin-top: 8px;
  color: #154360;
}
.cover .level {
  font-size: 12px;
  color: #859dab;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}
.summary-strip {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.stat-box {
  flex: 1;
  background: #eaf2f8;
  padding: 10px;
  border-radius: 12px;
  text-align: center;
}
.stat-box .val {
  font-size: 20px;
  font-weight: 900;
  color: #154360;
}
.stat-box .lbl {
  font-size: 10px;
  font-weight: 700;
  color: #859dab;
  text-transform: uppercase;
  margin-top: 2px;
}
.chart-box {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #d6eaf8;
}
.chart-label {
  font-size: 13px;
  font-weight: 800;
  color: #1c2833;
  margin-bottom: 8px;
}
.section-title {
  font-size: 16px;
  font-weight: 900;
  color: #154360;
  margin: 16px 0 8px;
  border-left: 4px solid #3d71d9;
  padding-left: 8px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 8px;
}
.table th {
  background: #eaf2f8;
  padding: 6px;
  text-align: left;
  font-weight: 700;
  color: #154360;
}
.table td {
  padding: 6px;
  border-bottom: 1px solid #ebf5fb;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}
.badge-green {
  background: #22c55e20;
  color: #16a34a;
}
.badge-amber {
  background: #f59e0b20;
  color: #d97706;
}
.badge-red {
  background: #ef444420;
  color: #dc2626;
}
.footer {
  text-align: center;
  font-size: 10px;
  color: #859dab;
  margin-top: 24px;
  border-top: 1px solid #d6eaf8;
  padding-top: 12px;
}
.empty-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #859dab;
  font-size: 13px;
  font-weight: 600;
}
.progress-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}
.progress-label {
  width: 140px;
  font-size: 12px;
  font-weight: 600;
  color: #1c2833;
  flex-shrink: 0;
}
.progress-track {
  flex: 1;
  height: 8px;
  background: #ebf5fb;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: #3d71d9;
}
.progress-pct {
  width: 40px;
  text-align: right;
  font-size: 12px;
  font-weight: 800;
  color: #154360;
}
.aralin-card {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #ebf5fb;
}
.aralin-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.aralin-icon {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
  flex-shrink: 0;
}
.aralin-title {
  flex: 1;
  font-size: 13px;
  font-weight: 800;
  color: #1c2833;
}
.sparkline-cell {
  text-align: center;
  padding: 4px;
}
.insight-strip {
  background: #eaf2f8;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #154360;
  margin-top: 8px;
}
.insight-strip.up {
  background: #d4f1e8;
  color: #0d3048;
}
.insight-strip.down {
  background: #fee2e2;
  color: #7f1d1d;
}
`;

export default PDF_CSS;

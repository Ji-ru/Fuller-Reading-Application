/**
 * Script to add responsive imports and wrap hardcoded pixel values in
 * StyleSheet.create blocks across Component and Screen files.
 *
 * Usage: node scripts/add-responsive.js
 */
const fs = require('fs');
const path = require('path');

// All files that need responsive scaling applied to inline styles
const files = [
  // Screens
  'src/Screens/Student/Student_Profile.tsx',
  'src/Screens/Student/Student_MyClass.tsx',
  'src/Screens/SignUp/SignUp_Two.tsx',
  'src/Screens/Faculty/Faculty_Student_View_Profile.tsx',
  'src/Screens/Admin/Admin_Dashboard.tsx',
  // Components - GlobalUse & SignUp
  'src/Components/GlobalUse/Sidebar.tsx',
  'src/Components/SignUp/Buttons/AcademicYearDropdown.tsx',
  // Components - Faculty/StudentView_Status
  'src/Components/Faculty/StudentView_Status/StudentWordMastery.tsx',
  'src/Components/Faculty/StudentView_Status/StudentAlphabetMastery.tsx',
  'src/Components/Faculty/StudentView_Status/Student_TopPassage&TopWords.tsx',
  'src/Components/Faculty/StudentView_Status/Student_TimeTrack.tsx',
  'src/Components/Faculty/StudentView_Status/Student_MiscueChart.tsx',
  'src/Components/Faculty/StudentView_Status/Student_TimeTrackCards/ActivitySummaryCard.tsx',
  'src/Components/Faculty/StudentView_Status/Student_TimeTrackCards/ActivityDetailsList.tsx',
  'src/Components/Faculty/StudentView_Status/Student_TimeTrackCards/ActivityBarChart.tsx',
  // Components - Faculty/Dashboard
  'src/Components/Faculty/Dashboard/PieChart.tsx',
  'src/Components/Faculty/Dashboard/MiscueChart.tsx',
  'src/Components/Faculty/Dashboard/FilterSelector.tsx',
  'src/Components/Faculty/Dashboard/ClassWordMastery.tsx',
  'src/Components/Faculty/Dashboard/ClassReadingStatus.tsx',
  'src/Components/Faculty/Dashboard/ClassAlphabetMastery.tsx',
  'src/Components/Faculty/Dashboard/ActiveHoursChart.tsx',
  'src/Components/Faculty/Dashboard/AccuracyTrends.tsx',
  // Components - Admin
  'src/Components/Admin/ClassesPerGradeChart.tsx',
  'src/Components/Admin/ReadingLevelDistributionChart.tsx',
  'src/Components/Admin/UsersRegisteredChart.tsx',
  'src/Components/Admin/UsersByRoleChart.tsx',
  'src/Components/Admin/ClassStatusChart.tsx',
];

const ROOT = path.resolve(__dirname, '..');

/**
 * Properties whose numeric values should be wrapped with sf() (font scaling)
 */
const FONT_PROPS = new Set([
  'fontSize', 'lineHeight', 'letterSpacing',
]);

/**
 * Properties whose numeric values should be wrapped with sh() (height scaling)
 */
const HEIGHT_PROPS = new Set([
  'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom',
  'paddingVertical', 'marginVertical', 'top', 'bottom',
]);

/**
 * Properties whose values should NOT be wrapped
 */
const SKIP_PROPS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'opacity', 'zIndex',
  'borderWidth', 'borderBottomWidth', 'borderTopWidth', 'borderLeftWidth',
  'borderRightWidth', 'elevation', 'shadowOpacity',
  'aspectRatio', 'fontWeight', 'textDecorationLine', 'textTransform',
  'overflow', 'position', 'flexDirection', 'justifyContent', 'alignItems',
  'alignSelf', 'alignContent', 'textAlign', 'resizeMode', 'display',
  'flexWrap', 'pointerEvents', 'includeFontPadding', 'fontStyle',
  'verticalAlign',
]);

/**
 * Determine the correct wrapper function for a given property.
 * Returns null if the value should not be wrapped.
 */
function getWrapper(prop) {
  if (SKIP_PROPS.has(prop)) return null;
  if (FONT_PROPS.has(prop)) return 'sf';
  if (HEIGHT_PROPS.has(prop)) return 'sh';
  // Default to sw() for widths, padding, margin, borderRadius, etc.
  return 'sw';
}

/**
 * Process a file: find the StyleSheet.create block(s) and wrap numeric pixel
 * values with the appropriate responsive function.
 */
function processFile(filePath) {
  const absPath = path.join(ROOT, filePath);
  if (!fs.existsSync(absPath)) {
    console.log(`  SKIP (not found): ${filePath}`);
    return;
  }

  let content = fs.readFileSync(absPath, 'utf-8');
  const originalContent = content;

  // Skip files where responsive is already imported
  if (content.includes("from '../Utils/responsive'") || 
      content.includes("from '../../Utils/responsive'") ||
      content.includes("from '../../../Utils/responsive'")) {
    console.log(`  SKIP (already responsive): ${filePath}`);
    return;
  }

  // Determine the correct relative import path
  const depth = filePath.split('/').length - 2; // relative to src/
  let importPrefix = '';
  for (let i = 0; i < depth; i++) importPrefix += '../';
  const importLine = `import { sw, sh, sf } from '${importPrefix}Utils/responsive';`;

  // Add import after the last existing import
  const lastImportIndex = content.lastIndexOf('\nimport ');
  if (lastImportIndex === -1) {
    console.log(`  SKIP (no imports found): ${filePath}`);
    return;
  }
  const nextNewline = content.indexOf('\n', lastImportIndex + 1);
  // Find end of last import statement (could be multi-line)
  let importEnd = nextNewline;
  // Handle multi-line imports like: import {\n  View,\n} from '...'
  const afterImport = content.substring(lastImportIndex + 1);
  const importMatch = afterImport.match(/^import[\s\S]*?from\s+['"][^'"]+['"];?\r?\n/);
  if (importMatch) {
    importEnd = lastImportIndex + 1 + importMatch[0].length;
  }
  content = content.substring(0, importEnd) + importLine + '\n' + content.substring(importEnd);

  // Now process StyleSheet.create blocks
  // Regex to find property: numericValue patterns inside StyleSheet.create
  // Match lines like:  fontSize: 16,  or  padding: 20,  or  marginBottom: -10,
  content = content.replace(
    /^(\s+)(\w+):\s+(-?\d+\.?\d*),?\s*(\/\/.*)?$/gm,
    (match, indent, prop, value, comment) => {
      const numVal = parseFloat(value);
      const wrapper = getWrapper(prop);
      
      // Don't wrap 0 values, or values that shouldn't be wrapped
      if (!wrapper || numVal === 0) return match;
      
      const commentSuffix = comment ? ` ${comment}` : '';
      const comma = match.trimEnd().endsWith(',') ? ',' : '';
      return `${indent}${prop}: ${wrapper}(${value}),${commentSuffix}`;
    }
  );

  // Also wrap values inside shadowOffset: { width: N, height: N }
  content = content.replace(
    /shadowOffset:\s*\{\s*width:\s*(-?\d+\.?\d*),\s*height:\s*(-?\d+\.?\d*)\s*\}/g,
    (match, w, h) => {
      const wVal = parseFloat(w);
      const hVal = parseFloat(h);
      const wStr = wVal === 0 ? '0' : `sw(${w})`;
      const hStr = hVal === 0 ? '0' : `sw(${h})`;
      return `shadowOffset: { width: ${wStr}, height: ${hStr} }`;
    }
  );

  // Wrap height/width in complex patterns like:  height: 120, (when inside StyleSheet)
  // Already handled above

  if (content !== originalContent) {
    fs.writeFileSync(absPath, content, 'utf-8');
    console.log(`  UPDATED: ${filePath}`);
  } else {
    console.log(`  NO CHANGES: ${filePath}`);
  }
}

console.log('Adding responsive scaling to inline styles...\n');
let processed = 0;

for (const file of files) {
  processFile(file);
  processed++;
}

console.log(`\nDone! Processed ${processed} files.`);

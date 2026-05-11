/**
 * Icon.tsx
 * Custom SVG icon set for the app's navigation and UI.
 * Usage: <Icon name="dashboard" size={24} color="#008443" filled />
 */
import React from 'react';
import Svg, {
  Path,
  Rect,
  Circle,
  Line,
  Polyline,
} from 'react-native-svg';

export type IconName =
  | 'dashboard'
  | 'myclass'
  | 'archive'
  | 'profile'
  // Student Profile tabs
  | 'progress'
  | 'sessions'
  | 'analytics'
  | 'history'
  // Content / status icons
  | 'alphabet'
  | 'bookOpen'
  | 'bookStack'
  | 'trophy'
  | 'tap'
  | 'inbox'
  | 'star'
  | 'info';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
}

// ─── Individual Icons ─────────────────────────────────────────────────────────

const DashboardIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Top-left cell */}
    <Rect
      x="3" y="3" width="8" height="8" rx="2"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 1.8}
    />
    {/* Top-right cell */}
    <Rect
      x="13" y="3" width="8" height="8" rx="2"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 1.8}
    />
    {/* Bottom-left cell — taller to add variety */}
    <Rect
      x="3" y="13" width="8" height="8" rx="2"
      fill={filled ? `${color}60` : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 1.8}
    />
    {/* Bottom-right cell */}
    <Rect
      x="13" y="13" width="8" height="8" rx="2"
      fill={filled ? `${color}30` : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 1.8}
    />
  </Svg>
);

const MyClassIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Graduation cap top */}
    <Path
      d="M12 3L2 8l10 5 10-5-10-5z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Left book page */}
    <Path
      d="M6 10.5v5.5c0 1.1 2.7 2 6 2s6-.9 6-2V10.5"
      fill={filled ? `${color}40` : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {/* Hanging cord */}
    <Line
      x1="20" y1="8" x2="20" y2="15"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Circle
      cx="20" cy="16.5" r="1.2"
      fill={color}
    />
  </Svg>
);

const ArchiveIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Lid */}
    <Rect
      x="2" y="3" width="20" height="5" rx="1.5"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
    {/* Body */}
    <Path
      d="M4 8v11a1 1 0 001 1h14a1 1 0 001-1V8"
      fill={filled ? `${color}35` : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {/* Inner line detail */}
    <Path
      d="M9.5 13h5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const ProfileIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Head */}
    <Circle
      cx="12" cy="8" r="4"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
    {/* Shoulders */}
    <Path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      fill={filled ? `${color}40` : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

// ─── Student Profile Tab Icons ────────────────────────────────────────────────

// Progress — clipboard with check marks (replaces 📋)
const ProgressIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Clipboard body */}
    <Rect
      x="4" y="5" width="16" height="16" rx="2.5"
      fill={filled ? `${color}30` : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
    {/* Clip at the top */}
    <Rect
      x="8.5" y="2.5" width="7" height="4" rx="1.2"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
    {/* Check 1 */}
    <Polyline
      points="8,11.5 9.5,13 12,10.5"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Check 2 */}
    <Polyline
      points="8,16.5 9.5,18 12,15.5"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Side lines */}
    <Line x1="14" y1="12" x2="17" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1="14" y1="17" x2="17" y2="17" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// Sessions — open book (replaces 📚)
const SessionsIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Left page */}
    <Path
      d="M3 5.5C3 4.7 3.7 4 4.5 4H11v15H4.5c-.8 0-1.5-.7-1.5-1.5v-12z"
      fill={filled ? `${color}40` : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    {/* Right page */}
    <Path
      d="M21 5.5C21 4.7 20.3 4 19.5 4H13v15h6.5c.8 0 1.5-.7 1.5-1.5v-12z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    {/* Center spine */}
    <Line x1="12" y1="4" x2="12" y2="19" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    {/* Page lines (left) */}
    <Line x1="6" y1="8.5" x2="9" y2="8.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={filled ? 0.6 : 1} />
    <Line x1="6" y1="11.5" x2="9" y2="11.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={filled ? 0.6 : 1} />
  </Svg>
);

// Analytics — bar chart with rising bars (replaces 📊)
const AnalyticsIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Baseline */}
    <Line
      x1="3" y1="20" x2="21" y2="20"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {/* Bar 1 (shortest) */}
    <Rect
      x="5" y="13" width="3.5" height="6" rx="1"
      fill={filled ? `${color}55` : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
    {/* Bar 2 */}
    <Rect
      x="10.25" y="9" width="3.5" height="10" rx="1"
      fill={filled ? `${color}80` : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
    {/* Bar 3 (tallest) */}
    <Rect
      x="15.5" y="5" width="3.5" height="14" rx="1"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
  </Svg>
);

// History — clock with counter-clockwise arrow (replaces 🕓)
const HistoryIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Clock face */}
    <Circle
      cx="12" cy="12" r="8"
      fill={filled ? `${color}25` : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
    {/* Hour hand */}
    <Line
      x1="12" y1="12" x2="12" y2="8"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {/* Minute hand */}
    <Line
      x1="12" y1="12" x2="15" y2="13.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {/* Center pivot */}
    <Circle cx="12" cy="12" r="0.9" fill={color} />
  </Svg>
);

// ─── Content / Status Icons ───────────────────────────────────────────────────

// Alphabet — stylized "Aa" letterform (replaces 🔤)
const AlphabetIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Background tile */}
    <Rect
      x="2.5" y="2.5" width="19" height="19" rx="4"
      fill={filled ? `${color}20` : 'none'}
      stroke={color}
      strokeWidth={1.6}
    />
    {/* Letter "A" — left peak + crossbar */}
    <Path
      d="M6.5 16 L9 8 L11.5 16"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="7.3" y1="13.5" x2="10.7" y2="13.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    {/* Letter "a" — circle + stem */}
    <Circle
      cx="15.5" cy="14" r="2.2"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.6}
    />
    <Line x1="17.7" y1="11.8" x2="17.7" y2="16.2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

// Book Open — single-page open book (replaces 📖)
const BookOpenIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Pages */}
    <Path
      d="M3 5h6.5c1.4 0 2.5 1.1 2.5 2.5V20c-.5-1-1.5-1.5-2.5-1.5H3V5z"
      fill={filled ? `${color}40` : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M21 5h-6.5C13.1 5 12 6.1 12 7.5V20c.5-1 1.5-1.5 2.5-1.5H21V5z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    {/* Lines on left page */}
    <Line x1="5.5" y1="9" x2="9" y2="9" stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={filled ? 0.6 : 1} />
    <Line x1="5.5" y1="12" x2="9" y2="12" stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={filled ? 0.6 : 1} />
  </Svg>
);

// Book Stack — three stacked books (replaces 📚)
const BookStackIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Bottom book */}
    <Rect
      x="3" y="16" width="18" height="4.5" rx="1.2"
      fill={filled ? `${color}30` : 'none'}
      stroke={color}
      strokeWidth={1.7}
    />
    {/* Middle book (offset) */}
    <Rect
      x="4.5" y="10.5" width="15" height="4.5" rx="1.2"
      fill={filled ? `${color}55` : 'none'}
      stroke={color}
      strokeWidth={1.7}
    />
    {/* Top book */}
    <Rect
      x="6" y="3.5" width="12" height="6" rx="1.2"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.7}
    />
    {/* Bookmark on top book */}
    <Line x1="14.5" y1="3.5" x2="14.5" y2="7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

// Trophy — winner cup (replaces 🏆)
const TrophyIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Cup body */}
    <Path
      d="M7 4h10v5a5 5 0 01-10 0V4z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    {/* Left handle */}
    <Path
      d="M7 6H4.5a1.5 1.5 0 000 3H7"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right handle */}
    <Path
      d="M17 6h2.5a1.5 1.5 0 010 3H17"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Stem */}
    <Line x1="12" y1="14" x2="12" y2="17" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    {/* Base */}
    <Path
      d="M8.5 20h7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Rect
      x="9" y="17" width="6" height="3" rx="0.8"
      fill={filled ? `${color}50` : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
  </Svg>
);

// Tap — pointing finger / tap gesture (replaces 👆)
const TapIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Finger */}
    <Path
      d="M11 3v8.5l-2-1.5a1.8 1.8 0 00-2.5.5c-.5.8-.3 1.8.4 2.5L10 16l1.5 2c.6.8 1.5 1.2 2.5 1.2h2a3.5 3.5 0 003.5-3.5V12a2 2 0 00-2-2h-1a2 2 0 00-2-2 2 2 0 00-2-2V3a1.5 1.5 0 00-3 0z"
      fill={filled ? `${color}40` : 'none'}
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    {/* Tap pulse rings */}
    <Path
      d="M7 2.5C5.5 3.5 5 5 5 6.5"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      opacity={0.7}
    />
    <Path
      d="M15 2.5C16.5 3.5 17 5 17 6.5"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      opacity={0.7}
    />
  </Svg>
);

// Inbox — empty tray (replaces 📭)
const InboxIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Tray outline */}
    <Path
      d="M3 13l2.5-7a2 2 0 011.9-1.4h9.2A2 2 0 0118.5 6L21 13v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"
      fill={filled ? `${color}25` : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    {/* Inbox slot */}
    <Path
      d="M3 13h5l1.5 2h5l1.5-2h5"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </Svg>
);

// Star — five-point star (replaces 🌟)
const StarIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 16.9 6.7 19.7l1-6L3.3 9.4l6-.9L12 3z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

// Info — circle with "i" (for About / informational items)
const InfoIcon: React.FC<{ size: number; color: string; filled: boolean }> = ({ size, color, filled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12" cy="12" r="9"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
    />
    {/* Dot of "i" */}
    <Circle cx="12" cy="8" r="1.2" fill={filled ? '#ffffff' : color} />
    {/* Stem of "i" */}
    <Line
      x1="12" y1="11" x2="12" y2="16.5"
      stroke={filled ? '#ffffff' : color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// ─── Icon Router ──────────────────────────────────────────────────────────────

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#008443',
  filled = false,
}) => {
  switch (name) {
    case 'dashboard': return <DashboardIcon size={size} color={color} filled={filled} />;
    case 'myclass':   return <MyClassIcon   size={size} color={color} filled={filled} />;
    case 'archive':   return <ArchiveIcon   size={size} color={color} filled={filled} />;
    case 'profile':   return <ProfileIcon   size={size} color={color} filled={filled} />;
    case 'progress':  return <ProgressIcon  size={size} color={color} filled={filled} />;
    case 'sessions':  return <SessionsIcon  size={size} color={color} filled={filled} />;
    case 'analytics': return <AnalyticsIcon size={size} color={color} filled={filled} />;
    case 'history':   return <HistoryIcon   size={size} color={color} filled={filled} />;
    case 'alphabet':  return <AlphabetIcon  size={size} color={color} filled={filled} />;
    case 'bookOpen':  return <BookOpenIcon  size={size} color={color} filled={filled} />;
    case 'bookStack': return <BookStackIcon size={size} color={color} filled={filled} />;
    case 'trophy':    return <TrophyIcon    size={size} color={color} filled={filled} />;
    case 'tap':       return <TapIcon       size={size} color={color} filled={filled} />;
    case 'inbox':     return <InboxIcon     size={size} color={color} filled={filled} />;
    case 'star':      return <StarIcon      size={size} color={color} filled={filled} />;
    case 'info':      return <InfoIcon      size={size} color={color} filled={filled} />;
    default:          return null;
  }
};

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
  G,
  Line,
  Polyline,
} from 'react-native-svg';

export type IconName =
  | 'dashboard'
  | 'myclass'
  | 'archive'
  | 'profile';

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
    default:          return null;
  }
};

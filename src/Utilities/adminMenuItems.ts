/**
 * Shared sidebar menu definition for all Admin screens.
 * Keeping this in one place avoids drift between Admin_Dashboard,
 * Admin_UserManagement, and Admin_ViewFacultyData.
 */

import { IconName } from '../Components/GlobalUse/Icon';
import { RootStackParamList } from '../Controller/NavigationController';

type ScreenNames = keyof RootStackParamList;

export type AdminMenuItemId = 'dashboard' | 'user-management' | 'class-management' | 'passage-list' | 'about';

export interface AdminMenuItem {
  id: AdminMenuItemId;
  label: string;
  iconName: IconName;
  onPress: () => void;
}

type ReplaceStep = <RouteName extends ScreenNames>(
  destination: RouteName,
  params?: RootStackParamList[RouteName],
) => void;

export const buildAdminMenuItems = (
  handleReplaceStep: ReplaceStep,
): AdminMenuItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconName: 'dashboard',
    onPress: () => handleReplaceStep('AdminDashboard'),
  },
  {
    id: 'user-management',
    label: 'User Management',
    iconName: 'users',
    onPress: () => handleReplaceStep('AdminUserManagement'),
  },
  {
    id: 'class-management',
    label: 'Class Management',
    iconName: 'myclass',
    onPress: () => handleReplaceStep('AdminClassManagement'),
  },
  {
    id: 'passage-list',
    label: 'Passages',
    iconName: 'bookOpen',
    onPress: () => handleReplaceStep('AdminPassageList'),
  },
  {
    id: 'about',
    label: 'About',
    iconName: 'info',
    onPress: () => handleReplaceStep('About'),
  },
];

// Note: React hooks such as useState and useEffect can be used inside custom hooks or components but not in plain objects or services.
import { Platform, PermissionsAndroid, Alert } from 'react-native';

// Alternative: Non-hook version for direct usage
export const AudioPermissionService = {
  checkPermission: async () => {
    try {
      if (Platform.OS === 'android') {
        const androidPermissions = [
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ];

        const permissionChecks = await Promise.all(
          androidPermissions.map(permission => 
            PermissionsAndroid.check(permission)
          )
        );

        return permissionChecks.every(status => status === true);
      }
      return true; // iOS
    } catch (error) {
        Alert.alert('Error', 'Failed to get all permission: ' + error);
      return false;
    }
  },

  requestPermission: async () => {
    try {
      if (Platform.OS === 'android') {
        const androidPermissions = [
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ];

        const grants = await PermissionsAndroid.requestMultiple(androidPermissions);
        
        const allGranted = androidPermissions.every(
          permission => grants[permission] === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          const deniedPermissions = androidPermissions.filter(
            permission => grants[permission] !== PermissionsAndroid.RESULTS.GRANTED
          );
          
          console.warn('Denied permissions:', deniedPermissions);
        }

        return allGranted;
      }
      return true; // iOS
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  },

  ensurePermission: async () => {
    const hasPermission = await AudioPermissionService.checkPermission();
    if (!hasPermission) {
      return await AudioPermissionService.requestPermission();
    }
    return true;
  }
};
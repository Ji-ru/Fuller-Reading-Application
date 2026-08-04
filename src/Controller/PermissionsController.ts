import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

type PermissionResult = 'granted' | 'denied' | 'blocked';

export const AudioPermissionService = {
  checkPermission: async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
      }
      return true; // iOS handled by Info.plist + system prompt
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  },

  // Distinguishes "denied" (can re-prompt) from "blocked" (must go to Settings)
  requestPermission: async (): Promise<PermissionResult> => {
    try {
      if (Platform.OS === 'android') {
        const response = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record audio for reading assessments.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );

        if (response === PermissionsAndroid.RESULTS.GRANTED) {
          return 'granted';
        }
        if (response === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          return 'blocked'; // dialog will never show again — must use Settings
        }
        return 'denied'; // user can still be re-prompted
      }
      return 'granted'; // iOS
    } catch (error) {
      console.error('Permission request error:', error);
      return 'denied';
    }
  },

  // Sends the user straight to the app's settings page
  openSettings: () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Error', 'Unable to open settings. Please open Settings manually.');
    });
  },

  // Main entry point — call this before recording
  ensurePermission: async (): Promise<boolean> => {
    const hasPermission = await AudioPermissionService.checkPermission();
    if (hasPermission) return true;

    const result = await AudioPermissionService.requestPermission();

    if (result === 'granted') return true;

    if (result === 'blocked') {
      // This is the case your bug report describes — the dialog never reappears
      Alert.alert(
        'Microphone Access Needed',
        'Microphone access was previously denied. Please enable it manually in Settings > Apps > [Your App] > Permissions > Microphone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: AudioPermissionService.openSettings },
        ]
      );
      return false;
    }

    // result === 'denied' — user can be asked again later
    // Silently return false so they can try again by pressing the mic button
    return false;
  },
};
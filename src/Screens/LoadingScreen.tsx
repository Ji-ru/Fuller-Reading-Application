import React, { useEffect } from 'react';
import Video from 'react-native-video';
import { View } from 'react-native';
import { useNavigationHelper } from '../Controller/NavigationController';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import loading from '../ui/LoadingStyles';

export default function LoadingScreen({ navigation }: any) {

  const { handleReplaceStep } = useNavigationHelper();

  const checkUserCredentials = async () => {
    // Check if the user is logged in
    const currentUser = auth.currentUser;

    /**
     * Error handler verifying if the user is logged in 
     * Goes back to login page if current user is not logged in.
     */
    if (!currentUser) {
      return handleReplaceStep('Login');
    }

    /**
     * Fetch user document
     */

    const ref = doc(db, "students", currentUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return handleReplaceStep('Login');
    }

    /**
     * Check role (default to 'student')
     */
    const data = snap.data();
    const role = data.role || 'student'

    /**
     * NEEDED CHANGES FOR NAVIGATION
     * - Faculty and Admin Pages still UNDERCONSTRUCTION!!
     */
    switch (role) {
      case 'student':
        handleReplaceStep('UserHome');
        break;
      case 'faculty':
        handleReplaceStep('UserHome'); // modify placeholder if it already exists
        break;
      case 'admin':
        handleReplaceStep('UserHome'); // modify placeholder if it already exists
        break;
      default:
        handleReplaceStep('UserHome');
    }
  };

  /**
   * Loads for 3 seconds before navigating to the designated page
   */
  useEffect(() => {
    const timer = setTimeout(async () => {
      await checkUserCredentials();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={loading.container}>
      <Video
        style={loading.video}
        source={require('../../assets/videos/cisc_logo_animated.mp4')}
        repeat={false}
        resizeMode='cover'
      />
    </View>
  );
}


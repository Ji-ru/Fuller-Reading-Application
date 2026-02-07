import React, { useEffect, useState } from 'react';
import Video from 'react-native-video';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';
import { getAuth, signOut } from '@react-native-firebase/auth';
import loading from '../../UI_Designs/LoadingStyles';

export default function LoadingScreen() {
  const auth = getAuth();
  const db = getFirestore();
  const { handleReplaceStep, handleDesignatedUserPage } = useNavigationHelper();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Loading...');

  useEffect(() => {
    console.log('LoadingScreen: Starting verification...');

    const verifyUserAndNavigate = async () => {
      try {
        // Check authentication
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.log('LoadingScreen: No user found, going to Login');
          setStatusMessage('No user found. Redirecting...');
          setTimeout(() => {
            handleReplaceStep('Login');
          }, 1000);
          return;
        }

        setStatusMessage('Checking profile...');

        // Check user profile
        const userRef = await collection(db, 'users');
        const userProfile = query(userRef, where('uid', '==', currentUser.uid));
        const userSnapshot = await getDocs(userProfile);
        
        if (userSnapshot.empty) {
          setStatusMessage('Profile not found. Redirecting...');
          setTimeout(async () => {
            await signOut(auth);
            handleReplaceStep('Login');
          }, 1000);
          return;
        }
        // Get the document of the user
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const role = userData?.role;


        setStatusMessage(`Welcome ${userData?.firstName || ''}!`);

        // Success - navigate to UserHome
        setTimeout(() => {
          handleDesignatedUserPage(role)
        }, 500);

      } catch (error) {
        setStatusMessage('Error. Redirecting...');
        setTimeout(() => {
          handleReplaceStep('Login');
        }, 1000);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      handleReplaceStep('Login');
    }, 3500);

    // Start verification after a short delay
    const verifyTimer = setTimeout(() => {
      verifyUserAndNavigate();
    }, 500);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.43; // 100% over 3.5 seconds
      });
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(verifyTimer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <View style={loading.container}>
      <Video
        style={loading.video}
        source={require('../../../assets/videos/cisc_logo_animated.mp4')}
        repeat={true}
        resizeMode="cover"
      />

      <View style={loading.progressContainer}>
        <View style={loading.progressBarBackground}>
          <View
            style={[
              loading.progressBarFill,
              { width: `${Math.min(progress, 100)}%` },
            ]}
          />
        </View>
        <Text style={loading.progressText}>
          {Math.round(Math.min(progress, 100))}%
        </Text>
        <Text style={loading.statusText}>{statusMessage}</Text>
        <ActivityIndicator
          size="small"
          color="#2CA96A"
          style={loading.loadingSpinner}
        />
      </View>
    </View>
  );
}

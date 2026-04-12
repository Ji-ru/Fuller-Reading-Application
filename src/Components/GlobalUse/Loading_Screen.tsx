import React, { useEffect, useState } from 'react';
import Video from 'react-native-video';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import loading from '../../UI_Designs/LoadingStyles';

export default function LoadingScreen() {
  const { handleReplaceStep } = useNavigationHelper();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Loading...');

  useEffect(() => {
    console.log('LoadingScreen: Starting verification...');
    let isMounted = true;

    // Firebase Auth restores the persisted session asynchronously.
    // onAuthStateChanged fires once it's ready (user or null).
    const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
      if (!isMounted) return;

      try {
        if (!currentUser) {
          console.log('LoadingScreen: No user found, going to Login');
          setStatusMessage('No user found. Redirecting...');
          setTimeout(() => { if (isMounted) handleReplaceStep('Login'); }, 800);
          return;
        }

        console.log('LoadingScreen: User found, checking profile...');
        setStatusMessage('Checking profile...');

        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        if (!isMounted) return;

        if (!userDoc.exists) {
          console.log('LoadingScreen: Profile not found, going to Login');
          setStatusMessage('Profile not found. Redirecting...');
          setTimeout(() => {
            auth().signOut();
            if (isMounted) handleReplaceStep('Login');
          }, 800);
          return;
        }

        const userData = userDoc.data();
        const role = userData?.role;

        console.log(`LoadingScreen: User verified as ${role}`);
        setStatusMessage(`Welcome ${userData?.firstName || ''}!`);

        setTimeout(() => {
          if (!isMounted) return;
          if (role === 'student') {
            handleReplaceStep('UserHome');
          } else if (role === 'faculty') {
            handleReplaceStep('FacultyDashboard');
          }
        }, 500);
      } catch (error) {
        console.error('LoadingScreen: Error during verification:', error);
        setStatusMessage('Error. Redirecting...');
        setTimeout(() => { if (isMounted) handleReplaceStep('Login'); }, 800);
      }
    });

    // Safety timeout — if onAuthStateChanged never fires within 5s, go to Login
    const timeoutId = setTimeout(() => {
      console.log('LoadingScreen: Timeout reached, going to Login');
      if (isMounted) handleReplaceStep('Login');
    }, 5000);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1; // ~100% over 5 seconds
      });
    }, 50);

    return () => {
      console.log('LoadingScreen: Cleanup');
      isMounted = false;
      unsubscribe();
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <View style={loading.container}>
      <Video
        style={loading.video}
        source={require('../../../assets/videos/cisc_logo_animated.mp4')}
        repeat={true}
        resizeMode='cover'
      />
      
      <View style={loading.progressContainer}>
        <View style={loading.progressBarBackground}>
          <View style={[loading.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
        <Text style={loading.progressText}>{Math.round(Math.min(progress, 100))}%</Text>
        <Text style={loading.statusText}>{statusMessage}</Text>
        <ActivityIndicator size="small" color="#2CA96A" style={loading.loadingSpinner} />
      </View>
    </View>
  );
}
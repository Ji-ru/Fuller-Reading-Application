import React, { useEffect, useState } from 'react';
import Video from 'react-native-video';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigationHelper } from '../Controller/NavigationController';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import loading from '../ui/LoadingStyles';

export default function LoadingScreen() {
  const { handleReplaceStep } = useNavigationHelper();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Loading...');

  useEffect(() => {
    console.log('LoadingScreen: Starting verification...');
    
    const verifyUserAndNavigate = async () => {
      try {
        // Check authentication
        const currentUser = auth().currentUser;
        
        if (!currentUser) {
          console.log('LoadingScreen: No user found, going to Login');
          setStatusMessage('No user found. Redirecting...');
          setTimeout(() => {
            handleReplaceStep('Login');
          }, 1000);
          return;
        }

        console.log('LoadingScreen: User found, checking profile...');
        setStatusMessage('Checking profile...');
        
        // Check user profile
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        if (!userDoc.exists) {
          console.log('LoadingScreen: Profile not found, going to Login');
          setStatusMessage('Profile not found. Redirecting...');
          setTimeout(() => {
            auth().signOut();
            handleReplaceStep('Login');
          }, 1000);
          return;
        }

        const userData = userDoc.data();
        const role = userData?.role || 'student';
        
        console.log(`LoadingScreen: User verified as ${role}, going to UserHome`);
        setStatusMessage(`Welcome ${userData?.firstName || ''}!`);

        // Success - navigate to UserHome
        setTimeout(() => {
          handleReplaceStep('UserHome');
        }, 500);

      } catch (error) {
        console.error('LoadingScreen: Error during verification:', error);
        setStatusMessage('Error. Redirecting...');
        setTimeout(() => {
          handleReplaceStep('Login');
        }, 1000);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('LoadingScreen: Timeout reached, going to UserHome');
      handleReplaceStep('UserHome');
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
      console.log('LoadingScreen: Cleanup');
      clearTimeout(timeoutId);
      clearTimeout(verifyTimer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <View style={loading.container}>
      <Video
        style={loading.video}
        source={require('../../assets/videos/cisc_logo_animated.mp4')}
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
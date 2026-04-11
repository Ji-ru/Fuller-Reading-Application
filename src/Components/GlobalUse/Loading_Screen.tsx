import React, { useEffect, useState, useRef } from 'react';
import Video from 'react-native-video';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getAuth, signOut } from '@react-native-firebase/auth';
import loading from '../../UI_Designs/LoadingStyles';
import { getUserProfile } from '../../Controller/AuthenticationController';

export default function LoadingScreen() {
  const auth = getAuth();
  const { handleReplaceStep, handleDesignatedUserPage } = useNavigationHelper();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Loading...');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let verifyTimer: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;

    console.log('LoadingScreen: Starting verification...');

    const verifyUserAndNavigate = async () => {
      try {
        // Check authentication
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.log('LoadingScreen: No user found, going to Login');
          if (isMounted.current) {
            setStatusMessage('No user found. Redirecting...');
            setTimeout(() => {
              if (isMounted.current) {
                handleReplaceStep('Login', { authError: 'Session expired. Please sign in again.' });
              }
            }, 1000);
          }
          return;
        }

        if (isMounted.current) setStatusMessage('Checking profile...');

        // Create a focused fetch block to run alongside a timeout limit
        const fetchProfile = async () => {
          const userProfile = await getUserProfile(currentUser.uid);
          if (!userProfile) {
            throw new Error('profile-not-found');
          }
          return userProfile;
        };

        // 15-second timeout for slow connections
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout-error')), 15000)
        );

        // Race the fetch against the timeout to prevent infinite loads and navigation clash
        const userData = await Promise.race([fetchProfile(), timeoutPromise]) as any;

        if (!isMounted.current) return;

        // Extract data
        const role = userData?.role;

        setStatusMessage(`Welcome ${userData?.firstName || ''}!`);

        // Success - navigate to UserHome
        setTimeout(() => {
          if (isMounted.current) handleDesignatedUserPage(role);
        }, 500);

      } catch (error: any) {
        if (!isMounted.current) return;

        if (error.message === 'profile-not-found') {
          setStatusMessage('Profile not found. Redirecting...');
          setTimeout(async () => {
            await signOut(auth);
            if (isMounted.current) {
              handleReplaceStep('Login', { authError: 'Account profile not found. Please contact an administrator.' });
            }
          }, 1000);
        } else if (error.message === 'timeout-error') {
          setStatusMessage('Connection taking too long. Redirecting...');
          setTimeout(() => {
            if (isMounted.current) {
              handleReplaceStep('Login', { authError: 'Connection timed out. Please try signing in again.' });
            }
          }, 1000);
        } else {
          setStatusMessage('Error verifying. Redirecting...');
          setTimeout(() => {
            if (isMounted.current) {
              handleReplaceStep('Login', { authError: 'Failed to verify account. Please check your internet connection.' });
            }
          }, 1000);
        }
      }
    };

    // Start verification after a short delay
    verifyTimer = setTimeout(() => {
      verifyUserAndNavigate();
    }, 500);

    // Progress bar animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.43; // 100% over 3.5 seconds
      });
    }, 50);

    return () => {
      isMounted.current = false;
      clearTimeout(verifyTimer);
      clearInterval(progressInterval);
    };
  }, []); // Run ONCE on mount

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

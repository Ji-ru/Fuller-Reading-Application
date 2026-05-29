import React, { useEffect, useRef, useState } from 'react';
import Video from 'react-native-video';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useNavigationHelper, RootStackParamList } from '../../Controller/NavigationController';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
} from '@react-native-firebase/firestore';
import loading from '../../UI_Designs/LoadingStyles';

// ─── v22: Module-level singletons ────────────────────────────────────────────
const auth = getAuth();
const db = getFirestore();

export default function LoadingScreen() {
  const { handleReplaceStep } = useNavigationHelper();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Loading...');
  const [videoError, setVideoError] = useState(false);

  // Track whether auth has already resolved so the safety timeout
  // does not fire a second navigation on top of a completed one.
  const authResolvedRef = useRef(false);

  useEffect(() => {
    console.log('LoadingScreen: Starting verification...');
    let isMounted = true;

    // ── Progress bar animation ──────────────────────────────────────────────
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 1;
      });
    }, 60);

    // ── Helper: navigate and tear down immediately ─────────────────────────
    const navigate = (screen: keyof RootStackParamList, unsubscribeFn: () => void) => {
      if (!isMounted) return;
      authResolvedRef.current = true;
      unsubscribeFn();
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      setProgress(100);
      setTimeout(() => {
        if (isMounted) handleReplaceStep(screen);
      }, 150);
    };

    // ── Firebase Auth state ────────────────────────────────────────────────
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      try {
        if (!currentUser) {
          console.log('LoadingScreen: No user, going to Login');
          navigate('Login', unsubscribe);
          return;
        }

        console.log('LoadingScreen: User found, checking profile...');
        if (isMounted) setStatusMessage('Checking profile...');

        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));

        if (!isMounted) return;

        if (!userSnap.exists()) {
          console.log('LoadingScreen: Profile not found, signing out');
          await signOut(auth).catch(e =>
            console.warn('LoadingScreen: signOut error', e),
          );
          navigate('Login', unsubscribe);
          return;
        }

        const role = userSnap.data()?.role;
        console.log(`LoadingScreen: User verified as ${role}`);

        if (role === 'student') {
          navigate('UserHome', unsubscribe);
        } else if (role === 'faculty') {
          navigate('FacultyDashboard', unsubscribe);
        } else if (role === 'admin') {
          navigate('AdminDashboard', unsubscribe);
        } else {
          console.warn(`LoadingScreen: Unknown role "${role}", going to Login`);
          await signOut(auth).catch(e =>
            console.warn('LoadingScreen: signOut error', e),
          );
          navigate('Login', unsubscribe);
        }
      } catch (error) {
        console.error('LoadingScreen: Verification error:', error);
        navigate('Login', unsubscribe);
      }
    });

    // ── Safety timeout ─────────────────────────────────────────────────────
    const timeoutId = setTimeout(() => {
      if (!authResolvedRef.current && isMounted) {
        console.warn('LoadingScreen: Timeout reached, going to Login');
        navigate('Login', unsubscribe);
      }
    }, 5000);

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
      {!videoError ? (
        <Video
          style={loading.video}
          source={require('../../../assets/videos/cisc_logo_animated (4).mp4')}
          repeat={true}
          resizeMode="cover"
          muted={true}
          onError={(e) => {
            console.warn('LoadingScreen: Video error, using fallback', e);
            setVideoError(true);
          }}
        />
      ) : (
        <Image
          style={loading.video}
          source={require('../../../assets/images/cisckids copy.png')}
          resizeMode="contain"
        />
      )}

      <View style={loading.progressContainer}>
        <View style={loading.progressBarBackground}>
          <View
            style={[loading.progressBarFill, { width: `${Math.min(progress, 100)}%` }]}
          />
        </View>
        <Text style={loading.progressText}>{Math.round(Math.min(progress, 100))}%</Text>
        <Text style={loading.statusText}>{statusMessage}</Text>
        <ActivityIndicator
          size="small"
          color="#3498db"
          style={loading.loadingSpinner}
        />
      </View>
    </View>
  );
}

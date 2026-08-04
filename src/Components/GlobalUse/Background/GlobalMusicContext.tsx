import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Sound from 'react-native-sound';
import { AppState, AppStateStatus } from 'react-native';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

Sound.setCategory('Ambient', true);

interface GlobalMusicContextType {
  isPlaying: boolean;
  playMusic: () => void;
  pauseMusic: () => void;
  stopMusic: () => void;
}

const GlobalMusicContext = createContext<GlobalMusicContextType>({
  isPlaying: false,
  playMusic: () => {},
  pauseMusic: () => {},
  stopMusic: () => {},
});

export const useGlobalMusic = () => useContext(GlobalMusicContext);

export const GlobalMusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const bgMusicRef = useRef<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(isPlaying);

  // Keep ref updated with current isPlaying value
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize sound once
  useEffect(() => {
    const sound = new Sound('student_bg_music.wav', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.warn('Failed to load global background music', error);
        return;
      }
      sound.setNumberOfLoops(-1); // Loop indefinitely
      sound.setVolume(0.15);
      bgMusicRef.current = sound;
    });

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.stop();
        bgMusicRef.current.release();
        bgMusicRef.current = null;
      }
    };
  }, []);

  const stopMusic = useCallback(() => {
    setIsPlaying(prev => {
      if (bgMusicRef.current) {
        bgMusicRef.current.stop();
        return false;
      }
      return prev;
    });
  }, []);

  // Listen to auth state changes – stop music on logout
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && isPlayingRef.current) {
        stopMusic(); // Stop immediately when user logs out
      }
    });
    return unsubscribe;
  }, [stopMusic]); // stopMusic is stable (useCallback), so this runs only once

  // Listen to AppState to automatically pause when backgrounded
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        // App goes to background -> manually pause audio node (if it was supposed to be playing)
        if (isPlayingRef.current && bgMusicRef.current) {
          bgMusicRef.current.pause();
        }
      } else if (nextAppState === 'active') {
        // App comes back -> resume if it was supposed to be playing
        if (isPlayingRef.current && bgMusicRef.current) {
          bgMusicRef.current.play();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const playMusic = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev && bgMusicRef.current) { 
        bgMusicRef.current.play();
        return true;
      }
      return prev;
    });
  }, []);

  const pauseMusic = useCallback(() => {
    setIsPlaying(prev => {
      if (prev && bgMusicRef.current) {
        bgMusicRef.current.pause();
        return false;
      }
      return prev;
    });
  }, []);

  const contextValue = useMemo(() => ({
    isPlaying,
    playMusic,
    pauseMusic,
    stopMusic
  }), [isPlaying, playMusic, pauseMusic, stopMusic]);

  return (
    <GlobalMusicContext.Provider value={contextValue}>
      {children}
    </GlobalMusicContext.Provider>
  );
};
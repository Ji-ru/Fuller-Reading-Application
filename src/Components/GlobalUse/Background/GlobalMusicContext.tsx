import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Sound from 'react-native-sound';

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

  useEffect(() => {
    // Initialize the sound instance once
    const sound = new Sound('student_bg_music.wav', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.warn('Failed to load global background music', error);
        return;
      }
      sound.setNumberOfLoops(-1); // Loop indefinitely
      sound.setVolume(0.15); // Adjust volume as needed
      bgMusicRef.current = sound;
    });

    return () => {
      // Cleanup on unmount
      if (bgMusicRef.current) {
        bgMusicRef.current.stop();
        bgMusicRef.current.release();
        bgMusicRef.current = null;
      }
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

  const stopMusic = useCallback(() => {
    setIsPlaying(prev => {
      if (bgMusicRef.current) {
        bgMusicRef.current.stop();
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

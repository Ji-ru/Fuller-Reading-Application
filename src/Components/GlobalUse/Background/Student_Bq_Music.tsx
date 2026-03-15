import React, { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalMusic } from './GlobalMusicContext';
// ========================================================================
// BACKGROUND MUSIC HOC (Higher-Order Component)
// ========================================================================
// Wrap any screen with this function to inject the background music useEffect.
// Now relies on GlobalMusicContext so music continues gracefully between screens.
export const withBackgroundMusic = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  return function ScreenWithBackgroundMusic(props: P) {
    const { playMusic, pauseMusic } = useGlobalMusic();

    useFocusEffect(
      React.useCallback(() => {
        // Play music when the screen is focused
        playMusic();

        return () => {
          // You could optionally pause the music here when screen loses focus,
          // but since most transitions go to another student screen, leaving 
          // it alone keeps it playing smoothly between pages!
        };
      }, [playMusic])
    );

    return <WrappedComponent {...props} />;
  };
};
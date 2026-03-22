import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalMusic } from './GlobalMusicContext';
import { getAuth } from '@react-native-firebase/auth';

export const withBackgroundMusic = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  return function ScreenWithBackgroundMusic(props: P) {
    const { playMusic } = useGlobalMusic();

    useFocusEffect(
      React.useCallback(() => {
        const auth = getAuth();
        // Play music only when the screen is focused and the user is logged in
        if (auth.currentUser) {
          playMusic();
        }

        // No cleanup needed – music will continue across screens,
        // and logout is handled by the provider
        return () => {};
      }, [playMusic])
    );

    return <WrappedComponent {...props} />;
  };
};
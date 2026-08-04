import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound';
import readingStyles from '../../../UI_Designs/ReadingActivityStyles';

Sound.setCategory('Ambient', true);

interface StarRatingDisplayProps {
  accuracy: number;
  visible: boolean;
}

const getStarCountFromAccuracy = (accuracy: number): number => {
  if (accuracy >= 90) return 3;
  if (accuracy >= 75) return 2;
  if (accuracy >= 50) return 1;
  return 0;
};

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  accuracy,
  visible,
}) => {
  const starCount = useMemo(() => getStarCountFromAccuracy(accuracy), [accuracy]);

  const star1Scale = useRef(new Animated.Value(0)).current;
  const star2Scale = useRef(new Animated.Value(0)).current;
  const star3Scale = useRef(new Animated.Value(0)).current;

  const confettiRef = useRef<LottieView>(null);

  const celebrationRef = useRef<Sound | null>(null);
  const crowdRef = useRef<Sound | null>(null);
  const sadRef = useRef<Sound | null>(null);

  useEffect(() => {
    celebrationRef.current = new Sound(
      'celebration.wav',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.warn('celebration sound load error', error);
        }
      },
    );

    crowdRef.current = new Sound(
      'kid_crowd_yay.wav',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.warn('crowd sound load error', error);
        }
      },
    );

    // sadRef.current = new Sound(
    //   require('../../../../assets/sfx/sad.wav'),
    //   error => {
    //     if (error) console.warn('sad sound load error', error);
    //   },
    // );

    return () => {
      celebrationRef.current?.release();
      crowdRef.current?.release();
      // sadRef.current?.release();

      celebrationRef.current = null;
      crowdRef.current = null;
      // sadRef.current = null;
    };
  }, []);

  const stopAllSounds = () => {
    celebrationRef.current?.stop();
    crowdRef.current?.stop();
    sadRef.current?.stop();
  };

  const playFeedbackSounds = () => {
    stopAllSounds();

    if (starCount > 0) {
      celebrationRef.current?.stop(() => {
        celebrationRef.current?.stop();
        celebrationRef.current?.setCurrentTime(0);   // rewind to start
        celebrationRef.current?.setNumberOfLoops(0);
        celebrationRef.current?.setVolume(1.0);
        celebrationRef.current?.play();
      });

        setTimeout(() => {
          crowdRef.current?.stop();
          crowdRef.current?.setCurrentTime(0);
          crowdRef.current?.setNumberOfLoops(0);
          crowdRef.current?.setVolume(0.85);
          crowdRef.current?.play();
        }, 120);
    } else {
      sadRef.current?.stop();
      sadRef.current?.setCurrentTime(0);
      sadRef.current?.setNumberOfLoops(0);
      sadRef.current?.setVolume(1.0);
      sadRef.current?.play();
    }
  };

  useEffect(() => {
    const stars = [star1Scale, star2Scale, star3Scale];

    stars.forEach(anim => anim.setValue(0));
    confettiRef.current?.reset();

    if (!visible) return;

    playFeedbackSounds();

    if (starCount > 0) {
      confettiRef.current?.play();
    }

    if (starCount === 0) return;

    const animations = stars.slice(0, starCount).map(anim =>
      Animated.sequence([
        Animated.delay(180),
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
          tension: 120,
        }),
      ]),
    );

    Animated.stagger(220, animations).start();

    return () => {
      stopAllSounds();
      confettiRef.current?.reset();
    };
  }, [visible, starCount, star1Scale, star2Scale, star3Scale]);

  return (
    <View style={readingStyles.starSection}>
      {starCount > 0 && (
        <LottieView
          ref={confettiRef}
          source={require('../../../../assets/gifs&animations/Confetti.json')}
          autoPlay={false}
          loop={false}
          style={readingStyles.starConfetti}
          resizeMode="cover"
        />
      )}

      <View style={readingStyles.starRow}>
        {[star1Scale, star2Scale, star3Scale].map((scaleAnim, index) => {
          const isEarned = index < starCount;
          const isMiddleStar = index === 1;

          return (
            <Animated.View
              key={`star-${index}`}
              style={[
                readingStyles.starWrapper,
                {
                  transform: [
                    { scale: isEarned ? scaleAnim : 0.85 },
                    { translateY: isMiddleStar ? -30 : 0 },
                  ],
                  opacity: isEarned ? scaleAnim : 0.35,
                },
              ]}
            >
              <Image
                source={require('../../../../assets/icons/Star-icon.png')}
                style={readingStyles.starIcon}
                resizeMode="contain"
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};
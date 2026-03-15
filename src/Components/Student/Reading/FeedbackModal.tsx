import React, { useRef, useEffect } from 'react';
import { Modal, View, Text } from 'react-native';
import feedbackModal from '../../../UI_Designs/FeedbackModalStyle';
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Ambient', true);

interface FeedbackModalProps {
  visible: boolean;
  type: 'congratulations' | 'tryAgain' | 'passageSuccess' | 'goodJob';
  onClose: () => void;
  onTryAgain?: () => void;
  message?: string;
  autoClose?: boolean;
}

const isSuccessType = (type: FeedbackModalProps['type']) =>
  type === 'congratulations' || type === 'passageSuccess' || type === 'goodJob';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  type,
  onClose,
  onTryAgain,
  autoClose = true,
}) => {
  const congratulationsRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);
  const tryAgainRef = useRef<LottieView>(null);
  const autoCloseTimeoutRef = useRef<number | null>(null);

  // --- Sounds (keep instances alive to avoid re-loading) ---
  const sadRef = useRef<Sound | null>(null);
  const celebrationRef = useRef<Sound | null>(null);
  const crowdRef = useRef<Sound | null>(null);

  // useEffect(() => {
  //   // Preload once on mount
  //   celebrationRef.current = new Sound(
  //     require('../../../../assets/sfx/celebration.wav'),
  //     undefined,
  //     (e) => e && console.warn('celebration sound load error', e),
  //   );

  //   crowdRef.current = new Sound(
  //     require('../../../../assets/sfx/kid_crowd_yay.wav'),
  //     undefined,
  //     (e) => e && console.warn('crowd sound load error', e),
  //   );

  //   return () => {
  //     // Cleanup on unmount
  //     sadRef.current?.release();
  //     celebrationRef.current?.release();
  //     crowdRef.current?.release();
  //     sadRef.current = null;
  //     celebrationRef.current = null;
  //     crowdRef.current = null;
  //   };
  // }, []);

  const stopAllSounds = () => {
    sadRef.current?.stop();
    celebrationRef.current?.stop();
    crowdRef.current?.stop();
  };

  const playSoundsForType = (t: FeedbackModalProps['type']) => {
    // stop anything currently playing (previous modal)
    stopAllSounds();
  
    if (t === 'tryAgain') {
      const sad = sadRef.current;
      if (!sad) return;
      sad.setNumberOfLoops(0);
      sad.setVolume(1.0);
      sad.play();
      return;
    }
  
    // For "good job" / "excellent" / "congratulations" style: overlap two sounds
    if (t === 'congratulations' || t === 'passageSuccess' || t === 'goodJob') {
      const celebration = celebrationRef.current;
      const crowd = crowdRef.current;
  
      if (celebration) {
        celebration.stop(() => {
          celebration.setNumberOfLoops(0);
          celebration.setVolume(1.0);
          celebration.play();
        });
      }
  
      // Optional: small delay makes it feel like a layered “cheer follows celebration”
      if (crowd) {
        crowd.stop(() => {
          crowd.setNumberOfLoops(0);
          crowd.setVolume(0.85);
          setTimeout(() => {
            crowd.play();
          }, 120);
        });
      }
    }
  };

  useEffect(() => {
    if (visible) {
      // Play animation
      if (isSuccessType(type)) {
        confettiRef.current?.play();
        congratulationsRef.current?.play();
      } else if (type === 'tryAgain') {
        tryAgainRef.current?.play();
      }

      // Play sounds
      playSoundsForType(type);

      // Auto-close
      if (autoClose) {
        autoCloseTimeoutRef.current = setTimeout(() => {
          resetAnimations();
          stopAllSounds();
          onClose();
        }, 3000);
      }
    } else {
      // Reset and stop when closing
      resetAnimations();
      stopAllSounds();

      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    }

    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    };
  }, [visible, type, autoClose, onClose]);

  const resetAnimations = () => {
    confettiRef.current?.reset();
    congratulationsRef.current?.reset();
    tryAgainRef.current?.reset();
  };

  const getModalContent = () => {
    switch (type) {
      case 'congratulations':
        return {
          title: 'Congratulations!',
          message: 'You got the alphabet correct! Great job! 🎉',
        };
      case 'passageSuccess':
        return {
          title: 'Excellent Reading!',
          message: 'You read with 90%+ accuracy! Amazing work! 🎉',
        };
      case 'goodJob':
        return {
          title: "Good Job!",
          message: 'Keep it up. You can do it better!',
        };
      default:
      case 'tryAgain':
        return {
          title: "Let's Try Again!",
          message: 'Practice makes perfect! Give it another try.',
        };
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={feedbackModal.overlay}>
        <View style={feedbackModal.modalContainer}>
          {/* Confetti animation for success */}
          {(type === 'congratulations' || type === 'passageSuccess' || type === 'goodJob') && (
            <LottieView
              ref={confettiRef}
              source={require('../../../../assets/gifs&animations/Confetti.json')}
              autoPlay={false}
              loop={false}
              style={feedbackModal.confettiAnimation}
              resizeMode="cover"
            />
          )}

          {/* Success Reading Animation */}
          {(type === 'congratulations') && (
            <LottieView
              ref={congratulationsRef}
              source={require('../../../../assets/gifs&animations/Star_Success.json')}
              autoPlay={false}
              loop={false}
              style={feedbackModal.excellentAnimation}
              resizeMode="contain"
            />
          )}

          {/* Success Reading Animation */}
          {(type === 'passageSuccess') && (
            <LottieView
              ref={congratulationsRef}
              source={require('../../../../assets/gifs&animations/Star_Success.json')}
              autoPlay={false}
              loop={false}
              style={feedbackModal.excellentAnimation}
              resizeMode="contain"
            />
          )}

          {/* Good Job */}
          {(type === 'goodJob') && (
            <LottieView
              ref={congratulationsRef}
              source={require('../../../../assets/gifs&animations/Medal.json')}
              autoPlay={false}
              loop={false}
              style={feedbackModal.goodJobAnimation}
              resizeMode="contain"
            />
          )}

          {/* Try Again animation */}
          {type === 'tryAgain' && (
            <LottieView
              ref={tryAgainRef}
              source={require('../../../../assets/gifs&animations/Failed.json')}
              autoPlay={false}
              loop={false}
              style={feedbackModal.tryAgainAnimation}
              resizeMode="contain"
            />
          )}

          <Text style={feedbackModal.title}>{getModalContent().title}</Text>
          <Text style={feedbackModal.message}>{getModalContent().message}</Text>
        </View>
      </View>
    </Modal>
  );
};
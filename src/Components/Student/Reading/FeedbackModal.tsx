import React, { useRef, useEffect } from 'react';
import { Modal, View, Text } from 'react-native';
import feedbackModal from '../../../UI_Designs/FeedbackModalStyle';
import LottieView from 'lottie-react-native';

interface FeedbackModalProps {
  visible: boolean;
  type: 'congratulations' | 'tryAgain' | 'passageSuccess' | 'goodJob';
  onClose: () => void;
  onTryAgain?: () => void;
  message?: string;
  autoClose?: boolean;
}

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

  useEffect(() => {
    if (visible) {
      // Play appropriate animation based on type
      if (
        type === 'congratulations' ||
        type === 'passageSuccess' ||
        type === 'goodJob'
      ) {
        if (confettiRef.current) {
          confettiRef.current.play();
        }
        if (congratulationsRef.current) {
          congratulationsRef.current.play();
        }
      } else if (type === 'tryAgain' && tryAgainRef.current) {
        tryAgainRef.current.play();
      }

      // Set up auto-close if enabled
      if (autoClose) {
        // Using the same pattern as SignUpTwoScreen
        autoCloseTimeoutRef.current = setTimeout(() => {
          resetAnimations();
          onClose();
        }, 3000);
      }
    } else {
      // Reset animations when modal closes
      resetAnimations();
      // Clear any existing timeout
      if (autoCloseTimeoutRef.current !== null) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (autoCloseTimeoutRef.current !== null) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      resetAnimations();
    };
  }, [visible, type, autoClose, onClose]);

  const resetAnimations = () => {
    if (confettiRef.current) {
      confettiRef.current.reset();
    }
    if (congratulationsRef.current) {
      congratulationsRef.current.reset();
    }
    if (tryAgainRef.current) {
      tryAgainRef.current.reset();
    }
  };

  const getModalContent = () => {
    switch (type) {
      case 'congratulations':
        return {
          title: 'Napakahusay!',
          message: 'Tumpak ang iyong pagbasa! 🎉',
        };
      case 'passageSuccess':
        return {
          title: 'Magaling!',
          message: 'Maayos ang pagkabasa! Higit sa 90% ang pagkatumpak!🎉',
        };
        case 'goodJob':
          return {
            title: "Panalo!",
            message: 'Ipagpatuloy mo lang! Gagaling ka pa!',
          };
        default:
      case 'tryAgain':
        return {
          title: "Subukan ulit.",
          message: 'Sanayan lang yan. Isa pa!',
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

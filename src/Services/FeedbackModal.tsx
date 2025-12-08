import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface FeedbackModalProps {
  visible: boolean;
  type: 'congratulations' | 'tryAgain' | 'passageSuccess';
  onClose: () => void;
  onTryAgain?: () => void;
  message?: string;
  autoClose?: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  type,
  onClose,
  onTryAgain,
  message,
  autoClose = true,
}) => {
  const congratulationsRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);
  const tryAgainRef = useRef<LottieView>(null);
  const autoCloseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      // Play appropriate animation based on type
      if (type === 'congratulations' || type === 'passageSuccess') {
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
        }, 3500); 
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
          title: 'Congratulations!',
          message: 'You got the alphabet correct! Great job! 🎉',
        };
      case 'passageSuccess':
        return {
          title: 'Excellent Reading!',
          message: message || 'You read with 90%+ accuracy! Amazing work! 🎉',
        };
      case 'tryAgain':
        return {
          title: 'Let\'s Try Again!',
          message: message || 'Practice makes perfect! Give it another try. 💪',
        };
      default:
        return {
          title: '',
          message: '',
        };
    }
  };

  const content = getModalContent();

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Confetti animation for success */}
          {(type === 'congratulations' || type === 'passageSuccess') && (
            <LottieView
              ref={confettiRef}
              source={require('../../assets/gifs&animations/Confetti.json')}
              autoPlay={false}
              loop={false}
              style={styles.confettiAnimation}
              resizeMode="cover"
            />
          )}

          {/* Congratulations animation */}
          {(type === 'congratulations' || type === 'passageSuccess') && (
            <LottieView
              ref={congratulationsRef}
              source={require('../../assets/gifs&animations/Medal.json')}
              autoPlay={false}
              loop={false}
              style={styles.congratulationsAnimation}
              resizeMode="contain"
            />
          )}

          {/* Try Again animation */}
          {type === 'tryAgain' && (
            <LottieView
              ref={tryAgainRef}
              source={require('../../assets/gifs&animations/Failed.json')}
              autoPlay={false}
              loop={false}
              style={styles.tryAgainAnimation}
              resizeMode="contain"
            />
          )}

          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding:5,
    alignItems: 'center',
    width: '90%',
    maxWidth: 300,
    minHeight: 300,
    elevation: 5,
  },
  confettiAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  congratulationsAnimation: {
    width: 160,
    height: 160,
    marginTop: 10,
  },
  tryAgainAnimation: {
    width: 160,
    height: 160,
    marginTop: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
    lineHeight: 22,
  },
  autoCloseText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default FeedbackModal;